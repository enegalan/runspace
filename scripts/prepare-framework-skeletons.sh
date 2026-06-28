#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN="${RUNSPACE_SKELETON_GEN:-/tmp/runspace-skeleton-gen}"
LARAVEL_SRC="$GEN/laravel"
SYMFONY_SRC="$GEN/symfony"
EXPRESS_SRC="$GEN/express"
ROCKET_SRC="$GEN/rocket"
LARAVEL_DEST="$REPO_ROOT/src-tauri/resources/frameworks/laravel"
SYMFONY_DEST="$REPO_ROOT/src-tauri/resources/frameworks/symfony"
EXPRESS_DEST="$REPO_ROOT/src-tauri/resources/frameworks/express"
ROCKET_DEST="$REPO_ROOT/src-tauri/resources/frameworks/rocket"

LARAVEL_PROJECT="${RUNSPACE_LARAVEL_PROJECT:-laravel/laravel}"
LARAVEL_VERSION="${RUNSPACE_LARAVEL_VERSION:-12.*}"
SYMFONY_PROJECT="${RUNSPACE_SYMFONY_PROJECT:-symfony/skeleton}"
SYMFONY_VERSION="${RUNSPACE_SYMFONY_VERSION:-7.4.*}"
EXPRESS_VERSION="${RUNSPACE_EXPRESS_VERSION:-^5.0.0}"
ROCKET_VERSION="${RUNSPACE_ROCKET_VERSION:-0.5.1}"

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

rocket_ready() {
    [[ -f "$ROCKET_DEST/Cargo.toml" ]] &&
        [[ -f "$ROCKET_DEST/Cargo.lock" ]] &&
        [[ -f "$ROCKET_DEST/skeleton.version" ]]
}

force_sync() {
    [[ "${RUNSPACE_FORCE_FRAMEWORK_SYNC:-}" == "1" ]]
}

needs_laravel=false
needs_symfony=false
needs_express=false
needs_rocket=false

if force_sync || ! laravel_ready; then
    needs_laravel=true
fi
if force_sync || ! symfony_ready; then
    needs_symfony=true
fi
if force_sync || ! express_ready; then
    needs_express=true
fi
if force_sync || ! rocket_ready; then
    needs_rocket=true
fi

if ! $needs_laravel && ! $needs_symfony && ! $needs_express && ! $needs_rocket; then
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

if $needs_rocket && ! command -v cargo >/dev/null 2>&1; then
    echo "Cargo is required to prepare the Rocket skeleton." >&2
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

exec "$REPO_ROOT/scripts/sync-framework-skeletons.sh" "$GEN"
