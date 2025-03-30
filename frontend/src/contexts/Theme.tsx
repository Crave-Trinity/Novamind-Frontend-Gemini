import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

/**
 * Available theme options
 */
export type ThemeOption = "sleek-dark" | "retro" | "wes" | "clinical";

/**
 * Theme context interface
 */
export interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  settings: {
    [key in ThemeOption]: {
      bgColor: string;
      glowIntensity: number;
      useBloom: boolean;
    };
  };
}

/**
 * Default theme settings
 */
const defaultThemeSettings = {
  "sleek-dark": {
    bgColor: "#121212",
    glowIntensity: 0.8,
    useBloom: true,
  },
  retro: {
    bgColor: "#0a1128",
    glowIntensity: 0,
    useBloom: false,
  },
  wes: {
    bgColor: "#F8E9D6",
    glowIntensity: 0,
    useBloom: false,
  },
  clinical: {
    bgColor: "#ffffff",
    glowIntensity: 0,
    useBloom: false,
  },
};

/**
 * Default theme context
 */
const defaultThemeContext: ThemeContextType = {
  theme: "clinical",
  setTheme: () => null,
  toggleDarkMode: () => null,
  isDarkMode: false,
  settings: defaultThemeSettings,
};

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeOption;
}

/**
 * Theme provider component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "clinical",
}) => {
  // Get saved theme from localStorage or use default
  const getSavedTheme = (): ThemeOption => {
    try {
      const savedTheme = localStorage.getItem("novamind-theme");
      return savedTheme && isValidTheme(savedTheme) ? savedTheme : initialTheme;
    } catch (e) {
      console.error("Error accessing localStorage", e);
      return initialTheme;
    }
  };

  // Check if theme is valid
  function isValidTheme(theme: string): theme is ThemeOption {
    return ["sleek-dark", "retro", "wes", "clinical"].includes(theme);
  }

  // State for current theme
  const [theme, setThemeState] = useState<ThemeOption>(getSavedTheme);

  // Computed state for dark mode
  const isDarkMode = theme === "sleek-dark";

  // Theme settings
  const settings = useMemo(() => defaultThemeSettings, []);

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

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleDarkMode,
    isDarkMode,
    settings,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default ThemeContext;
