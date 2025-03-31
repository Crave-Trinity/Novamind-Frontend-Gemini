# NOVAMIND TESTING REQUIREMENTS

## STRICT REQUIREMENTS

### TypeScript-Only Codebase

- **ALL CODE MUST BE TYPESCRIPT** - No JavaScript files (.js, .jsx, .mjs) allowed
- All test files must use `.test.ts` or `.test.tsx` extensions
- All utility files must use `.ts` or `.tsx` extensions
- **DELETE ALL JavaScript files** - Replace with TypeScript equivalents

### Testing Environment

- Use **jsdom environment** for React component tests
- Do NOT switch to Node environment - components need browser-like context
- Maintain proper ESM module system with TypeScript

### TextEncoder Fix for ESM Tests

The TextEncoder issue with esbuild must be fixed using this TypeScript implementation:

```typescript
// src/test/textencoder-fix.ts
import { TextEncoder as NodeTextEncoder } from 'util';

class FixedTextEncoder extends NodeTextEncoder {
  override encode(input?: string): Uint8Array {
    const result = super.encode(input);
    Object.setPrototypeOf(result, Uint8Array.prototype);
    return result;
  }
}

// Apply the fix globally
if (typeof globalThis.TextEncoder === 'undefined' || 
    !(new globalThis.TextEncoder().encode('') instanceof Uint8Array)) {
  globalThis.TextEncoder = FixedTextEncoder as any;
}
```

### Vitest Configuration

The vitest.config.ts must include:

```typescript
export default defineConfig({
  // ...
  test: {
    globals: true,
    environment: 'jsdom',  // MUST BE JSDOM
    setupFiles: [
      './src/test/textencoder-fix.ts',  // MUST BE FIRST
      './src/test/setup.ts'
    ],
    // ...
  }
});
```

### Running Tests

- Use `npm test` to run tests with proper TextEncoder fix
- For minimal tests: `npm run test:minimal`
- **DO NOT** create or use JavaScript scripts to run tests

### Directory Structure

- Test files should be co-located with source files
- Use the pattern: `src/path/to/component/Component.test.tsx`
- Test utilities should be in `src/test/` directory

## CRITICAL ISSUES & SOLUTIONS

### TextEncoder Issue with esbuild

- **Problem**: "Invariant violation: 'new TextEncoder().encode("") instanceof Uint8Array' is incorrectly false"
- **Solution**: Use the TypeScript implementation in `src/test/textencoder-fix.ts`
- This must be loaded BEFORE any other test setup files

### URL Issues in jsdom

- **Problem**: URL handling in ESM modules can cause "The URL must be of scheme file" errors
- **Solution**: Use proper URL handling in test files, avoid direct URL manipulation

### Type Safety

- Maintain proper TypeScript interfaces and types throughout tests
- Use type assertions (`as any`) only when absolutely necessary
- Ensure all mocks have proper TypeScript interfaces

## FORBIDDEN PRACTICES

- ❌ NO JavaScript files (.js, .jsx, .mjs)
- ❌ NO switching to Node environment for tests
- ❌ NO ignoring TypeScript errors with `// @ts-ignore`
- ❌ NO using JavaScript-based test runners
- ❌ NO bypassing the TextEncoder fix
Domains to Address for Type Testing Implementation
Based on your codebase structure, here are all the domains that need proper type testing implementation:

1. Domain Types
These are your core domain type definitions that need proper type tests:

✅ /frontend/src/domain/types/clinical/patient.ts - Current focus
/frontend/src/domain/types/clinical/risk.ts
/frontend/src/domain/types/clinical/treatment.ts
/frontend/src/domain/types/brain/visualization.ts
/frontend/src/domain/types/neural/transforms.ts
2. Domain Models
These implement your core business logic and may have their own type definitions:

/frontend/src/domain/models/BrainModel.ts
/frontend/src/domain/models/PatientModel.ts
/frontend/src/domain/models/brainMapping.ts
3. Application Layer
Types for application services and hooks:

/frontend/src/application/services/ types
/frontend/src/application/hooks/ types
/frontend/src/application/controllers/ types
4. Presentation Layer
Component prop types and UI-related type definitions:

/frontend/src/presentation/atoms/ prop types
/frontend/src/presentation/molecules/ prop types
/frontend/src/presentation/organisms/ prop types
Migration Tracking Checklist
CopyInsert
[_] 1. Install type testing dependencies
[_] 2. Set up type test examples
[_] 3. domain/types/clinical/patient.ts
[_] 4. domain/types/clinical/risk.ts
[_] 5. domain/types/clinical/treatment.ts
[_] 6. domain/types/brain/visualization.ts
[_] 7. domain/types/neural/transforms.ts
[_] 8. domain/models/**/*.ts
[_] 9. application layer types
[_] 10. presentation layer types
[_] 11. Final cleanup - remove old type tests
For each domain, we'll:

Create a .type-test.ts file with proper static type assertions
Create optional .runtime.ts validators if runtime validation is needed
Update any existing tests to use the runtime validators
Delete the old type test assertions that were checking undefined values
The core testing environment is already set up with Vitest, so we just need to add the type testing capabilities and implement the proper type tests in each domain.

Would you like to start with a concrete implementation for the patient types domain?
