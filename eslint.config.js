import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import vitest from "eslint-plugin-vitest";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const negationSpacing = {
  "@stylistic/space-unary-ops": [
    "error",
    {
      words: true,
      nonwords: false,
      overrides: {
        "!": false,
        "!!": false,
      },
    },
  ],
};

const lintedFiles = [
  "src/**/*.{ts,tsx}",
  "tests/**/*.{ts,tsx}",
  "vite.config.ts",
  "vitest.config.ts",
  "eslint.config.js",
];

export default tseslint.config(
  {
    ignores: ["dist", "src-tauri/**", "node_modules", "coverage"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["vite.config.ts", "vitest.config.ts", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
  {
    files: lintedFiles,
    plugins: {
      "@stylistic": stylistic,
    },
    rules: negationSpacing,
  },
);
