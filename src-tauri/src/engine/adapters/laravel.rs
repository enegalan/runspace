use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

use super::framework::{find_php, run_php_command, FrameworkSkeletonError};
use super::{
    ensure_framework_ready, script_command, AdapterError, PrepareContext, PrepareResult,
    RuntimeAdapter,
};

pub struct LaravelAdapter;

impl RuntimeAdapter for LaravelAdapter {
    fn runtime_id(&self) -> &str {
        "laravel"
    }

    fn build_command(&self, binary: &Path, script: &Path) -> Command {
        script_command(binary, script)
    }

    fn prepare(&self, ctx: PrepareContext<'_>) -> Result<PrepareResult, AdapterError> {
        let skeleton_root =
            ensure_framework_ready(self, ctx.extra_paths).map_err(AdapterError::Framework)?;
        let bootstrap_path =
            super::framework::write_bootstrap(ctx.workspace_path, ctx.snippet_path, &skeleton_root)
                .map_err(|e| AdapterError::Prepare(e.to_string()))?;
        Ok(PrepareResult {
            script_path: bootstrap_path,
            extra_env: HashMap::new(),
        })
    }

    fn post_install(
        &self,
        target: &Path,
        extra_paths: &HashMap<String, String>,
    ) -> Result<(), FrameworkSkeletonError> {
        let php = find_php(extra_paths).ok_or(FrameworkSkeletonError::Copy(
            "PHP binary not found for skeleton setup".to_string(),
        ))?;

        let sqlite = target.join("database").join("database.sqlite");
        if !sqlite.is_file() {
            if let Some(parent) = sqlite.parent() {
                fs::create_dir_all(parent).map_err(FrameworkSkeletonError::Io)?;
            }
            fs::File::create(&sqlite).map_err(FrameworkSkeletonError::Io)?;
        }

        run_php_command(
            &php,
            target,
            &["artisan", "migrate", "--force", "--no-interaction"],
        )
    }
}
