use std::collections::HashMap;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug)]
pub enum FrameworkSkeletonError {
    Io(io::Error),
    Copy(String),
    ComposerMissing,
    ComposerFailed(String),
    VendorMissing,
}

impl std::fmt::Display for FrameworkSkeletonError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FrameworkSkeletonError::Io(err) => write!(f, "IO error: {err}"),
            FrameworkSkeletonError::Copy(msg) => write!(f, "{msg}"),
            FrameworkSkeletonError::ComposerMissing => write!(
                f,
                "Framework skeleton is not installed. Set Composer path in Settings or install composer on PATH, then run again."
            ),
            FrameworkSkeletonError::ComposerFailed(msg) => {
                write!(f, "Composer install failed: {msg}")
            }
            FrameworkSkeletonError::VendorMissing => write!(
                f,
                "Framework vendor directory is missing after install."
            ),
        }
    }
}

pub const FRAMEWORK_ROOT_ENV: &str = "RUNSPACE_FRAMEWORK_ROOT";
const ENTRY_PATH_ENV: &str = "RUNSPACE_ENTRY_PATH";
const BOOTSTRAP_FILENAME: &str = "_runspace_bootstrap.php";
const SKELETON_VERSION_FILE: &str = "skeleton.version";
const SYNC_EXCLUDED_DIRS: &[&str] = &["vendor"];
const SYNC_EXCLUDED_RELATIVE_FILES: &[&str] = &["database/database.sqlite"];

pub struct SkeletonReady {
    pub path: PathBuf,
    pub installed_vendor: bool,
}

pub fn skeleton_home(framework_id: &str) -> Result<PathBuf, FrameworkSkeletonError> {
    let home = std::env::var("HOME").map_err(|_| {
        FrameworkSkeletonError::Copy("Could not resolve home directory".to_string())
    })?;
    Ok(PathBuf::from(home)
        .join(".runspace")
        .join("frameworks")
        .join(framework_id))
}

fn bundled_skeleton_source(framework_id: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("frameworks")
        .join(framework_id)
}

fn find_composer(extra_paths: &HashMap<String, String>) -> Option<PathBuf> {
    if let Some(path) = extra_paths.get("composer_path") {
        if !path.trim().is_empty() {
            return Some(PathBuf::from(path));
        }
    }
    which::which("composer").ok()
}

const COMPOSER_MANIFEST_FILES: &[&str] = &["composer.json", "composer.lock"];

pub fn ensure_skeleton(
    framework_id: &str,
    extra_paths: &HashMap<String, String>,
) -> Result<SkeletonReady, FrameworkSkeletonError> {
    let target = skeleton_home(framework_id)?;
    let vendor_autoload = target.join("vendor").join("autoload.php");
    let source = bundled_skeleton_source(framework_id);

    if !source.is_dir() {
        return Err(FrameworkSkeletonError::Copy(format!(
            "Bundled skeleton not found: {}",
            source.display()
        )));
    }

    let mut needs_composer = false;

    if !target.exists() {
        copy_dir_recursive(&source, &target)?;
        needs_composer = true;
    } else if !skeleton_is_current(&source, &target) {
        sync_bundled_skeleton(&source, &target)?;
        needs_composer = true;
    } else if composer_manifests_differ(&source, &target) {
        sync_bundled_skeleton(&source, &target)?;
        remove_vendor_dir(&target)?;
        needs_composer = true;
    }

    if vendor_autoload.is_file() && !needs_composer {
        return Ok(SkeletonReady {
            path: target,
            installed_vendor: false,
        });
    }

    let composer = find_composer(extra_paths).ok_or(FrameworkSkeletonError::ComposerMissing)?;
    let output = Command::new(&composer)
        .arg("install")
        .arg("--no-interaction")
        .arg("--prefer-dist")
        .arg("--no-scripts")
        .current_dir(&target)
        .output()
        .map_err(FrameworkSkeletonError::Io)?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(FrameworkSkeletonError::ComposerFailed(format!(
            "{}{}",
            stderr.trim(),
            if stdout.trim().is_empty() {
                String::new()
            } else {
                format!("\n{}", stdout.trim())
            }
        )));
    }

    if !vendor_autoload.is_file() {
        return Err(FrameworkSkeletonError::VendorMissing);
    }

    Ok(SkeletonReady {
        path: target,
        installed_vendor: true,
    })
}

