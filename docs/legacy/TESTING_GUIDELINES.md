# Novamind Frontend: Canonical Testing Environment Setup

## 1. Overview

This document serves as the **source of truth** for configuring the Vitest testing environment for the Novamind frontend application. Its purpose is to ensure consistency, stability, and maintainability of our tests, particularly given the complexities of testing React components, React Query, React Three Fiber (R3F), and Tailwind CSS within a JSDOM environment.

**Core Principles:**

*   **ESM First:** Align with the project's `"type": "module"` setting.
*   **TypeScript:** Leverage static typing in tests and configurations.
*   **Isolation:** Minimize global state and side effects between tests using `vi.mock`, `vi.clearAllMocks()`, etc.
*   **Clarity:** Make mocking strategies explicit and easy to understand.
*   **JSDOM Limitations:** Acknowledge JSDOM cannot fully replicate a browser, especially for WebGL/layout, and mock accordingly. Mock essential browser APIs not present in JSDOM or needing specific behavior for tests.

## 2. Configuration File Strategy

Configuration files are primarily located in the `/config` directory for better organization. However, some tools expect configuration files in the root directory by convention:

*   **`/config/` Directory:** Contains configurations for Vite (`vite.config.ts`), Vitest (`vitest.config.ts`), PostCSS (`postcss.config.cjs`), Tailwind (`tailwind.config.cjs`), and TypeScript variants (`tsconfig.*.json`). Scripts in `package.json` explicitly point to these files (e.g., `vite --config config/vite.config.ts`).
*   **Root Directory:** Contains configurations automatically detected by tools: ESLint (`eslint.config.js`), Prettier (`.prettierrc`), and the base TypeScript config (`tsconfig.json`).

This separation keeps the root cleaner while leveraging the standard locations for auto-detected configs and centralizing explicit configs in `/config`.

## 3. Vitest Configuration (`config/vitest.config.ts`)

The primary Vitest configuration resides at `config/vitest.config.ts`. Other specific configurations (e.g., `vitest.webgl.config.ts`) may extend or override this base configuration if needed for specialized test runs.

**Canonical `config/vitest.config.ts` Structure:**
*(Note: This is illustrative; refer to the actual file for the most up-to-date settings)*
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths'; // Used for alias resolution

export default defineConfig({
  plugins: [
    react(), // Standard React plugin
    tsconfigPaths(), // Automatically use paths from tsconfig.json
  ],
  // No manual 'resolve.alias' needed when using vite-tsconfig-paths
  test: {
    // --- Core Settings ---
    globals: true, // Enable global APIs (describe, it, expect, vi)
    environment: 'jsdom', // Simulate browser environment
    mockReset: true, // Reset mocks between tests
    restoreMocks: true, // Restore original implementations after mocks
    clearMocks: true, // Clear mock call history between tests
    testTimeout: 15000, // Default timeout per test (adjust as needed)
    hookTimeout: 15000, // Default timeout for hooks (beforeEach, etc.)

    // --- Setup ---
    setupFiles: [
      './src/test/setup.ts', // Global setup file (polyfills, essential mocks)
      // Add other necessary setup files here
    ],

    // --- Environment Configuration ---
    // Note: JSDOM options like windowOptions are less common now; prefer setupFiles.
    // If specific JSDOM features are needed, configure here carefully.
    // environmentOptions: {
    //   jsdom: {
    //     // Example: pretendToBeVisual: true, resources: 'usable'
    //   }
    // },

    // --- Test Execution ---
    // Consider setting threads: false if hangs persist after other fixes
    // threads: false, 
    isolate: true, // Run tests in isolation (default: true)

    // --- Coverage ---
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [ // Exclude non-source files
        'node_modules/',
        'dist/',
        'build/',
        '.*cache.*',
        '**/.*', // Dotfiles/folders
        '*.config.{js,ts,cjs,mjs}',
        'src/test/',
        'src/**/*.d.ts',
        'src/**/*.types.ts', // Exclude pure type files if desired
        'src/vite-env.d.ts',
        // Add other patterns to exclude
      ],
      // Thresholds can be added later once tests are stable
    },

    // --- Include/Exclude Patterns ---
    include: ['src/**/*.{test,spec}.{ts,tsx}'], // Standard pattern
    exclude: [ // Standard excludes + project-specific skips
      'node_modules', 
      'dist', 
      '.idea', 
      '.git', 
      '.cache',
      // Temporarily skip known problematic R3F tests identified in docs/test-hang-investigation.md
      // These should be revisited after the core environment is stable.
      'src/presentation/molecules/NeuralActivityVisualizer.test.tsx',
      'src/presentation/molecules/VisualizationControls.test.tsx',
      'src/presentation/molecules/BrainVisualizationControls.test.tsx',
      'src/presentation/molecules/BiometricAlertVisualizer.test.tsx',
      'src/presentation/molecules/SymptomRegionMappingVisualizer.test.tsx',
      'src/presentation/molecules/TemporalDynamicsVisualizer.test.tsx',
      'src/presentation/molecules/PatientHeader.test.tsx',
      'src/presentation/molecules/TimelineEvent.test.tsx',
      'src/presentation/molecules/TreatmentResponseVisualizer.test.tsx',
    ],
  },
});
```

## 4. Global Test Setup (`src/test/setup.ts`)

This file runs once before the test suite. It should contain only essential global mocks and polyfills required by the JSDOM environment. Avoid complex logic or mocks specific to certain test types here.

**Canonical `src/test/setup.ts` Contents:**

```typescript
// src/test/setup.ts (Illustrative - Refer to actual file)
import React from 'react';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type * as FramerMotion from 'framer-motion'; // Type import for mocking

