use std::collections::HashMap;
use std::path::Path;
use std::process::Command;

use super::{script_command, PrepareContext, PrepareResult, RuntimeAdapter};

pub struct RubyAdapter;

impl RuntimeAdapter for RubyAdapter {
    fn runtime_id(&self) -> &str {
        "ruby"
    }

    fn build_command(&self, binary: &Path, script: &Path) -> Command {
        script_command(binary, script)
    }

    fn prepare(&self, ctx: PrepareContext<'_>) -> Result<PrepareResult, super::AdapterError> {
        Ok(PrepareResult {
            script_path: ctx.snippet_path.to_path_buf(),
            extra_env: HashMap::new(),
        })
    }
}
