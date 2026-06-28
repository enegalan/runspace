#!/bin/sh
set -e
export RUNSPACE_FRAMEWORK_ROOT='{{skeleton_root}}'
export RUNSPACE_ENTRY_PATH='{{entry_file}}'
#!/usr/bin/env bash
set -euo pipefail


cd '{{skeleton_root}}'
exec '{{cargo_path}}' run --quiet --bin runspace_entry
export RUNSPACE_WORKSPACE='{{workspace_path}}'
cd "$RUNSPACE_FRAMEWORK_ROOT"
exec '{{cargo_path}}' run --quiet --bin runspace-entry
