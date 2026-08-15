import js from "@eslint/js";
// Imports the default JavaScript rules.
import globals from "globals";
// Imports lists of predefined global variables.
import react from "eslint-plugin-react";
// Adds React-specific rules.
import reactHooks from "eslint-plugin-react-hooks";
// Adds rules for Hooks.
import reactRefresh from "eslint-plugin-react-refresh";
// Helps React Fast Refresh work correctly.

export default [
  { ignores: ["dist", "node_modules"] },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Load recommended Hook rules.

      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react-refresh/only-export-components": "off",
      // Turn this rule OFF. // Normally it warns if a file exports things besides React components.

      // safer than turning off completely
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];