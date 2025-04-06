# Novamind Frontend: Canonical Testing Environment Setup

## 1. Overview

This document serves as the **source of truth** for configuring the Vitest testing environment for the Novamind frontend application. Its purpose is to ensure consistency, stability, and maintainability of our tests, particularly given the complexities of testing React components, React Query, React Three Fiber (R3F), and Tailwind CSS within a JSDOM environment.

**Core Principles:**

*   **ESM First:** Align with the project's `"type": "module"` setting.
*   **TypeScript:** Leverage static typing in tests and configurations.
*   **Isolation:** Minimize global state and side effects between tests using `vi.mock`, `vi.clearAllMocks()`, etc.
*   **Clarity:** Make mocking strategies explicit and easy to understand.
*   **JSDOM Limitations:** Acknowledge JSDOM cannot fully replicate a browser, especially for WebGL/layout, and mock accordingly. Mock essential browser APIs not present in JSDOM or needing specific behavior for tests.

## 2. Vitest Configuration (`vitest.config.ts`)

The primary `vitest.config.ts` defines the core testing setup. Other specific configurations (e.g., `vitest.webgl.config.ts`) may extend or override this base configuration if needed for specialized test runs.

**Canonical `vitest.config.ts` Structure:**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
// Note: vite-tsconfig-paths plugin is often unnecessary if aliases are defined directly.

