use std::fs;
use std::path::PathBuf;

use uuid::Uuid;

use crate::security::layer::{validate_path_in_workspace, SecurityError};

#[derive(Debug)]
pub enum WorkspaceError {
    Io(std::io::Error),
    Security(SecurityError),
    InvalidPath(String),
}

impl From<std::io::Error> for WorkspaceError {
    fn from(err: std::io::Error) -> Self {
        WorkspaceError::Io(err)
    }
}

impl From<SecurityError> for WorkspaceError {
    fn from(err: SecurityError) -> Self {
        WorkspaceError::Security(err)
    }
}

impl std::fmt::Display for WorkspaceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            WorkspaceError::Io(e) => write!(f, "IO error: {e}"),
            WorkspaceError::Security(e) => write!(f, "Security error: {e}"),
            WorkspaceError::InvalidPath(p) => write!(f, "Invalid path: {p}"),
        }
    }
}

pub struct Workspace {
    pub id: String,
    pub path: PathBuf,
}

pub struct WorkspaceManager {
    base_dir: PathBuf,
}

impl WorkspaceManager {
    pub fn new() -> Result<Self, WorkspaceError> {
        let home = std::env::var("HOME").map_err(|_| {
            WorkspaceError::InvalidPath("Could not resolve home directory".to_string())
        })?;
        let base_dir = PathBuf::from(home).join(".runspace");
        fs::create_dir_all(base_dir.join("workspaces"))?;
        Ok(Self { base_dir })
    }

    pub fn create_workspace(&self) -> Result<Workspace, WorkspaceError> {
        let id = Uuid::new_v4().to_string();
        let path = self.base_dir.join("workspaces").join(&id);
        fs::create_dir_all(&path)?;
        Ok(Workspace { id, path })
    }

    pub fn write_file(
        &self,
        workspace: &Workspace,
        filename: &str,
        content: &str,
    ) -> Result<PathBuf, WorkspaceError> {
        let file_path = workspace.path.join(filename);
        validate_path_in_workspace(&workspace.path, &file_path)?;
        fs::write(&file_path, content)?;
        Ok(file_path)
    }

    // Phase 1: workspaces are kept after app close for debugging.
    #[allow(dead_code)]
    pub fn cleanup_workspace(&self, workspace: &Workspace) -> Result<(), WorkspaceError> {
        if workspace.path.exists() {
            fs::remove_dir_all(&workspace.path)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn write_file_writes_inside_workspace() {
        let manager = WorkspaceManager::new().expect("manager");
        let workspace = manager.create_workspace().expect("workspace");
        let path = manager
            .write_file(&workspace, "main.js", "console.log(1);")
            .expect("write");

        assert!(path.starts_with(&workspace.path));
        assert!(path.exists());
        let content = fs::read_to_string(&path).expect("read");
        assert_eq!(content, "console.log(1);");
    }
}
