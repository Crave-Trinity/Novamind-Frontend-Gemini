import React, { useState, useEffect, useCallback } from "react";
import ThemeContext, { themeSettings } from "./ThemeContext";
import { isValidTheme } from "../types/theme";
import type { ThemeOption } from "../types/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeOption;
}

/**
 * Theme provider component
 * Manages theme state and provides context to children
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "clinical",
}) => {
  // Initialize theme from localStorage if available, otherwise use default
  const [theme, setThemeState] = useState<ThemeOption>(() => {
    const savedTheme = localStorage.getItem("novamind-theme");
    return savedTheme && isValidTheme(savedTheme) ? savedTheme : defaultTheme;
  });

  // Calculate whether we're in dark mode
  const isDarkMode =
    theme === "dark" || theme === "sleek-dark" || theme === "retro";

  // Set theme with validation and persistence
  const setTheme = useCallback((newTheme: ThemeOption) => {
    if (isValidTheme(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem("novamind-theme", newTheme);

      // Apply dark mode class to document
      if (
        newTheme === "dark" ||
        newTheme === "sleek-dark" ||
        newTheme === "retro"
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Toggle between light and dark mode
  const toggleDarkMode = useCallback(() => {
    if (isDarkMode) {
      setTheme("clinical");
    } else {
      setTheme("sleek-dark");
    }
  }, [isDarkMode, setTheme]);

  // Set up initial theme class on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Current theme settings
  const settings = themeSettings[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        settings,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
