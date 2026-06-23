import type { EnvironmentDefinition } from "../../src/core/types/environment";

/**
 * The default environment id in bundled manifests (for tests).
 */
export const TEST_DEFAULT_ENVIRONMENT_ID = "nodejs";

/**
 * The test environment catalog.
 */
export const TEST_ENVIRONMENT_CATALOG: EnvironmentDefinition[] = [
  {
    id: "nodejs",
    name: "Node.js",
    category: "language",
    file_extension: "js",
    monaco_language: "javascript",
    install_guide_url: "https://nodejs.org/en/download",
    config_fields: [
      {
        key: "node_path",
        label: "Node.js binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
    ],
  },
  {
    id: "php",
    name: "PHP",
    category: "language",
    file_extension: "php",
    monaco_language: "php",
    install_guide_url: "https://www.php.net/downloads",
    config_fields: [
      {
        key: "php_path",
        label: "PHP binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
    ],
  },
  {
    id: "python",
    name: "Python",
    category: "language",
    file_extension: "py",
    monaco_language: "python",
    install_guide_url: "https://www.python.org/downloads/",
    config_fields: [
      {
        key: "python_path",
        label: "Python binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
    ],
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "language",
    file_extension: "rb",
    monaco_language: "ruby",
    install_guide_url: "https://www.ruby-lang.org/en/downloads/",
    config_fields: [
      {
        key: "ruby_path",
        label: "Ruby binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
    ],
  },
  {
    id: "gcc",
    name: "GCC (C)",
    category: "language",
    file_extension: "c",
    monaco_language: "c",
    install_guide_url: "https://developer.apple.com/xcode/resources/",
    config_fields: [
      {
        key: "gcc_path",
        label: "GCC binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
    ],
  },
  {
    id: "gpp",
    name: "G++ (C++)",
    category: "language",
    file_extension: "cpp",
    monaco_language: "cpp",
    install_guide_url: "https://developer.apple.com/xcode/resources/",
    config_fields: [
      {
        key: "gpp_path",
        label: "G++ binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
    ],
  },
  {
    id: "laravel",
    name: "Laravel",
    category: "framework",
    file_extension: "php",
    monaco_language: "php",
    install_guide_url: "https://laravel.com/docs/installation",
    config_fields: [
      {
        key: "php_path",
        label: "PHP binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
      {
        key: "composer_path",
        label: "Composer binary (skeleton install)",
        field_type: "file_path",
        required: false,
      },
    ],
  },
  {
    id: "symfony",
    name: "Symfony",
    category: "framework",
    file_extension: "php",
    monaco_language: "php",
    install_guide_url: "https://symfony.com/download",
    config_fields: [
      {
        key: "php_path",
        label: "PHP binary",
        field_type: "file_path",
        required: true,
        primary: true,
      },
      {
        key: "composer_path",
        label: "Composer binary (skeleton install)",
        field_type: "file_path",
        required: false,
      },
    ],
  },
];
