#!/usr/bin/env bash
set -euo pipefail

# Syncs composer-generated skeletons into src-tauri/resources/frameworks/.
# Prefer: npm run prepare:frameworks (generates + syncs automatically).

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${1:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"

if [[ ! -d "$LARAVEL_SRC/vendor" || ! -d "$SYMFONY_SRC/vendor" ]]; then
    echo "Generate skeletons first:" >&2
    echo "  composer create-project laravel/laravel $LARAVEL_SRC \"12.*\"" >&2
    echo "  composer create-project symfony/skeleton $SYMFONY_SRC \"7.4.*\"" >&2
    echo "  (cd $SYMFONY_SRC && composer require webapp)" >&2
    exit 1
fi

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

mkdir -p "$LARAVEL_DEST" "$SYMFONY_DEST"

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

echo "Refreshing composer.lock files after manifest edits..."
(cd "$LARAVEL_SRC" && composer update --lock --no-install --no-interaction)
(cd "$SYMFONY_SRC" && composer update --lock --no-install --no-interaction)

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

rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LARAVEL_SRC/" "$LARAVEL_DEST/"
rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SYMFONY_SRC/" "$SYMFONY_DEST/"

SKELETON_VERSION="${SKELETON_VERSION:-6}"
echo "$SKELETON_VERSION" > "$LARAVEL_DEST/skeleton.version"
echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"

echo "Synced Laravel and Symfony skeletons (version $SKELETON_VERSION)."
