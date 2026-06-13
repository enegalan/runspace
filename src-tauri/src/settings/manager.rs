use std::fs;
use std::path::PathBuf;

use serde_json::Value;

use super::types::{AppSettings, SettingsError};

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
}
