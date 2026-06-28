---
name: create-environment
description: >-
  Add a new Runspace bundled environment (language or framework) by creating
  JSON manifests, optional skeleton assets, and bootstrap templates. Use when
  the user asks to add, create, or register a new environment, runtime, language,
  or framework in Runspace.
---

# Create Runspace Environment

## Overview

Bundled environments are JSON manifests in `src-tauri/resources/environments/`.
`EnvironmentRegistry` loads every `*.json` at startup. No Rust registration step.

| Profile     | When to use                                       | Required manifest fields     |
|-------------|---------------------------------------------------|------------------------------|
| `script`    | Interpreted language runs a file directly         | `run`                        |
| `compiled`  | Compile then execute a binary                     | `compile`, `output_binary`   |
| `framework` | Bundled skeleton + dependency install + bootstrap | `run`, `skeleton`, `prepare` |

Read `src-tauri/resources/environments/README.md` and copy the closest existing manifest before editing.

## Discovery questions

Infer from context when possible. If any item below is missing or ambiguous, use `AskQuestion` (or ask conversationally) before writing files.

### Required (always ask if not inferable)

1. **Profile** — `script`, `compiled`, or `framework`?
2. **Identity** — `id` (lowercase slug, unique) and display `name`?
3. **Category** — `language` or `framework`?
4. **File extension** — source file suffix without dot (e.g. `py`, `rs`, `php`)?
5. **Primary binary** — executable name, config field key (e.g. `rust_path`), and `detect.commands` list for autodetect?
6. **Install guide URL** — official download/docs link?

### Profile-specific

**Script**
7. **Run command** — program template and args? Default pattern: `program: "{{binary_key}}"`, `args: ["{{entry_file}}"]`.
8. **Version probe** — flag for `--version`? Default: `{ "arg": "--version" }`. Some tools use `-V` or `version` subcommand.

**Compiled**
9. **Compile command** — program, args (include `-o {{output_binary}}` and `{{entry_file}}`)?
10. **Output binary name** — default is `runspace_out`.

**Framework**
11. **Skeleton** — bundled directory name under `src-tauri/resources/frameworks/`? Does it already exist or must it be generated?
12. **Dependency install** — package manager binary field, install args, `vendor_marker`, `manifest_files`?
13. **Bootstrap** — template file in `templates/` and `prepare.output` filename?
14. **Post-install steps** — `create_empty_file`, `create_dir`, or `run` steps after skeleton sync?
15. **Terminal env** — needed? Copy pattern from `laravel.json` / `symfony.json` if yes.
16. **Sync exclusions** — dirs/files to skip when syncing skeleton (e.g. `vendor`, `database/database.sqlite`)?

### Optional

17. **Extra config fields** — secondary binaries (e.g. `composer_path`)? Required or optional?
18. **Presentation accent** — hex color for UI (e.g. `#3776ab`)?
19. **Default environment** — set `"default": true`? Only one manifest may have this; currently `nodejs.json`.

## Workflow

```
Task Progress:
- [ ] Gather answers (discovery questions above)
- [ ] Pick reference manifest and profile
- [ ] Create src-tauri/resources/environments/<id>.json
- [ ] Add framework skeleton / template if profile is framework
- [ ] Validate JSON and registry rules
- [ ] Verify app loads the new environment
```

### Step 1: Choose a reference manifest

| Goal               | Copy from                                             |
|--------------------|-------------------------------------------------------|
| Simple interpreter | `nodejs.json`, `python.json`, `php.json`, `ruby.json` |
| Compiler           | `gcc.json`, `gpp.json`                                |
| PHP framework      | `laravel.json`, `symfony.json`, `wordpress.json`      |
| PHP framework      | `laravel.json`, `symfony.json`                        |
| Node.js framework  | `express.json`                                        |
| Python framework   | `streamlit.json`                                      |
| JVM framework      | `ktor.json` (Gradle dependency install + Kotlin bootstrap) |
| Go framework       | `gorilla-mux.json`                                    |
| Go framework       | `buffalo.json` (go mod vendor pattern)                |

### Step 2: Create the manifest

Path: `src-tauri/resources/environments/<id>.json`

Minimal script example:

```json
{
  "id": "go",
  "name": "Go",
  "category": "language",
  "file_extension": "go",
  "install_guide_url": "https://go.dev/dl/",
  "presentation": { "accent": "#00add8" },
  "profile": "script",
  "config_fields": [
    {
      "key": "go_path",
      "label": "Go binary",
      "field_type": "file_path",
      "required": true,
      "primary": true,
      "detect": { "commands": ["go"] }
    }
  ],
  "run": {
    "program": "{{go_path}}",
    "args": ["run", "{{entry_file}}"]
  },
  "version_probe": { "arg": "version" }
}
```

