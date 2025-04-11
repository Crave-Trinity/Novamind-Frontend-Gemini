/**
 * ThemeContext - Unit Test
 */

import { describe, it, expect, vi } from 'vitest';
import { ThemeContext, useTheme } from './ThemeProvider'; // Import the named exports

// Mock the required dependencies to prevent hanging
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ThemeContext Module', () => {
  it('exports the ThemeContext', () => {
    expect(ThemeContext).toBeDefined();
  });

  it('exports the useTheme hook', () => {
    expect(useTheme).toBeDefined();
    expect(typeof useTheme).toBe('function');
  });
});
