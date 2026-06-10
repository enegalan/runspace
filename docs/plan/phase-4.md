# Phase 4 — Multi-runtime (PHP, Python, Ruby)

**Estimated duration:** 7 days  
**Dependencies:** Phase 3 completed (RuntimeManager + selector)  

---

## Goal

Execute code in PHP, Python, and Ruby with the same flow as Node.js: select runtime, write code, Run, see output. Adapt Monaco to the active language and provide initial templates per runtime.

---

## What this phase covers

1. Adapter pattern in `ExecutionEngine`
2. Execution commands per interpreted runtime
3. Dynamic Monaco language mode switching
4. Hello-world templates per language
5. Runtime-specific error handling
6. Integration tests (conditional on PATH)

---

## Adapter pattern

```mermaid
classDiagram
  class RuntimeAdapter {
    <<trait>>
    +file_extension() String
    +build_command(binary, script) Command
    +default_template() String
    +monaco_language() String
  }

  class NodeAdapter {
    +file_extension() "js"
    +build_command() node main.js
  }

  class PhpAdapter {
    +file_extension() "php"
    +build_command() php main.php
  }

  class PythonAdapter {
    +file_extension() "py"
    +build_command() python3 main.py
  }

  class RubyAdapter {
    +file_extension() "rb"
    +build_command() ruby main.rb
  }

  RuntimeAdapter <|.. NodeAdapter
  RuntimeAdapter <|.. PhpAdapter
  RuntimeAdapter <|.. PythonAdapter
  RuntimeAdapter <|.. RubyAdapter
```

---

## How to implement

### 1. RuntimeAdapter trait (Rust)

**Location:** `src-tauri/src/engine/adapters/mod.rs`

```rust
pub trait RuntimeAdapter: Send + Sync {
    fn runtime_id(&self) -> &str;
    fn file_extension(&self) -> &str;
    fn entry_filename(&self) -> String {
        format!("main.{}", self.file_extension())
    }
    fn build_command(&self, binary: &Path, script: &Path) -> Command;
    fn default_template(&self) -> &str;
}

pub fn get_adapter(runtime_id: &str) -> Result<Box<dyn RuntimeAdapter>, AdapterError> {
    match runtime_id {
        "nodejs" => Ok(Box::new(NodeAdapter)),
        "php" => Ok(Box::new(PhpAdapter)),
        "python" => Ok(Box::new(PythonAdapter)),
        "ruby" => Ok(Box::new(RubyAdapter)),
        _ => Err(AdapterError::Unsupported(runtime_id.to_string())),
    }
}
```

### 2. Concrete adapters

**NodeAdapter** (`adapters/node.rs`):

```rust
fn build_command(&self, binary: &Path, script: &Path) -> Command {
    let mut cmd = Command::new(binary);
    cmd.arg(script);
    cmd
}

fn default_template(&self) -> &str {
    "console.log('Hello from Node.js!');\n"
}
```

**PhpAdapter** (`adapters/php.rs`):

```rust
fn build_command(&self, binary: &Path, script: &Path) -> Command {
    let mut cmd = Command::new(binary);
    cmd.arg(script);
    cmd
}

fn default_template(&self) -> &str {
    "<?php\necho \"Hello from PHP!\";\n"
}
```

**PythonAdapter** (`adapters/python.rs`):

```rust
fn default_template(&self) -> &str {
    "print('Hello from Python!')\n"
}
```

**RubyAdapter** (`adapters/ruby.rs`):

```rust
fn default_template(&self) -> &str {
    "puts 'Hello from Ruby!'\n"
}
```

### 3. ExecutionEngine refactor

**Before:** hardcoded Node logic  
**After:**

