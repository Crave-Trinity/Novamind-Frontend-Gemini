# Tailwind 3.4 + ESM Module System Integration Strategy

## Current Issue Analysis

We are experiencing module system conflicts due to the following:

1. **Package Context**: 
   - Our package.json specifies `"type": "module"` (line 4)
   - We're using Tailwind v3.4.17 which has hybrid module system requirements
   - We're using Vite v6.2.5 which expects ESM modules by default

2. **Key Error Identified**: 
   - `module is not defined` error in browser console
   - This is the signature of a CommonJS file being executed in an ESM context

3. **Problem Sources**:
   - `frontend/src/test/minimal-brain-container.spec.tsx` using direct `require()` calls
   - Script files mixing ESM and CommonJS patterns
   - Multiple conflicting configuration files (both .ts and .cjs for same purpose)

## Module System Requirements

| File Type | Required System | Extension | Notes |
|-----------|----------------|-----------|-------|
| Application Code | ESM | .ts/.tsx | Must use import/export syntax only |
| Test Files | ESM | .ts/.tsx | Must use import/export syntax only |
| Tailwind Config | CommonJS | .cjs | Must use module.exports |
| PostCSS Config | CommonJS | .cjs | Must use module.exports |
| Scripts | ESM | .ts | Must use import syntax, but may use createRequire for specific libraries |
| Vite Config | ESM | .ts | Must use export default syntax |

## Implementation Plan

### 1. Standardize Configuration Files

- Keep exactly ONE configuration file per tool
- Use .cjs extension for tools requiring CommonJS (Tailwind, PostCSS)
- Use .ts extension with ESM syntax for other configs

### 2. Fix Test Files

- Replace all `require()` calls with dynamic `import()`
- Update test file imports to use ESM patterns
- Use `vi.mock()` correctly for module mocking

### 3. Fix Utility Scripts

- Implement consistent ESM patterns in all script files
- Use `createRequire` only when absolutely necessary
- Document any exceptional cases

### 4. Configure Build Tools Properly

- Ensure Vite is properly configured to handle both ESM and CJS dependencies
- Set up proper module resolution in tsconfig.json
- Use correct alias patterns for imports

## Specific Files Requiring Updates

1. **Test Files**:
   - frontend/src/test/minimal-brain-container.spec.tsx (replace require with import)

2. **Script Files**:
   - frontend/scripts/fix-import-syntax.ts (standardize ESM usage)
   - frontend/scripts/fix-theme-imports.ts (standardize ESM usage)
   - frontend/scripts/quantum-micro-fix.ts (standardize ESM usage)
   - frontend/scripts/run-quantum-tests.ts (standardize ESM usage)
   - frontend/scripts/run-tests.ts (standardize ESM usage)
   - frontend/scripts/convert-js-to-ts.ts (standardize ESM usage)
   - frontend/scripts/fix-type-imports.ts (standardize ESM usage)

3. **Configuration Files**:
   - Keep tailwind.config.cjs (remove tailwind.config.ts)
   - Keep postcss.config.cjs (remove postcss.config.mjs)
   - Ensure tsconfig.json has correct module settings

## Module Boundary Rules

1. **Strict Separation**:
   - Configuration files (.cjs) should NEVER import application code
   - Application code should NEVER directly import CommonJS modules

2. **Safe Dynamic Imports**:
   - Use dynamic imports only for lazy loading components 
   - Avoid using dynamic imports to bridge module systems

3. **Testing Strategy**:
   - Use proper ESM mocking patterns in tests
   - Use Vitest's built-in module mocking system

## Mental Model

Think of module systems like separate territories with strict border control:

- **ESM Territory**: All application code, most configuration
- **CommonJS Territory**: Only build tool configs that require it
- **Border Crossing**: Only allowed through clearly defined patterns

By maintaining these strict boundaries, we avoid the dreaded "module is not defined" errors.