use std::fs;
use std::path::PathBuf;

use serde_json::Value;

use super::types::{AppSettings, SettingsError, ShortcutBinding, ShortcutSettings};

pub struct SettingsManager {
    config_path: PathBuf,
    settings: AppSettings,
}

impl SettingsManager {
    pub fn new(config_path: PathBuf) -> Result<Self, SettingsError> {
        let mut manager = Self {
            config_path,
            settings: AppSettings::default(),
        };
        manager.load()?;
        Ok(manager)
    }

    pub fn get(&self) -> &AppSettings {
        &self.settings
    }

    pub fn update(&mut self, patch: Value) -> Result<AppSettings, SettingsError> {
        let current = serde_json::to_value(&self.settings)?;
        let merged = merge_json(current, patch);
        self.settings = serde_json::from_value(merged)?;
        self.normalize();
        self.save()?;
        Ok(self.settings.clone())
    }

    pub fn save(&self) -> Result<(), SettingsError> {
        if let Some(parent) = self.config_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(&self.settings)?;
        fs::write(&self.config_path, json)?;
        Ok(())
    }

    pub fn load(&mut self) -> Result<(), SettingsError> {
        if !self.config_path.exists() {
            return Ok(());
        }
        let content = fs::read_to_string(&self.config_path)?;
        self.settings = serde_json::from_str(&content)?;
        self.normalize();
        Ok(())
    }

    fn normalize(&mut self) {
        self.settings.appearance.editor_font_size =
            self.settings.appearance.editor_font_size.clamp(10, 24);
        self.settings.editor.tab_size = match self.settings.editor.tab_size {
            4 => 4,
            8 => 8,
            _ => 2,
        };
        self.settings.execution.run_timeout_secs =
            self.settings.execution.run_timeout_secs.clamp(5, 300);
        self.settings.execution.compile_timeout_secs =
            self.settings.execution.compile_timeout_secs.clamp(5, 120);
        self.settings.layout.sidebar_width = self.settings.layout.sidebar_width.clamp(260, 480);
        self.settings.layout.output_width = self.settings.layout.output_width.clamp(200, 560);
        self.settings.layout.terminal_height = self.settings.layout.terminal_height.clamp(120, 480);
        self.settings.shortcuts = normalize_shortcut_settings(&self.settings.shortcuts);
    }
}

fn normalize_shortcut_binding(binding: &ShortcutBinding) -> ShortcutBinding {
    ShortcutBinding {
        key: binding.key.to_lowercase(),
        mod_key: binding.mod_key,
        shift: binding.shift,
        alt: binding.alt,
    }
}

fn normalize_shortcut_settings(settings: &ShortcutSettings) -> ShortcutSettings {
    let defaults = ShortcutSettings::default();
    ShortcutSettings {
        run: if settings.run.mod_key && !settings.run.key.is_empty() {
            normalize_shortcut_binding(&settings.run)
        } else {
            defaults.run
        },
        stop: if settings.stop.mod_key && !settings.stop.key.is_empty() {
            normalize_shortcut_binding(&settings.stop)
        } else {
            defaults.stop
        },
        save: if settings.save.mod_key && !settings.save.key.is_empty() {
            normalize_shortcut_binding(&settings.save)
        } else {
            defaults.save
        },
        new_file: if settings.new_file.mod_key && !settings.new_file.key.is_empty() {
            normalize_shortcut_binding(&settings.new_file)
        } else {
            defaults.new_file
        },
        new_folder: if settings.new_folder.mod_key && !settings.new_folder.key.is_empty() {
            normalize_shortcut_binding(&settings.new_folder)
        } else {
            defaults.new_folder
        },
        new_terminal: if settings.new_terminal.mod_key && !settings.new_terminal.key.is_empty() {
            normalize_shortcut_binding(&settings.new_terminal)
        } else {
            defaults.new_terminal
        },
        toggle_sidebar: if settings.toggle_sidebar.mod_key && !settings.toggle_sidebar.key.is_empty() {
            normalize_shortcut_binding(&settings.toggle_sidebar)
        } else {
            defaults.toggle_sidebar
        },
        toggle_output: if settings.toggle_output.mod_key && !settings.toggle_output.key.is_empty() {
            normalize_shortcut_binding(&settings.toggle_output)
        } else {
            defaults.toggle_output
        },
        open_settings: if settings.open_settings.mod_key && !settings.open_settings.key.is_empty() {
            normalize_shortcut_binding(&settings.open_settings)
        } else {
            defaults.open_settings
        },
    }
}

fn merge_json(base: Value, patch: Value) -> Value {
    match (base, patch) {
        (Value::Object(mut base_map), Value::Object(patch_map)) => {
            for (key, patch_value) in patch_map {
                if let Some(base_value) = base_map.remove(&key) {
                    base_map.insert(key, merge_json(base_value, patch_value));
                } else {
                    base_map.insert(key, patch_value);
                }
            }
            Value::Object(base_map)
        }
        (_, patch) => patch,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_home_lock::home_test_lock;

    fn temp_settings_path() -> PathBuf {
        std::env::temp_dir().join(format!(
            "runspace-settings-test-{}",
            std::process::id()
        ))
    }

    #[test]
    fn defaults_when_missing_file() {
        let _lock = home_test_lock();
        let temp_dir = temp_settings_path();
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();
        let path = temp_dir.join("settings.json");

        let manager = SettingsManager::new(path).expect("manager");
        assert_eq!(manager.get().execution.run_timeout_secs, 30);
        assert_eq!(manager.get().appearance.editor_font_size, 13);

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn partial_update_merges_nested() {
        let _lock = home_test_lock();
        let temp_dir = temp_settings_path();
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();
        let path = temp_dir.join("settings.json");

        let mut manager = SettingsManager::new(path.clone()).expect("manager");
        let updated = manager
            .update(serde_json::json!({
                "execution": { "runTimeoutSecs": 60 }
            }))
            .expect("update");

        assert_eq!(updated.execution.run_timeout_secs, 60);
        assert_eq!(updated.execution.compile_timeout_secs, 15);
        assert_eq!(
            updated.appearance.theme,
            super::super::types::ThemeMode::Dark
        );

        let reloaded = SettingsManager::new(path).expect("reload");
        assert_eq!(reloaded.get().execution.run_timeout_secs, 60);

        let _ = fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn shortcut_update_clears_removed_modifiers() {
        let _lock = home_test_lock();
        let temp_dir = temp_settings_path();
        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&temp_dir).unwrap();
        let path = temp_dir.join("settings.json");

        let mut manager = SettingsManager::new(path.clone()).expect("manager");
        manager
            .update(serde_json::json!({
                "shortcuts": {
                    "save": { "key": "s", "mod": true, "shift": true, "alt": true }
                }
            }))
            .expect("set three-key shortcut");

        let updated = manager
            .update(serde_json::json!({
                "shortcuts": {
                    "save": { "key": "s", "mod": true, "shift": false, "alt": false }
                }
            }))
            .expect("set two-key shortcut");

        assert!(!updated.shortcuts.save.shift);
        assert!(!updated.shortcuts.save.alt);

        let reloaded = SettingsManager::new(path).expect("reload");
        assert!(!reloaded.get().shortcuts.save.shift);
        assert!(!reloaded.get().shortcuts.save.alt);

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
