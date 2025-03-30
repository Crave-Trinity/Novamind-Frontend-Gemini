import { createContext, useContext } from "react";

/**
 * Available theme options
 * Following clean architecture, we define this in the application layer but it's domain-driven
 */
export type ThemeOption = "light" | "dark" | "sleek" | "clinical";

/**
 * Theme settings interface
 * Pure data structure that doesn't depend on React or any UI framework
 */
export interface ThemeSettings {
  bgColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  glowIntensity: number;
  useBloom: boolean;
}

/**
 * Theme context interface
 * Defines the contract for theme operations
 */
export interface ThemeContextType {
  theme: ThemeOption;
  isDarkMode: boolean;
  settings: ThemeSettings;
  setTheme: (newTheme: ThemeOption) => void;
  toggleDarkMode: () => void;
}

/**
 * Default theme settings
 * These are the canonical settings for each theme option
 */
export const themeSettings: Record<ThemeOption, ThemeSettings> = {
  light: {
    bgColor: '#ffffff',
    primaryColor: '#4c6ef5',
    secondaryColor: '#adb5bd',
    textColor: '#000000',
    glowIntensity: 0,
    useBloom: false
  },
  dark: {
    bgColor: '#121212',
    primaryColor: '#4c6ef5',
    secondaryColor: '#343a40',
    textColor: '#ffffff',
    glowIntensity: 0.3,
    useBloom: true
  },
  sleek: {
    bgColor: '#1a1a2e',
    primaryColor: '#00bcd4',
    secondaryColor: '#2a2a5a',
    textColor: '#ffffff',
    glowIntensity: 0.8,
    useBloom: true
  },
  clinical: {
    bgColor: '#f8f9fa',
    primaryColor: '#2c7be5',
    secondaryColor: '#edf2f9',
    textColor: '#12263f',
    glowIntensity: 0,
    useBloom: false
  }
};

/**
 * Create context with default values
 * Following clean architecture, this is the application layer interface
 */
const ThemeContext = createContext<ThemeContextType>({
  theme: "clinical",
  isDarkMode: false,
  settings: themeSettings.clinical,
  setTheme: () => {},
  toggleDarkMode: () => {}
});

/**
 * Custom hook for consuming the theme context
 * Provides type safety and clear error messages
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
