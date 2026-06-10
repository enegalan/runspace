# Changelog

## [Unreleased]

### Phase 4: Multi-runtime and framework sandbox

- `RuntimeAdapter` pattern with Node, PHP, Python, Ruby, Laravel, and Symfony adapters
- Environment catalog extended with PHP, Python, Ruby, Laravel, and Symfony
- `execute_code` uses adapters for entry files, PHP normalization, and framework bootstrap wrappers
- Internal framework skeletons at `~/.runspace/frameworks/` with optional Composer provisioning
- Monaco language and default templates switch when changing environment
- `RuntimeChangeDialog` confirms before replacing custom code on environment switch
- Tauri command `get_runtime_template` for backend template lookup

### Phase 3: Environment Manager

- Installable environments: only added runtimes appear in the selector and settings
- Auto-detection of binary paths on startup for installed environments missing configuration
- Environment catalog with Node.js only (more runtimes added in later phases)
- Per-environment configuration: binary paths and env vars
- `EnvironmentManager` with load/save to `~/.runspace/environments.json`
- On-demand path validation and version probe via Test action
- `execute_code` refactored to accept `environment_id` with resolved paths and env vars (Node.js end-to-end)
- Settings panel (gear icon) with expandable environment cards, Browse, Save, Test, and env vars editor
- Toolbar environment selector grouped by category with configured/not configured badges
- Run blocked with tooltip when selected environment is not configured

### Phase 2: Monaco Editor and output panel

- Monaco Editor with lazy loading, `vs-dark` theme, and keyboard shortcuts (`Cmd+Enter`, `Cmd+S`)
- Zustand stores for editor and execution state
- Output panel with Output/Errors tabs, status badges, auto-scroll, and Clear action
- Toolbar with Run, Stop, and Clear controls
- Snippet persistence to `~/.runspace/last-snippet.json` via Tauri commands
- Enriched StatusBar with runtime and last-run duration

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
