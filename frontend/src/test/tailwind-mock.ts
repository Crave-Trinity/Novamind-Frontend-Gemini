/**
 * Tailwind CSS Mock for Testing
 * 
 * This module provides utilities for testing components that use Tailwind CSS,
 * particularly those with dark mode variants.
 */

// Global state for dark mode that persists between tests
let darkMode = false;

/**
 * Tailwind CSS mock for testing environment
 */
export const tailwindMock = {
  // Dark mode state
  darkMode,
  
  // Enable dark mode in tests and return true to confirm operation
  enableDarkMode: () => {
    darkMode = true;
    applyDarkModeClass();
    console.log('[tailwind-mock.ts] Dark mode enabled');
    return true;
  },
  
  // Disable dark mode in tests and return false to confirm operation
  disableDarkMode: () => {
    darkMode = false;
    applyDarkModeClass();
    console.log('[tailwind-mock.ts] Dark mode disabled');
    return false;
  },
  
  // Get current dark mode state
  isDarkMode: () => darkMode,
  
  // Initialize Tailwind mock in test environment
  initialize: () => {
    injectTailwindStyles();
    applyDarkModeClass();
    console.log('[tailwind-mock.ts] Tailwind mock styles applied to document');
  }
};

/**
 * Apply dark mode class to document root
 * This is how Tailwind's dark mode detection works with class strategy
 */
function applyDarkModeClass() {
  if (typeof document !== 'undefined' && document.documentElement) {
    // Always ensure we remove first to avoid duplicates
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');
    
    // Add the appropriate class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  }
}

/**
 * Inject minimal Tailwind-like styles for testing purposes
 */
function injectTailwindStyles() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Minimal Tailwind-like reset */
      *, ::before, ::after { box-sizing: border-box; }
      html { line-height: 1.5; }
      body { margin: 0; font-family: system-ui, sans-serif; }
      
      /* Common utilities */
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
      
      .p-4 { padding: 1rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .m-2 { margin: 0.5rem; }
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
    document.head.appendChild(style);
  }
}