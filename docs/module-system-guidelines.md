# Module System & Language Guidelines for Novamind Digital Twin

## Core Principles

The Novamind Digital Twin platform follows strict guidelines for code quality and consistency:

1. **Pure TypeScript**: All code (both application and configuration) must be written in TypeScript
2. **ESM Only**: All code must use ESM (import/export) syntax
3. **No JavaScript**: JavaScript files are not allowed
4. **No CommonJS**: CommonJS syntax (require/module.exports) is not allowed anywhere

## Tailwind CSS v4: Pure ESM Support

With Tailwind CSS v4, we've eliminated the need for CommonJS configuration files. This is a significant advancement that allows us to maintain:

- **Absolute Consistency**: One module system (ESM) across all files
- **Complete TypeScript**: All configuration files in TypeScript
- **No Exceptions**: Zero compromise on our ESM and TypeScript principles

### Why This Was Previously an Issue

In the past, the JavaScript ecosystem had limitations that required using CommonJS for certain build tools:

- PostCSS expected CommonJS configuration
- Tailwind CSS officially recommended CommonJS
- Some build tools only worked with CommonJS configs

Tailwind CSS v4 solves these issues by fully embracing ESM, allowing us to maintain pure TypeScript and ESM across our entire codebase.

## Recommended Configuration Structure

```
├── vite.config.ts             # ESM/TypeScript
├── postcss.config.mjs         # ESM (using .mjs extension)
├── tailwind.config.ts         # ESM/TypeScript
└── tsconfig.json              # TypeScript configuration
```

## Technical Implementation

### Vite Configuration

Vite supports TypeScript configuration files natively with ESM:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    tailwindcss() as any,
    react()
  ],
  // ...other configuration
});
```

### PostCSS Configuration

With Tailwind CSS v4, PostCSS now supports ESM configuration:

```javascript
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
};
```

### Tailwind Configuration

Tailwind CSS v4 fully supports TypeScript ESM configuration:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // ...theme configuration
    },
  },
  darkMode: 'class',
  plugins: [],
};
```

## Import Syntax Best Practices

For cleaner and more consistent code:

- Use named imports where possible: `import { something } from 'somewhere'`
- Avoid default imports except for React components and external libraries
- Use import aliases for cleaner paths (configured in tsconfig.json and vite.config.ts)
- Group imports by type (React, components, hooks, utilities, types, etc.)

## Clean Architecture Imports

Follow these patterns for imports between layers:

- Domain layer may not import from other layers
- Application layer may import from Domain only
- Infrastructure layer may import from Domain and Application
- Presentation layer may import from any layer

## Benefits of Pure ESM

Our pure ESM approach provides several benefits:

1. **Better Tree-Shaking**: ESM enables more effective dead code elimination
2. **Improved Performance**: Modern bundlers optimize ESM imports more efficiently
3. **Type Safety**: TypeScript with ESM provides comprehensive type checking 
4. **Future Compatibility**: ESM is the official standard for JavaScript modules
5. **Consistency**: One module system across all code reduces cognitive load
6. **Simplified Onboarding**: New developers only need to learn one pattern

## Technical Implementation Details

Our implementation leverages:

1. `"type": "module"` in package.json to mark the project as ESM
2. TypeScript ESM interoperability features
3. Vite's native ESM support
4. Tailwind CSS v4's full ESM compatibility