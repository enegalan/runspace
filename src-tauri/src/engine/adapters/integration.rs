#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::process::Command;

    use super::super::{get_adapter, PrepareContext};
    use std::collections::HashMap;

    fn runtime_binary(names: &[&str]) -> Option<PathBuf> {
        for name in names {
            if let Ok(path) = which::which(name) {
                return Some(path);
            }
        }
        None
    }

    fn run_hello(environment_id: &str, binary: PathBuf, template: &str) {
        let adapter = get_adapter(environment_id).expect("adapter");
        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-{environment_id}-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_dir).expect("temp dir");

        let entry = adapter.entry_filename();
        let snippet_path = temp_dir.join(&entry);
        std::fs::write(&snippet_path, template).expect("write snippet");

        let prepared = adapter
            .prepare(PrepareContext {
                workspace_path: &temp_dir,
                snippet_path: &snippet_path,
                extra_paths: &HashMap::new(),
            })
            .expect("prepare");

        let output = Command::new(&binary)
            .arg(&prepared.script_path)
            .current_dir(&temp_dir)
            .envs(prepared.extra_env)
            .output()
            .expect("run");

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        assert!(
            output.status.success(),
            "{environment_id} failed: stdout={stdout} stderr={stderr}"
        );
        assert!(!stdout.trim().is_empty(), "{environment_id} empty stdout");

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    #[ignore = "requires node in PATH"]
    fn integration_node_hello() {
        let Some(binary) = runtime_binary(&["node"]) else {
            return;
        };
        run_hello("nodejs", binary, "console.log('hi');\n");
    }

    #[test]
    #[ignore = "requires php in PATH"]
    fn integration_php_hello() {
        let Some(binary) = runtime_binary(&["php"]) else {
            return;
        };
        run_hello("php", binary, "<?php echo 'hi';\n");
    }

    #[test]
    #[ignore = "requires python3 in PATH"]
    fn integration_python_hello() {
        let Some(binary) = runtime_binary(&["python3", "python"]) else {
            return;
        };
        run_hello("python", binary, "print('hi')\n");
    }

    #[test]
    #[ignore = "requires ruby in PATH"]
    fn integration_ruby_hello() {
        let Some(binary) = runtime_binary(&["ruby"]) else {
            return;
        };
        run_hello("ruby", binary, "puts 'hi'\n");
    }

    #[test]
    #[ignore = "requires php, composer, and network for skeleton install"]
    fn integration_laravel_hello() {
        let Some(binary) = runtime_binary(&["php"]) else {
            return;
        };
        let adapter = get_adapter("laravel").expect("adapter");
        run_hello("laravel", binary, adapter.default_template());
    }

    #[test]
    #[ignore = "requires php, composer, and network for skeleton install"]
    fn integration_symfony_hello() {
        let Some(binary) = runtime_binary(&["php"]) else {
            return;
        };
        let adapter = get_adapter("symfony").expect("adapter");
        run_hello("symfony", binary, adapter.default_template());
    }
}
