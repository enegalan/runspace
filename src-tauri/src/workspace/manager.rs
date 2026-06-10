use std::fs;
use std::path::PathBuf;

use chrono::Utc;
use uuid::Uuid;

use crate::engine::adapters::{get_adapter, RuntimeAdapter};
use crate::security::layer::{validate_path_in_workspace, SecurityError};

use super::types::{
    FileEntry, SessionData, WorkspaceInfo, WorkspaceManifest, MANIFEST_FILENAME,
};

#[derive(Debug)]
pub enum WorkspaceError {
    Io(std::io::Error),
    Security(SecurityError),
    InvalidPath(String),
    NotFound(String),
    AlreadyExists(String),
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
            WorkspaceError::NotFound(p) => write!(f, "Not found: {p}"),
            WorkspaceError::AlreadyExists(p) => write!(f, "Already exists: {p}"),
        }
    }
}

#[derive(Clone)]
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

    fn workspaces_dir(&self) -> PathBuf {
        self.base_dir.join("workspaces")
    }

    fn session_path(&self) -> PathBuf {
        self.base_dir.join("session.json")
    }

    fn resolve_relative_path(relative: &str) -> Result<PathBuf, WorkspaceError> {
        if relative.is_empty() {
            return Ok(PathBuf::new());
        }
        if relative.contains("..") {
            return Err(WorkspaceError::InvalidPath(relative.to_string()));
        }
        Ok(PathBuf::from(relative))
    }

    fn resolve_in_workspace(
        workspace: &Workspace,
        relative: &str,
    ) -> Result<PathBuf, WorkspaceError> {
        let relative_path = Self::resolve_relative_path(relative)?;
        let full = workspace.path.join(&relative_path);
        validate_path_in_workspace(&workspace.path, &full)?;
        Ok(full)
    }

    pub fn list_workspaces_for_runtime(
        &self,
        runtime_id: Option<&str>,
    ) -> Result<Vec<WorkspaceInfo>, WorkspaceError> {
        let mut workspaces = Vec::new();
        for workspace in self.list_workspace_dirs()? {
            if !workspace.path.join(MANIFEST_FILENAME).is_file() {
                continue;
            }
            let info = match self.workspace_info(&workspace) {
                Ok(info) => info,
                Err(_) => continue,
            };
            if let Some(runtime_id) = runtime_id {
                if info.runtime_id != runtime_id {
                    continue;
                }
            }
            workspaces.push(info);
        }

        workspaces.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        Ok(workspaces)
    }

    pub fn open_workspace(&self, id: &str) -> Result<Workspace, WorkspaceError> {
        if id.contains("..") || id.contains('/') || id.contains('\\') {
            return Err(WorkspaceError::InvalidPath(id.to_string()));
        }
        let path = self.workspaces_dir().join(id);
        if !path.is_dir() {
            return Err(WorkspaceError::NotFound(id.to_string()));
        }
        Ok(Workspace {
            id: id.to_string(),
            path,
        })
    }

    pub fn create_workspace(&self) -> Result<Workspace, WorkspaceError> {
        self.create_named_workspace("Untitled", "nodejs")
    }

    pub fn create_named_workspace(
        &self,
        name: &str,
        runtime_id: &str,
    ) -> Result<Workspace, WorkspaceError> {
        let id = Uuid::new_v4().to_string();
        let path = self.workspaces_dir().join(&id);
        fs::create_dir_all(&path)?;

        let adapter = get_adapter(runtime_id).map_err(|e| {
            WorkspaceError::InvalidPath(format!("Unsupported runtime: {e}"))
        })?;
        let entry_file = adapter.entry_filename();
        let now = Utc::now().to_rfc3339();

        let workspace = Workspace {
            id: id.clone(),
            path,
        };

        let manifest = WorkspaceManifest {
            name: name.to_string(),
            runtime_id: runtime_id.to_string(),
            entry_file: entry_file.clone(),
            created_at: now.clone(),
            updated_at: now,
        };
        self.write_manifest(&workspace, &manifest)?;

        Ok(workspace)
    }

    pub fn read_manifest(&self, workspace: &Workspace) -> Result<WorkspaceManifest, WorkspaceError> {
        let path = workspace.path.join(MANIFEST_FILENAME);
        let content = fs::read_to_string(&path)?;
        serde_json::from_str(&content).map_err(|e| {
            WorkspaceError::InvalidPath(format!("Invalid manifest: {e}"))
        })
    }

    pub fn write_manifest(
        &self,
        workspace: &Workspace,
        manifest: &WorkspaceManifest,
    ) -> Result<(), WorkspaceError> {
        let path = workspace.path.join(MANIFEST_FILENAME);
        validate_path_in_workspace(&workspace.path, &path)?;
        let json = serde_json::to_string_pretty(manifest).map_err(|e| {
            WorkspaceError::InvalidPath(format!("Manifest serialization failed: {e}"))
        })?;
        fs::write(path, json)?;
        Ok(())
    }

    pub fn workspace_info(&self, workspace: &Workspace) -> Result<WorkspaceInfo, WorkspaceError> {
        let manifest = self.read_manifest(workspace)?;
        Ok(WorkspaceInfo {
            id: workspace.id.clone(),
            name: manifest.name,
            runtime_id: manifest.runtime_id,
            entry_file: manifest.entry_file,
        })
    }

    pub fn list_workspace_dirs(&self) -> Result<Vec<Workspace>, WorkspaceError> {
        let dir = self.workspaces_dir();
        if !dir.exists() {
            return Ok(Vec::new());
        }

        let mut workspaces = Vec::new();
        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            if !entry.file_type()?.is_dir() {
                continue;
            }
            workspaces.push(Workspace {
                id: entry.file_name().to_string_lossy().to_string(),
                path: entry.path(),
            });
        }

        workspaces.sort_by(|a, b| a.id.cmp(&b.id));
        Ok(workspaces)
    }

    fn detect_entry_file(
        workspace: &Workspace,
        adapter: &dyn RuntimeAdapter,
    ) -> Result<String, WorkspaceError> {
        let default = adapter.entry_filename();
        if workspace.path.join(&default).is_file() {
            return Ok(default);
        }

        let mut files = Vec::new();
        for entry in fs::read_dir(&workspace.path)? {
            let entry = entry?;
            if entry.file_type()?.is_file() {
                files.push(entry.file_name().to_string_lossy().to_string());
            }
        }

        files.sort();
        if let Some(name) = files.iter().find(|name| name.starts_with("main.")) {
            return Ok(name.clone());
        }
        if let Some(name) = files.first() {
            return Ok(name.clone());
        }

        Ok(default)
    }

    pub fn ensure_workspace_info(
        &self,
        workspace: &Workspace,
        default_runtime_id: &str,
    ) -> Result<WorkspaceInfo, WorkspaceError> {
        if workspace.path.join(MANIFEST_FILENAME).is_file() {
            return self.workspace_info(workspace);
        }

        let adapter = get_adapter(default_runtime_id).map_err(|e| {
            WorkspaceError::InvalidPath(format!("Unsupported runtime: {e}"))
        })?;
        let entry_file = Self::detect_entry_file(workspace, adapter.as_ref())?;
        let now = Utc::now().to_rfc3339();
        let manifest = WorkspaceManifest {
            name: "Untitled".to_string(),
            runtime_id: default_runtime_id.to_string(),
            entry_file: entry_file.clone(),
            created_at: now.clone(),
            updated_at: now,
        };
        self.write_manifest(workspace, &manifest)?;

        Ok(WorkspaceInfo {
            id: workspace.id.clone(),
            name: manifest.name,
            runtime_id: manifest.runtime_id,
            entry_file: manifest.entry_file,
        })
    }

    fn workspace_matches_runtime(
        &self,
        workspace: &Workspace,
        runtime_id: &str,
    ) -> Result<Option<WorkspaceInfo>, WorkspaceError> {
        if workspace.path.join(MANIFEST_FILENAME).is_file() {
            let info = self.workspace_info(workspace)?;
            if info.runtime_id == runtime_id {
                return Ok(Some(info));
            }
            return Ok(None);
        }

        Ok(Some(self.ensure_workspace_info(workspace, runtime_id)?))
    }

    pub fn initialize_active_workspace(
        &self,
        runtime_id: &str,
        session: &SessionData,
    ) -> Result<(Workspace, WorkspaceInfo), WorkspaceError> {
        let env_session = session.environment_session(runtime_id);

        if let Some(id) = env_session.workspace_id.as_ref() {
            if let Ok(workspace) = self.open_workspace(id) {
                if let Ok(Some(info)) = self.workspace_matches_runtime(&workspace, runtime_id) {
                    return Ok((workspace, info));
                }
            }
        }

        for info in self.list_workspaces_for_runtime(Some(runtime_id))? {
            if let Ok(workspace) = self.open_workspace(&info.id) {
                return Ok((workspace, info));
            }
        }

        Err(WorkspaceError::NotFound(format!(
            "No workspace found for runtime: {runtime_id}"
        )))
    }

    pub fn list_files(
        &self,
        workspace: &Workspace,
        relative_path: Option<&str>,
    ) -> Result<Vec<FileEntry>, WorkspaceError> {
        let rel = relative_path.unwrap_or("");
        let dir = Self::resolve_in_workspace(workspace, rel)?;
        if !dir.exists() {
            return Ok(Vec::new());
        }
        if !dir.is_dir() {
            return Err(WorkspaceError::InvalidPath(rel.to_string()));
        }

        let mut entries = Vec::new();
        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name == MANIFEST_FILENAME {
                continue;
            }
            let is_directory = entry.file_type()?.is_dir();
            let path = if rel.is_empty() {
                name.clone()
            } else {
                format!("{}/{}", rel, name)
            };
            entries.push(FileEntry {
                name,
                path,
                is_directory,
            });
        }

        entries.sort_by(|a, b| {
            match (a.is_directory, b.is_directory) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
            }
        });

        Ok(entries)
    }

    pub fn read_file(&self, workspace: &Workspace, path: &str) -> Result<String, WorkspaceError> {
        let file_path = Self::resolve_in_workspace(workspace, path)?;
        if !file_path.is_file() {
            return Err(WorkspaceError::NotFound(path.to_string()));
        }
        Ok(fs::read_to_string(&file_path)?)
    }

    pub fn write_file(
        &self,
        workspace: &Workspace,
        path: &str,
        content: &str,
    ) -> Result<PathBuf, WorkspaceError> {
        let file_path = Self::resolve_in_workspace(workspace, path)?;
        if let Some(parent) = file_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&file_path, content)?;
        Ok(file_path)
    }

    pub fn delete_file(&self, workspace: &Workspace, path: &str) -> Result<(), WorkspaceError> {
        if path == MANIFEST_FILENAME {
            return Err(WorkspaceError::InvalidPath(
                "Cannot delete workspace manifest".to_string(),
            ));
        }
        let file_path = Self::resolve_in_workspace(workspace, path)?;
        if !file_path.exists() {
            return Err(WorkspaceError::NotFound(path.to_string()));
        }
        if file_path.is_dir() {
            fs::remove_dir_all(&file_path)?;
        } else {
            fs::remove_file(&file_path)?;
        }
        Ok(())
    }

    pub fn rename_file(
        &self,
        workspace: &Workspace,
        old_path: &str,
        new_path: &str,
    ) -> Result<(), WorkspaceError> {
        if old_path == MANIFEST_FILENAME || new_path == MANIFEST_FILENAME {
            return Err(WorkspaceError::InvalidPath(
                "Cannot rename workspace manifest".to_string(),
            ));
        }
        let from = Self::resolve_in_workspace(workspace, old_path)?;
        let to = Self::resolve_in_workspace(workspace, new_path)?;
        if !from.exists() {
            return Err(WorkspaceError::NotFound(old_path.to_string()));
        }
        if to.exists() {
            return Err(WorkspaceError::AlreadyExists(new_path.to_string()));
        }
        if let Some(parent) = to.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::rename(from, to)?;
        Ok(())
    }

    pub fn create_directory(
        &self,
        workspace: &Workspace,
        path: &str,
    ) -> Result<(), WorkspaceError> {
        let dir_path = Self::resolve_in_workspace(workspace, path)?;
        if dir_path.exists() {
            return Err(WorkspaceError::AlreadyExists(path.to_string()));
        }
        fs::create_dir_all(&dir_path)?;
        Ok(())
    }

    pub fn load_session(&self) -> Result<SessionData, WorkspaceError> {
        let path = self.session_path();
        if !path.exists() {
            return Ok(SessionData::default());
        }
        let content = fs::read_to_string(&path)?;
        let mut session: SessionData = serde_json::from_str(&content).map_err(|e| {
            WorkspaceError::InvalidPath(format!("Invalid session: {e}"))
        })?;
        session.normalize_legacy("nodejs");
        Ok(session)
    }

    pub fn save_session(&self, session: &SessionData) -> Result<(), WorkspaceError> {
        let path = self.session_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(session).map_err(|e| {
            WorkspaceError::InvalidPath(format!("Session serialization failed: {e}"))
        })?;
        fs::write(path, json)?;
        Ok(())
    }

    pub fn resolve_entry_file(
        &self,
        workspace: &Workspace,
        entry_file: Option<&str>,
    ) -> Result<String, WorkspaceError> {
        if let Some(path) = entry_file {
            return Ok(path.to_string());
        }
        let manifest = self.read_manifest(workspace)?;
        Ok(manifest.entry_file)
    }

    pub fn delete_workspace(&self, id: &str) -> Result<(), WorkspaceError> {
        let workspace = self.open_workspace(id)?;
        if workspace.path.exists() {
            fs::remove_dir_all(&workspace.path)?;
        }
        Ok(())
    }

    pub fn purge_workspace_from_session(
        &self,
        session: &mut SessionData,
        workspace_id: &str,
    ) -> Result<(), WorkspaceError> {
        session.remove_workspace(workspace_id);
        self.save_session(session)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs;
    use std::path::Path;

    struct HomeGuard {
        original: Option<String>,
    }

    impl HomeGuard {
        fn set(path: &Path) -> Self {
            let original = env::var("HOME").ok();
            env::set_var("HOME", path);
            Self { original }
        }
    }

    impl Drop for HomeGuard {
        fn drop(&mut self) {
            if let Some(ref home) = self.original {
                env::set_var("HOME", home);
            }
        }
    }

    fn temp_manager() -> (WorkspaceManager, PathBuf) {
        let _home_lock = crate::test_home_lock::home_test_lock();
        let temp_home = env::temp_dir().join(format!(
            "runspace-ws-test-{}",
            uuid::Uuid::new_v4()
        ));
        fs::create_dir_all(&temp_home).expect("temp home");
        let _guard = HomeGuard::set(&temp_home);
        let manager = WorkspaceManager::new().expect("manager");
        (manager, temp_home)
    }

    #[test]
    fn write_file_writes_inside_workspace() {
        let (manager, _temp) = temp_manager();
        let workspace = manager.create_workspace().expect("workspace");
        let path = manager
            .write_file(&workspace, "main.js", "console.log(1);")
            .expect("write");

        assert!(path.starts_with(&workspace.path));
        assert!(path.exists());
        let content = fs::read_to_string(&path).expect("read");
        assert_eq!(content, "console.log(1);");
    }

    #[test]
    fn reject_parent_dir_in_path() {
        let (manager, _temp) = temp_manager();
        let workspace = manager.create_workspace().expect("workspace");
        let result = manager.write_file(&workspace, "../outside.txt", "bad");
        assert!(result.is_err());
    }

    #[test]
    fn list_files_excludes_manifest() {
        let (manager, _temp) = temp_manager();
        let workspace = manager.create_named_workspace("Test", "nodejs").expect("ws");
        let files = manager.list_files(&workspace, None).expect("list");
        assert!(files.is_empty());
        assert!(!files.iter().any(|f| f.name == MANIFEST_FILENAME));
    }

    #[test]
    fn ensure_workspace_info_migrates_legacy_workspace() {
        let (manager, _temp) = temp_manager();
        let id = Uuid::new_v4().to_string();
        let path = manager.workspaces_dir().join(&id);
        fs::create_dir_all(&path).expect("workspace dir");
        fs::write(path.join("main.js"), "console.log('legacy');").expect("legacy file");

        let workspace = Workspace {
            id: id.clone(),
            path,
        };

        let info = manager
            .ensure_workspace_info(&workspace, "nodejs")
            .expect("migrate");

        assert_eq!(info.entry_file, "main.js");
        assert_eq!(info.runtime_id, "nodejs");
        assert!(workspace.path.join(MANIFEST_FILENAME).is_file());
    }

    #[test]
    fn delete_workspace_removes_directory() {
        let (manager, _temp) = temp_manager();
        let workspace = manager
            .create_named_workspace("To delete", "nodejs")
            .expect("workspace");
        let path = workspace.path.clone();

        manager
            .delete_workspace(&workspace.id)
            .expect("delete workspace");
        assert!(!path.exists());
    }

    #[test]
    fn session_roundtrip() {
        use std::collections::HashMap;

        use super::super::types::EnvironmentSession;

        let (manager, _temp) = temp_manager();
        let mut workspace_tabs = HashMap::new();
        workspace_tabs.insert(
            "abc".to_string(),
            super::super::types::WorkspaceTabs {
                open_files: vec!["main.js".to_string()],
                active_file: Some("main.js".to_string()),
            },
        );
        let session = SessionData {
            environments: HashMap::from([(
                "nodejs".to_string(),
                EnvironmentSession {
                    workspace_id: Some("abc".to_string()),
                    workspace_tabs,
                },
            )]),
            last_runtime_id: None,
            last_workspace_id: None,
            open_files: Vec::new(),
            active_file: None,
        };
        manager.save_session(&session).expect("save");
        let loaded = manager.load_session().expect("load");
        let env = loaded.environment_session("nodejs");
        assert_eq!(env.workspace_id, Some("abc".to_string()));
        assert_eq!(
            env.workspace_tabs
                .get("abc")
                .and_then(|tabs| tabs.active_file.clone()),
            Some("main.js".to_string())
        );
    }
}
