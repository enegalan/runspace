#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
DASH_SRC="$GEN/dash"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
DASH_DEST="$REPO_ROOT/src-tauri/resources/frameworks/dash"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
DASH_VERSION="${RUNSPACE_DASH_VERSION:-4.3.*}"

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

dash_ready() {
    [[ -f "$DASH_DEST/requirements.txt" ]] &&
        [[ -f "$DASH_DEST/app.py" ]] &&
        [[ -f "$DASH_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_dash=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! dash_ready; then
    needs_dash=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_dash; then
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

if $needs_dash && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Dash skeleton." >&2
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

if $needs_dash && [[ ! -f "$DASH_SRC/requirements.txt" ]]; then
    echo "Generating Dash skeleton..."
    rm -rf "$DASH_SRC"
    mkdir -p "$DASH_SRC"
    python3 -m venv "$DASH_SRC/.venv"
    (
        cd "$DASH_SRC"
        .venv/bin/pip install --upgrade pip
        .venv/bin/pip install "dash==${DASH_VERSION}"
        .venv/bin/pip freeze > requirements.txt
        cat > app.py <<'PY'
from dash import Dash, html

app = Dash(__name__)

app.layout = html.Div([
    html.H1("Hello from Runspace Dash sandbox")
])

if __name__ == "__main__":
    app.run(debug=True)
PY
    )
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
