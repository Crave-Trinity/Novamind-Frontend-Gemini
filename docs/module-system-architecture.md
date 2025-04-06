# Novamind Digital Twin: Module System Architecture

## Overview

This document outlines the module system architecture for the Novamind Digital Twin frontend, providing a comprehensive guide to the ESM-based TypeScript architecture, file organization, and import patterns.

## Core Principles

The Novamind Digital Twin frontend adheres to these core module system principles:

1. **Pure TypeScript & ESM Only**: All application code must be written in TypeScript using ESM syntax
2. **No JavaScript Files**: All code must be TypeScript (.ts/.tsx)
3. **No CommonJS in Application Code**: `require()` and `module.exports` are forbidden
4. **Configuration Exception**: Only specific build tools may use CommonJS with `.cjs` extension

## Directory Structure

The frontend follows Clean Architecture principles with a clear separation of concerns:

```
frontend/
├── src/
│   ├── domain/           # Core business logic, models, types, interfaces
│   ├── application/      # Use cases, application logic, state
│   ├── infrastructure/   # External concerns: frameworks, drivers, tools
│   ├── presentation/     # UI components, styles, assets (Atomic Design)
│   ├── shared/           # Utilities/types shared across multiple layers
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── config/               # Build/Tool configurations (Vite, Vitest, PostCSS, etc.)
```
*Note: See `CLEAN_ARCHITECTURE_PLAN.md` for a more detailed breakdown of subdirectories.*

## Import Patterns

### Path Aliases

The project uses path aliases to maintain clean imports and enforce architectural boundaries:

```typescript
// Clean Architecture layer imports
import { Patient } from "@domain/models/Patient"; // Example model
import { usePatientData } from "@hooks/usePatientData"; // Correct alias
import { apiClient } from "@api/ApiClient"; // Example API client import
import { PatientCard } from "@molecules/PatientCard"; // Example molecule

// Atomic Design component imports
import { Button } from "@atoms/Button";
import { PatientForm } from "@molecules/PatientForm";
import { PatientDashboard } from "@organisms/PatientDashboard";
import { DashboardLayout } from "@templates/DashboardLayout";
import { PatientPage } from "@pages/PatientPage";

// Shared utility import
import { cn } from "@utils/cn"; // Correct alias for shared utils
```
*Note: Refer to `tsconfig.json` for the complete list of current path aliases.*

### Import Best Practices

1. **Always use named imports** for better tree-shaking:
   ```typescript
   // Good
   import { useState, useEffect } from 'react';
   
   // Avoid
   import React from 'react';
   ```

2. **Use type imports** for types to avoid runtime overhead:
   ```typescript
   import type { PatientProps } from '@domain/types';
   ```

3. **Avoid relative imports** across architectural boundaries:
   ```typescript
   // Avoid
   import { PatientService } from '../../infrastructure/services/PatientService';
   
   // Prefer
   import { SomeInfrastructureService } from '@infrastructure/services/SomeService'; // Example
   ```

## Configuration Files

### ESM Configuration

Most configuration files use TypeScript with ESM syntax:

```typescript
// config/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // ... other config
});
```

### CommonJS Exception

Only specific build tools that require CommonJS use `.cjs` extension:

```javascript
// config/postcss/postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
};
```

## Dependency Management

### ESM Dependencies

The project uses ESM-compatible dependencies whenever possible. For packages that don't fully support ESM, we use the following strategies:

1. **External Marking**: Mark problematic dependencies as external in the build configuration
2. **ESM/CommonJS Interop**: Configure Vite to handle interoperability between ESM and CommonJS modules
3. **Module Federation**: For larger dependencies, use dynamic imports with React.lazy()

## Visualization Stack

The 3D visualization stack uses a specialized module configuration:

1. **Three.js Core**: Base 3D rendering engine
2. **React Three Fiber**: React reconciler for Three.js
3. **React Three Drei**: Useful helpers for React Three Fiber
4. **React Three Postprocessing**: Post-processing effects

These packages require special handling in the build configuration due to their complex dependency relationships.

## Testing Module System

Tests follow the same module system principles:

```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { Button } from '@atoms/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Build System Integration

The module system integrates with the build pipeline:

1. **TypeScript Compilation**: Transpiles TypeScript to JavaScript while preserving ESM
2. **Vite Bundling**: Bundles ESM modules with proper tree-shaking
3. **Path Resolution**: Resolves path aliases to actual file paths
4. **Code Splitting**: Automatically splits code based on dynamic imports

## Conclusion

The Novamind Digital Twin frontend module system provides a robust foundation for building a complex, high-performance application. By strictly adhering to ESM and TypeScript, we ensure type safety, better tree-shaking, and a cleaner development experience. The Clean Architecture approach with Atomic Design patterns creates a scalable and maintainable codebase that can evolve with the project's needs.