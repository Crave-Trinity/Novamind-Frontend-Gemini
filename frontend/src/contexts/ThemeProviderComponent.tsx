import React, { useState, useEffect, useCallback, useMemo } from "react";

import ThemeContext, {
  ThemeContextType, // Import the context type
  ThemeOption,      // Import the correct theme option type
  themeSettings,    // Import the actual settings object
} from "./ThemeContext";
// Removed incorrect ThemeType import from ../types/brain
import { isValidTheme } from "../types/theme"; // Import the correct type guard

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeOption; // Use ThemeOption
}

/**
 * Standalone Theme Provider Component
 * Explicitly created to resolve import issues
 */
const ThemeProviderComponent: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "clinical",
}) => {
  // Get saved theme from localStorage or use default
  const getSavedTheme = (): ThemeOption => { // Return ThemeOption
    try {
      const savedTheme = localStorage.getItem("novamind-theme");
      // Use the imported isValidTheme type guard
      return savedTheme && isValidTheme(savedTheme)
        ? savedTheme // No need for 'as ThemeOption' if guard works
        : initialTheme;
    } catch (e) {
      console.error("Error accessing localStorage", e);
      return initialTheme;
    }
  };

  // Check if theme is valid - This local one is now redundant, using imported one
  // function isValidTheme(theme: string): theme is ThemeOption { ... }

  // State for current theme
  const [theme, setThemeState] = useState<ThemeOption>(getSavedTheme); // Use ThemeOption

  // Computed state for dark mode - Include all dark themes
  const isDarkMode = theme === "dark" || theme === "sleek-dark" || theme === "retro";

  // Get theme settings based on current theme - Use themeSettings directly
  const settings = useMemo(() => themeSettings[theme], [theme]);

  // Set theme and save to localStorage
  const setTheme = useCallback((newTheme: ThemeOption) => { // Use ThemeOption
    try {
      localStorage.setItem("novamind-theme", newTheme);
    } catch (e) {
      console.error("Error saving theme to localStorage", e);
    }

    setThemeState(newTheme);

    // Update the document with the current theme for global CSS
    document.documentElement.setAttribute("data-theme", newTheme);

    // Set dark mode class for Tailwind
    if (newTheme === "sleek-dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle between dark and light mode
  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode ? "clinical" : "sleek-dark");
  }, [isDarkMode, setTheme]);

  // Set initial theme on mount
  useEffect(() => {
    setTheme(theme);

    // Apply prefers-color-scheme if user hasn't selected a theme
    const savedTheme = localStorage.getItem("novamind-theme");
    if (!savedTheme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "sleek-dark" : "clinical");
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem("novamind-theme");
      if (!savedTheme) {
        setTheme(e.matches ? "sleek-dark" : "clinical");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme, theme]);

  // Context value - Ensure it matches ThemeContextType
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleDarkMode,
    isDarkMode,
    settings: settings, // Explicitly assign settings
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProviderComponent;
