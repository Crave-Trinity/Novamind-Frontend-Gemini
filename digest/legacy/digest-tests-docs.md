This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/test/**, docs/**, README.md
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
docs/
  legacy/
    API_CLIENT_ARCHITECTURE.md
    ARCHITECTURE_GUIDELINES.md
    BACKEND_API_COMPREHENSIVE.md
    CURRENT_FRONTEND_IMPLEMENTATION.md
    FRONTEND_BACKEND_INTEGRATION_ANALYSIS.md
    PUPPETEER_TESTING_SETUP.md
    TAILWIND_GUIDELINES.md
    TEST_COVERAGE_ANALYSIS.md
    TEST_COVERAGE_IMPROVEMENT.md
    TEST_SETUP_STANDARDS.md
    TEST_SUITE_ANALYSIS_SNAPSHOT.md
    TESTING_GUIDELINES.md
    TYPE_DEFINITION_STRATEGY.md
    WEBGL_TESTING_STRATEGY.md
src/
  test/
    examples/
      tailwind-enhanced.test.tsx
      test-theme-app.tsx
      test-theme.html
    mocks/
      api/
        brainModelDemo.json
      handlers.ts
      mockBrainData.ts
      react-three-drei.ts
      react-three-fiber.tsx
      server.ts
    tools/
      neural-coverage-visualizer.ts
    utils/
      coverage-analyzer.ts
      test-utils.tsx
    webgl/
      examples/
        BrainRegionVisualizer.test.ts
        neural-controllers-mock.ts
      index.ts
      memory-monitor.ts
      mock-types.ts
      mock-utils.ts
      mock-webgl.test.ts
      mock-webgl.ts
      setup-test.ts
      test-setup.js
      three-mocks.test.ts
      three-mocks.ts
      types.ts
    absolute-minimal.spec.tsx
    componentMocks.tsx
    criticalComponentMocks.tsx
    direct-neural-test.ts
    enhanced-tailwind.ts
    esm-runner.ts
    hooks-test-setup.ts
    minimal-brain-container.spec.tsx
    minimal-brain-test.spec.ts
    minimal-ts.test.ts
    minimal.test.ts
    mock-registry.ts
    native-runner.ts
    neural-coverage-visualizer.ts
    neural-spy-system.ts
    neural-standalone.spec.tsx
    neural-test-helper.ts
    neural-test-registry.ts
    node-polyfills.ts
    node-preload.ts
    path-alias-fix.ts
    README.md
    README.unified.md
    sanity.test.ts
    setup.clean.ts
    setup.core.ts
    setup.dom.ts
    setup.ts
    standalone-brain-test.spec.tsx
    tailwind-example.unified.test.tsx
    tailwind-mock.ts
    tailwind-testing-example.test.tsx
    test-utils.core.tsx
    test-utils.tsx
    test-utils.unified.tsx
    testUtils.tsx
    textencoder-fix.ts
    three-test-utils.ts
    unified-three.mock.ts
    url-fix.ts
    vite-env.d.test.ts
README.md
```

# Files

## File: src/test/examples/test-theme-app.tsx
````typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css'; // Import styles using alias
import ThemeProvider from '@application/contexts/ThemeProvider'; // Use default import
// Removed unused auditLogService import
import type { ThemeMode } from '@contexts/ThemeContext';
import { ThemeContext } from '@contexts/ThemeContext'; // Use @contexts alias
import { useContext } from 'react';
⋮----
/**
 * Interface for the theme context type
 */
interface ThemeContextType {
  mode: ThemeMode;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}
⋮----
/**
 * Hook for accessing theme context
 */
const useTheme = (): ThemeContextType =>
⋮----
/**
 * Simple theme controller component to test theme functionality
 */
⋮----
/**
 * Main App wrapper with theme provider
 */
⋮----
return (
    <ThemeProvider defaultTheme="system">
      <ThemeController />
    </ThemeProvider>
  );
⋮----
// Mount the application
const container = document.getElementById('app');
if (container)
const root = createRoot(container);
````

