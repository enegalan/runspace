# Phase 0 — Project and desktop shell

**Estimated duration:** 3 days  
**Dependencies:** none (project bootstrap)  

---

## Goal

Have a desktop app that opens a native window with the Runspace base layout, development tooling configured, and CI that validates every PR. At the end of this phase there is no editor or code execution — only the visual structure and build pipeline.

---

## What this phase covers

1. Tauri 2 + React + TypeScript project initialization
2. Agreed folder structure for the full MVP
3. Empty but definitive UI layout structure
4. Tooling: ESLint, Prettier, Vitest
5. GitHub Actions CI
6. Minimal development documentation

---

## How to implement

### 1. Project initialization

Run at the repository root (keeping existing `LICENSE` and `README.md`):

```bash
npm create tauri-app@latest . -- --template react-ts
```

Configure during scaffold:

- App name: `Runspace`
- Identifier: `com.enegalan.runspace` (or the author's identifier)
- Default window: 1200×800, resizable, title "Runspace"

Adjust `src-tauri/tauri.conf.json`:

```json
{
  "productName": "Runspace",
  "version": "0.0.1",
  "identifier": "com.enegalan.runspace",
  "app": {
    "windows": [{
      "title": "Runspace",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600,
      "resizable": true
    }]
  }
}
```

### 2. Folder structure

Create from the start the structure later phases will use:

```
runspace/
  src/
    components/
      layout/
        AppShell.tsx
        Sidebar.tsx
        EditorArea.tsx
        OutputPanel.tsx
        StatusBar.tsx
        Toolbar.tsx
    stores/
    hooks/
    styles/
      globals.css
    App.tsx
    main.tsx
  src/core/
    types/
      index.ts          # shared UI ↔ Rust types (empty for now)
  src-tauri/
    src/
      commands/
        mod.rs
      lib.rs
      main.rs
    capabilities/
      default.json
  tests/
    unit/
    e2e/
  docs/
    plan/               # this directory
  .github/
    workflows/
      ci.yml
```

### 3. UI layout (empty shell)

Implement a three-zone layout inspired by RunJS, using CSS Grid or Flexbox:

```
+-------------------------------------------------------------+
| Toolbar: logo + space for future controls                   |
+----------+----------------------------------+---------------+
| Sidebar  | EditorArea (placeholder)         | OutputPanel   |
| 240px    | flex-grow                        | 320px         |
|          |                                  | (placeholder) |
+----------+----------------------------------+---------------+
| StatusBar: "Ready"                                          |
+-------------------------------------------------------------+
```

**Components:**

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Main grid, distributes zones |
| `Toolbar` | Top bar; logo + title for now |
| `Sidebar` | Left panel; "Files" placeholder |
| `EditorArea` | Center zone; "Editor coming soon" message |
| `OutputPanel` | Right panel; "Output" placeholder |
| `StatusBar` | Bottom line with static status |

**Visual style:**

- Dark theme by default (background `#1e1e1e`, borders `#333`)
- system-ui typography
- No heavy UI kit in this phase; CSS modules or Tailwind (pick one and stick with it)

### 4. Tauri capabilities (base security)

In `src-tauri/capabilities/default.json`, allow only the minimum for this phase:

- `core:default`
- No shell or filesystem permissions until Phase 1

Document in a comment that permissions will expand phase by phase.

### 5. Tooling

**ESLint + Prettier:**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks prettier eslint-config-prettier
```

Scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "tauri": "tauri"
  }
}
```

**Vitest:**

- Configure `vitest.config.ts` with `jsdom` environment
- Smoke test: `AppShell` renders all 5 layout zones

### 6. CI (GitHub Actions)

File `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run tauri build
```

**Note:** install system dependencies for Tauri on the runner (Rust toolchain via `dtolnay/rust-toolchain@stable`).

### 7. Development README

Update `README.md` with:

- Project description
- Requirements: Node 20+, Rust stable, Xcode CLI (macOS)
- Commands: `npm run tauri dev`, `npm run tauri build`, `npm test`
- Link to `docs/plan/README.md`

---

## Key files to create/modify

| File | Action |
|------|--------|
| `package.json` | Create (Tauri scaffold) |
| `src-tauri/` | Create (Tauri scaffold) |
| `src/components/layout/*.tsx` | Create layout |
| `src/styles/globals.css` | Base styles |
| `.github/workflows/ci.yml` | CI |
| `vitest.config.ts` | Test config |
| `eslint.config.js` | Lint |
| `CHANGELOG.md` | First entry: "Phase 0: project shell" |

---

## Phase completion checklist

Everything below must be checked before marking Phase 0 as done.

### Project setup

- [x] Tauri 2 + React + TypeScript + Vite scaffold initialized in the repo
- [x] `tauri.conf.json` configured (Runspace name, identifier, 1200×800 window, min 800×600)
- [x] Folder structure created (`src/components/layout/`, `src/core/`, `src-tauri/src/commands/`, `tests/`, etc.)
- [x] ESLint, Prettier, and Vitest configured and working

### UI shell

- [x] `AppShell` renders 5 zones: Toolbar, Sidebar, EditorArea, OutputPanel, StatusBar
- [x] Dark theme applied (`globals.css`)
- [x] Placeholders visible in Sidebar, EditorArea, and OutputPanel
- [x] Layout survives window resize without breaking

### Security & tooling

- [x] Tauri capabilities limited to `core:default` (no shell/filesystem yet)
- [x] `npm run lint` passes
- [x] `npm test` passes (`AppShell` smoke test)

### Build & CI

- [x] `npm run tauri dev` opens native window on macOS
- [x] `npm run tauri build` produces `.app` / binary without errors
- [x] React hot reload works when editing components
- [x] `.github/workflows/ci.yml` runs lint, test, and build on PR
- [x] GitHub CI passes on PR to `main`

### Documentation & PR

- [x] `README.md` updated with dev requirements and startup commands
- [x] `CHANGELOG.md` entry added for Phase 0
- [ ] PR includes screenshot of the empty shell layout
- [ ] PR description lists what is explicitly out of scope

---

## Tests

| Type | What to test |
|------|--------------|
| Unit (Vitest) | `AppShell` renders Toolbar, Sidebar, EditorArea, OutputPanel, StatusBar |
| Manual | Open app, resize window, verify layout does not break |
| CI | Lint + test + build on macOS |

---

## Out of scope

- Monaco Editor
- Code execution
- Tauri filesystem or shell commands
- Runtime Manager
- Data persistence
- Final app icon (use Tauri default)
- Windows/Linux builds
- Auto-updater

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Scaffold conflicts in non-empty repo | Backup README/LICENSE; manual merge |
| CI fails due to missing Rust/macOS deps | Document deps; use `macos-latest` with rust-toolchain action |
| Fragile CSS layout on resize | Use `min-width: 0` on flex children; manual resize testing |

---

## Phase deliverable

Mergeable PR with an empty but structured desktop app, green CI, and startup documentation. Foundation ready to wire execution in Phase 1.
