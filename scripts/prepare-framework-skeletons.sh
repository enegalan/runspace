#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
BEEGO_SRC="$GEN/beego"
ACTIX_WEB_SRC="$GEN/actix-web"
BUFFALO_SRC="$GEN/buffalo"
DJANGO_SRC="$GEN/django"
PLAY_SRC="$GEN/play"
FLASK_SRC="$GEN/flask"
KOA_SRC="$GEN/koa"
HONO_SRC="$GEN/hono"
FASTIFY_SRC="$GEN/fastify"
NESTJS_SRC="$GEN/nestjs"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
BEEGO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/beego"
ACTIX_WEB_DEST="$REPO_ROOT/src-tauri/resources/frameworks/actix-web"
BUFFALO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/buffalo"
DJANGO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/django"
PLAY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/play"
FLASK_DEST="$REPO_ROOT/src-tauri/resources/frameworks/flask"
KOA_DEST="$REPO_ROOT/src-tauri/resources/frameworks/koa"
HONO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/hono"
FASTIFY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/fastify"
NESTJS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nestjs"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
BEEGO_VERSION="${RUNSPACE_BEEGO_VERSION:-v2.3.8}"
BEEGO_MODULE="${RUNSPACE_BEEGO_MODULE:-github.com/beego/beego/v2}"
ACTIX_WEB_VERSION="${RUNSPACE_ACTIX_WEB_VERSION:-4}"
BUFFALO_VERSION="${RUNSPACE_BUFFALO_VERSION:-v1.1.4}"
BUFFALO_MODULE="${RUNSPACE_BUFFALO_MODULE:-github.com/runspace/buffalo-sandbox}"
DJANGO_VERSION="${RUNSPACE_DJANGO_VERSION:-~=4.2.0}"
DJANGO_PROJECT="${RUNSPACE_DJANGO_PROJECT:-runspace_project}"
PLAY_VERSION="${RUNSPACE_PLAY_VERSION:-3.0.7}"
SCALA_VERSION="${RUNSPACE_SCALA_VERSION:-3.3.6}"
SBT_VERSION="${RUNSPACE_SBT_VERSION:-1.10.7}"
FLASK_VERSION="${RUNSPACE_FLASK_VERSION:-3.1.*}"
KOA_VERSION="${RUNSPACE_KOA_VERSION:-^3.0.0}"
HONO_VERSION="${RUNSPACE_HONO_VERSION:-^4.0.0}"
FASTIFY_VERSION="${RUNSPACE_FASTIFY_VERSION:-^5.0.0}"
NESTJS_VERSION="${RUNSPACE_NESTJS_VERSION:-^11.0.0}"

laravel_ready() {
    [[ -f "$LARAVEL_DEST/artisan" ]] &&
        [[ -f "$LARAVEL_DEST/composer.lock" ]] &&
        [[ -f "$LARAVEL_DEST/skeleton.version" ]]
}

symfony_ready() {
    [[ -f "$SYMFONY_DEST/bin/console" ]] &&
        [[ -f "$SYMFONY_DEST/composer.lock" ]] &&
        [[ -f "$SYMFONY_DEST/skeleton.version" ]]
}

express_ready() {
    [[ -f "$EXPRESS_DEST/package.json" ]] &&
        [[ -f "$EXPRESS_DEST/package-lock.json" ]] &&
        [[ -f "$EXPRESS_DEST/skeleton.version" ]]
}
beego_ready() {
    [[ -f "$BEEGO_DEST/go.mod" ]] &&
        [[ -f "$BEEGO_DEST/go.sum" ]] &&
        [[ -f "$BEEGO_DEST/skeleton.version" ]]
}

buffalo_ready() {
    [[ -f "$BUFFALO_DEST/go.mod" ]] &&
        [[ -f "$BUFFALO_DEST/go.sum" ]] &&
        [[ -f "$BUFFALO_DEST/skeleton.version" ]]
}

django_ready() {
    [[ -f "$DJANGO_DEST/manage.py" ]] &&
        [[ -f "$DJANGO_DEST/requirements.txt" ]] &&
        [[ -f "$DJANGO_DEST/skeleton.version" ]]
}

play_ready() {
    [[ -f "$PLAY_DEST/build.sbt" ]] &&
        [[ -f "$PLAY_DEST/project/build.properties" ]] &&
        [[ -f "$PLAY_DEST/skeleton.version" ]]
}