```rust
pub fn run_with_adapter(
    &self,
    app: AppHandle,
    adapter: &dyn RuntimeAdapter,
    binary: &Path,
    script_content: &str,
    workspace: &Workspace,
    env: HashMap<String, String>,
    timeout_secs: u64,
) -> Result<ExecutionResult, ExecutionError> {
    let filename = adapter.entry_filename();
    let script_path = workspace_manager.write_file(workspace, &filename, script_content)?;
    let mut cmd = adapter.build_command(binary, &script_path);
    cmd.current_dir(&workspace.path).envs(&env);
    // spawn + stream (same as Phase 1)
}
```

### 4. Monaco — language modes

**Runtime → Monaco language mapping:**

| runtime_id | Monaco `language` |
|------------|-------------------|
| nodejs | `javascript` |
| php | `php` |
| python | `python` |
| ruby | `ruby` |

**Location:** `src/core/constants/runtimeLanguages.ts`

```typescript
export const RUNTIME_LANGUAGES: Record<string, string> = {
  nodejs: "javascript",
  php: "php",
  python: "python",
  ruby: "ruby",
};
```

**When changing runtime in selector:**

1. If editor has previous template content or is empty → load `default_template`
2. If user already wrote code → ask confirmation before replacing (modal)
3. Update Monaco `language` prop

**Language registration:** Monaco includes PHP, Python, Ruby by default; no extra registration needed.

### 5. Templates per runtime

**Location:** `src/core/templates/index.ts`

```typescript
export const RUNTIME_TEMPLATES: Record<string, string> = {
  nodejs: `console.log('Hello from Node.js!');`,
  php: `<?php\necho "Hello from PHP!";`,
  python: `print('Hello from Python!')`,
  ruby: `puts 'Hello from Ruby!'`,
};
```

Duplicate in Rust (`default_template`) as source of truth for commands; TS for UI. Alternative: expose template via Tauri command `get_runtime_template(runtime_id)`.

### 6. Errors per runtime

Normalize stderr for Errors tab. Examples:

| Runtime | Typical error | Presentation |
|---------|---------------|--------------|
| Node | `SyntaxError: ...` | Full line in red |
| PHP | `Parse error: ...` | Full line |
| Python | `SyntaxError: ...` | With line number |
| Ruby | `(eval):1: syntax error` | Full line |

**Optional in this phase:** light parser highlighting `line N` if present in message.

### 7. Language-specific cases

**PHP:**

- Optionally auto-add `<?php` if user writes `echo "hi";` without tag (UX)
- No web server; CLI only

**Python:**

- Always use `python3` (configurable via custom path)
- UTF-8 encoding by default in file

**Ruby:**

- No gems in MVP; standard library only
- `require 'json'` works if in stdlib

**Node:**

- No `npm install`; single-file or local modules only (Phase 5)

### 8. UI — runtime change confirmation

**Component:** `src/components/runtime/RuntimeChangeDialog.tsx`

```
Switch to Python?
Your current code will be replaced with the Python template.
[Cancel]  [Switch]
```

Show only if `code !== currentTemplate && code.trim() !== ""`.

---

## Key files to create/modify

| File | Action |
|------|--------|
| `src-tauri/src/engine/adapters/mod.rs` | Trait + factory |
| `src-tauri/src/engine/adapters/node.rs` | NodeAdapter |
| `src-tauri/src/engine/adapters/php.rs` | PhpAdapter |
| `src-tauri/src/engine/adapters/python.rs` | PythonAdapter |
| `src-tauri/src/engine/adapters/ruby.rs` | RubyAdapter |
| `src-tauri/src/engine/executor.rs` | Refactor with adapter |
| `src/core/constants/runtimeLanguages.ts` | Monaco mapping |
| `src/core/templates/index.ts` | UI templates |
| `src/components/runtime/RuntimeChangeDialog.tsx` | Confirmation |
| `src/components/editor/MonacoWrapper.tsx` | Dynamic language |

---

## Phase completion checklist

Everything below must be checked before marking Phase 4 as done.

### Backend (Rust)

