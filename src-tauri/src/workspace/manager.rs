use std::fs;
use std::path::{Path, PathBuf};

use chrono::Utc;
use uuid::Uuid;

use crate::environment::registry::{default_environment_id, get_manifest};
use crate::security::{validate_path_in_workspace, SecurityError};

use super::types::{FileEntry, SessionData, WorkspaceInfo, WorkspaceManifest, MANIFEST_FILENAME};

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
        Self::with_base_dir(PathBuf::from(home).join(".runspace"))
    }

    fn with_base_dir(base_dir: PathBuf) -> Result<Self, WorkspaceError> {
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
        self.create_named_workspace("Untitled", &default_environment_id())
    }

    pub fn create_named_workspace(
        &self,
        name: &str,
        runtime_id: &str,
    ) -> Result<Workspace, WorkspaceError> {
        let id = Uuid::new_v4().to_string();
        let path = self.workspaces_dir().join(&id);

        get_manifest(runtime_id).ok_or_else(|| {
            WorkspaceError::InvalidPath(format!("Unsupported runtime: {runtime_id}"))
        })?;
        fs::create_dir_all(&path)?;
        let now = Utc::now().to_rfc3339();

        let workspace = Workspace {
            id: id.clone(),
            path,
        };

        let manifest = WorkspaceManifest {
            name: name.to_string(),
            runtime_id: runtime_id.to_string(),
            created_at: now.clone(),
            updated_at: now,
        };
        self.write_manifest(&workspace, &manifest)?;

        Ok(workspace)
    }

    pub fn read_manifest(
        &self,
        workspace: &Workspace,
    ) -> Result<WorkspaceManifest, WorkspaceError> {
        let path = workspace.path.join(MANIFEST_FILENAME);
        let content = fs::read_to_string(&path)?;
        serde_json::from_str(&content)
            .map_err(|e| WorkspaceError::InvalidPath(format!("Invalid manifest: {e}")))
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

    pub fn ensure_workspace_info(
        &self,
        workspace: &Workspace,
        default_runtime_id: &str,
    ) -> Result<WorkspaceInfo, WorkspaceError> {
        if workspace.path.join(MANIFEST_FILENAME).is_file() {
            return self.workspace_info(workspace);
        }

        let now = Utc::now().to_rfc3339();
        let manifest = WorkspaceManifest {
            name: "Untitled".to_string(),
            runtime_id: default_runtime_id.to_string(),
            created_at: now.clone(),
            updated_at: now,
        };
        self.write_manifest(workspace, &manifest)?;

        Ok(WorkspaceInfo {
            id: workspace.id.clone(),
            name: manifest.name,
            runtime_id: manifest.runtime_id,
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
        use_session: bool,
    ) -> Result<(Workspace, WorkspaceInfo), WorkspaceError> {
        if use_session {
            let env_session = session.environment_session(runtime_id);

            if let Some(id) = env_session.workspace_id.as_ref() {
                if let Ok(workspace) = self.open_workspace(id) {
                    if let Ok(Some(info)) = self.workspace_matches_runtime(&workspace, runtime_id) {
                        return Ok((workspace, info));
                    }
                }
            }
        } else {
            return Err(WorkspaceError::NotFound(format!(
                "Workspace restore disabled for runtime: {runtime_id}"
            )));
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

        entries.sort_by(|a, b| match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
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

    pub fn import_external(
        &self,
        workspace: &Workspace,
        source_paths: &[String],
        target_dir: Option<&str>,
    ) -> Result<Vec<String>, WorkspaceError> {
        let target_dir = target_dir.unwrap_or("");
        Self::resolve_relative_path(target_dir)?;

        let mut imported = Vec::new();
        for source_path in source_paths {
            let source = Path::new(source_path);
            if !source.exists() {
                return Err(WorkspaceError::NotFound(source_path.clone()));
            }
            let relative = Self::copy_external_entry(workspace, source, target_dir)?;
            imported.push(relative);
        }
        Ok(imported)
    }

    fn copy_external_entry(
        workspace: &Workspace,
        source: &Path,
        target_dir: &str,
    ) -> Result<String, WorkspaceError> {
        let file_name = source
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or_else(|| WorkspaceError::InvalidPath("Invalid source file name".to_string()))?;

        if file_name == MANIFEST_FILENAME {
            return Err(WorkspaceError::InvalidPath(
                "Cannot import runspace.json".to_string(),
            ));
        }

        let relative = Self::unique_import_path(workspace, target_dir, file_name)?;
        let dest = Self::resolve_in_workspace(workspace, &relative)?;

        if source.is_dir() {
            Self::copy_dir_recursive(source, &dest)?;
        } else {
            if let Some(parent) = dest.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::copy(source, &dest)?;
        }

        Ok(relative)
    }

    fn unique_import_path(
        workspace: &Workspace,
        target_dir: &str,
        name: &str,
    ) -> Result<String, WorkspaceError> {
        let initial = if target_dir.is_empty() {
            name.to_string()
        } else {
            format!("{target_dir}/{name}")
        };

        if Self::import_path_exists(workspace, &initial)? {
            return Err(WorkspaceError::AlreadyExists(initial));
        }

        Ok(initial)
    }

    fn import_path_exists(workspace: &Workspace, relative: &str) -> Result<bool, WorkspaceError> {
        let path = Self::resolve_in_workspace(workspace, relative)?;
        Ok(path.exists())
    }

    fn copy_dir_recursive(source: &Path, target: &Path) -> Result<(), WorkspaceError> {
        fs::create_dir_all(target)?;
        for entry in fs::read_dir(source)? {
            let entry = entry?;
            let dest = target.join(entry.file_name());
            if entry.file_type()?.is_dir() {
                Self::copy_dir_recursive(&entry.path(), &dest)?;
            } else {
                fs::copy(entry.path(), dest)?;
            }
        }
        Ok(())
    }

    pub fn load_session(&self) -> Result<SessionData, WorkspaceError> {
        let path = self.session_path();
        if !path.exists() {
            return Ok(SessionData::default());
        }
        let content = fs::read_to_string(&path)?;
        let session: SessionData = serde_json::from_str(&content)
            .map_err(|e| WorkspaceError::InvalidPath(format!("Invalid session: {e}")))?;
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

    pub fn resolve_run_file(
        &self,
        workspace: &Workspace,
        relative_path: &str,
    ) -> Result<String, WorkspaceError> {
        let trimmed = relative_path.trim();
        if trimmed.is_empty() {
            return Err(WorkspaceError::InvalidPath(
                "No file selected to run".to_string(),
            ));
        }
        let path = workspace.path.join(trimmed);
        validate_path_in_workspace(&workspace.path, &path)?;
        if !path.is_file() {
            return Err(WorkspaceError::InvalidPath(format!(
                "File not found: {trimmed}"
            )));
        }
        Ok(trimmed.to_string())
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

    pub fn delete_workspaces_for_runtime(
        &self,
        runtime_id: &str,
    ) -> Result<Vec<String>, WorkspaceError> {
        let workspaces = self.list_workspaces_for_runtime(Some(runtime_id))?;
        let deleted_ids: Vec<String> = workspaces.iter().map(|info| info.id.clone()).collect();

        for id in &deleted_ids {
            self.delete_workspace(id)?;
        }

        let mut session = self.load_session()?;
        session.remove_runtime(runtime_id, &deleted_ids);
        self.save_session(&session)?;

        Ok(deleted_ids)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;
    use std::fs;

    fn temp_manager() -> (WorkspaceManager, PathBuf) {
        let temp_base = env::temp_dir().join(format!("runspace-ws-test-{}", uuid::Uuid::new_v4()));
        let manager =
            WorkspaceManager::with_base_dir(temp_base.join(".runspace")).expect("manager");
        (manager, temp_base)
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
        let workspace = manager
            .create_named_workspace("Test", "nodejs")
            .expect("ws");
        let files = manager.list_files(&workspace, None).expect("list");
        assert!(files.is_empty());
        assert!(!files.iter().any(|f| f.name == MANIFEST_FILENAME));
    }

    #[test]
    fn ensure_workspace_info_creates_manifest_for_existing_dir() {
        let (manager, _temp) = temp_manager();
        let id = Uuid::new_v4().to_string();
        let path = manager.workspaces_dir().join(&id);
        fs::create_dir_all(&path).expect("workspace dir");
        fs::write(path.join("main.js"), "console.log('hello');").expect("file");

        let workspace = Workspace {
            id: id.clone(),
            path,
        };

        let info = manager
            .ensure_workspace_info(&workspace, "nodejs")
            .expect("manifest created");

        assert_eq!(info.runtime_id, "nodejs");
        assert!(workspace.path.join(MANIFEST_FILENAME).is_file());
    }

    #[test]
    fn delete_workspaces_for_runtime_removes_matching_projects() {
        use std::collections::HashMap;

        use super::super::types::EnvironmentSession;

        let (manager, _temp) = temp_manager();
        let node_ws = manager
            .create_named_workspace("Node project", "nodejs")
            .expect("node workspace");
        let php_ws = manager
            .create_named_workspace("PHP project", "php")
            .expect("php workspace");

        let mut session = SessionData {
            environments: HashMap::from([
                (
                    "nodejs".to_string(),
                    EnvironmentSession {
                        workspace_id: Some(node_ws.id.clone()),
                        workspace_tabs: HashMap::new(),
                    },
                ),
                (
                    "php".to_string(),
                    EnvironmentSession {
                        workspace_id: Some(php_ws.id.clone()),
                        workspace_tabs: HashMap::new(),
                    },
                ),
            ]),
            last_runtime_id: Some("nodejs".to_string()),
            ..SessionData::default()
        };
        manager.save_session(&session).expect("save session");

        let deleted = manager
            .delete_workspaces_for_runtime("nodejs")
            .expect("delete node workspaces");
        assert_eq!(deleted, vec![node_ws.id.clone()]);
        assert!(!node_ws.path.exists());
        assert!(php_ws.path.exists());

        session = manager.load_session().expect("reload session");
        assert!(!session.environments.contains_key("nodejs"));
        assert!(session.environments.contains_key("php"));
        assert_eq!(session.last_runtime_id, None);

        let remaining = manager
            .list_workspaces_for_runtime(Some("nodejs"))
            .expect("list node");
        assert!(remaining.is_empty());
        let php_remaining = manager
            .list_workspaces_for_runtime(Some("php"))
            .expect("list php");
        assert_eq!(php_remaining.len(), 1);
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
    fn import_external_copies_file_into_workspace() {
        let (manager, _temp) = temp_manager();
        let workspace = manager
            .create_named_workspace("Import test", "nodejs")
            .expect("workspace");
        let source =
            env::temp_dir().join(format!("runspace-import-source-{}", uuid::Uuid::new_v4()));
        fs::write(&source, "console.log('imported');").expect("source file");

        let imported = manager
            .import_external(&workspace, &[source.display().to_string()], None)
            .expect("import");

        assert_eq!(
            imported,
            vec![source.file_name().unwrap().to_str().unwrap()]
        );
        let dest = workspace.path.join(imported[0].as_str());
        assert!(dest.is_file());
        assert_eq!(
            fs::read_to_string(dest).expect("read imported"),
            "console.log('imported');"
        );

        let _ = fs::remove_file(source);
    }

    #[test]
    fn import_external_copies_directory_into_workspace() {
        let (manager, _temp) = temp_manager();
        let workspace = manager
            .create_named_workspace("Import folder", "nodejs")
            .expect("workspace");
        let source_dir =
            env::temp_dir().join(format!("runspace-import-dir-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(source_dir.join("src")).expect("source nested dir");
        fs::write(source_dir.join("src/main.js"), "console.log('imported');").expect("source file");

        let imported = manager
            .import_external(&workspace, &[source_dir.display().to_string()], None)
            .expect("import");

        let folder_name = source_dir.file_name().unwrap().to_str().unwrap();
        assert_eq!(imported, vec![folder_name]);
        let dest = workspace.path.join(folder_name).join("src/main.js");
        assert!(dest.is_file());
        assert_eq!(
            fs::read_to_string(dest).expect("read imported"),
            "console.log('imported');"
        );

        let _ = fs::remove_dir_all(source_dir);
    }

    #[test]
    fn import_external_errors_when_target_exists() {
        let (manager, _temp) = temp_manager();
        let workspace = manager
            .create_named_workspace("Import conflict", "nodejs")
            .expect("workspace");
        manager
            .write_file(&workspace, "notes.txt", "existing")
            .expect("existing file");

        let source_dir =
            env::temp_dir().join(format!("runspace-import-conflict-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&source_dir).expect("source dir");
        let source = source_dir.join("notes.txt");
        fs::write(&source, "incoming").expect("source file");

        let result = manager.import_external(&workspace, &[source.display().to_string()], None);

        assert!(matches!(result, Err(WorkspaceError::AlreadyExists(_))));

        let _ = fs::remove_dir_all(source_dir);
    }

    #[test]
    #[ignore = "requires node in PATH"]
    fn node_multi_file_require_in_workspace() {
        use std::collections::HashMap;
        use std::process::Command;

        use crate::engine::profiles::{prepare, PrepareContext};

        let Some(binary) = which::which("node").ok() else {
            return;
        };

        let (manager, _temp) = temp_manager();
        let workspace = manager
            .create_named_workspace("Multi-file", "nodejs")
            .expect("workspace");

        manager
            .write_file(
                &workspace,
                "utils.js",
                "module.exports = { greet: (name) => `Hello, ${name}!` };\n",
            )
            .expect("write utils");
        manager
            .write_file(
                &workspace,
                "main.js",
                "const { greet } = require('./utils');\nconsole.log(greet('Runspace'));\n",
            )
            .expect("write main");

        let entry = manager
            .resolve_run_file(&workspace, "main.js")
            .expect("run file");
        assert_eq!(entry, "main.js");

        let snippet_path = workspace.path.join(&entry);
        let prepared = prepare(PrepareContext {
            environment_id: "nodejs",
            workspace_path: &workspace.path,
            snippet_path: &snippet_path,
            extra_paths: &HashMap::new(),
        })
        .expect("prepare");

        let output = Command::new(&binary)
            .arg(&prepared.script_path)
            .current_dir(&workspace.path)
            .output()
            .expect("run");

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        assert!(
            output.status.success(),
            "node failed: stdout={stdout} stderr={stderr}"
        );
        assert!(
            stdout.contains("Hello, Runspace!"),
            "unexpected stdout: {stdout}"
        );
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
            onboarding_complete: false,
            ..SessionData::default()
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
