# Changelog

## [Unreleased]

### Phase 1: Node.js execution

- WorkspaceManager sandbox at `~/.runspace/workspaces/{uuid}/`
- SecurityLayer with sanitized env vars and path validation
- ExecutionEngine with stdout/stderr streaming, timeout, and kill
- Tauri commands `execute_code` and `kill_process`
- Minimal UI: code textarea, Run/Stop buttons, streaming output panel

## [0.0.1] - 2026-06-09

### Phase 0: project shell

- Tauri 2 + React + TypeScript + Vite scaffold
- Desktop UI shell with Toolbar, Sidebar, EditorArea, OutputPanel, and StatusBar
- ESLint, Prettier, and Vitest tooling
- GitHub Actions CI (lint, test, macOS build)
