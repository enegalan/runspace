#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
IRIS_SRC="$GEN/iris"
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
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
IRIS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/iris"
COWBOY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/cowboy"
ASPNET_CORE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/aspnet-core"
CHI_DEST="$REPO_ROOT/src-tauri/resources/frameworks/chi"
YII_DEST="$REPO_ROOT/src-tauri/resources/frameworks/yii"
REACT_NATIVE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/react-native"
METEOR_DEST="$REPO_ROOT/src-tauri/resources/frameworks/meteor"
QUARKUS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/quarkus"
ASTRO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/astro"
AXUM_DEST="$REPO_ROOT/src-tauri/resources/frameworks/axum"
RODA_DEST="$REPO_ROOT/src-tauri/resources/frameworks/roda"
REMIX_DEST="$REPO_ROOT/src-tauri/resources/frameworks/remix"
SVELTEKIT_DEST="$REPO_ROOT/src-tauri/resources/frameworks/sveltekit"
FASTAPI_DEST="$REPO_ROOT/src-tauri/resources/frameworks/fastapi"
PHALCON_DEST="$REPO_ROOT/src-tauri/resources/frameworks/phalcon"
POEM_DEST="$REPO_ROOT/src-tauri/resources/frameworks/poem"
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

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
IRIS_VERSION="${RUNSPACE_IRIS_VERSION:-v12.2.11}"
COWBOY_VERSION="${RUNSPACE_COWBOY_VERSION:-2.13.0}"
ASPNET_CORE_PROJECT="${RUNSPACE_ASPNET_CORE_PROJECT:-RunspaceAspNetSandbox}"
ASPNET_CORE_SCRIPTING_PACKAGE="${RUNSPACE_ASPNET_CORE_SCRIPTING_PACKAGE:-Microsoft.CodeAnalysis.CSharp.Scripting}"
CHI_MODULE="${RUNSPACE_CHI_MODULE:-github.com/go-chi/chi/v5}"
CHI_VERSION="${RUNSPACE_CHI_VERSION:-v5.2.1}"
YII_PROJECT="${RUNSPACE_YII_PROJECT:-yiisoft/yii2-app-basic}"
YII_VERSION="${RUNSPACE_YII_VERSION:-2.0.*}"
REACT_NATIVE_VERSION="${RUNSPACE_REACT_NATIVE_VERSION:-^0.79.0}"
METEOR_VERSION="${RUNSPACE_METEOR_VERSION:-^3.4.0}"
ASTRO_VERSION="${RUNSPACE_ASTRO_VERSION:-^5.0.0}"
AXUM_VERSION="${RUNSPACE_AXUM_VERSION:-0.8}"
RODA_VERSION="${RUNSPACE_RODA_VERSION:-~> 3.87}"
REMIX_VERSION="${RUNSPACE_REMIX_VERSION:-^2.17.0}"
PHALCON_VERSION="${RUNSPACE_PHALCON_VERSION:-1.*}"
PHALCON_PROJECT="${RUNSPACE_PHALCON_PROJECT:-phalcon-kit/app}"
POEM_VERSION="${RUNSPACE_POEM_VERSION:-3.1.12}"
KTOR_GRADLE_VERSION="${RUNSPACE_KTOR_GRADLE_VERSION:-8.12}"
ECHO_VERSION="${RUNSPACE_ECHO_VERSION:-v4.13.3}"
ECHO_MODULE="${RUNSPACE_ECHO_MODULE:-github.com/labstack/echo/v4}"
MINIMAL_APIS_PROJECT="${RUNSPACE_MINIMAL_APIS_PROJECT:-RunspaceMinimalApisSandbox}"
NANCY_ROSLYN_VERSION="${RUNSPACE_NANCY_ROSLYN_VERSION:-4.14.0}"
NANCY_OWIN_VERSION="${RUNSPACE_NANCY_OWIN_VERSION:-3.1.2}"
NANCY_VERSION="${RUNSPACE_NANCY_VERSION:-2.0.0}"
FLUTTER_PROJECT="${RUNSPACE_FLUTTER_PROJECT:-runspace_flutter_sandbox}"
EXPO_VERSION="${RUNSPACE_EXPO_VERSION:-^52.0.0}"
GORILLA_MUX_VERSION="${RUNSPACE_GORILLA_MUX_VERSION:-v1.8.1}"
WORDPRESS_VERSION="${RUNSPACE_WORDPRESS_VERSION:-6.*}"
WORDPRESS_PROJECT="${RUNSPACE_WORDPRESS_PROJECT:-johnpbloch/wordpress}"
SOLIDSTART_VERSION="${RUNSPACE_SOLIDSTART_VERSION:-^1.3.0}"
JHISTER_VERSION="${RUNSPACE_JHIPSTER_VERSION:-8.8.0}"
ROCKET_VERSION="${RUNSPACE_ROCKET_VERSION:-0.5.1}"
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
iris_ready() {
    [[ -f "$IRIS_DEST/go.mod" ]] &&
        [[ -f "$IRIS_DEST/go.sum" ]] &&
        [[ -f "$IRIS_DEST/skeleton.version" ]]
}
cowboy_ready() {
    [[ -f "$COWBOY_DEST/rebar.config" ]] &&
        [[ -f "$COWBOY_DEST/rebar.lock" ]] &&
        [[ -f "$COWBOY_DEST/skeleton.version" ]]
}
chi_ready() {
    [[ -f "$CHI_DEST/go.mod" ]] &&
        [[ -f "$CHI_DEST/go.sum" ]] &&
        [[ -f "$CHI_DEST/skeleton.version" ]]
}
yii_ready() {
    [[ -f "$YII_DEST/yii" ]] &&
        [[ -f "$YII_DEST/composer.lock" ]] &&
        [[ -f "$YII_DEST/skeleton.version" ]]
}
meteor_ready() {
    [[ -f "$METEOR_DEST/package.json" ]] &&
        [[ -f "$METEOR_DEST/package-lock.json" ]] &&
        [[ -f "$METEOR_DEST/skeleton.version" ]]
}
quarkus_ready() {
    [[ -f "$QUARKUS_DEST/pom.xml" ]] &&
        [[ -f "$QUARKUS_DEST/skeleton.version" ]]
}
astro_ready() {
    [[ -f "$ASTRO_DEST/package.json" ]] &&
        [[ -f "$ASTRO_DEST/package-lock.json" ]] &&
        [[ -f "$ASTRO_DEST/skeleton.version" ]]
}
axum_ready() {
    [[ -f "$AXUM_DEST/Cargo.toml" ]] &&
        [[ -f "$AXUM_DEST/Cargo.lock" ]] &&
        [[ -f "$AXUM_DEST/skeleton.version" ]]
}
roda_ready() {
    [[ -f "$RODA_DEST/Gemfile" ]] &&
        [[ -f "$RODA_DEST/Gemfile.lock" ]] &&
        [[ -f "$RODA_DEST/skeleton.version" ]]
}
remix_ready() {
    [[ -f "$REMIX_DEST/package.json" ]] &&
        [[ -f "$REMIX_DEST/package-lock.json" ]] &&
        [[ -f "$REMIX_DEST/skeleton.version" ]]
}
sveltekit_ready() {
    [[ -f "$SVELTEKIT_DEST/package.json" ]] &&
        [[ -f "$SVELTEKIT_DEST/package-lock.json" ]] &&
        [[ -f "$SVELTEKIT_DEST/skeleton.version" ]]
}
fastapi_ready() {
    [[ -f "$FASTAPI_DEST/requirements.txt" ]] &&
        [[ -f "$FASTAPI_DEST/skeleton.version" ]]
}
phalcon_ready() {
    [[ -f "$PHALCON_DEST/composer.lock" ]] &&
        [[ -f "$PHALCON_DEST/public/index.php" ]] &&
        [[ -f "$PHALCON_DEST/skeleton.version" ]]
}
poem_ready() {
    [[ -f "$POEM_DEST/Cargo.toml" ]] &&
        [[ -f "$POEM_DEST/Cargo.lock" ]] &&
        [[ -f "$POEM_DEST/skeleton.version" ]]
}
ktor_ready() {
    [[ -f "$KTOR_DEST/build.gradle.kts" ]] &&
        [[ -f "$KTOR_DEST/gradle/wrapper/gradle-wrapper.properties" ]] &&
        [[ -f "$KTOR_DEST/skeleton.version" ]]
}
echo_ready() {
    [[ -f "$ECHO_DEST/go.mod" ]] &&
        [[ -f "$ECHO_DEST/go.sum" ]] &&
        [[ -f "$ECHO_DEST/skeleton.version" ]]
}
nancy_ready() {
    [[ -f "$NANCY_DEST/RunspaceNancySandbox.csproj" ]] &&
        [[ -f "$NANCY_DEST/Program.cs" ]] &&
        [[ -f "$NANCY_DEST/skeleton.version" ]]
}
flutter_ready() {
    [[ -f "$FLUTTER_DEST/pubspec.yaml" ]] &&
        [[ -f "$FLUTTER_DEST/pubspec.lock" ]] &&
        [[ -f "$FLUTTER_DEST/skeleton.version" ]]
}
expo_ready() {
    [[ -f "$EXPO_DEST/package.json" ]] &&
        [[ -f "$EXPO_DEST/package-lock.json" ]] &&
        [[ -f "$EXPO_DEST/skeleton.version" ]]
}
wordpress_ready() {
    [[ -f "$WORDPRESS_DEST/composer.lock" ]] &&
        [[ -f "$WORDPRESS_DEST/wp-config.php" ]] &&
        [[ -f "$WORDPRESS_DEST/skeleton.version" ]]
}
solidstart_ready() {
    [[ -f "$SOLIDSTART_DEST/package.json" ]] &&
        [[ -f "$SOLIDSTART_DEST/package-lock.json" ]] &&
        [[ -f "$SOLIDSTART_DEST/skeleton.version" ]]
}
jhipster_ready() {
    [[ -f "$JHISTER_DEST/pom.xml" ]] &&
        [[ -f "$JHISTER_DEST/skeleton.version" ]]
}
rocket_ready() {
    [[ -f "$ROCKET_DEST/Cargo.toml" ]] &&
        [[ -f "$ROCKET_DEST/Cargo.lock" ]] &&
        [[ -f "$ROCKET_DEST/skeleton.version" ]]
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
needs_iris=false
needs_cowboy=false
needs_aspnet-core=false
needs_chi=false
needs_yii=false
needs_react-native=false
needs_meteor=false
needs_quarkus=false
needs_astro=false
needs_axum=false
needs_roda=false
needs_remix=false
needs_sveltekit=false
needs_fastapi=false
needs_phalcon=false
needs_poem=false
needs_ktor=false
needs_echo=false
needs_minimal-apis=false
needs_nancy=false
needs_flutter=false
needs_expo=false
needs_gorilla-mux=false
needs_wordpress=false
needs_solidstart=false
needs_jhipster=false
needs_rocket=false
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
if force_sync || ! iris_ready; then
    needs_iris=true
fi
if force_sync || ! cowboy_ready; then
    needs_cowboy=true
fi
if force_sync || ! chi_ready; then
    needs_chi=true
fi
if force_sync || ! yii_ready; then
    needs_yii=true
fi
if force_sync || ! meteor_ready; then
    needs_meteor=true
fi
if force_sync || ! quarkus_ready; then
    needs_quarkus=true
fi
if force_sync || ! astro_ready; then
    needs_astro=true
fi
if force_sync || ! axum_ready; then
    needs_axum=true
fi
if force_sync || ! roda_ready; then
    needs_roda=true
fi
if force_sync || ! remix_ready; then
    needs_remix=true
fi
if force_sync || ! sveltekit_ready; then
    needs_sveltekit=true
fi
if force_sync || ! fastapi_ready; then
    needs_fastapi=true
fi
if force_sync || ! phalcon_ready; then
    needs_phalcon=true
fi
if force_sync || ! poem_ready; then
    needs_poem=true
fi
if force_sync || ! ktor_ready; then
    needs_ktor=true
fi
if force_sync || ! echo_ready; then
    needs_echo=true
fi
if force_sync || ! nancy_ready; then
    needs_nancy=true
fi
if force_sync || ! flutter_ready; then
    needs_flutter=true
fi
if force_sync || ! expo_ready; then
    needs_expo=true
fi
if force_sync || ! wordpress_ready; then
    needs_wordpress=true
fi
if force_sync || ! solidstart_ready; then
    needs_solidstart=true
fi
if force_sync || ! jhipster_ready; then
    needs_jhipster=true
fi
if force_sync || ! rocket_ready; then
    needs_rocket=true
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

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_django && ! $needs_play && ! $needs_flask && ! $needs_koa && ! $needs_hono && ! $needs_fastify && ! $needs_nestjs && ! $needs_buffalo && ! $needs_actix-web && ! $needs_rocket && ! $needs_jhipster && ! $needs_solidstart && ! $needs_wordpress && ! $needs_gorilla-mux && ! $needs_expo && ! $needs_flutter && ! $needs_nancy && ! $needs_minimal-apis && ! $needs_echo && ! $needs_ktor && ! $needs_poem && ! $needs_phalcon && ! $needs_fastapi && ! $needs_sveltekit && ! $needs_remix && ! $needs_roda && ! $needs_axum && ! $needs_astro && ! $needs_quarkus && ! $needs_meteor && ! $needs_react-native && ! $needs_yii && ! $needs_chi && ! $needs_aspnet-core && ! $needs_cowboy && ! $needs_iris; then
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
if $needs_iris && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Iris skeleton." >&2
    exit 1
fi

if $needs_cowboy && ! command -v rebar3 >/dev/null 2>&1; then
    echo "rebar3 is required to prepare the Cowboy skeleton." >&2
    exit 1
fi

if $needs_chi && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Chi skeleton." >&2
    exit 1
fi

if $needs_quarkus && ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to prepare the Quarkus skeleton." >&2
    exit 1
fi

if $needs_astro && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Astro skeleton." >&2
    exit 1
fi

if $needs_axum && ! command -v cargo >/dev/null 2>&1; then
    echo "cargo is required to prepare the Axum skeleton." >&2
    exit 1
fi

if $needs_roda && ! command -v bundle >/dev/null 2>&1; then
    echo "Bundler is required to prepare the Roda skeleton." >&2
    echo "Install Ruby and Bundler, then run:" >&2
    echo "  gem install bundler" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_sveltekit && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the SvelteKit skeleton." >&2
    exit 1
fi

if $needs_fastapi && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the FastAPI skeleton." >&2
    exit 1
fi

if $needs_poem && ! command -v cargo >/dev/null 2>&1; then
    echo "Cargo is required to prepare the Poem skeleton." >&2
    exit 1
fi

if $needs_ktor && ! command -v gradle >/dev/null 2>&1; then
    echo "Gradle is required to prepare the Ktor skeleton." >&2
    exit 1
fi

if $needs_echo && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Echo skeleton." >&2
    exit 1
fi

if $needs_nancy && ! command -v dotnet >/dev/null 2>&1; then
    echo "The .NET SDK is required to prepare the Nancy skeleton." >&2
    exit 1
fi

if $needs_flutter && ! command -v flutter >/dev/null 2>&1; then
    echo "Flutter is required to prepare the Flutter skeleton." >&2
    exit 1
fi

if $needs_expo && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Expo skeleton." >&2
    exit 1
fi

if $needs_jhipster && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the JHipster skeleton." >&2
    exit 1
fi

if $needs_rocket && ! command -v cargo >/dev/null 2>&1; then
    echo "Cargo is required to prepare the Rocket skeleton." >&2
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
if $needs_iris && [[ ! -f "$IRIS_SRC/go.mod" ]]; then
    echo "Generating Iris skeleton..."
    rm -rf "$IRIS_SRC"
    mkdir -p "$IRIS_SRC"
    (
        cd "$IRIS_SRC"
        go mod init runspace/iris-sandbox
        go get "github.com/kataras/iris/v12@${IRIS_VERSION}"
    )
fi

if $needs_cowboy && [[ ! -f "$COWBOY_SRC/_build/default/lib/cowboy/ebin/cowboy.app" ]]; then
    echo "Generating Cowboy skeleton..."
    rm -rf "$COWBOY_SRC"
    mkdir -p "$COWBOY_SRC"
    cat > "$COWBOY_SRC/rebar.config" <<EOF
{erl_opts, [debug_info]}.
{deps, [
    {cowboy, "$COWBOY_VERSION"}
]}.
EOF
    (cd "$COWBOY_SRC" && rebar3 compile)
fi

if $needs_chi && [[ ! -f "$CHI_SRC/go.sum" ]]; then
    echo "Generating Chi skeleton..."
    rm -rf "$CHI_SRC"
    mkdir -p "$CHI_SRC"
    (
        cd "$CHI_SRC"
        go mod init github.com/runspace/chi-sandbox
        go get "${CHI_MODULE}@${CHI_VERSION}"
        go mod tidy
        go mod vendor
    )
fi

if $needs_yii && [[ ! -d "$YII_SRC/vendor" ]]; then
    echo "Generating Yii skeleton..."
    rm -rf "$YII_SRC"
    composer create-project "$YII_PROJECT" "$YII_SRC" "$YII_VERSION" --no-interaction
fi

if $needs_meteor && [[ ! -d "$METEOR_SRC/node_modules" ]]; then
    echo "Generating Meteor skeleton..."
    rm -rf "$METEOR_SRC"
    mkdir -p "$METEOR_SRC"
    (
        cd "$METEOR_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/meteor-sandbox"
        npm pkg set description="Internal Meteor sandbox for Runspace"
        npm pkg set private=true
        npm install "meteor@${METEOR_VERSION}" --save
    )
fi

if $needs_quarkus && [[ ! -f "$QUARKUS_SRC/pom.xml" ]]; then
    echo "Generating Quarkus skeleton..."
    rm -rf "$QUARKUS_SRC"
    mkdir -p "$QUARKUS_SRC"
    curl -sSfLo "$GEN/quarkus.zip" \
        "https://code.quarkus.io/api/download" \
        -G \
        --data-urlencode "g=${QUARKUS_GROUP_ID}" \
        --data-urlencode "a=${QUARKUS_ARTIFACT_ID}" \
        --data-urlencode "e=${QUARKUS_EXTENSIONS}"
    unzip -q "$GEN/quarkus.zip" -d "$QUARKUS_SRC"
    rm -f "$GEN/quarkus.zip"
fi

if $needs_astro && [[ ! -d "$ASTRO_SRC/node_modules" ]]; then
    echo "Generating Astro skeleton..."
    rm -rf "$ASTRO_SRC"
    mkdir -p "$ASTRO_SRC"
    (
        cd "$ASTRO_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/astro-sandbox"
        npm pkg set description="Internal Astro sandbox for Runspace"
        npm pkg set private=true
        npm pkg set type=module
        npm install "astro@${ASTRO_VERSION}" --save
    )
fi

if $needs_axum && [[ ! -f "$AXUM_SRC/Cargo.lock" ]]; then
    echo "Generating Axum skeleton..."
    rm -rf "$AXUM_SRC"
    mkdir -p "$AXUM_SRC/src/bin"
    cat > "$AXUM_SRC/Cargo.toml" <<EOF
[package]
name = "runspace-axum-sandbox"
version = "0.1.0"
edition = "2021"
publish = false
description = "Internal Axum sandbox for Runspace"

[dependencies]
axum = "${AXUM_VERSION}"
tokio = { version = "1", features = ["macros", "rt-multi-thread", "net"] }

[[bin]]
name = "runspace-entry"
path = "src/bin/runspace_entry.rs"
EOF
    cat > "$AXUM_SRC/build.rs" <<'EOF'
fn main() {
    let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| {
        let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
        format!("{manifest_dir}/src/stub_entry.rs")
    });
    println!("cargo:rerun-if-env-changed=RUNSPACE_ENTRY_PATH");
    println!("cargo:rustc-env=RUNSPACE_ENTRY_PATH={entry}");
}
EOF
    cat > "$AXUM_SRC/src/stub_entry.rs" <<'EOF'