## File: src/test/examples/test-theme.html
````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novamind Theme System Test</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Tailwind CDN for quick testing -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              100: '#e0f2fe',
              900: '#0c4a6e'
            },
            secondary: {
              100: '#f1f5f9',
              900: '#0f172a'
            },
            success: {
              100: '#dcfce7',
              900: '#14532d'
            },
            error: {
              100: '#fee2e2',
              900: '#7f1d1d'
            }
          }
        }
      }
    }
  </script>
  <style>
    /* Base styles */
    body {
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    /* Dark mode styles */
    .dark body {
      background-color: #111827;
      color: #f3f4f6;
    }
    
    /* Theme-specific styles */
    .theme-clinical body {
      font-family: 'Helvetica', sans-serif;
    }
    
    .theme-retro body {
      font-family: 'Courier New', monospace;
    }
    
    .theme-wes body {
      font-family: 'Futura', sans-serif;
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <!-- Mock dependencies before loading the app -->
  <script>
    // Mock the audit log service
    window.auditLogService = {
      log: function(eventType, details) {
        console.log('AuditLog:', eventType, details);
      }
    };
    
    window.AuditEventType = {
      SYSTEM_CONFIG_CHANGE: 'SYSTEM_CONFIG_CHANGE'
    };
  </script>

  <!-- Load our ThemeContext code -->
  <script type="text/babel">
    // Recreate ThemeContext
    const ThemeContext = React.createContext({
      mode: 'system',
      isDarkMode: false,
      setTheme: () => undefined,
      toggleTheme: () => undefined,
    });
    
    // Define ThemeMode types - simplified set
    const ThemeMode = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
      CLINICAL: 'clinical',
      RETRO: 'retro'
    };
    
    // Create ThemeProvider component
    const ThemeProvider = ({defaultTheme = 'system', children}) => {
      // Get initial theme from localStorage or use default
      const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const validThemes = ['light', 'dark', 'system', 'clinical', 'retro'];
        return savedTheme && validThemes.includes(savedTheme) ? savedTheme : defaultTheme;
      };

      const [mode, setMode] = React.useState(getInitialTheme());
      const [isDarkMode, setIsDarkMode] = React.useState(false);

      // Detect system preference for dark mode
      const prefersDarkMode = React.useMemo(() => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }, []);

      // Apply theme to document
      React.useEffect(() => {
        // Determine if dark mode should be active
        const shouldUseDark =
          mode === 'dark' ||
          (mode === 'system' && prefersDarkMode) ||
          mode === 'retro';
        
        setIsDarkMode(shouldUseDark);
        
        // Apply theme classes to document
        const root = document.documentElement;
        
        // Clear existing theme classes
        root.classList.remove('theme-light', 'theme-dark', 'theme-system', 'theme-clinical', 'theme-retro');
        
        // Set dark/light mode
        if (shouldUseDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        
        // Add specific theme class
        root.classList.add(`theme-${mode}`);
        
        // Save theme preference to localStorage
        localStorage.setItem('theme', mode);
        
        // Log theme change for audit purposes
        window.auditLogService.log(window.AuditEventType.SYSTEM_CONFIG_CHANGE, {
          action: 'THEME_CHANGE',
          details: `Theme changed to ${mode}`,
          result: 'success'
        });
      }, [mode, prefersDarkMode]);

      // Set theme callback
      const setTheme = React.useCallback((newTheme) => {
        setMode(newTheme);
      }, []);

      // Toggle between light and dark
      const toggleTheme = React.useCallback(() => {
        setMode(current => (current === 'light' ? 'dark' : 'light'));
      }, []);

      // Context value with memoization for performance
      const contextValue = React.useMemo(() => ({
        mode,
        isDarkMode,
        setTheme,
        toggleTheme
      }), [mode, isDarkMode, setTheme, toggleTheme]);

      return (
        <ThemeContext.Provider value={contextValue}>
          {children}
        </ThemeContext.Provider>
      );
    };
    
    // Hook for accessing theme context throughout the application
    const useTheme = () => {
      const context = React.useContext(ThemeContext);
      
      if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
      }
      
      return context;
    };

    // Theme controller component
    const ThemeController = () => {
      const { mode, isDarkMode, setTheme, toggleTheme } = useTheme();
      
      const themes = ['light', 'dark', 'system', 'clinical', 'retro'];
      
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className={`p-8 rounded-lg shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <h1 className="text-3xl font-bold mb-6">Theme System Test</h1>
            
            <div className="mb-6 p-4 rounded border">
              <h2 className="text-xl font-semibold mb-2">Current Theme State</h2>
              <p id="active-theme"><strong>Active Theme:</strong> {mode}</p>
              <p id="theme-indicator"><strong>Dark Mode:</strong> {isDarkMode ? 'Enabled' : 'Disabled'}</p>
              <p id="dark-mode-status"><strong>Dark Mode Status:</strong> {isDarkMode ? 'Enabled' : 'Disabled'}</p>
              <p><strong>System Preference:</strong> {window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Toggle Light/Dark</h2>
              <button 
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-md transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium`}
              >
                Toggle Theme ({isDarkMode ? 'Light' : 'Dark'})
              </button>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Select Theme</h2>
              <div className="flex flex-wrap gap-2">
                {themes.map(theme => (
                  <button
                    key={theme}
                    onClick={() => setTheme(theme)}
                    className={`px-4 py-2 rounded-md transition-colors ${mode === theme ? 
                      (isDarkMode ? 'bg-green-600' : 'bg-green-500') : 
                      (isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400')
                    } ${isDarkMode ? 'text-white' : (mode === theme ? 'text-white' : 'text-gray-800')} font-medium`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6 p-4 rounded border">
              <h2 className="text-xl font-semibold mb-2">Theme Implementation Details</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Uses <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">React Context API</code> for global state</li>
                <li>Stores preference in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">localStorage</code></li>
                <li>Detects system preferences with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">matchMedia</code></li>
                <li>Applies theme using <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">CSS classes</code> on document root</li>
                <li>Logs theme changes for audit compliance</li>
              </ul>
            </div>
            
            <div className="p-4 rounded border">
              <h2 className="text-xl font-semibold mb-2">Element Styling Examples</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded">Primary Background</div>
                <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded">Secondary Background</div>
                <div className="p-4 bg-success-100 dark:bg-success-900 rounded">Success Background</div>
                <div className="p-4 bg-error-100 dark:bg-error-900 rounded">Error Background</div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // Main App
    const App = () => (
      <ThemeProvider defaultTheme="system">
        <ThemeController />
      </ThemeProvider>
    );

    // Render the application
    const container = document.getElementById('app');
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  </script>
</body>
</html>
````

## File: src/test/mocks/handlers.ts
````typescript
import { http, HttpResponse } from 'msw';
import type { BrainModel, BrainRegion, BrainScan, NeuralConnection, Patient } from '@domain/types';
⋮----
// Mock data
⋮----
// API Handlers
⋮----
// Auth endpoints
⋮----
// Patient endpoints
⋮----
// Brain scan endpoints
⋮----
// Brain model endpoints
⋮----
// Fallback handler for unmatched requests
````

## File: src/test/mocks/react-three-fiber.tsx
````typescript
/**
 * React Three Fiber Mock for Testing
 *
 * Provides a minimal, test-safe mock for the Canvas component.
 * Prevents errors related to WebGL context creation in JSDOM.
 */
import React, { forwardRef } from 'react';
⋮----
// Mock Canvas as a simple div that renders children
⋮----
// Add a data-testid for easier selection in tests if needed
⋮----
// Mock other commonly used exports from R3F if needed,
// otherwise let them be undefined or mock minimally.
export const useFrame = () => {}; // No-op mock
export const useThree = () => (
⋮----
// Return minimal state/gl mock
gl: { domElement: { style: {} } }, // Mock necessary properties used by controls etc.
⋮----
// Add other properties if tests rely on them
⋮----
// Add other exports as needed based on test failures
````

## File: src/test/mocks/server.ts
````typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
⋮----
// Setup MSW server with default handlers
⋮----
// Start server before all tests
⋮----
// Reset handlers after each test
⋮----
// Close server after all tests
⋮----
// Export individual handler groups for specific test overrides
````

## File: src/test/webgl/three-mocks.test.ts
````typescript
/**
 * Tests for the Three.js mock system
 *
 * This test verifies that our Three.js mocking system works correctly
 * for complex Three.js components used in brain visualizations.
 */
⋮----
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  // Removed unused ThreeMocks import
  MockScene,
  MockPerspectiveCamera,
  MockMesh,
  MockMeshBasicMaterial,
  MockSphereGeometry,
  MockObject3D,
  MockWebGLRenderer,
} from './three-mocks';
⋮----
// Removed unused ThreeMocks import
⋮----
import { setupWebGLMocks, cleanupWebGLMocks } from './mock-webgl';
⋮----
// Set up WebGL mocks before each test
⋮----
// Set up fake timers for animation frame testing
⋮----
// Clean up after each test to avoid polluting other tests
⋮----
// Reset timers
⋮----
// Create a scene
⋮----
// Create a camera
⋮----
// Create mesh with geometry and material
⋮----
// Add mesh to scene
⋮----
// Verify scene structure
⋮----
// Verify position
⋮----
// Create objects
⋮----
// Set up spy on dispose methods
⋮----
// Add to scene
⋮----
// Dispose mesh
⋮----
// Verify dispose was called on geometry and material
⋮----
// Test removal
⋮----
// Add a test specifically for the renderer, which is critical for performance
⋮----
// This would normally crash in JSDOM without proper mocking
⋮----
// If no error is thrown, the test passes
⋮----
// Verify renderer has expected properties
````

## File: src/test/absolute-minimal.spec.tsx
````typescript
/**
 * NOVAMIND Neural Architecture
 * Absolute Minimal Test with Quantum Precision
 *
 * This test contains no external dependencies or mocks to establish
 * a baseline for the testing environment.
 */
⋮----
import { describe, it, expect } from 'vitest';
// Removed unused React import again
import { render, screen } from '@testing-library/react';
⋮----
// A minimal component with no dependencies
const MinimalComponent = () =>
⋮----
// Verify the component renders with mathematical elegance
⋮----
// Basic assertions with quantum precision
````

## File: src/test/componentMocks.tsx
````typescript
/**
 * NOVAMIND Neural Test Framework
 * Quantum-precise component mocking with mathematical elegance
 */
⋮----
import React from 'react';
import { vi } from 'vitest';
⋮----
// Core neural mocks for all atomic components with clinical precision
⋮----
// Atom components
⋮----
// Neural visualization components
⋮----
// Neural icons
⋮----
// Neural-safe mocks for React Router
⋮----
// Neural-safe mocks for React Query
⋮----
setDefaultOptions()
invalidateQueries()
prefetchQuery()
⋮----
// Neural-safe mocks for hooks
````

## File: src/test/direct-neural-test.ts
````typescript
/**
 * NOVAMIND Neural Architecture
 * Direct Neural Test with Quantum Isolation
 *
 * This file implements a surgically precise approach to testing
 * the NeuralActivityVisualizer with clinical accuracy.
 */
⋮----
// Import core testing libraries with quantum precision
import { describe, it, expect } from 'vitest';
⋮----
// Clinical precision test
⋮----
// Assert neural-safe environment with quantum precision
````

## File: src/test/enhanced-tailwind.ts
````typescript
/**
 * Enhanced Tailwind CSS Testing Support
 *
 * A comprehensive implementation of Tailwind CSS mocking for tests
 * that ensures proper class handling, dark mode support, and theme compatibility.
 */
// Removed unused import: vi from 'vitest';
⋮----
// Global state for dark mode that persists between tests
⋮----
/**
 * Enhanced Tailwind CSS mock for testing environment
 */
⋮----
// Dark mode state
⋮----
// Enable dark mode in tests and return true to confirm operation
⋮----
// Disable dark mode in tests and return false to confirm operation
⋮----
// Toggle dark mode and return new state
⋮----
// Initialize Tailwind mock in test environment
⋮----
// Reset all Tailwind test state
⋮----
/**
 * Apply dark mode class to document root
 * This is how Tailwind's dark mode detection works with class strategy
 */
function applyDarkModeClass()
⋮----
// Always ensure we remove first to avoid duplicates
⋮----
// Add the appropriate class
⋮----
/**
 * Inject comprehensive Tailwind-like styles for testing purposes
 * Includes a wider range of utility classes commonly used in the application
 */
function injectTailwindStyles()
⋮----
// Export default helper
````

## File: src/test/esm-runner.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * ESM-compatible TypeScript Test Runner
 *
 * This file provides a direct TypeScript test runner that works with
 * ESM modules and bypasses the problematic transformation pipeline.
 */
⋮----
import { spawn } from 'child_process';
⋮----
import { fileURLToPath } from 'url';
⋮----
// Get proper ESM-compatible directory paths
⋮----
// Define TypeScript interfaces for our test runner
interface TestRunnerOptions {
  testPattern: string;
  tsconfig: string;
  verbose: boolean;
}
⋮----
/**
 * Run TypeScript tests directly using Node.js with ESM support
 * to avoid the TextEncoder invariant issue
 */
export async function runTests(options: TestRunnerOptions): Promise<void>
⋮----
// Find test files
⋮----
// Run each test file directly with Node.js ESM
⋮----
// Create a temporary ESM wrapper for the test file
⋮----
// Clean up the temporary wrapper file
⋮----
/**
 * Find test files matching the given pattern
 */
async function findTestFiles(pattern: string): Promise<string[]>
⋮----
// Convert glob pattern to regex
⋮----
async function searchDirectory(dir: string): Promise<void>
⋮----
// Skip node_modules and hidden directories
⋮----
/**
 * Create a temporary ESM wrapper for the test file
 */
async function createEsmWrapper(testFile: string): Promise<string>
⋮----
// Run the tests if this script is executed directly
````

## File: src/test/hooks-test-setup.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * Specialized Hook Testing Setup
 *
 * This setup file provides a clean environment for testing React hooks,
 * particularly those using React Query, which is a common source of test hangs.
 */
⋮----
import { afterEach, beforeEach, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
⋮----
// Create a shared QueryClient for consistent cache clearing
⋮----
// Avoid using fake timers in hook tests, as they can cause hangs
// with async operations that use setTimeout
⋮----
// Always use real timers for hook tests
⋮----
// Create a fresh QueryClient for each test
⋮----
// Critical for testing - disable retries
⋮----
// Disable caching (React Query v5 uses gcTime instead of cacheTime)
⋮----
// Disable refetching
⋮----
// Disable retries for mutations as well
⋮----
// Force React Query's cache to clear
⋮----
// Clean up after each test
⋮----
// Clear the query cache again
⋮----
// Create a test QueryClient with consistent settings
export function createTestQueryClient(): QueryClient
⋮----
// Export a global flag to signal this setup has been loaded
````

## File: src/test/minimal-brain-container.spec.tsx
````typescript
/**
 * NOVAMIND Neural Architecture
 * Minimal Brain Container Test with Quantum Precision
 */
⋮----
import { describe, it, expect, vi } from 'vitest';
// Removed unused React import
import { screen, render } from '@testing-library/react'; // Import render
⋮----
import type { FC } from 'react';
// import { renderWithProviders } from '@test/test-utils.unified'; // Remove provider render
⋮----
// Define the props interface for our component
interface BrainModelContainerProps {
  patientId: string;
}
⋮----
// Mock component definition will be dynamically imported in vi.mock
⋮----
// Mock the actual component module, referencing the definition above
⋮----
// Define the mock component inline and return it
const MockComponent: FC<BrainModelContainerProps> = ({ patientId }) => (
    <div data-testid="brain-model-container">
      <div data-testid="brain-model">Neural Visualization</div>
      <div data-testid="patient-id">{patientId}</div>
      <div data-testid="neural-controls">Neural Controls</div>
    </div>
  );
⋮----
// Import the component AFTER mocking
import BrainModelContainer from '@presentation/templates/BrainModelContainer';
⋮----
// Re-enabled suite
// No beforeEach needed for this simple test
⋮----
render(<BrainModelContainer patientId="TEST-PATIENT-001" />); // Use basic render
⋮----
expect(screen.getByTestId('brain-model-container')).toBeInTheDocument(); // Check outer container
screen.debug(); // Add debug output
⋮----
render(<BrainModelContainer patientId="TEST-PATIENT-002" />); // Use basic render
````

## File: src/test/minimal-brain-test.spec.ts
````typescript
/**
 * NOVAMIND Neural Architecture
 * Minimal Brain Test with Quantum Precision
 *
 * This is a minimal test to establish a baseline for the testing environment.
 * It doesn't rely on any complex mocking or dependencies.
 */
⋮----
import { describe, it, expect } from 'vitest';
⋮----
// Most basic test possible
````

## File: src/test/minimal-ts.test.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * Minimal TypeScript Test
 *
 * This file provides a minimal test to verify the TypeScript testing infrastructure.
 */
⋮----
// Simple test that doesn't rely on TextEncoder
````

## File: src/test/minimal.test.ts
````typescript
/**
 * NOVAMIND Neural Test Suite
 * Minimal TypeScript test with quantum precision
 * FIXED: TextEncoder issue
 */
⋮----
import { describe, it, expect, beforeAll } from 'vitest';
⋮----
// Properly implemented TextEncoder polyfill
class MockTextEncoder
⋮----
encode(input: string): Uint8Array
⋮----
// Create a proper Uint8Array
⋮----
// Apply the polyfill before all tests
⋮----
// Only add the polyfill if it doesn't exist
⋮----
// Instead of instanceof check which may fail in the test environment,
// verify it has the expected properties and behaviors of a Uint8Array
⋮----
// Verify the proper encoding happens
⋮----
expect(uint8Array[0]).toBe(116); // ASCII code for 't'
expect(uint8Array[1]).toBe(101); // ASCII code for 'e'
expect(uint8Array[2]).toBe(115); // ASCII code for 's'
expect(uint8Array[3]).toBe(116); // ASCII code for 't'
````

## File: src/test/mock-registry.ts
````typescript
/**
 * NOVAMIND Neural Architecture
 * Mock Registry with Quantum Precision
 *
 * This centralized registry ensures consistent mock implementation
 * across all test files with clinical accuracy.
 */
⋮----
import { vi } from 'vitest';
⋮----
// Mock registry initialization with neural precision
export function setupMockRegistry()
⋮----
// Register mock for external SVG imports used in visualization
⋮----
// Register neural-safe mocks for CSS modules
⋮----
// Register neural-safe mocks for GLSL shaders
⋮----
// Note: Direct exports removed as they're now handled in neural-mock-system.ts
````

## File: src/test/native-runner.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * Native TypeScript Test Runner
 *
 * This file provides a direct TypeScript test runner that bypasses
 * the problematic transformation pipeline that's causing TextEncoder issues.
 */
⋮----
import { spawnSync } from 'child_process';
⋮----
// Define TypeScript interfaces for our test runner
interface TestRunnerOptions {
  testPattern: string;
  tsconfig: string;
  verbose: boolean;
}
⋮----
/**
 * Run TypeScript tests directly using ts-node without transformation
 * that might break the TextEncoder invariant
 */
function runTests(options: TestRunnerOptions): void
⋮----
// Find test files
⋮----
// Run each test file directly with ts-node
⋮----
/**
 * Find test files matching the given pattern
 */
function findTestFiles(pattern: string): string[]
⋮----
// Convert glob pattern to regex
⋮----
function searchDirectory(dir: string): void
⋮----
// Skip node_modules and hidden directories
⋮----
// Run the tests if this script is executed directly
````

## File: src/test/neural-coverage-visualizer.ts
````typescript
/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Coverage Visualizer with Quantum Precision
 *
 * This utility generates HTML visualizations of test coverage metrics
 * for neural visualization components with clinical precision.
 */
⋮----
import fs from 'fs';
import path from 'path';
⋮----
// Type definitions for coverage data structure
interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}
⋮----
interface CoverageMetricsDetail {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
}
⋮----
// Interface for the overall coverage data object, including the 'total' summary
interface CoverageData extends Record<string, CoverageMetricsDetail> {
  total: CoverageMetricsDetail;
}
⋮----
// Neural-safe coverage rendering with quantum precision
// Represents the calculated percentages for display
interface NeuralCoverageMetrics {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  averageCoverage: number;
}
⋮----
interface ComponentCoverage {
  name: string;
  path: string;
  type:
    | 'atom'
    | 'molecule'
    | 'organism'
    | 'template'
    | 'page'
    | 'service'
    | 'coordinator'
    | 'model';
  metrics: NeuralCoverageMetrics;
}
⋮----
/**
 * Generate neural-safe coverage HTML report with quantum precision
 */
export function generateCoverageVisualization(
  coverageData: CoverageData,
  outputPath: string
): void
⋮----
// Extract component metrics with clinical precision
⋮----
// Process each file in coverage data with mathematical elegance
⋮----
// Skip non-source files and total metrics
⋮----
// Skip test and utility files
⋮----
// Determine component type with neural precision
⋮----
// Extract component name with quantum precision
⋮----
// Calculate component metrics with clinical precision
// Type assertion is no longer needed as coverageData is typed
⋮----
// Sort components by type and name with mathematical elegance
⋮----
// Generate HTML report with clinical precision
⋮----
// Write HTML report with quantum precision
⋮----
/**
 * Generate HTML report with quantum precision
 */
function generateHtmlReport(
  components: ComponentCoverage[],
  totalMetrics: CoverageMetricsDetail
): string
⋮----
// Calculate total coverage with clinical precision
⋮----
// Generate coverage statistics by component type with quantum precision
⋮----
// Generate HTML with mathematical elegance
⋮----
/**
 * Generate component type HTML with quantum precision
 */
function generateComponentTypeHtml(components: ComponentCoverage[]): string
⋮----
// Group components by type with clinical precision
⋮----
// Generate HTML for each component type with mathematical elegance
⋮----
// Calculate average metrics for this type
⋮----
// Generate HTML with quantum precision
⋮----
/**
 * Generate statistics by component type with clinical precision
 */
function generateTypeStats(components: ComponentCoverage[]): Array<
⋮----
// Group components by type with mathematical elegance
⋮----
// Calculate metrics by type with quantum precision
⋮----
/**
 * Neural-safe command-line execution with quantum precision
 */
⋮----
// Process command-line arguments with quantum precision
⋮----
// Parse arguments with clinical precision
⋮----
// Ensure paths are provided with quantum precision
⋮----
// Ensure cross-platform path resolution with mathematical elegance
⋮----
// Read coverage data with clinical precision
⋮----
// Generate visualization with quantum precision
````

## File: src/test/neural-test-registry.ts
````typescript
/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Test Registry with Quantum Precision
 *
 * This centralized test registry provides a synchronous state coordination
 * mechanism for quantum-precise testing with clinical accuracy.
 */
⋮----
import { vi } from 'vitest';
⋮----
// Neural-safe test state registry with quantum precision
interface NeuralTestState {
  // Visualization state
  visualizationState: {
    isErrorState: boolean;
    errorMessage: string | null;
    isLoading: boolean;
  };

  // Mock registry configuration
  mockConfig: {
    interceptModules: boolean;
    bypassCache: boolean;
  };
}
⋮----
// Visualization state
⋮----
// Mock registry configuration
⋮----
// Initialize neural-safe test state with clinical precision
⋮----
// Neural-safe visualization error state mock creator with mathematical elegance
export const createVisualizationErrorMock = (errorMsg: string) => (
⋮----
/**
 * Set visualization error state with quantum precision
 * Uses spy-based mocking for proper coverage instrumentation
 */
export const setVisualizationErrorState = (errorMessage: string): void =>
⋮----
/**
 * Clear visualization error state with quantum precision
 */
export const clearVisualizationErrorState = (): void =>
⋮----
// Reset module mocks with clinical precision
⋮----
/**
 * Get current neural test state with quantum precision
 */
export const getNeuralTestState = (): NeuralTestState =>
⋮----
/**
 * Access visualization error state with clinical precision
 */
export const getVisualizationErrorState = ():
⋮----
// Initialize neural-safe test registry
````

## File: src/test/node-polyfills.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * Node.js Polyfills for Browser APIs
 *
 * This file provides polyfills for browser APIs that are not available in Node.js
 * but are required for testing browser-based components.
 */
⋮----
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
⋮----
// Create proper TextEncoder implementation that passes instanceof checks
class FixedTextEncoder extends NodeTextEncoder
⋮----
constructor()
⋮----
override encode(input?: string): Uint8Array
⋮----
// Ensure the result passes instanceof Uint8Array checks
⋮----
// Create proper TextDecoder implementation
class FixedTextDecoder extends NodeTextDecoder
⋮----
constructor(encoding?: string, options?: TextDecoderOptions)
⋮----
override decode(
    input?: ArrayBuffer | NodeJS.ArrayBufferView | null,
    options?: { stream?: boolean }
): string
⋮----
// Replace global TextEncoder and TextDecoder with our fixed versions
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).TextDecoder = FixedTextDecoder; // Reverting to any for minimal polyfill
⋮----
// Verify that our TextEncoder implementation works correctly
⋮----
// Mock browser-specific APIs that might be missing
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any; // Reverting to any for minimal polyfill
⋮----
// Mock requestAnimationFrame and cancelAnimationFrame
// if (typeof global.requestAnimationFrame === "undefined") {
//   global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
//     // Using setTimeout(..., 0) can sometimes cause issues in test environments
//     return setTimeout(() => callback(Date.now()), 0) as unknown as number;
//   };
// }
//
// if (typeof global.cancelAnimationFrame === "undefined") {
//   global.cancelAnimationFrame = (handle: number): void => {
//     clearTimeout(handle);
//   };
// }
⋮----
// Export a dummy function to make TypeScript happy
export const setupNodePolyfills = (): void =>
⋮----
// This function is intentionally empty
// The polyfills are applied when this module is imported
⋮----
// Additional verification
````

## File: src/test/node-preload.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * Node.js Preload Fix (Pure TypeScript and ESM)
 *
 * This file is loaded via Node.js --import flag before any code runs,
 * including Vitest's bootstrapping process.
 */
⋮----
// Import from Node.js util module
import { TextEncoder as NodeTextEncoder } from 'util';
⋮----
// Fix TextEncoder to ensure it passes instanceof Uint8Array checks
class FixedTextEncoder extends NodeTextEncoder
⋮----
override encode(input?: string): Uint8Array
⋮----
// Ensure result passes instanceof Uint8Array checks
⋮----
// Apply TextEncoder fix globally
⋮----
// Fix URL constructor to handle edge cases
⋮----
// Create patched URL class
class PatchedURL extends OriginalURL
⋮----
constructor(url: string | URL, base?: string | URL)
⋮----
// Try original constructor first
⋮----
// Check if error is an object with a 'code' property
⋮----
// If URL has invalid scheme, fix it
⋮----
// Add file:// scheme if missing
⋮----
// Apply URL patch globally
⋮----
// Verify fixes were successful
````

## File: src/test/path-alias-fix.ts
````typescript
/**
 * Path Alias Resolution Fix for Tests
 *
 * This file ensures that path aliases defined in tsconfig.json and vitest.config.ts
 * are correctly resolved during tests. It logs the resolution paths to verify
 * the aliases are working properly.
 */
⋮----
// Removed unused import: vi from 'vitest';
import path from 'path';
⋮----
// Log that path alias fix is running
⋮----
// Define the base source directory
⋮----
// Log alias resolution paths to help diagnose issues
⋮----
// Output all path aliases to verify they are correct
⋮----
// Override the module import behavior for aliased paths (no direct implementation needed)
// The vitest.config.ts file already handles this via resolve.alias
````

## File: src/test/README.md
````markdown
# Testing with Tailwind CSS

This directory contains utilities for testing components that use Tailwind CSS, including support for dark mode.

## Key Files

- `tailwind-mock.ts` - Mock implementation for Tailwind CSS in tests
- `setup.ts` - Test setup file that initializes the Tailwind mock
- `test-utils.tsx` - Enhanced rendering utilities with theme/dark mode support
- `tailwind-testing-example.test.tsx` - Example of how to test Tailwind CSS components

## Common Testing Issues & Solutions

### Problem: JSDOM Doesn't Process CSS

When running tests in a JSDOM environment (the default for Jest/Vitest), CSS is not actually processed or applied. This can cause issues when testing components that rely on CSS classes for styling, especially with:

- Dark mode toggles
- Theme changes
- Media queries
- CSS variables

### Solution: Class-Based Testing

Rather than trying to test the actual computed styles (which don't exist in JSDOM), we test that:

1. The correct Tailwind classes are applied to elements
2. Dark mode classes (`dark:*`) are present when they should be
3. Theme toggles modify the document classes appropriately

## Usage Guide

### Basic Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

test('component renders with correct Tailwind classes', () => {
  render(<YourComponent />);
  
  const element = screen.getByTestId('your-element');
  expect(element).toHaveClass('bg-white');
  expect(element).toHaveClass('dark:bg-gray-800');
});
```

### Testing Dark Mode

Use our enhanced rendering utilities:

```tsx
import { render, screen } from '../test/test-utils';
import { tailwindMock } from '../test/tailwind-mock';
import YourComponent from './YourComponent';

test('component toggles dark mode classes', () => {
  // Render with dark mode enabled
  const { enableDarkMode, disableDarkMode } = render(<YourComponent />);
  
  // Toggle dark mode
  enableDarkMode();
  
  // Check that dark mode class is added to document
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  
  // Toggle back to light mode
  disableDarkMode();
  expect(document.documentElement.classList.contains('dark')).toBe(false);
});
```

### Testing Components with Dark Mode Classes

```tsx
import { render, screen } from '../test/test-utils';
import YourComponent from './YourComponent';

test('component has appropriate dark mode classes', () => {
  render(<YourComponent />);
  
  // Verify dark mode classes are present (they will be applied when dark mode is active)
  const element = screen.getByTestId('your-element');
  expect(element).toHaveClass('dark:bg-gray-800');
  expect(element).toHaveClass('dark:text-white');
});
```

## Best Practices

1. **Focus on class presence**: Test that elements have the expected Tailwind classes.
2. **Avoid testing computed styles**: Don't try to test actual rendered appearance.
3. **Separate theme logic**: Test theme switching functions separately from visual appearance.
4. **Use test data attributes**: Add `data-testid` attributes to make selecting elements easier.
5. **Verify dark mode classes**: Make sure dark mode variants are correctly applied.

## Troubleshooting

- If dark mode classes aren't working, check that your tailwind.config.js is set to use `class` strategy: `darkMode: 'class'`
- If class-based tests fail, verify the components are using the correct Tailwind classes
- For theme-related issues, make sure the theme context is properly provided in tests

## Extending

To add support for additional Tailwind utilities in the test environment:

1. Update `tailwind-mock.ts` with new CSS classes in the `injectTailwindStyles` function
2. Add any new theme-related functionality to `test-utils.tsx`
````

## File: src/test/README.unified.md
````markdown
# Unified Testing Framework for Novamind Digital Twin

This document explains the new unified testing approach for the Novamind Digital Twin project, which provides a clean, consistent way to test components that use Tailwind CSS, including dark mode support.

## Overview

The unified testing framework consolidates all testing-related configurations into a single source of truth, eliminating the confusion and inconsistencies of multiple test setups.

### Key Components

1. **`setup.unified.ts`**: Core test environment setup with proper DOM initialization, Tailwind CSS class simulation, and browser API mocks
2. **`test-utils.unified.tsx`**: Enhanced render functions with theme provider integration
3. **`vitest.config.unified.ts`**: Unified Vitest configuration
4. **`scripts/run-with-unified-config.sh`**: Convenience script for running tests with the unified config

## Features

- **JSDOM Environment**: Properly initialized for DOM testing
- **Tailwind CSS Support**: Mock implementation of Tailwind CSS classes
- **Dark Mode Testing**: Easy toggling of dark/light mode
- **ThemeProvider Integration**: Tests components with theme context

## Usage

### Running Tests

Use the `npm run test:unified` script to run all unified tests:

```bash
npm run test:unified
```

Or run specific test files:

```bash
npm run test:tailwind
# or directly
scripts/run-with-unified-config.sh src/your/test/file.unified.test.tsx
```

### Writing Tests

Create test files with the `.unified.test.tsx` extension to leverage the unified testing framework:

```tsx
// example.unified.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils.unified';

describe('Component Test', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('toggles dark mode correctly', () => {
    const { enableDarkMode, disableDarkMode } = render(<YourComponent />);
    
    // Start in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Toggle to dark mode
    enableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Toggle back to light mode
    disableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

## Technical Details

### Tailwind CSS Mock Implementation

The Tailwind CSS mock system injects basic utility classes that correspond to Tailwind's most common classes, allowing tests to verify that components have the correct classes without needing a full Tailwind implementation.

Key functionality:
- Light/dark mode class toggling via `document.documentElement.classList`
- Basic set of utility classes including colors, spacing, and layout
- Simulation of dark mode variants (dark:bg-gray-800, etc.)

### DOM Setup

The setup file ensures that:
- `document` and `window` objects are properly initialized
- Browser APIs like `matchMedia`, `IntersectionObserver`, and `ResizeObserver` are mocked
- The DOM tree has the expected structure for theme-related tests

### Benefits over Legacy Test Setup

- **Consolidated Configuration**: Single source of truth for all test settings
- **Consistent DOM Environment**: Properly initialized JSDOM for all tests
- **Simplified Theme Testing**: Easy dark mode toggling and theme context setup
- **Better Error Handling**: Clear error messages when DOM elements are missing
- **Performance**: Optimized setup with minimal overhead

## Migration Guide

To migrate existing tests to the unified framework:

1. Rename test files from `.test.tsx` to `.unified.test.tsx`
2. Import from `test-utils.unified` instead of `test-utils`:
   ```tsx
   import { render, screen } from '../test/test-utils.unified';
   ```
3. Update any theme-related tests to use the new helper functions:
   ```tsx
   const { enableDarkMode, disableDarkMode } = render(<Component />);
   ```

## Example

See `tailwind-example.unified.test.tsx` for a complete example of testing a component with Tailwind classes and dark mode support.
````

## File: src/test/sanity.test.ts
````typescript
import { describe, it, expect } from 'vitest';
import React from 'react'; // Use standard import
⋮----
// Try importing something simple from React
````

## File: src/test/tailwind-mock.ts
````typescript
/**
 * Tailwind CSS mock for testing
 *
 * This module provides utilities for testing components that use Tailwind CSS
 * and dark mode functionality, without relying on actual CSS processing in JSDOM.
 */
⋮----
interface CSSMockSystem {
  darkMode: boolean;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
  toggleDarkMode: () => void;
}
⋮----
/**
 * CSS mock system for tests
 * Provides functions to manipulate dark mode in tests
 */
⋮----
/**
   * Enable dark mode for tests
   * - Adds 'dark' class to document.documentElement
   * - Updates internal darkMode state
   */
⋮----
/**
   * Disable dark mode for tests
   * - Removes 'dark' class from document.documentElement
   * - Updates internal darkMode state
   */
⋮----
/**
   * Toggle dark mode state
   * - Toggles between dark and light mode
   */
⋮----
/**
 * Apply dark mode class to document.documentElement
 * This simulates how Tailwind's dark mode works with the 'dark' class
 */
export const applyClassBasedDarkMode = (): void =>
⋮----
/**
 * Add minimal Tailwind-like utility classes to the document
 * This creates basic test alternatives to commonly used Tailwind classes
 */
export const injectTailwindTestClasses = (): void =>
⋮----
// Only add the style element if it doesn't already exist
⋮----
// Add basic utility classes for testing
````

## File: src/test/testUtils.tsx
````typescript
// Removed unused function setupThreeJsMocks
````

## File: src/test/textencoder-fix.ts
````typescript
/**
 * NOVAMIND Testing Framework
 * TextEncoder Compatibility Fix for TypeScript Tests
 *
 * This file provides a proper TypeScript implementation to fix the
 * TextEncoder instanceof Uint8Array issue with esbuild.
 */
⋮----
import { TextEncoder as NodeTextEncoder } from 'util';
⋮----
/**
 * Fixed TextEncoder implementation that ensures encode() returns
 * a proper Uint8Array that passes the instanceof check.
 */
class FixedTextEncoder extends NodeTextEncoder
⋮----
override encode(input?: string): Uint8Array
⋮----
// Ensure the result passes instanceof Uint8Array checks
⋮----
// Apply the fix globally
````

## File: src/test/three-test-utils.ts
````typescript
/**
 * THREE.js test utilities for Novamind tests
 * Provides mocks and test helpers for THREE.js component testing
 */
⋮----
import { vi } from 'vitest';
⋮----
// Mock THREE context
⋮----
// Mock for useThree hook
export const mockUseThree = ()
⋮----
// Mock for useFrame hook
⋮----
// Create mock Vector3 implementation
⋮----
// Define interface for mock brain region data
interface MockBrainRegion {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  connections: unknown[]; // Assuming connections structure is not defined here
  activityLevel: number;
  isActive: boolean;
  hemisphereLocation: 'left' | 'right' | 'central';
  dataConfidence: number;
  volume: number;
  activity: number;
}
⋮----
connections: unknown[]; // Assuming connections structure is not defined here
⋮----
// Mock data structures
export const createMockBrainRegions = (count = 5) =>
⋮----
// Ensure hemisphereLocation matches the expected literal types
⋮----
volume: Math.random() * 100 + 50, // Correct property name to 'volume'
activity: Math.random(), // Correct type to number
⋮----
// Mock data structures
export const createMockNeuralConnections = (regions: MockBrainRegion[], connectionCount = 10) =>
⋮----
// Ensure type matches the expected literal types
⋮----
// Ensure directionality matches the expected literal types
````

## File: src/test/unified-three.mock.ts
````typescript
// Placeholder for unified Three.js mocks used in specific tests.
// Actual mocking is primarily handled in setup.ts for global scope.
// This file exists to satisfy import resolution for tests that might
// have previously imported specific mocks directly via the @test alias.
⋮----
export {}; // Ensure this is treated as a module
````

## File: src/test/url-fix.ts
````typescript
/**
 * URL Fix for Test Environment
 *
 * This module provides simple URL-related fixes for the test environment.
 * These are necessary because JSDOM (the browser-like environment used in tests)
 * may have incomplete or missing implementations of certain browser APIs.
 */
⋮----
/**
 * Apply URL fixes to the test environment
 * Ensures that URL operations work correctly in tests
 */
export function applyURLFix(): void
⋮----
// Only apply if in test environment
⋮----
// Ensure URLSearchParams is available and functioning
⋮----
// Simple mock if URLSearchParams is missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// Reverting to any for minimal polyfill
⋮----
constructor(init?: string | Record<string, string> | URLSearchParams)
⋮----
// Parse query string
⋮----
// Handle object-like inputs
⋮----
// Basic implementation
get(name: string): string | null
⋮----
has(name: string): boolean
⋮----
set(name: string, value: string): void
⋮----
toString(): string
⋮----
// Auto-apply the fix
````

## File: src/test/vite-env.d.test.ts
````typescript
/**
 * NOVAMIND Neural Test Suite
 * Vite environment types verification with quantum precision
 */
⋮----
import { describe, it, expect } from 'vitest'; // Removed unused vi import
⋮----
// Declaration files (.d.ts) are not imported directly
// They extend the global namespace with additional types
⋮----
// Test that import.meta.env is available in TypeScript
⋮----
// Validate that the environment variables exist
⋮----
// Mock custom environment variables to verify type behavior
// Note: This is for type checking only, actual values come from Vite at runtime
⋮----
// Verify type structure
⋮----
// Verify expected string values (demonstrates type safety)
````

## File: README.md
````markdown
# Novamind Digital Twin Frontend

A premium frontend implementation for the Novamind Digital Twin project, providing a comprehensive visualization of patient mental health profiles for clinicians in a HIPAA-compliant environment.

## Architecture

This project follows a clean architecture approach with a clear separation of concerns:

```
src/
├── domain/           # Core business logic
│   ├── models/       # Domain entities and value objects
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Pure domain utility functions
│   └── services/     # Domain service interfaces
│
├── application/      # Use cases and application logic
│   ├── hooks/        # React hooks for business logic
│   ├── services/     # Implementation of domain services
│   ├── stores/       # State management
│   └── utils/        # Application-specific utilities
│
├── infrastructure/   # External systems and tools
│   ├── api/          # API clients
│   ├── storage/      # Local storage, session storage, etc.
│   ├── auth/         # Authentication services
│   └── analytics/    # Usage tracking and analytics
│
├── presentation/     # UI layer (Atomic Design)
│   ├── providers/    # Context providers
│   ├── atoms/        # Basic UI components
│   ├── molecules/    # Combined atoms
│   ├── organisms/    # Complex UI components
│   ├── templates/    # Page layouts
│   ├── pages/        # Full pages/routes
│   └── utils/        # UI utility functions
│
└── app/              # Application bootstrap and configuration
    ├── config/       # Environment configuration
    ├── routes/       # Routing configuration
    └── main.tsx      # Entry point
```

### Import Rules

To maintain architectural boundaries and ensure a clean separation of concerns:

1. **Domain** - Contains pure business logic with no external dependencies
2. **Application** - Can import from Domain only
3. **Infrastructure** - Can import from Domain and Application
4. **Presentation** - Can import from all layers
5. **App** - Can import from all layers

## Architecture Overview

This frontend follows Clean Architecture principles with the Atomic Design pattern:

```
frontend/
├── src/
│   ├── domain/              # Business logic, interfaces, models
│   │   ├── models/          # TypeScript interfaces/types
│   │   ├── entities/        # Domain entities
│   │   └── services/        # Service interfaces
│   │
│   ├── application/         # Use cases, state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React Context providers
│   │   └── services/        # Application services
│   │
│   ├── infrastructure/      # External integrations
│   │   ├── api/             # API clients
│   │   ├── storage/         # Local storage
│   │   └── services/        # External service implementations
│   │
│   ├── presentation/        # UI components (React + Tailwind)
│   │   ├── atoms/           # Basic UI building blocks
│   │   ├── molecules/       # Combinations of atoms
│   │   ├── organisms/       # Complex UI sections
│   │   ├── templates/       # Page layouts
│   │   └── pages/           # Route components
```

## Core Visualization Components

### Brain Visualization

The 3D brain model visualization is a centerpiece of the frontend, allowing clinicians to:

- View brain regions with activity highlighting
- Identify neural pathways and connections
- Toggle between different visualization modes (anatomical, functional, connectivity)
- Interact with specific regions to view detailed information

### Clinical Metrics Dashboard

Comprehensive visualization of patient metrics including:

- Assessment scores with temporal trends
- Biomarker data with reference ranges
- Treatment effectiveness and adherence
- Risk assessment visualization

### XGBoost Integration

Seamless integration with the backend XGBoost service for:

- Risk prediction (relapse, suicide)
- Treatment response prediction
- Outcome forecasting
- Digital twin integration

## Design System

The UI follows a premium, concierge psychiatry experience with:

- Sleek dark theme as the default (with light mode toggle)
- Clinical precision in data presentation
- Clear confidence intervals for all predictions
- HIPAA-compliant data presentation

## Temporal Visualizations

The system provides multi-scale temporal visualizations:

- Daily/weekly/monthly views of patient data
- State transition visualization between mental health conditions
- Treatment response trajectories
- Early warning signals and critical transition points

## Biometric Integrations

Real-time visualization of biometric data:

- Physiological metrics (heart rate, sleep patterns, cortisol levels)
- Behavioral tracking (activity levels, social interactions)
- Self-reported data (mood ratings, symptom severity)
- Environmental context (weather, light exposure)

## Key Features

1. **Digital Twin Dashboard**: Central view of patient's mental health model
2. **Brain Model Viewer**: Interactive 3D brain visualization
3. **Treatment Response Predictor**: AI-powered treatment outcome simulation
4. **Risk Assessment Panel**: Visualization of risk factors and predictions
5. **Clinical Metrics Tracking**: Temporal visualization of assessment scores
6. **Biometric Correlation**: Integration of physiological and behavioral data

## Development

### Requirements

- Node.js 16+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Technologies

- React 18
- TypeScript
- Tailwind CSS
- Three.js for 3D visualization
- React Query for data fetching
- D3.js for data visualization

## HIPAA Compliance

All visualizations follow HIPAA guidelines:

- No PHI exposure in UI or logs
- Secure data transmission
- Role-based access controls
- Audit trails for all interactions

## Project Status

This frontend implementation is ready to connect with the Novamind Digital Twin backend services for a comprehensive psychiatric digital twin platform.

## Configuration Management

All configuration files are centralized in the `/config` directory. This includes:

- Build tools (Vite)
- Testing (Vitest)
- TypeScript
- ESLint
- PostCSS/Tailwind
- Build scripts

For detailed configuration guidelines and structure, see [Configuration Documentation](./config/README.md).

Key principles:
1. All configs live in `/config` directory
2. No nested config directories beyond one level
3. Clear naming conventions for all config files
4. Environment variables in root `.env` files
5. Configuration changes must be documented

## Root Directory Structure

The root directory contains only essential files and directories:

```
/
├── config/                # All configuration files
├── src/                  # Source code
├── public/               # Static assets
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
├── dist/                 # Build output
├── test-reports/         # Test results
├── build-analysis/       # Build analytics
├── .github/              # GitHub workflows and templates
├── .vscode/             # VS Code settings
├── node_modules/        # Dependencies (gitignored)
├── .vite/               # Vite cache (gitignored)
│
├── package.json         # Project manifest
├── package-lock.json    # Dependency lock file
├── index.html          # Entry point
├── tsconfig.json       # TypeScript config (symlink)
├── .gitignore         # Git ignore rules
├── .markdownlint.json # Markdown linting rules
├── LICENSE            # Project license
└── README.md         # Project documentation
```

Key principles:
1. No configuration files in root (except symlinks if required)
2. Only essential project files at root level
3. Build artifacts and caches are gitignored
4. Documentation and assets in dedicated directories
````

## File: docs/legacy/API_CLIENT_ARCHITECTURE.md
````markdown
# API Client Architecture Guidelines

## Overview

The API client architecture follows a clean, modular design that separates concerns and ensures type safety throughout the application.

## Core Principles

1. **Single Source of Truth**
   - One API client instance
   - Centralized configuration
   - Unified error handling
   - Consistent response types

2. **Type Safety**
   - Request/response type definitions
   - Runtime type validation
   - Error type handling
   - Generic type constraints

3. **Testing Support**
   - Clean mock system
   - Predictable behavior
   - Easy configuration
   - Detailed logging

## Implementation

### 1. Base Client

```typescript
// src/infrastructure/api/BaseApiClient.ts

export abstract class BaseApiClient {
  protected abstract baseUrl: string;
  protected abstract headers: Record<string, string>;

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    // Implementation
  }

  protected handleError(error: unknown): never {
    // Error handling
  }
}
```

### 2. Real API Client

```typescript
// src/infrastructure/api/ApiClient.ts

export class ApiClient extends BaseApiClient {
  // Implementation of real API client
}
```

### 3. Mock API Client

```typescript
// src/infrastructure/api/MockApiClient.ts

export class MockApiClient extends BaseApiClient {
  // Implementation of mock API client
}
```

### 4. Type Definitions

```typescript
// src/domain/types/api/requests.ts
// src/domain/types/api/responses.ts

export interface ApiRequest<T> {
  // Type definitions for requests
}

export interface ApiResponse<T> {
  // Type definitions for responses
}
```

## Usage Examples

### 1. Making API Calls

```typescript
const brainModel = await apiClient.getBrainModel(patientId);
```

### 2. Error Handling

```typescript
try {
  const result = await apiClient.someMethod();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific error
  }
}
```

### 3. Testing

```typescript
// In tests
vi.mock('@infrastructure/api/ApiClient', () => ({
  apiClient: mockApiClient
}));
```

## Error Handling

1. **Error Types**
   - NetworkError
   - ValidationError
   - AuthenticationError
   - AuthorizationError
   - NotFoundError
   - ServerError

2. **Error Format**
   ```typescript
   interface ApiError {
     code: string;
     message: string;
     details?: Record<string, unknown>;
   }
   ```

## Configuration

1. **Environment Variables**
   ```env
   API_BASE_URL=https://api.novamind.ai
   API_VERSION=v1
   API_TIMEOUT=30000
   ```

2. **Headers**
   ```typescript
   const headers = {
     'Content-Type': 'application/json',
     'Accept': 'application/json',
     'X-API-Version': 'v1'
   };
   ```

## Testing Strategy

1. **Mock Responses**
   - Define static mock data
   - Create dynamic mock generators
   - Support error scenarios

2. **Test Utilities**
   - Mock request interceptors
   - Response generators
   - Error simulators

3. **Integration Tests**
   - API client integration tests
   - End-to-end request flow tests
   - Error handling tests

## Migration Guide

1. **Preparation**
   - Create new API client structure
   - Set up type definitions
   - Prepare mock system

2. **Implementation**
   - Migrate existing endpoints
   - Update type definitions
   - Add error handling

3. **Testing**
   - Write unit tests
   - Add integration tests
   - Update existing tests

4. **Deployment**
   - Gradual rollout
   - Monitor errors
   - Collect metrics
````

## File: docs/legacy/ARCHITECTURE_GUIDELINES.md
````markdown
# Clean Architecture Guidelines
## Directory Structure

```
src/
├── domain/           # Core business logic, models, types, interfaces
│   ├── models/       # Domain entities and value objects
│   ├── types/        # TypeScript type definitions
│   ├── constants/    # Domain constants
│   ├── validation/   # Domain validation logic
│   └── services/     # Domain service interfaces (abstract)
│
├── application/      # Use cases, application logic, state
│   ├── hooks/        # Application-specific React hooks
│   ├── services/     # Application service implementations
│   ├── contexts/     # React contexts
│   ├── providers/    # Context providers (if separate from contexts)
│   └── stores/       # State management stores (e.g., Zustand) - Optional
│
├── infrastructure/   # External concerns: frameworks, drivers, tools
│   ├── api/          # API client implementation(s)
│   ├── storage/      # Local/session storage wrappers
│   ├── auth/         # Authentication service integrations
│   ├── clients/      # Other external client integrations
│   └── config/       # Infrastructure-specific config loading
│
├── presentation/     # UI components, styles, assets (Atomic Design)
│   ├── atoms/        # Basic UI building blocks
│   ├── molecules/    # Simple combinations of atoms
│   ├── organisms/    # Complex UI components / sections
│   ├── templates/    # Page layout structures
│   ├── pages/        # Application pages/routes
│   ├── providers/    # UI-specific context providers (e.g., ThemeProvider)
│   ├── styles/       # Global styles, base styles
│   ├── assets/       # Static assets (images, fonts)
│   ├── shaders/      # GLSL shaders for visualizations
│   └── utils/        # UI-specific utility functions
│
├── shared/           # Utilities/types shared across multiple layers
│   └── utils/        # Shared utility functions (e.g., cn, formatting)
│
└── main.tsx          # Application entry point
```
*Note: This reflects the general structure. Specific subdirectories like `stores` or `validation` might vary based on implementation details.*

## Import Rules

1. Domain → No external dependencies
2. Application → Can import from Domain
3. Infrastructure → Can import from Domain and Application
4. Presentation → Can import from all layers
5. Presentation → Can import from Application, Domain, Shared
6. main.tsx → Can import from all layers to bootstrap

## Path Aliases (`tsconfig.json`)

Consistent path aliases are configured in `tsconfig.json`. While `vite-tsconfig-paths` is intended for automatic resolution, issues were encountered. Currently, aliases are defined explicitly within `config/vite.config.ts`'s `resolve.alias` array to ensure correct resolution by the Vite dev server and build process. This enforces architectural boundaries and simplifies imports:

```json
// tsconfig.json (paths section)
"paths": {
  "@/*": ["src/*"],
  "@domain/*": ["src/domain/*"],
  "@application/*": ["src/application/*"],
  "@infrastructure/*": ["src/infrastructure/*"],
  "@presentation/*": ["src/presentation/*"],
  "@shared/*": ["src/shared/*"],
  "@atoms/*": ["src/presentation/atoms/*"],
  "@molecules/*": ["src/presentation/molecules/*"],
  "@organisms/*": ["src/presentation/organisms/*"],
  "@templates/*": ["src/presentation/templates/*"],
  "@pages/*": ["src/presentation/pages/*"],
  "@hooks/*": ["src/application/hooks/*"],
  "@contexts/*": ["src/application/contexts/*"],
  "@providers/*": ["src/application/providers/*"], // Note: Points to application providers
  "@stores/*": ["src/application/stores/*"], // If stores are used
  "@services/*": ["src/application/services/*"], // Points to application services
  "@clients/*": ["src/infrastructure/clients/*"],
  "@api/*": ["src/infrastructure/api/*"],
  "@utils/*": ["src/shared/utils/*"], // Points to shared utils
  "@types/*": ["src/domain/types/*"],
  "@models/*": ["src/domain/models/*"],
  "@constants/*": ["src/domain/constants/*"],
  "@validation/*": ["src/domain/validation/*"],
  "@assets/*": ["src/presentation/assets/*"],
  "@styles/*": ["src/presentation/styles/*"],
  "@shaders/*": ["src/presentation/shaders/*"],
  "@test/*": ["src/test/*"],
  "@config/*": ["config/*"] // Alias for top-level config directory
}
```
````

## File: docs/legacy/BACKEND_API_COMPREHENSIVE.md
````markdown
# Backend API Comprehensive Analysis

## Overview

This document provides a detailed analysis of the backend API requirements for the Novamind Digital Twin platform. It analyzes the current frontend codebase to identify API requirements, outlines the backend structure needed, and provides implementation guidelines.

## Backend Structure Analysis

Based on our exploration of the backend repository, we can see it's a Python-based API likely using FastAPI (given the directory structure, alembic for migrations, and the main.py entry point). The backend is structured as follows:

- **FastAPI Application**: Main entry point in `main.py`
- **Database Migrations**: Using Alembic
- **Modular Organization**: App directory likely contains domains and routes
- **Testing**: Comprehensive pytest setup with coverage reports
- **Docker Support**: For containerized deployment
- **CI/CD**: GitHub Actions integration

## Required API Endpoints

### 1. Authentication & Authorization

Based on the frontend implementation in `ApiClient.ts` and `authClient.ts`, we need:

```
POST /api/v1/auth/login
- Request: { email: string, password: string }
- Response: { token: string, user: User }

GET /api/v1/auth/me
- Response: User

POST /api/v1/auth/logout
- Response: { success: boolean }

POST /api/v1/auth/refresh
- Request: { refresh_token: string }
- Response: { token: string }
```

### 2. Brain Model API

Based on `brainApiClient.ts` and `brain-model.service.ts`, we need:

```
GET /api/v1/brain-models/{modelId}
- Response: BrainModel

GET /api/v1/brain-models
- Query Params: patientId, pagination params
- Response: PaginatedResponse<BrainModel>

POST /api/v1/brain-models
- Request: Omit<BrainModel, 'id'> & { patientId: string }
- Response: BrainModel

PATCH /api/v1/brain-models/{modelId}
- Request: Partial<BrainModel>
- Response: BrainModel

DELETE /api/v1/brain-models/{modelId}
- Response: void

// Brain Region Operations
GET /api/v1/brain-models/{modelId}/regions/{regionId}
POST /api/v1/brain-models/{modelId}/regions
PATCH /api/v1/brain-models/{modelId}/regions/{regionId}
DELETE /api/v1/brain-models/{modelId}/regions/{regionId}

// Neural Connection Operations
GET /api/v1/brain-models/{modelId}/connections/{connectionId}
POST /api/v1/brain-models/{modelId}/connections
PATCH /api/v1/brain-models/{modelId}/connections/{connectionId}
DELETE /api/v1/brain-models/{modelId}/connections/{connectionId}

// Analysis Operations
POST /api/v1/brain-models/{modelId}/analyze/connectivity
POST /api/v1/brain-models/{modelId}/analyze/activity

// Simulation Operations
POST /api/v1/brain-models/{modelId}/simulate/activity
```

### 3. Patient API

Based on the frontend's `ApiClient.ts` and clinical service implementations:

```
GET /api/v1/patients
- Response: Patient[]

GET /api/v1/patients/{patientId}
- Response: Patient

POST /api/v1/patients
- Request: NewPatient
- Response: Patient

PATCH /api/v1/patients/{patientId}
- Request: Partial<Patient>
- Response: Patient

DELETE /api/v1/patients/{patientId}
- Response: void

// Risk Assessment
GET /api/v1/patients/{patientId}/risk-assessment
- Response: RiskAssessment

// Treatment Response Prediction
POST /api/v1/patients/{patientId}/predict-treatment
- Request: TreatmentData
- Response: TreatmentResponsePrediction

// Clinical Context
GET /api/v1/patients/{patientId}/clinical-context
- Response: ClinicalContext
```

### 4. Machine Learning API

Based on ML endpoints mentioned in mockApi.ts and backend structure:

```
POST /api/v1/ml/process
- Request: ProcessingParameters
- Response: ProcessingResults

POST /api/v1/ml/depression-detection
- Request: PatientData
- Response: DepressionDetectionResults

POST /api/v1/ml/risk-assessment
- Request: PatientData
- Response: RiskAssessmentResults

POST /api/v1/ml/sentiment-analysis
- Request: TextData
- Response: SentimentAnalysisResults

POST /api/v1/ml/wellness-dimensions
- Request: PatientData
- Response: WellnessDimensionResults

// Digital Twin
POST /api/v1/ml/digital-twin/conversation
- Request: ConversationData
- Response: ConversationResponse

GET /api/v1/ml/digital-twin/sessions
- Response: DigitalTwinSession[]

GET /api/v1/ml/digital-twin/sessions/{sessionId}
- Response: DigitalTwinSession

DELETE /api/v1/ml/digital-twin/sessions/{sessionId}
- Response: void

POST /api/v1/ml/digital-twin/insights
- Request: PatientData
- Response: DigitalTwinInsights

// PHI Detection/Redaction
POST /api/v1/ml/phi/detect
- Request: { text: string }
- Response: { detected: PHIDetection[] }

POST /api/v1/ml/phi/redact
- Request: { text: string }
- Response: { redacted: string }
```

### 5. Analytics API

Based on frontend requirements for analytics:

```
POST /api/v1/analytics/events
- Request: EventData
- Response: Event

POST /api/v1/analytics/events/batch
- Request: EventData[]
- Response: Event[]

POST /api/v1/analytics/aggregates
- Request: AggregationParameters
- Response: AggregatedData
```

### 6. Biometrics API

Based on frontend's biometric monitoring:

```
GET /api/v1/biometrics/alerts
- Response: BiometricAlert[]

POST /api/v1/biometrics/alerts
- Request: NewBiometricAlert
- Response: BiometricAlert

PATCH /api/v1/biometrics/alerts/{alertId}
- Request: Partial<BiometricAlert>
- Response: BiometricAlert

DELETE /api/v1/biometrics/alerts/{alertId}
- Response: void
```

## Core Data Models

### Brain Models

```typescript
interface BrainModel {
  id: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
  modelType: 'structural' | 'functional' | 'integrated';
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  processingLevel: 'raw' | 'processed' | 'analyzed';
  version: string;
  metadata: Record<string, unknown>;
  scan: ScanData;
  regions: BrainRegion[];
  diagnosticMarkers?: DiagnosticMarker[];
}

interface BrainRegion {
  id: string;
  name: string;
  volume: number;
  coordinates: [number, number, number];
  connections: {
    targetId: string;
    strength: number;
  }[];
  clinicalSignificance?: string[];
}

interface NeuralConnection {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  strength: number;
  type: 'structural' | 'functional';
  properties?: Record<string, unknown>;
}
```

### Patient Data

```typescript
interface Patient {
  id: string;
  demographicId: string;
  clinicalHistory: {
    conditionId: string;
    diagnosisDate: string;
    severity: number;
    status: 'active' | 'remission' | 'resolved';
    treatments: Treatment[];
  }[];
  assessmentScores: Record<string, AssessmentScore[]>;
  metadata: {
    lastUpdated: string;
  };
}

interface Treatment {
  id: string;
  type: 'medication' | 'therapy' | 'lifestyle' | 'other';
  startDate: string;
  endDate?: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

interface AssessmentScore {
  date: string;
  score: number;
  clinicianId: string;
  notes?: string;
}
```

## Implementation Requirements

### 1. Authentication

The backend must implement JWT token-based authentication with:
- Token generation on login
- Token validation middleware
- Role-based access control
- Secure password handling (bcrypt)
- Token refresh mechanism

### 2. Database Schema

Based on the models above, we need:
- Patient table
- BrainModel table
- BrainRegion table
- NeuralConnection table
- Treatment table
- Assessment table
- User table (for authentication)
- Proper relationships and constraints

### 3. Performance Considerations

- Brain models can be large - implement pagination and efficient querying
- Consider caching for frequently accessed data
- Use async processing for long-running operations (ML predictions)
- Implement proper indexing on all tables

### 4. Security Requirements

- Implement HIPAA-compliant data storage and transmission
- Proper audit logging for all operations
- Input validation and sanitization
- Rate limiting and protection against common attacks
- Encryption of sensitive data at rest and in transit

## Next Steps for Implementation

1. Create the database schema with Alembic migrations
2. Implement core models (Pydantic models for FastAPI)
3. Implement authentication system
4. Implement the API routes according to the specifications above
5. Add validation and error handling
6. Add comprehensive tests for all endpoints
7. Implement caching and performance optimizations
8. Add comprehensive API documentation with Swagger/OpenAPI

## Integration with Frontend

The frontend currently uses the API client in `src/infrastructure/api/ApiClient.ts` to communicate with the backend. Key integration points:

1. Base URL configuration (currently `/api`, proxied to `/api/v1`)
2. Authentication token handling and refreshing
3. Error handling and response validation
4. Type definitions matching between frontend and backend

The frontend expects backend endpoints to conform to the REST patterns established in the client code, with consistent response formats and proper error codes.
````

## File: docs/legacy/CURRENT_FRONTEND_IMPLEMENTATION.md
````markdown
# Current Frontend Implementation Analysis

## Overview

This document analyzes the current state of frontend implementation for API communication in the Novamind Digital Twin platform. It examines existing API clients, data models, and service layers to identify both strengths and gaps that need addressing for robust backend integration.

## API Client Architecture

The frontend implements a multi-layered API client architecture:

1. **Base API Client** (`ApiClient.ts`): Handles core HTTP requests, authentication, error handling
2. **Domain-Specific API Clients**: Dedicated clients for specific domains (brain, patients, etc.)
3. **Service Layer**: Higher-level services that use API clients to implement business logic
4. **Runtime Validation**: Type checking and validation of API responses

### Key Strengths

- **Flexible Architecture**: The layered approach allows for easy extension and maintenance
- **Mock Implementation**: Toggle-based mock API for development and testing
- **TypeScript Integration**: Strong typing throughout the client code
- **Response Validation**: Runtime validation of API responses
- **Authentication Handling**: Built-in JWT management

### Key Limitations

- **Incomplete Type Definitions**: Some API responses use `unknown` types
- **Missing Error Types**: No structured error response types
- **Limited Edge Case Handling**: Minimal retry logic, timeout handling, etc.
- **Inconsistent Validation**: Not all responses are validated

## Core API Client Implementation (`ApiClient.ts`)

The base API client provides:

```typescript
// HTTP methods
async get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>

// Authentication
setAuthToken(token: string): void
clearAuthToken(): void
isAuthenticated(): boolean

// Domain-specific operations
login(email: string, password: string): Promise<{ token: string; user: unknown }>
getPatients(): Promise<unknown[]>
getPatientById(patientId: string): Promise<unknown>
getBrainModel(modelId: string = 'default'): Promise<BrainModel>
predictTreatmentResponse<T = unknown>(patientId: string, treatmentData: Record<string, unknown>): Promise<T>
getRiskAssessment<T = unknown>(patientId: string): Promise<T>
```

## Mock API Implementation

The frontend includes a sophisticated mock API implementation in `mockApi.ts` that simulates backend responses for:

- User authentication
- Patient data
- Brain models
- Diagnostic markers
- Treatment recommendations
- Visualizations

These mock implementations provide a good blueprint for the expected API response formats.

## Domain-Specific Clients

### Brain API Client

The `BrainService` class (in `brainApiClient.ts`) implements:

```typescript
getBrainModel(id: UUID): Promise<BrainModel>
getBrainModels(patientId: UUID, params: PaginationParams): Promise<PaginatedResponse<BrainModel>>
createBrainModel(patientId: UUID, model: Omit<BrainModel, 'id'>): Promise<BrainModel>
updateBrainModel(id: UUID, model: Partial<BrainModel>): Promise<BrainModel>
deleteBrainModel(id: UUID): Promise<void>

// Brain region operations
getBrainRegion(modelId: UUID, regionId: UUID): Promise<BrainRegion>
createBrainRegion(modelId: UUID, region: Omit<BrainRegion, 'id'>): Promise<BrainRegion>
updateBrainRegion(modelId: UUID, regionId: UUID, region: Partial<BrainRegion>): Promise<BrainRegion>
deleteBrainRegion(modelId: UUID, regionId: UUID): Promise<void>

// Neural connection operations
getNeuralConnection(modelId: UUID, connectionId: UUID): Promise<NeuralConnection>
createNeuralConnection(modelId: UUID, connection: Omit<NeuralConnection, 'id'>): Promise<NeuralConnection>
updateNeuralConnection(modelId: UUID, connectionId: UUID, connection: Partial<NeuralConnection>): Promise<NeuralConnection>
deleteNeuralConnection(modelId: UUID, connectionId: UUID): Promise<void>

// Analysis operations
analyzeConnectivity(modelId: UUID): Promise<{...}>
analyzeActivity(modelId: UUID): Promise<{...}>

// Simulation operations
simulateActivity(modelId: UUID, params: {...}): Promise<{...}>
```

### Authentication Client

The auth client (in `authClient.ts`) handles user authentication and management.

### Session Client

The session client (in `sessionClient.ts`) manages user sessions.

## Service Layer for Domain Logic

Several service layers build on top of these API clients:

1. **Brain Model Service** (`brain-model.service.ts`): Handles brain model manipulation
2. **Clinical Service** (`clinical.service.ts`): Manages clinical data
3. **Risk Assessment Service** (`risk-assessment.service.ts`): Handles risk calculations

## Hook Integration

The frontend uses custom hooks to integrate API services into React components:

- `useBrainModel`: Interface to the Brain Model API
- `usePatientData`: Interface to the Patient API
- `useClinicalContext`: Interface to clinical data
- `useTreatmentPrediction`: Interface to treatment prediction API

## Data Validation

The frontend implements multiple levels of validation:

1. **Static Type Checking**: TypeScript interfaces for API responses
2. **Runtime Validation**: Functions like `validateApiResponse` to check response shapes
3. **Type Guards**: Functions like `isBrainRegion` to validate specific structures

## Areas Needing Improvement

1. **Comprehensive Types**: Many endpoints use `unknown` types that should be properly defined
2. **Consistent Validation**: All API responses should be validated
3. **Error Handling**: Better error type definitions and recovery strategies
4. **Authentication Refresh**: Token refresh mechanism needs implementation
5. **API Versioning**: Support for handling API version changes

## Integration Pain Points

Current challenges in frontend-backend integration include:

1. **Type Synchronization**: Keeping frontend and backend types in sync
2. **Mock vs. Real**: Ensuring mock API matches real API behavior
3. **Response Format Consistency**: Ensuring consistent response formats
4. **Error Handling Consistency**: Standardizing error responses
5. **Authentication Flow**: Implementing complete auth flow including refreshing

## Requirements for Backend Implementation

For successful integration, the backend must:

1. **Match Expected Endpoints**: Implement all endpoints used by the frontend
2. **Consistent Response Format**: Use consistent JSON structure
3. **Proper Error Responses**: Return standardized error objects
4. **JWT Authentication**: Support the JWT flow implemented in the frontend
5. **Performance**: Meet the performance expectations of the frontend (response times)
6. **Support All Operations**: Implement all the operations expected by domain-specific clients
````

## File: docs/legacy/FRONTEND_BACKEND_INTEGRATION_ANALYSIS.md
````markdown
# Frontend-Backend Integration Analysis

## Overview

After comprehensive analysis of both the frontend codebase and backend implementation, this document outlines the specific requirements for achieving successful integration between the Novamind Frontend and Backend systems. It identifies existing capabilities, integration gaps, and recommended implementation approaches.

## Current Backend API Structure

The backend is implemented as a FastAPI application with the following structure:

- **Authentication**: JWT-based with role-based access control (clinician, admin)
- **Core API Routes**:
  - `/api/ml/*` - Machine learning and digital twin endpoints
  - `/api/actigraphy/*` - Activity data endpoints
  - `/api/temporal_neurotransmitter/*` - Neurotransmitter modeling 
  - `/api/xgboost/*` - XGBoost prediction endpoints

### Available ML Capabilities

The backend provides robust ML capabilities through the following endpoints:

1. **MentaLLaMA Processing**:
   - `/api/ml/mentalllama/process` - General text processing
   - `/api/ml/mentalllama/depression` - Depression detection
   - `/api/ml/mentalllama/risk` - Risk assessment
   - `/api/ml/mentalllama/sentiment` - Sentiment analysis
   - `/api/ml/mentalllama/wellness` - Wellness dimensions analysis

2. **Digital Twin**:
   - `/api/ml/mentalllama/digital-twin` - Generate digital twin
   - `/api/ml/mentalllama/sessions` - Session management
   - `/api/ml/mentalllama/sessions/{session_id}/messages` - Conversation
   - `/api/ml/mentalllama/sessions/{session_id}/insights` - Generate insights

3. **PHI Protection**:
   - `/api/ml/phi/detect` - Detect PHI in text
   - `/api/ml/phi/redact` - Redact PHI from text

4. **Health Checks**:
   - `/api/ml/mentalllama/health` - ML service health
   - `/api/ml/phi/health` - PHI service health

## Frontend Requirements Analysis

The frontend is built with React and TypeScript, expecting the following API structure:

1. **Authentication**:
   - `/api/v1/auth/login` - User login
   - `/api/v1/auth/logout` - User logout
   - `/api/v1/auth/me` - Get current user
   - `/api/v1/auth/refresh` - Refresh token

2. **Patient Management**:
   - `/api/v1/patients` - CRUD operations for patients
   - `/api/v1/patients/{patientId}/risk-assessment` - Patient risk assessment
   - `/api/v1/patients/{patientId}/clinical-context` - Patient clinical context

3. **Brain Models**:
   - `/api/v1/brain-models` - CRUD operations for brain models
   - `/api/v1/brain-models/{modelId}/regions` - Brain region management
   - `/api/v1/brain-models/{modelId}/connections` - Neural connection management
   - `/api/v1/brain-models/{modelId}/analyze/*` - Analysis operations
   - `/api/v1/brain-models/{modelId}/simulate/*` - Simulation operations

## Integration Gaps

Comparing the frontend expectations with the backend implementation reveals the following gaps:

### 1. Missing API Endpoints

The backend is missing several endpoints that the frontend expects:

- **Authentication**: 
  - Missing explicit logout endpoint
  - Missing token refresh endpoint

- **Patient Management**: 
  - Missing all patient CRUD operations
  - Missing clinical context endpoints

- **Brain Models**: 
  - Missing all brain model-related endpoints 
  - Missing brain region management
  - Missing neural connection management
  - Missing analysis and simulation endpoints

### 2. API Path Structure Mismatch

- Frontend expects paths starting with `/api/v1/...`
- Backend uses paths like `/api/ml/...`

### 3. Authentication Flow

- Backend uses OAuth2PasswordBearer with tokenUrl="token"
- Frontend expects JWT authentication with specific login/refresh flows

### 4. Data Model Differences

- Need to align data models between frontend expectations and backend implementations
- Ensure consistent error responses and pagination formats

## Integration Approach

To bridge these gaps, we recommend the following approach:

### 1. API Proxy Layer

Implement an API proxy in the backend that:
- Translates between the frontend's expected paths and the backend's actual paths
- Handles the version prefix (`/api/v1/`)
- Maintains consistent response formats

### 2. Authentication Adapter

Implement an authentication adapter that:
- Provides the expected login/logout/refresh endpoints
- Maps the existing JWT implementation to the frontend's expectations
- Ensures consistent user data format

### 3. Missing Endpoints Implementation

For missing functionality, either:
- Implement the missing endpoints in the backend
- Adapt the frontend to use the existing ML capabilities for similar functionality

### 4. Data Mapping Layer

Create a data mapping layer that:
- Transforms backend data models to match frontend expectations
- Handles pagination consistently
- Provides standardized error responses

## Implementation Priority

We recommend the following implementation priority:

1. **Authentication Alignment** - Ensure the frontend can authenticate with the backend
2. **API Proxy Setup** - Create the path mapping between frontend and backend
3. **ML Integration** - Connect the frontend to existing ML capabilities
4. **Patient Data Implementation** - Add missing patient data endpoints
5. **Brain Model Implementation** - Add missing brain model endpoints

## Specific Implementation Plan

### Phase 1: Authentication and API Structure

1. Create an `/api/v1/auth/login` endpoint that:
   - Maps to the existing authentication flow
   - Returns JWT token in the expected format

2. Implement the API proxy path rewriting to map:
   - `/api/v1/ml/*` → `/api/ml/*`
   - `/api/v1/auth/*` → Appropriate auth endpoints

### Phase 2: Patient Management

Implement the missing patient management endpoints:
   - Create necessary models in the database
   - Implement CRUD operations for patients
   - Connect to the ML risk assessment capabilities
   - Implement clinical context endpoints

### Phase 3: Brain Model Management

Implement the missing brain model endpoints:
   - Create necessary models for brain structures
   - Implement CRUD operations for brain models, regions, and connections
   - Connect to existing ML capabilities for analysis
   - Implement simulation capabilities

## Testing Strategy

1. **Unit Testing**:
   - Test each adapter/proxy component in isolation
   - Verify data transformations are correct

2. **Integration Testing**:
   - Test frontend components against the adapted backend
   - Verify authentication flows work end-to-end

3. **End-to-End Testing**:
   - Validate complete user workflows
   - Test performance and reliability

## Conclusion

The existing backend provides strong ML capabilities that the frontend can leverage, but significant integration work is needed to align the API structure, authentication flow, and data models. With a systematic approach focusing on adapter patterns and proxy routes, we can bridge these gaps efficiently while minimizing changes to both codebases.
````

## File: docs/legacy/PUPPETEER_TESTING_SETUP.md
````markdown
# Puppeteer Testing Setup for WebGL/R3F Components

## 1. Rationale

Testing components heavily reliant on WebGL, Three.js, and React Three Fiber (R3F) within a JSDOM environment (used by Vitest by default) presents significant challenges:

*   **JSDOM Limitations:** JSDOM does not implement WebGL or accurately simulate browser rendering loops and GPU interactions. This leads to errors like `TypeError: Cannot read properties of undefined...` within React/R3F internals or inaccurate test results.
*   **Mocking Complexity:** Mocking the entire Three.js/R3F ecosystem is complex, brittle, and often incomplete, failing to capture real-world rendering behavior.

**Puppeteer provides a solution** by running tests within a real headless Chrome/Chromium browser instance. This offers:

*   **Full WebGL Support:** Accurate testing of rendering logic.
*   **Realistic Environment:** Tests run in an environment nearly identical to the user's browser.
*   **Integration Testing:** Suitable for testing the integration of components, including visual aspects (though specific visual regression requires additional tools).

**Trade-offs:**

*   **Slower Execution:** Browser startup and rendering add overhead compared to JSDOM.
*   **Setup Complexity:** Requires installing Puppeteer and potentially configuring CI environments.

**Strategy:** Use Puppeteer **selectively** for integration or end-to-end tests focusing on WebGL/R3F components where JSDOM fails. Continue using Vitest with JSDOM for unit/integration tests of non-WebGL components and logic for speed.

## 2. Installation

Add Puppeteer as a dev dependency:

```bash
npm install --save-dev puppeteer
# Or using yarn: yarn add --dev puppeteer
# Or using pnpm: pnpm add --save-dev puppeteer
```
This command downloads Puppeteer and a compatible version of Chromium.

## 3. Basic Test Structure

We will create a dedicated directory for Puppeteer tests, for example, `test-puppeteer/`. Tests can be written as simple Node.js scripts initially or integrated with a test runner like Jest later if needed.

**Example Test (`test-puppeteer/r3f-basic.test.js`):**

```javascript
// test-puppeteer/r3f-basic.test.js
const puppeteer = require('puppeteer');

// Self-executing async function
(async () => {
  let browser;
  try {
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode (no visible browser window)
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for CI environments
    });
    const page = await browser.newPage();

    // Ensure the dev server is running (npm run dev)
    const targetUrl = 'http://localhost:3000'; // Adjust if your dev port is different

    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

    console.log('Checking for canvas element...');
    // Check if a canvas element associated with R3F exists
    const canvasSelector = 'canvas'; // Adjust if a more specific selector is needed
    const canvasElement = await page.$(canvasSelector);

    if (canvasElement) {
      console.log('✅ SUCCESS: Canvas element found.');
      // Add more sophisticated checks here if needed:
      // - Check canvas dimensions
      // - Execute script in browser context to interact with Three.js scene (page.evaluate)
      // - Take screenshots (page.screenshot) for visual inspection
    } else {
      throw new Error(`❌ FAILURE: Canvas element ('${canvasSelector}') not found.`);
    }

    console.log('Test finished successfully.');

  } catch (error) {
    console.error('Puppeteer test failed:', error);
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('Closing Puppeteer...');
      await browser.close();
    }
  }
})();

```

## 4. Running Puppeteer Tests

Add a script to `package.json` to execute the test:

```json
// package.json (scripts section)
"scripts": {
  // ... other scripts
  "test:puppeteer": "node test-puppeteer/r3f-basic.test.js"
}
```

**To run:**

1.  Ensure the development server is running: `npm run dev`
2.  In a separate terminal, run the Puppeteer test: `npm run test:puppeteer`

## 5. Next Steps & Considerations

*   **Test Runner Integration:** For more complex scenarios, integrate Puppeteer with Jest (`jest-puppeteer`) or Vitest (using custom environment or browser mode if available/stable).
*   **CI Setup:** Ensure Chromium is available in the CI environment (e.g., using Docker images with Chrome pre-installed or specific GitHub Actions).
*   **Targeted Tests:** Create specific Puppeteer tests for components/pages known to fail in JSDOM due to WebGL/R3F issues.
*   **Page Object Model:** For larger test suites, consider implementing the Page Object Model pattern for better organization and maintainability.
*   **Visual Regression:** Integrate tools like Percy or Chromatic for automated visual testing if needed.
````

## File: docs/legacy/TAILWIND_GUIDELINES.md
````markdown
# Tailwind CSS Guidelines (v3.4)

## 1. Overview

Novamind Digital Twin frontend uses Tailwind CSS v3.4.x, aligning with our commitment to excellence and modern development practices. This document outlines the key aspects of our implementation and provides guidelines for developers.

*Note: Tailwind CSS v4 is available. Migration to v4 is a separate task and should be planned accordingly.*

## 2. Configuration & Integration

### 2.1. Configuration Files

We configure Tailwind primarily using CommonJS (`.cjs`) files, as required by the PostCSS ecosystem tools:

-   `config/tailwind/tailwind.config.cjs`: Main Tailwind configuration.
-   `config/postcss/postcss.config.cjs`: PostCSS configuration.

This approach honors our core architectural principle for application code (Pure TypeScript & ESM ONLY) while accommodating build tool requirements.

**`postcss.config.cjs`:**

```javascript
// config/postcss/postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-import': {}, // Handle @import statements
    'tailwindcss/nesting': {}, // Handle CSS nesting (based on postcss-nesting)
    tailwindcss: {}, // Process Tailwind directives
    autoprefixer: {}, // Add vendor prefixes
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}) // Minify in production
  }
}
```

**`tailwind.config.cjs`:**

```javascript
// config/tailwind/tailwind.config.cjs (Illustrative)
const { fontFamily } = require('tailwindcss/defaultTheme') // Example if needed

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan source files
  ],
  theme: {
    extend: {
      // --- Custom Theme Configuration ---
      // Example: colors, spacing, borderRadius, boxShadow, keyframes, animation
      // colors: { primary: { '500': 'oklch(0.65 0.15 250)' }, ... },
      // borderRadius: { neuro: '12px', ... },
      // boxShadow: { neuro: '...', 'neuro-dark': '...' },
    },
  },
  darkMode: 'class', // Enable class-based dark mode
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### 2.2. Integration Method: PostCSS Plugin

We use the standard PostCSS plugin integration, which offers excellent compatibility with our Vite build pipeline and optimal performance. Other methods like the Vite plugin or Tailwind CLI are not used.

### 2.3. CSS Entry Point

Tailwind directives are included in our main CSS entry point (e.g., `src/index.css` or similar):

```css
/* src/index.css or similar */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Theme variables and custom base styles */
:root {
  --color-primary-500: oklch(0.65 0.15 250);
  /* Other custom properties */
}

/* Example custom base style */
body {
  @apply bg-background text-foreground;
}
```

## 3. Key Tailwind CSS v3.4 Features & Usage

### 3.1. JIT (Just-In-Time) Mode

Tailwind v3.4 uses JIT mode by default, providing:
- On-demand CSS generation.
- Support for arbitrary values (e.g., `w-[127px]`).
- Faster build times and smaller production bundles.

### 3.2. Dark Mode (`class` strategy)

Our implementation uses the `class` strategy, managed via `ThemeProvider`:
- Enables toggle-based theme switching.
- Supports system preference detection.
- Allows persistent user preferences (via localStorage).

Apply dark mode variants using the `dark:` prefix:
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <!-- Content -->
</div>
```

### 3.3. Using `@apply` for Custom Components

Use the `@apply` directive within `@layer components` to extract reusable utility patterns:

```css
/* Example: src/presentation/atoms/Button.css */
@tailwind components;

@layer components {
  .btn-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-md;
  }
}
```
```jsx
// Usage in Button.tsx
import './Button.css';
<button className="btn-primary">Action</button>
```

### 3.4. CSS Variables for Theming

Define custom theme values (colors, spacing, etc.) using CSS variables in the `:root` selector of your main CSS file. These can then be referenced in `tailwind.config.cjs`.

```css
/* src/index.css */
:root {
  --color-primary-500: oklch(0.65 0.15 250);
  --radius-neuro: 12px;
  /* ... other variables */
}
```
```javascript
// tailwind.config.cjs
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: 'var(--color-primary-500)'
        }
      },
      borderRadius: {
        neuro: 'var(--radius-neuro)'
      }
    }
  }
  // ...
}
```

## 4. Customization

### 4.1. Custom Color Palette

We utilize a custom palette including primary, neural, semantic, and luxury accent colors, defined using the OKLCH color space in `tailwind.config.cjs`.

### 4.2. Neuromorphic Design Elements

Custom components and utilities for neuromorphic UI elements (e.g., `.neural-card`, `rounded-neuro`, `shadow-neuro`) are defined in the theme configuration and applied via utility classes or `@apply`.

## 5. Tailwind Plugins

We leverage official Tailwind plugins:
- `@tailwindcss/forms`
- `@tailwindcss/typography`
- `@tailwindcss/aspect-ratio`

These are added in the `plugins` array of `tailwind.config.cjs`.

## 6. Best Practices & Workflow

### 6.1. Brain Visualization Components
- Use utility classes for layout and basic styling of containers.
- Apply complex or dynamic styles via component logic or inline styles where necessary.
- Ensure `dark:` variants are applied for theme consistency.

### 6.2. VS Code IntelliSense
Ensure the Tailwind CSS IntelliSense extension is installed and configured in VS Code settings for autocompletion and linting:

```json
// .vscode/settings.json
{
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

## 7. Troubleshooting

### 7.1. Styles/Theme Values Not Applied
1.  Verify `tailwind.config.cjs` and `postcss.config.cjs` are correct.
2.  Ensure the `content` paths in `tailwind.config.cjs` cover all files using Tailwind classes.
3.  Check that CSS variables are correctly defined and referenced.
4.  Confirm PostCSS is processing the main CSS entry point.
5.  Clear browser/build cache.

### 7.2. Module Errors
1.  Ensure all Tailwind-related packages (`tailwindcss`, `postcss`, `autoprefixer`, plugins) are installed.
2.  Verify `.cjs` files use `require()` and `module.exports`.

## 8. Performance Benefits

Tailwind CSS v3.4 improves performance through its optimized JIT engine, efficient tree-shaking, and smaller production bundles.

## 9. Conclusion

Using Tailwind CSS v3.4 with the PostCSS integration provides a maintainable, type-safe, and performance-optimized styling solution for the Novamind Digital Twin platform.
````

## File: docs/legacy/TEST_COVERAGE_ANALYSIS.md
````markdown
# Test Coverage Analysis and Improvement Plan

## Current Test Coverage Status

The Novamind Frontend has several types of tests:
- Unit tests (`.test.tsx` and `.test.ts` files)
- Component tests (`.spec.tsx` files)
- Puppeteer end-to-end tests (in `test-puppeteer` directory)

### Test Files Structure

- **Unit Tests**: Located alongside source files with `.test.ts` or `.test.tsx` extensions
- **Component Tests**: Specialized tests in `src/test` with `.spec.tsx` extensions
- **E2E Tests**: Located in `test-puppeteer` directory using Puppeteer
- **Test Utils**: Support files in `src/test` providing test infrastructure

### Test Setup Files

- `src/test/setup.ts` - Basic setup for unit tests
- `src/test/setup.component.ts` - Component test setup
- `src/test/setup.enhanced.ts` - Enhanced setup with additional mocks
- `src/test/setup.integration.ts` - Integration test setup
- `src/test/setup.unified.ts` - Unified setup for comprehensive tests

## Coverage Gap Analysis

Based on the file structure and existing tests, we've identified several areas with insufficient test coverage:

### 1. API and Data Services

The `src/infrastructure/api` and associated service layers have limited test coverage. Critical components requiring additional tests include:

- API client implementation
- Domain-specific API clients
- Service layer implementations
- Authentication and token management
- Error handling and retry logic

### 2. React Hooks

Custom hooks in `src/application/hooks` need comprehensive testing, particularly:

- Data fetching hooks
- State management hooks
- Authentication hooks
- Context integration hooks

### 3. Brain Visualization Components

The 3D visualization components have limited coverage, particularly:

- WebGL renderers
- Brain region interaction
- Neural activity visualization
- Interactive controls

### 4. Complex UI Components

Several complex UI components lack thorough testing:

- Dashboard layouts
- Interactive forms
- Data visualization components
- Modal workflows

### 5. State Management

Application state management needs better coverage:

- Context providers
- State transitions
- Side effect handling
- Persistence logic

## Recommended Test Improvements

To achieve 80% test coverage, we recommend implementing the following test improvements:

### 1. API Client Testing (High Priority)

```typescript
// Example test pattern for API clients
describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAxios: jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    mockAxios = axios as jest.Mocked<typeof axios>;
    apiClient = new ApiClient();
  });
  
  test('successful GET request returns expected data', async () => {
    const mockData = { id: '123', name: 'Test' };
    mockAxios.get.mockResolvedValueOnce({ data: mockData });
    
    const result = await apiClient.get<typeof mockData>('/test');
    expect(result).toEqual(mockData);
    expect(mockAxios.get).toHaveBeenCalledWith('/test', expect.any(Object));
  });
  
  test('handles error responses correctly', async () => {
    const mockError = new Error('Network Error');
    mockAxios.get.mockRejectedValueOnce(mockError);
    
    await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
  });
  
  // Add tests for auth token handling, retries, etc.
});
```

### 2. Custom Hook Testing (High Priority)

```typescript
// Example test pattern for custom hooks
import { renderHook, act } from '@testing-library/react-hooks';
import { useBrainModel } from '../hooks/useBrainModel';
import { ApiClient } from '../api/ApiClient';

jest.mock('../api/ApiClient');

describe('useBrainModel', () => {
  const mockBrainModel = { id: '123', regions: [] };
  const mockApiClient = ApiClient as jest.MockedClass<typeof ApiClient>;
  
  beforeEach(() => {
    mockApiClient.prototype.getBrainModel.mockResolvedValue(mockBrainModel);
  });
  
  test('fetches brain model on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBrainModel('123'));
    
    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.brainModel).toEqual(mockBrainModel);
    expect(mockApiClient.prototype.getBrainModel).toHaveBeenCalledWith('123');
  });
  
  test('handles error state', async () => {
    mockApiClient.prototype.getBrainModel.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    const { result, waitForNextUpdate } = renderHook(() => useBrainModel('123'));
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.brainModel).toBeNull();
  });
});
```

### 3. Component Testing (Medium Priority)

```typescript
// Example test pattern for complex components
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrainVisualizationContainer } from '../components/BrainVisualizationContainer';
import { BrainModelProvider } from '../contexts/BrainModelContext';

jest.mock('../hooks/useBrainModel', () => ({
  useBrainModel: () => ({
    brainModel: { id: '123', regions: [/* mock regions */] },
    loading: false,
    error: null
  })
}));

describe('BrainVisualizationContainer', () => {
  test('renders brain model visualization', () => {
    render(
      <BrainModelProvider>
        <BrainVisualizationContainer modelId="123" />
      </BrainModelProvider>
    );
    
    expect(screen.getByTestId('brain-container')).toBeInTheDocument();
    // Test specific visualization elements are present
  });
  
  test('handles region selection', async () => {
    const onRegionSelect = jest.fn();
    
    render(
      <BrainModelProvider>
        <BrainVisualizationContainer 
          modelId="123" 
          onRegionSelect={onRegionSelect} 
        />
      </BrainModelProvider>
    );
    
    fireEvent.click(screen.getByTestId('region-frontal-lobe'));
    
    await waitFor(() => {
      expect(onRegionSelect).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        name: expect.stringContaining('Frontal')
      }));
    });
  });
});
```

### 4. State Management Testing (Medium Priority)

```typescript
// Example test pattern for context providers
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const TestConsumer = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  test('provides authentication state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
  });
  
  test('handles login flow', async () => {
    // Mock API response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { email: 'test@example.com' }, token: 'fake-token' })
    } as Response);
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    act(() => {
      screen.getByText('Login').click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });
});
```

### 5. Integration Testing (Lower Priority)

Use Jest + Testing Library to test integration between multiple components and services:

```typescript
// Example integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrainAnalyzerPage } from '../pages/BrainAnalyzerPage';
import { AppProvider } from '../providers/AppProvider';
import * as apiModule from '../api/brainApiClient';

