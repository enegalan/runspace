use std::path::{Component, Path};

#[derive(Debug)]
pub enum SecurityError {
    PathOutsideWorkspace(String),
}

impl std::fmt::Display for SecurityError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SecurityError::PathOutsideWorkspace(path) => {
                write!(f, "Path outside workspace: {path}")
            }
        }
    }
}

pub fn validate_path_in_workspace(workspace: &Path, file: &Path) -> Result<(), SecurityError> {
    for component in file.components() {
        if matches!(component, Component::ParentDir) {
            return Err(SecurityError::PathOutsideWorkspace(
                file.display().to_string(),
            ));
        }
    }

    let workspace = workspace
        .canonicalize()
        .unwrap_or_else(|_| workspace.to_path_buf());

    let resolved = if file.is_absolute() {
        file.to_path_buf()
    } else {
        workspace.join(file)
    };

    let resolved = match resolved.canonicalize() {
        Ok(path) => path,
        Err(_) => {
            let parent = resolved.parent().unwrap_or(&workspace);
            let parent = parent
                .canonicalize()
                .unwrap_or_else(|_| parent.to_path_buf());
            parent.join(
                resolved
                    .file_name()
                    .unwrap_or_else(|| std::ffi::OsStr::new("")),
            )
        }
    };

    if resolved.starts_with(&workspace) {
        Ok(())
    } else {
        Err(SecurityError::PathOutsideWorkspace(
            file.display().to_string(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    #[test]
    fn validate_path_in_workspace_rejects_outside_paths() {
        let workspace = PathBuf::from("/tmp/runspace-test-workspace");
        fs::create_dir_all(&workspace).expect("workspace dir");

        let outside = PathBuf::from("/etc/passwd");
        let result = validate_path_in_workspace(&workspace, &outside);

        assert!(result.is_err());

        let _ = fs::remove_dir_all(&workspace);
    }

    #[test]
    fn validate_path_in_workspace_accepts_inside_paths() {
        let workspace = PathBuf::from("/tmp/runspace-test-workspace-inner");
        fs::create_dir_all(&workspace).expect("workspace dir");

        let inside = workspace.join("main.js");
        let result = validate_path_in_workspace(&workspace, &inside);

        assert!(result.is_ok());

        let _ = fs::remove_dir_all(&workspace);
    }
}
