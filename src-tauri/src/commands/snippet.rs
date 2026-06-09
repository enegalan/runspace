use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnippetData {
    pub code: String,
    pub language: String,
    pub updated_at: String,
}

fn snippet_path() -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|_| "Could not resolve home directory".to_string())?;
    Ok(PathBuf::from(home).join(".runspace").join("last-snippet.json"))
}

fn default_snippet() -> SnippetData {
    SnippetData {
        code: r#"console.log("Hello, Runspace!");"#.to_string(),
        language: "javascript".to_string(),
        updated_at: String::new(),
    }
}

fn parse_snippet(content: &str) -> SnippetData {
    match serde_json::from_str::<SnippetData>(content) {
        Ok(data) if !data.code.is_empty() => data,
        _ => default_snippet(),
    }
}

#[tauri::command]
pub fn read_snippet() -> Result<SnippetData, String> {
    let path = snippet_path()?;
    if !path.exists() {
        return Ok(default_snippet());
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(parse_snippet(&content))
}

#[tauri::command]
pub fn write_snippet(data: SnippetData) -> Result<(), String> {
    let path = snippet_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn parse_snippet_falls_back_on_invalid_json() {
        let data = parse_snippet("not json");
        assert_eq!(data.language, "javascript");
        assert!(data.code.contains("Hello, Runspace"));
    }

    #[test]
    fn write_and_read_roundtrip() {
        let temp_dir = env::temp_dir().join(format!("runspace-snippet-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&temp_dir).expect("temp dir");

        let original_home = env::var("HOME").ok();
        env::set_var("HOME", temp_dir.to_str().expect("utf8"));

        let snippet = SnippetData {
            code: "console.log(42);".to_string(),
            language: "javascript".to_string(),
            updated_at: "2026-06-09T00:00:00.000Z".to_string(),
        };

        write_snippet(snippet.clone()).expect("write");
        let loaded = read_snippet().expect("read");
        assert_eq!(loaded.code, snippet.code);
        assert_eq!(loaded.language, snippet.language);

        if let Some(home) = original_home {
            env::set_var("HOME", home);
        }
        let _ = fs::remove_dir_all(temp_dir);
    }
}
