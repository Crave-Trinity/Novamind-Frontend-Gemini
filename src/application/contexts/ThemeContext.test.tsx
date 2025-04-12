/* eslint-disable */
/**
 * ThemeContext - Unit Test
 */

import { describe, it, expect, vi } from 'vitest';
import { ThemeContext, useTheme } from './ThemeProvider'; // Import the named exports

// Mock the required dependencies to prevent hanging
// eslint-disable-next-line
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => children,
}));

// eslint-disable-next-line
describe('ThemeContext Module', () => {
// eslint-disable-next-line
  it('exports the ThemeContext', () => {
    expect(ThemeContext).toBeDefined();
  });

// eslint-disable-next-line
  it('exports the useTheme hook', () => {
    expect(useTheme).toBeDefined();
    expect(typeof useTheme).toBe('function');
  });
});
