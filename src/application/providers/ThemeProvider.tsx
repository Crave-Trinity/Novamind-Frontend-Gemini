import React, { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { ThemeContext, type ThemeMode } from '@application/contexts/ThemeContext';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient';

// Validate if a string is a valid theme mode
const isValidTheme = (theme: string | null): theme is ThemeMode => {
  if (!theme) return false;
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
  children: ReactNode;
}

/**
 * ThemeProvider component that manages theme state
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultTheme = 'system',
  children,
}) => {
  const getInitialTheme = (): ThemeMode => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return isValidTheme(savedTheme) ? savedTheme : defaultTheme;
    } catch (e) {
      console.warn('[ThemeProvider] Failed to access localStorage:', e);
      return defaultTheme;
    }
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme());

  // Function to determine the effective theme (light/dark) based on mode and system preference
  const getEffectiveTheme = (currentMode: ThemeMode): 'light' | 'dark' => {
    if (currentMode === 'system') {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (e) {
        console.warn(
          '[ThemeProvider] matchMedia check failed during effective theme calculation:',
          e
        );
        return 'light'; // Default to light on error
      }
    }
    return currentMode === 'dark' ||
      currentMode === 'sleek-dark' ||
      currentMode === 'retro' ||
      currentMode === 'wes'
      ? 'dark'
      : 'light';
  };

  // State to store the currently *applied* theme ('light' or 'dark')
  const [appliedTheme, setAppliedTheme] = useState<'light' | 'dark'>(() =>
    getEffectiveTheme(getInitialTheme())
  );

  // Effect to apply theme class and save preference
  useEffect(() => {
    const root = document.documentElement;

    // Clear existing theme classes
    root.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-system',
      'theme-clinical',
      'theme-sleek-dark',
      'theme-retro',
      'theme-wes'
    );

    // Add specific theme class (only if not 'system')
    if (mode !== 'system') {
      root.classList.add(`theme-${mode}`);
    }

    // Save non-system theme preference to localStorage
    try {
      if (mode !== 'system') {
        localStorage.setItem('theme', mode);
      } else {
        localStorage.removeItem('theme');
      }
    } catch (e) {
      console.warn('[ThemeProvider] Failed to access localStorage:', e);
    }
  }, [mode]);

  // Effect to handle dark/light class and update appliedTheme state
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = getEffectiveTheme(mode); // Calculate based on current mode

    const applyTheme = (themeToApply: 'light' | 'dark') => {
      console.log(`[ThemeProvider] applyTheme called with: ${themeToApply}`); // Log theme application
      root.classList.toggle('dark', themeToApply === 'dark');
      root.classList.toggle('light', themeToApply === 'light'); // Explicitly set light class
      setAppliedTheme(themeToApply); // Update internal state
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent | { matches: boolean }) => {
        console.log(`[ThemeProvider] handleChange called. Event matches: ${e.matches}`); // Log listener call
        applyTheme(e.matches ? 'dark' : 'light');
      };

      // Initial check & apply
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      // Setup listener
      try {
        mediaQuery.addEventListener('change', handleChange);
      } catch (e) {
        mediaQuery.addListener(handleChange); // Fallback
      }
      // Add polling mechanism for environments (e.g., Puppeteer) that may not reliably trigger media query events
      // const pollInterval = setInterval(() => { // Temporarily disabled polling
      //     const prefersDarkNow = window.matchMedia('(prefers-color-scheme: dark)').matches;
      //     applyTheme(prefersDarkNow ? 'dark' : 'light');
      // }, 100);

      // Cleanup listener
      return () => {
        try {
          mediaQuery.removeEventListener('change', handleChange);
        } catch (e) {
          mediaQuery.removeListener(handleChange);
        }
        // clearInterval(pollInterval); // Temporarily disabled polling cleanup
      };
    } else {
      // Handle non-system themes
      applyTheme(effectiveTheme);
      // No listener needed for non-system themes
      return () => {}; // Return empty cleanup function
    }
  }, [mode]); // Rerun when mode changes

  // Set theme callback
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setMode(newTheme);
    auditLogClient.log(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      action: 'THEME_CHANGE',
      details: `Theme changed to ${newTheme}`,
      result: 'success',
    });
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    // Toggle based on the *applied* theme state
    setMode(appliedTheme === 'dark' ? 'light' : 'dark');
  }, [appliedTheme]); // Depend on appliedTheme state

  // Context value now uses the internal state for applied theme
  const contextValue = useMemo(
    () => ({
      mode, // The selected mode ('system', 'light', 'dark', etc.)
      theme: appliedTheme, // Reflects applied theme state ('light' or 'dark')
      isDarkMode: appliedTheme === 'dark', // Reflects applied theme state
      setTheme,
      toggleTheme,
    }),
    [mode, appliedTheme, setTheme, toggleTheme] // Depend on internal state
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
