import React, { useState, useEffect, useCallback } from "react";
import ThemeContext, {
  ThemeContextType,
  ThemeOption,
  themeSettings,
} from "../contexts/ThemeContext";

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeOption;
}

/**
 * Theme provider component
 *
 * Provides theme context to the entire application following clean architecture
 * This provider is purely in the application layer and connects to the domain
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "clinical",
}) => {
  // Get saved theme from localStorage or use default
  const getSavedTheme = (): ThemeOption => {
    try {
      const savedTheme = localStorage.getItem("novamind-theme");
      return savedTheme && isValidTheme(savedTheme)
        ? (savedTheme as ThemeOption)
        : initialTheme;
    } catch (e) {
      console.error("Error accessing localStorage", e);
      return initialTheme;
    }
  };

  // Check if theme is valid
  function isValidTheme(theme: string): theme is ThemeOption {
    return ["light", "dark", "sleek", "clinical"].includes(theme);
  }

  // State for current theme
  const [theme, setThemeState] = useState<ThemeOption>(getSavedTheme);

  // Computed state for dark mode
  const isDarkMode = theme === "dark" || theme === "sleek";

  // Set theme and save to localStorage
  const setTheme = useCallback((newTheme: ThemeOption) => {
    try {
      localStorage.setItem("novamind-theme", newTheme);
    } catch (e) {
      console.error("Error saving theme to localStorage", e);
    }

    setThemeState(newTheme);

    // Update the document with the current theme for global CSS
    document.documentElement.setAttribute("data-theme", newTheme);

    // Set dark mode class for Tailwind
    if (newTheme === "dark" || newTheme === "sleek") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle between dark and light mode
  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode ? "clinical" : "dark");
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
      setTheme(prefersDark ? "dark" : "clinical");
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem("novamind-theme");
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "clinical");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme, theme]);

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    settings: themeSettings[theme],
    setTheme,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
