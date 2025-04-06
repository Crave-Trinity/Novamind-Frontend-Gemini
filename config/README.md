# Configuration Directory Structure

This directory contains all configuration files for the project. The structure is organized as follows:

```
config/
├── vite.config.ts           # Main Vite configuration for both dev and prod
├── vitest.config.ts         # Test configuration for Vitest
├── eslint/                  # ESLint configurations
│   └── .eslintrc.js        # Main ESLint config
├── typescript/              # TypeScript configurations
│   └── tsconfig.json       # Main TypeScript config
├── tailwind/               # Tailwind CSS configurations
│   └── tailwind.config.js  # Main Tailwind config
├── postcss/                # PostCSS configurations
│   └── postcss.config.js   # Main PostCSS config
├── scripts/                # Build and utility scripts
│   └── ...                 # Various build/deployment scripts
└── .env.example           # Example environment variables
```

## Configuration Guidelines

1. **No Nested Config Directories**: All configuration files should be placed directly in their respective directories. Do not create nested subdirectories.

2. **File Naming**:
   - Main config files should be named according to their tool (e.g., `vite.config.ts`)
   - Environment-specific configs should use the pattern: `[tool].[env].config.[ext]`
   - Test configs should use the pattern: `[tool].test.config.[ext]`

3. **Environment Variables**:
   - All `.env` files should be in the root directory
   - Only `.env.example` should be in the config directory as a template

4. **Import Resolution**:
   - Use path aliases defined in `typescript/tsconfig.json`
   - All paths should be relative to the project root

5. **Dependencies**:
   - Configuration files should only import from `devDependencies`
   - Avoid circular dependencies between configs

## Adding New Configurations

1. Create the configuration file in the appropriate directory
2. Update this README.md to document the new configuration
3. Update the root package.json if new scripts are needed
4. Add any new environment variables to .env.example

## Validation

Before adding new configuration files:
1. Check this README to ensure proper placement
2. Verify no duplicate configurations exist
3. Ensure the configuration follows the project's TypeScript and ESLint rules
4. Test the configuration in all relevant environments
