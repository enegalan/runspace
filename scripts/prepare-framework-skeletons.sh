#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
BUFFALO_SRC="$GEN/buffalo"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
BUFFALO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/buffalo"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
BUFFALO_MODULE="${RUNSPACE_BUFFALO_MODULE:-github.com/runspace/buffalo-sandbox}"
BUFFALO_VERSION="${RUNSPACE_BUFFALO_VERSION:-v1.1.4}"

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

buffalo_ready() {
    [[ -f "$BUFFALO_DEST/go.mod" ]] &&
        [[ -f "$BUFFALO_DEST/go.sum" ]] &&
        [[ -f "$BUFFALO_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_buffalo=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! buffalo_ready; then
    needs_buffalo=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_buffalo; then
    echo "Framework skeletons already present; skipping generation."
    exit 0
fi

if ($needs_laravel || $needs_symfony) && ! command -v composer >/dev/null 2>&1; then
    echo "Composer is required to prepare Laravel/Symfony skeletons." >&2
    echo "Install Composer or set its path in Settings, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_express && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Express skeleton." >&2
    exit 1
fi

if $needs_buffalo && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Buffalo skeleton." >&2
    exit 1
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

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
