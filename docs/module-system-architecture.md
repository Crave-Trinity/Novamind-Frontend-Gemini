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
│   ├── domain/           # Business logic, interfaces, entities
│   ├── application/      # Use cases, state management, providers
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── providers/    # Context providers
│   │   └── utils/        # Application-level utilities
│   ├── infrastructure/   # External services, API clients
│   │   ├── api/          # API client implementations
│   │   └── services/     # External service integrations
│   ├── presentation/     # UI components (Atomic Design)
│   │   ├── atoms/        # Basic UI elements
│   │   ├── molecules/    # Combinations of atoms
│   │   ├── organisms/    # Complex UI components
│   │   ├── templates/    # Page layouts
│   │   └── pages/        # Full pages
│   ├── components/       # Legacy components (being migrated)
│   └── App.tsx           # Application entry point
├── public/               # Static assets
└── config/               # Configuration files
```

## Import Patterns

### Path Aliases

The project uses path aliases to maintain clean imports and enforce architectural boundaries:

```typescript
// Clean Architecture layer imports
import { Patient } from "@domain/entities/Patient";
import { usePatientData } from "@application/hooks/usePatientData";
import { apiClient } from "@api/apiClient"; // Use preferred alias
import { PatientCard } from "@presentation/molecules/PatientCard";

// Atomic Design component imports
import { Button } from "@atoms/Button";
import { PatientForm } from "@molecules/PatientForm";
import { PatientDashboard } from "@organisms/PatientDashboard";
import { DashboardLayout } from "@templates/DashboardLayout";
import { PatientPage } from "@pages/PatientPage";

// Legacy imports (for backward compatibility)
import { LegacyComponent } from "@components/LegacyComponent";
```

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
   import { PatientService } from '@infrastructure/services/PatientService';
   ```

## Configuration Files

### ESM Configuration

Most configuration files use TypeScript with ESM syntax:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Configuration
});
```

### CommonJS Exception

Only specific build tools that require CommonJS use `.cjs` extension:

```javascript
// postcss.config.cjs
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ]
};
```

## Dependency Management

### ESM Dependencies

The project uses ESM-compatible dependencies whenever possible. For packages that don't fully support ESM, we use the following strategies:

1. **External Marking**: Mark problematic dependencies as external in the build configuration
2. **ESM/CommonJS Interop**: Configure Vite to handle interoperability between ESM and CommonJS modules
3. **Module Federation**: For larger dependencies, use dynamic imports with React.lazy()

## Migration Strategy

The codebase is transitioning from a legacy structure to the Clean Architecture pattern:

1. **Legacy Components**: Currently in `src/components/` directory
2. **Target Architecture**: Moving to Clean Architecture layers with Atomic Design
3. **Path Aliases**: Support both old and new import patterns during migration
4. **Gradual Migration**: Components are migrated one by one to maintain stability

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