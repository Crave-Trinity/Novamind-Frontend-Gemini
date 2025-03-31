/**
 * NOVAMIND Testing Framework
 * useTheme Hook Tests
 * 
 * Tests for the useTheme hook with TypeScript type safety
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { ThemeOption } from '../../types/theme';
import ThemeContext from '../../contexts/ThemeContext';
// Fixed imports for Theme components
import ThemeContext from '../../contexts/ThemeContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { createThemeWrapper } from '../../test/test-utils';

describe('useTheme', () => {
  it('returns theme context when used within ThemeProvider', () => {
    // Render hook with ThemeProvider wrapper
    const { result } = renderHook(() => useTheme(), {
      wrapper: createThemeWrapper('clinical')
    });
    
    // Verify results
    expect(result.current).toBeDefined();
    expect(result.current.theme).toBe('clinical');
    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.toggleDarkMode).toBe('function');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('can set theme using the setTheme function', () => {
    // Render hook with ThemeProvider wrapper
    const { result } = renderHook(() => useTheme(), {
      wrapper: createThemeWrapper('clinical')
    });
    
    // Call setTheme
    act(() => {
      result.current.setTheme('sleek-dark');
    });
    
    // Verify theme was updated
    expect(result.current.theme).toBe('sleek-dark');
    expect(result.current.isDarkMode).toBe(true);
  });
  
  it('can toggle dark mode with toggleDarkMode function', () => {
    // Render hook with initial light theme
    const { result } = renderHook(() => useTheme(), {
      wrapper: createThemeWrapper('clinical')
    });
    
    // Initial state should be light
    expect(result.current.isDarkMode).toBe(false);
    
    // Toggle to dark mode
    act(() => {
      result.current.toggleDarkMode();
    });
    
    // Should now be dark mode
    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.theme).toBe('sleek-dark');
    
    // Toggle back to light mode
    act(() => {
      result.current.toggleDarkMode();
    });
    
    // Should be back to light mode
    expect(result.current.isDarkMode).toBe(false);
  });
  
  it('throws error when used outside ThemeProvider', () => {
    // Try to use hook without a provider
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
