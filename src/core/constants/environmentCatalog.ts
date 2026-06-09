import type { EnvironmentDefinition } from "../types/environment";

export const DEFAULT_ENVIRONMENT_ID = "nodejs";

export const ENVIRONMENT_CATALOG: EnvironmentDefinition[] = [
  {
    id: "nodejs",
    name: "Node.js",
    category: "language",
    entry_file: "main.js",
    file_extension: "js",
    monaco_language: "javascript",
    install_guide_url: "https://nodejs.org/en/download",
    config_fields: [
      { key: "node_path", label: "Node.js binary", field_type: "file_path", required: true },
    ],
  },
];
