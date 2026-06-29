#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
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
LUMEN_SRC="$GEN/lumen"
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
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
HANAMI_DEST="$REPO_ROOT/src-tauri/resources/frameworks/hanami"
BLAZOR_DEST="$REPO_ROOT/src-tauri/resources/frameworks/blazor"
QUART_DEST="$REPO_ROOT/src-tauri/resources/frameworks/quart"
IRIS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/iris"
PLUG_DEST="$REPO_ROOT/src-tauri/resources/frameworks/plug"
MICRONAUT_DEST="$REPO_ROOT/src-tauri/resources/frameworks/micronaut"
GRAPE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/grape"
WARP_DEST="$REPO_ROOT/src-tauri/resources/frameworks/warp"
SALVO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/salvo"
BEEGO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/beego"
FIBER_DEST="$REPO_ROOT/src-tauri/resources/frameworks/fiber"
DROPWIZARD_DEST="$REPO_ROOT/src-tauri/resources/frameworks/dropwizard"
GIN_DEST="$REPO_ROOT/src-tauri/resources/frameworks/gin"
ADONISJS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/adonisjs"
VERTX_DEST="$REPO_ROOT/src-tauri/resources/frameworks/vertx"
CAKEPHP_DEST="$REPO_ROOT/src-tauri/resources/frameworks/cakephp"
STREAMLIT_DEST="$REPO_ROOT/src-tauri/resources/frameworks/streamlit"
LUMEN_DEST="$REPO_ROOT/src-tauri/resources/frameworks/lumen"
SLIM_DEST="$REPO_ROOT/src-tauri/resources/frameworks/slim"
PYRAMID_DEST="$REPO_ROOT/src-tauri/resources/frameworks/pyramid"
QWIK_DEST="$REPO_ROOT/src-tauri/resources/frameworks/qwik"
SANIC_DEST="$REPO_ROOT/src-tauri/resources/frameworks/sanic"
DASH_DEST="$REPO_ROOT/src-tauri/resources/frameworks/dash"
LAMINAS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laminas"
TORNADO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/tornado"
IONIC_DEST="$REPO_ROOT/src-tauri/resources/frameworks/ionic"
CAPACITOR_DEST="$REPO_ROOT/src-tauri/resources/frameworks/capacitor"
STARLETTE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/starlette"
CODEIGNITER_DEST="$REPO_ROOT/src-tauri/resources/frameworks/codeigniter"
BOTTLE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/bottle"
LITESTAR_DEST="$REPO_ROOT/src-tauri/resources/frameworks/litestar"
SPRING_BOOT_DEST="$REPO_ROOT/src-tauri/resources/frameworks/spring-boot"
PHOENIX_DEST="$REPO_ROOT/src-tauri/resources/frameworks/phoenix"
NEXTJS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nextjs"
NUXT_DEST="$REPO_ROOT/src-tauri/resources/frameworks/nuxt"
RAILS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/rails"
SINATRA_DEST="$REPO_ROOT/src-tauri/resources/frameworks/sinatra"
PADRINO_DEST="$REPO_ROOT/src-tauri/resources/frameworks/padrino"
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
HANAMI_VERSION="${RUNSPACE_HANAMI_VERSION:-2.2.*}"
BLAZOR_PROJECT_NAME="${RUNSPACE_BLAZOR_PROJECT_NAME:-RunspaceBlazorSandbox}"
QUART_VERSION="${RUNSPACE_QUART_VERSION:-0.20.*}"
IRIS_VERSION="${RUNSPACE_IRIS_VERSION:-v12.2.11}"
PLUG_SERVER_VERSION="${RUNSPACE_PLUG_SERVER_VERSION:-~> 1.6}"
PLUG_VERSION="${RUNSPACE_PLUG_VERSION:-~> 1.16}"
MICRONAUT_JAVA_VERSION="${RUNSPACE_MICRONAUT_JAVA_VERSION:-JDK_21}"
MICRONAUT_VERSION="${RUNSPACE_MICRONAUT_VERSION:-4.7.6}"
GRAPE_VERSION="${RUNSPACE_GRAPE_VERSION:-~> 2.2}"
WARP_VERSION="${RUNSPACE_WARP_VERSION:-0.3}"
SALVO_VERSION="${RUNSPACE_SALVO_VERSION:-0.93}"
BEEGO_VERSION="${RUNSPACE_BEEGO_VERSION:-v2.3.8}"
BEEGO_MODULE="${RUNSPACE_BEEGO_MODULE:-github.com/beego/beego/v2}"
FIBER_MODULE="${RUNSPACE_FIBER_MODULE:-github.com/gofiber/fiber/v2}"
FIBER_VERSION="${RUNSPACE_FIBER_VERSION:-v2.52.9}"
DROPWIZARD_VERSION="${RUNSPACE_DROPWIZARD_VERSION:-4.0.16}"
GIN_VERSION="${RUNSPACE_GIN_VERSION:-v1.10.0}"
ADONISJS_VERSION="${RUNSPACE_ADONISJS_VERSION:-^6.0.0}"
VERTX_VERSION="${RUNSPACE_VERTX_VERSION:-5.0.1}"
VERTX_JAVA_VERSION="${RUNSPACE_VERTX_JAVA_VERSION:-21}"
CAKEPHP_PROJECT="${RUNSPACE_CAKEPHP_PROJECT:-cakephp/app}"
CAKEPHP_VERSION="${RUNSPACE_CAKEPHP_VERSION:-5.3.*}"
STREAMLIT_VERSION="${RUNSPACE_STREAMLIT_VERSION:->=1.42.0,<2}"
LUMEN_PROJECT="${RUNSPACE_LUMEN_PROJECT:-laravel/lumen}"
LUMEN_VERSION="${RUNSPACE_LUMEN_VERSION:-10.*}"
SLIM_PROJECT="${RUNSPACE_SLIM_PROJECT:-slim/slim-skeleton}"
SLIM_VERSION="${RUNSPACE_SLIM_VERSION:-4.*}"
PYRAMID_VERSION="${RUNSPACE_PYRAMID_VERSION:-2.0}"
QWIK_VERSION="${RUNSPACE_QWIK_VERSION:-^1.20.0}"
SANIC_VERSION="${RUNSPACE_SANIC_VERSION:-24.12.*}"
DASH_VERSION="${RUNSPACE_DASH_VERSION:-4.3.*}"
LAMINAS_PROJECT="${RUNSPACE_LAMINAS_PROJECT:-laminas/laminas-mvc-skeleton}"
LAMINAS_VERSION="${RUNSPACE_LAMINAS_VERSION:-2.4.*}"
TORNADO_VERSION="${RUNSPACE_TORNADO_VERSION:-6.4.2}"
IONIC_VERSION="${RUNSPACE_IONIC_VERSION:-^8.0.0}"
CAPACITOR_VERSION="${RUNSPACE_CAPACITOR_VERSION:-^8.0.0}"
STARLETTE_VERSION="${RUNSPACE_STARLETTE_VERSION:-0.49.*}"
CODEIGNITER_PROJECT="${RUNSPACE_CODEIGNITER_PROJECT:-codeigniter4/appstarter}"
CODEIGNITER_VERSION="${RUNSPACE_CODEIGNITER_VERSION:-4.*}"
BOTTLE_VERSION="${RUNSPACE_BOTTLE_VERSION:-==0.13.2}"
SPRING_BOOT_VERSION="${RUNSPACE_SPRING_BOOT_VERSION:-3.5.0}"
SPRING_BOOT_JAVA_VERSION="${RUNSPACE_SPRING_BOOT_JAVA_VERSION:-21}"
PHOENIX_VERSION="${RUNSPACE_PHOENIX_VERSION:-1.8.*}"
NEXTJS_VERSION="${RUNSPACE_NEXTJS_VERSION:-^15.0.0}"
NUXT_VERSION="${RUNSPACE_NUXT_VERSION:-^3.0.0}"
RAILS_VERSION="${RUNSPACE_RAILS_VERSION:-~> 8.0}"
SINATRA_VERSION="${RUNSPACE_SINATRA_VERSION:-~> 4.0}"
PADRINO_PROJECT="${RUNSPACE_PADRINO_PROJECT:-runspace_padrino_sandbox}"
PADRINO_GEM_VERSION="${RUNSPACE_PADRINO_GEM_VERSION:->= 0.15.0}"
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
JHIPSTER_VERSION="${RUNSPACE_JHIPSTER_VERSION:-8.8.0}"
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
hanami_ready() {
    [[ -f "$HANAMI_DEST/Gemfile" ]] &&
        [[ -f "$HANAMI_DEST/Gemfile.lock" ]] &&
        [[ -f "$HANAMI_DEST/bin/hanami" ]] &&
        [[ -f "$HANAMI_DEST/skeleton.version" ]]
}
blazor_ready() {
    [[ -f "$BLAZOR_DEST/RunspaceBlazorSandbox.csproj" ]] &&
        [[ -f "$BLAZOR_DEST/skeleton.version" ]]
}
quart_ready() {
    [[ -f "$QUART_DEST/requirements.txt" ]] &&
        [[ -f "$QUART_DEST/app.py" ]] &&
        [[ -f "$QUART_DEST/skeleton.version" ]]
}
iris_ready() {
    [[ -f "$IRIS_DEST/go.mod" ]] &&
        [[ -f "$IRIS_DEST/go.sum" ]] &&
        [[ -f "$IRIS_DEST/skeleton.version" ]]
}
plug_ready() {
    [[ -f "$PLUG_DEST/mix.exs" ]] &&
        [[ -f "$PLUG_DEST/mix.lock" ]] &&
        [[ -f "$PLUG_DEST/skeleton.version" ]]
}
micronaut_ready() {
    [[ -f "$MICRONAUT_DEST/pom.xml" ]] &&
        [[ -f "$MICRONAUT_DEST/skeleton.version" ]]
}
grape_ready() {
    [[ -f "$GRAPE_DEST/Gemfile" ]] &&
        [[ -f "$GRAPE_DEST/Gemfile.lock" ]] &&
        [[ -f "$GRAPE_DEST/skeleton.version" ]]
}
warp_ready() {
    [[ -f "$WARP_DEST/Cargo.toml" ]] &&
        [[ -f "$WARP_DEST/Cargo.lock" ]] &&
        [[ -f "$WARP_DEST/skeleton.version" ]]
}
salvo_ready() {
    [[ -f "$SALVO_DEST/Cargo.toml" ]] &&
        [[ -f "$SALVO_DEST/Cargo.lock" ]] &&
        [[ -f "$SALVO_DEST/skeleton.version" ]]
}
beego_ready() {
    [[ -f "$BEEGO_DEST/go.mod" ]] &&
        [[ -f "$BEEGO_DEST/go.sum" ]] &&
        [[ -f "$BEEGO_DEST/skeleton.version" ]]
}
fiber_ready() {
    [[ -f "$FIBER_DEST/go.mod" ]] &&
        [[ -f "$FIBER_DEST/go.sum" ]] &&
        [[ -f "$FIBER_DEST/skeleton.version" ]]
}
dropwizard_ready() {
    [[ -f "$DROPWIZARD_DEST/pom.xml" ]] &&
        [[ -f "$DROPWIZARD_DEST/skeleton.version" ]]
}
gin_ready() {
    [[ -f "$GIN_DEST/go.mod" ]] &&
        [[ -f "$GIN_DEST/go.sum" ]] &&
        [[ -f "$GIN_DEST/skeleton.version" ]]
}
adonisjs_ready() {
    [[ -f "$ADONISJS_DEST/package.json" ]] &&
        [[ -f "$ADONISJS_DEST/package-lock.json" ]] &&
        [[ -f "$ADONISJS_DEST/skeleton.version" ]]
}
vertx_ready() {
    [[ -f "$VERTX_DEST/pom.xml" ]] &&
        [[ -f "$VERTX_DEST/skeleton.version" ]]
}
cakephp_ready() {
    [[ -f "$CAKEPHP_DEST/bin/cake" ]] &&
        [[ -f "$CAKEPHP_DEST/composer.lock" ]] &&
        [[ -f "$CAKEPHP_DEST/skeleton.version" ]]
}
streamlit_ready() {
    [[ -f "$STREAMLIT_DEST/requirements.txt" ]] &&
        [[ -f "$STREAMLIT_DEST/requirements.lock" ]] &&
        [[ -f "$STREAMLIT_DEST/skeleton.version" ]]
}
lumen_ready() {
    [[ -f "$LUMEN_DEST/artisan" ]] &&
        [[ -f "$LUMEN_DEST/composer.lock" ]] &&
        [[ -f "$LUMEN_DEST/skeleton.version" ]]
}
slim_ready() {
    [[ -f "$SLIM_DEST/public/index.php" ]] &&
        [[ -f "$SLIM_DEST/composer.lock" ]] &&
        [[ -f "$SLIM_DEST/skeleton.version" ]]
}
pyramid_ready() {
    [[ -f "$PYRAMID_DEST/requirements.txt" ]] &&
        [[ -f "$PYRAMID_DEST/app.py" ]] &&
        [[ -f "$PYRAMID_DEST/skeleton.version" ]]
}
qwik_ready() {
    [[ -f "$QWIK_DEST/package.json" ]] &&
        [[ -f "$QWIK_DEST/package-lock.json" ]] &&
        [[ -f "$QWIK_DEST/skeleton.version" ]]
}
sanic_ready() {
    [[ -f "$SANIC_DEST/requirements.txt" ]] &&
        [[ -f "$SANIC_DEST/app.py" ]] &&
        [[ -f "$SANIC_DEST/skeleton.version" ]]
}
dash_ready() {
    [[ -f "$DASH_DEST/requirements.txt" ]] &&
        [[ -f "$DASH_DEST/app.py" ]] &&
        [[ -f "$DASH_DEST/skeleton.version" ]]
}
laminas_ready() {
    [[ -f "$LAMINAS_DEST/public/index.php" ]] &&
        [[ -f "$LAMINAS_DEST/composer.lock" ]] &&
        [[ -f "$LAMINAS_DEST/skeleton.version" ]]
}
tornado_ready() {
    [[ -f "$TORNADO_DEST/requirements.txt" ]] &&
        [[ -f "$TORNADO_DEST/skeleton.version" ]]
}
ionic_ready() {
    [[ -f "$IONIC_DEST/package.json" ]] &&
        [[ -f "$IONIC_DEST/package-lock.json" ]] &&
        [[ -f "$IONIC_DEST/skeleton.version" ]]
}
capacitor_ready() {
    [[ -f "$CAPACITOR_DEST/package.json" ]] &&
        [[ -f "$CAPACITOR_DEST/package-lock.json" ]] &&
        [[ -f "$CAPACITOR_DEST/skeleton.version" ]]
}
starlette_ready() {
    [[ -f "$STARLETTE_DEST/requirements.txt" ]] &&
        [[ -f "$STARLETTE_DEST/app.py" ]] &&
        [[ -f "$STARLETTE_DEST/skeleton.version" ]]
}
codeigniter_ready() {
    [[ -f "$CODEIGNITER_DEST/spark" ]] &&
        [[ -f "$CODEIGNITER_DEST/composer.lock" ]] &&
        [[ -f "$CODEIGNITER_DEST/skeleton.version" ]]
}
bottle_ready() {
    [[ -f "$BOTTLE_DEST/requirements.txt" ]] &&
        [[ -f "$BOTTLE_DEST/skeleton.version" ]]
}
litestar_ready() {
    [[ -f "$LITESTAR_DEST/requirements.txt" ]] &&
        [[ -f "$LITESTAR_DEST/skeleton.version" ]]
}
phoenix_ready() {
    [[ -f "$PHOENIX_DEST/mix.exs" ]] &&
        [[ -f "$PHOENIX_DEST/mix.lock" ]] &&
        [[ -f "$PHOENIX_DEST/skeleton.version" ]]
}
nextjs_ready() {
    [[ -f "$NEXTJS_DEST/package.json" ]] &&
        [[ -f "$NEXTJS_DEST/package-lock.json" ]] &&
        [[ -f "$NEXTJS_DEST/skeleton.version" ]]
}
nuxt_ready() {
    [[ -f "$NUXT_DEST/package.json" ]] &&
        [[ -f "$NUXT_DEST/package-lock.json" ]] &&
        [[ -f "$NUXT_DEST/skeleton.version" ]]
}
rails_ready() {
    [[ -f "$RAILS_DEST/Gemfile" ]] &&
        [[ -f "$RAILS_DEST/Gemfile.lock" ]] &&
        [[ -f "$RAILS_DEST/bin/rails" ]] &&
        [[ -f "$RAILS_DEST/skeleton.version" ]]
}
sinatra_ready() {
    [[ -f "$SINATRA_DEST/Gemfile" ]] &&
        [[ -f "$SINATRA_DEST/Gemfile.lock" ]] &&
        [[ -f "$SINATRA_DEST/skeleton.version" ]]
}
padrino_ready() {
    [[ -f "$PADRINO_DEST/Gemfile.lock" ]] &&
        [[ -f "$PADRINO_DEST/config/apps.rb" ]] &&
        [[ -f "$PADRINO_DEST/skeleton.version" ]]
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
    [[ -f "$JHIPSTER_DEST/pom.xml" ]] &&
        [[ -f "$JHIPSTER_DEST/skeleton.version" ]]
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
needs_hanami=false
needs_blazor=false
needs_quart=false
needs_iris=false
needs_plug=false
needs_micronaut=false
needs_grape=false
needs_warp=false
needs_salvo=false
needs_beego=false
needs_fiber=false
needs_dropwizard=false
needs_gin=false
needs_adonisjs=false
needs_vertx=false
needs_cakephp=false
needs_streamlit=false
needs_lumen=false
needs_slim=false
needs_pyramid=false
needs_qwik=false
needs_sanic=false
needs_dash=false
needs_laminas=false
needs_tornado=false
needs_ionic=false
needs_capacitor=false
needs_starlette=false
needs_codeigniter=false
needs_bottle=false
needs_litestar=false
needs_spring_boot=false
needs_phoenix=false
needs_nextjs=false
needs_nuxt=false
needs_rails=false
needs_sinatra=false
needs_padrino=false
needs_cowboy=false
needs_aspnet_core=false
needs_chi=false
needs_yii=false
needs_react_native=false
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
needs_minimal_apis=false
needs_nancy=false
needs_flutter=false
needs_expo=false
needs_gorilla_mux=false
needs_wordpress=false
needs_solidstart=false
needs_jhipster=false
needs_rocket=false
needs_actix_web=false
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
if force_sync || ! hanami_ready; then
    needs_hanami=true
fi
if force_sync || ! blazor_ready; then
    needs_blazor=true
fi
if force_sync || ! quart_ready; then
    needs_quart=true
fi
if force_sync || ! iris_ready; then
    needs_iris=true
fi
if force_sync || ! plug_ready; then
    needs_plug=true
fi
if force_sync || ! micronaut_ready; then
    needs_micronaut=true
fi
if force_sync || ! grape_ready; then
    needs_grape=true
fi
if force_sync || ! warp_ready; then
    needs_warp=true
fi
if force_sync || ! salvo_ready; then
    needs_salvo=true
fi
if force_sync || ! beego_ready; then
    needs_beego=true
fi
if force_sync || ! fiber_ready; then
    needs_fiber=true
fi
if force_sync || ! dropwizard_ready; then
    needs_dropwizard=true
fi
if force_sync || ! gin_ready; then
    needs_gin=true
fi
if force_sync || ! adonisjs_ready; then
    needs_adonisjs=true
fi
if force_sync || ! vertx_ready; then
    needs_vertx=true
fi
if force_sync || ! cakephp_ready; then
    needs_cakephp=true
fi
if force_sync || ! streamlit_ready; then
    needs_streamlit=true
fi
if force_sync || ! lumen_ready; then
    needs_lumen=true
fi
if force_sync || ! slim_ready; then
    needs_slim=true
fi
if force_sync || ! pyramid_ready; then
    needs_pyramid=true
fi
if force_sync || ! qwik_ready; then
    needs_qwik=true
fi
if force_sync || ! sanic_ready; then
    needs_sanic=true
fi
if force_sync || ! dash_ready; then
    needs_dash=true
fi
if force_sync || ! laminas_ready; then
    needs_laminas=true
fi
if force_sync || ! tornado_ready; then
    needs_tornado=true
fi
if force_sync || ! ionic_ready; then
    needs_ionic=true
fi
if force_sync || ! capacitor_ready; then
    needs_capacitor=true
fi
if force_sync || ! starlette_ready; then
    needs_starlette=true
fi
if force_sync || ! codeigniter_ready; then
    needs_codeigniter=true
fi
if force_sync || ! bottle_ready; then
    needs_bottle=true
fi
if force_sync || ! litestar_ready; then
    needs_litestar=true
fi
if force_sync || ! phoenix_ready; then
    needs_phoenix=true
fi
if force_sync || ! nextjs_ready; then
    needs_nextjs=true
fi
if force_sync || ! nuxt_ready; then
    needs_nuxt=true
fi
if force_sync || ! rails_ready; then
    needs_rails=true
fi
if force_sync || ! sinatra_ready; then
    needs_sinatra=true
fi
if force_sync || ! padrino_ready; then
    needs_padrino=true
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

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_django && ! $needs_play && ! $needs_flask && ! $needs_koa && ! $needs_hono && ! $needs_fastify && ! $needs_nestjs && ! $needs_buffalo && ! $needs_actix_web && ! $needs_rocket && ! $needs_jhipster && ! $needs_solidstart && ! $needs_wordpress && ! $needs_gorilla_mux && ! $needs_expo && ! $needs_flutter && ! $needs_nancy && ! $needs_minimal_apis && ! $needs_echo && ! $needs_ktor && ! $needs_poem && ! $needs_phalcon && ! $needs_fastapi && ! $needs_sveltekit && ! $needs_remix && ! $needs_roda && ! $needs_axum && ! $needs_astro && ! $needs_quarkus && ! $needs_meteor && ! $needs_react_native && ! $needs_yii && ! $needs_chi && ! $needs_aspnet_core && ! $needs_cowboy && ! $needs_padrino && ! $needs_sinatra && ! $needs_rails && ! $needs_nuxt && ! $needs_nextjs && ! $needs_phoenix && ! $needs_spring_boot && ! $needs_litestar && ! $needs_bottle && ! $needs_codeigniter && ! $needs_starlette && ! $needs_ionic && ! $needs_capacitor && ! $needs_tornado && ! $needs_laminas && ! $needs_dash && ! $needs_sanic && ! $needs_qwik && ! $needs_pyramid && ! $needs_slim && ! $needs_lumen && ! $needs_streamlit && ! $needs_cakephp && ! $needs_vertx && ! $needs_adonisjs && ! $needs_gin && ! $needs_dropwizard && ! $needs_fiber && ! $needs_beego && ! $needs_salvo && ! $needs_warp && ! $needs_grape && ! $needs_micronaut && ! $needs_plug && ! $needs_iris && ! $needs_quart && ! $needs_blazor && ! $needs_hanami; then
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
if $needs_hanami && ! command -v hanami >/dev/null 2>&1; then
    echo "Installing Hanami for skeleton generation..."
    gem install hanami bundler --no-document
    export PATH="$(ruby -e 'print Gem.bindir'):${PATH}"
fi

if $needs_blazor && ! command -v dotnet >/dev/null 2>&1; then
    echo "The .NET SDK is required to prepare the Blazor skeleton." >&2
    exit 1
fi

if $needs_quart && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Quart skeleton." >&2
    exit 1
fi

if $needs_iris && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Iris skeleton." >&2
    exit 1
fi

if $needs_plug && ! command -v mix >/dev/null 2>&1; then
    echo "Mix is required to prepare the Plug skeleton." >&2
    echo "Install Elixir, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_micronaut && ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to prepare the Micronaut skeleton." >&2
    exit 1
fi

if $needs_grape && ! command -v bundle >/dev/null 2>&1; then
    echo "Bundler is required to prepare the Grape skeleton." >&2
    echo "Install Ruby and Bundler, then run:" >&2
    echo "  gem install bundler" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_warp && ! command -v cargo >/dev/null 2>&1; then
    echo "cargo is required to prepare the Warp skeleton." >&2
    exit 1
fi

if $needs_salvo && ! command -v cargo >/dev/null 2>&1; then
    echo "cargo is required to prepare the Salvo skeleton." >&2
    exit 1
fi

if $needs_beego && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Beego skeleton." >&2
    exit 1
fi

if $needs_fiber && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Fiber skeleton." >&2
    exit 1
fi

if $needs_dropwizard && ! command -v mvn >/dev/null 2>&1; then
    echo "Maven is required to prepare the Dropwizard skeleton." >&2
    echo "Install Maven or set its path in Settings, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_gin && ! command -v go >/dev/null 2>&1; then
    echo "Go is required to prepare the Gin skeleton." >&2
    exit 1
fi

if $needs_streamlit && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Streamlit skeleton." >&2
    exit 1
fi

if $needs_pyramid && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Pyramid skeleton." >&2
    exit 1
fi

if $needs_qwik && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Qwik skeleton." >&2
    exit 1
fi

if $needs_sanic && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Sanic skeleton." >&2
    exit 1
fi

if $needs_dash && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Dash skeleton." >&2
    exit 1
fi

if $needs_tornado && ! command -v pip3 >/dev/null 2>&1 && ! command -v pip >/dev/null 2>&1; then
    echo "pip is required to prepare the Tornado skeleton." >&2
    exit 1
fi

if ($needs_ionic || $needs_capacitor) && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Ionic/Capacitor skeleton." >&2
    exit 1
fi

if $needs_starlette && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Starlette skeleton." >&2
    exit 1
fi

if $needs_bottle && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Bottle skeleton." >&2
    exit 1
fi

if $needs_litestar && ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to prepare the Litestar skeleton." >&2
    exit 1
fi

if $needs_phoenix && ! command -v mix >/dev/null 2>&1; then
    echo "Mix is required to prepare the Phoenix skeleton." >&2
    echo "Install Elixir and Phoenix, then run:" >&2
    echo "  mix archive.install hex phx_new" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_nextjs && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Next.js skeleton." >&2
    exit 1
fi

if $needs_nuxt && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Nuxt skeleton." >&2
    exit 1
fi

if $needs_rails && ! command -v rails >/dev/null 2>&1; then
    echo "Rails is required to prepare the Rails skeleton." >&2
    echo "Install Ruby, Bundler, and Rails, then run:" >&2
    echo "  gem install rails bundler" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_sinatra && ! command -v bundle >/dev/null 2>&1; then
    echo "Bundler is required to prepare the Sinatra skeleton." >&2
    echo "Install Ruby and Bundler, then run:" >&2
    echo "  gem install bundler" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_padrino && ! command -v ruby >/dev/null 2>&1; then
    echo "Ruby is required to prepare the Padrino skeleton." >&2
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
if $needs_hanami && [[ ! -f "$HANAMI_SRC/.bundle/config" ]]; then
    echo "Generating Hanami skeleton..."
    rm -rf "$HANAMI_SRC" "$GEN/runspace_hanami"
    (
        cd "$GEN"
        hanami new runspace_hanami --database=sqlite
    )
    mv "$GEN/runspace_hanami" "$HANAMI_SRC"
    (
        cd "$HANAMI_SRC"
        bundle config set --local path 'vendor/bundle'
        bundle install
    )
fi

if $needs_blazor && [[ ! -f "$BLAZOR_SRC/obj/project.assets.json" ]]; then
    echo "Generating Blazor skeleton..."
    rm -rf "$BLAZOR_SRC"
    dotnet new "$BLAZOR_TEMPLATE" -o "$BLAZOR_SRC" -n "$BLAZOR_PROJECT_NAME" --no-restore
    (cd "$BLAZOR_SRC" && dotnet restore)
fi

if $needs_quart && [[ ! -f "$QUART_SRC/requirements.txt" ]]; then
    echo "Generating Quart skeleton..."
    rm -rf "$QUART_SRC"
    mkdir -p "$QUART_SRC"
    python3 -m venv "$QUART_SRC/.venv"
    (
        cd "$QUART_SRC"
        .venv/bin/pip install --upgrade pip
        .venv/bin/pip install "quart==${QUART_VERSION}"
        .venv/bin/pip freeze > requirements.txt
        cat > app.py <<'PY'
from quart import Quart

app = Quart(__name__)


@app.get("/")
async def index():
    return "Hello from Runspace Quart sandbox"


if __name__ == "__main__":
    app.run(debug=True)
PY
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

if $needs_micronaut && [[ ! -f "$MICRONAUT_SRC/pom.xml" ]]; then
    echo "Generating Micronaut skeleton..."
    rm -rf "$MICRONAUT_SRC" "$GEN/micronaut-extract"
    mkdir -p "$MICRONAUT_SRC"
    curl -sSfLo "$GEN/micronaut.zip" \
        "https://launch.micronaut.io/create/default/runspace-sandbox?build=maven&lang=java&test=junit&javaVersion=${MICRONAUT_JAVA_VERSION}&micronautVersion=${MICRONAUT_VERSION}&packageName=com.runspace.sandbox"
    unzip -q "$GEN/micronaut.zip" -d "$GEN/micronaut-extract"
    mv "$GEN/micronaut-extract/runspace-sandbox/"* "$MICRONAUT_SRC/"
    rm -rf "$GEN/micronaut-extract" "$GEN/micronaut.zip"
fi

if $needs_grape && [[ ! -f "$GRAPE_SRC/.bundle/config" ]]; then
    echo "Generating Grape skeleton..."
    rm -rf "$GRAPE_SRC"
    mkdir -p "$GRAPE_SRC"
    cat > "$GRAPE_SRC/Gemfile" <<EOF
source "https://rubygems.org"

ruby ">= 2.7.8"

gem "grape", "${GRAPE_VERSION}"
EOF
    (
        cd "$GRAPE_SRC"
        bundle config set --local path 'vendor/bundle'
        bundle install
    )
fi

if $needs_warp && [[ ! -f "$WARP_SRC/Cargo.lock" ]]; then
    echo "Generating Warp skeleton..."
    rm -rf "$WARP_SRC"
    mkdir -p "$WARP_SRC"
    (
        cd "$WARP_SRC"
        cargo init --name runspace-warp-sandbox --bin
        cargo add "warp@${WARP_VERSION}"
        cargo add tokio --features full
        printf '%s\n' 'fn main() {}' > src/main.rs
    )
fi

if $needs_salvo && [[ ! -f "$SALVO_SRC/Cargo.lock" ]]; then
    echo "Generating Salvo skeleton..."
    rm -rf "$SALVO_SRC"
    mkdir -p "$SALVO_SRC/src/bin"
    cat > "$SALVO_SRC/Cargo.toml" <<EOF
[package]
name = "runspace-salvo-sandbox"
version = "0.1.0"
edition = "2021"
publish = false
description = "Internal Salvo sandbox for Runspace"

[dependencies]
salvo = "${SALVO_VERSION}"
tokio = { version = "1", features = ["macros", "rt-multi-thread", "net"] }

[[bin]]
name = "runspace-entry"
path = "src/bin/runspace_entry.rs"
EOF
    cat > "$SALVO_SRC/build.rs" <<'EOF'
fn main() {
    let entry = std::env::var("RUNSPACE_ENTRY_PATH").unwrap_or_else(|_| {
        let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
        format!("{manifest_dir}/src/stub_entry.rs")
    });
    println!("cargo:rerun-if-env-changed=RUNSPACE_ENTRY_PATH");
    println!("cargo:rustc-env=RUNSPACE_ENTRY_PATH={entry}");
}
EOF
    cat > "$SALVO_SRC/src/stub_entry.rs" <<'EOF'
fn main() {
    println!("Runspace Salvo sandbox");
}
EOF
    cat > "$SALVO_SRC/src/bin/runspace_entry.rs" <<'EOF'
include!(env!("RUNSPACE_ENTRY_PATH"));
EOF
    (
        cd "$SALVO_SRC"
        cargo fetch --locked 2>/dev/null || cargo fetch
        RUNSPACE_ENTRY_PATH="$SALVO_SRC/src/stub_entry.rs" cargo build --quiet --bin runspace-entry
    )
fi

if $needs_beego && [[ ! -d "$BEEGO_SRC/vendor" ]]; then
    echo "Generating Beego skeleton..."
    rm -rf "$BEEGO_SRC"
    mkdir -p "$BEEGO_SRC"
    (
        cd "$BEEGO_SRC"
        go mod init runspace/beego-sandbox
        go get "${BEEGO_MODULE}@${BEEGO_VERSION}"
        go mod vendor
    )
fi

if $needs_fiber && [[ ! -f "$FIBER_SRC/go.sum" ]]; then
    echo "Generating Fiber skeleton..."
    rm -rf "$FIBER_SRC"
    mkdir -p "$FIBER_SRC"
    (
        cd "$FIBER_SRC"
        go mod init runspace/fiber-sandbox
        go get "${FIBER_MODULE}@${FIBER_VERSION}"
        go mod tidy
    )
fi

if $needs_dropwizard && [[ ! -f "$DROPWIZARD_SRC/pom.xml" ]]; then
    echo "Generating Dropwizard skeleton..."
    rm -rf "$DROPWIZARD_SRC" "$GEN/dropwizard-gen"
    mkdir -p "$GEN/dropwizard-gen"
    (
        cd "$GEN/dropwizard-gen"
        mvn -B archetype:generate \
            -DarchetypeGroupId=io.dropwizard.archetypes \
            -DarchetypeArtifactId=java-simple \
            -DarchetypeVersion="$DROPWIZARD_VERSION" \
            -DgroupId=com.runspace \
            -DartifactId=sandbox \
            -Dversion=1.0-SNAPSHOT \
            -Dpackage=com.runspace.sandbox \
            -Dname=RunspaceSandbox \
            -DinteractiveMode=false
        mv sandbox "$DROPWIZARD_SRC"
    )
    rm -rf "$GEN/dropwizard-gen"
fi

if $needs_gin && [[ ! -f "$GIN_SRC/go.mod" ]]; then
    echo "Generating Gin skeleton..."
    rm -rf "$GIN_SRC"
    mkdir -p "$GIN_SRC"
    (
        cd "$GIN_SRC"
        go mod init runspace/gin-sandbox
        go get "github.com/gin-gonic/gin@${GIN_VERSION}"
    )
fi

if $needs_adonisjs && [[ ! -d "$ADONISJS_SRC/node_modules" ]]; then
    echo "Generating AdonisJS skeleton..."
    rm -rf "$ADONISJS_SRC"
    mkdir -p "$ADONISJS_SRC"
    (
        cd "$ADONISJS_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/adonisjs-sandbox"
        npm pkg set description="Internal AdonisJS sandbox for Runspace"
        npm pkg set private=true
        npm install "@adonisjs/core@${ADONISJS_VERSION}" --save
    )
fi

if $needs_vertx && [[ ! -f "$VERTX_SRC/pom.xml" ]]; then
    echo "Generating Vert.x skeleton..."
    rm -rf "$VERTX_SRC"
    mkdir -p "$VERTX_SRC"
    cat > "$VERTX_SRC/pom.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.runspace</groupId>
    <artifactId>vertx-sandbox</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>runspace-vertx-sandbox</name>
    <description>Internal Vert.x sandbox for Runspace</description>
    <properties>
        <vertx.version>${VERTX_VERSION}</vertx.version>
        <maven.compiler.source>${VERTX_JAVA_VERSION}</maven.compiler.source>
        <maven.compiler.target>${VERTX_JAVA_VERSION}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>io.vertx</groupId>
            <artifactId>vertx-core</artifactId>
            <version>\${vertx.version}</version>
        </dependency>
        <dependency>
            <groupId>io.vertx</groupId>
            <artifactId>vertx-web</artifactId>
            <version>\${vertx.version}</version>
        </dependency>
    </dependencies>
</project>
EOF
fi

if $needs_cakephp && [[ ! -d "$CAKEPHP_SRC/vendor" ]]; then
    echo "Generating CakePHP skeleton..."
    rm -rf "$CAKEPHP_SRC"
    composer create-project "$CAKEPHP_PROJECT" "$CAKEPHP_SRC" "$CAKEPHP_VERSION" --no-interaction
fi

if $needs_streamlit && [[ ! -d "$STREAMLIT_SRC/vendor" ]]; then
    echo "Generating Streamlit skeleton..."
    rm -rf "$STREAMLIT_SRC"
    mkdir -p "$STREAMLIT_SRC"
    (
        cd "$STREAMLIT_SRC"
        printf 'streamlit%s\n' "$STREAMLIT_VERSION" > requirements.txt
        python3 -m venv .venv
        .venv/bin/pip install -r requirements.txt
        .venv/bin/pip freeze > requirements.lock
        .venv/bin/pip install -r requirements.lock --target vendor
    )
fi

if $needs_lumen && [[ ! -d "$LUMEN_SRC/vendor" ]]; then
    echo "Generating Lumen skeleton..."
    rm -rf "$LUMEN_SRC"
    composer create-project "$LUMEN_PROJECT" "$LUMEN_SRC" "$LUMEN_VERSION" --no-interaction
fi

if $needs_slim && [[ ! -d "$SLIM_SRC/vendor" ]]; then
    echo "Generating Slim skeleton..."
    rm -rf "$SLIM_SRC"
    composer create-project "$SLIM_PROJECT" "$SLIM_SRC" "$SLIM_VERSION" --no-interaction
fi

if $needs_pyramid && [[ ! -f "$PYRAMID_SRC/requirements.txt" ]]; then
    echo "Generating Pyramid skeleton..."
    rm -rf "$PYRAMID_SRC"
    mkdir -p "$PYRAMID_SRC"
    python3 -m venv "$PYRAMID_SRC/.venv"
    (
        cd "$PYRAMID_SRC"
        .venv/bin/pip install --upgrade pip
        .venv/bin/pip install "pyramid~=${PYRAMID_VERSION}" waitress
        .venv/bin/pip freeze > requirements.txt
        cat > app.py <<'PY'
from pyramid.config import Configurator
from pyramid.response import Response


def hello_world(request):
    return Response('Hello from Runspace Pyramid sandbox')


if __name__ == '__main__':
    with Configurator() as config:
        config.add_route('hello', '/')
        config.add_view(hello_world, route_name='hello')
        app = config.make_wsgi_app()
    from waitress import serve

    serve(app, host='127.0.0.1', port=8080)
PY
    )
fi

if $needs_qwik && [[ ! -d "$QWIK_SRC/node_modules" ]]; then
    echo "Generating Qwik skeleton..."
    rm -rf "$QWIK_SRC"
    mkdir -p "$QWIK_SRC"
    (
        cd "$QWIK_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/qwik-sandbox"
        npm pkg set description="Internal Qwik sandbox for Runspace"
        npm pkg set private=true
        npm install "@builder.io/qwik@${QWIK_VERSION}" --save
    )
fi

if $needs_sanic && [[ ! -f "$SANIC_SRC/requirements.txt" ]]; then
    echo "Generating Sanic skeleton..."
    rm -rf "$SANIC_SRC"
    mkdir -p "$SANIC_SRC"
    python3 -m venv "$SANIC_SRC/.venv"
    (
        cd "$SANIC_SRC"
        .venv/bin/pip install --upgrade pip
        .venv/bin/pip install "sanic==${SANIC_VERSION}"
        .venv/bin/pip freeze > requirements.txt
        cat > app.py <<'PY'
from sanic import Sanic
from sanic.response import text

app = Sanic("RunspaceSanicSandbox")


@app.get("/")
async def index(request):
    return text("Hello from Runspace Sanic sandbox")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
PY
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

if $needs_laminas && [[ ! -d "$LAMINAS_SRC/vendor" ]]; then
    echo "Generating Laminas skeleton..."
    rm -rf "$LAMINAS_SRC"
    composer create-project -s dev "$LAMINAS_PROJECT" "$LAMINAS_SRC" "$LAMINAS_VERSION" --no-interaction --ignore-platform-reqs
fi

if $needs_tornado && [[ ! -d "$TORNADO_SRC/site-packages" ]]; then
    echo "Generating Tornado skeleton..."
    rm -rf "$TORNADO_SRC"
    mkdir -p "$TORNADO_SRC"
    (
        cd "$TORNADO_SRC"
        echo "tornado==${TORNADO_VERSION}" > requirements.txt
        if command -v pip3 >/dev/null 2>&1; then
            pip3 install -r requirements.txt --target site-packages --no-warn-script-location
        else
            pip install -r requirements.txt --target site-packages --no-warn-script-location
        fi
    )
fi

if $needs_ionic && [[ ! -d "$IONIC_SRC/node_modules" ]]; then
    echo "Generating Ionic skeleton..."
    rm -rf "$IONIC_SRC"
    mkdir -p "$IONIC_SRC"
    (
        cd "$IONIC_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/ionic-sandbox"
        npm pkg set description="Internal Ionic sandbox for Runspace"
        npm pkg set private=true
        npm install "@ionic/core@${IONIC_VERSION}" --save
    )
fi

if $needs_capacitor && [[ ! -d "$CAPACITOR_SRC/node_modules" ]]; then
    echo "Generating Capacitor skeleton..."
    rm -rf "$CAPACITOR_SRC"
    mkdir -p "$CAPACITOR_SRC"
    (
        cd "$CAPACITOR_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/capacitor-sandbox"
        npm pkg set description="Internal Capacitor sandbox for Runspace"
        npm pkg set private=true
        npm install "@capacitor/core@${CAPACITOR_VERSION}" ts-node typescript --save
    )
fi

if $needs_starlette && [[ ! -f "$STARLETTE_SRC/requirements.txt" ]]; then
    echo "Generating Starlette skeleton..."
    rm -rf "$STARLETTE_SRC"
    mkdir -p "$STARLETTE_SRC"
    python3 -m venv "$STARLETTE_SRC/.venv"
    (
        cd "$STARLETTE_SRC"
        .venv/bin/pip install --upgrade pip
        .venv/bin/pip install "starlette==${STARLETTE_VERSION}" uvicorn
        .venv/bin/pip freeze > requirements.txt
        cat > app.py <<'PY'
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse
from starlette.routing import Route


async def homepage(request):
    return PlainTextResponse("Hello from Runspace Starlette sandbox")


app = Starlette(
    routes=[
        Route("/", homepage),
    ],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
PY
    )
fi

if $needs_codeigniter && [[ ! -d "$CODEIGNITER_SRC/vendor" ]]; then
    echo "Generating CodeIgniter skeleton..."
    rm -rf "$CODEIGNITER_SRC"
    composer create-project "$CODEIGNITER_PROJECT" "$CODEIGNITER_SRC" "$CODEIGNITER_VERSION" --no-interaction
fi

if $needs_bottle && [[ ! -f "$BOTTLE_SRC/requirements.txt" ]]; then
    echo "Generating Bottle skeleton..."
    rm -rf "$BOTTLE_SRC"
    mkdir -p "$BOTTLE_SRC"
    echo "bottle${BOTTLE_VERSION}" > "$BOTTLE_SRC/requirements.txt"
fi

if $needs_litestar && [[ ! -f "$LITESTAR_SRC/requirements.txt" ]]; then
    echo "Generating Litestar skeleton..."
    rm -rf "$LITESTAR_SRC"
    mkdir -p "$LITESTAR_SRC"
    (
        cd "$LITESTAR_SRC"
        python3 -m pip install litestar "uvicorn[standard]" \
            --target site-packages \
            --no-warn-script-location \
            --disable-pip-version-check
        python3 - <<'PY' > requirements.txt
import sys
sys.path.insert(0, "site-packages")
import litestar
import uvicorn
print(f"litestar=={litestar.__version__}")
print(f"uvicorn=={uvicorn.__version__}")
PY
    )
fi

if $needs_phoenix && [[ ! -f "$PHOENIX_SRC/mix.lock" ]]; then
    echo "Generating Phoenix skeleton..."
    rm -rf "$PHOENIX_SRC"
    mix local.hex --force
    mix archive.install hex phx_new --force
    mix phx.new "$PHOENIX_SRC" \
        --no-install \
        --app runspace_phoenix \
        --database sqlite3 \
        --no-mailer
    (
        cd "$PHOENIX_SRC"
        mix deps.get
        mix compile
    )
fi

if $needs_nextjs && [[ ! -d "$NEXTJS_SRC/node_modules" ]]; then
    echo "Generating Next.js skeleton..."
    rm -rf "$NEXTJS_SRC"
    mkdir -p "$NEXTJS_SRC"
    (
        cd "$NEXTJS_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/nextjs-sandbox"
        npm pkg set description="Internal Next.js sandbox for Runspace"
        npm pkg set private=true
        npm install "next@${NEXTJS_VERSION}" react react-dom --save
    )
fi

if $needs_nuxt && [[ ! -d "$NUXT_SRC/node_modules" ]]; then
    echo "Generating Nuxt skeleton..."
    rm -rf "$NUXT_SRC"
    mkdir -p "$NUXT_SRC"
    (
        cd "$NUXT_SRC"
        npm init -y --scope=runspace
        npm pkg set name="@runspace/nuxt-sandbox"
        npm pkg set description="Internal Nuxt sandbox for Runspace"
        npm pkg set private=true
        npm install "nuxt@${NUXT_VERSION}" --save
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

if $needs_sinatra && [[ ! -f "$SINATRA_SRC/.bundle/config" ]]; then
    echo "Generating Sinatra skeleton..."
    rm -rf "$SINATRA_SRC"
    mkdir -p "$SINATRA_SRC"
    (
        cd "$SINATRA_SRC"
        bundle init
        bundle add "sinatra" --version "$SINATRA_VERSION"
        bundle config set --local path 'vendor/bundle'
        bundle install
    )
fi

if $needs_padrino && [[ ! -f "$PADRINO_SRC/Gemfile.lock" ]]; then
    echo "Generating Padrino skeleton..."
    rm -rf "$PADRINO_SRC" "$GEN/$PADRINO_PROJECT"
    (
        cd "$GEN"
        padrino g project "$PADRINO_PROJECT" -b -i -a sqlite -d activerecord
    )
    mv "$GEN/$PADRINO_PROJECT" "$PADRINO_SRC"
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

if $needs_jhipster && [[ ! -f "$JHIPSTER_SRC/pom.xml" ]]; then
    echo "Generating JHipster skeleton..."
    rm -rf "$JHIPSTER_SRC"
    mkdir -p "$JHIPSTER_SRC"
    (
        cd "$JHIPSTER_SRC"
        npx --yes "generator-jhipster@${JHIPSTER_VERSION}" \
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