pub(crate) fn find_php(extra_paths: &HashMap<String, String>) -> Option<PathBuf> {
    if let Some(path) = extra_paths.get("php_path") {
        if !path.trim().is_empty() {
            return Some(PathBuf::from(path));
        }
    }
    which::which("php").ok()
}

pub(crate) fn run_php_command(
    php: &Path,
    target: &Path,
    args: &[&str],
) -> Result<(), FrameworkSkeletonError> {
    let output = Command::new(php)
        .args(args)
        .current_dir(target)
        .output()
        .map_err(FrameworkSkeletonError::Io)?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    Err(FrameworkSkeletonError::ComposerFailed(format!(
        "Skeleton setup failed ({}): {}{}",
        args.join(" "),
        stderr.trim(),
        if stdout.trim().is_empty() {
            String::new()
        } else {
            format!("\n{}", stdout.trim())
        }
    )))
}

fn composer_manifests_differ(source: &Path, target: &Path) -> bool {
    COMPOSER_MANIFEST_FILES.iter().any(|name| {
        let src = source.join(name);
        if !src.is_file() {
            return false;
        }
        file_contents_differ(&src, &target.join(name))
    })
}

fn remove_vendor_dir(target: &Path) -> Result<(), FrameworkSkeletonError> {
    let vendor = target.join("vendor");
    if vendor.is_dir() {
        fs::remove_dir_all(&vendor).map_err(FrameworkSkeletonError::Io)?;
    }
    Ok(())
}

fn file_contents_differ(left: &Path, right: &Path) -> bool {
    match (fs::read(left), fs::read(right)) {
        (Ok(left_bytes), Ok(right_bytes)) => left_bytes != right_bytes,
        _ => true,
    }
}

