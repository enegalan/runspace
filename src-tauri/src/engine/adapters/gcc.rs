use std::path::Path;
use std::process::Command;

use super::{CompiledAdapter, RuntimeAdapter};

pub struct GccAdapter;

impl RuntimeAdapter for GccAdapter {
    fn runtime_id(&self) -> &str {
        "gcc"
    }

    fn file_extension(&self) -> &str {
        "c"
    }

    fn default_template(&self) -> &str {
        "#include <stdio.h>\n\nint main() {\n    printf(\"Hello from C!\\n\");\n    return 0;\n}\n"
    }

    fn build_command(&self, _binary: &Path, _script: &Path) -> Command {
        Command::new("gcc")
    }
}

impl CompiledAdapter for GccAdapter {
    fn compile_command(&self, compiler: &Path, source: &Path, output: &Path) -> Command {
        let mut cmd = Command::new(compiler);
        cmd.args([
            "-o",
            output.to_str().expect("output path"),
            source.to_str().expect("source path"),
        ]);
        cmd.arg("-Wall");
        cmd.arg("-std=c11");
        cmd
    }
}
