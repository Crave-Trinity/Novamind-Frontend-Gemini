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
