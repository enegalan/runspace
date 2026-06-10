use std::collections::HashMap;
use std::path::Path;
use std::process::Command;

use super::{script_command, PrepareContext, PrepareResult, RuntimeAdapter};

pub struct PhpAdapter;

impl RuntimeAdapter for PhpAdapter {
    fn runtime_id(&self) -> &str {
        "php"
    }

    fn file_extension(&self) -> &str {
        "php"
    }

    fn default_template(&self) -> &str {
        "<?php\necho \"Hello from PHP!\";\n"
    }

    fn normalize_code(&self, code: &str) -> String {
        normalize_php_snippet(code)
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

pub fn normalize_php_snippet(code: &str) -> String {
    let trimmed = code.trim();
    if trimmed.is_empty() {
        return code.to_string();
    }
    if trimmed.contains("<?php") || trimmed.contains("<?=") || trimmed.starts_with("<?") {
        return code.to_string();
    }
    format!("<?php\n{code}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_php_open_tag_when_missing() {
        assert_eq!(
            normalize_php_snippet("echo \"hi\";"),
            "<?php\necho \"hi\";"
        );
    }

    #[test]
    fn keeps_existing_php_tag() {
        let code = "<?php\necho \"hi\";";
        assert_eq!(normalize_php_snippet(code), code);
    }
}
