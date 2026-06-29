#!/usr/bin/env bash
set -euo pipefail

# Syncs generated framework skeletons into src-tauri/resources/frameworks/.
# Prefer: npm run prepare:frameworks (generates + syncs automatically).

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
framework_dest() {
    local name="$1"
    if [[ -n "${RUNSPACE_USER_FRAMEWORKS_DIR:-}" ]]; then
        echo "$RUNSPACE_USER_FRAMEWORKS_DIR/$name"
    else
        echo "$REPO_ROOT/src-tauri/resources/frameworks/$name"
    fi
}

GEN="${1:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
LUMEN_SRC="$GEN/lumen"
EXPRESS_SRC="$GEN/express"
HANAMI_SRC="$GEN/hanami"
BLAZOR_SRC="$GEN/blazor"
QUART_SRC="$GEN/quart"
IRIS_SRC="$GEN/iris"
PLUG_SRC="$GEN/plug"
MICRONAUT_SRC="$GEN/micronaut"
GRAPE_SRC="$GEN/grape"
WARP_SRC="$GEN/warp"
SALVO_SRC="$GEN/salvo"
BEEGO_SRC="$GEN/beego"
FIBER_SRC="$GEN/fiber"
DROPWIZARD_SRC="$GEN/dropwizard"
GIN_SRC="$GEN/gin"
ADONISJS_SRC="$GEN/adonisjs"
VERTX_SRC="$GEN/vertx"
CAKEPHP_SRC="$GEN/cakephp"
STREAMLIT_SRC="$GEN/streamlit"
SLIM_SRC="$GEN/slim"
PYRAMID_SRC="$GEN/pyramid"
QWIK_SRC="$GEN/qwik"
SANIC_SRC="$GEN/sanic"
DASH_SRC="$GEN/dash"
LAMINAS_SRC="$GEN/laminas"
TORNADO_SRC="$GEN/tornado"
IONIC_SRC="$GEN/ionic"
CAPACITOR_SRC="$GEN/capacitor"
STARLETTE_SRC="$GEN/starlette"
CODEIGNITER_SRC="$GEN/codeigniter"
BOTTLE_SRC="$GEN/bottle"
LITESTAR_SRC="$GEN/litestar"
SPRING_BOOT_SRC="$GEN/spring-boot"
PHOENIX_SRC="$GEN/phoenix"
NEXTJS_SRC="$GEN/nextjs"
NUXT_SRC="$GEN/nuxt"
RAILS_SRC="$GEN/rails"
SINATRA_SRC="$GEN/sinatra"
PADRINO_SRC="$GEN/padrino"
COWBOY_SRC="$GEN/cowboy"
ASPNET_CORE_SRC="$GEN/aspnet-core"
CHI_SRC="$GEN/chi"
YII_SRC="$GEN/yii"
REACT_NATIVE_SRC="$GEN/react-native"
METEOR_SRC="$GEN/meteor"
QUARKUS_SRC="$GEN/quarkus"
ASTRO_SRC="$GEN/astro"
AXUM_SRC="$GEN/axum"
RODA_SRC="$GEN/roda"
REMIX_SRC="$GEN/remix"
SVELTEKIT_SRC="$GEN/sveltekit"
FASTAPI_SRC="$GEN/fastapi"
PHALCON_SRC="$GEN/phalcon"
POEM_SRC="$GEN/poem"
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
LARAVEL_DEST="$(framework_dest laravel)"
SYMFONY_DEST="$(framework_dest symfony)"
LUMEN_DEST="$(framework_dest lumen)"
EXPRESS_DEST="$(framework_dest express)"
HANAMI_DEST="$(framework_dest hanami)"
BLAZOR_DEST="$(framework_dest blazor)"
QUART_DEST="$(framework_dest quart)"
IRIS_DEST="$(framework_dest iris)"
PLUG_DEST="$(framework_dest plug)"
MICRONAUT_DEST="$(framework_dest micronaut)"
GRAPE_DEST="$(framework_dest grape)"
WARP_DEST="$(framework_dest warp)"
SALVO_DEST="$(framework_dest salvo)"
BEEGO_DEST="$(framework_dest beego)"
FIBER_DEST="$(framework_dest fiber)"
DROPWIZARD_DEST="$(framework_dest dropwizard)"
GIN_DEST="$(framework_dest gin)"
ADONISJS_DEST="$(framework_dest adonisjs)"
VERTX_DEST="$(framework_dest vertx)"
CAKEPHP_DEST="$(framework_dest cakephp)"
STREAMLIT_DEST="$(framework_dest streamlit)"
SLIM_DEST="$(framework_dest slim)"
PYRAMID_DEST="$(framework_dest pyramid)"
QWIK_DEST="$(framework_dest qwik)"
SANIC_DEST="$(framework_dest sanic)"
DASH_DEST="$(framework_dest dash)"
LAMINAS_DEST="$(framework_dest laminas)"
TORNADO_DEST="$(framework_dest tornado)"
IONIC_DEST="$(framework_dest ionic)"
CAPACITOR_DEST="$(framework_dest capacitor)"
STARLETTE_DEST="$(framework_dest starlette)"
CODEIGNITER_DEST="$(framework_dest codeigniter)"
BOTTLE_DEST="$(framework_dest bottle)"
LITESTAR_DEST="$(framework_dest litestar)"
SPRING_BOOT_DEST="$(framework_dest spring-boot)"
PHOENIX_DEST="$(framework_dest phoenix)"
NEXTJS_DEST="$(framework_dest nextjs)"
NUXT_DEST="$(framework_dest nuxt)"
RAILS_DEST="$(framework_dest rails)"
SINATRA_DEST="$(framework_dest sinatra)"
PADRINO_DEST="$(framework_dest padrino)"
COWBOY_DEST="$(framework_dest cowboy)"
ASPNET_CORE_DEST="$(framework_dest aspnet-core)"
CHI_DEST="$(framework_dest chi)"
YII_DEST="$(framework_dest yii)"
REACT_NATIVE_DEST="$(framework_dest react-native)"
METEOR_DEST="$(framework_dest meteor)"
QUARKUS_DEST="$(framework_dest quarkus)"
ASTRO_DEST="$(framework_dest astro)"
AXUM_DEST="$(framework_dest axum)"
RODA_DEST="$(framework_dest roda)"
REMIX_DEST="$(framework_dest remix)"
SVELTEKIT_DEST="$(framework_dest sveltekit)"
FASTAPI_DEST="$(framework_dest fastapi)"
PHALCON_DEST="$(framework_dest phalcon)"
POEM_DEST="$(framework_dest poem)"
KTOR_DEST="$(framework_dest ktor)"
ECHO_DEST="$(framework_dest echo)"
MINIMAL_APIS_DEST="$(framework_dest minimal-apis)"
NANCY_DEST="$(framework_dest nancy)"
FLUTTER_DEST="$(framework_dest flutter)"
EXPO_DEST="$(framework_dest expo)"
GORILLA_MUX_DEST="$(framework_dest gorilla-mux)"
WORDPRESS_DEST="$(framework_dest wordpress)"
SOLIDSTART_DEST="$(framework_dest solidstart)"
JHIPSTER_DEST="$(framework_dest jhipster)"
ROCKET_DEST="$(framework_dest rocket)"
ACTIX_WEB_DEST="$(framework_dest actix-web)"
BUFFALO_DEST="$(framework_dest buffalo)"
DJANGO_DEST="$(framework_dest django)"
PLAY_DEST="$(framework_dest play)"
FLASK_DEST="$(framework_dest flask)"
KOA_DEST="$(framework_dest koa)"
HONO_DEST="$(framework_dest hono)"
FASTIFY_DEST="$(framework_dest fastify)"
NESTJS_DEST="$(framework_dest nestjs)"

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