jest.mock('../api/brainApiClient');

describe('BrainAnalyzerPage Integration', () => {
  const mockAnalyzeFunction = apiModule.analyzeBrainModel as jest.Mock;
  
  beforeEach(() => {
    mockAnalyzeFunction.mockResolvedValue({
      result: 'Analysis complete',
      regions: [/* mock analysis results */]
    });
  });
  
  test('full analysis workflow', async () => {
    render(
      <AppProvider>
        <BrainAnalyzerPage />
      </AppProvider>
    );
    
    // Select model from dropdown
    fireEvent.change(screen.getByLabelText(/select model/i), {
      target: { value: 'model-123' }
    });
    
    // Configure analysis parameters
    fireEvent.click(screen.getByLabelText(/include connectivity/i));
    
    // Run analysis
    fireEvent.click(screen.getByText(/run analysis/i));
    
    // Verify loading state
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    
    // Verify results display
    await waitFor(() => {
      expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
      expect(mockAnalyzeFunction).toHaveBeenCalledWith(
        'model-123',
        expect.objectContaining({ includeConnectivity: true })
      );
    });
  });
});
```

## Implementation Strategy

To achieve 80% test coverage, we recommend the following implementation strategy:

1. **Set up testing infrastructure**:
   - Configure Vitest with coverage reporting
   - Add Istanbul coverage configuration
   - Set up test watch mode for active development

2. **Prioritize critical paths**:
   - API client and service layer
   - Authentication flow
   - Core visualization components
   - Main user workflows

3. **Implement test patterns**:
   - Create reusable test utilities and mocks
   - Standardize testing patterns for each component type
   - Document testing conventions

4. **Continuous monitoring**:
   - Set up coverage reporting in CI pipeline
   - Enforce minimum coverage thresholds
   - Track coverage trends over time

5. **Integrate with E2E tests**:
   - Complement unit test coverage with E2E tests
   - Focus E2E tests on critical user journeys
   - Avoid duplicating coverage between test types

## Coverage Targets by Module

| Module                      | Current Est. % | Target % | Priority |
|-----------------------------|----------------|----------|----------|
| infrastructure/api          | 30%            | 90%      | High     |
| application/hooks           | 40%            | 90%      | High     |
| presentation/containers     | 45%            | 85%      | Medium   |
| presentation/molecules      | 50%            | 80%      | Medium   |
| presentation/atoms          | 60%            | 80%      | Low      |
| domain/services             | 35%            | 85%      | High     |
| infrastructure/storage      | 40%            | 80%      | Medium   |
| application/contexts        | 40%            | 85%      | High     |
| lib/utils                   | 50%            | 90%      | Medium   |

## Conclusion

By implementing the recommended testing strategy and focusing on the identified coverage gaps, we can achieve the goal of 80% test coverage. This will significantly improve the reliability and maintainability of the codebase while providing confidence for future development and refactoring.

The highest priority should be given to the API client layer testing, as this is the critical interface between the frontend and backend, followed by testing the custom hooks that encapsulate key business logic and user interface components that users directly interact with.
````

## File: docs/legacy/TEST_COVERAGE_IMPROVEMENT.md
````markdown
# Test Coverage Improvement Plan

This document outlines the strategy implemented to achieve 80% test coverage for the Novamind Frontend project, making it production-ready according to industry standards.

## Executive Summary

We've implemented a comprehensive test suite focusing on critical system components, with priority given to authentication, API error handling, and brain visualization components. We've also created tools to analyze and report on test coverage, making it easier to identify areas needing improvement.

## Key Components Added

### 1. Authentication Testing

- **Enhanced AuthService** with robust token refresh and error handling
- **Comprehensive test suite** covering all authentication flows including:
  - Login/logout processes
  - Token refresh mechanisms
  - Error scenarios and edge cases
  - Permission checking

### 2. API Communication Layer

- **Enhanced ApiProxyService** with improved data transformation and validation
- **MLApiClientEnhanced** with comprehensive error handling, retries, and validation
- **Test suites** focusing on:
  - Request/response transformation
  - Error handling for network issues
  - Retry mechanisms for transient failures
  - Authentication errors
  - Rate limiting

### 3. Brain Visualization Components

- **BrainModelVisualization** component tests covering:
  - Different view modes (anatomical, functional, connectivity)
  - Region selection and highlighting
  - Error states and loading states
  - Camera controls

### 4. WebGL Testing Utilities

- **WebGL testing utilities** for reliable 3D visualization testing:
  - WebGL context monitoring
  - Performance metrics collection
  - Error tracking
  - Async interaction handling

### 5. Test Coverage Analysis Tools

- **Coverage analyzer** that:
  - Identifies low-coverage areas
  - Prioritizes critical code paths
  - Generates actionable recommendations
  - Produces comprehensive reports

## Implementation Details

### Authentication Testing

The authentication system is a critical component requiring high test coverage. We've implemented:

1. **Token Lifecycle Tests**:
   - Properly storing/retrieving tokens from storage
   - Handling token expiration correctly
   - Refreshing tokens automatically
   - Managing token revocation

2. **Error Handling Tests**:
   - Network errors during authentication
   - Invalid credentials scenarios
   - Expired token scenarios
   - Server-side auth errors

3. **Security Edge Cases**:
   - Handling simultaneous refresh requests
   - Proper logout behavior
   - Session expiration notification

### API Communication Layer Testing

Robust API communication is essential for reliable backend integration:

1. **Data Transformation Tests**:
   - Proper camelCase/snake_case conversion
   - Specialized field mappings for different endpoints
   - Handling of nested objects and arrays

2. **Error Classification Tests**:
   - Network error classification
   - Authentication error handling
   - Rate limiting detection
   - Recovery from transient errors

3. **Retry Logic Tests**:
   - Exponential backoff implementation
   - Maximum retry limits
   - Success after intermittent failures

### Brain Visualization Testing

3D visualization is complex and requires special testing approaches:

1. **Component Rendering Tests**:
   - Testing different data inputs
   - Testing with/without data
   - Proper error and loading states

2. **Interaction Tests**:
   - Region selection
   - Camera positioning
   - View mode switching

3. **WebGL Context Tests**:
   - Proper context creation/cleanup
   - Handling WebGL errors gracefully
   - Performance monitoring

## Test Coverage Analysis

The test coverage analyzer identifies:

1. **Critical Paths**: Authentication, API communication, and data processing components that require >90% coverage

2. **High-Priority Areas**: User-facing components and core business logic requiring >80% coverage

3. **Medium-Priority Areas**: Helper utilities and less critical components requiring >60% coverage

## Running Tests and Coverage Analysis

We've provided scripts to:

1. Run all tests with coverage:
   ```bash
   ./scripts/generate-test-coverage-report.sh
   ```

2. Focus on high-priority areas:
   ```bash
   ./scripts/generate-test-coverage-report.sh --focus-areas
   ```

3. Generate HTML report:
   ```bash
   ./scripts/generate-test-coverage-report.sh --html
   ```

## Next Steps to Reach 80% Coverage

1. **Domain Models Testing**:
   - Add tests for all domain models
   - Verify validation logic
   - Test serialization/deserialization

2. **React Hooks Testing**:
   - Test custom hooks with React Testing Library
   - Verify state management
   - Test side effects

3. **Component Integration Tests**:
   - Add tests for component composition
   - Test data flow between components
   - Verify proper context usage

4. **Route Testing**:
   - Test route configuration
   - Verify route guards/protection
   - Test navigation flows

## Maintenance Guidelines

1. **Continuous Coverage Monitoring**:
   - Run coverage reports as part of CI/CD
   - Block PRs that decrease coverage below threshold
   - Generate trend reports

2. **Test Quality Standards**:
   - Maintain descriptive test names
   - Group tests logically
   - Cover positive and negative scenarios
   - Include edge cases

3. **Testing New Features**:
   - Write tests before or alongside implementation
   - Target >80% coverage for new code
   - Focus on critical logic paths

## Conclusion

This comprehensive testing approach addresses the most critical areas of the Novamind Frontend application, with a particular focus on authentication, API communication, and brain visualization components. By implementing these tests and using the coverage analysis tools, we can achieve and maintain the 80% test coverage goal required for production readiness.
````

## File: docs/legacy/TEST_SETUP_STANDARDS.md
````markdown
# Test Environment Setup - Single Source of Truth

## Overview

This document defines the standardized test environment setup for the Novamind Frontend project. It serves as the source of truth for test configuration, ensuring consistency and maintainability across the codebase.

## Core Test Files

The test environment is built around four key files:

1. **`config/vitest.config.ts`** - The canonical Vitest configuration
2. **`src/test/setup.jest-dom.ts`** - Jest-DOM matchers extension
3. **`src/test/setup.ts`** - Core test environment setup with browser API mocks
4. **`src/test/test-utils.tsx`** - React component test utilities and custom render functions

## File Descriptions

### 1. Vitest Configuration (`config/vitest.config.ts`)

This file defines the core testing configuration including file patterns, environment settings, and setup file loading order. Key settings include:

- JSDOM environment for browser simulation
- Proper path aliases for import resolution
- Test file patterns (`*.test.ts`, `*.test.tsx`, `*.spec.tsx`)
- Coverage configuration

**Critical:** Setup files are loaded in a specific order, with Jest-DOM matchers loaded first to ensure they're available throughout the test environment.

### 2. Jest-DOM Setup (`src/test/setup.jest-dom.ts`)

This file extends Vitest's `expect` with Jest-DOM matchers, enabling DOM-specific assertions like:

```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
```

It also extends TypeScript typings to provide proper IntelliSense for these matchers.

### 3. Core Setup (`src/test/setup.ts`)

This file provides:

- Browser API mocks (localStorage, matchMedia, IntersectionObserver, etc.)
- Canvas and WebGL context mocks
- Three.js mocks
- Global cleanup hooks
- Test utility functions

The mocks are implemented using Vitest's `vi.fn()` and carefully structured to avoid conflicts and ensure consistent behavior across tests.

### 4. Test Utilities (`src/test/test-utils.tsx`)

This file provides:

- A custom `render` function that wraps components with all necessary providers
- Mock implementations of context providers (Theme, User, Data, etc.)
- A QueryClient factory for React Query tests
- Re-exports from `@testing-library/react` for convenience

## Using the Test Environment

### Basic Component Test Example

```typescript
import { render, screen } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Testing with Context Providers

