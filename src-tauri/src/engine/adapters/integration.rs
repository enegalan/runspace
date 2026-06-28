#[cfg(test)]
mod tests {
    use std::collections::HashMap;
    use std::path::PathBuf;
    use std::process::Command;

    use crate::engine::profiles::{build_run_command, prepare, require_manifest, PrepareContext};
    use crate::environment::manifest::EnvironmentManifest;
    use crate::environment::registry::registry;

    fn runtime_binary(names: &[&str]) -> Option<PathBuf> {
        for name in names {
            if let Ok(path) = which::which(name) {
                return Some(path);
            }
        }
        None
    }

    fn integration_extra_paths(manifest: &EnvironmentManifest) -> HashMap<String, String> {
        let mut paths = HashMap::new();
        for field in &manifest.config_fields {
            if field.primary {
                continue;
            }
            let Some(detect) = field.detect.as_ref() else {
                continue;
            };
            if let Some(path) = detect
                .commands
                .iter()
                .find_map(|command| which::which(command).ok())
            {
                paths.insert(field.key.clone(), path.to_string_lossy().to_string());
            }
        }
        paths
    }

    fn framework_dependencies_available(manifest: &EnvironmentManifest) -> bool {
        let resolved = integration_extra_paths(manifest);
        manifest.config_fields.iter().all(|field| {
            if field.primary || field.detect.is_none() {
                return true;
            }
            resolved.contains_key(&field.key)
        })
    }

    fn sample_script_name(environment_id: &str) -> String {
        registry()
            .get(environment_id)
            .map(|manifest| format!("main.{}", manifest.file_extension))
            .unwrap_or_else(|| "main.txt".to_string())
    }

    fn run_hello(environment_id: &str, binary: PathBuf, template: &str) {
        let manifest = require_manifest(environment_id).expect("manifest");
        if matches!(
            manifest.profile,
            crate::environment::manifest::EnvironmentProfile::Framework
        ) && !framework_dependencies_available(&manifest)
        {
            return;
        }

        let temp_dir = std::env::temp_dir().join(format!(
            "runspace-{environment_id}-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&temp_dir).expect("temp dir");

        let snippet_path = temp_dir.join(sample_script_name(environment_id));
        std::fs::write(&snippet_path, template).expect("write snippet");

        let primary_key = manifest
            .primary_binary_field_key()
            .expect("primary binary field")
            .to_string();
        let mut paths = integration_extra_paths(&manifest);
        paths.insert(primary_key, binary.to_string_lossy().to_string());

        let prepared = prepare(PrepareContext {
            environment_id,
            workspace_path: &temp_dir,
            snippet_path: &snippet_path,
            extra_paths: &paths,
        })
        .expect("prepare");

        let built = build_run_command(manifest, &paths, &prepared.script_path, &temp_dir)
            .expect("run command");

        let output = Command::new(built.get_program())
            .args(built.get_args())
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
        run_hello(
            "laravel",
            binary,
            "<?php\n\nuse Illuminate\\Support\\Str;\n\necho Str::upper('Hello from Laravel!');\n",
        );
    }

    #[test]
    #[ignore = "requires php, composer, and network for skeleton install"]
    fn integration_symfony_hello() {
        let Some(binary) = runtime_binary(&["php"]) else {
            return;
        };
        run_hello(
            "symfony",
            binary,
            "<?php\n\nuse Symfony\\Component\\String\\UnicodeString;\n\necho (new UnicodeString('hello'))->upper();\n",
        );
    }

    #[test]
    #[ignore = "requires dotnet and network for skeleton install"]
    fn integration_minimal_apis_hello() {
        let Some(binary) = runtime_binary(&["dotnet"]) else {
            return;
        };
        run_hello("minimal-apis", binary, "Console.WriteLine(\"hi\");\n");
    }
}