export default defineConfig({
  plugins: [
    react(), // Standard React plugin
  ],
  resolve: {
    // Aliases MUST mirror tsconfig.json paths for consistency
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@atoms': path.resolve(__dirname, './src/presentation/atoms'),
      '@molecules': path.resolve(__dirname, './src/presentation/molecules'),
      '@organisms': path.resolve(__dirname, './src/presentation/organisms'),
      '@templates': path.resolve(__dirname, './src/presentation/templates'),
      '@pages': path.resolve(__dirname, './src/presentation/pages'),
      '@services': path.resolve(__dirname, './src/infrastructure/services'),
      '@hooks': path.resolve(__dirname, './src/application/hooks'),
      '@utils': path.resolve(__dirname, './src/application/utils'),
      '@contexts': path.resolve(__dirname, './src/application/contexts'),
      '@types': path.resolve(__dirname, './src/domain/types'),
      '@models': path.resolve(__dirname, './src/domain/models'),
      '@assets': path.resolve(__dirname, './src/presentation/assets'),
      '@shaders': path.resolve(__dirname, './src/presentation/shaders'),
      '@store': path.resolve(__dirname, './src/application/store'),
      '@styles': path.resolve(__dirname, './src/presentation/styles'),
      '@api': path.resolve(__dirname, './src/infrastructure/api'),
      '@config': path.resolve(__dirname, './src/infrastructure/config'),
      '@constants': path.resolve(__dirname, './src/domain/constants'),
      '@validation': path.resolve(__dirname, './src/domain/validation'),
      '@visualizations': path.resolve(__dirname, './src/presentation/visualizations'),
      '@test': path.resolve(__dirname, './src/test'),

      // --- Library Mocks ---
      // Redirect imports of heavy/incompatible libraries to mocks
      // Use named exports in mock files. This strategy is currently used but may be insufficient
      // for R3F components, leading to test failures (see known issues).
      'three': path.resolve(__dirname, './src/test/mocks/three.ts'),
      '@react-three/fiber': path.resolve(__dirname, './src/test/mocks/react-three-fiber.ts'),
      '@react-three/drei': path.resolve(__dirname, './src/test/mocks/react-three-drei.ts'),
      // Add other necessary library mocks here (e.g., 'next-themes')
    },
  },
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

## 3. Global Test Setup (`src/test/setup.ts`)

This file runs once before the test suite. It should contain only essential global mocks and polyfills required by the JSDOM environment. Avoid complex logic or mocks specific to certain test types here.

**Canonical `src/test/setup.ts` Contents:**

```typescript
/**
 * Global test setup for Vitest/JSDOM environment.
 * Runs once before all tests.
 */
import '@testing-library/jest-dom'; // Extends Vitest's expect with DOM matchers
import { vi, afterEach } from 'vitest'; // Import afterEach for cleanup

// --- Polyfills ---
// Add polyfills for browser APIs missing in JSDOM if needed
// Example: TextEncoder/TextDecoder (if using Node < 16 or specific features)
// import { TextEncoder, TextDecoder } from 'util';
// global.TextEncoder = TextEncoder;
// global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// --- Essential Global Mocks ---

// Mock window.matchMedia (Needed by ThemeProvider and potentially others)
// Ensure this mock is robust and returns a complete MediaQueryList object.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark'), // Default mock behavior (false for non-dark queries)
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but mock for compatibility
    removeListener: vi.fn(), // Deprecated but mock for compatibility
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage (Commonly used for storing preferences like theme)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true, configurable: true });

// Mock IntersectionObserver (Often used for lazy loading or animations)
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  })),
});

// Mock ResizeObserver (Used for responsive layouts)
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock requestAnimationFrame (Crucial for preventing hangs with animations/R3F)
// Use simple setTimeout to avoid infinite loops in tests.
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: vi.fn((callback) => setTimeout(callback, 0)),
});
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  configurable: true,
  value: vi.fn((id) => clearTimeout(id)),
});


// --- Global Hooks ---
// Use afterEach for consistent cleanup
afterEach(() => {
  vi.clearAllMocks(); // Clear mock history
  // Note: vi.restoreAllMocks() is often handled by restoreMocks: true in config
  localStorageMock.clear(); // Clear localStorage mock state
  // Add any other necessary global cleanup
});

// --- Static Mocks Import ---
// Import files containing top-level vi.mock calls to ensure they are hoisted.
// Ensure these mock files themselves don't have side effects beyond vi.mock.
import './webgl/examples/neural-controllers-mock'; // Example if needed globally

console.log('[TEST SETUP] Global setup complete.');

```

## 4. Mocking Strategy

*   **Library Mocks:** For heavy libraries incompatible with JSDOM (Three.js, R3F, Drei), use the `resolve.alias` in `vitest.config.ts` to point to dedicated mock files in `src/test/mocks/`.
*   **Mock File Structure:** Mock files MUST use **named exports** mirroring the actual library structure. Avoid default exports for library mocks. Ensure mocked classes/functions have the correct basic signatures (accept expected arguments, even if unused) and properties expected by the code under test.
*   **`vi.mock`:** For mocking application modules (services, components), use `vi.mock('module/path', factory)` at the **top level** of the test file *before* any imports from that module. Avoid dynamic `vi.mock` calls inside functions or loops.
*   **Spying:** Use `vi.spyOn` for observing method calls on actual or partially mocked objects. Remember to restore spies using `vi.restoreAllMocks()` or ensure `restoreMocks: true` is set in the config.

## 5. Test Utilities (`src/test/test-utils.unified.tsx`)

This file provides a custom `render` function that wraps components with necessary providers.

**Canonical `src/test/test-utils.unified.tsx` Structure:**

```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@application/providers/ThemeProvider'; // Use named import
import { ThemeMode } from '@application/contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom'; // Add Router for hooks like useNavigate

// Create a stable query client instance for tests
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity, // Keep data indefinitely for tests unless invalidated
      staleTime: Infinity, // Data never becomes stale automatically in tests
    },
  },
});

interface TestProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

// Wrapper component including all necessary providers
export const AllProviders: React.FC<TestProviderProps> = ({
  children,
  defaultTheme = 'clinical',
}) => {
  // Clear query cache before each render using this provider if needed,
  // though typically managed per test suite or file.
  // testQueryClient.clear(); 

  return (
    <BrowserRouter> {/* Add Router */}
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider defaultTheme={defaultTheme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Custom render options extending RTL's RenderOptions
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  defaultTheme?: ThemeMode;
  // Add other options like initial route if needed for router
}

// Custom render function
export function renderWithProviders(
  ui: ReactElement,
  {
    defaultTheme = 'clinical',
    ...options
  }: ExtendedRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders defaultTheme={defaultTheme}>
      {children}
    </AllProviders>
  );

  // Render the UI with the wrapper
  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render export with our custom function
export { renderWithProviders as render };

```

## 6. Path Alias Configuration (`tsconfig.json`)

Ensure `paths` in `tsconfig.json` match the aliases defined in `vitest.config.ts`.

```json
// tsconfig.json (relevant part)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@atoms/*": ["src/presentation/atoms/*"],
      "@molecules/*": ["src/presentation/molecules/*"],
      "@organisms/*": ["src/presentation/organisms/*"],
      "@templates/*": ["src/presentation/templates/*"],
      "@pages/*": ["src/presentation/pages/*"],
      "@services/*": ["src/infrastructure/services/*"],
      "@hooks/*": ["src/application/hooks/*"],
      "@utils/*": ["src/application/utils/*"],
      "@contexts/*": ["src/application/contexts/*"],
      "@types/*": ["src/domain/types/*"],
      "@models/*": ["src/domain/models/*"],
      "@assets/*": ["src/presentation/assets/*"],
      "@shaders/*": ["src/presentation/shaders/*"],
      "@store/*": ["src/application/store/*"],
      "@styles/*": ["src/presentation/styles/*"],
      "@api/*": ["src/infrastructure/api/*"],
      "@config/*": ["src/infrastructure/config/*"],
      "@constants/*": ["src/domain/constants/*"],
      "@validation/*": ["src/domain/validation/*"],
      "@visualizations/*": ["src/presentation/visualizations/*"],
      "@test/*": ["src/test/*"]
      // Ensure these match vitest.config.ts aliases
    }
    // ... other options
  },
  "include": ["src", "src/test"], // Ensure test files are included
  // ... other settings
}
```

## 7. Dependency Management & Build Configuration Notes

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

### Vite `optimizeDeps` Strategy (`vite.config.ts`)

To handle R3F complexities and ensure smooth development server startup, the following `optimizeDeps` configuration is used in the main `vite.config.ts`:

```typescript
// From vite.config.ts
optimizeDeps: {
  include: [ // Ensure these are pre-bundled
    'three', 
    '@react-three/fiber', 
    '@react-three/drei', 
    '@react-three/postprocessing',
    'react', 
    'react-dom' 
  ],
  exclude: [ // Prevent pre-bundling of potentially problematic transitive deps
    '@react-three/fiber', // Excluding here might seem counter-intuitive but helps resolve specific conflicts
    '@react-three/postprocessing',
    'zustand',
    'suspend-react',
    'its-fine',
    'scheduler',
    'react-use-measure'
  ],
  esbuildOptions: { // Define globalThis for browser compatibility
    define: {
      global: 'globalThis'
    }
  }
}
```
This strategy aims to pre-bundle core libraries while excluding specific R3F-related packages that caused resolution issues during Vite's dependency scanning phase.

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


## 8. Next Steps

1.  Implement the configurations defined in this document (`vitest.config.ts`, `setup.ts`, `test-utils.unified.tsx`, mocks).
2.  Consolidate remaining relevant documentation into this file or linked files. Remove obsolete docs.
3.  Clean up the `scripts/` directory.
4.  Start running tests incrementally, beginning with the simplest ones, fixing errors based on this canonical setup.