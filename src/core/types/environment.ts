export type EnvironmentCategory = "language" | "framework";

export type ConfigFieldType = "file_path" | "directory_path" | "text";

export interface DetectConfig {
  commands: string[];
}

export interface ConfigField {
  key: string;
  label: string;
  field_type: ConfigFieldType;
  required: boolean;
  primary?: boolean;
  detect?: DetectConfig;
}

export interface EnvironmentPresentation {
  accent: string;
}

export interface EnvironmentDefinition {
  id: string;
  name: string;
  category: EnvironmentCategory;
  file_extension: string;
  monaco_language: string;
  install_guide_url: string;
  config_fields: ConfigField[];
  presentation?: EnvironmentPresentation;
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

export type EnvironmentId = string;
