#!/usr/bin/env bash
set -euo pipefail

export RUNSPACE_FRAMEWORK_ROOT='{{skeleton_root}}'
export RUNSPACE_ENTRY_PATH='{{entry_file}}'

cd '{{skeleton_root}}'
exec '{{cargo_path}}' run --quiet --bin runspace_entry
