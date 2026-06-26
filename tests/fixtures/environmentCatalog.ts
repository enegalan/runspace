import type { EnvironmentDefinition } from "../../src/core/types/environment";

/**
 * The default environment id in bundled manifests (for tests).
 */
export const TEST_DEFAULT_ENVIRONMENT_ID = "nodejs";

/**
 * Minimal test catalog: script, framework, and compiled profiles.
 */
export const TEST_ENVIRONMENT_CATALOG: EnvironmentDefinition[] = [
  {
    id: "nodejs",
    name: "Node.js",
    category: "language",
    file_extension: "js",
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
    id: "laravel",
    name: "Laravel",
    category: "framework",
    file_extension: "php",
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
    id: "gcc",
    name: "GCC (C)",
    category: "language",
    file_extension: "c",
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
];
