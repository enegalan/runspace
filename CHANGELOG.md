# Changelog

## [0.1.0] - 2026-06-11

### Added

- Desktop app with Monaco editor
- Runtimes: Node.js, PHP, Python, Ruby, C, C++
- Runtime detection and configuration
- Workspace file management
- Onboarding welcome flow
- Workspace sandbox (isolated cwd, sanitized env)
- Design system with Inter and JetBrains Mono typography
- Shared UI primitives (Button, Input, Kbd)
- About dialog and keyboard shortcuts reference
- macOS application menu (File, Edit, Run, View, Help)
- Global shortcuts: sidebar/output toggle, new workspace, settings
- GitHub release workflow for tagged builds

### Changed

- Full UI redesign with modern dark-first design language
- App shell: unified toolbar, pill tabs, elevated status bar
- File tree uses SVG icons instead of emoji
- Settings panel with slide-over navigation
- macOS title bar overlay integration

## [Unreleased]

### General Settings

- General tab in Settings with sidebar navigation and card-based sections
- Persistent app preferences in `~/.runspace/settings.json` via Rust `SettingsManager` and `read_settings` / `update_settings` commands
- **Appearance:** dark, light, and system theme; comfortable/compact UI density; editor font size and family
- **Editor:** tab size, word wrap, minimap, scroll beyond last line, and insert spaces wired to Monaco
- **Execution:** configurable run and compile timeouts; auto-clear output on run; auto-scroll output
- **Layout:** sidebar/output width and visibility; restore last workspace on launch; confirm before closing unsaved tabs
- Keyboard shortcuts reference embedded in General settings
- Light theme token palette and `color-scheme` for native form controls in dark/light mode

### Phase 6: C/C++ (compiled languages)

- `GccAdapter` and `GppAdapter` with compile-then-run pipeline
- `CompiledAdapter` trait with separate compile (15s) and run (30s) timeouts
- `execution-phase` event (`compile` | `run`) for StatusBar and output panel
- Compile stderr prefixed `[compile]`; runtime stderr prefixed `[runtime]`
- Binary output hardcoded to `runspace_out`; forbidden compiler flags not exposed
- Artifact cleanup after every run (`runspace_out`, `.dSYM`, and related files)
- GCC (C) and G++ (C++) added to environment catalog with PATH auto-detection
- Monaco `c` and `cpp` modes and default templates for gcc/gpp environments

### Onboarding

- Welcome screen on first launch when no projects exist (intro, concepts, and first-project setup)
- Setup step: project name, primary runtime with path configuration, and optional additional environments
- Completion stored in session (`onboarding_complete`) and localStorage; returning users skip welcome and use the main shell

### Phase 5: Workspace file management

- Extended `WorkspaceManager` with workspace listing, manifest (`runspace.json`), file CRUD, and session persistence
- Tauri workspace commands: `list_workspaces`, `open_workspace`, `create_workspace`, `list_files`, `read_file`, `write_file`, `delete_file`, `rename_file`, `rename_workspace`, `delete_workspace`, `initialize_workspace`
- Multiple projects per environment; workspace switcher with right-click rename and delete
- File tree sidebar with expand/collapse, context menus, create file/folder, rename, delete, and refresh
- Editor tabs in the toolbar with dirty indicator, close confirmation, and `Cmd+S` save
- Drag-and-drop tab reordering in the tab strip (Chrome-style live preview; order persisted per workspace in session)
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
- Import files and folders by dragging them from the computer into the active workspace
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
- Settings panel (gear icon) with General and Environments tabs; expandable environment cards, Browse, Save, Test, and env vars editor
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
