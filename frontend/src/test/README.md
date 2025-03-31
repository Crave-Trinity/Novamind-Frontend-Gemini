# NOVAMIND Neural-Safe Testing Infrastructure

## Overview

This directory contains the unified testing infrastructure for the NOVAMIND Digital Twin frontend, implemented with quantum precision and clinical accuracy.

## Key Components

- `unified-three.mock.ts`: Single source of truth for Three.js mocking with quantum precision
- `neural-setup.ts`: Unified test setup with comprehensive jsdom environment configuration

## Usage Guidelines

1. Always import the unified Three.js mock using the path alias:

   ```typescript
   import "@test/unified-three.mock";
   ```

2. Import the neural setup in your tests:

   ```typescript
   import "@test/neural-setup";
   ```

3. Use the vitest.unified.js configuration for all tests:
   ```bash
   npx vitest run --config vitest.unified.js
   ```

## Module System

All tests use ES Modules for compatibility with the project's module system.

## Path Aliases

All imports should use the standardized path aliases defined in tsconfig.json:

- `@domain/*`: Domain layer components
- `@application/*`: Application layer components
- `@presentation/*`: Presentation layer components
- `@infrastructure/*`: Infrastructure layer components
- `@test/*`: Test utilities and mocks

## Neural-Safe Testing Best Practices

1. Use atomic tests focusing on a single component behavior
2. Mock external dependencies with clinical precision
3. Test visualization components with quantum-level accuracy
4. Implement clean setup and teardown for each test
5. Use type-safe assertions for all validations
