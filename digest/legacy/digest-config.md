This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: config/**, package.json, tsconfig*.json, .eslintrc*, tailwind.config*
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
config/
  eslint/
    .eslintrc.json
  postcss/
    postcss.config.cjs
  scripts/
    deploy-production.sh
    deploy.sh
  tailwind/
    components.json
    tailwind.config.cjs
  typescript/
    paths.json
    README.md
    tsconfig.json
    tsconfig.node.json
    tsconfig.prod.json
    tsconfig.test.json
  .env.example
  README.md
  tinypool-stub.ts
  vite.config.ts
  vitest.config.clean.ts
  vitest.config.ts
  vitest.config.unified.ts
.eslintrc.cjs
.eslintrc.js
package.json
```

# Files

## File: config/scripts/deploy-production.sh
````bash
#!/bin/bash

# NOVAMIND PRODUCTION DEPLOYMENT SCRIPT
# =====================================
# This script handles the complete production build and deployment process
# for the Novamind Digital Twin frontend application.

# Exit on any error
set -e

echo "🧠 NOVAMIND FRONTEND PRODUCTION DEPLOYMENT 🧠"
echo "=============================================="
echo "Starting production deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the frontend directory."
  exit 1
fi

# Enable colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Step 1: Update dependencies and scripts
echo -e "${BLUE}Step 1/7: Updating dependencies and scripts...${NC}"
chmod +x scripts/update-dependencies.js
node scripts/update-dependencies.js

# Step 2: Fix TypeScript errors
echo -e "${BLUE}Step 2/7: Fixing TypeScript errors...${NC}"
chmod +x scripts/fix-theme-context.js
chmod +x scripts/apply-typescript-fixes.js
node scripts/fix-theme-context.js
node scripts/apply-typescript-fixes.js

# Step 3: Run TypeScript type checking
echo -e "${BLUE}Step 3/7: Verifying TypeScript types...${NC}"
npm run type-check || { 
  echo -e "${RED}❌ TypeScript errors found. Please fix them before deployment.${NC}"
  exit 1
}

# Step 4: Run linting
echo -e "${BLUE}Step 4/7: Running ESLint...${NC}"
npm run lint || {
  echo -e "${YELLOW}⚠️ Linting issues found. Consider fixing them for better code quality.${NC}"
  # Don't exit as we want to continue even with linting issues
}

# Step 5: Run tests
echo -e "${BLUE}Step 5/7: Running unit tests...${NC}"
npm test || {
  echo -e "${RED}❌ Unit tests failed. Please fix them before deployment.${NC}"
  exit 1
}

# Step 6: Production build with optimizations
echo -e "${BLUE}Step 6/7: Building for production...${NC}"
# Make sure Node has enough memory for the build
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:prod || {
  echo -e "${RED}❌ Build failed. See above for errors.${NC}"
  exit 1
}

# Step 7: Bundle analysis
echo -e "${BLUE}Step 7/7: Analyzing bundle...${NC}"
npm run analyze:bundle || {
  echo -e "${YELLOW}⚠️ Bundle analysis failed, but continuing deployment.${NC}"
}

# Output success message with metrics
BUNDLE_SIZE=$(du -sh dist | cut -f1)
JS_FILES=$(find dist -name "*.js" | wc -l)
CSS_FILES=$(find dist -name "*.css" | wc -l)

echo -e "${GREEN}✅ PRODUCTION BUILD COMPLETED SUCCESSFULLY${NC}"
echo "=================================================="
echo -e "📊 ${PURPLE}Build Metrics:${NC}"
echo -e "   - Total bundle size: ${PURPLE}${BUNDLE_SIZE}${NC}"
echo -e "   - JavaScript files: ${PURPLE}${JS_FILES}${NC}"
echo -e "   - CSS files: ${PURPLE}${CSS_FILES}${NC}"
echo -e "   - Build location: ${PURPLE}$(pwd)/dist${NC}"
echo ""
echo -e "${GREEN}🚀 Your production build is ready for deployment!${NC}"
echo ""
echo -e "To preview the production build locally:"
echo -e "   ${YELLOW}npm run preview:prod${NC}"
echo ""
echo -e "To deploy to production:"
echo -e "   ${YELLOW}[Deploy commands specific to your environment]${NC}"
echo "=================================================="
````

## File: config/scripts/deploy.sh
````bash
#!/bin/bash
# Novamind Digital Twin Deployment Script
# This script builds and deploys the frontend application using the optimal configurations

# Print commands as they're executed
set -ex

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 Novamind Digital Twin - Deployment Script${NC}"
echo -e "${BLUE}=============================================${NC}"

# Environment selection
ENV=${1:-"mock"}
if [ "$ENV" != "mock" ] && [ "$ENV" != "real" ]; then
  echo -e "${RED}Invalid environment: $ENV. Valid options are 'mock' or 'real'${NC}"
  exit 1
fi

echo -e "${GREEN}▶ Selected environment: ${YELLOW}$ENV${NC}"
echo -e "${GREEN}▶ Starting build process...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "$2" == "--fresh" ]; then
  echo -e "${GREEN}▶ Installing dependencies...${NC}"
  npm ci
fi

# Set environment variables based on selected mode
if [ "$ENV" == "mock" ]; then
  echo -e "${GREEN}▶ Setting up MOCK API mode...${NC}"
  export VITE_API_MODE="mock"
  echo "VITE_API_MODE=mock" > .env.production
  echo "VITE_USE_MOCK_API=true" >> .env.production
else
  echo -e "${GREEN}▶ Setting up REAL API mode...${NC}"
  export VITE_API_MODE="real"
  echo "VITE_API_MODE=real" > .env.production
  echo "VITE_USE_MOCK_API=false" >> .env.production
fi

# Add build timestamp
echo "VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> .env.production

# Clean previous build
echo -e "${GREEN}▶ Cleaning previous build...${NC}"
rm -rf dist

# Run production build
echo -e "${GREEN}▶ Building for production...${NC}"
npm run build -- --config vite.config.prod.ts

# Check build status
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build completed successfully!${NC}"
  
  # Display build details
  FILECOUNT=$(find dist -type f | wc -l)
  TOTALSIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}▶ Build contains ${YELLOW}$FILECOUNT${GREEN} files, total size: ${YELLOW}$TOTALSIZE${NC}"
  
  # Create a version file for tracking
  VERSION=$(node -e "console.log(require('./package.json').version)")
  echo "{\"version\":\"$VERSION\",\"environment\":\"$ENV\",\"buildTime\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > dist/version.json
  
  # Option to preview the built version
  if [ "$3" == "--preview" ]; then
    echo -e "${GREEN}▶ Starting preview server...${NC}"
    echo -e "${BLUE}▶ Access the preview at: ${YELLOW}http://localhost:4173${NC}"
    npm run preview -- --config vite.config.prod.ts
  fi
  
  echo -e "${GREEN}▶ Deploy the contents of the ${YELLOW}dist/${GREEN} directory to your server${NC}"
  echo -e "${GREEN}▶ Done!${NC}"
  exit 0
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
````

## File: config/tailwind/components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.cjs",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
````

## File: config/typescript/paths.json
````json
{
  "compilerOptions": {
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@test/*": ["src/test/*"],
      "@utils/*": ["src/utils/*"],
      "@/*": ["src/*"]
    }
  }
}
````

## File: config/typescript/README.md
````markdown
# TypeScript configuration
````

## File: config/typescript/tsconfig.node.json
````json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": [
    "../../config/**/*.ts",
    "../../config/**/*.tsx",
    "../../vite.config.ts"
  ],
  "paths": {
    "vite.config.ts": ["./vite.config.ts"]
  }
}
````

