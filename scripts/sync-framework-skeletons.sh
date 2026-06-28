#!/usr/bin/env bash
set -euo pipefail

# Syncs generated framework skeletons into src-tauri/resources/frameworks/.
# Prefer: npm run prepare:frameworks (generates + syncs automatically).

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${1:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
PADRINO_SRC="$GEN/padrino"
KTOR_SRC="$GEN/ktor"
ECHO_SRC="$GEN/echo"
MINIMAL_APIS_SRC="$GEN/minimal-apis"
NANCY_SRC="$GEN/nancy"
FLUTTER_SRC="$GEN/flutter"
EXPO_SRC="$GEN/expo"
GORILLA_MUX_SRC="$GEN/gorilla-mux"
WORDPRESS_SRC="$GEN/wordpress"
SOLIDSTART_SRC="$GEN/solidstart"
JHIPSTER_SRC="$GEN/jhipster"
ROCKET_SRC="$GEN/rocket"
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
PADRINO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/padrino"
KTOR_DEST="$REPO_ROOT/src-tauri/resources/frameworks/ktor"
ECHO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/echo"
MINIMAL_APIS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/minimal-apis"
NANCY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nancy"
FLUTTER_DEST="$REPO_ROOT/src-tauri/resources/frameworks/flutter"
EXPO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/expo"
GORILLA_MUX_DEST="$REPO_ROOT/src-tauri/resources/frameworks/gorilla-mux"
WORDPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/wordpress"
SOLIDSTART_DEST="$REPO_ROOT/src-tauri/resources/frameworks/solidstart"
JHIPSTER_DEST="$REPO_ROOT/src-tauri/resources/frameworks/jhipster"
ROCKET_DEST="$REPO_ROOT/src-tauri/resources/frameworks/rocket"
ACTIX_WEB_DEST="$REPO_ROOT/src-tauri/resources/frameworks/actix-web"
BUFFALO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/buffalo"
DJANGO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/django"
PLAY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/play"
FLASK_DEST="$REPO_ROOT/src-tauri/resources/frameworks/flask"
KOA_DEST="$REPO_ROOT/src-tauri/resources/frameworks/koa"
HONO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/hono"
FASTIFY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/fastify"
NESTJS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nestjs"

RSYNC_EXCLUDES=(
    --exclude vendor/
    --exclude node_modules/
    --exclude site-packages/
    --exclude target/
    --exclude project/target/
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
    --exclude db.sqlite3
    --exclude __pycache__/
)

SKELETON_VERSION="${SKELETON_VERSION:-8}"
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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LARAVEL_SRC/" "$LARAVEL_DEST/"
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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SYMFONY_SRC/" "$SYMFONY_DEST/"
    echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"
    synced+=("Symfony")
fi

if [[ -d "$EXPRESS_SRC/node_modules" ]]; then
    mkdir -p "$EXPRESS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$EXPRESS_SRC/" "$EXPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$EXPRESS_DEST/skeleton.version"
    synced+=("Express")
fi

if [[ -f "$ASPNET_CORE_SRC/RunspaceAspNetSandbox.csproj" ]]; then
    mkdir -p "$ASPNET_CORE_DEST"

    cat > "$ASPNET_CORE_SRC/RunspaceEntryHost.cs" <<'CS'
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace RunspaceAspNetSandbox;

public static class RunspaceEntryHost
{
    public static async Task RunAsync(string entryPath, string[] args)
    {
        var source = await File.ReadAllTextAsync(entryPath);
        var options = ScriptOptions.Default
            .AddReferences(
                typeof(Program).Assembly,
                typeof(WebApplication).Assembly)
            .AddImports(
                "System",
                "Microsoft.AspNetCore.Builder",
                "Microsoft.AspNetCore.Http",
                "Microsoft.AspNetCore.Hosting",
                "Microsoft.Extensions.DependencyInjection",
                "Microsoft.Extensions.Hosting");
        await CSharpScript.RunAsync(source, options);
    }
}
CS

    cat > "$ASPNET_CORE_SRC/Program.cs" <<'CS'
using RunspaceAspNetSandbox;

var entryPath = Environment.GetEnvironmentVariable("RUNSPACE_ENTRY_PATH");
if (!string.IsNullOrEmpty(entryPath) && File.Exists(entryPath))
{
    await RunspaceEntryHost.RunAsync(entryPath, args);
    return;
}

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
CS

    rsync -a --delete \
        --exclude bin/ \
        --exclude obj/ \
        --exclude .git/ \
        "$ASPNET_CORE_SRC/" "$ASPNET_CORE_DEST/"
    echo "$SKELETON_VERSION" > "$ASPNET_CORE_DEST/skeleton.version"
    synced+=("ASP.NET Core")
fi

if [[ -f "$PADRINO_SRC/Gemfile.lock" ]]; then
    mkdir -p "$PADRINO_DEST"

    ruby - <<'RUBY' "$PADRINO_SRC/Gemfile"
gemfile_path = ARGV[0]
content = File.read(gemfile_path)
content = content.sub(/^source .*/, "source 'https://rubygems.org'")
unless content.include?('runspace_padrino_sandbox')
  content = "# Internal Padrino sandbox for Runspace\n" + content
end
File.write(gemfile_path, content)
RUBY

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" --exclude .bundle/ "$PADRINO_SRC/" "$PADRINO_DEST/"
    echo "$SKELETON_VERSION" > "$PADRINO_DEST/skeleton.version"
    synced+=("Padrino")
fi

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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LARAVEL_SRC/" "$LARAVEL_DEST/"
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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SYMFONY_SRC/" "$SYMFONY_DEST/"
    echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"
    synced+=("Symfony")
fi

if [[ -d "$EXPRESS_SRC/node_modules" ]]; then
    mkdir -p "$EXPRESS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$EXPRESS_SRC/" "$EXPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$EXPRESS_DEST/skeleton.version"
    synced+=("Express")
fi

if [[ -f "$ECHO_SRC/go.sum" ]]; then
    mkdir -p "$ECHO_DEST"
    rsync -a --delete --exclude .git/ "$ECHO_SRC/" "$ECHO_DEST/"
    echo "$SKELETON_VERSION" > "$ECHO_DEST/skeleton.version"
    synced+=("Echo")
fi

if [[ ${#synced[@]} -eq 0 ]]; then
    echo "No framework skeletons found to sync in $GEN." >&2
    exit 1
fi

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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LARAVEL_SRC/" "$LARAVEL_DEST/"
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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SYMFONY_SRC/" "$SYMFONY_DEST/"
    echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"
    synced+=("Symfony")
fi

if [[ -d "$EXPRESS_SRC/node_modules" ]]; then
    mkdir -p "$EXPRESS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$EXPRESS_SRC/" "$EXPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$EXPRESS_DEST/skeleton.version"
    synced+=("Express")
fi

if [[ -f "$FLUTTER_SRC/lib/main.dart" ]]; then
    mkdir -p "$FLUTTER_DEST"

    python3 - <<'PY' "$FLUTTER_SRC/pubspec.yaml"
import sys

path = sys.argv[1]
lines = []
with open(path) as f:
    for line in f:
        if line.startswith("name:"):
            lines.append("name: runspace_flutter_sandbox\n")
        elif line.startswith("description:"):
            lines.append("description: Internal Flutter sandbox for Runspace\n")
        else:
            lines.append(line)
with open(path, "w") as f:
    f.writelines(lines)
PY

    echo "Refreshing Flutter pubspec.lock after manifest edits..."
    (cd "$FLUTTER_SRC" && flutter pub get)

    rsync -a --delete \
        --exclude .dart_tool/ \
        --exclude build/ \
        --exclude .git/ \
        "$FLUTTER_SRC/" "$FLUTTER_DEST/"
    echo "$SKELETON_VERSION" > "$FLUTTER_DEST/skeleton.version"
    synced+=("Flutter")
fi

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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LARAVEL_SRC/" "$LARAVEL_DEST/"
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

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SYMFONY_SRC/" "$SYMFONY_DEST/"
    echo "$SKELETON_VERSION" > "$SYMFONY_DEST/skeleton.version"
    synced+=("Symfony")
fi

if [[ -d "$EXPRESS_SRC/node_modules" ]]; then
    mkdir -p "$EXPRESS_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$EXPRESS_SRC/" "$EXPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$EXPRESS_DEST/skeleton.version"
    synced+=("Express")
fi

if [[ -d "$WORDPRESS_SRC/vendor" ]]; then
    mkdir -p "$WORDPRESS_DEST"

    python3 - <<'PY' "$WORDPRESS_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/wordpress-sandbox"
data["description"] = "Internal WordPress sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing WordPress composer.lock after manifest edits..."
    (cd "$WORDPRESS_SRC" && composer update --lock --no-install --no-interaction)

    if [[ -f "$WORDPRESS_SRC/wp-content/wp-sqlite-db/src/db.php" ]]; then
        mkdir -p "$WORDPRESS_SRC/wordpress/wp-content"
        cp "$WORDPRESS_SRC/wp-content/wp-sqlite-db/src/db.php" "$WORDPRESS_SRC/wordpress/wp-content/db.php"
    fi

    cat > "$WORDPRESS_SRC/wp-config.php" <<'PHP'
<?php
define('DB_NAME', 'runspace');
define('DB_USER', 'runspace');
define('DB_PASSWORD', 'runspace');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');
$table_prefix = 'wp_';
define('WP_DEBUG', true);
define('DB_DIR', __DIR__ . '/wordpress/wp-content/database/');
define('DB_FILE', 'runspace.sqlite');
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/wordpress/');
}
require_once ABSPATH . 'wp-settings.php';
PHP

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$WORDPRESS_SRC/" "$WORDPRESS_DEST/"
    echo "$SKELETON_VERSION" > "$WORDPRESS_DEST/skeleton.version"
    synced+=("WordPress")
fi


if [[ -f "$DJANGO_SRC/manage.py" ]]; then
    mkdir -p "$DJANGO_DEST"

    python3 - <<'PY' "$DJANGO_SRC/manage.py"
import sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
prefix = """import sys
from pathlib import Path

_site_packages = Path(__file__).resolve().parent / "site-packages"
if _site_packages.is_dir():
    sys.path.insert(0, str(_site_packages))

"""
if not content.startswith(prefix):
    with open(path, "w") as f:
        f.write(prefix + content)
PY

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$DJANGO_SRC/" "$DJANGO_DEST/"
    echo "$SKELETON_VERSION" > "$DJANGO_DEST/skeleton.version"
    synced+=("Django")
fi

if [[ -f "$PLAY_SRC/build.sbt" ]]; then
    mkdir -p "$PLAY_DEST"
    sync_dir "$PLAY_SRC" "$PLAY_DEST" "${RSYNC_EXCLUDES[@]}"
    echo "$SKELETON_VERSION" > "$PLAY_DEST/skeleton.version"
    synced+=("Play")
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