// --- Vitest Augmentation ---
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface Mock {
    mockReturnValue<T>(val: T): Mock;
    mockImplementation<T, Y extends unknown[]>(fn: (...args: Y) => T): Mock;
  }
}

// --- Essential Global Mocks ---
// (Includes mocks for IntersectionObserver, ResizeObserver, matchMedia, localStorage, sessionStorage, getContext, requestAnimationFrame, etc.)
// ... See actual src/test/setup.ts for complete implementation ...

// --- Library Mocks (Example) ---
vi.mock('framer-motion', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof FramerMotion;
  const motionProxy = new Proxy({}, { /* ... proxy handler ... */ });
  return {
    __esModule: true,
    ...actual,
    motion: motionProxy,
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => React.createElement(React.Fragment, null, children),
    // ... other framer-motion mocks ...
  };
});

// --- Global Hooks ---
afterEach(() => {
  cleanup(); // Cleans up DOM rendered by testing-library
  vi.clearAllMocks(); // Clears mock call history
  localStorage.clear(); // Clear mocked localStorage
  sessionStorage.clear(); // Clear mocked sessionStorage
});

// --- Global Error Handling ---
beforeAll(() => {
  // Optional: Override console.error/warn to catch specific errors/warnings
});

console.log('[TEST SETUP] Global setup complete.');
```

## 5. Mocking Strategy

*   **Library Mocks:** For heavy libraries incompatible with JSDOM (Three.js, R3F, Drei), use `vi.mock` within the global `src/test/setup.ts` or within specific test files. The previous `resolve.alias` strategy in `vitest.config.ts` has been removed in favor of explicit mocking.
*   **Mock File Structure:** Mock files MUST use **named exports** mirroring the actual library structure. Avoid default exports for library mocks. Ensure mocked classes/functions have the correct basic signatures (accept expected arguments, even if unused) and properties expected by the code under test.
*   **`vi.mock`:** For mocking application modules (services, components), use `vi.mock('module/path', factory)` at the **top level** of the test file *before* any imports from that module. Avoid dynamic `vi.mock` calls inside functions or loops.
*   **Spying:** Use `vi.spyOn` for observing method calls on actual or partially mocked objects. Remember to restore spies using `vi.restoreAllMocks()` or ensure `restoreMocks: true` is set in the config.

## 6. Test Utilities (`src/test/test-utils.unified.tsx`)

This file provides a custom `render` function that wraps components with necessary providers.

**Canonical `src/test/test-utils.unified.tsx` Structure:**

```typescript
// src/test/test-utils.unified.tsx (Illustrative - Refer to actual file)
import type { ReactElement } from 'react';
import React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@application/providers/ThemeProvider';
import type { ThemeMode } from '@application/contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { tailwindHelper } from './setup.unified'; // Assuming this helper exists
import { vi } from 'vitest';

// Mock matchMedia if not already done globally
// ... matchMedia mock ...

// Create a query client instance for tests
const testQueryClient = new QueryClient({ /* ... options ... */ });

interface TestProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