## File: config/typescript/tsconfig.prod.json
````json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    // Relax some checks for production build
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    // Allow undefined checks to pass
    "strictNullChecks": false,
    // Type compatibility relaxation
    "suppressImplicitAnyIndexErrors": true
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    "**/node_modules/*",
    "dist",
    "public",
    ".github"
  ]
}
````

## File: config/typescript/tsconfig.test.json
````json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "isolatedModules": true,
    "module": "ESNext",
    "verbatimModuleSyntax": false,
    "noEmit": true,
    "composite": false
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
````

## File: config/.env.example
````
# PostgreSQL Configuration
POSTGRES_SERVER=localhost
POSTGRES_USER=novamind
POSTGRES_PASSWORD=secure-password
POSTGRES_DB=novamind

# Security
SECRET_KEY=secure-key-placeholder
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# AWS Cognito (Optional)
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_example
COGNITO_APP_CLIENT_ID=example-client-id

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=
REDIS_SSL=false
REDIS_TIMEOUT=5

# Feature Flags
ENABLE_TASK_QUEUE=false
ENABLE_WEBSOCKETS=false
ENABLE_ANALYTICS=true

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# OpenAPI Documentation
PROJECT_NAME=NOVAMIND
DESCRIPTION=Concierge Psychiatry Platform
VERSION=0.1.0

