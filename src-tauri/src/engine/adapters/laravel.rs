use std::collections::HashMap;
use std::path::Path;
use std::process::Command;

use super::framework::{ensure_skeleton, write_bootstrap};
use super::{script_command, AdapterError, PrepareContext, PrepareResult, RuntimeAdapter};

pub struct LaravelAdapter;

impl RuntimeAdapter for LaravelAdapter {
    fn runtime_id(&self) -> &str {
        "laravel"
    }

    fn build_command(&self, binary: &Path, script: &Path) -> Command {
        script_command(binary, script)
    }

    fn prepare(&self, ctx: PrepareContext<'_>) -> Result<PrepareResult, AdapterError> {
        let skeleton_root = ensure_skeleton(self.runtime_id(), ctx.extra_paths)
            .map_err(AdapterError::Framework)?;
        let bootstrap_path =
            write_bootstrap(ctx.workspace_path, ctx.snippet_path, &skeleton_root)
                .map_err(|e| AdapterError::Prepare(e.to_string()))?;
        Ok(PrepareResult {
            script_path: bootstrap_path,
            extra_env: HashMap::new(),
        })
    }
}
