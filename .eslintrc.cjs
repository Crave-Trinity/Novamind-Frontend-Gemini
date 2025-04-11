/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
  },
  env: {
    browser: true,
    es2022: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'sonarjs',
    'import',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:sonarjs/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'prettier/prettier': 'warn',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      files: ['*.cjs'],
      env: {
        node: true,
        browser: false,
        es2022: true,
      },
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2022,
        project: null,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'no-undef': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
    {
      files: ['test-puppeteer/**/*.js'],
      env: {
        node: true,
        browser: true,
        es2022: true,
        jest: true,
      },
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2022,
        project: null,
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.test.{ts,tsx}', 'src/test/setup.ts'],
      env: {
        node: true,
        browser: true,
        es2022: true,
      },
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
        'no-console': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['scripts/**/*.ts'],
      env: {
        node: true,
        browser: false,
        es2022: true,
      },
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
        project: null,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'vite.config.ts.timestamp*',
    '.DS_Store',
    '*.log',
    'test-results/',
    'public/',
    'build/',
    '.husky/',
    '.vscode/',
    '.github/'
  ],
};
