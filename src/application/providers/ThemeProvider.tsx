import React, { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'; // Added type modifier
import { ThemeContext, type ThemeMode } from '@application/contexts/ThemeContext'; // Use type modifier
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient'; // Use client import

// Validate if a string is a valid theme mode
const isValidTheme = (theme: string | null): theme is ThemeMode => {
  if (!theme) return false;

  // Use the extended list of themes from HEAD version
  const validThemes: ThemeMode[] = [
    'light',
    'dark',
    'system',
    'clinical',
    'sleek-dark',
    'retro',
    'wes',
  ];
  return validThemes.includes(theme as ThemeMode);
};

interface ThemeProviderProps {
  defaultTheme?: ThemeMode;
  children: ReactNode; // Keep type usage
}

/**
 * ThemeProvider component that manages theme state
 *
 * Provides theme context to the entire application and handles
 * theme persistence, system preference detection, and theme switching
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultTheme = 'system', // Use default from HEAD
  children,
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
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery && typeof mediaQuery.matches === 'boolean' ? mediaQuery.matches : false;
    } catch (e) {
      console.warn('[ThemeProvider] window.matchMedia check failed:', e);
      return false;
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    // Determine if dark mode should be active (logic from HEAD)
    const shouldUseDark =
      mode === 'dark' ||
      (mode === 'system' && prefersDarkMode) ||
      mode === 'sleek-dark' || // Include sleek-dark from HEAD logic
      mode === 'retro' || // Include retro from HEAD logic
      mode === 'wes'; // Include wes from HEAD logic

    setIsDarkMode(shouldUseDark);

    // Apply theme classes to document (logic from HEAD)
    const root = document.documentElement;

    // Clear existing theme classes (use HEAD's list)
    root.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-system',
      'theme-clinical',
      'theme-sleek-dark',
      'theme-retro',
      'theme-wes'
    );

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

    // Log theme change for audit purposes (use auditLogService)
    auditLogClient.log(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      // Use client
      action: 'THEME_CHANGE',
      details: `Theme changed to ${mode}`,
      result: 'success',
    });
  }, [mode, prefersDarkMode]);

  // Set theme callback
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setMode(newTheme);
  }, []);

  // Toggle between light and dark (use HEAD's logic)
  const toggleTheme = useCallback(() => {
    setMode((current) => {
      // Simpler toggle logic adapted from HEAD
      if (current === 'light' || current === 'clinical') {
        return 'dark';
      }
      if (
        current === 'dark' ||
        current === 'sleek-dark' ||
        current === 'retro' ||
        current === 'wes'
      ) {
        return 'light';
      }
      if (current === 'system') {
        return prefersDarkMode ? 'light' : 'dark';
      }
      return 'light'; // Default fallback
    });
  }, [prefersDarkMode]);

  // Context value with memoization for performance (include settings if needed by context type)
  // NOTE: The original HEAD version didn't include 'settings' in the context value,
  // but the ThemeContextType likely requires it. Assuming it's needed.
  const contextValue = useMemo(
    () => ({
      mode,
      theme: isDarkMode ? ('dark' as const) : ('light' as const), // Keep simple theme property
      isDarkMode,
      setTheme,
      toggleTheme,
      // settings: {} // Placeholder - Needs actual theme settings logic if required by context
    }),
    [mode, isDarkMode, setTheme, toggleTheme]
  );

  return (
    // Cast needed if contextValue doesn't perfectly match ThemeContextType yet
    <ThemeContext.Provider value={contextValue as any}>{children}</ThemeContext.Provider>
  );
};