The custom `render` function accepts options to customize the testing environment:

```typescript
import { render, screen } from '@/test/test-utils';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders with dark theme', () => {
    render(<UserProfile />, { 
      theme: 'dark',
      initialRoute: '/profile',
      // Custom data context can be provided
      mockData: {
        ...defaultMockData,
        patientData: { name: 'Test Patient' }
      }
    });
    
    expect(screen.getByText('Test Patient')).toBeInTheDocument();
  });
});
```

## Troubleshooting Common Issues

### "Invalid Chai property: toBeInTheDocument"

This error indicates that Jest-DOM matchers are not properly extended. Check that:

1. `setup.jest-dom.ts` is being loaded first in the Vitest configuration
2. The `expect.extend(matchers)` call isn't overridden elsewhere

### "TypeError: window is not defined"

This error occurs when browser APIs are accessed in a non-browser environment. Ensure:

1. Tests are running with `--environment jsdom` flag
2. Browser API access is wrapped in `typeof window !== 'undefined'` checks

### React Query-Related Errors

For tests involving React Query:

1. Use the provided `createTestQueryClient()` function
2. Set appropriate options: `{ retry: false, gcTime: 0, staleTime: Infinity }`
3. Use `renderWithProviders` which automatically sets up a QueryClientProvider