# SMTP Configuration (for emails)
SMTP_TLS=true
SMTP_PORT=587
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASSWORD=password
EMAILS_FROM_EMAIL=info@novamind.ai
EMAILS_FROM_NAME=NOVAMIND Platform

# CORS
# Comma-separated list of origins to allow CORS for
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8000
````

## File: config/eslint/.eslintrc.json
````json
{
  "root": true,
  "ignorePatterns": ["**/*"],
  "rules": {}
}
````

## File: config/README.md
````markdown
# Configuration Directory

This directory contains configuration files for various tools and environments used in the Novamind Frontend project.

## Structure

- `eslint/` - ESLint supplementary configuration files
- `typescript/` - TypeScript configuration
- `vite.config.ts` - Main Vite configuration
- `vitest.config.ts` - Main Vitest configuration for tests
- `vitest.config.clean.ts` - Clean Vitest configuration
- `vitest.config.unified.ts` - Unified test config with single-threaded execution

## Usage

Most configuration files are referenced from package.json scripts or from the root configuration files.

### Running Tests

Different test configurations can be used based on the test requirements:

```bash
# Run with standard config
npm test

# Run with unified config (single-threaded, no worker issues)
npm run test:unified
```

### Build Configuration

The Vite build configuration is used for development and production builds:

```bash
# Development
npm run dev

# Production
npm run build
```
````

## File: config/tinypool-stub.ts
````typescript
// A thin stub of tinypool that preserves transform and worker functionality,
// but no-ops out shutdown methods to avoid recursive shutdown errors.
⋮----
// Extend the original Tinypool class to override shutdown behavior
export class Tinypool extends original.default
⋮----
// Override destroy to immediately resolve
async destroy(): Promise<void>
// Override destroyAll to immediately resolve
async destroyAll(): Promise<void>
⋮----
// Preserve workerId export for Vitest worker integration
⋮----
// Re-export default
````

## File: config/vitest.config.unified.ts
````typescript
/// <reference types="vitest" />
/*
 * Unified test config with single-threaded execution and tinypool fixes
 * Use this config to run tests without worker thread issues
 */
⋮----
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
⋮----
// Project root definition for consistent path resolution
⋮----
react(), // React plugin for JSX support
tsconfigPaths(), // Use paths from tsconfig.json
⋮----
extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], // Resolve extensions properly
⋮----
// Core path aliases
⋮----
// Component path aliases
⋮----
// Feature path aliases
⋮----
// Other path aliases
⋮----
// Single thread execution
⋮----
// Core settings
globals: true, // Enable global test APIs
environment: 'jsdom', // Use JSDOM for browser environment
⋮----
// Mock behavior configuration
mockReset: true, // Reset mocks between tests
restoreMocks: true, // Restore original implementations after tests
clearMocks: true, // Clear mock call history between tests
⋮----
// Timeout configuration
testTimeout: 20000, // Increase default timeout per test
hookTimeout: 20000, // Increase default timeout for hooks
⋮----
// Single setup file that properly includes all needed functionality
⋮----
'./src/test/setup.ts', // Use the canonical setup file
⋮----
// Coverage configuration
⋮----
all: true, // Report coverage on all files, not just tested ones
⋮----
// File patterns
⋮----
'test-puppeteer/**/*', // Puppeteer tests need separate runner
````

