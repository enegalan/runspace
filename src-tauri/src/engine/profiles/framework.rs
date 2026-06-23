use std::collections::HashMap;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;

use crate::environment::manifest::{
    DependencyInstallSpec, EnvironmentManifest, PostInstallStep, PrepareSpec, SkeletonSpec, StepCwd,
};

use super::template::{
    resolve_framework_args, resolve_framework_embed_template, resolve_framework_path,
    FrameworkTemplateContext,
};
use super::{PrepareContext, PrepareResult, ProfileError};

#[derive(Debug)]
pub enum FrameworkSkeletonError {
    Io(io::Error),
    Copy(String),
    DependencyInstallerMissing(String),
    CommandFailed(String),
    VendorMissing,
}

impl std::fmt::Display for FrameworkSkeletonError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FrameworkSkeletonError::Io(err) => write!(f, "IO error: {err}"),
            FrameworkSkeletonError::Copy(msg) => write!(f, "{msg}"),
            FrameworkSkeletonError::DependencyInstallerMissing(program) => write!(
                f,
                "Dependency installer not found ({program}). Configure it in Settings or install it on PATH."
            ),
            FrameworkSkeletonError::CommandFailed(msg) => write!(f, "{msg}"),
            FrameworkSkeletonError::VendorMissing => {
                write!(f, "Framework vendor directory is missing after install.")
            }
        }
    }
}

pub fn framework_terminal_env(
    manifest: &EnvironmentManifest,
    skeleton_root: &Path,
    workspace_path: &Path,
) -> Result<HashMap<String, String>, FrameworkSkeletonError> {
    let spec = manifest.terminal_env.as_ref().ok_or_else(|| {
        FrameworkSkeletonError::Copy(format!("{}: missing terminal_env", manifest.id))
    })?;

    let mut env = HashMap::new();
    env.insert(
        spec.framework_root.clone(),
        skeleton_root.to_string_lossy().to_string(),
    );
    env.insert(
        spec.workspace.clone(),
        workspace_path.to_string_lossy().to_string(),
    );
    Ok(env)
}

const SKELETON_VERSION_FILE: &str = "skeleton.version";

pub struct SkeletonReady {
    pub path: PathBuf,
    pub installed_vendor: bool,
}

pub fn prepare(
    manifest: &EnvironmentManifest,
    ctx: PrepareContext<'_>,
) -> Result<PrepareResult, ProfileError> {
    let skeleton_root =
        ensure_framework_ready_with_workspace(manifest, ctx.extra_paths, Some(ctx.workspace_path))
            .map_err(ProfileError::Framework)?;

    let prepare = manifest
        .prepare
        .as_ref()
        .ok_or_else(|| ProfileError::Prepare(format!("{}: missing prepare spec", manifest.id)))?;

    let bootstrap_path = match prepare {
        PrepareSpec::WriteTemplate { output, template } => write_template_bootstrap(
            ctx.workspace_path,
            ctx.snippet_path,
            &skeleton_root,
            ctx.extra_paths,
            output,
            template,
        )
        .map_err(|error| ProfileError::Prepare(error.to_string()))?,
    };

    Ok(PrepareResult {
        script_path: bootstrap_path,
        extra_env: HashMap::new(),
    })
}

pub fn ensure_framework_ready(
    manifest: &EnvironmentManifest,
    extra_paths: &HashMap<String, String>,
) -> Result<PathBuf, FrameworkSkeletonError> {
    ensure_framework_ready_with_workspace(manifest, extra_paths, None)
}

fn ensure_framework_ready_with_workspace(
    manifest: &EnvironmentManifest,
    extra_paths: &HashMap<String, String>,
    workspace_path: Option<&Path>,
) -> Result<PathBuf, FrameworkSkeletonError> {
    let skeleton = manifest
        .skeleton
        .as_ref()
        .ok_or_else(|| FrameworkSkeletonError::Copy("Missing skeleton spec".to_string()))?;

    let ready = ensure_skeleton(&manifest.id, skeleton, extra_paths)?;
    if ready.installed_vendor {
        let workspace = workspace_path.unwrap_or(&ready.path);
        run_post_install(&ready.path, workspace, &manifest.post_install, extra_paths)?;
    }
    Ok(ready.path)
}

pub fn skeleton_home(environment_id: &str) -> Result<PathBuf, FrameworkSkeletonError> {
    let home = std::env::var("HOME").map_err(|_| {
        FrameworkSkeletonError::Copy("Could not resolve home directory".to_string())
    })?;
    Ok(PathBuf::from(home)
        .join(".runspace")
        .join("frameworks")
        .join(environment_id))
}

fn bundled_skeleton_source(bundled_dir: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("frameworks")
        .join(bundled_dir)
}

fn bundled_template_source(template: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("environments")
        .join("templates")
        .join(template)
}

