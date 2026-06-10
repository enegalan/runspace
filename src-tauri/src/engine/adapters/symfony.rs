use std::path::Path;
use std::process::Command;

use super::framework::{ensure_skeleton, framework_extra_env, write_bootstrap};
use super::php::normalize_php_snippet;
use super::{script_command, AdapterError, PrepareContext, PrepareResult, RuntimeAdapter};

pub struct SymfonyAdapter;

impl RuntimeAdapter for SymfonyAdapter {
    fn runtime_id(&self) -> &str {
        "symfony"
    }

    fn file_extension(&self) -> &str {
        "php"
    }

    fn entry_filename(&self) -> String {
        "snippet.php".to_string()
    }

    fn default_template(&self) -> &str {
        "<?php\n\nuse Symfony\\Component\\String\\UnicodeString;\n\necho (new UnicodeString('hello'))->upper();\n"
    }

    fn normalize_code(&self, code: &str) -> String {
        normalize_php_snippet(code)
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
        let extra_env = framework_extra_env(&skeleton_root, ctx.snippet_path);

        Ok(PrepareResult {
            script_path: bootstrap_path,
            extra_env,
        })
    }
}
