#!/usr/bin/env bash
set -euo pipefail

# Syncs generated framework skeletons into src-tauri/resources/frameworks/.
# Prefer: npm run prepare:frameworks (generates + syncs automatically).

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${1:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
FLASK_SRC="$GEN/flask"
KOA_SRC="$GEN/koa"
HONO_SRC="$GEN/hono"
FASTIFY_SRC="$GEN/fastify"
NESTJS_SRC="$GEN/nestjs"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
FLASK_DEST="$REPO_ROOT/src-tauri/resources/frameworks/flask"
KOA_DEST="$REPO_ROOT/src-tauri/resources/frameworks/koa"
HONO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/hono"
FASTIFY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/fastify"
NESTJS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nestjs"

RSYNC_EXCLUDES=(
    --exclude vendor/
    --exclude node_modules/
    --exclude .git/
    --exclude database/database.sqlite
    --exclude bootstrap/cache/*.php
    --exclude storage/logs/
    --exclude storage/framework/cache/data/
    --exclude storage/framework/sessions/
    --exclude storage/framework/views/
    --exclude var/cache/
    --exclude var/log/
    --exclude var/data*.db
)

SKELETON_VERSION="${SKELETON_VERSION:-7}"
synced=()

sync_dir() {
    local src="$1"
    local dest="$2"
    shift 2
    local excludes=("$@")

    if command -v rsync >/dev/null 2>&1; then
        rsync -a --delete "${excludes[@]}" "$src/" "$dest/"
    else
        rm -rf "$dest"
        mkdir -p "$dest"
        cp -r "$src"/* "$dest/" 2>/dev/null || true
        for pattern in vendor node_modules .git; do
            rm -rf "$dest/$pattern" 2>/dev/null || true
        done
    fi
}

if [[ -d "$LARAVEL_SRC/vendor" ]]; then
    mkdir -p "$LARAVEL_DEST"

    python3 - <<'PY' "$LARAVEL_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/laravel-sandbox"
data["description"] = "Internal Laravel sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Laravel composer.lock after manifest edits..."
    (cd "$LARAVEL_SRC" && composer update --lock --no-install --no-interaction)

    sync_dir "$LARAVEL_SRC" "$LARAVEL_DEST" "${RSYNC_EXCLUDES[@]}"
    echo "$SKELETON_VERSION" > "$LARAVEL_DEST/skeleton.version"
    synced+=("Laravel")
fi

if [[ -d "$SYMFONY_SRC/vendor" ]]; then
    mkdir -p "$SYMFONY_DEST"

    python3 - <<'PY' "$SYMFONY_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/symfony-sandbox"
data["description"] = "Internal Symfony sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Symfony composer.lock after manifest edits..."
    (cd "$SYMFONY_SRC" && composer update --lock --no-install --no-interaction)

    if [[ -f "$SYMFONY_SRC/.env" ]]; then
        python3 - <<'PY' "$SYMFONY_SRC/.env"
import re, sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(
    r'^APP_SECRET=.*$',
    'APP_SECRET=runspace-symfony-sandbox-secret-not-for-production',
    content,
    flags=re.M,
)
content = re.sub(
    r'^DATABASE_URL=.*$',
    'DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"',
    content,
    flags=re.M,
)
with open(path, "w") as f:
    f.write(content)
PY
    fi

    sync_dir "$SYMFONY_SRC" "$SYMFONY_DEST" "${RSYNC_EXCLUDES[@]}"
    echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"
    synced+=("Symfony")
fi

if [[ -d "$EXPRESS_SRC/node_modules" ]]; then
    mkdir -p "$EXPRESS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$EXPRESS_SRC/" "$EXPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$EXPRESS_DEST/skeleton.version"
    synced+=("Express")
fi

if [[ -f "$FLASK_SRC/requirements.txt" ]]; then
    mkdir -p "$FLASK_DEST"
    rsync -a --delete --exclude vendor/ --exclude .venv/ --exclude .git/ "$FLASK_SRC/" "$FLASK_DEST/"
    echo "$SKELETON_VERSION" > "$FLASK_DEST/skeleton.version"
    synced+=("Flask")
fi

if [[ -d "$KOA_SRC/node_modules" ]]; then
    mkdir -p "$KOA_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$KOA_SRC/" "$KOA_DEST/"
    echo "$SKELETON_VERSION" > "$KOA_DEST/skeleton.version"
    synced+=("Koa")
fi

if [[ -d "$HONO_SRC/node_modules" ]]; then
    mkdir -p "$HONO_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$HONO_SRC/" "$HONO_DEST/"
    echo "$SKELETON_VERSION" > "$HONO_DEST/skeleton.version"
    synced+=("Hono")
fi

if [[ -d "$FASTIFY_SRC/node_modules" ]]; then
    mkdir -p "$FASTIFY_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$FASTIFY_SRC/" "$FASTIFY_DEST/"
    echo "$SKELETON_VERSION" > "$FASTIFY_DEST/skeleton.version"
    synced+=("Fastify")
fi

if [[ -d "$NESTJS_SRC/node_modules" ]]; then
    mkdir -p "$NESTJS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$NESTJS_SRC/" "$NESTJS_DEST/"
    echo "$SKELETON_VERSION" > "$NESTJS_DEST/skeleton.version"
    synced+=("NestJS")
fi

if [[ ${#synced[@]} -eq 0 ]]; then
    echo "No framework skeletons found to sync in $GEN." >&2
    exit 1
fi

echo "Synced ${synced[*]} skeletons (version $SKELETON_VERSION)."
