use super::types::{ConfigField, ConfigFieldType, EnvironmentCategory, EnvironmentDefinition};

fn file_field(key: &str, label: &str) -> ConfigField {
    ConfigField {
        key: key.to_string(),
        label: label.to_string(),
        field_type: ConfigFieldType::FilePath,
        required: true,
    }
}

pub fn get_catalog() -> Vec<EnvironmentDefinition> {
    vec![EnvironmentDefinition {
        id: "nodejs".to_string(),
        name: "Node.js".to_string(),
        category: EnvironmentCategory::Language,
        entry_file: Some("main.js".to_string()),
        file_extension: "js".to_string(),
        monaco_language: "javascript".to_string(),
        install_guide_url: "https://nodejs.org/en/download".to_string(),
        config_fields: vec![file_field("node_path", "Node.js binary")],
    }]
}

pub fn get_definition(id: &str) -> Option<EnvironmentDefinition> {
    get_catalog().into_iter().find(|d| d.id == id)
}

pub fn binary_field_key(environment_id: &str) -> Option<&'static str> {
    match environment_id {
        "nodejs" => Some("node_path"),
        _ => None,
    }
}
