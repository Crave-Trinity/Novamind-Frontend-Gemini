/**
 * Enhanced Test Setup
 * 
 * Provides improved test environment setup with fixes for:
 * - Tailwind CSS class handling
 * - Animation cleanup
 * - WebGL context mocking
 * - localStorage/sessionStorage
 * - Window resize and observation APIs
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import './mocks/intersection-observer';
import './mocks/resize-observer';
import './mocks/match-media';
import './url-fix';

// Create root element for rendering
beforeAll(() => {
  // Create root element
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  
  // Set up document for Tailwind dark mode
  document.documentElement.classList.add('light');
  
  // Add a style element to simulate Tailwind
  const style = document.createElement('style');
  style.innerHTML = `
    /* Minimal CSS for testing Tailwind classes */
    .dark { color-scheme: dark; }
    .light { color-scheme: light; }
    
    /* Background colors */
    .bg-white { background-color: white; }
    .bg-gray-800 { background-color: #1f2937; }
    .dark .dark\\:bg-gray-800 { background-color: #1f2937; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .dark .dark\\:bg-gray-700 { background-color: #374151; }
    .dark .dark\\:bg-gray-900 { background-color: #111827; }
    .bg-primary-500 { background-color: #0066F0; }
    .dark .dark\\:bg-primary-600 { background-color: #0052C0; }
    
    /* Text colors */
    .text-white { color: white; }
    .text-gray-800 { color: #1f2937; }
    .dark .dark\\:text-white { color: white; }
    .text-gray-600 { color: #4b5563; }
    .dark .dark\\:text-gray-300 { color: #d1d5db; }
    .text-gray-500 { color: #6b7280; }
    .dark .dark\\:text-gray-400 { color: #9ca3af; }
    
    /* Shadows */
    .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
    .dark .dark\\:shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.5); }

    /* Hover effects */
    .hover\\:bg-primary-600:hover { background-color: #0052C0; }
    .dark .dark\\:hover\\:bg-primary-700:hover { background-color: #003D90; }
  `;
  document.head.appendChild(style);
});

// Clean up after all tests
afterAll(() => {
  // Remove the root element
  const root = document.getElementById('root');
  if (root) {
    document.body.removeChild(root);
  }
  
  // Clean up any style elements added
  document.querySelectorAll('style').forEach(el => el.remove());
  
  // Reset classLists
  document.documentElement.className = '';
});

// Reset between tests
beforeEach(() => {
  // Clear body content between tests
  if (document.body.firstChild !== document.getElementById('root')) {
    document.body.innerHTML = '<div id="root"></div>';
  }
  
  // Clear mocks
  vi.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset document class list while preserving the root element
  document.documentElement.className = 'light';
  
  // Clear any lingering timeouts or intervals
  vi.clearAllTimers();
});

// Mock console methods to catch warnings/errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
  // Filter React internal errors during tests
  const isReactBug = args.some(arg => 
    typeof arg === 'string' && 
    (arg.includes('Warning: ReactDOM.render') || 
     arg.includes('Warning: React.createElement'))
  );
  
  if (!isReactBug) {
    originalConsoleError(...args);
  }
};

console.warn = (...args: any[]) => {
  // Filter common test warnings
  const isTestingWarning = args.some(arg => 
    typeof arg === 'string' && 
    (arg.includes('Warning: ReactDOM.render') || 
     arg.includes('Warning: React.createElement') ||
     arg.includes('act(...) is not supported in production builds of React'))
  );
  
  if (!isTestingWarning) {
    originalConsoleWarn(...args);
  }
};

// Ensure cleanup of all mocks after each test
afterEach(() => {
  // Reset console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  
  // Restore animation frame mocks if they exist
  try {
    vi.spyOn(window, 'requestAnimationFrame').mockRestore();
    vi.spyOn(window, 'cancelAnimationFrame').mockRestore();
  } catch (e) {
    // Ignore errors if the mocks don't exist
  }
  
  // Clean up any canvas contexts
  document.querySelectorAll('canvas').forEach(canvas => {
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && typeof gl.getExtension === 'function') {
        const extension = gl.getExtension('WEBGL_lose_context');
        if (extension) {
          extension.loseContext();
        }
      }
      canvas.remove();
    } catch (e) {
      // Ignore errors from canvas cleanup
    }
  });
});

// Define global WebGL-related mocks
global.ResizeObserver = class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock DOMRect with required fromRect method
class MockDOMRect {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  top = 0;
  right = 0;
  bottom = 0;
  left = 0;
  
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
    this.left = x;
  }
  
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left
    };
  }

  // Add static fromRect method
  static fromRect(rectInit?: DOMRectInit): DOMRect {
    const { x = 0, y = 0, width = 0, height = 0 } = rectInit || {};
    return new MockDOMRect(x, y, width, height) as unknown as DOMRect;
  }
}

// Apply the mock to global
global.DOMRect = MockDOMRect as unknown as typeof DOMRect;