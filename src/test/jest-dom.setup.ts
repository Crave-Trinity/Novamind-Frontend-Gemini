/**
 * Vitest setup file for extending with jest-dom matchers properly
 * This is the correct way to extend Vitest with jest-dom according to docs
 */
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with all matchers from jest-dom
expect.extend(matchers);

// This will show up in console to verify the setup is running
console.log('[JEST-DOM SETUP] Testing matchers properly extended');