import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeContext, ThemeMode } from '@application/contexts/ThemeContext';
import { auditLogService, AuditEventType } from '@infrastructure/services/AuditLogService';

// Validate if a string is a valid theme mode
const isValidTheme = (theme: string | null): theme is ThemeMode => {
  if (!theme) return false;
  
  const validThemes: ThemeMode[] = ['light', 'dark', 'system', 'clinical', 'sleek-dark', 'retro', 'wes'];
  return validThemes.includes(theme as ThemeMode);
};

interface ThemeProviderProps {
  defaultTheme?: ThemeMode;
  children: React.ReactNode;
}

/**
 * ThemeProvider component that manages theme state
 * 
 * Provides theme context to the entire application and handles
 * theme persistence, system preference detection, and theme switching
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultTheme = 'system',
  children
}) => {
  // Get initial theme from localStorage or use default
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('theme');
    return isValidTheme(savedTheme) ? savedTheme : defaultTheme;
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Detect system preference for dark mode
  const prefersDarkMode = useMemo(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Apply theme to document
  useEffect(() => {
    // Determine if dark mode should be active
    const shouldUseDark = 
      mode === 'dark' || 
      (mode === 'system' && prefersDarkMode) ||
      mode === 'sleek-dark';
    
    setIsDarkMode(shouldUseDark);
    
    // Apply theme classes to document
    const root = document.documentElement;
    
    // Clear existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-clinical', 'theme-sleek-dark', 'theme-retro', 'theme-wes');
    
    // Set dark/light mode
    if (shouldUseDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Add specific theme class
    root.classList.add(`theme-${mode}`);
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', mode);
    
    // Log theme change for audit purposes
    auditLogService.log(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      action: 'THEME_CHANGE',
      details: `Theme changed to ${mode}`,
      result: 'success'
    });
  }, [mode, prefersDarkMode]);

  // Set theme callback
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setMode(newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setMode(current => (current === 'light' ? 'dark' : 'light'));
  }, []);

  // Context value with memoization for performance
  const contextValue = useMemo(() => ({
    mode,
    theme: isDarkMode ? 'dark' as const : 'light' as const, // Add simple theme property for components with correct type
    isDarkMode,
    setTheme,
    toggleTheme
  }), [mode, isDarkMode, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
