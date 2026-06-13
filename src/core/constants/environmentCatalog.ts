import type { EnvironmentDefinition } from "../types/environment";

export const DEFAULT_ENVIRONMENT_ID = "nodejs";

function languageDefinition(
  id: string,
  name: string,
  entryFile: string,
  fileExtension: string,
  monacoLanguage: string,
  installGuideUrl: string,
  binaryKey: string,
  binaryLabel: string,
): EnvironmentDefinition {
  return {
    id,
    name,
    category: "language",
    entry_file: entryFile,
    file_extension: fileExtension,
    monaco_language: monacoLanguage,
    install_guide_url: installGuideUrl,
    config_fields: [
      { key: binaryKey, label: binaryLabel, field_type: "file_path", required: true },
    ],
  };
}

function frameworkDefinition(
  id: string,
  name: string,
  installGuideUrl: string,
): EnvironmentDefinition {
  return {
    id,
    name,
    category: "framework",
    entry_file: "main.php",
    file_extension: "php",
    monaco_language: "php",
    install_guide_url: installGuideUrl,
    config_fields: [
      { key: "php_path", label: "PHP binary", field_type: "file_path", required: true },
      {
        key: "composer_path",
        label: "Composer binary (skeleton install)",
        field_type: "file_path",
        required: false,
      },
    ],
  };
}

export const ENVIRONMENT_CATALOG: EnvironmentDefinition[] = [
  languageDefinition(
    "nodejs",
    "Node.js",
    "main.js",
    "js",
    "javascript",
    "https://nodejs.org/en/download",
    "node_path",
    "Node.js binary",
  ),
  languageDefinition(
    "php",
    "PHP",
    "main.php",
    "php",
    "php",
    "https://www.php.net/downloads",
    "php_path",
    "PHP binary",
  ),
  languageDefinition(
    "python",
    "Python",
    "main.py",
    "py",
    "python",
    "https://www.python.org/downloads/",
    "python_path",
    "Python binary",
  ),
  languageDefinition(
    "ruby",
    "Ruby",
    "main.rb",
    "rb",
    "ruby",
    "https://www.ruby-lang.org/en/downloads/",
    "ruby_path",
    "Ruby binary",
  ),
  languageDefinition(
    "gcc",
    "GCC (C)",
    "main.c",
    "c",
    "c",
    "https://developer.apple.com/xcode/resources/",
    "gcc_path",
    "GCC binary",
  ),
  languageDefinition(
    "gpp",
    "G++ (C++)",
    "main.cpp",
    "cpp",
    "cpp",
    "https://developer.apple.com/xcode/resources/",
    "gpp_path",
    "G++ binary",
  ),
  frameworkDefinition("laravel", "Laravel", "https://laravel.com/docs/installation"),
  frameworkDefinition("symfony", "Symfony", "https://symfony.com/download"),
];

export function getCatalogDefinition(id: string): EnvironmentDefinition | undefined {
  return ENVIRONMENT_CATALOG.find((definition) => definition.id === id);
}
