use super::types::{ConfigField, ConfigFieldType, EnvironmentCategory, EnvironmentDefinition};

fn file_field(key: &str, label: &str, required: bool) -> ConfigField {
    ConfigField {
        key: key.to_string(),
        label: label.to_string(),
        field_type: ConfigFieldType::FilePath,
        required,
    }
}

fn language_definition(
    id: &str,
    name: &str,
    entry_file: &str,
    file_extension: &str,
    monaco_language: &str,
    install_guide_url: &str,
    binary_key: &str,
    binary_label: &str,
) -> EnvironmentDefinition {
    EnvironmentDefinition {
        id: id.to_string(),
        name: name.to_string(),
        category: EnvironmentCategory::Language,
        entry_file: Some(entry_file.to_string()),
        file_extension: file_extension.to_string(),
        monaco_language: monaco_language.to_string(),
        install_guide_url: install_guide_url.to_string(),
        config_fields: vec![file_field(binary_key, binary_label, true)],
    }
}

fn framework_definition(
    id: &str,
    name: &str,
    install_guide_url: &str,
) -> EnvironmentDefinition {
    EnvironmentDefinition {
        id: id.to_string(),
        name: name.to_string(),
        category: EnvironmentCategory::Framework,
        entry_file: Some("snippet.php".to_string()),
        file_extension: "php".to_string(),
        monaco_language: "php".to_string(),
        install_guide_url: install_guide_url.to_string(),
        config_fields: vec![
            file_field("php_path", "PHP binary", true),
            file_field("composer_path", "Composer binary (skeleton install)", false),
        ],
    }
}

pub fn get_catalog() -> Vec<EnvironmentDefinition> {
    vec![
        language_definition(
            "nodejs",
            "Node.js",
            "main.js",
            "js",
            "javascript",
            "https://nodejs.org/en/download",
            "node_path",
            "Node.js binary",
        ),
        language_definition(
            "php",
            "PHP",
            "main.php",
            "php",
            "php",
            "https://www.php.net/downloads",
            "php_path",
            "PHP binary",
        ),
        language_definition(
            "python",
            "Python",
            "main.py",
            "py",
            "python",
            "https://www.python.org/downloads/",
            "python_path",
            "Python binary",
        ),
        language_definition(
            "ruby",
            "Ruby",
            "main.rb",
            "rb",
            "ruby",
            "https://www.ruby-lang.org/en/downloads/",
            "ruby_path",
            "Ruby binary",
        ),
        framework_definition(
            "laravel",
            "Laravel",
            "https://laravel.com/docs/installation",
        ),
        framework_definition(
            "symfony",
            "Symfony",
            "https://symfony.com/download",
        ),
    ]
}

pub fn get_definition(id: &str) -> Option<EnvironmentDefinition> {
    get_catalog().into_iter().find(|d| d.id == id)
}

pub fn binary_field_key(environment_id: &str) -> Option<&'static str> {
    match environment_id {
        "nodejs" => Some("node_path"),
        "php" | "laravel" | "symfony" => Some("php_path"),
        "python" => Some("python_path"),
        "ruby" => Some("ruby_path"),
        _ => None,
    }
}
