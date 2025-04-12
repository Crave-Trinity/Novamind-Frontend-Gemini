/* eslint-disable */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'sonarjs',
    'import',
    'prettier'
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
    'plugin:prettier/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: true,
      node: true
    }
  },
  rules: {
    'prettier/prettier': 'warn',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'no-undef': 'off',
    'no-console': 'off',
    'no-unsafe-finally': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/no-identical-functions': 'off'
  },
  overrides: [
    // CJS files
    {
      files: ['*.cjs', 'config/**/*.cjs'],
      env: {
        node: true,
        commonjs: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      },
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        console: 'readonly'
      }
    },
    // Puppeteer tests
    {
      files: ['test-puppeteer/**/*.js'],
      env: {
        node: true,
        browser: true,
        jest: true
      },
      rules: {
        'no-undef': 'off'
      },
      globals: {
        page: 'readonly',
        browser: 'readonly',
        document: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    // Scripts
    {
      files: ['scripts/**/*.js', 'scripts/**/*.cjs'],
      env: {
        node: true,
        commonjs: true
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      },
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        console: 'readonly'
      }
    },
    // Test files
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
      env: {
        jest: true,
        node: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'sonarjs/no-duplicate-string': 'off'
      }
    }
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
  ]
};