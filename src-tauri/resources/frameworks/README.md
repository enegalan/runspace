# Framework skeletons (generated)

Laravel, Symfony, Express, and Spring Boot sandboxes are **not** stored in git. They are generated locally or in CI by:

```bash
npm run prepare:frameworks
```

Output directories:

- `laravel/` — copied to `~/.runspace/frameworks/laravel/` on first use
- `symfony/` — copied to `~/.runspace/frameworks/symfony/` on first use
- `express/` — copied to `~/.runspace/frameworks/express/` on first use
- `spring-boot/` — copied to `~/.runspace/frameworks/spring-boot/` on first use

Laravel and Symfony require Composer; Express requires npm; Spring Boot requires curl (and Maven for end-user dependency install). End users of the installed app do not run this; only developers and release builds do.

See `manifest.json` for pinned project versions.
