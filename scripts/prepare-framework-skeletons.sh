#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
RAILS_SRC="$GEN/rails"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
RAILS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/rails"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
RAILS_VERSION="${RUNSPACE_RAILS_VERSION:-8.0.*}"

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

rails_ready() {
    [[ -f "$RAILS_DEST/Gemfile" ]] &&
        [[ -f "$RAILS_DEST/Gemfile.lock" ]] &&
        [[ -f "$RAILS_DEST/bin/rails" ]] &&
        [[ -f "$RAILS_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_rails=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! rails_ready; then
    needs_rails=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_rails; then
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

if $needs_rails && ! command -v rails >/dev/null 2>&1; then
    echo "Rails is required to prepare the Rails skeleton." >&2
    echo "Install Ruby, Bundler, and Rails, then run:" >&2
    echo "  gem install rails bundler" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_rails && ! command -v bundle >/dev/null 2>&1; then
    echo "Bundler is required to prepare the Rails skeleton." >&2
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

if $needs_rails && [[ ! -f "$RAILS_SRC/.bundle/config" ]]; then
    echo "Generating Rails skeleton..."
    rm -rf "$RAILS_SRC"

    # Install specific Rails version if not already available
    if ! gem list -i "^rails$" -v "$RAILS_VERSION" >/dev/null 2>&1; then
        echo "Installing Rails ${RAILS_VERSION}..."
        gem install rails -v "$RAILS_VERSION" --no-document
    fi

    # Use the specific Rails version to generate the skeleton
    gem exec -v "$RAILS_VERSION" rails new "$RAILS_SRC" \
        --skip-git \
        --database=sqlite3 \
        --skip-test \
        --skip-system-test \
        --skip-javascript \
        --skip-hotwire \
        --skip-asset-pipeline \
        --skip-action-mailbox \
        --skip-action-text \
        --minimal \
        --skip-bundle \
        --force
    (
        cd "$RAILS_SRC"
        bundle config set --local path 'vendor/bundle'
        bundle install
    )
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
