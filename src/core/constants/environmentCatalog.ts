import type { EnvironmentDefinition } from "../types/environment";

/**
 * The default file extension.
 * @returns The default file extension.
 */
export const DEFAULT_FILE_EXTENSION = "txt";

/**
 * The default environment ID.
 * @returns The default environment ID.
 */
export const DEFAULT_ENVIRONMENT_ID = "nodejs";

/**
 * Creates a language definition.
 * @param id - The ID of the language.
 * @param name - The name of the language.
 * @param fileExtension - The file extension of the language.
 * @param monacoLanguage - The Monaco language ID.
 * @param installGuideUrl - The URL of the install guide.
 * @param binaryKey - The key of the binary field.
 * @param binaryLabel - The label of the binary field.
 * @returns The language definition.
 */
function languageDefinition(
  id: string,
  name: string,
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
    file_extension: fileExtension,
    monaco_language: monacoLanguage,
    install_guide_url: installGuideUrl,
    config_fields: [
      { key: binaryKey, label: binaryLabel, field_type: "file_path", required: true },
    ],
  };
}

/**
 * Creates a framework definition.
 * @param id - The ID of the framework.
 * @param name - The name of the framework.
 * @param installGuideUrl - The URL of the install guide.
 * @returns The framework definition.
 */
function frameworkDefinition(
  id: string,
  name: string,
  installGuideUrl: string,
): EnvironmentDefinition {
  return {
    id,
    name,
    category: "framework",
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

/**
 * The environment catalog.
 * @returns The environment catalog.
 */
export const ENVIRONMENT_CATALOG: EnvironmentDefinition[] = [
  languageDefinition(
    "nodejs",
    "Node.js",
    "js",
    "javascript",
    "https://nodejs.org/en/download",
    "node_path",
    "Node.js binary",
  ),
  languageDefinition(
    "php",
    "PHP",
    "php",
    "php",
    "https://www.php.net/downloads",
    "php_path",
    "PHP binary",
  ),
  languageDefinition(
    "python",
    "Python",
    "py",
    "python",
    "https://www.python.org/downloads/",
    "python_path",
    "Python binary",
  ),
  languageDefinition(
    "ruby",
    "Ruby",
    "rb",
    "ruby",
    "https://www.ruby-lang.org/en/downloads/",
    "ruby_path",
    "Ruby binary",
  ),
  languageDefinition(
    "gcc",
    "GCC (C)",
    "c",
    "c",
    "https://developer.apple.com/xcode/resources/",
    "gcc_path",
    "GCC binary",
  ),
  languageDefinition(
    "gpp",
    "G++ (C++)",
    "cpp",
    "cpp",
    "https://developer.apple.com/xcode/resources/",
    "gpp_path",
    "G++ binary",
  ),
  frameworkDefinition("laravel", "Laravel", "https://laravel.com/docs/installation"),
  frameworkDefinition("symfony", "Symfony", "https://symfony.com/download"),
];

/**
 * Gets the definition for the given ID.
 * @param id - The ID of the definition.
 * @returns The definition for the given ID.
 */
export function getCatalogDefinition(id: string): EnvironmentDefinition | undefined {
  return ENVIRONMENT_CATALOG.find((definition) => definition.id === id);
}