- [x] `RuntimeAdapter` trait and `get_adapter()` factory implemented
- [x] `NodeAdapter`, `PhpAdapter`, `PythonAdapter`, `RubyAdapter` implemented
- [x] `LaravelAdapter`, `SymfonyAdapter` with internal skeleton bootstrap
- [x] `execute_code` uses adapters for entry file, prepare step, and command
- [x] Each adapter builds correct command and default template

### Frontend

- [x] `RUNTIME_TEMPLATES` and Monaco language mapping defined
- [x] Monaco language switches when runtime changes
- [x] `RuntimeChangeDialog` confirms before replacing user code
- [x] Default template loads on runtime switch (when editor empty or on confirm)

### Verification (per runtime)

- [x] Node.js: `console.log` works without regression (`integration_node_hello`)
- [x] PHP: `<?php echo "hi";` runs and shows "hi" (`integration_php_hello`)
- [x] Python: `print("hi")` runs correctly (`integration_python_hello`)
- [x] Ruby: `puts "hi"` runs correctly (`integration_ruby_hello`)
- [x] Laravel: `Str::upper(...)` runs after skeleton install (`integration_laravel_hello`)
- [x] Symfony: `UnicodeString` snippet runs after skeleton install (`integration_symfony_hello`)
- [x] Syntax highlighting changes per runtime (manual UI)
- [x] Syntax errors appear in output panel (stderr) for each language (manual UI)
- [x] Missing runtime disables Run with tooltip (manual UI)

### Manual UI QA guide