flask_ready() {
    [[ -f "$FLASK_DEST/requirements.txt" ]] &&
        [[ -f "$FLASK_DEST/app.py" ]] &&
        [[ -f "$FLASK_DEST/skeleton.version" ]]
}

koa_ready() {
    [[ -f "$KOA_DEST/package.json" ]] &&
        [[ -f "$KOA_DEST/package-lock.json" ]] &&
        [[ -f "$KOA_DEST/skeleton.version" ]]
}

hono_ready() {
    [[ -f "$HONO_DEST/package.json" ]] &&
        [[ -f "$HONO_DEST/package-lock.json" ]] &&
        [[ -f "$HONO_DEST/skeleton.version" ]]
}

fastify_ready() {
    [[ -f "$FASTIFY_DEST/package.json" ]] &&
        [[ -f "$FASTIFY_DEST/package-lock.json" ]] &&
        [[ -f "$FASTIFY_DEST/skeleton.version" ]]
}

nestjs_ready() {
    [[ -f "$NESTJS_DEST/package.json" ]] &&
        [[ -f "$NESTJS_DEST/package-lock.json" ]] &&
        [[ -f "$NESTJS_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_beego=false
needs_actix-web=false
needs_buffalo=false
needs_django=false
needs_play=false
needs_flask=false
needs_koa=false
needs_hono=false
needs_fastify=false
needs_nestjs=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! beego_ready; then
    needs_beego=true
fi
if force_sync || ! buffalo_ready; then
    needs_buffalo=true
fi
if force_sync || ! django_ready; then
    needs_django=true
fi
if force_sync || ! play_ready; then
    needs_play=true
fi
if force_sync || ! flask_ready; then
    needs_flask=true
fi
if force_sync || ! koa_ready; then
    needs_koa=true
elif [[ -f "$KOA_SRC/.koa_version" ]]; then
    cached_version=$(cat "$KOA_SRC/.koa_version")
    if [[ "$cached_version" != "$KOA_VERSION" ]]; then
        needs_koa=true
    fi
else
    needs_koa=true
fi
if force_sync || ! hono_ready; then
    needs_hono=true
fi
if force_sync || ! fastify_ready; then
    needs_fastify=true
fi
if force_sync || ! nestjs_ready; then
    needs_nestjs=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_django && ! $needs_play && ! $needs_flask && ! $needs_koa && ! $needs_hono && ! $needs_fastify && ! $needs_nestjs && ! $needs_buffalo && ! $needs_actix-web && ! $needs_beego; then
    echo "Framework skeletons already present; skipping generation."
    exit 0
fi

if ($needs_laravel || $needs_symfony) && ! command -v composer >/dev/null 2>&1; then
    echo "Composer not found - skipping Laravel/Symfony skeletons." >&2
    needs_laravel=false
    needs_symfony=false
fi

if ($needs_express || $needs_koa || $needs_hono || $needs_fastify || $needs_nestjs) && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Express/Koa/Hono/Fastify/NestJS skeletons." >&2
    exit 1
fi

if $needs_flask; then
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_BIN="python3"
    elif command -v python >/dev/null 2>&1; then
        PYTHON_BIN="python"
    else
        echo "python3 or python is required to prepare the Flask skeleton." >&2
        exit 1
    fi
fi

if $needs_play && ! command -v sbt >/dev/null 2>&1; then
    echo "sbt is required to prepare the Play skeleton." >&2
    echo "Install sbt, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi
if $needs_beego && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Beego skeleton." >&2
    exit 1
fi

if $needs_buffalo && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Buffalo skeleton." >&2
    exit 1
fi


if $needs_django; then
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_CMD=python3
    elif command -v python >/dev/null 2>&1; then
        PYTHON_CMD=python
    else
        echo "python3 or python is required to prepare the Django skeleton." >&2
        exit 1
    fi

    if ! "$PYTHON_CMD" -m pip --version >/dev/null 2>&1; then
        echo "pip is required to prepare the Django skeleton." >&2
        exit 1
    fi
fi

mkdir -p "$GEN"

if $needs_laravel && [[ ! -d "$LARAVEL_SRC/vendor" ]]; then
    echo "Generating Laravel skeleton..."
    rm -rf "$LARAVEL_SRC"
    composer create-project "$LARAVEL_PROJECT" "$LARAVEL_SRC" "$LARAVEL_VERSION" --no-interaction
fi

if $needs_symfony && [[ ! -d "$SYMFONY_SRC/vendor" ]]; then
    echo "Generating Symfony skeleton..."
    rm -rf "$SYMFONY_SRC"
    composer create-project "$SYMFONY_PROJECT" "$SYMFONY_SRC" "$SYMFONY_VERSION" --no-interaction
    (cd "$SYMFONY_SRC" && composer require webapp --no-interaction)
fi

if $needs_express && [[ ! -d "$EXPRESS_SRC/node_modules" ]]; then
    echo "Generating Express skeleton..."
    rm -rf "$EXPRESS_SRC"
    mkdir -p "$EXPRESS_SRC"
    (
        cd "$EXPRESS_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/express-sandbox"
        npm pkg set description="Internal Express sandbox for Runspace"
        npm pkg set private=true
        npm install "express@${EXPRESS_VERSION}" --save
    )
fi
if $needs_beego && [[ ! -d "$BEEGO_SRC/vendor" ]]; then
    echo "Generating Beego skeleton..."
    rm -rf "$BEEGO_SRC"
    mkdir -p "$BEEGO_SRC"
    (
        cd "$BEEGO_SRC"
        go mod init runspace/beego-sandbox
        go get "${BEEGO_MODULE}@${BEEGO_VERSION}"
        go mod vendor
    )
fi

if $needs_buffalo && [[ ! -f "$BUFFALO_SRC/go.mod" ]]; then
    echo "Generating Buffalo skeleton..."
    rm -rf "$BUFFALO_SRC"
    mkdir -p "$BUFFALO_SRC/actions"
    cat > "$BUFFALO_SRC/main.go" <<'GO'
package main

import (
    "log"

    "github.com/runspace/buffalo-sandbox/actions"
)

func main() {
    app := actions.App()
    log.Fatal(app.Serve())
}
GO
    cat > "$BUFFALO_SRC/actions/app.go" <<'GO'
package actions

import (
    "github.com/gobuffalo/buffalo"
)

var app *buffalo.App

func App() *buffalo.App {
    if app == nil {
        app = buffalo.New(buffalo.Options{})
        app.GET("/", HomeHandler)
    }
    return app
}
GO
    cat > "$BUFFALO_SRC/actions/home.go" <<'GO'
package actions

import (
    "github.com/gobuffalo/buffalo"
)

func HomeHandler(c buffalo.Context) error {
    _, err := c.Response().Write([]byte("Hello from Runspace Buffalo sandbox!\n"))
    return err
}
GO
    (
        cd "$BUFFALO_SRC"
        go mod init "$BUFFALO_MODULE"
        go get "github.com/gobuffalo/buffalo@${BUFFALO_VERSION}"
        go mod tidy
    )
fi


if $needs_django && [[ ! -f "$DJANGO_SRC/manage.py" ]]; then
    echo "Generating Django skeleton..."
    rm -rf "$DJANGO_SRC"
    mkdir -p "$DJANGO_SRC"
    (
        cd "$DJANGO_SRC"
        "$PYTHON_CMD" -m pip install "django${DJANGO_VERSION}" \
            --target site-packages \
            --no-warn-script-location \
            --disable-pip-version-check
        PYTHONPATH="$(pwd)/site-packages" "$PYTHON_CMD" -m django startproject "$DJANGO_PROJECT" .
        "$PYTHON_CMD" -m pip freeze \
            --path site-packages \
            --disable-pip-version-check > requirements.txt
    )
fi

if $needs_play && [[ ! -f "$PLAY_SRC/target/runspace-classpath" ]]; then
    echo "Generating Play skeleton..."
    rm -rf "$PLAY_SRC"
    mkdir -p "$PLAY_SRC/project"
    cat > "$PLAY_SRC/build.sbt" <<EOF
name := "runspace-play-sandbox"
version := "1.0-SNAPSHOT"
scalaVersion := "$SCALA_VERSION"

ThisBuild / libraryDependencies ++= Seq(
  "org.playframework" %% "play" % "$PLAY_VERSION"
)

lazy val exportRunspaceClasspath = taskKey[Unit]("Write runtime classpath for Runspace")

exportRunspaceClasspath := {
  import java.nio.file.{Files, Paths}
  val cp = (Compile / fullClasspath).value.map(_.data.getAbsolutePath).mkString(java.io.File.pathSeparator)
  Files.writeString(Paths.get(target.value.getAbsolutePath, "runspace-classpath"), cp)
}
EOF
    cat > "$PLAY_SRC/project/plugins.sbt" <<EOF
addSbtPlugin("org.playframework" % "sbt-plugin" % "$PLAY_VERSION")
EOF
    cat > "$PLAY_SRC/project/build.properties" <<EOF
sbt.version=$SBT_VERSION
EOF
    (cd "$PLAY_SRC" && sbt -batch update compile exportRunspaceClasspath)
fi

if $needs_flask; then
    echo "Generating Flask skeleton..."
    rm -rf "$FLASK_SRC"
    mkdir -p "$FLASK_SRC"
    "$PYTHON_BIN" -m venv "$FLASK_SRC/.venv"
    (
        cd "$FLASK_SRC"
        .venv/bin/pip install --upgrade pip
        .venv/bin/pip install "flask==${FLASK_VERSION}"
        .venv/bin/pip freeze > requirements.txt
        cat > app.py <<'PY'
from flask import Flask

app = Flask(__name__)


@app.get("/")
def index():
    return "Hello from Runspace Flask sandbox"


if __name__ == "__main__":
    app.run(debug=True)
PY
    )
fi

if $needs_koa && [[ ! -d "$KOA_SRC/node_modules" ]]; then
    echo "Generating Koa skeleton..."
    rm -rf "$KOA_SRC"
    mkdir -p "$KOA_SRC"
    (
        cd "$KOA_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/koa-sandbox"
        npm pkg set description="Internal Koa sandbox for Runspace"
        npm pkg set private=true
        npm install "koa@${KOA_VERSION}" --save
    )
    echo "$KOA_VERSION" > "$KOA_SRC/.koa_version"
fi

if $needs_hono && [[ ! -d "$HONO_SRC/node_modules" ]]; then
    echo "Generating Hono skeleton..."
    rm -rf "$HONO_SRC"
    mkdir -p "$HONO_SRC"
    (
        cd "$HONO_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/hono-sandbox"
        npm pkg set description="Internal Hono sandbox for Runspace"
        npm pkg set private=true
        npm install "hono@${HONO_VERSION}" "@hono/node-server" --save
    )
fi

if $needs_fastify; then
    skip_fastify=false
    if [[ -f "$FASTIFY_SRC/package.json" ]] && [[ -f "$FASTIFY_SRC/package-lock.json" ]]; then
        installed_version=$(node -p "require('$FASTIFY_SRC/package.json').dependencies?.fastify || ''" 2>/dev/null || echo "")
        if [[ "$installed_version" == "^${FASTIFY_VERSION#^}" ]] || [[ "$installed_version" == "${FASTIFY_VERSION}" ]]; then
            skip_fastify=true
        fi
    fi

    if ! $skip_fastify; then
        echo "Generating Fastify skeleton..."
        rm -rf "$FASTIFY_SRC"
        mkdir -p "$FASTIFY_SRC"
        (
            cd "$FASTIFY_SRC"
            npm init -y --scope=runspace
            npm pkg set name="@runspace/fastify-sandbox"
            npm pkg set description="Internal Fastify sandbox for Runspace"
            npm pkg set private=true
            npm install "fastify@${FASTIFY_VERSION}" --save
        )
    fi
fi

if $needs_nestjs && [[ ! -d "$NESTJS_SRC/node_modules" ]]; then
    echo "Generating NestJS skeleton..."
    rm -rf "$NESTJS_SRC"
    mkdir -p "$NESTJS_SRC/src"
    (
        cd "$NESTJS_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/nestjs-sandbox"
        npm pkg set description="Internal NestJS sandbox for Runspace"
        npm pkg set private=true
        npm install \
            "@nestjs/core@${NESTJS_VERSION}" \
            "@nestjs/common@${NESTJS_VERSION}" \
            "@nestjs/platform-express@${NESTJS_VERSION}" \
            reflect-metadata \
            rxjs \
            ts-node \
            typescript \
            --save
        cat > src/main.ts <<'NESTJS_MAIN'
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('NestJS sandbox listening on http://localhost:3000');
}

bootstrap();
NESTJS_MAIN
    )
fi

exec bash "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
