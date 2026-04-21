import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist"],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-inferrable-types": "off",
    },
  },
);
