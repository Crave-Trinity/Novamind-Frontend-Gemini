/**
 * React Three Fiber Mock for Testing
 * 
 * Provides a minimal, test-safe mock for the Canvas component.
 * Prevents errors related to WebGL context creation in JSDOM.
 */
import React, { forwardRef } from 'react';

// Mock Canvas as a simple div that renders children
export const Canvas = forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => {
  // Add a data-testid for easier selection in tests if needed
  return React.createElement('div', { ref, 'data-testid': 'mock-r3f-canvas', ...props }, children);
});

// Mock other commonly used exports from R3F if needed, 
// otherwise let them be undefined or mock minimally.
export const useFrame = () => {}; // No-op mock
export const useThree = () => ({ // Return minimal state/gl mock
  gl: { domElement: { style: {} } }, // Mock necessary properties used by controls etc.
  camera: {}, 
  scene: {},
  size: { width: 100, height: 100 },
  // Add other properties if tests rely on them
}); 

// Add other exports as needed based on test failures