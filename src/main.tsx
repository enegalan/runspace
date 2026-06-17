import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { suppressNativeContextMenu } from "./core/platform/suppressNativeContextMenu";
import "./styles/globals.css";

suppressNativeContextMenu();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
