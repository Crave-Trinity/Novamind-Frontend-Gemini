/**
 * Central exports file for all test mocks
 * Re-exports specialized mocks for easy imports in tests
 */

import { vi } from 'vitest';

// Specialized Three.js mocks
export * from './three';

// Browser API mocks
export const mockIntersectionObserver = (): void => {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [0],
    })),
  });
};

export const mockResizeObserver = (): void => {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
};

export const mockMatchMedia = (darkMode = false): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query.includes('dark') ? darkMode : !darkMode,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock requestAnimationFrame and cancelAnimationFrame
export const mockAnimationFrame = (): void => {
  global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
    return setTimeout(callback, 0);
  });
  
  global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
    clearTimeout(id);
  });
};

// Mock service workers
export const createClinicalServiceMock = () => ({
  getPredictions: vi.fn().mockResolvedValue([]),
  getBrainModel: vi.fn().mockResolvedValue({}),
  getPatientRisk: vi.fn().mockResolvedValue({ risk: 'low' }),
});

// Mock application services
export const createNeuralOrganismsMock = () => ({
  createNeuralModel: vi.fn().mockReturnValue({}),
  updateConnections: vi.fn(),
  calculateActivity: vi.fn().mockReturnValue([]),
});

// Setup function to initialize all mocks at once
export const setupAllMocks = ({
  darkMode = false,
} = {}): void => {
  // Using the Vitest object which should be globally available
  const vi = globalThis.vi || (window as any).vi;
  
  if (!vi) {
    console.warn('Vitest "vi" object not found in global scope');
    return;
  }
  
  // Initialize browser API mocks
  mockIntersectionObserver();
  mockResizeObserver();
  mockMatchMedia(darkMode);
  mockAnimationFrame();
  
  // Mock console methods to prevent noise in tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
};