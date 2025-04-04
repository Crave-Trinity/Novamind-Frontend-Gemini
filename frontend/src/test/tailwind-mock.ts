/**
 * Tailwind CSS mock for testing
 * 
 * This module provides utilities for testing components that use Tailwind CSS
 * and dark mode functionality, without relying on actual CSS processing in JSDOM.
 */

interface CSSMockSystem {
  darkMode: boolean;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
  toggleDarkMode: () => void;
}

/**
 * CSS mock system for tests
 * Provides functions to manipulate dark mode in tests
 */
export const cssMock: CSSMockSystem = {
  darkMode: false,
  
  /**
   * Enable dark mode for tests
   * - Adds 'dark' class to document.documentElement
   * - Updates internal darkMode state
   */
  enableDarkMode: () => { 
    cssMock.darkMode = true;
    applyClassBasedDarkMode();
  },
  
  /**
   * Disable dark mode for tests
   * - Removes 'dark' class from document.documentElement
   * - Updates internal darkMode state
   */
  disableDarkMode: () => { 
    cssMock.darkMode = false;
    applyClassBasedDarkMode();
  },
  
  /**
   * Toggle dark mode state
   * - Toggles between dark and light mode
   */
  toggleDarkMode: () => {
    cssMock.darkMode = !cssMock.darkMode;
    applyClassBasedDarkMode();
  }
};

/**
 * Apply dark mode class to document.documentElement
 * This simulates how Tailwind's dark mode works with the 'dark' class
 */
export const applyClassBasedDarkMode = (): void => {
  if (cssMock.darkMode && document.documentElement) {
    document.documentElement.classList.add('dark');
  } else if (document.documentElement) {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Add minimal Tailwind-like utility classes to the document
 * This creates basic test alternatives to commonly used Tailwind classes
 */
export const injectTailwindTestClasses = (): void => {
  // Only add the style element if it doesn't already exist
  if (!document.getElementById('tailwind-test-styles')) {
    const style = document.createElement('style');
    style.id = 'tailwind-test-styles';
    
    // Add basic utility classes for testing
    style.innerHTML = `
      /* Minimal Tailwind-like utilities for testing */
      .bg-primary-500 { background-color: #0066F0; }
      .dark .bg-primary-500 { background-color: #0066F0; }
      .bg-white { background-color: white; }
      .dark .bg-white { background-color: white; }
      
      .text-primary-500 { color: #0066F0; }
      .dark .text-primary-500 { color: #0066F0; }
      .text-white { color: white; }
      .dark .text-white { color: white; }
      
      .border-primary-500 { border-color: #0066F0; }
      .dark .border-primary-500 { border-color: #0066F0; }
      
      /* Basic Layout */
      .flex { display: flex; }
      .hidden { display: none; }
      .block { display: block; }
      
      /* Basic Spacing */
      .p-4 { padding: 1rem; }
      .m-4 { margin: 1rem; }
      
      /* Add more classes as needed for tests */
    `;
    
    document.head.appendChild(style);
  }
};