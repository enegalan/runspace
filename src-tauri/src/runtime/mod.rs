use std::path::PathBuf;

pub fn resolve_binary(runtime_id: &str) -> Result<PathBuf, String> {
    match runtime_id {
        "node" => resolve_node_binary(),
        other => Err(format!("Unsupported runtime: {other}")),
    }
}

pub fn script_filename(runtime_id: &str) -> Result<&'static str, String> {
    match runtime_id {
        "node" => Ok("main.js"),
        other => Err(format!("Unsupported runtime: {other}")),
    }
}

fn resolve_node_binary() -> Result<PathBuf, String> {
    if let Ok(path) = which::which("node") {
        return Ok(path);
    }

    for candidate in ["/opt/homebrew/bin/node", "/usr/local/bin/node"] {
        let path = PathBuf::from(candidate);
        if path.is_file() {
            return Ok(path);
        }
    }

    Err("Node.js not found".to_string())
}

#[cfg(test)]
mod tests {
    use super::{resolve_binary, script_filename};

    #[test]
    fn resolve_binary_rejects_unknown_runtime() {
        let err = resolve_binary("python").unwrap_err();
        assert!(err.contains("Unsupported runtime"));
    }

    #[test]
    fn script_filename_for_node() {
        assert_eq!(script_filename("node").unwrap(), "main.js");
    }

    #[test]
    fn script_filename_rejects_unknown_runtime() {
        let err = script_filename("bun").unwrap_err();
        assert!(err.contains("Unsupported runtime"));
    }
}