fn main() {
    println!("Runspace Axum sandbox");
}
EOF
    cat > "$AXUM_SRC/src/bin/runspace_entry.rs" <<'EOF'
include!(env!("RUNSPACE_ENTRY_PATH"));
EOF
    (
        cd "$AXUM_SRC"
        cargo fetch --locked 2>/dev/null || cargo fetch
        RUNSPACE_ENTRY_PATH="$AXUM_SRC/src/stub_entry.rs" cargo build --quiet --bin runspace-entry
    )
fi

if $needs_roda && [[ ! -f "$RODA_SRC/.bundle/config" ]]; then
    echo "Generating Roda skeleton..."
    rm -rf "$RODA_SRC"
    mkdir -p "$RODA_SRC"
    cat > "$RODA_SRC/Gemfile" <<EOF
source "https://rubygems.org"

gem "roda", "$RODA_VERSION"
EOF
    (
        cd "$RODA_SRC"
        bundle config set --local path 'vendor/bundle'
        bundle install
    )
fi

if $needs_remix && [[ ! -d "$REMIX_SRC/node_modules" ]]; then
    echo "Generating Remix skeleton..."
    rm -rf "$REMIX_SRC"
    mkdir -p "$REMIX_SRC"
    (
        cd "$REMIX_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/remix-sandbox"
        npm pkg set description="Internal Remix sandbox for Runspace"
        npm pkg set private=true
        npm install "@remix-run/node@${REMIX_VERSION}" "@remix-run/react@${REMIX_VERSION}" react react-dom --save
    )