## File: .eslintrc.js
````javascript
/* eslint-env node */
⋮----
node: true, // Include node for config file and scripts
⋮----
project: ['./tsconfig.json', './tsconfig.node.json'], // Point to both tsconfigs
⋮----
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
⋮----
version: 'detect', // Automatically detect React version
⋮----
alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory
⋮----
'.eslintrc.cjs', // Ignore this file itself from linting
⋮----
// === Turn off rules handled by TypeScript ===
⋮----
// === TypeScript Specific ===
⋮----
], // More strict, but allow explicit void
⋮----
'@typescript-eslint/no-unsafe-assignment': 'warn', // Downgrade from error for now
⋮----
'@typescript-eslint/restrict-template-expressions': 'warn', // Often noisy, review later
⋮----
// === React & Hooks ===
'react/jsx-uses-react': 'off', // Covered by jsx-runtime
'react/react-in-jsx-scope': 'off', // Covered by jsx-runtime
⋮----
// === Import Sorting/Ordering ===
⋮----
'import/no-named-as-default-member': 'off', // Can be buggy with some setups
⋮----
// === Accessibility ===
'jsx-a11y/anchor-is-valid': 'warn', // Allow valid Next/Router links
⋮----
// === General Quality/Style ===
⋮----
], // Allow info for now
⋮----
// === Vitest (Covered by 'extends', add specifics if needed) ===
// 'vitest/expect-expect': 'error',
// 'vitest/no-disabled-tests': 'warn',
⋮----
// Override rules for test files
⋮----
'vitest/globals': true, // Ensure Vitest globals are recognized
⋮----
// Allow console logs in setupTests.ts
````

## File: config/typescript/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    /* Linting */
    "types": ["node", "vite/client", "vitest/globals"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@shared/*": ["src/shared/*"],
      "@atoms/*": ["src/presentation/atoms/*"],
      "@molecules/*": ["src/presentation/molecules/*"],
      "@organisms/*": ["src/presentation/organisms/*"],
      "@templates/*": ["src/presentation/templates/*"],
      "@pages/*": ["src/presentation/pages/*"],
      "@hooks/*": ["src/application/hooks/*"],
      "@contexts/*": ["src/application/contexts/*"],
      "@providers/*": ["src/application/providers/*"],
      "@stores/*": ["src/application/stores/*"],
      "@services/*": ["src/application/services/*"],
      "@clients/*": ["src/infrastructure/clients/*"],
      "@api/*": ["src/infrastructure/api/*"],
      "@utils/*": ["src/shared/utils/*"],
      "@types/*": ["src/domain/types/*"],
      "@models/*": ["src/domain/models/*"],
      "@constants/*": ["src/domain/constants/*"],
      "@validation/*": ["src/domain/validation/*"],
      "@assets/*": ["src/presentation/assets/*"],
      "@styles/*": ["src/presentation/styles/*"],
      "@shaders/*": ["src/presentation/shaders/*"],
      "@test/*": ["src/test/*"],
      "@config/*": ["config/*"]
    }
  },
  "include": [
    "src",
    "src/test", // Explicitly include test directory
    "test-puppeteer", // Include Puppeteer tests
    "config",
    "*.ts",
    "*.tsx",
    "*.d.ts",
    // Removed references to deleted root config files
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
    ".vite"
  ]
}
````

## File: config/vite.config.ts
````typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Plugin removed as explicit aliases are used
import path from 'path'; // Import path module
import type { UserConfig } from 'vite';
⋮----
// https://vitejs.dev/config/
⋮----
// Load env file based on `mode` in the current working directory.
loadEnv(mode, process.cwd(), ''); // Load env variables but don't assign if unused
⋮----
// Define the base config
⋮----
// tsconfigPaths(), // Plugin removed
nodePolyfills(), // Add Node polyfills plugin
⋮----
// Add explicit inputs
main: path.resolve(__dirname, '../index.html'), // Default entry point
neuralControlPanelDemo: path.resolve(__dirname, '../neural-control-panel-demo.html'), // New demo page at root
⋮----
// Add proxy configuration
⋮----
target: 'http://localhost:3000', // Corrected: Target backend server (running on the same port as frontend dev server)
⋮----
// secure: false, // Uncomment if backend uses self-signed cert
// rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
⋮----
// Use array format for aliases
⋮----
{ find: '@config', replacement: path.resolve(__dirname) }, // Points to config directory itself
⋮----
// Explicitly define PostCSS config path for Vite
⋮----
// Initialize define object here
⋮----
// Apply conditional modifications
⋮----
// Development specific config
⋮----
// Production specific config
⋮----
// Ensure build object exists before spreading into it
⋮----
// Return the modified baseConfig object
````

## File: config/postcss/postcss.config.cjs
````
/* eslint-disable */
⋮----
/**
 * PostCSS Configuration for Novamind Digital Twin
 *
 * CommonJS configuration for PostCSS with Tailwind CSS v3.4.
 * Uses .cjs extension to explicitly mark as CommonJS module per project guidelines.
 */
⋮----
'postcss-import': {}, // Add postcss-import first
````

## File: config/vitest.config.clean.ts
````typescript
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
⋮----
// Project root definition for consistent path resolution
⋮----
react(), // React plugin for JSX support
tsconfigPaths(), // Use paths from tsconfig.json
⋮----
extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], // Resolve extensions properly
⋮----
// Core path aliases
⋮----
// Component path aliases
⋮----
// Feature path aliases
⋮----
// Other path aliases
⋮----
// Module resolutions that need special handling
⋮----
// Core settings
globals: true, // Enable global test APIs
environment: 'jsdom', // Use JSDOM for browser environment
⋮----
// Mock behavior configuration
mockReset: true, // Reset mocks between tests
restoreMocks: true, // Restore original implementations after tests
clearMocks: true, // Clear mock call history between tests
⋮----
// Timeout configuration
testTimeout: 20000, // Increase default timeout per test
hookTimeout: 20000, // Increase default timeout for hooks
⋮----
// Single setup file that properly includes all needed functionality
⋮----
// Coverage configuration
⋮----
all: true, // Report coverage on all files, not just tested ones
⋮----
// File patterns
⋮----
'test-puppeteer/**/*', // Puppeteer tests need separate runner
````

