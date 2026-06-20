use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "lowercase")]
pub enum ThemeMode {
    #[default]
    Dark,
    Light,
    System,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "lowercase")]
pub enum UiDensity {
    #[default]
    Comfortable,
    Compact,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct AppearanceSettings {
    pub theme: ThemeMode,
    pub ui_density: UiDensity,
    pub editor_font_size: u32,
    pub editor_font_family: String,
}

impl Default for AppearanceSettings {
    fn default() -> Self {
        Self {
            theme: ThemeMode::Dark,
            ui_density: UiDensity::Comfortable,
            editor_font_size: 13,
            editor_font_family: "JetBrains Mono".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct EditorSettings {
    pub tab_size: u32,
    pub word_wrap: bool,
    pub minimap: bool,
    pub scroll_beyond_last_line: bool,
    pub insert_spaces: bool,
    pub auto_save: bool,
}

impl Default for EditorSettings {
    fn default() -> Self {
        Self {
            tab_size: 2,
            word_wrap: true,
            minimap: false,
            scroll_beyond_last_line: false,
            insert_spaces: true,
            auto_save: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct ExecutionSettings {
    pub run_timeout_secs: u64,
    pub compile_timeout_secs: u64,
    pub auto_clear_output: bool,
    pub auto_scroll_output: bool,
    pub run_on_save: bool,
    pub run_on_tab_change: bool,
}

impl Default for ExecutionSettings {
    fn default() -> Self {
        Self {
            run_timeout_secs: 30,
            compile_timeout_secs: 15,
            auto_clear_output: true,
            auto_scroll_output: true,
            run_on_save: true,
            run_on_tab_change: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct LayoutSettings {
    pub sidebar_width: u32,
    pub output_width: u32,
    pub terminal_height: u32,
    pub sidebar_visible: bool,
    pub output_visible: bool,
    pub terminal_visible: bool,
    pub restore_last_workspace: bool,
    pub confirm_close_unsaved_tab: bool,
}

impl Default for LayoutSettings {
    fn default() -> Self {
        Self {
            sidebar_width: 260,
            output_width: 300,
            terminal_height: 200,
            sidebar_visible: true,
            output_visible: true,
            terminal_visible: true,
            restore_last_workspace: true,
            confirm_close_unsaved_tab: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct ShortcutBinding {
    pub key: String,
    #[serde(rename = "mod")]
    pub mod_key: bool,
    #[serde(default)]
    pub shift: bool,
    #[serde(default)]
    pub alt: bool,
}

impl ShortcutBinding {
    fn normalized(key: &str, mod_key: bool, shift: bool, alt: bool) -> Self {
        Self {
            key: key.to_lowercase(),
            mod_key,
            shift,
            alt,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct ShortcutSettings {
    pub run: ShortcutBinding,
    pub stop: ShortcutBinding,
    pub save: ShortcutBinding,
    pub new_file: ShortcutBinding,
    pub new_folder: ShortcutBinding,
    pub new_terminal: ShortcutBinding,
    pub toggle_sidebar: ShortcutBinding,
    pub toggle_output: ShortcutBinding,
    pub open_settings: ShortcutBinding,
}

impl Default for ShortcutSettings {
    fn default() -> Self {
        Self {
            run: ShortcutBinding::normalized("enter", true, false, false),
            stop: ShortcutBinding::normalized(".", true, false, false),
            save: ShortcutBinding::normalized("s", true, false, false),
            new_file: ShortcutBinding::normalized("n", true, false, false),
            new_folder: ShortcutBinding::normalized("n", true, true, false),
            new_terminal: ShortcutBinding::normalized("t", true, true, false),
            toggle_sidebar: ShortcutBinding::normalized("b", true, false, false),
            toggle_output: ShortcutBinding::normalized("j", true, false, false),
            open_settings: ShortcutBinding::normalized(",", true, false, false),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct AppSettings {
    pub appearance: AppearanceSettings,
    pub editor: EditorSettings,
    pub execution: ExecutionSettings,
    pub layout: LayoutSettings,
    pub shortcuts: ShortcutSettings,
}

#[derive(Debug)]
pub enum SettingsError {
    Io(std::io::Error),
    Json(String),
}

impl std::fmt::Display for SettingsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SettingsError::Io(e) => write!(f, "IO error: {e}"),
            SettingsError::Json(msg) => write!(f, "JSON error: {msg}"),
        }
    }
}

impl From<std::io::Error> for SettingsError {
    fn from(err: std::io::Error) -> Self {
        SettingsError::Io(err)
    }
}

impl From<serde_json::Error> for SettingsError {
    fn from(err: serde_json::Error) -> Self {
        SettingsError::Json(err.to_string())
    }
}
