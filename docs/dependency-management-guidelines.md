# Novamind Digital Twin: Dependency Management Guidelines

## Overview

This document outlines the systematic approach to dependency management in the Novamind Digital Twin frontend. It provides guidelines for resolving dependency conflicts, maintaining module system integrity, and ensuring compatibility between critical visualization libraries.

## Module System Architecture

The Novamind Digital Twin strictly adheres to the following module system principles:

- **Pure TypeScript & ESM Only**: All application code must use TypeScript with ESM (import/export) syntax
- **No CommonJS in Application Code**: `require()` and `module.exports` are forbidden in application code
- **Configuration Files Exception**: Only specific build tools (PostCSS, Tailwind) may use CommonJS with `.cjs` extension

## React Three Fiber Ecosystem Management

The 3D visualization stack relies on several interdependent packages that require careful version management:

### Core Dependencies

| Package | Version | Notes |
|---------|---------|-------|
| three.js | 0.158.0 | Core 3D rendering engine |
| @react-three/fiber | 8.15.11 | React reconciler for three.js |
| @react-three/postprocessing | ^3.0.4 | Post-processing effects |
| @react-spring/three | 9.7.3 | Animation system |

### Dependency Conflict Resolution

The React Three Fiber ecosystem presents specific challenges:

1. **Version Incompatibilities**: @react-three/postprocessing v3.0.4 requires @react-three/fiber v9.0.0, but we use v8.15.11
2. **Transitive Dependencies**: Packages like zustand, suspend-react, and its-fine are required by @react-three/fiber
3. **ESM/CommonJS Interoperability**: Some packages use different module systems

### Resolution Strategy

To resolve these conflicts, we've implemented the following strategy in `vite.config.ts`:

```typescript
// Optimizations for dependency resolution
optimizeDeps: {
  include: [
    'three',
    'react',
    'react-dom'
  ],
  exclude: [
    '@react-three/fiber',
    '@react-three/postprocessing',
    'zustand',
    'suspend-react',
    'its-fine',
    'scheduler',
    'react-use-measure'
  ],
  esbuildOptions: {
    define: {
      global: 'globalThis'
    }
  }
}
```

This configuration:

1. **Includes** core dependencies that should be pre-bundled
2. **Excludes** problematic dependencies from pre-bundling to prevent resolution conflicts
3. **Defines** global as globalThis to resolve browser compatibility issues

## Path Alias Configuration

Path aliases are configured in both `tsconfig.json` and `vite.config.ts` to maintain Clean Architecture layers:

```typescript
// Path aliases in vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    
    // Clean Architecture Layers
    '@domain': path.resolve(__dirname, './src/domain'),
    '@application': path.resolve(__dirname, './src/application'),
    '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
    '@presentation': path.resolve(__dirname, './src/presentation'),
    
    // Atomic Design Components
    '@atoms': path.resolve(__dirname, './src/presentation/atoms'),
    '@molecules': path.resolve(__dirname, './src/presentation/molecules'),
    '@organisms': path.resolve(__dirname, './src/presentation/organisms'),
    '@templates': path.resolve(__dirname, './src/presentation/templates'),
    '@pages': path.resolve(__dirname, './src/presentation/pages'),
    
    // Legacy paths for backward compatibility during migration
    '@components': path.resolve(__dirname, './src/components'),
    '@hooks': path.resolve(__dirname, './src/application/hooks'),
    '@contexts': path.resolve(__dirname, './src/application/contexts'),
    '@services': path.resolve(__dirname, './src/infrastructure/services'),
    '@utils': path.resolve(__dirname, './src/application/utils'),
    '@types': path.resolve(__dirname, './src/domain/types'),
    '@test': path.resolve(__dirname, './src/test')
  }
}
```

## Dependency Analysis Tools

For ongoing dependency management, use these tools:

```bash
# Analyze dependencies
npx npm-check

# Find unused dependencies
npx depcheck

# Check why a package is installed
npx npm-why @react-three/fiber

# Visualize dependency graph
npx dependency-cruiser --validate .
```

## Troubleshooting Common Issues

### ESM/CommonJS Interoperability

If you encounter errors like:

```
Cannot find module '@babel/runtime/helpers/esm/extends'
```

Add the problematic module to the `external` array in the build configuration:

```typescript
build: {
  rollupOptions: {
    external: [
      '@babel/runtime/helpers/esm/extends'
    ]
  }
}
```

### Peer Dependency Conflicts

When adding new packages, check peer dependencies:

```bash
npm info @react-three/postprocessing peerDependencies
```

If conflicts exist, consider:

1. Downgrading the package to a compatible version
2. Using npm overrides (npm 8+) to force specific versions:

```json
"overrides": {
  "@react-three/fiber": "^8.15.11"
}
```

## Migration Strategy

When migrating components to the Clean Architecture structure:

1. Use the legacy path aliases during transition
2. Update imports to use the new path aliases when ready
3. Maintain backward compatibility until all components are migrated

## Best Practices

1. **Pin Exact Versions**: Use exact versions for critical dependencies
2. **Document Dependency Decisions**: Add comments explaining version choices
3. **Test After Updates**: Always test visualization components after dependency changes
4. **Batch Updates**: Update related packages together to maintain compatibility
5. **Use Resolution Fields**: For complex dependency trees, use resolution fields in package.json

## Conclusion

By following these guidelines, we maintain a stable dependency graph while allowing for the advanced visualization capabilities required by the Novamind Digital Twin platform. This systematic approach prevents the trial-and-error cycle of dependency management and ensures consistent builds across development environments.