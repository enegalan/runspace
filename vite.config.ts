import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const appPackage = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage: string;
  bugs: {
    url: string;
  };
  icon: string;
};

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

const API_HOST = "127.0.0.1";
const API_PORT = 1422;

function silentApiProxy(): Plugin {
  return {
    name: "runspace-api-proxy",
    configureServer(server) {
      server.middlewares.use("/api", (clientReq, clientRes) => {
        proxyApiRequest(clientReq, clientRes);
      });
    },
  };
}

function proxyApiRequest(clientReq: IncomingMessage, clientRes: ServerResponse): void {
  const suffix = clientReq.url ?? "/";
  const requestPath = suffix.startsWith("/api") ? suffix : `/api${suffix}`;
  const method = clientReq.method ?? "GET";
  const headers = { ...clientReq.headers, host: `${API_HOST}:${API_PORT}` };

  const proxyReq = http.request(
    {
      hostname: API_HOST,
      port: API_PORT,
      path: requestPath,
      method,
      headers,
    },
    (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(clientRes);
    },
  );

  proxyReq.on("error", () => {
    if (!clientRes.headersSent) {
      clientRes.writeHead(503, { "Content-Type": "application/json" });
      clientRes.end(JSON.stringify({ error: "Backend starting" }));
      return;
    }
    clientRes.end();
  });

  if (method === "GET" || method === "HEAD") {
    proxyReq.end();
    return;
  }

  clientReq.pipe(proxyReq);
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), silentApiProxy()],
  define: {
    __APP_NAME__: JSON.stringify(appPackage.name[0].toUpperCase() + appPackage.name.slice(1)),
    __APP_VERSION__: JSON.stringify(appPackage.version),
    __APP_DESCRIPTION__: JSON.stringify(appPackage.description),
    __APP_AUTHOR__: JSON.stringify(appPackage.author),
    __APP_LICENSE__: JSON.stringify(appPackage.license),
    __APP_HOMEPAGE__: JSON.stringify(appPackage.homepage),
    __APP_BUGS__: JSON.stringify(appPackage.bugs.url),
    __APP_GITHUB_URL__: JSON.stringify(appPackage.homepage),
    __APP_ISSUES_URL__: JSON.stringify(appPackage.bugs.url),
    __APP_ICON_URL__: JSON.stringify(appPackage.icon),
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
