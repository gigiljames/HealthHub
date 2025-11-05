import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, //  use TypeChecked variant
  {
    ignores: ["logs/*", "dist/*", "node_modules/*"],

    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json", //  tells ESLint where to find type info
        sourceType: "module",
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "arrow-body-style": ["error", "as-needed"],
      "prefer-arrow-callback": "error",
      "object-shorthand": ["error", "always"],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      indent: ["error", 2, { SwitchCase: 1 }],
      "comma-dangle": ["error", "always-multiline"],

      // enable type-aware rules
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // prettier
      ...prettier.rules,
    },
  },
]);
