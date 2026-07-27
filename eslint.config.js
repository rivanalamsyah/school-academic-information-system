import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Global ignores
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.cjs"],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React-specific rules
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      // React Hooks rules — catches common hook bugs
      ...reactHooks.configs.recommended.rules,

      // Warn if non-component or non-hook is exported with fast-refresh
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TypeScript: allow explicit 'any' in tests only; warn in src
      "@typescript-eslint/no-explicit-any": "warn",

      // TypeScript: unused variables should be errors to keep code clean
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],

      // Prefer const over let when variable isn't reassigned
      "prefer-const": "error",

      // No console.log in production — use console.warn/error for intentional logs
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Disallow eval (security risk)
      "no-eval": "error",

      // Disallow empty catch blocks without comment
      "no-empty": ["error", { allowEmptyCatch: false }],

      // Enforce === over == to prevent type coercion bugs
      "eqeqeq": ["error", "always", { null: "ignore" }],
    },
  },

  // Server-side Node.js files
  {
    files: ["server.ts", "src/utils/googleSheetsSync.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Allow console in server files
      "no-console": "off",
      // Server files can use 'any' more freely since they deal with raw DB objects
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