fn framework_template_context<'a>(
    paths: &'a HashMap<String, String>,
    skeleton_root: &'a Path,
    workspace_path: &'a Path,
    entry_file: &'a Path,
) -> FrameworkTemplateContext<'a> {
    FrameworkTemplateContext {
        paths,
        skeleton_root,
        workspace_path,
        entry_file,
    }
}

fn ensure_skeleton(
    environment_id: &str,
    skeleton: &SkeletonSpec,
    extra_paths: &HashMap<String, String>,
) -> Result<SkeletonReady, FrameworkSkeletonError> {
    let target = skeleton_home(environment_id)?;
    let source = bundled_skeleton_source(&skeleton.bundled_dir);

    if !source.is_dir() {
        return Err(FrameworkSkeletonError::Copy(format!(
            "Bundled skeleton not found: {}",
            source.display()
        )));
    }

    let excluded_dirs: Vec<&str> = skeleton
        .sync_exclude_dirs
        .iter()
        .map(String::as_str)
        .collect();
    let excluded_files: Vec<&str> = skeleton
        .sync_exclude_files
        .iter()
        .map(String::as_str)
        .collect();

    let dependency = skeleton.dependency_install.as_ref();
    let vendor_marker = dependency
        .map(|spec| target.join(&spec.vendor_marker))
        .unwrap_or_default();

    let mut needs_dependency_install = false;

    if !target.exists() {
        copy_dir_recursive(&source, &target)?;
        needs_dependency_install = dependency.is_some();
    } else if !skeleton_is_current(&source, &target) {
        sync_bundled_skeleton(&source, &target, &excluded_dirs, &excluded_files)?;
        needs_dependency_install = dependency.is_some();
    } else if dependency.is_some_and(|spec| dependency_manifests_differ(&source, &target, spec)) {
        sync_bundled_skeleton(&source, &target, &excluded_dirs, &excluded_files)?;
        if let Some(parent) = vendor_marker.parent() {
            remove_path_if_exists(parent)?;
        }
        needs_dependency_install = true;
    }

    if dependency.is_some() && vendor_marker.is_file() && !needs_dependency_install {
        return Ok(SkeletonReady {
            path: target,
            installed_vendor: false,
        });
    }

    let Some(spec) = dependency else {
        return Ok(SkeletonReady {
            path: target,
            installed_vendor: false,
        });
    };

    if needs_dependency_install || !vendor_marker.is_file() {
        run_dependency_install(spec, extra_paths, &target, &source)?;

        if !vendor_marker.is_file() {
            return Err(FrameworkSkeletonError::VendorMissing);
        }

        return Ok(SkeletonReady {
            path: target,
            installed_vendor: true,
        });
    }

    Ok(SkeletonReady {
        path: target,
        installed_vendor: false,
    })
}

fn run_dependency_install(
    spec: &DependencyInstallSpec,
    extra_paths: &HashMap<String, String>,
    target: &Path,
    source: &Path,
) -> Result<(), FrameworkSkeletonError> {
    let context = framework_template_context(extra_paths, target, target, target);
    let program = resolve_framework_path(&spec.program, &context);
    let program_text = program.to_string_lossy().to_string();

    if !program.is_file() {
        return Err(FrameworkSkeletonError::DependencyInstallerMissing(
            program_text,
        ));
    }

    let args = resolve_framework_args(&spec.args, &context);
    let arg_refs: Vec<&str> = args.iter().map(String::as_str).collect();

    run_command(&program, target, &arg_refs).map_err(|error| {
        FrameworkSkeletonError::CommandFailed(format!(
            "Dependency install failed for {}: {error}",
            source.display()
        ))
    })
}

fn run_post_install(
    skeleton_root: &Path,
    workspace_path: &Path,
    steps: &[PostInstallStep],
    extra_paths: &HashMap<String, String>,
) -> Result<(), FrameworkSkeletonError> {
    for step in steps {
        match step {
            PostInstallStep::CreateEmptyFile { path } => {
                let file_path = skeleton_root.join(path);
                if !file_path.is_file() {
                    if let Some(parent) = file_path.parent() {
                        fs::create_dir_all(parent).map_err(FrameworkSkeletonError::Io)?;
                    }
                    fs::File::create(&file_path).map_err(FrameworkSkeletonError::Io)?;
                }
            }
            PostInstallStep::CreateDir { path } => {
                fs::create_dir_all(skeleton_root.join(path)).map_err(FrameworkSkeletonError::Io)?;
            }
            PostInstallStep::Run { program, args, cwd } => {
                let entry = workspace_path.join("_runspace_entry_placeholder");
                let context =
                    framework_template_context(extra_paths, skeleton_root, workspace_path, &entry);
                let resolved_program = resolve_framework_path(program, &context);
                let resolved_args = resolve_framework_args(args, &context);
                let command_cwd = match cwd {
                    StepCwd::Skeleton => skeleton_root,
                    StepCwd::Workspace => workspace_path,
                };
                let arg_refs: Vec<&str> = resolved_args.iter().map(String::as_str).collect();
                run_command(&resolved_program, command_cwd, &arg_refs)?;
            }
        }
    }

    Ok(())
}

