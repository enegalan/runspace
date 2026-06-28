#!/usr/bin/env bash
set -euo pipefail

export RUNSPACE_FRAMEWORK_ROOT='{{skeleton_root}}'
export RUNSPACE_WORKSPACE='{{workspace_path}}'

ENTRY='{{entry_file}}'
RUN="$RUNSPACE_WORKSPACE/.runspace-cargo-run"

rm -rf "$RUN"
mkdir -p "$RUN/src"
cp "$RUNSPACE_FRAMEWORK_ROOT/Cargo.toml" "$RUN/"
cp "$RUNSPACE_FRAMEWORK_ROOT/Cargo.lock" "$RUN/"
cp "$ENTRY" "$RUN/src/main.rs"

cd "$RUN"
exec {{cargo_path}} run --quiet
