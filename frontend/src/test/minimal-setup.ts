/**
 * NOVAMIND Neural Architecture
 * Minimal Test Setup with Quantum Precision
 * 
 * This file provides a simplified setup for tests that avoids conflicts
 * with other setup files and provides a clean testing environment.
 */

import { vi } from 'vitest';
import { registerUnifiedThreeMock } from './unified-three-mock';

console.log('🧠 NOVAMIND Minimal Test Setup: Initializing with quantum precision');

// Register the unified Three.js mock with clinical precision
const threeMocks = registerUnifiedThreeMock();
console.log('🧠 Unified Three.js mock registered with quantum precision');

// Explicitly mock @react-three/a11y with quantum precision
vi.mock('@react-three/a11y', () => ({
  A11y: vi.fn().mockImplementation(({ children }) => children),
  useA11y: vi.fn().mockReturnValue({
    focus: vi.fn(),
    hover: vi.fn(),
    pressed: vi.fn()
  })
}));
console.log('🧠 @react-three/a11y mock registered with clinical precision');

// Mock browser APIs with mathematical elegance
if (typeof window !== 'undefined') {
  // Mock ResizeObserver with quantum precision
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as any;
    console.log('🧠 ResizeObserver mock registered with clinical precision');
  }
  
  // Mock IntersectionObserver with mathematical elegance
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      root = null;
      rootMargin = '0px';
      thresholds = [0];
      takeRecords = vi.fn().mockReturnValue([]);
      
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
    } as any;
    console.log('🧠 IntersectionObserver mock registered with quantum precision');
  }
  
  // Mock requestAnimationFrame with clinical precision
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = vi.fn().mockImplementation(callback => {
      return setTimeout(() => callback(Date.now()), 0);
    });
    console.log('🧠 requestAnimationFrame mock registered with mathematical elegance');
  }
  
  // Mock cancelAnimationFrame with quantum precision
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = vi.fn().mockImplementation(id => {
      clearTimeout(id);
    });
    console.log('🧠 cancelAnimationFrame mock registered with clinical precision');
  }
}

console.log('🧠 NOVAMIND Minimal Test Setup: Completed with quantum precision');
