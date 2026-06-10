# Changelog

## [Unreleased]

### Phase 5: Workspace file management

- Extended `WorkspaceManager` with workspace listing, manifest (`runspace.json`), file CRUD, and session persistence
- Tauri workspace commands: `list_workspaces`, `open_workspace`, `create_workspace`, `list_files`, `read_file`, `write_file`, `delete_file`, `rename_file`, `rename_workspace`, `delete_workspace`, `initialize_workspace`
- Multiple projects per environment; workspace switcher with right-click rename and delete
- File tree sidebar with expand/collapse, context menus, create file/folder, rename, delete, and refresh
- Editor tabs in the toolbar with dirty indicator, close confirmation, and `Cmd+S` save
- `execute_code` reads entry file from workspace disk (auto-save before Run)
- Session restored on launch (`~/.runspace/session.json`): last environment, workspace, open tabs, and active file per runtime
- No default file on editor open; empty editor until the user opens or creates a file
- New workspaces start empty (no auto-created `main.*` template file)
- Switching to an environment without projects prompts for the first project name; cancel keeps the current environment
- In-app prompt/confirm dialogs replace `window.prompt` / `window.confirm` (Tauri and web safe)
- New files default to unique `Untitled` names; duplicate paths rejected within a workspace
- Environment indicator in the sidebar with runtime-colored gradient background
- Dev desktop app uses the HTTP invoke API for parity with the web UI; production Tauri uses native invoke with normalized args
- Drag-and-drop in the file tree: move files into folders, move nested files to workspace root via empty sidebar space, and open files by dropping on the editor
- Accidental drops on the same file or parent folder are ignored (no unintended moves)
- Active workspace synced before file operations so each environment shows only its own project files
- New folder prompt starts with an empty name (no default)

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
