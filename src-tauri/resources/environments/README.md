# Bundled environment manifests

Each `.json` file in this directory defines one Runspace environment (language or framework).
The Rust `EnvironmentRegistry` loads these at startup; the frontend receives definitions via
`list_available_environments` / `list_environments`.

## Profiles

| Profile     | Purpose                                                                              |
|-------------|--------------------------------------------------------------------------------------|
| `script`    | Run a file with `program` + `args`                                                   |
| `compiled`  | Compile then run (`compile` + `output_binary`)                                       |
| `framework` | Bundled skeleton + optional dependency install + bootstrap template + `post_install` |

## Template variables

Used in `run`, `compile`, `dependency_install`, `post_install`, and bootstrap templates:

- `{{field_key}}` — user-configured binary paths (`node_path`, `php_path`, `composer_path`, ...)
- `{{entry_file}}` — absolute path to the file being run
- `{{output_binary}}` — absolute path to the compile output binary
- `{{skeleton_root}}` — installed skeleton directory
- `{{workspace_path}}` — active workspace directory

Path variables use the same names everywhere. When a bootstrap template is written as source code, path values are escaped for safe embedding automatically.

## Framework skeleton

```json
"dependency_install": {
  "program": "{{composer_path}}",
  "args": ["install", "--no-interaction", "--prefer-dist", "--no-scripts"],
  "vendor_marker": "vendor/autoload.php",
  "manifest_files": ["composer.json", "composer.lock"]
}
```

Bootstrap templates live in `templates/` (e.g. `php_vendor_bootstrap.tpl`, `kotlin_gradle_bootstrap.tpl`).

Gradle-based frameworks use `dependency_install` with Gradle tasks and a Kotlin bootstrap that delegates to `gradle runspaceRun`:

```json
"dependency_install": {
  "program": "{{gradle_path}}",
  "args": ["runspaceResolveDeps", "--quiet", "--console=plain"],
  "vendor_marker": "build/runspace-deps.ready",
  "manifest_files": ["build.gradle.kts", "settings.gradle.kts", "gradle.properties"]
}
```

## Framework `post_install` steps

| Type                  | Fields                                                        |
|-----------------------|---------------------------------------------------------------|
| `create_empty_file`   | `path` (relative to skeleton)                                 |
| `create_dir`          | `path`                                                        |
| `run`                 | `program`, `args`, optional `cwd` (`skeleton` or `workspace`) |

## Framework `prepare`

```json
"prepare": {
  "output": "runspace_bootstrap.php",
  "template": "php_vendor_bootstrap.tpl"
}
```

To add a new bundled environment: add a manifest here, skeleton assets under
`resources/framework-registry/` for build specs; generated sandboxes under
`resources/frameworks/` (see `framework-registry/README.md`).
