# Framework skeletons (generated)

Framework sandboxes are **not** stored in git. They are generated on demand when a framework environment is installed in Runspace, or manually in CI via:

```bash
RUNSPACE_FRAMEWORKS=laravel npm run prepare:frameworks
```

Each framework skeleton is prepared into `~/.runspace/frameworks/<framework-id>/` when that environment is installed, and removed when it is uninstalled. For local dev or CI, `npm run prepare:frameworks` can target specific frameworks with `RUNSPACE_FRAMEWORKS`; without `RUNSPACE_USER_FRAMEWORKS_DIR`, output is synced to `src-tauri/resources/frameworks/<framework-id>/` instead.

Framework installs need the matching toolchain on the machine (e.g. Composer for Laravel/Symfony, npm for Express/Koa/Hono/Fastify/NestJS, pip for Flask/Django, sbt for Play).

See `manifest.json` for pinned project versions.
