# Framework skeletons (generated)

Laravel, Symfony, Express, Flask, Koa, Hono, Fastify, and NestJS sandboxes are **not** stored in git. They are generated locally or in CI by:

```bash
npm run prepare:frameworks
```

Output directories:

- `laravel/` — copied to `~/.runspace/frameworks/laravel/` on first use
- `symfony/` — copied to `~/.runspace/frameworks/symfony/` on first use
- `express/` — copied to `~/.runspace/frameworks/express/` on first use
- `flask/` — copied to `~/.runspace/frameworks/flask/` on first use
- `koa/` — copied to `~/.runspace/frameworks/koa/` on first use
- `hono/` — copied to `~/.runspace/frameworks/hono/` on first use
- `fastify/` — copied to `~/.runspace/frameworks/fastify/` on first use
- `nestjs/` — copied to `~/.runspace/frameworks/nestjs/` on first use

Laravel and Symfony require Composer; Express, Koa, Hono, Fastify, and NestJS require npm; Flask requires Python with pip. End users of the installed app do not run this; only developers and release builds do.

See `manifest.json` for pinned project versions.
