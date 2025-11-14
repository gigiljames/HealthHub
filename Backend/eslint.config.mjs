import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    ignores: ["dist", "node_modules", "logs"],

    languageOptions: {
      parserOptions: {
        sourceType: "module",
        project: null,
      },
      globals: {
        NodeJS: true,
      },
    },

    rules: {
      "no-console": "off",
      "no-debugger": "warn",
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      ...prettier.rules,
    },
  },
]);
