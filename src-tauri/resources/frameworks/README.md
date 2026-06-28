# Framework skeletons (generated)

Laravel, Symfony, Express, ASP.NET Core, and Padrino sandboxes are **not** stored in git. They are generated locally or in CI by:

```bash
npm run prepare:frameworks
```

Output directories:

- `laravel/` — copied to `~/.runspace/frameworks/laravel/` on first use
- `symfony/` — copied to `~/.runspace/frameworks/symfony/` on first use
- `express/` — copied to `~/.runspace/frameworks/express/` on first use
- `aspnet-core/` — copied to `~/.runspace/frameworks/aspnet-core/` on first use
- `padrino/` — copied to `~/.runspace/frameworks/padrino/` on first use

Laravel and Symfony require Composer; Express requires npm; ASP.NET Core requires the .NET SDK; Padrino requires Ruby, Bundler, and the `padrino` gem. End users of the installed app do not run this; only developers and release builds do.

See `manifest.json` for pinned project versions.
