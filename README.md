<p align="center">
  <img src="art/logo.png" width="360" alt="Runspace" />
</p>

Runspace is a desktop sandbox for running multiple programming runtimes in isolated, on-demand environments.

## Requirements

### Using Runspace

Install the release build for your platform.

Each environment you add in the playground needs its own runtime installed and configured in **Settings → Environments** (binary paths are auto-detected when possible).

| Environment | What you need |
|-------------|---------------|
| Node.js | [Node.js](https://nodejs.org/en/download) |
| PHP | [PHP](https://www.php.net/downloads) |
| Python | [Python](https://www.python.org/downloads/) |
| Ruby | [Ruby](https://www.ruby-lang.org/en/downloads/) |
| GCC (C) | GCC ([Xcode Command Line Tools](https://developer.apple.com/xcode/resources/) on macOS) |
| G++ (C++) | G++ ([Xcode Command Line Tools](https://developer.apple.com/xcode/resources/) on macOS) |
| Laravel | PHP + [Composer](https://getcomposer.org/) |
| Symfony | PHP + [Composer](https://getcomposer.org/) |
| Dropwizard | [Java JDK](https://www.oracle.com/java/technologies/downloads/) + [Maven](https://maven.apache.org/download.cgi) |
| CakePHP | PHP + [Composer](https://getcomposer.org/) |
| Slim | PHP + [Composer](https://getcomposer.org/) |
| Laminas | PHP + [Composer](https://getcomposer.org/) |
| Phalcon | PHP (with [Phalcon extension](https://docs.phalcon.io/5.9/installation/)) + [Composer](https://getcomposer.org/) |
| Express | [Node.js](https://nodejs.org/en/download) + npm |
| Vert.x | [Java JDK](https://www.oracle.com/java/technologies/downloads/) + [Maven](https://maven.apache.org/download.cgi) |
| Spring Boot | [Java JDK](https://www.oracle.com/java/technologies/downloads/) + [Maven](https://maven.apache.org/download.cgi) |
| Ktor | [Kotlin](https://kotlinlang.org/docs/command-line.html) + [Gradle](https://gradle.org/install/) |
| Padrino | Ruby + [Bundler](https://bundler.io/) + [Padrino](https://padrinorb.com/guides/getting-started/installation/) |
| Quarkus | [Java JDK](https://www.oracle.com/java/technologies/downloads/) + [Maven](https://maven.apache.org/download.cgi) |
| Express | [Node.js](https://nodejs.org/en/download) |
| Roda | Ruby + [Bundler](https://bundler.io/) |
| Phalcon | PHP (with [Phalcon extension](https://docs.phalcon.io/5.9/installation/)) + [Composer](https://getcomposer.org/) |
| Ktor | [Kotlin](https://kotlinlang.org/docs/command-line.html) + [Gradle](https://gradle.org/install/) |
| JHipster | [Java](https://www.oracle.com/java/technologies/downloads/) + [Maven](https://maven.apache.org/download.cgi) |
| Flask | [Python](https://www.python.org/downloads/) |
| Koa | [Node.js](https://nodejs.org/en/download) |
| Hono | [Node.js](https://nodejs.org/en/download) |
| Fastify | [Node.js](https://nodejs.org/en/download) |
| NestJS | [Node.js](https://nodejs.org/en/download) |
| Play Framework | [Scala](https://www.scala-lang.org/download/) + [sbt](https://www.scala-sbt.org/download.html) |

You only install the runtimes for the environments you use. Node.js is not required to run PHP, and so on.

### Developing Runspace

To build or contribute to Runspace from source:

- Node.js 20+
- Rust stable
- Xcode Command Line Tools (macOS)
- [Composer](https://getcomposer.org/) — generates bundled Laravel/Symfony/CakePHP skeletons during build (`npm run prepare:frameworks`)
- [Composer](https://getcomposer.org/) — generates bundled Laravel/Symfony/Slim skeletons during build (`npm run prepare:frameworks`)
- [Composer](https://getcomposer.org/) — generates bundled Laravel/Symfony/Laminas skeletons during build (`npm run prepare:frameworks`)
- [Composer](https://getcomposer.org/) — generates bundled Laravel/Symfony/Phalcon skeletons during build (`npm run prepare:frameworks`)
- [Composer](https://getcomposer.org/) — generates bundled Laravel/Symfony skeletons during build (`npm run prepare:frameworks`)
- curl — generates bundled Spring Boot skeleton via start.spring.io during build
- Ruby 3.2+ with Bundler and the `padrino` gem — generates the bundled Padrino skeleton during build (`npm run prepare:frameworks`)
- curl — generates bundled Quarkus skeleton via code.quarkus.io during build
- npm — generates bundled Express skeleton during build (`npm run prepare:frameworks`)
- Ruby + Bundler — generates bundled Roda skeleton during build (`npm run prepare:frameworks`)
- Gradle — generates bundled Ktor skeleton during build (`npm run prepare:frameworks`)
- npm — generates bundled Express/JHipster skeletons during build (`npm run prepare:frameworks`)
- Python with pip — generates the bundled Flask skeleton during build (`npm run prepare:frameworks`)
- [sbt](https://www.scala-sbt.org/download.html) — generates the bundled Play skeleton during build (`npm run prepare:frameworks`)

## Development

Install dependencies:

```bash
npm install
```

Run the desktop app in development mode (with hot reload):

```bash
npm run tauri dev
```

Build the production app:

```bash
npm run tauri build
```

Run tests:

```bash
npm test
```

Generate Laravel/Symfony/Express/Vert.x skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/CakePHP skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Slim skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Laminas skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Express/Spring Boot skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Express/ASP.NET Core/Padrino skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Express/Quarkus skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Express/Roda skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Express/Ktor skeletons manually (first clone or after bumping `manifest.json`):
Generate Laravel/Symfony/Express/JHipster skeletons manually (first clone or after bumping `manifest.json`):
Generate framework skeletons manually (first clone or after bumping `manifest.json`):

```bash
npm run prepare:frameworks
```

Lint:

```bash
npm run lint
```
