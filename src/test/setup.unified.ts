/**
 * Unified Test Environment Setup
 * 
 * This is the single source of truth for all test environment configuration.
 * It properly initializes JSDOM, sets up mocks, and configures the testing library.
 */
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// ==== DOM Environment Setup ====
// Log startup message
console.log('[setup.unified.ts] Initializing test environment');

// Ensure DOM elements exist for tests that use document
beforeAll(() => {
  // Mock browser APIs
  if (typeof window !== 'undefined') {
    // Mock matchMedia for responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Mock IntersectionObserver
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Mock ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    console.log('[setup.unified.ts] Browser API mocks applied');
  }

  // Initialize document with default light theme
  if (typeof document !== 'undefined' && document.documentElement) {
    // Initialize with light theme
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    
    // Add necessary Tailwind classes for testing
    const style = document.createElement('style');
    style.innerHTML = `
      /* Core Tailwind classes for testing */
      *, ::before, ::after { box-sizing: border-box; }
      html { line-height: 1.5; }
      body { margin: 0; font-family: system-ui, sans-serif; }
      
      /* Light/dark mode colors */
      .bg-white { background-color: #ffffff; }
      .bg-black { background-color: #000000; }
      .bg-primary-500 { background-color: #0066F0; }
      .bg-gray-100 { background-color: #f3f4f6; }
      .bg-gray-200 { background-color: #e5e7eb; }
      .bg-gray-800 { background-color: #1f2937; }
      .bg-gray-900 { background-color: #111827; }
      
      .text-white { color: #ffffff; }
      .text-black { color: #000000; }
      .text-primary-500 { color: #0066F0; }
      .text-gray-800 { color: #1f2937; }
      .text-gray-300 { color: #d1d5db; }
      
      /* Spacing utilities */
      .p-4 { padding: 1rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .m-2 { margin: 0.5rem; }
      .mt-2 { margin-top: 0.5rem; }
      .rounded { border-radius: 0.25rem; }
      .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      
      /* Dark mode variants */
      .dark .bg-white { background-color: #111827; }
      .dark .bg-black { background-color: #000000; }
      .dark .bg-gray-100 { background-color: #374151; }
      .dark .bg-gray-200 { background-color: #1f2937; }
      .dark .bg-gray-800 { background-color: #111827; }
      .dark .text-white { color: #ffffff; }
      .dark .text-black { color: #d1d5db; }
      .dark .text-gray-800 { color: #f3f4f6; }
      .dark .text-gray-300 { color: #9ca3af; }
      
      /* Component-specific styles */
      .dark .bg-primary-500 { background-color: #0066F0; }
      .dark .text-primary-500 { color: #0066F0; }
    `;
    
    // Add style to document head
    document.head.appendChild(style);
    
    console.log('[setup.unified.ts] DOM structure and Tailwind classes initialized');
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});

// Export a helper to toggle dark mode in tests
export const tailwindHelper = {
  enableDarkMode: () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      return true;
    }
    return false;
  },
  
  disableDarkMode: () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      return true;
    }
    return false;
  },
  
  isDarkMode: () => {
    if (typeof document !== 'undefined' && document.documentElement) {
      // Directly query the document element within the function
      return document.querySelector('html')?.classList.contains('dark') ?? false;
    }
    return false;
  }
};

console.log('[setup.unified.ts] Setup complete');