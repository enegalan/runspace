import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { waitForBackendReady } from "./core/api/fetchBackend";
import { suppressNativeContextMenu } from "./core/platform/suppressNativeContextMenu";
import { useSettingsStore } from "./stores/settingsStore";
import "./styles/globals.css";

/**
 * The renderApp function.
 * @returns The rendered app.
 */
function renderApp() {
  suppressNativeContextMenu();
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

/**
 * The renderBootstrapError function.
 * @param error - The error.
 * @returns The rendered bootstrap error.
 */
function renderBootstrapError(error: unknown) {
  console.error("Failed to start Runspace:", error);
  void useSettingsStore.getState().load().finally(renderApp);
}

/**
 * Waits for the backend to be ready and then renders the app.
 * If the backend is not ready, it renders the bootstrap error.
 * @returns The main function.
 */
void waitForBackendReady()
  .then(() => useSettingsStore.getState().load())
  .then(renderApp)
  .catch(renderBootstrapError);
