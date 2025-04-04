/**
 * Enhanced Tailwind CSS Testing Support
 * 
 * A comprehensive implementation of Tailwind CSS mocking for tests
 * that ensures proper class handling, dark mode support, and theme compatibility.
 */
import { vi } from 'vitest';

// Global state for dark mode that persists between tests
let darkMode = false;

/**
 * Enhanced Tailwind CSS mock for testing environment
 */
export const enhancedTailwindHelper = {
  // Dark mode state
  isDarkMode: () => darkMode,
  
  // Enable dark mode in tests and return true to confirm operation
  enableDarkMode: () => {
    darkMode = true;
    applyDarkModeClass();
    return true;
  },
  
  // Disable dark mode in tests and return false to confirm operation
  disableDarkMode: () => {
    darkMode = false;
    applyDarkModeClass();
    return false;
  },
  
  // Toggle dark mode and return new state
  toggleDarkMode: () => {
    darkMode = !darkMode;
    applyDarkModeClass();
    return darkMode;
  },
  
  // Initialize Tailwind mock in test environment
  initialize: () => {
    injectTailwindStyles();
    applyDarkModeClass();
  },
  
  // Reset all Tailwind test state
  reset: () => {
    darkMode = false;
    applyDarkModeClass();
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
 * Inject comprehensive Tailwind-like styles for testing purposes
 * Includes a wider range of utility classes commonly used in the application
 */
function injectTailwindStyles() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Core reset styles */
      *, ::before, ::after { box-sizing: border-box; }
      html { line-height: 1.5; }
      body { margin: 0; font-family: system-ui, sans-serif; }
      
      /* Layout utilities */
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .flex-row { flex-direction: row; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      .items-center { align-items: center; }
      .items-start { align-items: flex-start; }
      .relative { position: relative; }
      .absolute { position: absolute; }
      .fixed { position: fixed; }
      .grid { display: grid; }
      .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .gap-2 { gap: 0.5rem; }
      .gap-4 { gap: 1rem; }
      
      /* Color utilities - Light Mode */
      .bg-white { background-color: #ffffff; }
      .bg-black { background-color: #000000; }
      .bg-primary-50 { background-color: #eef4ff; }
      .bg-primary-100 { background-color: #d9e6ff; }
      .bg-primary-200 { background-color: #bcd6ff; }
      .bg-primary-300 { background-color: #91b9ff; }
      .bg-primary-400 { background-color: #5e93fa; }
      .bg-primary-500 { background-color: #0066F0; }
      .bg-primary-600 { background-color: #0054cc; }
      .bg-primary-700 { background-color: #00429e; }
      .bg-primary-800 { background-color: #003073; }
      .bg-primary-900 { background-color: #001c45; }
      .bg-gray-50 { background-color: #f9fafb; }
      .bg-gray-100 { background-color: #f3f4f6; }
      .bg-gray-200 { background-color: #e5e7eb; }
      .bg-gray-300 { background-color: #d1d5db; }
      .bg-gray-400 { background-color: #9ca3af; }
      .bg-gray-500 { background-color: #6b7280; }
      .bg-gray-600 { background-color: #4b5563; }
      .bg-gray-700 { background-color: #374151; }
      .bg-gray-800 { background-color: #1f2937; }
      .bg-gray-900 { background-color: #111827; }
      
      /* Text colors - Light Mode */
      .text-white { color: #ffffff; }
      .text-black { color: #000000; }
      .text-primary-500 { color: #0066F0; }
      .text-primary-600 { color: #0054cc; }
      .text-primary-700 { color: #00429e; }
      .text-gray-50 { color: #f9fafb; }
      .text-gray-100 { color: #f3f4f6; }
      .text-gray-200 { color: #e5e7eb; }
      .text-gray-300 { color: #d1d5db; }
      .text-gray-400 { color: #9ca3af; }
      .text-gray-500 { color: #6b7280; }
      .text-gray-600 { color: #4b5563; }
      .text-gray-700 { color: #374151; }
      .text-gray-800 { color: #1f2937; }
      .text-gray-900 { color: #111827; }
      
      /* Spacing utilities */
      .p-1 { padding: 0.25rem; }
      .p-2 { padding: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .p-4 { padding: 1rem; }
      .p-5 { padding: 1.25rem; }
      .p-6 { padding: 1.5rem; }
      .p-8 { padding: 2rem; }
      .p-10 { padding: 2.5rem; }
      .p-12 { padding: 3rem; }
      .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
      .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
      .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
      .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
      .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
      .m-1 { margin: 0.25rem; }
      .m-2 { margin: 0.5rem; }
      .m-3 { margin: 0.75rem; }
      .m-4 { margin: 1rem; }
      .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
      .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
      .mx-3 { margin-left: 0.75rem; margin-right: 0.75rem; }
      .mx-4 { margin-left: 1rem; margin-right: 1rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
      .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
      .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
      .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
      .mt-1 { margin-top: 0.25rem; }
      .mt-2 { margin-top: 0.5rem; }
      .mt-4 { margin-top: 1rem; }
      .mt-6 { margin-top: 1.5rem; }
      .mb-1 { margin-bottom: 0.25rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      
      /* Sizing utilities */
      .w-full { width: 100%; }
      .w-auto { width: auto; }
      .w-screen { width: 100vw; }
      .h-full { height: 100%; }
      .h-auto { height: auto; }
      .h-screen { height: 100vh; }
      .max-w-md { max-width: 28rem; }
      .max-w-lg { max-width: 32rem; }
      .max-w-xl { max-width: 36rem; }
      .max-w-2xl { max-width: 42rem; }
      .max-w-3xl { max-width: 48rem; }
      .max-w-screen-md { max-width: 768px; }
      .max-w-screen-lg { max-width: 1024px; }
      
      /* Typography */
      .text-xs { font-size: 0.75rem; }
      .text-sm { font-size: 0.875rem; }
      .text-base { font-size: 1rem; }
      .text-lg { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .text-2xl { font-size: 1.5rem; }
      .text-3xl { font-size: 1.875rem; }
      .font-normal { font-weight: 400; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .font-bold { font-weight: 700; }
      .text-center { text-align: center; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }
      
      /* Border utilities */
      .rounded { border-radius: 0.25rem; }
      .rounded-md { border-radius: 0.375rem; }
      .rounded-lg { border-radius: 0.5rem; }
      .rounded-xl { border-radius: 0.75rem; }
      .rounded-full { border-radius: 9999px; }
      .border { border-width: 1px; }
      .border-2 { border-width: 2px; }
      .border-gray-200 { border-color: #e5e7eb; }
      .border-gray-300 { border-color: #d1d5db; }
      
      /* Box shadow */
      .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      
      /* Animation */
      .transition { transition-property: all; transition-duration: 150ms; }
      .duration-150 { transition-duration: 150ms; }
      .duration-300 { transition-duration: 300ms; }
      .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
      
      /* Dark mode variants */
      .dark .bg-white { background-color: #111827; }
      .dark .bg-black { background-color: #000000; }
      .dark .bg-primary-500 { background-color: #0066F0; }
      .dark .bg-primary-600 { background-color: #0078f0; }
      .dark .bg-gray-50 { background-color: #374151; }
      .dark .bg-gray-100 { background-color: #374151; }
      .dark .bg-gray-200 { background-color: #1f2937; }
      .dark .bg-gray-300 { background-color: #374151; }
      .dark .bg-gray-800 { background-color: #111827; }
      .dark .bg-gray-900 { background-color: #0f172a; }
      
      .dark .text-white { color: #ffffff; }
      .dark .text-black { color: #d1d5db; }
      .dark .text-gray-800 { color: #f3f4f6; }
      .dark .text-gray-700 { color: #f9fafb; }
      .dark .text-gray-600 { color: #f3f4f6; }
      .dark .text-gray-500 { color: #e5e7eb; }
      .dark .text-gray-400 { color: #d1d5db; }
      .dark .text-gray-300 { color: #9ca3af; }
      .dark .text-gray-200 { color: #e5e7eb; }
      .dark .text-gray-100 { color: #f3f4f6; }
      
      .dark .border-gray-200 { border-color: #374151; }
      .dark .border-gray-300 { border-color: #4b5563; }
      
      /* Brain visualization component specific styles */
      .brain-region { opacity: 0.8; }
      .dark .brain-region { opacity: 0.9; }
      .brain-region-active { opacity: 1; }
      .dark .brain-region-active { opacity: 1; }
      
      /* Neural connection specific styles */
      .neural-connection { stroke: #0066F0; stroke-width: 1; }
      .dark .neural-connection { stroke: #0078f0; stroke-width: 1; }
      .neural-connection-active { stroke: #0066F0; stroke-width: 2; }
      .dark .neural-connection-active { stroke: #0078f0; stroke-width: 2; }
      
      /* Animation helpers for brain visualizations */
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Export default helper
export default enhancedTailwindHelper;