fi

if $needs_sveltekit && [[ ! -d "$SVELTEKIT_SRC/node_modules" ]]; then
    echo "Generating SvelteKit skeleton..."
    rm -rf "$SVELTEKIT_SRC"
    mkdir -p "$(dirname "$SVELTEKIT_SRC")"
    npx sv create "$SVELTEKIT_SRC" \
        --template "$SVELTEKIT_TEMPLATE" \
        --types "$SVELTEKIT_TYPES" \
        --no-add-ons \
        --no-install \
        --no-dir-check \
        --no-download-check
    (
        cd "$SVELTEKIT_SRC"
        npm pkg set name="@runspace/sveltekit-sandbox"
        npm pkg set description="Internal SvelteKit sandbox for Runspace"
        npm pkg set private=true
        npm install --no-audit --no-fund
    )
fi

if $needs_fastapi && [[ ! -f "$FASTAPI_SRC/requirements.txt" ]]; then
    echo "Generating FastAPI skeleton..."
    rm -rf "$FASTAPI_SRC"
    mkdir -p "$FASTAPI_SRC"
    (
        cd "$FASTAPI_SRC"
        python3 -m pip install fastapi "uvicorn[standard]" \
            --target site-packages \
            --no-warn-script-location \
            --disable-pip-version-check
        python3 - <<'PY' > requirements.txt
import sys
sys.path.insert(0, "site-packages")
import fastapi
import uvicorn
print(f"fastapi=={fastapi.__version__}")
print(f"uvicorn[standard]=={uvicorn.__version__}")
PY
    )
