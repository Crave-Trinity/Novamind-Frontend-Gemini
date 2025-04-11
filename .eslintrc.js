/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true, // Include node for config file and scripts
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json', './tsconfig.node.json'], // Point to both tsconfigs
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import', 'vitest'],
  extends: [
    'eslint:recommended', // Base ESLint rules
    'plugin:@typescript-eslint/recommended', // Base TS rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Rules requiring type info
    'plugin:react/recommended', // Base React rules
    'plugin:react/jsx-runtime', // For new JSX transform (React 17+)
    'plugin:react-hooks/recommended', // React Hooks rules
    'plugin:jsx-a11y/recommended', // Accessibility rules
    'plugin:import/recommended', // Import plugin rules
    'plugin:import/typescript', // Import plugin TS integration
    'plugin:vitest/recommended', // Vitest plugin recommended rules
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory
        project: ['./tsconfig.json', './tsconfig.node.json'],
      },
      node: true,
    },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
    '*.config.cjs',
    'public/',
    '*.html',
    '*.d.ts',
    'scripts/',
    'test-puppeteer/',
    'src/vite-env.d.ts',
    'src/generated/**/*',
    '.eslintrc.cjs', // Ignore this file itself from linting
  ],
  rules: {
    // === Turn off rules handled by TypeScript ===
    'react/prop-types': 'off',

    // === TypeScript Specific ===
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        ignoreVoid: true,
      },
    ], // More strict, but allow explicit void
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn', // Downgrade from error for now
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn', // Often noisy, review later

    // === React & Hooks ===
    'react/jsx-uses-react': 'off', // Covered by jsx-runtime
    'react/react-in-jsx-scope': 'off', // Covered by jsx-runtime
    'react-hooks/exhaustive-deps': 'warn',

    // === Import Sorting/Ordering ===
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'type',
          'object',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-named-as-default-member': 'off', // Can be buggy with some setups

    // === Accessibility ===
    'jsx-a11y/anchor-is-valid': 'warn', // Allow valid Next/Router links

    // === General Quality/Style ===
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error', 'info'],
      },
    ], // Allow info for now
    eqeqeq: ['error', 'always'],
    'no-implicit-coercion': 'warn',

    // === Vitest (Covered by 'extends', add specifics if needed) ===
    // 'vitest/expect-expect': 'error',
    // 'vitest/no-disabled-tests': 'warn',
  },
  overrides: [
    {
      // Override rules for test files
      files: ['src/**/*.{test,spec}.{ts,tsx}'],
      env: {
        'vitest/globals': true, // Ensure Vitest globals are recognized
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'vitest/valid-expect': 'error',
      },
    },
    {
      // Allow console logs in setupTests.ts
      files: ['src/setupTests.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};