# Framework skeletons (generated)

Laravel, Symfony, Express, and Expo sandboxes are **not** stored in git. They are generated locally or in CI by:

```bash
npm run prepare:frameworks
```

Output directories:

- `laravel/` — copied to `~/.runspace/frameworks/laravel/` on first use
- `symfony/` — copied to `~/.runspace/frameworks/symfony/` on first use
- `express/` — copied to `~/.runspace/frameworks/express/` on first use
- `expo/` — copied to `~/.runspace/frameworks/expo/` on first use

Laravel and Symfony require Composer; Express and Expo require npm. End users of the installed app do not run this; only developers and release builds do.

See `manifest.json` for pinned project versions.