fi

if $needs_phalcon && [[ ! -d "$PHALCON_SRC/vendor" ]]; then
    echo "Generating Phalcon skeleton..."
    rm -rf "$PHALCON_SRC"
    composer create-project "$PHALCON_PROJECT" "$PHALCON_SRC" "$PHALCON_VERSION" \
        --no-interaction --ignore-platform-reqs
fi

if $needs_poem && [[ ! -f "$POEM_SRC/Cargo.lock" ]]; then
    echo "Generating Poem skeleton..."
    rm -rf "$POEM_SRC"
    cargo new "$POEM_SRC" --name runspace_poem_sandbox --bin
    cat > "$POEM_SRC/Cargo.toml" <<EOF
[package]
name = "runspace-poem-sandbox"
version = "0.1.0"
edition = "2021"
build = "build.rs"
publish = false

[[bin]]
name = "runspace_entry"
path = "src/main.rs"

[dependencies]
poem = "${POEM_VERSION}"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
EOF
    cat > "$POEM_SRC/build.rs" <<'EOF'
fn main() {
    println!("cargo:rerun-if-env-changed=RUNSPACE_ENTRY_PATH");
    let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| {
        std::path::PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("stub_entry.rs")
            .to_string_lossy()
            .to_string()
    });
    println!("cargo:rustc-env=RUNSPACE_ENTRY={entry}");
}
EOF
    cat > "$POEM_SRC/src/stub_entry.rs" <<'EOF'