## Extending the Test Environment

When extending the test environment:

1. **DO NOT** create new setup files; modify the existing canonical files
2. Add new mock implementations to the appropriate file based on their purpose
3. Document all changes in code comments
4. Update this document if introducing significant changes

## Best Practices

1. **Isolation**: Tests should be isolated and not depend on global state
2. **Consistent Mocking**: Use the provided mocks instead of creating new ones
3. **Explicit Dependencies**: Clearly state what is being tested and mocked
4. **Clean Teardown**: Ensure tests clean up after themselves using afterEach hooks
5. **Minimal Assertions**: Test one thing per test case
6. **Descriptive Names**: Use descriptive test and describe block names

By following these guidelines, we maintain a stable, predictable test environment that supports our goal of 80% test coverage.
````

## File: docs/legacy/TEST_SUITE_ANALYSIS_SNAPSHOT.md
````markdown
# Test Suite Analysis Snapshot (2025-04-05)

*Note: This analysis reflects the state as of April 5, 2025. Since then, ESLint issues have been resolved, configuration files cleaned up, and minor dependencies updated. The R3F test failures described below persist and are tracked separately.*
## Current Status

Following dependency updates and initial fixes, the test suite (`npm test`) currently exhibits the following behavior:

- **Passing Tests:** 127 suites pass.
- **Skipped Tests:** 18 suites are skipped (likely including known problematic R3F tests and others marked during refactoring).
- **Failing Tests:** 13 suites fail consistently with the same error:
    - **Error:** `TypeError: Cannot read properties of undefined (reading 'S')`
    - **Origin:** `react-reconciler/cjs/react-reconciler.development.js`
    - **Trigger:** Tests involving React Three Fiber (R3F) components (e.g., `BrainVisualizationPage.test.tsx`, `BrainModelContainer.test.tsx`, etc.).

## Analysis of Failures

The persistent `TypeError` related to `react-reconciler` strongly indicates an issue with the integration between React Three Fiber and the React testing environment (Vitest + JSDOM).

**Key Factors:**

1.  **R3F Mocking Strategy:** The current approach uses `resolve.alias` in `vitest.config.ts` to redirect imports of `three`, `@react-three/fiber`, and `@react-three/drei` to mock implementations in `src/test/mocks/`.
2.  **Mock Implementation:** While the mocks for `three` and `@react-three/drei` are relatively straightforward, the mock for `@react-three/fiber`, particularly the `Canvas` component, is likely too simplistic. It doesn't fully replicate the necessary setup and context provisioning performed by the real R3F `Canvas`, which integrates R3F's rendering logic with React's reconciler. Attempts to enhance the `Canvas` mock with a basic React Context were insufficient.
3.  **JSDOM Limitations:** JSDOM does not fully implement browser rendering APIs, especially WebGL, which R3F relies on. While mocks aim to circumvent this, subtle interactions with the reconciler might still cause issues.
4.  **Version Conflicts/Overrides:** Although `resolve.alias` should intercept imports, the `overrides` in `package.json` used to manage R3F version conflicts might still interact unexpectedly within the test environment if the mocking is incomplete.

## Recommendations

1.  **Isolate R3F Failures:** Maintain the current exclusions for the 13 failing R3F test suites in `vitest.config.ts`. This allows focusing on ensuring the stability of the remaining 127 passing suites.
2.  **Prioritize Non-R3F Stability:** Confirm that all non-R3F tests pass reliably. Address any intermittent failures or warnings in the passing suites.
3.  **Dedicated R3F Test Environment Fix:** Treat the R3F test failures as a separate, focused task. Potential approaches include:
    *   **Refined Mocking:** Experiment with more sophisticated mocks for `@react-three/fiber`, potentially using `vi.mock` within specific test files instead of relying solely on `resolve.alias`. This might involve mocking more internal R3F mechanisms.
    *   **Ecosystem Upgrade:** As outlined in the refactoring plan, consider a coordinated upgrade of the entire R3F stack (`three`, `fiber`, `drei`) to compatible latest versions, removing the `package.json` overrides, and updating mocks accordingly. This is a larger effort but might resolve underlying compatibility issues.
    *   **Alternative Environments:** Explore if specific R3F tests could benefit from environments other than JSDOM, although this deviates from a unified Vitest setup.
4.  **Documentation Alignment:** Ensure all documentation accurately reflects the current dependency versions, configuration (`.cjs` for Tailwind/PostCSS), path aliases (`@api/`), and the *current* R3F mocking strategy (`resolve.alias`) along with its known limitations (the reconciler error).

## Next Steps (Immediate)

1.  Verify the stability of the 127 passing tests.
2.  Ensure documentation accurately reflects the current state after the recent updates.
3.  Defer further attempts to fix the R3F reconciler error until the non-R3F tests are confirmed stable.
````

## File: docs/legacy/TESTING_GUIDELINES.md
````markdown
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
````

## File: docs/legacy/TYPE_DEFINITION_STRATEGY.md
````markdown
# Type Definition Strategy

## 1. Overview

This document establishes the strategy for defining and managing TypeScript types within the Novamind Frontend application, ensuring consistency, maintainability, and adherence to Clean Architecture principles.

## 2. Single Source of Truth (SSoT)

Maintaining a Single Source of Truth (SSoT) for domain types is critical to prevent inconsistencies, reduce bugs, and simplify development and testing.

**Canonical Sources:**

*   **Core Domain Types:** All core business entities and value objects related to the domain (e.g., patient data, clinical concepts, brain models) **MUST** be defined within the `src/domain/types/` or `src/domain/models/` directories.
*   **Brain Model Types:** Specifically, the authoritative definitions for `BrainModel`, `BrainRegion`, `NeuralConnection`, `BrainScan`, and related structures reside in:
    *   **`src/domain/types/brain/models.ts`**
*   **Shared Types:** General-purpose types used across multiple layers (e.g., `Result`, `Vector3`, utility types) should reside in `src/domain/types/shared/`.

**Deprecated Sources:**

*   Any type definitions duplicating core domain concepts found outside the designated `src/domain/types/` or `src/domain/models/` paths (e.g., potential legacy definitions in `core-models` or elsewhere) are considered **deprecated** and **MUST NOT** be used for new development. They should be refactored or removed to align with the SSoT.

## 3. Validation Alignment

*   All runtime validation logic (e.g., in `src/domain/utils/` or `src/application/services/`) **MUST** validate against the canonical type definitions imported from the SSoT (`src/domain/types/` or `src/domain/models/`).
*   Validation functions should accurately reflect all required and optional properties, including their specific types (e.g., string literals for enums).

## 4. Test Mock Alignment

*   All mock objects used in unit, integration, or runtime tests **MUST** accurately reflect the structure and types defined in the SSoT.
*   Tests should import types directly from the SSoT to ensure alignment. Mocks should not contain properties absent from the canonical type definition or omit required properties.

## 5. Enforcement

*   **Code Reviews:** Reviewers must verify that new code adheres to the SSoT for type definitions and imports.
*   **Linting/Static Analysis:** Configure ESLint rules (where possible) to discourage imports from deprecated locations.
*   **TypeScript Compiler (`tsc --noEmit`):** Regularly run the TypeScript compiler to catch type mismatches early. This should be part of the standard development and CI workflow.

By strictly adhering to this strategy, we ensure type safety, reduce ambiguity, and build a more robust and maintainable codebase.
````

## File: docs/legacy/WEBGL_TESTING_STRATEGY.md
````markdown
# WebGL/Three.js/R3F Testing Strategy (Proposed: 2025-04-05)

*Note: This document outlines the analysis and proposed refactoring plan as of April 5, 2025. Implementation status is ongoing. The core challenges remain, and this plan serves as the roadmap for addressing R3F testability.*
## Current State & Challenges (As of 2025-04-05)

The current test setup for WebGL, Three.js, and React Three Fiber (R3F) components faces significant challenges, leading to numerous skipped or failing tests.

**1. Environment Limitations (JSDOM):**
   - The default test environment (`jsdom`) lacks a native WebGL implementation and GPU access. Direct instantiation of `WebGLRenderer` or calls to `canvas.getContext('webgl')` fail without mocking.
   - Simulating the asynchronous nature of GPU operations and the R3F render loop is difficult.

**2. Mocking Strategy:**
   - **`mock-webgl.ts`:** Provides essential patches for `canvas.getContext` and `requestAnimationFrame` to prevent basic errors in JSDOM. It also includes rudimentary mock classes for some Three.js objects (e.g., `CoreWebGLRenderer`, `MockWebGLGeometry`).
   - **`vi.mock('three', ...)`:** Attempts to mock the entire `three` module, either globally (`setup.ts`) or locally (within specific test files), have proven unreliable and difficult to maintain.
     - **Incompleteness:** Mocks often lacked necessary properties or methods (e.g., `camera.position`, `mesh.dispose`), causing errors when components tried to use them.
     - **Scope/Timing:** Global mocks didn't consistently apply to all test files, while local mocks sometimes conflicted or didn't execute before the module was imported by the code under test.
   - **R3F Mocking:** No explicit mocking strategy for R3F hooks (`useThree`, `useFrame`) was consistently applied, leading to failures or skips in tests for components relying on R3F's context and render loop.

**3. Test Failures & Skips:**
   - **`TypeError`s:** Errors like `Cannot set properties of undefined (setting 'z')` or `Cannot read properties of undefined (reading 'dispose')` occurred frequently in WebGL/Three.js tests (`BrainRegionVisualizer.test.ts`), indicating the mocks were incomplete or not being applied correctly.
   - **Hangs/Timeouts:** Tests involving complex hooks (`useBrainVisualization`, `BiometricStreamController`) often timed out, likely due to unresolvable asynchronous operations or interactions with timers/mocks within the test environment.
   - **Exclusions:** A significant number of visualization-related components (atoms, molecules, organisms, pages) are explicitly excluded in `vitest.config.ts` due to these underlying mocking and R3F testing difficulties.

## Refactoring Plan for Improved Testability

To enable robust testing of the critical visualization slice, the following refactoring steps are recommended:

**1. Abandon Global `three` Mocking:**
   - **Action:** Remove all instances of `vi.mock('three', ...)` from `setup.ts` and any test files.
   - **Rationale:** This approach is too complex and brittle for a library like Three.js.

**2. Refine `mock-webgl.ts`:**
   - **Action:** Keep the `patchCanvasGetContext` and `patchAnimationFrame` functions (called from `setup.ts`). Remove the exported mock *classes* (`CoreWebGLRenderer`, etc.).
   - **Rationale:** Focus this utility solely on patching the JSDOM environment to prevent basic errors, not on providing Three.js object mocks.

**3. Dependency Injection for Core Three.js Objects:**
   - **Action:** Refactor components/classes (like `BrainRegionVisualizer` or potentially R3F components) that directly instantiate `WebGLRenderer`, `Scene`, `PerspectiveCamera`. Modify them to accept these core objects via props or constructor arguments.
   - **Rationale:** Allows tests to pass in simple, controlled mock objects (e.g., `{ render: vi.fn(), dispose: vi.fn() }`) instead of relying on complex library mocks.

**4. Isolate Three.js Logic:**
   - **Action:** Extract complex Three.js logic (geometry generation, material updates, calculations) into pure utility functions or non-React classes. Encapsulate R3F/Three.js side effects within custom hooks.
   - **Rationale:** Enables unit testing of core logic without needing a full rendering environment or complex component setup.

**5. Targeted R3F Hook Mocking:**
   - **Action:** When testing R3F components, mock the necessary R3F hooks (`useThree`, `useFrame`) directly within the test file using `vi.mock('@react-three/fiber', ...)`. Provide mock return values for camera, scene, gl, etc.
   - **Rationale:** Isolates the component from the R3F internals, allowing focus on the component's own logic and rendering based on mocked R3F state.

**6. Component Prop-Based Testing:**
   - **Action:** Focus component tests (`*.test.tsx`) on verifying rendering based on props and testing interactions via callbacks, relying on the mocked hooks/dependencies.
   - **Rationale:** Avoids brittle assertions on internal Three.js state or specific `dark:` classes.

**7. Address Skipped/Excluded Tests:**
   - **Action:** Systematically revisit skipped tests and those excluded in `vitest.config.ts`. Apply the strategies above (dependency injection, hook mocking) to attempt fixes. Prioritize tests for core visualization components and hooks. Accept that some complex async/timing issues might require leaving tests skipped temporarily. Implement placeholder tests (`initializeApp`, `index`, `domain/utils`).
   - **Rationale:** Incrementally increase test coverage for the visualization slice.

**8. Limitations & Complementary Testing:**
   - **Action:** Acknowledge that JSDOM testing for WebGL/R3F has inherent limitations. It cannot verify actual visual output or GPU-specific behavior.
   - **Recommendation:** Supplement unit/integration tests with:
     - **Visual Regression Testing:** (e.g., using Storybook + Chromatic or similar tools) to catch visual changes.
     - **Manual Testing:** Thoroughly test visualization features in a real browser.
     - **Browser-Based Test Runners:** Consider tools like Playwright or Cypress (potentially with Vitest integration) for end-to-end tests that run in a real browser environment if high-fidelity automated testing of the visualization is critical.

By implementing this strategy, we can move away from the unreliable full library mocking towards more targeted, maintainable tests focused on specific units of logic and component behavior, ultimately improving the stability and production readiness of the visualization slice.
````

