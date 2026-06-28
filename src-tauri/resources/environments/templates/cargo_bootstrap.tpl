#!/bin/sh
set -e
export RUNSPACE_FRAMEWORK_ROOT='{{skeleton_root}}'
export RUNSPACE_ENTRY_PATH='{{entry_file}}'
export RUNSPACE_WORKSPACE='{{workspace_path}}'
cd "$RUNSPACE_FRAMEWORK_ROOT"
exec '{{cargo_path}}' run --quiet --bin runspace-entry
