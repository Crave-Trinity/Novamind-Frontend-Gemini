import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslint.configs.recommended, // Base ESLint recommended rules
  ...tseslint.configs.recommended, // TypeScript recommended rules
  eslintPluginPrettierRecommended, // Integrates Prettier rules
  {
    // Custom rules and overrides
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Changed to warn initially to avoid breaking changes, can be 'error' later
      '@typescript-eslint/consistent-type-imports': 'error',
      // Add any other project-specific rules here
    },
    // Specify files this configuration applies to
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    // Specify files/directories to ignore
    ignores: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'build-analysis/**',
        'test-reports/**',
        '*.config.js', // Ignore config files themselves
        '*.config.ts',
        '*.cjs',
        'scripts/**',
        'public/**'
        ],
  }
);