fn read_skeleton_version(root: &Path) -> Option<String> {
    fs::read_to_string(root.join(SKELETON_VERSION_FILE))
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn skeleton_is_current(source: &Path, target: &Path) -> bool {
    match (read_skeleton_version(source), read_skeleton_version(target)) {
        (Some(bundled), Some(installed)) => bundled == installed,
        _ => false,
    }
}

fn sync_bundled_skeleton(source: &Path, target: &Path) -> Result<(), FrameworkSkeletonError> {
    fs::create_dir_all(target).map_err(FrameworkSkeletonError::Io)?;
    sync_dir_excluding(source, target, SYNC_EXCLUDED_DIRS)
}

pub fn write_bootstrap(
    workspace_path: &Path,
    entry_path: &Path,
    skeleton_root: &Path,
) -> Result<PathBuf, FrameworkSkeletonError> {
    let bootstrap_path = workspace_path.join(BOOTSTRAP_FILENAME);
    let skeleton = skeleton_root.to_string_lossy().replace('\\', "\\\\");
    let entry = entry_path.to_string_lossy().replace('\\', "\\\\");

    let content = format!(
        r#"<?php
putenv('{FRAMEWORK_ROOT_ENV}={skeleton}');
putenv('{ENTRY_PATH_ENV}={entry}');
require getenv('{FRAMEWORK_ROOT_ENV}') . '/vendor/autoload.php';
include getenv('{ENTRY_PATH_ENV}');
"#
    );

    fs::write(&bootstrap_path, content).map_err(FrameworkSkeletonError::Io)?;
    Ok(bootstrap_path)
}

pub fn framework_terminal_env(
    skeleton_root: &Path,
    workspace_path: &Path,
) -> HashMap<String, String> {
    let mut env = HashMap::new();
    env.insert(
        FRAMEWORK_ROOT_ENV.to_string(),
        skeleton_root.to_string_lossy().to_string(),
    );
    env.insert(
        "RUNSPACE_WORKSPACE".to_string(),
        workspace_path.to_string_lossy().to_string(),
    );
    env
}

fn copy_dir_recursive(source: &Path, target: &Path) -> Result<(), FrameworkSkeletonError> {
    fs::create_dir_all(target).map_err(FrameworkSkeletonError::Io)?;

    for entry in fs::read_dir(source).map_err(FrameworkSkeletonError::Io)? {
        let entry = entry.map_err(FrameworkSkeletonError::Io)?;
        let file_type = entry.file_type().map_err(FrameworkSkeletonError::Io)?;
        let dest = target.join(entry.file_name());

        if file_type.is_dir() {
            copy_dir_recursive(&entry.path(), &dest)?;
        } else {
            fs::copy(entry.path(), dest).map_err(FrameworkSkeletonError::Io)?;
        }
    }

    Ok(())
}

fn sync_dir_excluding(
    source: &Path,
    target: &Path,
    excluded_dir_names: &[&str],
) -> Result<(), FrameworkSkeletonError> {
    for entry in fs::read_dir(source).map_err(FrameworkSkeletonError::Io)? {
        let entry = entry.map_err(FrameworkSkeletonError::Io)?;
        let file_name = entry.file_name();
        let name = file_name.to_string_lossy();

        if entry
            .file_type()
            .map_err(FrameworkSkeletonError::Io)?
            .is_dir()
            && excluded_dir_names
                .iter()
                .any(|excluded| *excluded == name.as_ref())
        {
            continue;
        }

        if let Ok(relative) = entry.path().strip_prefix(source) {
            let relative_key = relative.to_string_lossy().replace('\\', "/");
            if SYNC_EXCLUDED_RELATIVE_FILES
                .iter()
                .any(|excluded| relative_key == *excluded)
            {
                continue;
            }
        }

        let dest = target.join(file_name);
        if entry
            .file_type()
            .map_err(FrameworkSkeletonError::Io)?
            .is_dir()
        {
            fs::create_dir_all(&dest).map_err(FrameworkSkeletonError::Io)?;
            sync_dir_excluding(&entry.path(), &dest, excluded_dir_names)?;
        } else {
            if let Some(parent) = dest.parent() {
                fs::create_dir_all(parent).map_err(FrameworkSkeletonError::Io)?;
            }
            fs::copy(entry.path(), &dest).map_err(FrameworkSkeletonError::Io)?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn skeleton_is_current_matches_version_file() {
        let temp =
            std::env::temp_dir().join(format!("runspace-skeleton-test-{}", std::process::id()));
        let source = temp.join("source");
        let target = temp.join("target");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&target).unwrap();
        fs::write(source.join(SKELETON_VERSION_FILE), "1").unwrap();
        fs::write(target.join(SKELETON_VERSION_FILE), "1").unwrap();

        assert!(skeleton_is_current(&source, &target));

        fs::write(target.join(SKELETON_VERSION_FILE), "0").unwrap();
        assert!(!skeleton_is_current(&source, &target));

        let _ = fs::remove_dir_all(&temp);
    }

    #[test]
    fn composer_manifests_differ_detects_changed_lock() {
        let temp = std::env::temp_dir().join(format!(
            "runspace-composer-manifest-test-{}",
            std::process::id()
        ));
        let source = temp.join("source");
        let target = temp.join("target");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&target).unwrap();
        fs::write(source.join("composer.lock"), "a").unwrap();
        fs::write(target.join("composer.lock"), "b").unwrap();

        assert!(composer_manifests_differ(&source, &target));

        let _ = fs::remove_dir_all(&temp);
    }

    #[test]
    fn sync_bundled_skeleton_copies_artisan_without_vendor() {
        let temp = std::env::temp_dir().join(format!(
            "runspace-skeleton-sync-test-{}",
            std::process::id()
        ));
        let source = temp.join("source");
        let target = temp.join("target");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&target).unwrap();
        fs::write(source.join("artisan"), "#!/usr/bin/env php\n").unwrap();
        fs::write(source.join(SKELETON_VERSION_FILE), "1").unwrap();
        fs::create_dir_all(source.join("vendor")).unwrap();
        fs::write(source.join("vendor/autoload.php"), "<?php\n").unwrap();
        fs::write(target.join("composer.json"), "{}").unwrap();

        sync_bundled_skeleton(&source, &target).unwrap();

        assert!(target.join("artisan").is_file());
        assert!(target.join(SKELETON_VERSION_FILE).is_file());
        assert!(!target.join("vendor/autoload.php").is_file());

        let _ = fs::remove_dir_all(&temp);
    }
}
