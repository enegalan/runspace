#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
PLUG_SRC="$GEN/plug"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
PLUG_DEST="$REPO_ROOT/src-tauri/resources/frameworks/plug"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
PLUG_VERSION="${RUNSPACE_PLUG_VERSION:-~> 1.16}"
PLUG_SERVER_VERSION="${RUNSPACE_PLUG_SERVER_VERSION:-~> 1.6}"

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

plug_ready() {
    [[ -f "$PLUG_DEST/mix.exs" ]] &&
        [[ -f "$PLUG_DEST/mix.lock" ]] &&
        [[ -f "$PLUG_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_plug=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! plug_ready; then
    needs_plug=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_plug; then
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

if $needs_plug && ! command -v mix >/dev/null 2>&1; then
    echo "Mix is required to prepare the Plug skeleton." >&2
    echo "Install Elixir, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
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

if $needs_plug && [[ ! -f "$PLUG_SRC/mix.lock" ]]; then
    echo "Generating Plug skeleton..."
    rm -rf "$PLUG_SRC"
    mix new "$PLUG_SRC" --sup --app runspace_plug --module RunspacePlug
    (
        cd "$PLUG_SRC"
        python3 - <<'PY' mix.exs "$PLUG_VERSION" "$PLUG_SERVER_VERSION"
import re, sys
path, plug_version, server_version = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path) as f:
    content = f.read()
deps = f"""defp deps do
    [
      {{:plug, "{plug_version}"}},
      {{:bandit, "{server_version}"}}
    ]
  end"""
content = re.sub(r"defp deps do\s*\[\s*\]", deps, content, count=1)
with open(path, "w") as f:
    f.write(content)
PY
        mix deps.get
        mix compile
    )
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
