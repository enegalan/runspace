use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub struct TemplateContext<'a> {
    pub paths: &'a HashMap<String, String>,
    pub entry_file: &'a Path,
    pub output_binary: &'a Path,
}

pub fn resolve_template(value: &str, context: &TemplateContext<'_>) -> String {
    let mut resolved = value.to_string();

    for (key, path_value) in context.paths {
        let placeholder = format!("{{{{{key}}}}}");
        if resolved.contains(&placeholder) {
            resolved = resolved.replace(&placeholder, path_value);
        }
    }

    resolved = resolved.replace("{{entry_file}}", &context.entry_file.to_string_lossy());
    resolved = resolved.replace(
        "{{output_binary}}",
        &context.output_binary.to_string_lossy(),
    );

    resolved
}

pub fn resolve_path_template(value: &str, context: &TemplateContext<'_>) -> PathBuf {
    PathBuf::from(resolve_template(value, context))
}

pub fn resolve_args(values: &[String], context: &TemplateContext<'_>) -> Vec<String> {
    values
        .iter()
        .map(|value| resolve_template(value, context))
        .collect()
}

pub struct FrameworkTemplateContext<'a> {
    pub paths: &'a HashMap<String, String>,
    pub skeleton_root: &'a Path,
    pub workspace_path: &'a Path,
    pub entry_file: &'a Path,
}

pub fn resolve_framework_template(value: &str, context: &FrameworkTemplateContext<'_>) -> String {
    resolve_framework_template_with_options(value, context, false)
}

pub fn resolve_framework_embed_template(
    value: &str,
    context: &FrameworkTemplateContext<'_>,
) -> String {
    resolve_framework_template_with_options(value, context, true)
}

fn resolve_framework_template_with_options(
    value: &str,
    context: &FrameworkTemplateContext<'_>,
    escape_paths: bool,
) -> String {
    let mut resolved = value.to_string();

    for (key, path_value) in context.paths {
        resolved = resolved.replace(&format!("{{{{{key}}}}}"), path_value);
    }

    let skeleton = format_path_value(context.skeleton_root, escape_paths);
    let workspace = format_path_value(context.workspace_path, escape_paths);
    let entry = format_path_value(context.entry_file, escape_paths);

    resolved = resolved.replace("{{skeleton_root}}", &skeleton);
    resolved = resolved.replace("{{workspace_path}}", &workspace);
    resolved = resolved.replace("{{entry_file}}", &entry);

    resolved
}

fn format_path_value(path: &Path, escape: bool) -> String {
    let value = path.to_string_lossy();
    if escape {
        escape_for_embedded_literal(&value)
    } else {
        value.into_owned()
    }
}

pub fn resolve_framework_path(value: &str, context: &FrameworkTemplateContext<'_>) -> PathBuf {
    PathBuf::from(resolve_framework_template(value, context))
}

pub fn resolve_framework_args(
    values: &[String],
    context: &FrameworkTemplateContext<'_>,
) -> Vec<String> {
    values
        .iter()
        .map(|value| resolve_framework_template(value, context))
        .collect()
}

fn escape_for_embedded_literal(value: &str) -> String {
    value.replace('\\', "\\\\").replace('\'', "\\'")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn resolve_template_replaces_paths_and_entry_file() {
        let paths = HashMap::from([("node_path".to_string(), "/usr/bin/node".to_string())]);
        let entry = PathBuf::from("/tmp/workspace/main.js");
        let output = PathBuf::from("/tmp/workspace/runspace_out");
        let context = TemplateContext {
            paths: &paths,
            entry_file: &entry,
            output_binary: &output,
        };

        assert_eq!(resolve_template("{{node_path}}", &context), "/usr/bin/node");
        assert_eq!(
            resolve_args(
                &vec!["{{node_path}}".to_string(), "{{entry_file}}".to_string()],
                &context
            ),
            vec![
                "/usr/bin/node".to_string(),
                "/tmp/workspace/main.js".to_string()
            ]
        );
    }

    #[test]
    fn resolve_framework_embed_template_escapes_paths_for_source_embedding() {
        let paths = HashMap::from([("php_path".to_string(), "/usr/bin/php".to_string())]);
        let skeleton = PathBuf::from(r"C:\skeleton\root");
        let workspace = PathBuf::from("/tmp/workspace");
        let entry = PathBuf::from(r"C:\tmp\entry's.php");
        let context = FrameworkTemplateContext {
            paths: &paths,
            skeleton_root: &skeleton,
            workspace_path: &workspace,
            entry_file: &entry,
        };

        assert_eq!(
            resolve_framework_template("{{skeleton_root}}", &context),
            r"C:\skeleton\root"
        );
        assert_eq!(
            resolve_framework_embed_template(
                "putenv('ROOT={{skeleton_root}}'); include '{{entry_file}}';",
                &context
            ),
            r"putenv('ROOT=C:\\skeleton\\root'); include 'C:\\tmp\\entry\'s.php';"
        );
    }
}