// All-in-one providers wrapper
export const AllProviders: React.FC<TestProviderProps> = ({ children, defaultTheme = 'clinical' }) => {
  // ... theme setup logic ...
  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  defaultTheme?: ThemeMode;
  darkMode?: boolean;
}

// Custom render function with providers and helpers
export function renderWithProviders(
  ui: ReactElement,
  { defaultTheme = 'clinical', darkMode = false, ...options }: ExtendedRenderOptions = {}
) {
  // ... dark mode setup ...
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders defaultTheme={defaultTheme}>{children}</AllProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    // Return additional utilities if needed
    // isDarkMode: tailwindHelper.isDarkMode,
    // enableDarkMode: tailwindHelper.enableDarkMode,
    // disableDarkMode: tailwindHelper.disableDarkMode,
  };
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

## 7. Path Alias Configuration (`tsconfig.json`)

Ensure `paths` in `tsconfig.json` are correctly defined. Vite uses `vite-tsconfig-paths` to read these automatically.

```json
```json
// tsconfig.json (paths section - illustrative)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@shared/*": ["src/shared/*"],
      "@atoms/*": ["src/presentation/atoms/*"],
      // ... other presentation aliases ...
      "@hooks/*": ["src/application/hooks/*"],
      "@contexts/*": ["src/application/contexts/*"],
      "@providers/*": ["src/application/providers/*"],
      "@services/*": ["src/application/services/*"],
      "@api/*": ["src/infrastructure/api/*"],
      "@utils/*": ["src/shared/utils/*"], // Points to shared
      "@types/*": ["src/domain/types/*"],
      "@models/*": ["src/domain/models/*"],
      "@test/*": ["src/test/*"],
      "@config/*": ["config/*"] // Points to top-level config
    }
    // ... other options
  },
  "include": ["src", "config", "*.ts", "*.tsx", "*.d.ts"], // Updated include
  // ... exclude ...
}
```

## 8. Dependency Management & Build Configuration Notes

While this document focuses on the *testing* environment, understanding the build/dev dependency strategy is crucial context.

### React Three Fiber (R3F) Ecosystem

The 3D visualization stack requires careful version management:

| Package                     | Version Pinned | Notes                                      |
| --------------------------- | -------------- | ------------------------------------------ |
| `three`                     | `^0.175.0`     | Core 3D engine                             |
| `@react-three/fiber`        | `^9.1.1`       | React reconciler (See overrides)           |
| `@react-three/drei`         | `^10.0.5`      | Helpers (See overrides)                    |
| `@react-three/postprocessing` | `^2.7.1`       | Post-processing (Version constrained by R3F) |
| `@react-spring/three`       | `9.7.3`        | Animation system                           |

**Note:** Specific versions are pinned in `package.json` using `overrides` to manage compatibility issues between `@react-three/fiber` v8 and other libraries expecting v9+. These overrides should be respected during dependency updates unless a coordinated upgrade of the entire R3F ecosystem is planned.

### Vite `optimizeDeps` Strategy (`config/vite.config.ts`)

The `optimizeDeps` configuration in `config/vite.config.ts` helps manage dependencies during development:

```typescript
// From config/vite.config.ts
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'three',
    '@react-three/fiber',
    '@react-three/drei'
  ],
  exclude: ['@react-three/postprocessing'] // Exclude specific packages if needed
}
```
*Note: The exact `include` and `exclude` lists might need adjustment based on dependency changes.*

### Useful Dependency Analysis Tools

```bash
# Check for outdated packages (respecting ranges)
npm outdated

# Interactively update packages
npx npm-check-updates -u 
# or just check: npx npm-check-updates

# Find unused dependencies (run from project root)
npx depcheck

# Check why a package is installed
npm ls <package-name> 
# e.g., npm ls @react-three/fiber
```

### General Best Practices

1.  **Pin Exact Versions:** Use exact versions (`"package": "1.2.3"`) in `package.json` for critical dependencies (React, Vite, TS, R3F ecosystem) once stable.
2.  **Document Decisions:** Use comments in `package.json` or docs to explain specific version choices or overrides.
3.  **Test After Updates:** Always run relevant test suites (`npm test`, `npm run test:webgl`) after dependency updates.
4.  **Batch Updates:** Update related packages (e.g., `@testing-library/*`) together.
5.  **Use `overrides`:** Leverage npm overrides (as currently done for R3F) to resolve complex peer dependency conflicts.


*Note: The R3F version table and dependency analysis tools sections remain relevant.*