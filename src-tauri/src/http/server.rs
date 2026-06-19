use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use axum::extract::State;
use axum::http::{HeaderValue, Method, StatusCode};
use axum::response::sse::{Event, KeepAlive, Sse};
use axum::routing::{get, post};
use axum::{Json, Router};
use futures_util::stream::Stream;
use serde::Deserialize;
use serde_json::Value;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
use tower_http::cors::{Any, CorsLayer};

use tauri::AppHandle;

use crate::engine::ExecutionEvent;
use crate::services::dialog::pick_path;
use crate::services::invoke::dispatch_invoke;
use crate::state::SharedState;
use crate::terminal::TerminalEvent;

pub type TauriHandleSlot = Arc<Mutex<Option<AppHandle>>>;

#[derive(Clone)]
struct HttpState {
    app: SharedState,
    tauri: TauriHandleSlot,
}

#[derive(Debug, Deserialize)]
struct BrowseRequest {
    #[serde(default)]
    directory: bool,
}

#[derive(serde::Serialize)]
struct BrowseResponse {
    path: Option<String>,
}

#[derive(Debug, Deserialize)]
struct InvokeRequest {
    cmd: String,
    #[serde(default)]
    args: Value,
}

#[derive(serde::Serialize)]
struct InvokeResponse {
    result: Value,
}

#[derive(serde::Serialize)]
struct ErrorResponse {
    error: String,
}

pub fn start_dev_server(state: SharedState, tauri: TauriHandleSlot) {
    std::thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .enable_all()
            .build()
            .expect("failed to build tokio runtime for HTTP API");

        runtime.block_on(async {
            if let Err(error) = run_server(state, tauri).await {
                eprintln!("Runspace HTTP API stopped: {error}");
            }
        });
    });
}

async fn run_server(
    state: SharedState,
    tauri: TauriHandleSlot,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let http_state = HttpState { app: state, tauri };

    let cors = CorsLayer::new()
        .allow_origin([
            HeaderValue::from_static("http://localhost:1420"),
            HeaderValue::from_static("http://127.0.0.1:1420"),
        ])
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health_handler))
        .route("/api/invoke", post(invoke_handler))
        .route("/api/browse", post(browse_handler))
        .route("/api/execution/events", get(execution_events_handler))
        .route("/api/terminal/events", get(terminal_events_handler))
        .layer(cors)
        .with_state(http_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], super::DEV_API_PORT));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    eprintln!("Runspace HTTP API listening on http://{addr}");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health_handler() -> StatusCode {
    StatusCode::OK
}

async fn invoke_handler(
    State(state): State<HttpState>,
    Json(body): Json<InvokeRequest>,
) -> Result<Json<InvokeResponse>, (StatusCode, Json<ErrorResponse>)> {
    match dispatch_invoke(&state.app, None, &body.cmd, body.args).await {
        Ok(result) => Ok(Json(InvokeResponse { result })),
        Err(error) => Err((StatusCode::BAD_REQUEST, Json(ErrorResponse { error }))),
    }
}

async fn browse_handler(
    State(state): State<HttpState>,
    Json(body): Json<BrowseRequest>,
) -> Result<Json<BrowseResponse>, (StatusCode, Json<ErrorResponse>)> {
    let tauri = state
        .tauri
        .lock()
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "App handle lock poisoned".to_string(),
                }),
            )
        })?
        .clone()
        .ok_or_else(|| {
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(ErrorResponse {
                    error: "Desktop shell not ready yet".to_string(),
                }),
            )
        })?;

    let directory = body.directory;
    let path = tokio::task::spawn_blocking(move || pick_path(&tauri, directory))
        .await
        .map_err(|error| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Browse failed: {error}"),
                }),
            )
        })?;

    Ok(Json(BrowseResponse { path }))
}

fn execution_event_to_sse(event: ExecutionEvent) -> Option<Result<Event, Infallible>> {
    let payload = serde_json::to_string(&event).ok()?;
    Some(Ok(Event::default().data(payload)))
}

async fn execution_events_handler(
    State(state): State<HttpState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    use futures_util::stream;

    let replay = state
        .app
        .execution_events
        .replay_snapshot()
        .into_iter()
        .filter_map(execution_event_to_sse);

    let receiver = state.app.execution_events.subscribe();
    let live =
        BroadcastStream::new(receiver).filter_map(|message| execution_event_to_sse(message.ok()?));

    let stream = stream::iter(replay).chain(live);

    Sse::new(stream).keep_alive(KeepAlive::new().interval(Duration::from_secs(15)))
}

fn terminal_event_to_sse(event: TerminalEvent) -> Option<Result<Event, Infallible>> {
    let payload = serde_json::to_string(&event).ok()?;
    Some(Ok(Event::default().data(payload)))
}

async fn terminal_events_handler(
    State(state): State<HttpState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    use futures_util::stream;

    let replay = state
        .app
        .terminal_events
        .replay_snapshot()
        .into_iter()
        .filter_map(terminal_event_to_sse);

    let receiver = state.app.terminal_events.subscribe();
    let live =
        BroadcastStream::new(receiver).filter_map(|message| terminal_event_to_sse(message.ok()?));

    let stream = stream::iter(replay).chain(live);

    Sse::new(stream).keep_alive(KeepAlive::new().interval(Duration::from_secs(15)))
}
