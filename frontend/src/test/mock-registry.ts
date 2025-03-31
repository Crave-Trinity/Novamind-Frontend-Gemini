/**
 * NOVAMIND Neural Architecture
 * Mock Registry with Quantum Precision
 * 
 * This centralized registry ensures consistent mock implementation
 * across all test files with clinical accuracy.
 */

import { vi } from 'vitest';

// Mock registry initialization with neural precision
export function setupMockRegistry() {
  // Register mock for external SVG imports used in visualization
  vi.mock('*.svg', async () => {
    return {
      default: 'mock-svg-url'
    };
  });

  // Register neural-safe mocks for CSS modules
  vi.mock('*.module.css', async () => {
    return {
      default: new Proxy({}, {
        get: (_, prop) => `mock-css-${String(prop)}`
      })
    };
  });
  
  // Register neural-safe mocks for GLSL shaders
  vi.mock('*.glsl', async () => {
    return {
      default: '// Mock GLSL shader code'
    };
  });
  
  console.log('✅ Neural-safe mock registry initialized with quantum precision');
}

// Note: Direct exports removed as they're now handled in neural-mock-system.ts
