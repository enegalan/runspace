#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
AXUM_SRC="$GEN/axum"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
AXUM_DEST="$REPO_ROOT/src-tauri/resources/frameworks/axum"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
AXUM_VERSION="${RUNSPACE_AXUM_VERSION:-0.8}"

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

axum_ready() {
    [[ -f "$AXUM_DEST/Cargo.toml" ]] &&
        [[ -f "$AXUM_DEST/Cargo.lock" ]] &&
        [[ -f "$AXUM_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_axum=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! axum_ready; then
    needs_axum=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_axum; then
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

if $needs_axum && ! command -v cargo >/dev/null 2>&1; then
    echo "cargo is required to prepare the Axum skeleton." >&2
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

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