## File: .eslintrc.cjs
````
/* eslint-disable */
⋮----
// CJS files
⋮----
// Puppeteer tests
⋮----
// Scripts
⋮----
// Test files
````

## File: config/tailwind/tailwind.config.cjs
````
/* eslint-disable */
/**
 * Tailwind CSS Configuration for Novamind Digital Twin
 *
 * CommonJS configuration for Tailwind CSS v3.4.
 * Uses .cjs extension to explicitly mark as CommonJS module per project guidelines.
 */
⋮----
/* eslint-env node */
⋮----
/** @type {import('tailwindcss').Config} */
⋮----
// Add numeric scale for consistency with other color palettes
⋮----
400: '#FF5E5B', // Same as active
````

## File: package.json
````json
{
  "name": "novamind-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "Neural visualization platform for psychiatry and mental health",
  "scripts": {
    "dev": "vite --config config/vite.config.ts",
    "build": "tsc && vite build --config config/vite.config.ts",
    "preview": "vite preview --config config/vite.config.ts",
    "test": "vitest run --config config/vitest.config.ts",
    "test:watch": "vitest --watch --config config/vitest.config.ts",
    "test:ui": "vitest --ui --config config/vitest.config.ts",
    "test:coverage": "vitest run --coverage --config config/vitest.config.ts",
    "test:safe": "npx ts-node --esm scripts/run-with-timeout.ts",
    "test:tailwind": "npx ts-node --esm scripts/run-tailwind-tests.ts",
    "test:unified": "vitest run --config config/vitest.config.unified.ts",
    "test:webgl": "npx ts-node --esm scripts/run-all-tests-with-webgl.ts",
    "test:visualization": "npx ts-node --esm scripts/run-3d-visualization-tests.ts --dir=src/presentation --pattern=\"**/*{Visua,Render,Brain,3D,Three}*.test.tsx\"",
    "lint": "eslint src/**/*.ts src/**/*.tsx",
    "format": "prettier --write 'src/**/*.{ts,tsx}'",
    "typecheck": "tsc --noEmit",
    "lint:fix": "eslint src/**/*.ts src/**/*.tsx --fix",
    "prepare": "husky install",
    "deps:check": "npm outdated",
    "deps:update": "npm update",
    "clean": "rm -rf node_modules/.vite dist coverage",
    "test:puppeteer": "npx ts-node --esm test-puppeteer/r3f-basic.test.ts",
    "test:puppeteer:brain-vis": "npx ts-node --esm test-puppeteer/BrainVisualizationPage.test.ts",
    "test:puppeteer:theme": "npx ts-node --esm test-puppeteer/ThemeProvider.system.test.ts",
    "test:puppeteer:container": "npx ts-node --esm test-puppeteer/BrainModelContainer.test.ts",
    "test:puppeteer:controls": "npx ts-node --esm test-puppeteer/NeuralControlPanel.test.ts",
    "test:puppeteer:all": "npm run test:puppeteer:theme && npm run test:puppeteer:container && npm run test:puppeteer:brain-vis && npm run test:puppeteer:controls && npm run test:puppeteer"
  },
  "dependencies": {
    "@alloc/quick-lru": "^5.2.0",
    "@babel/core": "7.26.10",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@react-spring/three": "^9.7.5",
    "@react-three/a11y": "^2.0.0",
    "@react-three/drei": "^9.109.2",
    "@react-three/fiber": "^8.16.8",
    "@react-three/postprocessing": "^2.16.2",
    "@tanstack/react-query": "^5.71.10",
    "axios": "^1.8.4",
    "caniuse-lite": "^1.0.30001712",
    "class-variance-authority": "^0.7.1",
    "classnames": "^2.5.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.6.3",
    "lucide-react": "^0.487.0",
    "nanoid": "5.1.5",
    "next-themes": "^0.4.6",
    "picocolors": "^1.1.1",
    "postcss-import": "^16.1.0",
    "postcss-nesting": "^13.0.1",
    "react-hook-form": "7.55.0",
    "react-router-dom": "^7.5.0",
    "recharts": "^2.15.2",
    "source-map-js": "1.2.1",
    "tailwind-merge": "^3.1.0",
    "tailwindcss": "^3.4.17",
    "three": "^0.175.0",
    "ts-results": "^3.3.0",
    "tslib": "^2.8.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@babel/plugin-transform-react-jsx": "^7.23.4",
    "@babel/plugin-transform-react-jsx-source": "^7.23.3",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.14.0",
    "@types/react": "^18.3.20",
    "@types/react-dom": "^18.3.6",
    "@types/three": "^0.175.0",
    "@typescript-eslint/eslint-plugin": "^8.29.0",
    "@typescript-eslint/parser": "^8.29.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/coverage-v8": "^3.1.1",
    "@vitest/ui": "^3.1.1",
    "autoprefixer": "^10.4.21",
    "cssnano": "^7.0.6",
    "eslint": "^9.24.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "eslint-plugin-sonarjs": "^3.0.2",
    "eslint-plugin-vitest": "^0.5.4",
    "husky": "^9.0.11",
    "jsdom": "^26.0.0",
    "jsdom-global": "^3.0.2",
    "lint-staged": "^15.2.2",
    "make-error": "^1.3.6",
    "msw": "^2.7.3",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "puppeteer": "^24.6.0",
    "react-refresh": "^0.17.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.29.0",
    "vite": "^6.2.5",
    "vite-plugin-node-polyfills": "^0.23.0",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^3.1.1"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md}": "prettier --write"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "overrides": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
````

## File: config/vitest.config.ts
````typescript
/// <reference types="vitest" />
/*
 * Monkey-patch tinypool at config load time to prevent stack overflow on worker termination.
 */
⋮----
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
⋮----
// Project root definition for consistent path resolution
const projectRoot = path.resolve(__dirname, '..'); // Define project root dynamically
⋮----
// Stub out tinypool at the Vite resolver level to override shutdown before transforms
⋮----
resolveId(source)
⋮----
react(), // React plugin for JSX support
tsconfigPaths(), // Use paths from tsconfig.json
⋮----
extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], // Resolve extensions properly
⋮----
// Core path aliases
⋮----
// Component path aliases
⋮----
// Feature path aliases
⋮----
// Other path aliases
⋮----
// Module resolutions that need special handling
⋮----
// Disable worker threads and parallel file execution to avoid tinypool stack issues
⋮----
// Core settings
globals: true, // Enable global test APIs
environment: 'jsdom', // Use JSDOM for browser environment
⋮----
// Mock behavior configuration
mockReset: true, // Reset mocks between tests
restoreMocks: true, // Restore original implementations after tests
clearMocks: true, // Clear mock call history between tests
⋮----
// Timeout configuration
testTimeout: 20000, // Increase default timeout per test
hookTimeout: 20000, // Increase default timeout for hooks
⋮----
// Single setup file that properly includes all needed functionality
⋮----
'./src/test/setup.ts', // Use the canonical setup file
⋮----
// Coverage configuration
⋮----
all: true, // Report coverage on all files, not just tested ones
⋮----
// File patterns
⋮----
'test-puppeteer/**/*', // Puppeteer tests need separate runner
````
