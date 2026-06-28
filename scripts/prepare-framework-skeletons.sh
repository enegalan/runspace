#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
HONO_SRC="$GEN/hono"
FASTIFY_SRC="$GEN/fastify"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
HONO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/hono"
FASTIFY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/fastify"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
HONO_VERSION="${RUNSPACE_HONO_VERSION:-^4.0.0}"
FASTIFY_VERSION="${RUNSPACE_FASTIFY_VERSION:-^5.0.0}"

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

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_hono=false
needs_fastify=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! hono_ready; then
    needs_hono=true
fi
if force_sync || ! fastify_ready; then
    needs_fastify=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_hono && ! $needs_fastify; then
    echo "Framework skeletons already present; skipping generation."
    exit 0
fi

if ($needs_laravel || $needs_symfony) && ! command -v composer >/dev/null 2>&1; then
    echo "Composer not found - skipping Laravel/Symfony skeletons." >&2
    needs_laravel=false
    needs_symfony=false
fi

if ($needs_express || $needs_hono || $needs_fastify) && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Express/Hono/Fastify skeletons." >&2
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
    # Check if we can skip regeneration: package metadata exists and version matches
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

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
