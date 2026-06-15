use std::path::Path;
use std::process::Command;

use super::{CompiledAdapter, RuntimeAdapter};

pub struct GppAdapter;

impl RuntimeAdapter for GppAdapter {
    fn runtime_id(&self) -> &str {
        "gpp"
    }

    fn build_command(&self, _binary: &Path, _script: &Path) -> Command {
        Command::new("g++")
    }
}

impl CompiledAdapter for GppAdapter {
    fn compile_command(&self, compiler: &Path, source: &Path, output: &Path) -> Command {
        let mut cmd = Command::new(compiler);
        cmd.args([
            "-o",
            output.to_str().expect("output path"),
            source.to_str().expect("source path"),
        ]);
        cmd.arg("-Wall");
        cmd.arg("-std=c++17");
        cmd
    }
}
