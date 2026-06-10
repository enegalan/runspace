#[cfg(test)]
mod integration;

mod framework;
mod laravel;
mod node;
mod php;
mod python;
mod ruby;
mod symfony;

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;

pub use framework::FrameworkSkeletonError;

pub struct PrepareContext<'a> {
    pub workspace_path: &'a Path,
    pub snippet_path: &'a Path,
    pub extra_paths: &'a HashMap<String, String>,
}

pub struct PrepareResult {
    pub script_path: PathBuf,
    pub extra_env: HashMap<String, String>,
}

#[derive(Debug)]
pub enum AdapterError {
    Unsupported(String),
    Prepare(String),
    Framework(FrameworkSkeletonError),
}

impl std::fmt::Display for AdapterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AdapterError::Unsupported(id) => write!(f, "Unsupported environment: {id}"),
            AdapterError::Prepare(msg) => write!(f, "{msg}"),
            AdapterError::Framework(err) => write!(f, "{err}"),
        }
    }
}

pub trait RuntimeAdapter: Send + Sync {
    fn runtime_id(&self) -> &str;
    fn file_extension(&self) -> &str;
    fn entry_filename(&self) -> String {
        format!("main.{}", self.file_extension())
    }
    fn default_template(&self) -> &str;
    fn normalize_code(&self, code: &str) -> String {
        code.to_string()
    }
    fn build_command(&self, binary: &Path, script: &Path) -> Command;
    fn prepare(&self, ctx: PrepareContext<'_>) -> Result<PrepareResult, AdapterError> {
        Ok(PrepareResult {
            script_path: ctx.snippet_path.to_path_buf(),
            extra_env: HashMap::new(),
        })
    }
}

pub fn get_adapter(environment_id: &str) -> Result<Box<dyn RuntimeAdapter>, AdapterError> {
    match environment_id {
        "nodejs" => Ok(Box::new(node::NodeAdapter)),
        "php" => Ok(Box::new(php::PhpAdapter)),
        "python" => Ok(Box::new(python::PythonAdapter)),
        "ruby" => Ok(Box::new(ruby::RubyAdapter)),
        "laravel" => Ok(Box::new(laravel::LaravelAdapter)),
        "symfony" => Ok(Box::new(symfony::SymfonyAdapter)),
        _ => Err(AdapterError::Unsupported(environment_id.to_string())),
    }
}

pub fn script_command(binary: &Path, script: &Path) -> Command {
    let mut cmd = Command::new(binary);
    cmd.arg(script);
    cmd
}

#[cfg(test)]
mod tests {
    use super::*;

    fn adapter_ids() -> Vec<&'static str> {
        vec!["nodejs", "php", "python", "ruby", "laravel", "symfony"]
    }

    #[test]
    fn each_adapter_builds_binary_plus_script_arg() {
        let binary = PathBuf::from("/usr/bin/runtime");
        let script = PathBuf::from("/tmp/workspace/main.txt");

        for id in adapter_ids() {
            let adapter = get_adapter(id).expect("adapter");
            let cmd = adapter.build_command(&binary, &script);
            let args: Vec<_> = cmd
                .get_args()
                .map(|arg| arg.to_string_lossy().to_string())
                .collect();
            assert_eq!(cmd.get_program(), binary, "{id} program");
            assert_eq!(args, vec![script.to_string_lossy().to_string()], "{id} args");
        }
    }

    #[test]
    fn entry_filenames_match_environment() {
        let expectations = [
            ("nodejs", "main.js"),
            ("php", "main.php"),
            ("python", "main.py"),
            ("ruby", "main.rb"),
            ("laravel", "snippet.php"),
            ("symfony", "snippet.php"),
        ];

        for (id, expected) in expectations {
            let adapter = get_adapter(id).expect("adapter");
            assert_eq!(adapter.entry_filename(), expected);
        }
    }
}