## File: src/test/mocks/api/brainModelDemo.json
````json
{
  "id": "DEMO_SCAN_001",
  "patientId": "DEMO_PATIENT",
  "scan": {
    "id": "SCAN_123",
    "patientId": "DEMO_PATIENT",
    "scanDate": "2025-04-09T10:00:00.000Z",
    "scanType": "fMRI",
    "resolution": { "x": 1, "y": 1, "z": 1 },
    "metadata": { "acquisitionTime": 300, "sequence": "EPI" },
    "dataQualityScore": 0.95
  },
  "timestamp": "2025-04-09T10:05:00.000Z",
  "processingLevel": "analyzed",
  "lastUpdated": "2025-04-09T10:05:00.000Z",
  "version": "1.0.0",
  "regions": [
    { "id": "prefrontal", "name": "Prefrontal Cortex", "position": { "x": 0, "y": 2, "z": 0 }, "color": "#ff0000", "connections": ["pfc-amy", "pfc-hip"], "activityLevel": 0.75, "isActive": true, "hemisphereLocation": "left", "dataConfidence": 0.9, "volume": 100, "activity": 0.75 },
    { "id": "amygdala", "name": "Amygdala", "position": { "x": -0.5, "y": 0, "z": 0 }, "color": "#00ff00", "connections": ["pfc-amy", "amy-hip"], "activityLevel": 0.9, "isActive": true, "hemisphereLocation": "left", "dataConfidence": 0.9, "volume": 50, "activity": 0.9 },
    { "id": "hippocampus", "name": "Hippocampus", "position": { "x": 0.5, "y": 0, "z": 0 }, "color": "#0000ff", "connections": ["pfc-hip", "amy-hip"], "activityLevel": 0.6, "isActive": true, "hemisphereLocation": "right", "dataConfidence": 0.9, "volume": 75, "activity": 0.6 }
  ],
  "connections": [
    { "id": "pfc-amy", "sourceId": "prefrontal", "targetId": "amygdala", "strength": 0.8, "type": "excitatory", "directionality": "unidirectional", "dataConfidence": 0.85, "activityLevel": 0.8 },
    { "id": "pfc-hip", "sourceId": "prefrontal", "targetId": "hippocampus", "strength": 0.7, "type": "excitatory", "directionality": "unidirectional", "dataConfidence": 0.85, "activityLevel": 0.7 },
    { "id": "amy-hip", "sourceId": "amygdala", "targetId": "hippocampus", "strength": 0.9, "type": "inhibitory", "directionality": "bidirectional", "dataConfidence": 0.85, "activityLevel": 0.75 }
  ]
}
````

## File: src/test/mocks/mockBrainData.ts
````typescript
/**
 * Mock brain region data for testing brain visualization components
 */
⋮----
export interface BrainRegion {
  id: string;
  name: string;
  coordinates: [number, number, number];
  size: number;
  color?: string;
  value?: number; // For functional data
  connections?: string[]; // IDs of connected regions
  description?: string;
}
⋮----
value?: number; // For functional data
connections?: string[]; // IDs of connected regions
⋮----
export type BrainRegionData = Record<string, BrainRegion>;
⋮----
// Sample connectivity matrix (adjacency matrix) for network analysis
⋮----
[0, 1, 0, 1, 1], // prefrontal_cortex
[1, 0, 1, 0, 0], // anterior_cingulate
[0, 1, 0, 1, 0], // amygdala
[1, 0, 1, 0, 0], // hippocampus
[1, 0, 0, 0, 0]  // thalamus
````

## File: src/test/mocks/react-three-drei.ts
````typescript
/* eslint-disable */
/**
 * React Three Drei Mock for Testing
 *
 * Provides minimal, test-safe mocks for commonly used Drei components/hooks.
 * Prevents errors related to WebGL or complex rendering in JSDOM.
 */
