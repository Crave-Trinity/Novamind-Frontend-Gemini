import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginImport from "eslint-plugin-import"; // Import the import plugin

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended, // Base TS recommended rules

  // Consolidated TS, Import, React, Hooks, A11y configuration for source files
  { 
    // Apply this config to all relevant source files initially
    files: ["src/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Ensure project path is set for TS files
        ecmaFeatures: { jsx: true }, // Ensure JSX is enabled
      },
      globals: { // Ensure React is available if not using new JSX transform fully
          React: 'readonly' 
      }
    },
    plugins: { 
      import: pluginImport, 
      react: pluginReactConfig.plugins.react, // Explicitly add react plugin if needed
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    settings: { 
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json', 
        },
        node: { 
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      },
      'import/parsers': { 
        '@typescript-eslint/parser': ['.ts', '.tsx']
      },
      react: { version: "detect" } // React version setting
    },
    rules: {
      // Base recommended rules (already included via spreads above, but explicit can help)
      // ...pluginJs.configs.recommended.rules, // Optional: if needed explicitly
      // ...tseslint.configs.recommended.rules, // Optional: if needed explicitly

      // Import rules
      ...pluginImport.configs.recommended.rules, 
      ...pluginImport.configs.typescript.rules, 
      'import/no-unresolved': 'error', 

      // React rules
      ...pluginReactConfig.rules,
      "react/react-in-jsx-scope": "off", // Often not needed with new JSX transform
      "react/prop-types": "off", // Handled by TypeScript

      // React Hooks rules
      ...pluginReactHooks.configs.recommended.rules,

      // JSX A11y rules
      ...pluginJsxA11y.configs.recommended.rules,

      // General project overrides
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn", // Temporarily warn instead of error during refactor
      // Add other project-specific rules here if needed
    }
  },

  // Ignores block (should come after main config, before test override)
  { 
    ignores: [
        "dist/",
        "node_modules/",
        "build/",
        "coverage/",
        "test-reports/",
        "*.config.js",
        "*.config.ts",
        "scripts/",
        ".eslintrc.json", // Keep ignoring legacy file if present
        ".eslintrc.json.bak", // Ignore the backup
        "public/",
        "*.html"
        ]
  },
  
  // Override parserOptions specifically for test files (Place this LAST)
  {
    files: ["src/**/*.{test,spec}.{ts,tsx}"], // Target test files
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json', // Point to the test TSConfig for type-aware linting
      },
      globals: { // Add test-specific globals
        ...globals.jest, 
        ...globals.vitest, // Explicitly add vitest globals
      }
    },
    // Optionally add/override rules specific to tests here
    // rules: {
    //   "@typescript-eslint/no-explicit-any": "off", 
    // }
  }
];