### Step 3: Framework extras (only if `profile: "framework"`)

1. Add skeleton entry to `src-tauri/resources/frameworks/manifest.json`.
2. Run `npm run prepare:frameworks` (requires Composer for PHP, npm for Express, pip for Streamlit; generates `laravel/`, `symfony/`, `express/`, `streamlit/`-style dirs).
2. Run `npm run prepare:frameworks` (requires Composer for PHP, npm for Express, Gradle for Ktor; generates `laravel/`, `symfony/`, `express/`, `ktor/` dirs).
2. Run `npm run prepare:frameworks` (requires Composer; generates `laravel/`, `symfony/`, `wordpress/`-style dirs).
2. Run `npm run prepare:frameworks` (requires Composer for PHP, npm for Express, Go for Buffalo).
3. Add bootstrap template under `src-tauri/resources/environments/templates/` if existing templates do not fit.
4. Point `skeleton.bundled_dir` at the generated folder name.
5. Set `prepare.template` and `prepare.output` (bootstrap file written into workspace).

Framework skeletons are **not** committed to git; CI and release builds run `prepare:frameworks`.

**Go module frameworks** (`go_mod_bootstrap.tpl`): skeleton is a `go mod init` + `go get` sandbox. Use `dependency_install` with `go mod download`, `vendor_marker: "go.sum"`, and `manifest_files: ["go.mod", "go.sum"]`. Register in `frameworks/manifest.json` with `goModule` and `versionConstraint`.
Go module frameworks (`buffalo.json` pattern) vendor dependencies into the skeleton:

```json
"dependency_install": {
  "program": "{{go_path}}",
  "args": ["mod", "vendor"],
  "vendor_marker": "vendor/modules.txt",
  "manifest_files": ["go.mod", "go.sum"]
}
```

Use `go_mod_bootstrap.tpl` for bootstrap; it runs the user snippet with `-mod=vendor` from the skeleton root.

### Step 4: Template variables

Use in `run`, `compile`, `dependency_install`, `post_install`, and bootstrap templates:

| Variable             | Meaning                                           |
|----------------------|---------------------------------------------------|
| `{{field_key}}`      | User-configured path (`node_path`, `php_path`, …) |
| `{{entry_file}}`     | Absolute path to the file being run               |
| `{{output_binary}}`  | Compile output path                               |
| `{{skeleton_root}}`  | Installed skeleton directory                      |
| `{{workspace_path}}` | Active workspace directory                        |

Config field keys must match template placeholders. Mark exactly one binary field with `"primary": true`.

### Step 5: Validation rules

Registry rejects manifests that violate:

- Empty `id`
- Duplicate `id` across manifests
- More than one `"default": true`
- `script` without `run`
- `compiled` without `compile`
- `framework` without `run`, `skeleton`, and `prepare`

`config_fields` support `field_type`: `file_path`, `directory_path`, `text`.

`post_install` step types:

| type                | fields                                                        |
|---------------------|---------------------------------------------------------------|
| `create_empty_file` | `path` (relative to skeleton)                                 |
| `create_dir`        | `path`                                                        |
| `run`               | `program`, `args`, optional `cwd` (`skeleton` or `workspace`) |

### Step 6: Verify

```bash
cargo test --manifest-path src-tauri/Cargo.toml environment::registry
```

For `profile: "framework"`, also run skeleton generation and confirm the new skeleton syncs:

```bash
npm run prepare:frameworks
```

Expect output like `Synced … skeletons` including the new framework directory under `src-tauri/resources/frameworks/`. If generation fails, fix `prepare-framework-skeletons.sh` / `sync-framework-skeletons.sh` before opening the PR.

Restart `npm run tauri dev` and confirm the environment appears in Settings → Environments via `list_available_environments`.

For framework environments, smoke-test: install environment, open workspace, run entry file, check terminal cwd and env vars.

## Conventions

- `id`: lowercase, no spaces, matches filename (`go.json` → `"id": "go"`).
- Binary field keys: `<tool>_path` (e.g. `node_path`, `gcc_path`).
- Labels: `"<Tool> binary"` or descriptive text for secondary tools.
- `detect.commands`: ordered fallbacks (`["python3", "python"]`).
- Do not set `"default": true` unless explicitly requested and no other default exists.
- Do not modify unrelated manifests or Rust code unless validation or execution logic must change.

## Additional resources

- Manifest schema (Rust): `src-tauri/src/environment/manifest.rs`
- Registry validation: `src-tauri/src/environment/registry.rs`
- Bundled docs: `src-tauri/resources/environments/README.md`
- Framework skeletons: `src-tauri/resources/frameworks/README.md`
