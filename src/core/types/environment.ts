export type EnvironmentCategory = "language" | "framework";

export type ConfigFieldType = "file_path" | "directory_path" | "text";

export interface ConfigField {
  key: string;
  label: string;
  field_type: ConfigFieldType;
  required: boolean;
}

export interface EnvironmentDefinition {
  id: string;
  name: string;
  category: EnvironmentCategory;
  entry_file: string | null;
  file_extension: string;
  monaco_language: string;
  install_guide_url: string;
  config_fields: ConfigField[];
}

export interface EnvironmentUserConfig {
  paths: Record<string, string>;
  env_vars: Record<string, string>;
}

export interface Environment {
  definition: EnvironmentDefinition;
  user_config: EnvironmentUserConfig;
  configured: boolean;
  version: string | null;
}

export interface ValidationResult {
  valid: boolean;
  version: string | null;
  errors: string[];
}

export type EnvironmentId =
  | "nodejs"
  | "php"
  | "python"
  | "ruby"
  | "laravel"
  | "symfony";