use poem::{get, handler, listener::TcpListener, Route, Server};

#[handler]
fn index() -> &'static str {
    "Runspace Poem sandbox"
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let app = Route::new().at("/", get(index));
    Server::new(TcpListener::bind("127.0.0.1:3000"))
        .run(app)
        .await
}
EOF
    cat > "$POEM_SRC/src/main.rs" <<'EOF'
include!(env!("RUNSPACE_ENTRY"));
EOF
    (cd "$POEM_SRC" && cargo build --quiet)
fi

if $needs_ktor && [[ ! -f "$KTOR_SRC/build/runspace-deps.ready" ]]; then
    echo "Generating Ktor skeleton..."
    rm -rf "$KTOR_SRC"
    mkdir -p "$KTOR_SRC"
    cp "$KTOR_TEMPLATE/build.gradle.kts" "$KTOR_SRC/build.gradle.kts"
    cp "$KTOR_TEMPLATE/settings.gradle.kts" "$KTOR_SRC/settings.gradle.kts"
    cp "$KTOR_TEMPLATE/gradle.properties" "$KTOR_SRC/gradle.properties"
    (
        cd "$KTOR_SRC"
        gradle wrapper --gradle-version "$KTOR_GRADLE_VERSION"
        ./gradlew runspaceResolveDeps --quiet --console=plain
    )
