# Phase 2 — Monaco Editor and output panel

**Estimated duration:** 5 days  
**Dependencies:** Phase 1 completed (ExecutionEngine + Tauri events)  
**Suggested PR:** `feat/phase-2-monaco-output`

---

## Goal

Replace the minimal UI with a professional editor experience similar to RunJS: Monaco Editor, structured output panel, keyboard shortcuts, and last-snippet persistence. Execution remains Node.js only.

---

## What this phase covers

1. Monaco Editor integration (syntax highlighting, themes, shortcuts)
2. Output panel with tabs, visual states, and streaming
3. Toolbar with Run / Stop / Clear
4. Zustand store for execution and editor state
5. Snippet persistence to disk
6. E2E tests for the main flow

---

## Target layout for this phase

```
+-------------------------------------------------------------+
| [Runspace]  [Node.js v]  [Run]  [Stop]  [Clear]             |
+----------+----------------------------------+---------------+
| Sidebar  | Monaco Editor                    | Output Panel  |
| (empty)  |                                  | [Output|Errors|
|          | console.log("Hello!");           | hello         |
|          |                                  | exit: 0       |
+----------+----------------------------------+---------------+
| Ready  |  Node.js  |  Last run: 120ms                         |
+-------------------------------------------------------------+
```

---

## How to implement

### 1. Monaco Editor

**Dependency:**

```bash
npm install @monaco-editor/react monaco-editor
```

**Location:** `src/components/editor/MonacoWrapper.tsx`

**Configuration:**

| Option | Value |
|--------|-------|
| Language | `javascript` (default); prepare for `typescript` |
| Theme | `vs-dark` |
| Font size | 14 |
| Minimap | disabled in MVP |
| Word wrap | `on` |
| Tab size | 2 |
| Automatic layout | `true` (resize with window) |

**Lazy loading:** load Monaco with `React.lazy` or dynamic import to avoid blocking startup.

**Keyboard shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Cmd+Enter` (macOS) / `Ctrl+Enter` | Execute code |
| `Cmd+S` | Save snippet to disk (persistence) |

Implement with `editor.addAction()` in Monaco `onMount`.

**Component:**

```typescript
interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onRun: () => void;
}
```

### 2. Zustand store

**Location:** `src/stores/editorStore.ts`, `src/stores/executionStore.ts`

**editorStore:**

```typescript
interface EditorState {
  code: string;
  language: string;
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  loadFromDisk: () => Promise<void>;
  saveToDisk: () => Promise<void>;
}
```

**executionStore:**

```typescript
type ExecutionStatus = "idle" | "running" | "success" | "error" | "timeout";