sync_prepared_skeleton() {
    local label="$1"
    local src="$2"
    local dest="$3"

    if [[ -f "$dest/skeleton.version" ]]; then
        return 0
    fi
    if [[ ! -d "$src" ]]; then
        return 0
    fi

    if [[ -f "$src/package.json" && -f "$src/package-lock.json" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude node_modules/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/go.sum" && -s "$src/go.sum" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude vendor/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -d "$src/vendor" ]]; then
        mkdir -p "$dest"
        rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/requirements.txt" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude .venv/ --exclude site-packages/ --exclude __pycache__/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/Cargo.toml" && -f "$src/Cargo.lock" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude target/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/pom.xml" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude target/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/build.gradle.kts" || -f "$src/build.gradle" || -f "$src/build.sbt" ]]; then
        mkdir -p "$dest"
        sync_dir "$src" "$dest" "${RSYNC_EXCLUDES[@]}"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/mix.exs" && -f "$src/mix.lock" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude _build/ --exclude deps/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/Gemfile.lock" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude vendor/bundle/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if compgen -G "$src/*.csproj" >/dev/null || [[ -f "$src/RunspaceBlazorSandbox.csproj" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude bin/ --exclude obj/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
    fi

    if [[ -f "$src/rebar.config" ]]; then
        mkdir -p "$dest"
        rsync -a --delete --exclude _build/ --exclude .git/ "$src/" "$dest/"
        echo "$SKELETON_VERSION" > "$dest/skeleton.version"
        synced+=("$label")
        return 0
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

if [[ -d "$CAKEPHP_SRC/vendor" ]]; then
    mkdir -p "$CAKEPHP_DEST"

    python3 - <<'PY' "$CAKEPHP_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/cakephp-sandbox"
data["description"] = "Internal CakePHP sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing CakePHP composer.lock after manifest edits..."
    (cd "$CAKEPHP_SRC" && composer update --lock --no-install --no-interaction)

    if [[ -f "$CAKEPHP_SRC/config/app_local.php" ]]; then
        python3 - <<'PY' "$CAKEPHP_SRC/config/app_local.php"
import re, sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(
    r"'salt' => env\('SECURITY_SALT', '[^']*'\),",
    "'salt' => env('SECURITY_SALT', 'runspace-cakephp-sandbox-salt-not-for-production'),",
    content,
)
content = re.sub(
    r"'url' => env\('DATABASE_URL', null\),",
    "'url' => env('DATABASE_URL', 'sqlite:///' . ROOT . DS . 'tmp' . DS . 'runspace.db'),",
    content,
)
with open(path, "w") as f:
    f.write(content)
PY
    fi

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$CAKEPHP_SRC/" "$CAKEPHP_DEST/"
    echo "$SKELETON_VERSION" > "$CAKEPHP_DEST/skeleton.version"
    synced+=("CakePHP")
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

if [[ -d "$SLIM_SRC/vendor" ]]; then
    mkdir -p "$SLIM_DEST"

    python3 - <<'PY' "$SLIM_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/slim-sandbox"
data["description"] = "Internal Slim sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Slim composer.lock after manifest edits..."
    (cd "$SLIM_SRC" && composer update --lock --no-install --no-interaction)

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$SLIM_SRC/" "$SLIM_DEST/"
    echo "$SKELETON_VERSION" > "$SLIM_DEST/skeleton.version"
    synced+=("Slim")
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

if [[ -d "$LAMINAS_SRC/vendor" ]]; then
    mkdir -p "$LAMINAS_DEST"

    python3 - <<'PY' "$LAMINAS_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/laminas-sandbox"
data["description"] = "Internal Laminas sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Laminas composer.lock after manifest edits..."
    (cd "$LAMINAS_SRC" && composer update --lock --no-install --no-interaction --ignore-platform-reqs)

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LAMINAS_SRC/" "$LAMINAS_DEST/"
    echo "$SKELETON_VERSION" > "$LAMINAS_DEST/skeleton.version"
    synced+=("Laminas")
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

if [[ -d "$CODEIGNITER_SRC/vendor" ]]; then
    mkdir -p "$CODEIGNITER_DEST"

    python3 - <<'PY' "$CODEIGNITER_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/codeigniter-sandbox"
data["description"] = "Internal CodeIgniter sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing CodeIgniter composer.lock after manifest edits..."
    (cd "$CODEIGNITER_SRC" && composer update --lock --no-install --no-interaction)

    if [[ -f "$CODEIGNITER_SRC/.env" ]]; then
        python3 - <<'PY' "$CODEIGNITER_SRC/.env"
import re, sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(
    r'^#?\s*database\.default\.hostname\s*=.*$',
    '# database.default.hostname = localhost',
    content,
    flags=re.M,
)
content = re.sub(
    r'^#?\s*database\.default\.database\s*=.*$',
    'database.default.database = writable/database.db',
    content,
    flags=re.M,
    count=1,
)
content = re.sub(
    r'^#?\s*database\.default\.username\s*=.*$',
    '# database.default.username = root',
    content,
    flags=re.M,
)
content = re.sub(
    r'^#?\s*database\.default\.password\s*=.*$',
    '# database.default.password = root',
    content,
    flags=re.M,
)
content = re.sub(
    r'^#?\s*database\.default\.DBDriver\s*=.*$',
    'database.default.DBDriver = SQLite3',
    content,
    flags=re.M,
    count=1,
)
with open(path, "w") as f:
    f.write(content)
PY
    fi

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$CODEIGNITER_SRC/" "$CODEIGNITER_DEST/"
    echo "$SKELETON_VERSION" > "$CODEIGNITER_DEST/skeleton.version"
    synced+=("CodeIgniter")
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

if [[ -f "$COWBOY_SRC/_build/default/lib/cowboy/ebin/cowboy.app" ]]; then
    mkdir -p "$COWBOY_DEST"
    rsync -a --delete --exclude _build/ --exclude .git/ "$COWBOY_SRC/" "$COWBOY_DEST/"
    echo "$SKELETON_VERSION" > "$COWBOY_DEST/skeleton.version"
    synced+=("Cowboy")
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

if [[ -d "$YII_SRC/vendor" ]]; then
    mkdir -p "$YII_DEST"

    python3 - <<'PY' "$YII_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/yii-sandbox"
data["description"] = "Internal Yii sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Yii composer.lock after manifest edits..."
    (cd "$YII_SRC" && composer update --lock --no-install --no-interaction)

    python3 - <<'PY' "$YII_SRC/config/db.php"
import re, sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(
    r"'dsn'\s*=>\s*'[^']*'",
    "'dsn' => 'sqlite:' . dirname(__DIR__) . '/runtime/runspace.db'",
    content,
    count=1,
)
content = re.sub(
    r"'username'\s*=>\s*'[^']*'",
    "'username' => ''",
    content,
    count=1,
)
content = re.sub(
    r"'password'\s*=>\s*'[^']*'",
    "'password' => ''",
    content,
    count=1,
)
with open(path, "w") as f:
    f.write(content)
PY

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$YII_SRC/" "$YII_DEST/"
    echo "$SKELETON_VERSION" > "$YII_DEST/skeleton.version"
    synced+=("Yii")
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

if [[ -d "$PHALCON_SRC/vendor" ]]; then
    mkdir -p "$PHALCON_DEST"

    python3 - <<'PY' "$PHALCON_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/phalcon-sandbox"
data["description"] = "Internal Phalcon sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Phalcon composer.lock after manifest edits..."
    (cd "$PHALCON_SRC" && composer update --lock --no-install --no-interaction --ignore-platform-reqs)

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$PHALCON_SRC/" "$PHALCON_DEST/"
    echo "$SKELETON_VERSION" > "$PHALCON_DEST/skeleton.version"
    synced+=("Phalcon")
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

if [[ -d "$LUMEN_SRC/vendor" ]]; then
    mkdir -p "$LUMEN_DEST"

    python3 - <<'PY' "$LUMEN_SRC/composer.json"
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data["name"] = "runspace/lumen-sandbox"
data["description"] = "Internal Lumen sandbox for Runspace"
with open(path, "w") as f:
    json.dump(data, f, indent=4)
    f.write("\n")
PY

    echo "Refreshing Lumen composer.lock after manifest edits..."
    (cd "$LUMEN_SRC" && composer update --lock --no-install --no-interaction)

    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LUMEN_SRC/" "$LUMEN_DEST/"
    echo "$SKELETON_VERSION" > "$LUMEN_DEST/skeleton.version"
    synced+=("Lumen")
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

if [[ -d "$CAPACITOR_SRC/node_modules" ]]; then
    mkdir -p "$CAPACITOR_DEST"
    rsync -a --delete --exclude node_modules/ --exclude .git/ "$CAPACITOR_SRC/" "$CAPACITOR_DEST/"
    echo "$SKELETON_VERSION" > "$CAPACITOR_DEST/skeleton.version"
    synced+=("Capacitor")
fi

if [[ -f "$CHI_SRC/go.sum" ]]; then
    mkdir -p "$CHI_DEST"
    rsync -a --delete --exclude vendor/ --exclude .git/ "$CHI_SRC/" "$CHI_DEST/"
    echo "$SKELETON_VERSION" > "$CHI_DEST/skeleton.version"
    synced+=("Chi")
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


# Sync any prepared skeleton not handled by a dedicated block above.
sync_prepared_skeleton "Laravel" "$LARAVEL_SRC" "$LARAVEL_DEST"
sync_prepared_skeleton "Symfony" "$SYMFONY_SRC" "$SYMFONY_DEST"
sync_prepared_skeleton "Lumen" "$LUMEN_SRC" "$LUMEN_DEST"
sync_prepared_skeleton "Express" "$EXPRESS_SRC" "$EXPRESS_DEST"
sync_prepared_skeleton "Hanami" "$HANAMI_SRC" "$HANAMI_DEST"
sync_prepared_skeleton "Blazor" "$BLAZOR_SRC" "$BLAZOR_DEST"
sync_prepared_skeleton "Quart" "$QUART_SRC" "$QUART_DEST"
sync_prepared_skeleton "Iris" "$IRIS_SRC" "$IRIS_DEST"
sync_prepared_skeleton "Plug" "$PLUG_SRC" "$PLUG_DEST"
sync_prepared_skeleton "Micronaut" "$MICRONAUT_SRC" "$MICRONAUT_DEST"
sync_prepared_skeleton "Grape" "$GRAPE_SRC" "$GRAPE_DEST"
sync_prepared_skeleton "Warp" "$WARP_SRC" "$WARP_DEST"
sync_prepared_skeleton "Salvo" "$SALVO_SRC" "$SALVO_DEST"
sync_prepared_skeleton "Beego" "$BEEGO_SRC" "$BEEGO_DEST"
sync_prepared_skeleton "Fiber" "$FIBER_SRC" "$FIBER_DEST"
sync_prepared_skeleton "Dropwizard" "$DROPWIZARD_SRC" "$DROPWIZARD_DEST"
sync_prepared_skeleton "Gin" "$GIN_SRC" "$GIN_DEST"
sync_prepared_skeleton "Adonisjs" "$ADONISJS_SRC" "$ADONISJS_DEST"
sync_prepared_skeleton "Vertx" "$VERTX_SRC" "$VERTX_DEST"
sync_prepared_skeleton "CakePHP" "$CAKEPHP_SRC" "$CAKEPHP_DEST"
sync_prepared_skeleton "Streamlit" "$STREAMLIT_SRC" "$STREAMLIT_DEST"
sync_prepared_skeleton "Slim" "$SLIM_SRC" "$SLIM_DEST"
sync_prepared_skeleton "Pyramid" "$PYRAMID_SRC" "$PYRAMID_DEST"
sync_prepared_skeleton "Qwik" "$QWIK_SRC" "$QWIK_DEST"
sync_prepared_skeleton "Sanic" "$SANIC_SRC" "$SANIC_DEST"
sync_prepared_skeleton "Dash" "$DASH_SRC" "$DASH_DEST"
sync_prepared_skeleton "Laminas" "$LAMINAS_SRC" "$LAMINAS_DEST"
sync_prepared_skeleton "Tornado" "$TORNADO_SRC" "$TORNADO_DEST"
sync_prepared_skeleton "Ionic" "$IONIC_SRC" "$IONIC_DEST"
sync_prepared_skeleton "Capacitor" "$CAPACITOR_SRC" "$CAPACITOR_DEST"
sync_prepared_skeleton "Starlette" "$STARLETTE_SRC" "$STARLETTE_DEST"
sync_prepared_skeleton "CodeIgniter" "$CODEIGNITER_SRC" "$CODEIGNITER_DEST"
sync_prepared_skeleton "Bottle" "$BOTTLE_SRC" "$BOTTLE_DEST"
sync_prepared_skeleton "Litestar" "$LITESTAR_SRC" "$LITESTAR_DEST"
sync_prepared_skeleton "Spring Boot" "$SPRING_BOOT_SRC" "$SPRING_BOOT_DEST"
sync_prepared_skeleton "Phoenix" "$PHOENIX_SRC" "$PHOENIX_DEST"
sync_prepared_skeleton "Next.js" "$NEXTJS_SRC" "$NEXTJS_DEST"
sync_prepared_skeleton "Nuxt" "$NUXT_SRC" "$NUXT_DEST"
sync_prepared_skeleton "Rails" "$RAILS_SRC" "$RAILS_DEST"
sync_prepared_skeleton "Sinatra" "$SINATRA_SRC" "$SINATRA_DEST"
sync_prepared_skeleton "Padrino" "$PADRINO_SRC" "$PADRINO_DEST"
sync_prepared_skeleton "Cowboy" "$COWBOY_SRC" "$COWBOY_DEST"
sync_prepared_skeleton "ASP.NET Core" "$ASPNET_CORE_SRC" "$ASPNET_CORE_DEST"
sync_prepared_skeleton "Chi" "$CHI_SRC" "$CHI_DEST"
sync_prepared_skeleton "Yii" "$YII_SRC" "$YII_DEST"
sync_prepared_skeleton "React Native" "$REACT_NATIVE_SRC" "$REACT_NATIVE_DEST"
sync_prepared_skeleton "Meteor" "$METEOR_SRC" "$METEOR_DEST"
sync_prepared_skeleton "Quarkus" "$QUARKUS_SRC" "$QUARKUS_DEST"
sync_prepared_skeleton "Astro" "$ASTRO_SRC" "$ASTRO_DEST"
sync_prepared_skeleton "Axum" "$AXUM_SRC" "$AXUM_DEST"
sync_prepared_skeleton "Roda" "$RODA_SRC" "$RODA_DEST"
sync_prepared_skeleton "Remix" "$REMIX_SRC" "$REMIX_DEST"
sync_prepared_skeleton "SvelteKit" "$SVELTEKIT_SRC" "$SVELTEKIT_DEST"
sync_prepared_skeleton "FastAPI" "$FASTAPI_SRC" "$FASTAPI_DEST"
sync_prepared_skeleton "Phalcon" "$PHALCON_SRC" "$PHALCON_DEST"
sync_prepared_skeleton "Poem" "$POEM_SRC" "$POEM_DEST"
sync_prepared_skeleton "Ktor" "$KTOR_SRC" "$KTOR_DEST"
sync_prepared_skeleton "Echo" "$ECHO_SRC" "$ECHO_DEST"
sync_prepared_skeleton "Minimal APIs" "$MINIMAL_APIS_SRC" "$MINIMAL_APIS_DEST"
sync_prepared_skeleton "Nancy" "$NANCY_SRC" "$NANCY_DEST"
sync_prepared_skeleton "Flutter" "$FLUTTER_SRC" "$FLUTTER_DEST"
sync_prepared_skeleton "Expo" "$EXPO_SRC" "$EXPO_DEST"
sync_prepared_skeleton "Gorilla Mux" "$GORILLA_MUX_SRC" "$GORILLA_MUX_DEST"
sync_prepared_skeleton "WordPress" "$WORDPRESS_SRC" "$WORDPRESS_DEST"
sync_prepared_skeleton "SolidStart" "$SOLIDSTART_SRC" "$SOLIDSTART_DEST"
sync_prepared_skeleton "JHipster" "$JHIPSTER_SRC" "$JHIPSTER_DEST"
sync_prepared_skeleton "Rocket" "$ROCKET_SRC" "$ROCKET_DEST"
sync_prepared_skeleton "Actix Web" "$ACTIX_WEB_SRC" "$ACTIX_WEB_DEST"
sync_prepared_skeleton "Buffalo" "$BUFFALO_SRC" "$BUFFALO_DEST"
sync_prepared_skeleton "Django" "$DJANGO_SRC" "$DJANGO_DEST"
sync_prepared_skeleton "Play" "$PLAY_SRC" "$PLAY_DEST"
sync_prepared_skeleton "Flask" "$FLASK_SRC" "$FLASK_DEST"
sync_prepared_skeleton "Koa" "$KOA_SRC" "$KOA_DEST"
sync_prepared_skeleton "Hono" "$HONO_SRC" "$HONO_DEST"
sync_prepared_skeleton "Fastify" "$FASTIFY_SRC" "$FASTIFY_DEST"
sync_prepared_skeleton "NestJS" "$NESTJS_SRC" "$NESTJS_DEST"

if [[ ${#synced[@]} -eq 0 ]]; then
    echo "No framework skeletons found to sync in $GEN." >&2
    exit 1
fi

echo "Synced ${synced[*]} skeletons (version $SKELETON_VERSION)."