fi

if $needs_echo && [[ ! -f "$ECHO_SRC/go.sum" ]]; then
    echo "Generating Echo skeleton..."
    rm -rf "$ECHO_SRC"
    mkdir -p "$ECHO_SRC"
    (
        cd "$ECHO_SRC"
        go mod init github.com/runspace/echo-sandbox
        go get "${ECHO_MODULE}@${ECHO_VERSION}"
        go mod tidy
    )
fi

if $needs_nancy && [[ ! -f "$NANCY_SRC/obj/project.assets.json" ]]; then
    echo "Generating Nancy skeleton..."
    rm -rf "$NANCY_SRC"
    mkdir -p "$NANCY_SRC"
    (
        cd "$NANCY_SRC"
        dotnet new web -n RunspaceNancySandbox -o . --force
        dotnet add package Nancy --version "${NANCY_VERSION}"
        dotnet add package Microsoft.AspNetCore.Owin --version "${NANCY_OWIN_VERSION}"
        dotnet add package Microsoft.CodeAnalysis.CSharp --version "${NANCY_ROSLYN_VERSION}"
        cat > Program.cs <<'EOF'
using System.Reflection;
using System.Runtime.Loader;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Nancy.Owin;

var entryPath = Environment.GetEnvironmentVariable("RUNSPACE_ENTRY_PATH");
if (!string.IsNullOrWhiteSpace(entryPath) && File.Exists(entryPath))
{
    var refs = ((string?)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES"))
        ?.Split(Path.PathSeparator)
        .Select(path => MetadataReference.CreateFromFile(path))
        .Cast<MetadataReference>()
        .ToArray() ?? Array.Empty<MetadataReference>();

    var compilation = CSharpCompilation.Create(
        $"RunspaceEntry_{Guid.NewGuid():N}",
        new[] { CSharpSyntaxTree.ParseText(File.ReadAllText(entryPath), path: entryPath) },
        refs,
        new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

    using var ms = new MemoryStream();
    var emit = compilation.Emit(ms);
    if (!emit.Success)
    {
        foreach (var diagnostic in emit.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error))
        {
            Console.Error.WriteLine(diagnostic);
        }

        Environment.Exit(1);
    }

    ms.Position = 0;
    AssemblyLoadContext.Default.LoadFromStream(ms);
}

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.AllowSynchronousIO = true;
});
var app = builder.Build();
app.UseOwin(pipeline => pipeline.UseNancy());
app.Run();
EOF
        dotnet restore
    )
