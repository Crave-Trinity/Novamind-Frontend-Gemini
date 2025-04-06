import { createContext } from 'react';

/**
 * Possible theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system' | 'clinical' | 'sleek-dark' | 'retro' | 'wes';

/**
 * Theme context interface
 */
export interface ThemeContextType {
  /**
   * Current theme mode
   */
  mode: ThemeMode;

  /**
   * Simple theme value ('light' or 'dark') for component usage
   */
  theme: 'light' | 'dark';

  /**
   * Whether dark mode is currently active
   * (either 'dark' mode or 'system' mode with system preference for dark)
   */
  isDarkMode: boolean;

  /**
   * Set theme to a specific mode
   */
  setTheme: (mode: ThemeMode) => void;

  /**
   * Toggle between light and dark modes
   */
  toggleTheme: () => void;
}

/**
 * Default theme context
 * Using undefined as default value to detect usage outside provider
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
