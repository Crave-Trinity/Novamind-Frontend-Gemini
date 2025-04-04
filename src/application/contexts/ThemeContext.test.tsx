/**
 * ThemeContext - Minimal Test
 * Corrected to properly import themeSettings from the right source
 */

import { describe, it, expect, vi } from 'vitest';
import ThemeContext from './ThemeProvider'; // First import from ThemeProvider

// Mock the required dependencies to prevent hanging
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => children,
}));

// Define minimal test for themeSettings
describe('ThemeContext Module (Minimal)', () => {
  it('exists as a module', () => {
    expect(ThemeContext).toBeDefined();
  });
});