fi

if $needs_flutter && [[ ! -f "$FLUTTER_SRC/lib/main.dart" ]]; then
    echo "Generating Flutter skeleton..."
    rm -rf "$FLUTTER_SRC"
    flutter create --project-name "$FLUTTER_PROJECT" --template "$FLUTTER_TEMPLATE" "$FLUTTER_SRC"
    (
        cd "$FLUTTER_SRC"
        flutter pub get
    )
fi

if $needs_expo && [[ ! -d "$EXPO_SRC/node_modules" ]]; then
    echo "Generating Expo skeleton..."
    rm -rf "$EXPO_SRC"
    mkdir -p "$EXPO_SRC"
    (
        cd "$EXPO_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/expo-sandbox"
        npm pkg set description="Internal Expo sandbox for Runspace"
        npm pkg set private=true
        npm install "expo@${EXPO_VERSION}" --save
    )
fi

if $needs_wordpress && [[ ! -d "$WORDPRESS_SRC/vendor" ]]; then
    echo "Generating WordPress skeleton..."
    rm -rf "$WORDPRESS_SRC"
    composer create-project "$WORDPRESS_PROJECT" "$WORDPRESS_SRC" "$WORDPRESS_VERSION" --no-interaction --no-install
    (
        cd "$WORDPRESS_SRC"
        composer config allow-plugins.johnpbloch/wordpress-core-installer true
        composer install --no-interaction
        composer config allow-plugins.composer/installers true
        composer require aaemnnosttv/wp-sqlite-db --no-interaction
    )
