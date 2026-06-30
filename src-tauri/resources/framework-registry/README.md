# Framework registry

Build specs per framework. Run `npm run prepare:frameworks` (or `RUNSPACE_FRAMEWORKS=laravel`).

1. Add `framework-registry/<id>.json` — set `"generator"` (see `scripts/framework_generators/`)
2. Add `environments/<id>.json`
3. Bump `manifest.meta.json` → `skeletonVersion` when all skeletons must regenerate

| Field | Use |
|-------|-----|
| `generator` | Layout/recipe id → `framework_generators/<name>.py` |
| `sync` | Pre-sync patches in registry entry |
| `skeleton.sync_exclude_*` | Rsync excludes in `environments/<id>.json` |

Python dep layouts: `venv`, `site-packages`, `requirements`, `venv-vendor`. Extra steps → own generator (e.g. `django`).

New generator: one file with `generate(fw_id, src, cfg)` + `sync_ready(src, cfg)`. File `venv.py` → `"generator": "venv"`.
