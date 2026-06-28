#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
ASPNET_CORE_SRC="$GEN/aspnet-core"
PHALCON_SRC="$GEN/phalcon"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
ASPNET_CORE_DEST="$REPO_ROOT/src-tauri/resources/frameworks/aspnet-core"
PHALCON_DEST="$REPO_ROOT/src-tauri/resources/frameworks/phalcon"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
PHALCON_PROJECT="${RUNSPACE_PHALCON_PROJECT:-phalcon-kit/app}"
PHALCON_VERSION="${RUNSPACE_PHALCON_VERSION:-1.*}"
ASPNET_CORE_PROJECT="${RUNSPACE_ASPNET_CORE_PROJECT:-RunspaceAspNetSandbox}"
ASPNET_CORE_SCRIPTING_PACKAGE="${RUNSPACE_ASPNET_CORE_SCRIPTING_PACKAGE:-Microsoft.CodeAnalysis.CSharp.Scripting}"

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

aspnet_core_ready() {
    [[ -f "$ASPNET_CORE_DEST/RunspaceAspNetSandbox.csproj" ]] &&
        [[ -f "$ASPNET_CORE_DEST/RunspaceEntryHost.cs" ]] &&
        [[ -f "$ASPNET_CORE_DEST/skeleton.version" ]]
}

phalcon_ready() {
    [[ -f "$PHALCON_DEST/composer.lock" ]] &&
        [[ -f "$PHALCON_DEST/public/index.php" ]] &&
        [[ -f "$PHALCON_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_aspnet_core=false
needs_phalcon=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! aspnet_core_ready; then
    needs_aspnet_core=true
fi
if force_sync || ! phalcon_ready; then
    needs_phalcon=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_aspnet_core && ! $needs_phalcon; then
    echo "Framework skeletons already present; skipping generation."
    exit 0
fi

if ($needs_laravel || $needs_symfony || $needs_phalcon) && ! command -v composer >/dev/null 2>&1; then
    echo "Composer is required to prepare Laravel/Symfony/Phalcon skeletons." >&2
    echo "Install Composer or set its path in Settings, then run:" >&2
    echo "  npm run prepare:frameworks" >&2
    exit 1
fi

if $needs_express && ! command -v npm >/dev/null 2>&1; then
    echo "npm is required to prepare the Express skeleton." >&2
    exit 1
fi

if $needs_aspnet_core && ! command -v dotnet >/dev/null 2>&1; then
    echo "The .NET SDK is required to prepare the ASP.NET Core skeleton." >&2
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

if $needs_aspnet_core && [[ ! -f "$ASPNET_CORE_SRC/RunspaceAspNetSandbox.csproj" ]]; then
    echo "Generating ASP.NET Core skeleton..."
    rm -rf "$ASPNET_CORE_SRC"
    dotnet new web -n "$ASPNET_CORE_PROJECT" -o "$ASPNET_CORE_SRC" --force
    (
        cd "$ASPNET_CORE_SRC"
        dotnet add package "$ASPNET_CORE_SCRIPTING_PACKAGE" --no-restore
        dotnet restore
    )
fi

if $needs_phalcon && [[ ! -d "$PHALCON_SRC/vendor" ]]; then
    echo "Generating Phalcon skeleton..."
    rm -rf "$PHALCON_SRC"
    composer create-project "$PHALCON_PROJECT" "$PHALCON_SRC" "$PHALCON_VERSION" \
        --no-interaction --ignore-platform-reqs
fi

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