fi

if $needs_solidstart && [[ ! -d "$SOLIDSTART_SRC/node_modules" ]]; then
    echo "Generating SolidStart skeleton..."
    rm -rf "$SOLIDSTART_SRC"
    mkdir -p "$SOLIDSTART_SRC"
    (
        cd "$SOLIDSTART_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/solidstart-sandbox"
        npm pkg set description="Internal SolidStart sandbox for Runspace"
        npm pkg set private=true
        npm install "@solidjs/start@${SOLIDSTART_VERSION}" --save
    )
fi

if $needs_jhipster && [[ ! -f "$JHISTER_SRC/pom.xml" ]]; then
    echo "Generating JHipster skeleton..."
    rm -rf "$JHISTER_SRC"
    mkdir -p "$JHISTER_SRC"
    (
        cd "$JHISTER_SRC"
        npx --yes "generator-jhipster@${JHISTER_VERSION}" \
            --defaults --skip-install --skip-git --skip-client --no-insight --force
    )
fi

if $needs_rocket && [[ ! -f "$ROCKET_SRC/Cargo.lock" ]]; then
    echo "Generating Rocket skeleton..."
    rm -rf "$ROCKET_SRC"
    cargo new "$ROCKET_SRC" --name runspace_rocket_sandbox --bin
    cat > "$ROCKET_SRC/Cargo.toml" <<EOF
[package]
name = "runspace-rocket-sandbox"
version = "0.1.0"
edition = "2021"
build = "build.rs"
publish = false

[[bin]]
name = "runspace_entry"
path = "src/main.rs"

[dependencies]
rocket = { version = "${ROCKET_VERSION}", features = ["json"] }
EOF
    cat > "$ROCKET_SRC/build.rs" <<'EOF'
fn main() {
    println!("cargo:rerun-if-env-changed=RUNSPACE_ENTRY_PATH");
    let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| {
        std::path::PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR"))
            .join("src")
            .join("stub_entry.rs")
            .to_string_lossy()
            .to_string()
    });
    println!("cargo:rustc-env=RUNSPACE_ENTRY={entry}");
}
EOF
    cat > "$ROCKET_SRC/src/stub_entry.rs" <<'EOF'
#[macro_use]
extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Runspace Rocket sandbox"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
EOF
    cat > "$ROCKET_SRC/src/main.rs" <<'EOF'
include!(env!("RUNSPACE_ENTRY"));
EOF
    (cd "$ROCKET_SRC" && cargo build --quiet)
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
