import { createContext, useContext } from 'react';

/**
 * Available themes for the application
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme context interface definition
 */
export interface ThemeContextType {
  /** Current theme mode */
  mode: ThemeMode;
  /** Whether dark mode is currently active */
  isDarkMode: boolean;
  /** Set theme mode to specific value */
  setTheme: (mode: ThemeMode) => void;
  /** Toggle between light and dark modes */
  toggleTheme: () => void;
}

/**
 * Default theme context state
 */
const defaultThemeContext: ThemeContextType = {
  mode: 'system',
  isDarkMode: false,
  setTheme: () => undefined,
  toggleTheme: () => undefined,
};

/**
 * Theme context for application-wide theme management
 */
export const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

/**
 * Hook for accessing theme context throughout the application
 * @returns Theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