**Start:** `npm run tauri dev` (desktop window + browser API at `http://localhost:1420/`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Switch runtime in sidebar (e.g. Node → Ruby) | Monaco language + template update; dialog if editor has custom code |
| 2 | Run default template per runtime | SUCCESS, stdout shows greeting |
| 3 | Introduce a syntax error and Run | Status **error**, stderr in output panel (red) |
| 4 | Uninstall or clear binary path in Settings | Run disabled, tooltip mentions Settings |
| 5 | Browser only: reload while Rust is compiling | “Starting backend…” then normal load (no terminal spam) |

**Syntax-error examples (one per runtime):**

| Runtime | Invalid snippet | Notes |
|---------|-----------------|-------|
| Node.js | `console.log(` | SyntaxError in stderr |
| PHP | `<?php echo (` | Parse error in stderr |
| Python | `print(` | SyntaxError in stderr |
| Ruby | `puts(` | Syntax error in stderr |

**Ruby — `puts` without arguments is valid:**

| Snippet | Status | Output |
|---------|--------|--------|
| `puts` | SUCCESS | Blank line (exit 0) |
| `puts 'hi'` | SUCCESS | `hi` |
| `puts(` | error | Syntax error in stderr |
| `putss` | error | NameError in stderr |

Do not use bare `puts` to test error UI — use `puts(` or `putss` instead.

### Tests

- [x] Rust unit: each adapter generates correct `Command`
- [x] Rust integration per runtime with `#[ignore]` if binary not on PATH (6 tests in `adapters/integration.rs`)
- [x] Vitest: `switchEnvironment`, stores, `AppShell` layout (18 tests)
- [x] Manual: full cycle switch runtime → edit → run → output

### Dev extras (browser + `tauri dev`)

- [x] HTTP API on `127.0.0.1:1422` with Vite proxy `/api`
- [x] `runspaceInvoke` + SSE execution events in browser
- [x] Native Browse via `POST /api/browse` (Rust `rfd` on main thread)
- [x] Backend fetch retry while Rust is still compiling
- [x] Silent `/api` dev proxy (no Vite `ECONNREFUSED` spam while `cargo run` starts)

### Documentation & PR

- [x] `CHANGELOG.md` entry added for Phase 4
- [x] CI toolchain passes locally (`npm run lint`, `npm test`, `npm run build`, `cargo test`)
- [x] `npm run tauri build` verified (required by CI before merge)

---

## Tests

| Type | What to test |
|------|--------------|
| Rust unit | Each adapter builds correct Command |
| Rust integration | Run hello template per runtime (skip if not installed) |
| Manual | Full cycle: switch runtime → edit → run → output |
| Manual | Confirmation when switching runtime with custom code |

**CI strategy:**

```rust
#[test]
#[ignore = "requires php in PATH"]
fn test_php_hello() { ... }
```

Optional CI job `integration-runtimes` on self-hosted or `continue-on-error`.

---

## Framework sandbox (included in Phase 4)

Framework environments (Laravel, Symfony) use the same snippet flow as plain PHP — not by attaching to the user's existing project.

### Design

| Layer | Responsibility |
|-------|----------------|
| Monaco editor | User writes snippet body only (e.g. `echo Str::upper('hi');`) |
| Workspace | `snippet.php` with user code |
| Internal skeleton | `~/.runspace/frameworks/laravel/` or `.../symfony/` — minimal app + `vendor/`, owned by Runspace |
| Bootstrap wrapper | Generated per run: loads internal skeleton, then executes user snippet |
| User configuration | `php_path` required; optional `composer_path` for first-time skeleton provisioning |

```mermaid
sequenceDiagram
  participant User
  participant Editor
  participant Engine as ExecutionEngine
  participant WS as Workspace
  participant SK as Internal skeleton
  participant PHP as php binary

  User->>Editor: Write Laravel snippet
  User->>Engine: Run
  Engine->>WS: Write snippet.php
  Engine->>WS: Write _bootstrap.php wrapper
  Engine->>SK: require bootstrap from skeleton
  Engine->>PHP: php _bootstrap.php
  PHP-->>User: stdout / stderr
```

### FrameworkAdapter (sketch)

Extends the same adapter idea as `RuntimeAdapter`, with framework-specific bootstrap:

```rust
pub trait FrameworkAdapter: RuntimeAdapter {
    fn skeleton_dir(&self) -> &str; // ~/.runspace/frameworks/laravel
    fn wrap_snippet(&self, snippet_path: &Path, wrapper_path: &Path) -> Result<(), AdapterError>;
    fn ensure_skeleton(&self, composer: Option<&Path>) -> Result<(), AdapterError>;
}
```

**Laravel example template (UI):**

```php
use Illuminate\Support\Str;

echo Str::upper('Hello from Laravel!');
```

**Symfony example template (UI):**

```php
use Symfony\Component\String\UnicodeString;

echo (new UnicodeString('hello'))->upper();
```

### In scope (framework phase)

- Internal skeleton install/update (one-time or on app upgrade)
- Snippet execution with framework bootstrapped (Tinker-like, not full HTTP app)
- Facades, helpers, collections, simple container/service access
- Optional in-memory or workspace-local SQLite for basic DB trials

### Out of scope (framework phase)

- User `project_path` or opening an external repo
- `artisan serve`, `symfony server`, or any embedded web server
- HTTP routing, middleware, or request/response cycle
- Arbitrary `composer require` on each Run
- Full multi-file framework apps (see Phase 5 for sandbox file trees)

### User configuration (recap)

Same as Phase 3 catalog: **`php_path` only required**. No project root field. See [phase-3.md — Framework sandbox model](phase-3.md#framework-sandbox-model).

---

## Out of scope

- C/C++ (Phase 7)
- Multiple files / imports (Phase 5)
- Composer/pip/bundler for **user** dependency management (PHP/Python/Ruby runtimes use stdlib only in this phase)
- Embedded web servers for any runtime
- TypeScript execution in Node (transpilation)
- Shebang in scripts

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| PHP without short tags | Document; template uses `<?php` |
| Python 2 vs 3 | `python3` only; clear name in UI |
| Encoding issues on Windows | Post-MVP; macOS first |
| User loses code on runtime switch | Confirmation dialog |

---

## Phase deliverable

Runspace runs 4 interpreted languages plus Laravel and Symfony sandbox snippets with a unified experience. Users can switch between them from the selector and get output in the same panel.
