#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
SPRING_BOOT_SRC="$GEN/spring-boot"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
SPRING_BOOT_DEST="$REPO_ROOT/src-tauri/resources/frameworks/spring-boot"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
SPRING_BOOT_VERSION="${RUNSPACE_SPRING_BOOT_VERSION:-3.4.5}"
SPRING_BOOT_JAVA_VERSION="${RUNSPACE_SPRING_BOOT_JAVA_VERSION:-21}"
SPRING_BOOT_DEPENDENCIES="${RUNSPACE_SPRING_BOOT_DEPENDENCIES:-web}"

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

spring_boot_ready() {
    [[ -f "$SPRING_BOOT_DEST/pom.xml" ]] &&
        [[ -f "$SPRING_BOOT_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_spring_boot=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! spring_boot_ready; then
    needs_spring_boot=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_spring_boot; then
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

if $needs_spring_boot && ! command -v curl >/dev/null 2>&1; then
    echo "curl is required to prepare the Spring Boot skeleton." >&2
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

if $needs_spring_boot && [[ ! -f "$SPRING_BOOT_SRC/pom.xml" ]]; then
    echo "Generating Spring Boot skeleton..."
    rm -rf "$SPRING_BOOT_SRC"
    mkdir -p "$SPRING_BOOT_SRC"
    curl -sSfLo "$GEN/spring-boot.zip" \
        "https://start.spring.io/starter.zip" \
        -d type=maven-project \
        -d language=java \
        -d bootVersion="$SPRING_BOOT_VERSION" \
        -d groupId=com.runspace \
        -d artifactId=sandbox \
        -d name=runspace-sandbox \
        -d description="Internal Spring Boot sandbox for Runspace" \
        -d packageName=com.runspace.sandbox \
        -d javaVersion="$SPRING_BOOT_JAVA_VERSION" \
        -d dependencies="$SPRING_BOOT_DEPENDENCIES"
    unzip -q "$GEN/spring-boot.zip" -d "$SPRING_BOOT_SRC"
    rm -f "$GEN/spring-boot.zip"
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
