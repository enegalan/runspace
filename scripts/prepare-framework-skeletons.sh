#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
ASPNET_CORE_SRC="$GEN/aspnet-core"
POEM_SRC="$GEN/poem"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
ASPNET_CORE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/aspnet-core"
POEM_DEST="$REPO_ROOT/src-tauri/resources/frameworks/poem"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
ASPNET_CORE_PROJECT="${RUNSPACE_ASPNET_CORE_PROJECT:-RunspaceAspNetSandbox}"
ASPNET_CORE_SCRIPTING_PACKAGE="${RUNSPACE_ASPNET_CORE_SCRIPTING_PACKAGE:-Microsoft.CodeAnalysis.CSharp.Scripting}"
POEM_VERSION="${RUNSPACE_POEM_VERSION:-3.1.12}"

laravel_ready() {
    [[ -f "$LARAVEL_DEST/artisan" ]] &&
        [[ -f "$LARAVEL_DEST/composer.lock" ]] &&
        [[ -f "$LARAVEL_DEST/skeleton.version" ]]
}

symfony_ready() {
    [[ -f "$SYMFONY_DEST/bin/console" ]] &&
        [[ -f "$SYMFONY_DEST/composer.lock" ]] &&
        [[ -f "$SYMFONY_DEST/skeleton.version" ]]
}

express_ready() {
    [[ -f "$EXPRESS_DEST/package.json" ]] &&
        [[ -f "$EXPRESS_DEST/package-lock.json" ]] &&
        [[ -f "$EXPRESS_DEST/skeleton.version" ]]
}

aspnet_core_ready() {
    [[ -f "$ASPNET_CORE_DEST/RunspaceAspNetSandbox.csproj" ]] &&
        [[ -f "$ASPNET_CORE_DEST/RunspaceEntryHost.cs" ]] &&
        [[ -f "$ASPNET_CORE_DEST/skeleton.version" ]]
}

poem_ready() {
    [[ -f "$POEM_DEST/Cargo.toml" ]] &&
        [[ -f "$POEM_DEST/Cargo.lock" ]] &&
        [[ -f "$POEM_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_aspnet_core=false
needs_poem=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! aspnet_core_ready; then
    needs_aspnet_core=true
fi
if force_sync || ! poem_ready; then
    needs_poem=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_aspnet_core && ! $needs_poem; then
    echo "Framework skeletons already present; skipping generation."
    exit 0
fi

if ($needs_laravel || $needs_symfony) && ! command -v composer >/dev/null 2>&1; then
    echo "Composer is required to prepare Laravel/Symfony skeletons." >&2
    echo "Install Composer or set its path in Settings, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_express && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Express skeleton." >&2
    exit 1
fi

if $needs_aspnet_core && ! command -v dotnet >/dev/null 2>&1; then
    echo "The .NET SDK is required to prepare the ASP.NET Core skeleton." >&2
    exit 1
fi

if $needs_poem && ! command -v cargo >/dev/null 2>&1; then
    echo "Cargo is required to prepare the Poem skeleton." >&2
    exit 1
fi

mkdir -p "$GEN"

if $needs_laravel && [[ ! -d "$LARAVEL_SRC/vendor" ]]; then
    echo "Generating Laravel skeleton..."
    rm -rf "$LARAVEL_SRC"
    composer create-project "$LARAVEL_PROJECT" "$LARAVEL_SRC" "$LARAVEL_VERSION" --no-interaction
fi

if $needs_symfony && [[ ! -d "$SYMFONY_SRC/vendor" ]]; then
    echo "Generating Symfony skeleton..."
    rm -rf "$SYMFONY_SRC"
    composer create-project "$SYMFONY_PROJECT" "$SYMFONY_SRC" "$SYMFONY_VERSION" --no-interaction
    (cd "$SYMFONY_SRC" && composer require webapp --no-interaction)
fi

if $needs_express && [[ ! -d "$EXPRESS_SRC/node_modules" ]]; then
    echo "Generating Express skeleton..."
    rm -rf "$EXPRESS_SRC"
    mkdir -p "$EXPRESS_SRC"
    (
        cd "$EXPRESS_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/express-sandbox"
        npm pkg set description="Internal Express sandbox for Runspace"
        npm pkg set private=true
        npm install "express@${EXPRESS_VERSION}" --save
    )
fi

if $needs_aspnet_core && [[ ! -f "$ASPNET_CORE_SRC/RunspaceAspNetSandbox.csproj" ]]; then
    echo "Generating ASP.NET Core skeleton..."
    rm -rf "$ASPNET_CORE_SRC"
    dotnet new web -n "$ASPNET_CORE_PROJECT" -o "$ASPNET_CORE_SRC" --force
    (
        cd "$ASPNET_CORE_SRC"
        dotnet add package "$ASPNET_CORE_SCRIPTING_PACKAGE" --no-restore
        dotnet restore
    )
fi

if $needs_poem && [[ ! -f "$POEM_SRC/Cargo.lock" ]]; then
    echo "Generating Poem skeleton..."
    rm -rf "$POEM_SRC"
    cargo new "$POEM_SRC" --name runspace_poem_sandbox --bin
    cat > "$POEM_SRC/Cargo.toml" <<EOF
[package]
name = "runspace-poem-sandbox"
version = "0.1.0"
edition = "2021"
build = "build.rs"
publish = false

[[bin]]
name = "runspace_entry"
path = "src/main.rs"

[dependencies]
poem = "${POEM_VERSION}"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
EOF
    cat > "$POEM_SRC/build.rs" <<'EOF'
fn main() {
    println!("cargo:rerun-if-env-changed=RUNSPACE_ENTRY_PATH");
    let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| {
        std::path::PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("stub_entry.rs")
            .to_string_lossy()
            .to_string()
    });
    println!("cargo:rustc-env=RUNSPACE_ENTRY={entry}");
}
EOF
    cat > "$POEM_SRC/src/stub_entry.rs" <<'EOF'
use poem::{get, handler, listener::TcpListener, Route, Server};

#[handler]
fn index() -> &'static str {
    "Runspace Poem sandbox"
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let app = Route::new().at("/", get(index));
    Server::new(TcpListener::bind("127.0.0.1:3000"))
        .run(app)
        .await
}
EOF
    cat > "$POEM_SRC/src/main.rs" <<'EOF'
include!(env!("RUNSPACE_ENTRY"));
EOF
    (cd "$POEM_SRC" && cargo build --quiet)
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
