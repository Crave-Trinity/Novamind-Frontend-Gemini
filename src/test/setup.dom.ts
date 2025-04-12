/**
 * Setup file for DOM-specific tests
 * This file ensures proper JSDOM configuration for tests that rely on browser APIs
 */
import { expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Ensure JSDOM environment is properly set up
if (typeof window === 'undefined') {
  throw new Error('Tests requiring DOM must run in a JSDOM environment. Check your Vitest configuration.');
}

// Simple match media mock
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('(prefers-color-scheme: dark)') ? false : true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Verify document API is available - JSDOM should provide this automatically
if (typeof document === 'undefined' || !document.documentElement) {
  throw new Error('document or document.documentElement is not defined. JSDOM setup issue.');
}

console.log('[DOM TEST SETUP] DOM-specific test environment setup complete.');