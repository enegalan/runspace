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
pub const SNIPPET_PATH_ENV: &str = "RUNSPACE_SNIPPET_PATH";
const BOOTSTRAP_FILENAME: &str = "_runspace_bootstrap.php";

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

pub fn ensure_skeleton(
    framework_id: &str,
    extra_paths: &HashMap<String, String>,
) -> Result<PathBuf, FrameworkSkeletonError> {
    let target = skeleton_home(framework_id)?;
    let vendor_autoload = target.join("vendor").join("autoload.php");

    if !target.exists() {
        let source = bundled_skeleton_source(framework_id);
        if !source.is_dir() {
            return Err(FrameworkSkeletonError::Copy(format!(
                "Bundled skeleton not found: {}",
                source.display()
            )));
        }
        copy_dir_recursive(&source, &target)?;
    }

    if vendor_autoload.is_file() {
        return Ok(target);
    }

    let composer = find_composer(extra_paths).ok_or(FrameworkSkeletonError::ComposerMissing)?;
    let output = Command::new(&composer)
        .arg("install")
        .arg("--no-interaction")
        .arg("--no-dev")
        .arg("--prefer-dist")
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

    Ok(target)
}

pub fn write_bootstrap(
    workspace_path: &Path,
    snippet_path: &Path,
    skeleton_root: &Path,
) -> Result<PathBuf, FrameworkSkeletonError> {
    let bootstrap_path = workspace_path.join(BOOTSTRAP_FILENAME);
    let skeleton = skeleton_root.to_string_lossy().replace('\\', "\\\\");
    let snippet = snippet_path.to_string_lossy().replace('\\', "\\\\");

    let content = format!(
        r#"<?php
putenv('{FRAMEWORK_ROOT_ENV}={skeleton}');
putenv('{SNIPPET_PATH_ENV}={snippet}');
require getenv('{FRAMEWORK_ROOT_ENV}') . '/vendor/autoload.php';
include getenv('{SNIPPET_PATH_ENV}');
"#
    );

    fs::write(&bootstrap_path, content).map_err(FrameworkSkeletonError::Io)?;
    Ok(bootstrap_path)
}

pub fn framework_extra_env(skeleton_root: &Path, snippet_path: &Path) -> HashMap<String, String> {
    let mut env = HashMap::new();
    env.insert(
        FRAMEWORK_ROOT_ENV.to_string(),
        skeleton_root.to_string_lossy().to_string(),
    );
    env.insert(
        SNIPPET_PATH_ENV.to_string(),
        snippet_path.to_string_lossy().to_string(),
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