fn run_command(program: &Path, cwd: &Path, args: &[&str]) -> Result<(), FrameworkSkeletonError> {
    let output = Command::new(program)
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(FrameworkSkeletonError::Io)?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    Err(FrameworkSkeletonError::CommandFailed(format!(
        "Command failed ({}): {}{}",
        args.join(" "),
        stderr.trim(),
        if stdout.trim().is_empty() {
            String::new()
        } else {
            format!("\n{}", stdout.trim())
        }
    )))
}

fn write_template_bootstrap(
    workspace_path: &Path,
    entry_path: &Path,
    skeleton_root: &Path,
    extra_paths: &HashMap<String, String>,
    output: &str,
    template: &str,
) -> Result<PathBuf, FrameworkSkeletonError> {
    let template_path = bundled_template_source(template);
    let raw = fs::read_to_string(&template_path).map_err(|error| {
        FrameworkSkeletonError::Copy(format!(
            "Bootstrap template not found ({}): {error}",
            template_path.display()
        ))
    })?;

    let context =
        framework_template_context(extra_paths, skeleton_root, workspace_path, entry_path);
    let content = resolve_framework_embed_template(&raw, &context);
    let bootstrap_path = workspace_path.join(output);
    fs::write(&bootstrap_path, content).map_err(FrameworkSkeletonError::Io)?;
    Ok(bootstrap_path)
}

fn dependency_manifests_differ(source: &Path, target: &Path, spec: &DependencyInstallSpec) -> bool {
    spec.manifest_files.iter().any(|name| {
        let src = source.join(name);
        if !src.is_file() {
            return false;
        }
        file_contents_differ(&src, &target.join(name))
    })
}

fn remove_path_if_exists(path: &Path) -> Result<(), FrameworkSkeletonError> {
    if path.is_dir() {
        fs::remove_dir_all(path).map_err(FrameworkSkeletonError::Io)?;
    } else if path.is_file() {
        fs::remove_file(path).map_err(FrameworkSkeletonError::Io)?;
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

fn sync_bundled_skeleton(
    source: &Path,
    target: &Path,
    excluded_dir_names: &[&str],
    excluded_relative_files: &[&str],
) -> Result<(), FrameworkSkeletonError> {
    fs::create_dir_all(target).map_err(FrameworkSkeletonError::Io)?;
    sync_dir_excluding(source, target, excluded_dir_names, excluded_relative_files)
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
    excluded_relative_files: &[&str],
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
            if excluded_relative_files
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
            sync_dir_excluding(
                &entry.path(),
                &dest,
                excluded_dir_names,
                excluded_relative_files,
            )?;
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
    use crate::environment::manifest::DependencyInstallSpec;

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
    fn dependency_manifests_differ_detects_changed_lock() {
        let temp = std::env::temp_dir().join(format!(
            "runspace-manifest-diff-test-{}",
            std::process::id()
        ));
        let source = temp.join("source");
        let target = temp.join("target");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&target).unwrap();
        fs::write(source.join("deps.lock"), "a").unwrap();
        fs::write(target.join("deps.lock"), "b").unwrap();

        let spec = DependencyInstallSpec {
            program: "{{installer_path}}".to_string(),
            args: vec!["install".to_string()],
            vendor_marker: "vendor/autoload.php".to_string(),
            manifest_files: vec!["manifest.json".to_string(), "deps.lock".to_string()],
        };

        assert!(dependency_manifests_differ(&source, &target, &spec));

        let _ = fs::remove_dir_all(&temp);
    }

    #[test]
    fn sync_bundled_skeleton_copies_files_without_excluded_dirs() {
        let temp = std::env::temp_dir().join(format!(
            "runspace-skeleton-sync-test-{}",
            std::process::id()
        ));
        let source = temp.join("source");
        let target = temp.join("target");
        let _ = fs::remove_dir_all(&temp);
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&target).unwrap();
        fs::write(source.join("bootstrap.txt"), "ok").unwrap();
        fs::write(source.join(SKELETON_VERSION_FILE), "1").unwrap();
        fs::create_dir_all(source.join("vendor")).unwrap();
        fs::write(source.join("vendor/marker.txt"), "x").unwrap();

        sync_bundled_skeleton(&source, &target, &["vendor"], &[]).unwrap();

        assert!(target.join("bootstrap.txt").is_file());
        assert!(target.join(SKELETON_VERSION_FILE).is_file());
        assert!(!target.join("vendor/marker.txt").is_file());

        let _ = fs::remove_dir_all(&temp);
    }
}