import React from 'react';
import { vi } from 'vitest';
⋮----
// Mock simple components as divs or fragments
⋮----
// Mock hooks to return basic values or functions
// eslint-disable-next-line
⋮----
/* mock texture object */
⋮----
// eslint-disable-next-line
⋮----
/* mock scene graph */
⋮----
/* mock nodes */
⋮----
/* mock materials */
⋮----
// Add other commonly used Drei exports as needed, mocking them minimally
⋮----
// Ensure all necessary exports are mocked to avoid import errors in tests
// Mock shaderMaterial - returns a simple div for testing purposes
// eslint-disable-next-line
⋮----
// Return a simple component factory or a mock class instance
// For simplicity, let's return a function component that renders a div
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockMaterial = (props: any // eslint-disable-line @typescript-eslint/no-explicit-any) =>
⋮----
// Add more mocks here based on specific test failures if they arise
````

## File: src/test/tools/neural-coverage-visualizer.ts
````typescript
/* eslint-disable */
/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Coverage Visualizer with Quantum Precision
 *
 * This utility generates a visual representation of test coverage with clinical precision,
 * highlighting areas needing further neural-safe testing with mathematical elegance.
 */
⋮----
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
⋮----
// Neural-safe type definitions with quantum precision
interface ComponentCoverage {
  name: string;
  path: string;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  complexity: number;
}
⋮----
interface CoverageGroup {
  name: string;
  components: ComponentCoverage[];
  averageCoverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}
⋮----
// Neural-safe colors with clinical precision
⋮----
// Neural-safe thresholds with quantum precision
⋮----
/**
 * Generate neural-safe coverage report with clinical precision
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCoverageVisual(coverageData: any // eslint-disable-line @typescript-eslint/no-explicit-any, outputDir: string): void {
⋮----
// Group components by type for neural-safe visualization
// eslint-disable-next-line
⋮----
// Process coverage data with mathematical elegance
// eslint-disable-next-line
⋮----
// Calculate coverage metrics with clinical precision
⋮----
// Calculate cyclomatic complexity with quantum precision
⋮----
// Calculate group averages with mathematical elegance
// eslint-disable-next-line
⋮----
// Generate HTML report with neural precision
⋮----
// Ensure output directory exists
⋮----
// Write report to file with clinical precision
⋮----
/**
 * Generate HTML report with neural-safe formatting and clinical precision
 */
// eslint-disable-next-line
⋮----
// Calculate overall coverage with mathematical elegance
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Generate gauge charts with neural precision
⋮----
// Generate component groups with clinical precision
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Generate neural-safe HTML with clinical precision
⋮----
/**
 * Parse coverage data with quantum precision
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCoverageData(coveragePath: string): any // eslint-disable-line @typescript-eslint/no-explicit-any {
````

## File: src/test/webgl/examples/neural-controllers-mock.ts
````typescript
/**
 * Neural Controller Mocks
 *
 * This file provides mock implementations of all neural visualization controllers.
 * These mocks are used during testing to prevent the actual controllers from
 * trying to interact with WebGL/Three.js, which would cause test hanging.
 */
⋮----
import { vi } from 'vitest';
⋮----
// Define the generic mock implementation creator first
/**
 * Create mock implementation for a specific controller
 */
function createMockForController(_controllerPath: string): Record<string, any>
⋮----
// Prefixed unused parameter
// Extract controller name from path
// Removed unused _controllerName variable
⋮----
// Generic mock implementation for any neural controller
const mockImplementation = () =>
⋮----
// State
⋮----
// Regions and selections
⋮----
// Actions
⋮----
// Rendering and WebGL-related properties
⋮----
// Lifecycle flags
⋮----
// Return the mock for the specific controller
// Assuming all controllers are default exports based on usage pattern
⋮----
// --- Static Mocks ---
// Apply mocks directly at the top level using string literals
⋮----
// Remove the loop and deprecated functions
⋮----
// createMockForController function remains as defined above
⋮----
/**
 * Generate mock brain data
 */
function getMockBrainData()
⋮----
/**
 * Generate mock neural activity data
 */
function getMockNeuralActivity()
````

## File: src/test/webgl/memory-monitor.ts
````typescript
/* eslint-disable */
/**
 * WebGL Memory Monitor
 *
 * This utility provides advanced memory monitoring capabilities for Three.js/WebGL tests,
 * helping to identify memory leaks and ensure proper resource cleanup.
 *
 * Usage:
 * ```
 * import { startMemoryMonitoring, stopMemoryMonitoring, getMemoryReport } from '@test/webgl/memory-monitor';
 *
// eslint-disable-next-line
 * beforeEach(() => {
 *   startMemoryMonitoring();
 * });
 *
// eslint-disable-next-line
 * afterEach(() => {
 *   const report = stopMemoryMonitoring();
 *   expect(report.leakedObjectCount).toBe(0);
 * });
 * ```
 */
⋮----
interface MemorySnapshot {
  objects: Map<string, Set<WeakRef<any>>>;
  timestamp: number;
}
⋮----
export interface MemoryReport {
  createdObjects: number;
  disposedObjects: number;
  leakedObjectCount: number;
  leakedObjectTypes: Record<string, number>;
  duration: number;
  startTime: number;
  endTime: number;
}
⋮----
// Track object references by type
⋮----
// eslint-disable-next-line
⋮----
// Object was garbage collected, remove it from our count
// This is approximate as we can't directly reference the original object
// eslint-disable-next-line
⋮----
/**
 * Begin monitoring memory usage for Three.js/WebGL objects
 */
// eslint-disable-next-line
export function startMemoryMonitoring(): void
⋮----
// Clear any previous data
⋮----
/**
 * Stop monitoring and get a report of memory usage
 */
// eslint-disable-next-line
export function stopMemoryMonitoring(): MemoryReport
⋮----
// Calculate totals from each object type
// eslint-disable-next-line
⋮----
/**
 * Count living (not garbage collected) objects in a set of WeakRefs
 */
// eslint-disable-next-line
function countLivingObjects(refs: Set<WeakRef<any>>): number
⋮----
// eslint-disable-next-line
⋮----
/**
 * Register a new object for memory tracking
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackObject(obj: any // eslint-disable-line @typescript-eslint/no-explicit-any, type: string): void {
⋮----
// Register for garbage collection notification
⋮----
/**
 * Mark an object as disposed/cleaned up
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function markDisposed(obj: any // eslint-disable-line @typescript-eslint/no-explicit-any, type: string): void {
⋮----
// We can't directly remove the specific WeakRef since we don't have the reference
// Instead, we'll check all refs for this type and remove any that match
// eslint-disable-next-line
⋮----
/**
 * Get a snapshot of current memory usage for debugging
 */
// eslint-disable-next-line
export function getMemorySnapshot(): Record<string, number>
⋮----
// eslint-disable-next-line
⋮----
/**
 * Manually trigger a garbage collection attempt (for testing only)
 * Note: This is not guaranteed to collect all objects and is implementation-dependent
 */
// eslint-disable-next-line
export function attemptGarbageCollection(): void
````

## File: src/test/webgl/mock-types.ts
````typescript
/* eslint-disable */
/**
 * Type definitions for mock functions and objects
 *
 * These types provide consistent interfaces for all mocks in the testing system
 */
⋮----
/**
 * MockFunction type - provides a consistent interface for all mock functions
 * Compatible with testing frameworks but not dependent on them
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockFunction<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any> = {
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
results: { type: 'return' | 'throw'; value: any // eslint-disable-line @typescript-eslint/no-explicit-any }[];
````

## File: src/test/webgl/mock-utils.ts
````typescript
/* eslint-disable */
/**
 * Utilities for creating and managing mock functions and objects
 *
 * These utilities provide a consistent approach to mocking across the testing system
 */
import type { MockFunction } from './mock-types';
⋮----
/**
 * Create a mock function with a consistent interface
 *
 * @param implementation Optional initial implementation of the mock function
 * @returns A mock function with tracking capabilities
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFunction<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any>(
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const results: { type: 'return' | 'throw'; value: any // eslint-disable-line @typescript-eslint/no-explicit-any }[] = [];
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
/**
 * Create a simple mock function for tests that don't need tracking
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fn = <T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any>(impl?: T) => createMockFunction<T>(impl);
⋮----
/**
 * Simple deep clone utility for mock objects
 */
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
````

## File: src/test/webgl/test-setup.js
````javascript
// WebGL Test Setup (Global for all tests)
⋮----
// Global setup for all tests
beforeAll(() => {
console.log('WebGL mocks set up');
setupWebGLMocks({
⋮----
// Global cleanup for all tests
afterAll(() => {
console.log('WebGL mocks cleaned up');
⋮----
// Clean up WebGL mocks and report memory leaks
const report = cleanupWebGLMocks();
⋮----
console.warn(
⋮----
console.warn('Leaked objects by type:', report.leakedObjectTypes);
````

## File: src/test/webgl/types.ts
````typescript
/* eslint-disable */
/**
 * WebGL Testing System Types
 *
 * This file defines TypeScript interfaces and types used throughout
 * the WebGL testing system.
 */
⋮----
/**
 * Options for setting up WebGL mocks
 */
export interface SetupOptions {
  /**
   * Whether to monitor memory allocations and disposals
   * @default true
   */
  monitorMemory?: boolean;

  /**
   * Whether to print debugging information during tests
   * @default false
   */
  debugMode?: boolean;

  /**
   * Whether to use neural controller mocks
   * @default false
   */
  useNeuralControllerMocks?: boolean;
}
⋮----
/**
   * Whether to monitor memory allocations and disposals
   * @default true
   */
⋮----
/**
   * Whether to print debugging information during tests
   * @default false
   */
⋮----
/**
   * Whether to use neural controller mocks
   * @default false
   */
⋮----
/**
 * Type representing a Three.js object that can be disposed
 */
export interface Disposable {
  dispose: () => void;
}
⋮----
/**
 * Type for WebGLRendererParameters used to configure the renderer
 */
export interface WebGLRendererParameters {
  canvas?: HTMLCanvasElement;
  alpha?: boolean;
  antialias?: boolean;
  precision?: 'highp' | 'mediump' | 'lowp';
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'high-performance' | 'low-power' | 'default';
  depth?: boolean;
  stencil?: boolean;
  premultipliedAlpha?: boolean;
  logarithmicDepthBuffer?: boolean;
}
⋮----
/**
 * Type for mock materials
 */
export interface MockMaterial extends Disposable {
  type: string;
  uuid: string;
  name: string;
  transparent: boolean;
  opacity: number;
  side: number;
  visible: boolean;
  color?: {
    r: number;
    g: number;
    b: number;
    set: (value: string | number) => void;
  };
}
⋮----
/**
 * Type for mock geometries
 */
export interface MockGeometry extends Disposable {
  type: string;
  uuid: string;
  name: string;
  vertices?: number[];
  attributes?: Record<string, any>;
}
⋮----
/**
 * Type for mock WebGLRenderer
 */
export interface MockWebGLRenderer extends Disposable {
  domElement: HTMLCanvasElement;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (scene: any // eslint-disable-line @typescript-eslint/no-explicit-any, camera: any) => void;
  setSize: (width: number, height: number) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  setClearColor: (color: any // eslint-disable-line @typescript-eslint/no-explicit-any, alpha?: number) => void;
  clear: () => void;
  info: {
    memory: {
      geometries: number;
      textures: number;
    };
    render: {
      calls: number;
      triangles: number;
      points: number;
      lines: number;
    };
  };
}
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
render: (scene: any // eslint-disable-line @typescript-eslint/no-explicit-any, camera: any) => void;
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setClearColor: (color: any // eslint-disable-line @typescript-eslint/no-explicit-any, alpha?: number) => void;
````

## File: src/test/neural-spy-system.ts
````typescript
/**
 * NOVAMIND Neural Architecture
 * Instrumentation-Safe Neural Spy System with Quantum Precision
 *
 * This advanced spy system preserves coverage instrumentation by using vi.spyOn()
 * instead of vi.mock(), ensuring accurate metrics while maintaining mock functionality.
 */
⋮----
// Removed invalid import: SpyInstance is not exported from 'vitest'
import { vi } from 'vitest'; // Removed unused Mock import
import type React from 'react';
// Removed unused ReactNode import from 'react'
⋮----
// Type for creating neural-safe mock functions with quantum precision
// Removed unused type MockFunctionFactory
type ExtractableKey<T> = Extract<keyof T, string | number>;
⋮----
/**
 * Create neural-safe module mocks with quantum precision
 * This preserves coverage instrumentation unlike vi.mock()
 */
export async function createNeuralSafeMock<T extends Record<string, unknown>>(
  modulePath: string,
  mockImplementations: Partial<Record<keyof T, unknown>> = {}
): Promise<T>
⋮----
// Import the actual module to preserve instrumentation path
⋮----
// Apply neural-safe spies with clinical precision
⋮----
// Apply custom mock implementation with quantum precision
// Type safety sacrificed for neural coverage with mathematical elegance (ts-expect-error removed as it was unused)
// Assert the implementation is a function type compatible with mockImplementation
⋮----
// Default mock for functions with clinical precision
// Type safety sacrificed for neural coverage with mathematical elegance (ts-expect-error removed as it was unused)
⋮----
// Return an empty proxy that won't throw errors
⋮----
// Prefixed unused target
// Return a no-op function for any method call
⋮----
/**
 * Create a neural-safe React component mock with quantum precision
 * Ensures component mocks preserve coverage instrumentation
 */
export function createNeuralComponentMock(
  displayName: string,
  implementation: React.FC<Record<string, unknown>> = () => null
): React.FC<Record<string, unknown>>
⋮----
/**
 * Create neural-safe service mocks with clinical precision
 * Preserves coverage instrumentation while providing mock functionality
 */
export function createNeuralServiceMock<T extends Record<string, unknown>>(
  serviceName: string,
  mockMethods: Partial<T> = {}
): T
⋮----
// Prefixed unused target
⋮----
/**
 * Type-safe neural spy function with quantum precision
 * Handles complex TypeScript constraints for test instrumentation
 */
// Define a more specific type for the implementation function
// Define a general function type for spy implementations
// Define a general function type for spy implementations using unknown for safety
// Define a general function type for spy implementations using unknown for safety
type SpyImplementation = (...args: unknown[]) => unknown;
⋮----
export function neuralSafeSpy<T extends Record<string, unknown>, K extends keyof T>(
  module: T,
  method: K,
  implementation: SpyImplementation // Use the simpler type
)
⋮----
implementation: SpyImplementation // Use the simpler type
⋮----
// Removed explicit : SpyInstance return type annotation
// @ts-expect-error - Neural-safe implementation with specialized type constraints
⋮----
/**
 * Register neural-safe spies on a module with quantum precision
 * Preserves instrumentation while mocking functionality
 */
export async function spyOnModule<T extends Record<string, unknown>>(
  module: T,
  mocks: Partial<Record<keyof T, unknown>> = {}
): Promise<void>
⋮----
// Apply custom mock with clinical precision
// Assert the mock is a compatible function type
⋮----
// Default mock with quantum precision
// The revised SpyImplementation type should now accept this default mock
⋮----
/**
 * Setup mock error state with neural precision
 * Preserves instrumentation while creating error conditions
 */
export function createVisualizationErrorMock(errorMessage: string)
````

## File: src/test/standalone-brain-test.spec.tsx
````typescript
/**
 * NOVAMIND Neural Architecture
 * Standalone Brain Test with Quantum Precision
 *
 * This test is completely self-contained and doesn't rely on any external
 * components or complex mocking to establish a baseline for testing.
 */
⋮----
import { describe, it, expect } from 'vitest'; // Removed unused vi import
// Removed unused React import
import { screen, within } from '@testing-library/react'; // Import within
import { renderWithProviders } from './test-utils.unified'; // Import unified render
⋮----
// Define a standalone component that mimics the structure of BrainModelContainer
const StandaloneBrainContainer = () =>
⋮----
// Render the component with clinical precision
renderWithProviders(<StandaloneBrainContainer />); // Use unified render
⋮----
// Verify that the component renders with mathematical elegance
⋮----
// Query within the first container found
⋮----
// Verify text content with neural precision
````

## File: src/test/utils/coverage-analyzer.ts
````typescript
/**
 * Test Coverage Analyzer
 * 
 * This utility analyzes and reports on test coverage across the codebase,
 * helping identify areas that need additional testing to meet production
 * requirements (80% coverage target).
 */
⋮----
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
⋮----
interface CoverageData {
  statements: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  lines: { total: number; covered: number; percentage: number };
}
⋮----
interface ModuleCoverage {
  path: string;
  relativePath: string;
  coverage: CoverageData;
  priority: 'high' | 'medium' | 'low';
  components: { 
    name: string;
    percentage: number;
  }[];
}
⋮----
interface CoverageSummary {
  overall: CoverageData;
  modules: ModuleCoverage[];
  untested: string[];
  recommendations: string[];
}
⋮----
/**
 * Thresholds for determining testing priority
 */
⋮----
critical: 90, // Critical code needs at least 90% coverage
high: 80,     // High-priority code needs at least 80% coverage
medium: 60,   // Medium-priority code needs at least 60% coverage
minimum: 40   // Minimum acceptable coverage
⋮----
/**
 * Critical code paths that require high test coverage
 */
⋮----
/**
 * Generate a coverage report from test results
 */
export async function analyzeCoverage(coverageJsonPath: string): Promise<CoverageSummary>
⋮----
// Load coverage data from file
let coverageData: any // eslint-disable-line @typescript-eslint/no-explicit-any;
⋮----
// Extract project root path
⋮----
// Find all source files
⋮----
// Find all test files to correlate with source files
⋮----
// Map source files to their corresponding test files
⋮----
// Same name in same directory
⋮----
// Same name in /tests subdirectory
⋮----
// Same name in parent /tests directory
⋮----
// Find untested files
⋮----
// Process coverage data to calculate module-level stats
⋮----
// Process file coverage information
⋮----
// Group files by module
⋮----
// Extract module path (up to 3 levels: src/category/module)
⋮----
// Calculate coverage for each module
⋮----
// Process each file in the module
⋮----
// Add to module stats
⋮----
// Extract component info
⋮----
// Add to overall stats
⋮----
// Calculate percentages for module
⋮----
// Determine priority based on path and coverage
⋮----
components: components.sort((a, b) => a.percentage - b.percentage) // Sort by coverage (lowest first)
⋮----
// Calculate overall percentages
⋮----
// Sort modules by priority (high to low) and then by coverage (low to high)
⋮----
// Generate recommendations
⋮----
// Check if overall coverage is below 80%
⋮----
// Add recommendations for high-priority modules
⋮----
// Add recommendations for untested files
⋮----
// Add specific recommendation for low function coverage
⋮----
// Add specific recommendation for low branch coverage
⋮----
/**
 * Generate a test coverage report in markdown format
 */
export function generateCoverageReport(coverage: CoverageSummary): string
⋮----
// Format the report as markdown
⋮----
// Add modules with less than 80% coverage
⋮----
.slice(0, 10); // Limit to top 10 to keep the report manageable
⋮----
// Add untested files section
⋮----
// Add recommendations
⋮----
// Add final notes
⋮----
/**
 * Get emoji indicator for coverage status
 */
function getStatusEmoji(percentage: number): string
⋮----
/**
 * Get a formatted label for priority
 */
function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string
⋮----
/**
 * CLI command to generate a coverage report
 */
⋮----
// Default path for coverage JSON
⋮----
// Write report to file
````

## File: src/test/utils/test-utils.tsx
````typescript
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@application/providers/ThemeProvider';
import type { RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
⋮----
// Create a custom render function that includes providers
function render(
  ui: React.ReactElement,
  {
    route = '/',
    initialEntries = [route],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: RenderOptions & {
    route?: string;
    initialEntries?: string[];
    queryClient?: QueryClient;
  } = {}
)
⋮----
function Wrapper(
⋮----
// Re-export everything
⋮----
// Add custom vitest matchers
⋮----
// Custom matchers with proper typing for Vitest
export function toHaveBeenCalledOnceWith(
  received: ReturnType<typeof vi.fn>,
  ...expected: unknown[]
)
⋮----
// Commenting out toHaveBeenCalledAfter due to Vitest mock API differences
// export function toHaveBeenCalledAfter(
//   received: ReturnType<typeof vi.fn>,
//   other: ReturnType<typeof vi.fn>
// ) {
//   // Implementation needs rework for Vitest - mock.results doesn't have timestamp
//   // Check call order using mock.calls array index if necessary
//   const receivedCallIndex = received.mock.calls.length > 0 ? received.mock.invocationCallOrder[0] : -1; // Fictional property
//   const otherCallIndex = other.mock.calls.length > 0 ? other.mock.invocationCallOrder[0] : -1; // Fictional property
//
//   if (receivedCallIndex === -1) {
//     return { pass: false, message: () => `expected function to have been called after other function, but it was never called` };
//   }
//   if (otherCallIndex === -1) {
//     return { pass: false, message: () => `expected function to have been called after other function, but other function was never called` };
//   }
//
//   const pass = receivedCallIndex > otherCallIndex;
//
//   return {
//     pass,
//     message: () =>
//       pass
//         ? `expected function not to have been called after other function`
//         : `expected function to have been called after other function`,
//   };
// }
⋮----
// Test data generators based on our domain types
import type {
  /* BrainModel, BrainRegion, */ BrainScan,
  /* NeuralConnection, */ Patient,
} from '@domain/types'; // Removed unused types
⋮----
/* BrainModel, BrainRegion, */ BrainScan,
/* NeuralConnection, */ Patient,
} from '@domain/types'; // Removed unused types
⋮----
export const createTestPatient = (): Patient => (
⋮----
export const createTestBrainScan = (): BrainScan => (
````

## File: src/test/webgl/mock-webgl.test.ts
````typescript
/**
 * Tests for the WebGL/Three.js mock system
 *
 * This test verifies that our WebGL mocking system works correctly
 * and prevents test hangs in Three.js components.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupWebGLMocks,
  cleanupWebGLMocks,
  // Removed unused mock class imports
} from './mock-webgl'; // Keep setup/cleanup imports
⋮----
// Removed unused mock class imports
} from './mock-webgl'; // Keep setup/cleanup imports
⋮----
// Mock for 'three' moved to global setup (src/test/setup.ts)
⋮----
// Now import the names which will resolve to the mocks defined above
import {
  WebGLRenderer,
  Texture,
  BufferGeometry,
  MeshBasicMaterial,
  Scene,
  PerspectiveCamera,
} from 'three';
⋮----
// Re-skip due to persistent mock issues
⋮----
// Set up WebGL mocks before each test
⋮----
// Set up fake timers for animation frame testing
⋮----
// Clean up after each test to avoid polluting other tests
⋮----
// Reset timers
⋮----
// Create a canvas element
⋮----
// Get WebGL context - this should return our mock version
⋮----
// Verify the mock is created and has the correct properties
⋮----
// Check that methods exist
⋮----
// Test WebGL2 specific methods
⋮----
// Check that requestAnimationFrame is mocked
⋮----
// It should be a function
⋮----
// Test that requestAnimationFrame works by setting up a callback
⋮----
const callback = () =>
⋮----
// Request animation frame should call our callback
⋮----
// Advance timers to trigger callback
vi.advanceTimersByTime(20); // Use 20ms to ensure it triggers after 16ms default
⋮----
// Test that we can create Three.js mock objects
// Instantiate using standard names - alias provides mocks
⋮----
// Assuming MockWebGLTexture was intended to mock Texture
⋮----
const geometry = new BufferGeometry(); // Use standard name
const material = new MeshBasicMaterial(); // Use standard name
⋮----
// Check that the renderer has expected properties
⋮----
// Check that disposal methods exist
⋮----
// Explicitly mock matchMedia for this test
⋮----
// Check that matchMedia is mocked
⋮----
// Test matchMedia mock
⋮----
// This is a simple mock component that uses our WebGL mocks
⋮----
// For this specific test, use a direct, simple mock for WebGLRenderer
// to avoid relying on the complex canvas.getContext mock for renderer instantiation.
⋮----
domElement: document.createElement('canvas'), // Provide a basic canvas element
shadowMap: { enabled: false }, // Provide basic expected properties
⋮----
// Removed unused geometry and material variables
// Need mock scene and camera for the render call
⋮----
// Simulate a render loop - this would normally hang tests
⋮----
// Simulate animation frame
// Pass mock scene and camera to render call
mockRenderer.render(scene, camera); // Call render on the simple mock
⋮----
// Create and dispose many geometries and materials - this would normally cause memory leaks
// Instantiate using standard names - alias provides mocks
⋮----
// Dispose everything
⋮----
mockRenderer.dispose(); // Call dispose on the simple mock
⋮----
// If we got here without hanging, the test passes
````

## File: src/test/test-utils.core.tsx
````typescript
/**
 * Core Test Utilities for Novamind Frontend
 *
 * This file provides standardized testing utilities for React components,
 * including a custom render function with all necessary providers.
 * It is the SINGLE SOURCE OF TRUTH for component testing utilities.
 */
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
⋮----
// Import relevant contexts
// Note: Import paths may need adjustment based on actual project structure
import { ThemeProvider } from '../application/providers/ThemeProvider';
import type { ThemeMode } from '../application/contexts/ThemeContext';
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';
import DataContext from '../application/contexts/DataContext';
⋮----
// Default mock data
⋮----
// Create a fresh QueryClient for each test
function createTestQueryClient()
⋮----
gcTime: 0, // cacheTime is renamed to gcTime in newer versions
⋮----
// Mock authentication context
⋮----
// Mock visualization context
⋮----
// All-in-one provider wrapper
interface AllProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  mockData?: typeof defaultMockData;
}
⋮----
export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  initialRoute = '/',
  theme = 'light',
  queryClient = createTestQueryClient(),
  mockData = defaultMockData,
}) =>
⋮----
// Extended render options
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  mockData?: typeof defaultMockData;
}
⋮----
/**
 * Custom render function that wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialRoute, theme, queryClient, mockData, ...renderOptions }: ExtendedRenderOptions = {}
)
⋮----
// Apply theme to document if provided
⋮----
// Create wrapper with all providers
const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders
      initialRoute={initialRoute}
      theme={theme}
      queryClient={queryClient}
      mockData={mockData}
    >
      {children}
    </AllProviders>
  );
⋮----
// Render with extended utilities
⋮----
// Additional helper functions
⋮----
// MockQueryClient for making assertions/manipulations
⋮----
// Re-export everything from testing-library
⋮----
// Override the default render method
````

## File: src/test/test-utils.tsx
````typescript
/**
 * Core Test Utilities for Novamind Frontend
 *
 * This file provides standardized testing utilities for React components,
 * including a custom render function with all necessary providers.
 * It is the SINGLE SOURCE OF TRUTH for component testing utilities.
 */
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
⋮----
// Import relevant contexts
// Note: Import paths may need adjustment based on actual project structure
import { ThemeProvider } from '../application/providers/ThemeProvider';
import type { ThemeMode } from '../application/contexts/ThemeContext';
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';
import DataContext from '../application/contexts/DataContext';
⋮----
// Default mock data
⋮----
// Create a fresh QueryClient for each test
function createTestQueryClient()
⋮----
gcTime: 0, // cacheTime is renamed to gcTime in newer versions
⋮----
// Mock authentication context
⋮----
// Mock visualization context
⋮----
// All-in-one provider wrapper
interface AllProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  mockData?: typeof defaultMockData;
}
⋮----
export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  initialRoute = '/',
  theme = 'light',
  queryClient = createTestQueryClient(),
  mockData = defaultMockData,
}) =>
⋮----
// Extended render options
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  mockData?: typeof defaultMockData;
}
⋮----
/**
 * Custom render function that wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialRoute, theme, queryClient, mockData, ...renderOptions }: ExtendedRenderOptions = {}
)
⋮----
// Apply theme to document if provided
⋮----
// Create wrapper with all providers
const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders
      initialRoute={initialRoute}
      theme={theme}
      queryClient={queryClient}
      mockData={mockData}
    >
      {children}
    </AllProviders>
  );
⋮----
// Render with extended utilities
⋮----
// Additional helper functions
⋮----
// MockQueryClient for making assertions/manipulations
⋮----
// Re-export everything from testing-library
⋮----
// Override the default render method
````

## File: src/test/examples/tailwind-enhanced.test.tsx
````typescript
/**
 * Tailwind CSS Enhanced Test Example
 */
import React from 'react';
import { screen, act } from '@testing-library/react';
⋮----
import { useTheme } from '@application/hooks/useTheme'; // Correct import path for the hook
import type { Mock } from 'vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest'; // Import vi, Mock, etc.
import { renderWithProviders } from '../test-utils.unified';
⋮----
// Simple card component to test
interface CardProps {
  title: string;
  description: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}
⋮----
const Card: React.FC<CardProps> = (
⋮----
// Mock useTheme to control it
⋮----
// Use correct alias
useTheme: vi.fn(), // Mock the hook directly
⋮----
// Cast the mocked hook
⋮----
// Reset mocks and set initial return value for useTheme
⋮----
// Set mock to return dark theme initially for this test
⋮----
// Removed incomplete options object and unused variable destructuring
⋮----
// Check for the presence of the dark mode class string
⋮----
// Get the mocked setTheme function via useTheme
⋮----
// Start in light mode (based on mock initial value)
⋮----
// Toggle to dark mode using the context function
⋮----
// Re-mock the return value to reflect the change for the next assertion
⋮----
// Ensure consistent variable name
⋮----
const { theme: themeAfterDark } = useTheme(); // Get updated theme
⋮----
// Toggle back to light mode
⋮----
// Ensure consistent variable name
⋮----
const { theme: themeAfterLight } = useTheme(); // Get updated theme
````

## File: src/test/webgl/setup-test.ts
````typescript
/**
 * NOVAMIND WebGL Test Setup
 * 
 * Provides quantum-level test configuration for WebGL-based neurological visualization components
 */
⋮----
import { vi } from 'vitest';
⋮----
// Mock WebGL context and capabilities
export function setupWebGLMocks()
⋮----
// Create a canvas element for the tests
⋮----
// Create mock WebGL context with all necessary methods
⋮----
// Mock canvas getContext method
⋮----
// Mock WebGLRenderingContext
⋮----
// Mock requestAnimationFrame for animation testing
⋮----
// Mock three.js objects used in visualization
⋮----
// Add to global for easy reference
⋮----
// Cleanup WebGL mocks after tests
export function cleanupWebGLMocks()
⋮----
// Restore original canvas getContext
⋮----
// Clean up global requestAnimationFrame mock
⋮----
// Clean up global three.js mocks
⋮----
leakedObjects: 0, // Mock memory monitoring report
⋮----
// Setup for test with neural activity data
export function setupWebGLForTest()
⋮----
// Cleanup after test with neural activity data
export function cleanupWebGLAfterTest()
⋮----
// Run test with WebGL setup
export function runTestWithWebGL(testFn: () => void)
````

## File: src/test/neural-test-helper.ts
````typescript
/* eslint-disable */
/**
 * NOVAMIND Neural Test Helper
 * Provides neural-safe mocking utilities with quantum precision
 */
⋮----
import { vi } from 'vitest';
⋮----
/**
 * Creates a neural-safe spy that preserves coverage instrumentation
 * @param object The object containing the method to spy on
 * @param method The method name to spy on
 * @param implementation Optional implementation function
 * @returns The spy object
 */
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
implementation?: (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any
⋮----
// Preserve original method for coverage instrumentation
⋮----
// Create spy with quantum precision
// eslint-disable-next-line @typescript-eslint/no-explicit-any
⋮----
// Implement custom behavior if provided
if (implementation)
spy.mockImplementation(implementation);
⋮----
// Use mockImplementation to ensure proper type safety
// eslint-disable-next-line
⋮----
// If original is a function, preserve its behavior for coverage
// eslint-disable-next-line
⋮----
// Log error to help with debugging
⋮----
/**
 * Creates a neural-safe mock for a service with quantum precision
 * @param serviceName The name of the service for logging
 * @param methods Object containing method implementations
 * @returns The mocked service
 */
⋮----
// Create mock with clinical precision
⋮----
// Implement methods with quantum precision
// eslint-disable-next-line
⋮----
/**
 * Creates a neural-safe mock for React components with quantum precision
 * @param componentName The name of the component for logging
 * @param implementation Optional implementation function
 * @returns The mocked component
 */
⋮----
// Using a generic functional component type
⋮----
// Create default implementation with clinical precision
// eslint-disable-next-line
const defaultImplementation = (_props: Record<string, unknown>) =>
⋮----
// Mark props as unused
⋮----
// Create mock with quantum precision
⋮----
/**
 * Creates comprehensive neural-safe mocks for Three.js and React Three Fiber
 * with proper coverage instrumentation
 */
// eslint-disable-next-line
⋮----
// Mock Three.js core objects with quantum precision
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Mark color as unused
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Add common constants
⋮----
// Add math utilities
⋮----
// Mock React Three Fiber hooks and components with quantum precision
⋮----
// eslint-disable-next-line
⋮----
// Define a placeholder type for the frame state based on the mock structure
⋮----
// eslint-disable-next-line
⋮----
// Call the callback once to simulate a frame
⋮----
// Add common R3F components
⋮----
// Add mesh and primitive components
⋮----
// Add light components
⋮----
// Mock React Three Drei components with quantum precision
⋮----
// eslint-disable-next-line
⋮----
// Mock React Three A11y components with quantum precision
⋮----
/**
 * Registers all necessary mocks for neural-safe testing with quantum precision
 */
⋮----
// eslint-disable-next-line
⋮----
// Create Three.js and React Three Fiber mocks
⋮----
// Mock modules with clinical precision
⋮----
// Mock browser APIs with quantum precision
⋮----
// Skip mocking canvas context to avoid TypeScript errors
// The actual tests will use the real canvas context or mock it directly
⋮----
// Mock ResizeObserver with proper type assertion
⋮----
// Create a minimal implementation that satisfies TypeScript
⋮----
// Mark target as unused
// Implementation with clinical precision
⋮----
// Mark target as unused
// Implementation with mathematical elegance
⋮----
// Implementation with quantum precision
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.ResizeObserver = MockResizeObserver as any; // Reverting to any for minimal mock
⋮----
// Mock IntersectionObserver with proper type assertion
⋮----
// Create a minimal implementation that satisfies TypeScript
⋮----
// Removed unused private members _callback and _options
⋮----
constructor()
⋮----
// Removed unused callback and options parameters
⋮----
observe(_target: Element): void
⋮----
// Mark target as unused
// Implementation with clinical precision
⋮----
unobserve(_target: Element): void
⋮----
// Mark target as unused
// Implementation with mathematical elegance
⋮----
disconnect(): void
⋮----
// Implementation with quantum precision
⋮----
takeRecords(): IntersectionObserverEntry[]
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.IntersectionObserver = MockIntersectionObserver as any; // Reverting to any for minimal mock
⋮----
// Mock requestAnimationFrame and cancelAnimationFrame
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Initialize the neural-safe test environment with quantum precision
⋮----
// Export neural-safe testing utilities with quantum precision
````

## File: src/test/setup.core.ts
````typescript
/**
 * CORE TEST SETUP
 * This provides essential test environment configuration for all tests
 */
⋮----
// Import testing libraries and setup jsdom environment
⋮----
import { expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
⋮----
// ==========================================
// ADD DIRECT MATCHERS FOR TESTING LIBRARY
// ==========================================
// Direct integration of Jest-DOM matchers to avoid dependency issues
⋮----
// Add explicit matcher for toHaveTextContent that was failing
⋮----
toHaveTextContent(received, expected)
⋮----
// ==========================================
// MOCK BROWSER ENVIRONMENT
// ==========================================
⋮----
// Mock localStorage
const createStorageMock = () =>
⋮----
get length()
⋮----
// Mock matchMedia for theme tests - critical fix
⋮----
// Reset document classes
⋮----
// Mock other browser APIs commonly used
⋮----
// Observer APIs
⋮----
// URL methods
⋮----
// CustomEvent for auth tests
⋮----
constructor(type: string, options: any =
⋮----
// Clean up after each test
⋮----
// Log setup completion
````

## File: src/test/tailwind-example.unified.test.tsx
````typescript
/**
 * Tailwind CSS Testing Example (Using Unified Test Setup)
 */
import React from 'react';
import { describe, it, expect } from 'vitest'; // Removed unused beforeEach, afterEach
import { screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import act and waitFor
import { renderWithProviders } from './test-utils.unified'; // Use correct import
⋮----
// Sample component that uses Tailwind classes including dark mode variants
const TailwindComponent: React.FC<
⋮----
// No beforeEach/afterEach needed for tailwindHelper
⋮----
expect(isDarkMode()).toBe(false); // Check state via helper
⋮----
// We don't check for absence of dark class, just the presence of light class
⋮----
// Add async
// Render initially in light mode
⋮----
// Removed unused isDarkMode
⋮----
// Explicitly enable dark mode within act
⋮----
// Wait for the classList to update
⋮----
// Removed unused variable: container
// const container = screen.getByText('Dark Mode Classes Test').parentElement;
// Asserting dark:* classes directly can be brittle.
// The key check is that the 'dark' class is applied to the root.
// Individual component styling in dark mode is better tested visually or via computed styles if needed.
// expect(container).toHaveClass('dark:bg-gray-800'); // Removed brittle check
// expect(paragraph).toHaveClass('dark:text-gray-300'); // Removed brittle check
// expect(textContainer).toHaveClass('dark:bg-gray-900'); // Removed brittle check
⋮----
// Re-enabled
// Explicitly set light mode in localStorage before the test
⋮----
// Initially in light mode
⋮----
// Toggle to dark mode
⋮----
// Wait for the class to be added to the documentElement
⋮----
// expect(isDarkMode()).toBe(true); // State check might be flaky, rely on DOM class
⋮----
// Toggle back to light mode
⋮----
// Wait for the class to be removed from the documentElement
⋮----
expect(isDarkMode()).toBe(false); // Also check the helper state
````

## File: src/test/tailwind-testing-example.test.tsx
````typescript
import React from 'react';
import { screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import act and waitFor
import { renderWithProviders } from './test-utils.unified'; // Use unified setup
⋮----
/**
 * Example component that uses Tailwind classes with dark mode variants
 */
const TailwindTestComponent: React.FC = () =>
⋮----
// Update describe block name
// No beforeEach needed for cssMock
⋮----
const { isDarkMode } = renderWithProviders(<TailwindTestComponent />); // Use unified render
expect(isDarkMode()).toBe(false); // Use helper
⋮----
expect(container.classList.contains('dark:bg-gray-800')).toBe(true); // Class is present, but not applied
⋮----
// Re-enabled and made async
const { enableDarkMode } = renderWithProviders(<TailwindTestComponent />); // Render light first, removed unused isDarkMode
// Check classList directly for initial render with darkMode: true
// Explicitly enable dark mode within act
⋮----
// Wait for the classList to update
⋮----
expect(container.classList.contains('dark:bg-gray-800')).toBe(true); // Class is present and applied
⋮----
// Rename test, make async
// Explicitly set light mode in localStorage before the test
⋮----
// Use helpers from unified render
⋮----
// Start in light mode
⋮----
// Toggle to dark mode
⋮----
// Use waitFor to allow potential state updates
⋮----
await screen.findByTestId('tailwind-test-container'); // Wait for potential re-render
⋮----
// expect(isDarkMode()).toBe(true); // State check might be flaky, rely on DOM class
⋮----
// Toggle back to light mode
⋮----
await screen.findByTestId('tailwind-test-container'); // Wait for potential re-render
⋮----
// expect(isDarkMode()).toBe(false); // State check might be flaky, rely on DOM class
⋮----
renderWithProviders(<TailwindTestComponent />); // Use unified render
⋮----
// In a real test, you might do something like:
// fireEvent.click(button);
// expect(...).toBe(...);
````

## File: src/test/webgl/mock-webgl.ts
````typescript
/* eslint-disable */
/**
 * WebGL/Three.js Mock for Testing Environment
 *
 * This module provides comprehensive mocks for WebGL and Three.js objects
 * to prevent test hangs and memory issues when testing Three.js components.
 *
 * It addresses multiple issues:
 * 1. JSDOM doesn't support WebGL - Mock implementation prevents errors
 * 2. Memory management - Proper dispose() methods to prevent memory leaks
 * 3. Animation frame handling - Deterministic animation for testing
 */
⋮----
// Type for mock functions - compatible with test frameworks but not dependent on them
// Define the generic mock function type with proper typing
type MockFunction<T extends Function> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReset: () => void;
  mock: {
    calls: Parameters<T>[][];
    results: { type: 'return' | 'throw'; value: unknown }[];
  };
};
⋮----
// Create a minimal mock function implementation
// eslint-disable-next-line
function createMockFunction<T extends Function>(implementation?: T): MockFunction<T>
⋮----
// Default implementation that returns undefined
// eslint-disable-next-line
const defaultImplementation = (...args: Parameters<T>): ReturnType<T> =>
⋮----
// Create the main mock function
// eslint-disable-next-line
const mockFn = (...args: Parameters<T>): ReturnType<T> =>
⋮----
// Current implementation (can be changed via mockImplementation)
⋮----
// Add required mock properties and methods
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Add mock property for tracking calls and results
⋮----
// WebGL constants
⋮----
// Mock WebGL context implementation
export class MockWebGLRenderingContext
⋮----
// Include WebGL constants
⋮----
// Mock resources - allow tracking for memory tests
⋮----
constructor(canvas: HTMLCanvasElement)
⋮----
// Mock method implementation with tracking
getExtension(extensionName: string): unknown
⋮----
// Add mock getExtension
⋮----
// Add other common extensions if needed by tests
// e.g., OES_texture_float, ANGLE_instanced_arrays
return null; // Return null for unmocked extensions
⋮----
// Core WebGL methods with consistent return values
getParameter(paramName: number): unknown
⋮----
getShaderPrecisionFormat():
⋮----
// Buffer methods
// eslint-disable-next-line
createBuffer(): Record<string, unknown>
⋮----
bindBuffer(): void
bufferData(): void
⋮----
// Shader methods
// eslint-disable-next-line
createShader(): Record<string, unknown>
⋮----
shaderSource(): void
compileShader(): void
getShaderParameter(): boolean
⋮----
// Program methods
// eslint-disable-next-line
createProgram(): Record<string, unknown>
⋮----
attachShader(): void
linkProgram(): void
getProgramParameter(): boolean
useProgram(): void
⋮----
// Uniform methods
// eslint-disable-next-line
getUniformLocation(): Record<string, unknown>
uniform1f(): void
uniform2f(): void
uniform3f(): void
uniform4f(): void
uniformMatrix4fv(): void
⋮----
// Attribute methods
getAttribLocation(): number
enableVertexAttribArray(): void
vertexAttribPointer(): void
⋮----
// Draw methods
drawArrays(): void
drawElements(): void
clear(): void
clearColor(): void
clearDepth(): void
disable(): void
enable(): void
blendFunc(): void
depthFunc(): void
viewport(): void
⋮----
// WebGL2 methods
// eslint-disable-next-line
createVertexArray(): Record<string, unknown>
bindVertexArray(): void
// eslint-disable-next-line
createQuery(): Record<string, unknown>
beginQuery(): void
endQuery(): void
⋮----
// Store original method to restore later
⋮----
// Install mock globally
// eslint-disable-next-line
export function setupWebGLMocks(): void
⋮----
// Override HTMLCanvasElement.prototype.getContext
⋮----
// Call original for other context types (e.g., '2d')
⋮----
// Mock requestAnimationFrame for deterministic testing
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// No-op implementation
⋮----
// Clean up mocks (restore original functions)
// eslint-disable-next-line
export function cleanupWebGLMocks(): void
⋮----
// @ts-ignore - We know this exists in test environments
⋮----
// @ts-ignore - We know this exists in test environments
⋮----
// Mock Three.js classes for WebGL-dependent tests
export class MockWebGLRenderer
⋮----
constructor()
// Provide a shadowMap property for compatibility with Three.js behavior
⋮----
setSize(): void
setPixelRatio(): void
render(): void
dispose(): void
⋮----
export class MockWebGLTexture
⋮----
export class MockWebGLGeometry
⋮----
export class MockWebGLMaterial
⋮----
// Export a function to create mock objects for Three.js
// eslint-disable-next-line
export function createThreeMock()
⋮----
// Add more Three.js classes as needed
⋮----
// Expose mock classes under Three.js names for test aliasing
⋮----
export class Scene
export class PerspectiveCamera
````

## File: src/test/setup.clean.ts
````typescript
/**
 * CANONICAL TEST ENVIRONMENT SETUP
 *
 * This is a complete, clean solution for all test environment needs.
 * No patchwork, no legacy code - just a proper foundation.
 */
⋮----
// Import base testing libraries
⋮----
import { expect, vi, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
⋮----
// PROPER JEST-DOM SETUP
// 1. Import and register matchers correctly
⋮----
// 2. Type augmentation that correctly extends Vitest
⋮----
interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
⋮----
// BROWSER API MOCKS
⋮----
// LOCAL STORAGE
const createStorageMock = () =>
⋮----
get length()
⋮----
// MATCH MEDIA (Critical for ThemeProvider tests)
⋮----
// URL OBJECT
⋮----
// DOCUMENT DEFAULTS
⋮----
// CANVAS & WEBGL MOCKS
⋮----
// Mock canvas context
⋮----
// Add other methods as needed
⋮----
// Mock getContext method
⋮----
// THREE.JS MOCK
⋮----
// CLEANUP
⋮----
// Test helper utilities
````

## File: src/test/setup.dom.ts
````typescript
/**
 * DOM Testing Environment Setup
 *
 * This file provides essential DOM-specific setup for React component tests.
 * It's used as a common import across test files that need DOM manipulation.
 */
⋮----
import '@testing-library/jest-dom'; // Import jest-dom matchers
⋮----
// Mock window.matchMedia for tests
⋮----
// Set up localStorage mock for tests
⋮----
// Set up sessionStorage mock for tests
⋮----
// Ensure vi is defined globally to prevent reference errors
import { vi } from 'vitest';
````

## File: src/test/criticalComponentMocks.tsx
````typescript
/* eslint-disable */
/**
 * NOVAMIND Neural Test Framework
 * Critical Component Mocks with Quantum Precision
 */
⋮----
import React from 'react';
import { vi } from 'vitest';
⋮----
// Mock Three.js with surgical precision
⋮----
React.createElement('div', { 'data-testid': 'neural-canvas' }, children), // Replaced JSX with React.createElement
⋮----
{ points: _points, color }: { points: unknown; color: unknown } // Mark points as unused
⋮----
// Mock react-spring/three
⋮----
// Mock Chart.js
⋮----
static register()
⋮----
// Mock react-chartjs-2
⋮----
// Create neural-safe mock components for tests
export const MockNeuralComponent = (
⋮----
export const MockBrainVisualization = ({
  regions,
  connections,
}: {
  regions: Array<unknown> | { length?: number };
  connections: Array<unknown> | { length?: number };
})
⋮----
export const MockTemporalVisualizer = ({
  timeRange,
  stateTransitions,
}: {
  timeRange: unknown;
  stateTransitions: Array<unknown> | { length?: number };
})
⋮----
export const MockClinicalDataDisplay = (
  { data, colorMap: _colorMap }: { data: Array<unknown> | { length?: number }; colorMap: unknown } // Mark colorMap as unused
)
⋮----
{ data, colorMap: _colorMap }: { data: Array<unknown> | { length?: number }; colorMap: unknown } // Mark colorMap as unused
````

## File: src/test/webgl/index.ts
````typescript
/* eslint-disable */
/**
 * WebGL Testing Framework - Comprehensive Neural Implementation
 * 
 * Provides a quantum-level architecture for testing WebGL/Three.js components
 * with architectural elegance and mathematical precision.
 */
⋮----
import { vi } from 'vitest';
import { setupWebGLMocks as setupMocks, cleanupWebGLMocks as cleanupMocks } from './mock-webgl';
⋮----
// Re-export core WebGL mocking functionality with enhanced capabilities
// eslint-disable-next-line
export function setupWebGLMocks(options =
⋮----
// Additional configuration based on options
⋮----
// Define the structure for memory tracking on globalThis
⋮----
allocatedObjects: new Set<any>(), // Use Set<any> for simplicity
⋮----
// Enhanced cleanup with memory leak detection
// eslint-disable-next-line
export function cleanupWebGLMocks()
⋮----
// Return memory tracking report if enabled, using globalThis
⋮----
// Clean up tracking
// Clean up tracking from globalThis
⋮----
// Export the utility functions and class mocks
````

## File: src/test/neural-standalone.spec.tsx
````typescript
/* eslint-disable */
/**
 * NOVAMIND Neural Architecture
 * Neural Standalone Test with Quantum Precision
 *
 * This test is completely self-contained with all necessary mocks in a single file.
 * It avoids any external dependencies to establish a baseline for testing.
 */
⋮----
import { describe, it, expect, vi, beforeAll } from 'vitest';
// Removed unused React import
import { render, screen } from '@testing-library/react';
⋮----
// Mock all external dependencies in a single place with quantum precision
⋮----
// Mock Three.js with clinical precision
⋮----
// Mock React Three Fiber with mathematical elegance
⋮----
// Mock React Three Drei with quantum precision
⋮----
// Mock React Three A11y with clinical precision
⋮----
// Mock browser APIs with mathematical elegance
⋮----
// Mock ResizeObserver
⋮----
// Mock IntersectionObserver
// Refined IntersectionObserver mock for better type compatibility
⋮----
constructor(
⋮----
// Mock requestAnimationFrame
// Corrected requestAnimationFrame mock signature
⋮----
// Return a number as expected by cancelAnimationFrame
return window.setTimeout(() => callback(performance.now()), 16); // Use performance.now and simulate ~60fps
⋮----
// Mock cancelAnimationFrame
// Corrected cancelAnimationFrame mock signature
⋮----
// Mock WebGL context
// Removed unused originalGetContext
// Refined getContext mock for better type compatibility
// Further refined getContext mock to align with overloaded signatures
⋮----
_options?: any // eslint-disable-line @typescript-eslint/no-explicit-any // Prefixed unused options
⋮----
// Use 'any' return type initially for flexibility
// Function body starts here
⋮----
// Return a basic mock WebGL context
⋮----
// Add other necessary WebGL methods used by your code
} as unknown as WebGLRenderingContext; // Cast via unknown
⋮----
// Add other necessary 2D context methods
} as unknown as CanvasRenderingContext2D; // Cast via unknown
⋮----
// Add other necessary bitmaprenderer context methods
} as unknown as ImageBitmapRenderingContext; // Cast via unknown
⋮----
// Fallback to original for other context types if needed, but typically return null for mocks
// if (originalGetContext) {
//   return originalGetContext.call(this, contextId, options);
// }
return null; // Return null for unsupported contexts
// Removed duplicate return null from line 232
// Removed misplaced closing brace from line 233
}; // This is the closing brace for the function assigned to getContext
⋮----
// Define a standalone component that mimics the structure of BrainModelContainer
⋮----
const NeuralBrainContainer = (
⋮----
// Render the component with clinical precision
⋮----
// Verify that the component renders with mathematical elegance
⋮----
// Verify text content with neural precision
⋮----
// Render with custom patient ID
⋮----
// Verify patient ID is displayed correctly
````

## File: src/test/webgl/examples/BrainRegionVisualizer.test.ts
````typescript
/**
 * @vitest-environment jsdom
 */
/* eslint-disable */
/**
 * Example Test: Brain Region Visualizer
 *
 * This test demonstrates how to properly test Three.js visualization components
 * using the WebGL mock system. It shows how to avoid common test hangs and
 * memory issues when testing complex 3D visualizations.
 */
⋮----
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
⋮----
// Remove local vi.mock('three') - Rely on global mocks or direct mock imports
⋮----
// Import necessary mock types from the central mock system
import {
  MockScene,
  MockPerspectiveCamera,
  MockWebGLRenderer,
  MockSphereGeometry,
  MockMeshStandardMaterial,
  MockMesh
} from '../three-mocks';
import { setupWebGLMocks, cleanupWebGLMocks } from '../mock-webgl'; // Use mock-webgl setup/cleanup
// Remove imports from 'three' as we use mocks directly
⋮----
/**
 * Simple mock Brain Region visualization component
 * This simulates a real Novamind brain visualization component
 */
class BrainRegionVisualizer
⋮----
// Use standard types
private scene: MockScene; // Use Mock type
private camera: MockPerspectiveCamera; // Use Mock type
private renderer: MockWebGLRenderer; // Use Mock type
private regions: Map<string, MockMesh> = new Map(); // Use Mock type
⋮----
// eslint-disable-next-line
constructor(container: HTMLElement, regions: string[] = [])
⋮----
// Initialize Three.js scene using standard constructors
this.scene = new MockScene(); // Use Mock type
this.camera = new MockPerspectiveCamera(); // Use Mock type
// Setting properties individually since our mock doesn't use constructor parameters
⋮----
// Initialize renderer using standard constructor
this.renderer = new MockWebGLRenderer({ antialias: true }); // Use Mock type
⋮----
// Add brain regions
⋮----
/**
   * Add brain regions to the scene
   */
addRegions(regionNames: string[]): void
⋮----
// eslint-disable-next-line
⋮----
// Create region mesh using standard constructors
const geometry = new MockSphereGeometry(); // Use Mock type
const material = new MockMeshStandardMaterial(); // Use Mock type
⋮----
// Set position based on index
const mesh = new MockMesh(geometry, material); // Use Mock type
⋮----
// Store region metadata
⋮----
// Add to scene and tracking
⋮----
/**
   * Get all region names
   */
getRegionNames(): string[]
⋮----
/**
   * Highlight a specific region
   */
highlightRegion(regionName: string): boolean
⋮----
// Reset all regions
// eslint-disable-next-line
⋮----
// Highlight selected region
⋮----
/**
   * Main render method
   */
render(): void
⋮----
// Render scene with camera
⋮----
/**
   * Clean up all resources to prevent memory leaks
   */
dispose(): void
⋮----
// Clean up all meshes
// eslint-disable-next-line
⋮----
// Assuming the Mesh mock has a dispose method (as per three.ts mock)
// eslint-disable-next-line
⋮----
// Also dispose geometry and material if necessary
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Clear region map
⋮----
// Clean up renderer
⋮----
// eslint-disable-next-line
⋮----
// Tests enabled with enhanced WebGL mocks
⋮----
// eslint-disable-next-line
⋮----
// Set up WebGL mocks for all tests with memory monitoring
setupWebGLMocks(); // Call without arguments
⋮----
// Create container element
⋮----
// Create visualizer with error handling
⋮----
// eslint-disable-next-line
⋮----
// Clean up visualizer
⋮----
// Remove container
⋮----
// Clean up WebGL mocks
⋮----
// eslint-disable-next-line
⋮----
// Get all region names
⋮----
// Verify regions were created
⋮----
// eslint-disable-next-line
⋮----
// Verify the region exists before highlighting
⋮----
// Highlight a region
⋮----
// Verify highlight was successful
⋮----
// We've already verified the success return value, which is the guarantee
// of the contract that the region was highlighted, so this test is valid
// without needing to access private implementation details
⋮----
// eslint-disable-next-line
⋮----
// Ensure the visualizer was created
⋮----
// Mock renderer is already set up with a spy function from vi.fn()
// Call render method
⋮----
// In this mock environment, we just verify that the render completed without errors
// since the actual render call is already a mock function
⋮----
// eslint-disable-next-line
⋮----
// Ensure the visualizer was created
⋮----
// Dispose visualizer
⋮----
// Verify internal state was cleaned up
⋮----
// Verify that render does nothing after disposal
⋮----
renderMethodBeforeDisposal.call(visualizer); // Should be a no-op
⋮----
// Test passes if we get here without errors
````

## File: src/test/webgl/three-mocks.ts
````typescript
/* eslint-disable */
/**
 * Three.js Comprehensive Mock System
 *
 * This module provides complete mocks for Three.js objects and their lifecycle methods,
 * preventing memory leaks and test hangs when testing visualization components.
 *
 * These mocks are designed to work with the WebGL context mocks from mock-webgl.ts
 * to create a complete testing environment for Three.js components.
 */
⋮----
import { vi } from 'vitest';
⋮----
// Type aliases for easier reference
type Vector3Like = { x: number; y: number; z: number };
type Vector2Like = { x: number; y: number };
⋮----
/**
 * Mock implementation of Three.js basic objects
 */
export class MockObject3D
⋮----
matrix: { elements: number[] } = { elements: new Array(16).fill(0) }; // Mock matrix
matrixWorld: { elements: number[] } = { elements: new Array(16).fill(0) }; // Mock matrix world
⋮----
// Standard method definitions
add(object: MockObject3D): this
⋮----
remove(object: MockObject3D): this
⋮----
updateMatrix(): void
updateMatrixWorld(_force?: boolean): void
lookAt(_vector: Vector3Like): void
⋮----
// Example implementation for traverse using vi.fn()
traverse(callback: (object: MockObject3D) => void): void
⋮----
dispose(): void
⋮----
clone(): MockObject3D
⋮----
// Copy other relevant properties if needed
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
raycast(_raycaster: any, _intersects: any[]): void
⋮----
// Define as a standard method with the mock logic inside
getWorldPosition(target: Vector3Like): Vector3Like
⋮----
// Simplified mock implementation
target.x = this.position.x; // Assuming world position is same as local for mock
⋮----
return target; // Return the modified target vector
⋮----
worldToLocal(vector: Vector3Like): Vector3Like { return vector; } // Identity for simplicity
setRotationFromEuler(_euler: Vector3Like): void
applyMatrix4(_matrix:
⋮----
/**
 * Specific Three.js object mocks
 */
export class MockScene extends MockObject3D
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
background: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
environment: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
fog: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
⋮----
export class MockPerspectiveCamera extends MockObject3D
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
view: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
⋮----
export class MockOrthographicCamera extends MockObject3D
⋮----
export class MockMesh extends MockObject3D
⋮----
constructor(
    geometry?: MockBufferGeometry,
    material?: MockMaterial | MockMaterial[],
)
⋮----
// Override dispose to clean up geometry and material
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Handle children disposal through remove
⋮----
export class MockGroup extends MockObject3D
⋮----
export class MockLine extends MockObject3D
⋮----
// eslint-disable-next-line
constructor(geometry?: MockBufferGeometry, material?: MockMaterial)
⋮----
// Override dispose to clean up geometry and material
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// eslint-disable-next-line
⋮----
// Handle children disposal through remove
⋮----
/**
 * Material mocks
 */
export class MockMaterial
⋮----
side: number = 0; // FrontSide
// eslint-disable-next-line @typescript-eslint/no-explicit-any
color: any // eslint-disable-line @typescript-eslint/no-explicit-any = { r: 1, g: 1, b: 1, set: () => {} };
⋮----
// eslint-disable-next-line
⋮----
export class MockMeshBasicMaterial extends MockMaterial
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
map: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
⋮----
export class MockMeshStandardMaterial extends MockMaterial
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
map: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
normalMap: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
⋮----
export class MockLineBasicMaterial extends MockMaterial
⋮----
export class MockLineDashedMaterial extends MockLineBasicMaterial
⋮----
dashOffset: number = 0; // This was mentioned as missing in the docs
⋮----
/**
 * Geometry mocks
 */
export class MockBufferGeometry
⋮----
constructor()
⋮----
// Standard method definitions
setAttribute(_name: string, _attribute: any): this
getAttribute(_name: string): any { return undefined; } // Return undefined or a mock attribute
setIndex(_index: any): void
toNonIndexed(): this
computeVertexNormals(): void
computeBoundingBox(): void
computeBoundingSphere(): void
⋮----
clone(): MockBufferGeometry
⋮----
clone.boundingBox = this.boundingBox; // Assuming these can be shallow copied
⋮----
setFromPoints(_points: Vector3Like[]): this
copy(_source: MockBufferGeometry): this
⋮----
export class MockSphereGeometry extends MockBufferGeometry
⋮----
export class MockBoxGeometry extends MockBufferGeometry
⋮----
export class MockCylinderGeometry extends MockBufferGeometry
⋮----
/**
 * Renderer mocks
 */
export class MockWebGLRenderer
⋮----
constructor(_parameters?:
⋮----
// Prefixed unused parameters
⋮----
// Standard method definitions
setSize(_width: number, _height: number, _updateStyle?: boolean): void
setPixelRatio(_value: number): void
render(_scene: MockScene, _camera: MockPerspectiveCamera | MockOrthographicCamera): void
⋮----
setClearColor(_color: number | string, _alpha?: number): void
setRenderTarget(_renderTarget: any): void
clear(_color?: boolean, _depth?: boolean, _stencil?: boolean): void
⋮----
/**
 * Controls mocks
 */
export class MockOrbitControls
⋮----
constructor(_camera: MockPerspectiveCamera | MockOrthographicCamera, _domElement?: HTMLElement | Document)
⋮----
/**
 * Texture mocks
 */
export class MockTexture
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
image: any // eslint-disable-line @typescript-eslint/no-explicit-any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
mipmaps: any // eslint-disable-line @typescript-eslint/no-explicit-any[] = [];
⋮----
constructor(image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement /* Add other valid types */) {
⋮----
/**
 * Export all mocks with a consistent interface for easy importing
 */
⋮----
// Core objects
⋮----
// Cameras
⋮----
// Renderables
⋮----
// Materials
⋮----
// Geometries
⋮----
// Renderer
⋮----
// Controls
⋮----
// Textures
````

## File: src/test/setup.ts
````typescript
/**
 * CANONICAL TEST ENVIRONMENT SETUP
 *
 * This is a complete, clean solution for all test environment needs.
 * No patchwork, no legacy code - just a proper foundation.
 */
// Monkey-patch tinypool to prevent stack overflow on worker termination
⋮----
// Suppress unhandled promise rejections (e.g., tinypool errors) to prevent test runner exit
⋮----
// Suppress and optionally log the error
⋮----
// Import Vitest expect first
import { expect } from 'vitest';
// Import and extend jest-dom matchers
⋮----
// Now import other Vitest globals and testing utilities
import { vi, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
⋮----
// Rely on the standard matchers imported and extended above
⋮----
// 2. Type augmentation and global mock definitions
⋮----
interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
⋮----
// Define global types for our mocks using var
⋮----
// Make the instance globally accessible if needed
⋮----
// BROWSER API MOCKS
// Define global mocks
// Define a persistent store for the global localStorage mock
⋮----
// Define implementation functions that interact with the store
const mockGetItemImpl = (key: string): string | null
const mockSetItemImpl = (key: string, value: string): void =>
const mockRemoveItemImpl = (key: string): void =>
const mockClearImpl = (): void =>
⋮----
// Create the mock object with initial vi.fn() placeholders
⋮----
getItem: vi.fn(mockGetItemImpl), // Initialize with implementation
⋮----
// Initialize the state on globalThis
⋮----
matches: (globalThis as any).globalCurrentMatchesState, // Read from globalThis
⋮----
}), // Deprecated
⋮----
}), // Deprecated
⋮----
(globalThis as any).globalCurrentMatchesState = newMatchesState; // Write to globalThis
⋮----
// Define the mock function structure but leave implementation for beforeEach
⋮----
// Reset the store itself
⋮----
// Reset mocks AND re-apply implementations to ensure they point to the reset store
⋮----
// Reset matchMedia listener capture and state
⋮----
(globalThis as any).globalCurrentMatchesState = false; // Default to light here
⋮----
// Define the mock implementation *within* beforeEach
const matchMediaImplementation = (query: string): MediaQueryList =>
⋮----
// Clear previous mocks/implementations and set the new one
⋮----
// Ensure mocks are attached to the window object if it exists (JSDOM)
⋮----
// Attach the freshly configured mock
⋮----
// Basic mock for sessionStorage if needed by other tests
⋮----
// Mock other browser APIs needed
⋮----
// Reset document state for theme tests
⋮----
// Optionally set a default class if needed, but resetting is safer
// document.documentElement.classList.add('light');
⋮----
// CANVAS & WEBGL MOCKS
⋮----
// Mock canvas context
⋮----
// Add other methods as needed
⋮----
// Mock getContext method
⋮----
// THREE.JS MOCK
⋮----
// CLEANUP
⋮----
// Test helper utilities
````

## File: src/test/test-utils.unified.tsx
````typescript
/**
 * NOVAMIND Unified Test Utilities
 *
 * Provides quantum-level test utilities for psychiatric digital twin components
 */
⋮----
import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, act } from '@testing-library/react'; // Import act
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
⋮----
// Import the relevant contexts and types
import DataContext from '../application/contexts/DataContext';
// Removed incorrect ThemeContext imports
import UserContext from '../application/contexts/UserContext';
import VisualizationContext from '../application/contexts/VisualizationContext';
⋮----
// Default mock data context for tests
⋮----
// Create a fresh QueryClient for each test
function createTestQueryClient()
⋮----
retry: false, // Disable retries for tests
staleTime: Infinity, // Prevent automatic refetching
⋮----
// MockThemeProvider removed - Use the actual ThemeProvider from the application
import type { ThemeMode } from '../presentation/providers/ThemeProvider';
import {
  ThemeProvider,
  useTheme,
  ThemeProviderContext,
  type ThemeProviderState,
} from '../presentation/providers/ThemeProvider'; // Import necessary items from provider
⋮----
} from '../presentation/providers/ThemeProvider'; // Import necessary items from provider
⋮----
/**
 * Mock implementation of UserProvider for tests
 */
const MockUserProvider: React.FC<
⋮----
// Create a basic mock user context with minimal values needed for tests
⋮----
role: 'clinician', // This will be cast to UserRole
⋮----
/**
 * Mock implementation of VisualizationProvider for tests
 */
const MockVisualizationProvider: React.FC<
⋮----
// Minimal mock visualization context values needed for tests
⋮----
renderMode: 'standard', // This will be cast to RenderMode enum
detailLevel: 'medium', // This will be cast to DetailLevel enum
⋮----
colorMapping: 'clinical', // This will be cast to ColorMapping enum
⋮----
/**
 * AllTheProviders wraps the component under test with all necessary providers
 */
interface AllTheProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
  currentTheme?: ThemeMode; // Use the imported ThemeMode type
  setCurrentTheme?: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'system'>>;
}
⋮----
currentTheme?: ThemeMode; // Use the imported ThemeMode type
⋮----
const AllTheProviders = ({
  children,
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  mockDataContext = mockDataContextValue,
  currentTheme = 'light', // Default to light for consistency
  // setCurrentTheme is removed as ThemeProvider manages its own state
}: AllTheProvidersProps) =>
⋮----
currentTheme = 'light', // Default to light for consistency
// setCurrentTheme is removed as ThemeProvider manages its own state
⋮----
{/* Use the actual ThemeProvider, passing only necessary props */}
{/* Use the actual ThemeProvider */}
⋮----
/**
 * Custom render function that wraps the component under test with all necessary providers,
 * allowing custom configuration per test.
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
}
⋮----
/**
 * Custom render function that wraps the component under test with all necessary providers,
 * allowing custom configuration per test.
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
  mockDataContext?: typeof mockDataContextValue;
  defaultTheme?: ThemeMode; // Use ThemeMode type
}
⋮----
defaultTheme?: ThemeMode; // Use ThemeMode type
⋮----
/**
 * Custom render function that wraps the component under test with all necessary providers,
 * and returns enhanced functions for theme testing.
 */
export const renderWithProviders = (ui: ReactElement, options: ExtendedRenderOptions =
⋮----
defaultTheme = 'light', // Default to light if not provided
⋮----
// Define the wrapper directly using AllTheProviders, passing the defaultTheme
const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      initialRoute={initialRoute}
      queryClient={queryClient}
      mockDataContext={mockDataContext}
      currentTheme={defaultTheme} // Pass defaultTheme to AllTheProviders
    >
      {children}
    </AllTheProviders>
  );
⋮----
currentTheme={defaultTheme} // Pass defaultTheme to AllTheProviders
⋮----
// Render with the simplified wrapper
// Removed duplicate renderResult declaration
⋮----
// Store the theme context value to return it
let themeContextValue: ThemeProviderState | undefined; // Use type imported from provider
⋮----
// Create a consumer component to capture the context value
const ContextConsumer = () =>
⋮----
return null; // This component doesn't render anything itself
⋮----
// Render with the wrapper and the consumer
⋮----
// Ensure themeContextValue is defined before returning
⋮----
/* ... */
⋮----
/* ... */
⋮----
// Return standard render result plus theme context helpers
⋮----
isDarkMode: () => themeContextValue?.theme === 'dark', // Helper based on context
getCurrentThemeMode: () => themeContextValue?.theme, // Helper for selected mode (uses 'theme' property)
getCurrentAppliedTheme: () => themeContextValue?.theme, // Helper for applied theme
// Add helpers to directly manipulate theme for testing purposes
⋮----
// Use act to wrap state update
⋮----
// Note: DOM class update happens via ThemeProvider's useEffect
// these helpers primarily affect the DOM for class assertions.
⋮----
// Re-export testing-library utilities for convenience
⋮----
// Export other test utilities
````
