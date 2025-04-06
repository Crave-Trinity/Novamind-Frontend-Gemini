/**
 * Vitest Setup Pre-Initializer
 *
 * This file is executed before any other setup files to ensure
 * JSDOM global objects are prepared in the test environment.
 *
 * It provides essential jsdom features when tests run in Node.js without a browser.
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Initialize JSDOM globals if running in a non-browser environment
if (typeof window === 'undefined') {
  console.log('[vitest.setup.ts] Initializing JSDOM environment for headless tests...');
}

// Create DOM structure for ThemeProvider's document access
if (typeof document !== 'undefined' && document.documentElement) {
  // Initialize with light mode as default
  document.documentElement.classList.add('light');
  document.documentElement.classList.remove('dark');

  // Add a style element to document head for Tailwind classes
  const style = document.createElement('style');
  style.innerHTML = `
    /* Core styles for testing */
    .bg-white { background-color: white; }
    .dark .bg-white { background-color: #1f2937; }
    .text-black { color: black; }
    .dark .text-black { color: white; }
  `;
  document.head.appendChild(style);

  console.log('[vitest.setup.ts] DOM structure initialized for theme testing');
}

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

console.log('[vitest.setup.ts] Pre-initialization complete');
