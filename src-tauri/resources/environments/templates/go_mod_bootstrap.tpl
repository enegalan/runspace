#!/bin/sh
set -e

export RUNSPACE_FRAMEWORK_ROOT='{{skeleton_root}}'
export RUNSPACE_WORKSPACE='{{workspace_path}}'
export RUNSPACE_ENTRY_PATH='{{entry_file}}'

GOFLAGS=
if [ -f '{{skeleton_root}}/vendor/modules.txt' ]; then
  GOFLAGS=-mod=vendor
fi
export GOFLAGS

cd '{{skeleton_root}}'
exec '{{go_path}}' run '{{entry_file}}'