interface ExecutionState {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  startedAt: number | null;
  durationMs: number | null;
  appendOutput: (stream: "stdout" | "stderr", chunk: string) => void;
  reset: () => void;
  setFinished: (exitCode: number | null, timedOut: boolean) => void;
}
```

Migrate `useExecution` logic to the store or keep the hook as a store facade.

### 3. Output panel

**Location:** `src/components/output/OutputPanel.tsx`

**Subcomponents:**

| Component | Description |
|-----------|-------------|
| `OutputTabs` | Tabs: Output \| Errors |
| `OutputStream` | Scrollable content area |
| `OutputStatus` | Badge: idle / running / success / error / timeout |
| `ExitCodeBadge` | Shows `exit code: 0` or `exit code: 1` |
| `DurationBadge` | Execution time in ms |

**Behavior:**

- **Output** tab: concatenates stdout
- **Errors** tab: concatenates stderr; auto-switch if stderr and exit !== 0
- **Auto-scroll:** on by default; disable if user scrolls up
- **Clear:** clears stdout/stderr and resets badges; does not touch editor
- **Running:** spinner or pulsing indicator in toolbar

**Stream styles:**

```css
.output-stdout { color: #d4d4d4; }
.output-stderr { color: #f48771; }
.output-timeout { color: #cca700; font-weight: bold; }
```

### 4. Toolbar

**Location:** `src/components/layout/Toolbar.tsx`

**Controls:**

| Control | State |
|---------|-------|
| Runtime selector | Static "Node.js" dropdown (disabled until Phase 3) |
| Run | Enabled if status !== running |
| Stop | Enabled only if status === running |
| Clear | Always enabled |

**Visual feedback:**

- Run: play icon + shortcut hint `⌘↵`
- Stop: stop icon, red when active
- During execution: optional edit lock (recommended: allow editing but no auto-run)

### 5. Snippet persistence

**Strategy:** JSON file at `~/.runspace/last-snippet.json`

**New Tauri command:**

```rust
#[tauri::command]
fn read_snippet() -> Result<SnippetData, String>;

#[tauri::command]
fn write_snippet(data: SnippetData) -> Result<(), String>;
```

```rust
#[derive(Serialize, Deserialize)]
pub struct SnippetData {
    pub code: String,
    pub language: String,
    pub updated_at: String, // ISO 8601
}
```

**When to save:**

- On Run
- On window close (`on_window_event` CloseRequested)
- On `Cmd+S`

**When to load:**

- On app mount (`editorStore.loadFromDisk()`)

**Tauri permissions:** add `fs:allow-read` and `fs:allow-write` with scope `~/.runspace/**`.

### 6. Enriched StatusBar

Show:

- Status: `Ready` | `Running...` | `Finished (0)` | `Error (1)` | `Timed out`
- Runtime: `Node.js` (static)
- Last execution duration: `Last run: 42ms`

### 7. E2E tests

**Tool:** Playwright with `@tauri-apps/api` or Tauri WebDriver.

**Location:** `tests/e2e/run-code.spec.ts`

**Scenario:**

1. Open app
2. Type `console.log("e2e test")` in Monaco (or set value programmatically)
3. Click Run
4. Verify output contains "e2e test"
5. Verify exit code 0

**CI:** mark optional in Phase 2 if E2E setup is complex; required before Phase 3.

---

## Key files to create/modify

| File | Action |
|------|--------|
| `src/components/editor/MonacoWrapper.tsx` | Monaco editor |
| `src/components/output/OutputPanel.tsx` | Output panel |
| `src/components/output/OutputTabs.tsx` | Tabs |
| `src/components/layout/Toolbar.tsx` | Run/Stop/Clear controls |
| `src/stores/editorStore.ts` | Editor state |
| `src/stores/executionStore.ts` | Execution state |
| `src/hooks/useExecution.ts` | Refactor to store |
| `src-tauri/src/commands/snippet.rs` | Persistence |
| `tests/e2e/run-code.spec.ts` | E2E |

---

## Phase completion checklist

Everything below must be checked before marking Phase 2 as done.

### Editor

- [x] Monaco integrated with lazy loading (`MonacoWrapper.tsx`)
- [x] JavaScript syntax highlighting and `vs-dark` theme
- [x] `Cmd+Enter` / `Ctrl+Enter` runs code via `editor.addAction()`
- [x] `Cmd+S` saves snippet to disk
- [x] `automaticLayout: true` for window resize

### Output panel & toolbar

- [x] `OutputPanel` with unified output (stdout + stderr), status badges, exit code, duration
- [x] Auto-scroll with disable on manual scroll up
- [x] Clear resets output without touching editor
- [x] Toolbar with Run, Stop, Clear and runtime selector (Node.js dropdown)
- [x] `StatusBar` shows state, runtime, and last run duration

### State & persistence

- [x] `editorStore` and `executionStore` (Zustand) implemented
- [x] `useExecution` refactored to use stores
- [x] Tauri commands `read_snippet` / `write_snippet` for `~/.runspace/last-snippet.json`
- [x] Snippet saved on Run, `Cmd+S`, and window close
- [x] Snippet restored on app launch
- [x] Snippet persistence via `allow-snippet` permissions; Rust commands write to `~/.runspace/` (no shell/fs plugin)

### Verification

- [x] Monaco loads in under 2s on dev machine
- [x] Output streams in real time (not only at end)
- [x] Syntax errors appear in output panel (stderr styled distinctly)
- [x] Snippet persists after closing and reopening app
- [x] Layout does not break when resizing with Monaco open

### Tests

- [x] Unit: `executionStore` state transitions
- [x] Unit: `editorStore` save/load (mock invoke)
- [ ] E2E: type code → Run → verify output and exit code 0 (skeleton only; optional in Phase 2 CI)

### Documentation & PR

- [x] `CHANGELOG.md` entry added for Phase 2
- [x] CI passes (lint, unit tests, Rust tests, build)

---

## Tests

| Type | What to test |
|------|--------------|
| Unit | `executionStore` state transitions |
| Unit | `editorStore` save/load (mock invoke) |
| E2E | Type → Run → see output |
| Manual | Auto-scroll, stderr in unified output, Cmd+S |

---

## Out of scope

- Functional runtime selector (Phase 3)
- File tree in sidebar
- Multiple files / editor tabs
- Custom themes
- Advanced autocomplete / IntelliSense
- Integrated code formatting (Prettier)

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Monaco increases bundle size | Lazy load; Monaco worker via CDN or vite plugin |
| Resize does not update editor | `automaticLayout: true`; Tauri window resize listener |
| Corrupt snippet on disk | Validate JSON on read; fallback to default snippet |
| Flaky E2E with streaming | Wait for `execution-finished` before assert |

---

## Phase deliverable

Runspace's core user experience: editor + execution + output, comparable in flow to RunJS but Node.js only.
