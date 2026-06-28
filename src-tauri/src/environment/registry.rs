use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use super::manifest::EnvironmentManifest;
use super::types::EnvironmentDefinition;

#[derive(Debug)]
pub enum RegistryError {
    Io(std::io::Error),
    Parse(String),
    Invalid(String),
}

impl std::fmt::Display for RegistryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RegistryError::Io(err) => write!(f, "IO error: {err}"),
            RegistryError::Parse(msg) => write!(f, "Parse error: {msg}"),
            RegistryError::Invalid(msg) => write!(f, "Invalid registry: {msg}"),
        }
    }
}

impl From<std::io::Error> for RegistryError {
    fn from(err: std::io::Error) -> Self {
        RegistryError::Io(err)
    }
}

#[derive(Debug)]
pub struct EnvironmentRegistry {
    manifests: HashMap<String, EnvironmentManifest>,
    default_id: String,
}

impl EnvironmentRegistry {
    pub fn load_bundled() -> Result<Self, RegistryError> {
        let dir = bundled_environments_dir().ok_or_else(|| {
            RegistryError::Invalid("Bundled environment manifests directory not found".to_string())
        })?;
        let mut manifests = HashMap::new();
        let mut default_id: Option<String> = None;
        let mut default_count = 0usize;

        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
                continue;
            }

            let raw = fs::read_to_string(&path)?;
            let manifest: EnvironmentManifest = serde_json::from_str(&raw)
                .map_err(|err| RegistryError::Parse(format!("{}: {err}", path.display())))?;

            validate_manifest(&manifest)?;

            if manifest.default {
                default_count += 1;
                default_id = Some(manifest.id.clone());
            }

            if manifests.insert(manifest.id.clone(), manifest).is_some() {
                return Err(RegistryError::Invalid(format!(
                    "Duplicate environment id in {}",
                    path.display()
                )));
            }
        }

        if manifests.is_empty() {
            return Err(RegistryError::Invalid(
                "No bundled environment manifests found".to_string(),
            ));
        }

        if default_count > 1 {
            return Err(RegistryError::Invalid(
                "Multiple environments marked as default".to_string(),
            ));
        }

        let default_id =
            default_id.unwrap_or_else(|| deterministic_fallback_default_id(&manifests));

        Ok(Self {
            manifests,
            default_id,
        })
    }

    pub fn get(&self, id: &str) -> Option<&EnvironmentManifest> {
        self.manifests.get(id)
    }

    pub fn default_id(&self) -> &str {
        &self.default_id
    }

    pub fn catalog(&self) -> Vec<EnvironmentDefinition> {
        let mut definitions: Vec<EnvironmentDefinition> = self
            .manifests
            .values()
            .map(EnvironmentManifest::to_definition)
            .collect();
        definitions.sort_by(|left, right| left.name.cmp(&right.name));
        definitions
    }

    #[cfg(test)]
    pub fn environment_ids(&self) -> Vec<String> {
        let mut ids: Vec<String> = self.manifests.keys().cloned().collect();
        ids.sort();
        ids
    }

    pub fn binary_field_key(&self, environment_id: &str) -> Option<&str> {
        self.get(environment_id)
            .and_then(|manifest| manifest.primary_binary_field_key())
    }
}

fn bundled_environments_dir() -> Option<PathBuf> {
    let source_tree = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/environments");
    if source_tree.is_dir() {
        return Some(source_tree);
    }

    resolve_packaged_resource_dir("environments")
}

fn resolve_packaged_resource_dir(relative: &str) -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let exe_dir = exe.parent()?;

    for candidate in [
        exe_dir.join("resources").join(relative),
        exe_dir.join("../Resources").join(relative),
        exe_dir.join("../Resources/resources").join(relative),
    ] {
        if candidate.is_dir() {
            return Some(candidate);
        }
    }

    None
}

fn deterministic_fallback_default_id(manifests: &HashMap<String, EnvironmentManifest>) -> String {
    let mut ids: Vec<String> = manifests.keys().cloned().collect();
    ids.sort();
    ids.into_iter().next().expect("manifests not empty")
}

fn validate_manifest(manifest: &EnvironmentManifest) -> Result<(), RegistryError> {
    if manifest.id.trim().is_empty() {
        return Err(RegistryError::Invalid(
            "Environment id is required".to_string(),
        ));
    }

    match manifest.profile {
        super::manifest::EnvironmentProfile::Script => {
            if manifest.run.is_none() {
                return Err(RegistryError::Invalid(format!(
                    "{}: script profile requires run",
                    manifest.id
                )));
            }
        }
        super::manifest::EnvironmentProfile::Compiled => {
            if manifest.compile.is_none() {
                return Err(RegistryError::Invalid(format!(
                    "{}: compiled profile requires compile",
                    manifest.id
                )));
            }
        }
        super::manifest::EnvironmentProfile::Framework => {
            if manifest.run.is_none() {
                return Err(RegistryError::Invalid(format!(
                    "{}: framework profile requires run",
                    manifest.id
                )));
            }
            if manifest.skeleton.is_none() {
                return Err(RegistryError::Invalid(format!(
                    "{}: framework profile requires skeleton",
                    manifest.id
                )));
            }
            if manifest.prepare.is_none() {
                return Err(RegistryError::Invalid(format!(
                    "{}: framework profile requires prepare",
                    manifest.id
                )));
            }
        }
    }

    Ok(())
}

use std::sync::OnceLock;

static REGISTRY: OnceLock<EnvironmentRegistry> = OnceLock::new();

pub fn registry() -> &'static EnvironmentRegistry {
    REGISTRY.get_or_init(|| {
        EnvironmentRegistry::load_bundled().expect("failed to load bundled environment manifests")
    })
}

pub fn default_environment_id() -> String {
    EnvironmentRegistry::load_bundled()
        .map(|registry| registry.default_id().to_string())
        .unwrap_or_else(|_| "nodejs".to_string())
}

pub fn get_definition(id: &str) -> Option<EnvironmentDefinition> {
    registry().get(id).map(EnvironmentManifest::to_definition)
}

pub fn get_manifest(id: &str) -> Option<&'static EnvironmentManifest> {
    registry().get(id)
}

pub fn get_catalog() -> Vec<EnvironmentDefinition> {
    registry().catalog()
}

pub fn binary_field_key(environment_id: &str) -> Option<String> {
    registry()
        .binary_field_key(environment_id)
        .map(|value| value.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_registry_loads_all_environments() {
        let registry = EnvironmentRegistry::load_bundled().expect("registry");
        let ids = registry.environment_ids();
        assert!(ids.len() >= 8);
        assert!(ids.contains(&"nodejs".to_string()));
        assert!(ids.contains(&"laravel".to_string()));
        assert!(ids.contains(&"play".to_string()));
        assert_eq!(registry.default_id(), "nodejs");
    }
}
