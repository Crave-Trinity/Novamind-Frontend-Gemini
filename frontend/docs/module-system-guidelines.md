# Module System & Language Guidelines for Novamind Digital Twin

## Core Principles

The Novamind Digital Twin platform follows strict guidelines for code quality and consistency:

1. **Pure TypeScript**: All application code must be written in TypeScript
2. **ESM Only**: All application code must use ESM (import/export) syntax
3. **No JavaScript**: JavaScript files are not allowed in application code
4. **No CommonJS**: CommonJS syntax (require/module.exports) is not allowed in application code

## Configuration Files Exception

While we maintain strict TypeScript and ESM requirements for application code, we recognize a practical exception for certain configuration files:

### Why This Exception Exists

The JavaScript ecosystem is in transition, with older build tools still primarily supporting CommonJS. Specifically:

- **PostCSS**: The PostCSS ecosystem (including Tailwind CSS) expects CommonJS configuration
- **Tailwind CSS**: Officially recommends using CommonJS for its configuration
- **Build Tools**: Many build tools still expect CommonJS configuration files

### Acceptable Exception Cases

The following exceptions are permitted **only** for configuration files:

1. **postcss.config.js**: May use CommonJS syntax due to PostCSS ecosystem limitations
2. **tailwind.config.js**: May use CommonJS syntax as officially recommended by Tailwind
3. **Other build tool configs**: Only when the tool explicitly requires CommonJS

### Rules for Exceptions

When using these exceptions:

1. Keep CommonJS files to an absolute minimum
2. Isolate them to configuration files only
3. Never use CommonJS in application code
4. Document why the exception is necessary
5. Use TypeScript and ESM whenever the tool supports it

## Recommended Configuration Structure

```
├── vite.config.ts             # ESM/TypeScript (supported by Vite)
├── postcss.config.cjs         # CommonJS (required by PostCSS ecosystem)
├── tailwind.config.cjs        # CommonJS (recommended by Tailwind)
└── tsconfig.json              # TypeScript configuration
```

Note: We use the `.cjs` extension for CommonJS files to explicitly mark them as CommonJS modules, especially in projects that use `"type": "module"` in package.json.

## Technical Implementation

### Vite Configuration

Vite supports TypeScript configuration files natively and should always use TypeScript and ESM:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ...other configuration
});
```

### PostCSS Configuration

PostCSS typically requires CommonJS configuration:

```javascript
// postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Tailwind Configuration

Tailwind officially recommends CommonJS configuration:

```javascript
// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## Future Direction

As the ecosystem evolves toward full ESM support, we will revisit these exceptions and migrate to pure TypeScript and ESM for all files when possible.