import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  ReactNode,
} from "react";

import { ThemeType, ThemeSettings } from "@/types/brain";

// Define default theme settings for each theme
const defaultThemeSettings: Record<ThemeType, ThemeSettings> = {
  "sleek-dark": {
    bgColor: "#121212",
    glowIntensity: 0.8,
    useBloom: true,
    activeRegionColor: "#4dabf7",
    inactiveRegionColor: "#333333",
    excitationColor: "#4caf50",
    inhibitionColor: "#f44336",
    connectionOpacity: 0.7,
    regionOpacity: 0.9,
  },
  retro: {
    bgColor: "#0a1128",
    glowIntensity: 0.5,
    useBloom: false,
    activeRegionColor: "#ff6b6b",
    inactiveRegionColor: "#1e2a4a",
    excitationColor: "#ffe066",
    inhibitionColor: "#9775fa",
    connectionOpacity: 0.5,
    regionOpacity: 0.8,
  },
  wes: {
    bgColor: "#F8E9D6",
    glowIntensity: 0.3,
    useBloom: false,
    activeRegionColor: "#E85A50",
    inactiveRegionColor: "#B5A886",
    excitationColor: "#619B8A",
    inhibitionColor: "#7A6C5D",
    connectionOpacity: 0.9,
    regionOpacity: 1.0,
  },
  clinical: {
    bgColor: "#ffffff",
    glowIntensity: 0.2,
    useBloom: false,
    activeRegionColor: "#2196f3",
    inactiveRegionColor: "#e0e0e0",
    excitationColor: "#00897b",
    inhibitionColor: "#e53935",
    connectionOpacity: 0.8,
    regionOpacity: 0.95,
  },
};

// Theme context values
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  settings: ThemeSettings;
}

// Create context with default values
// Export the context so it can be imported by ThemeContext.tsx for the useTheme hook
export const ThemeContext = createContext<ThemeContextType>({
  theme: "clinical",
  setTheme: () => {},
  toggleTheme: () => {},
  isDarkMode: false,
  settings: defaultThemeSettings["clinical"],
});

// Hook for accessing theme context
export const useTheme = () => React.useContext(ThemeContext);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeType;
}

/**
 * Standalone Theme Provider Component
 * Explicitly created to resolve import issues
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "clinical",
}) => {
  // Initialize theme from localStorage or default
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as ThemeType;
      return savedTheme &&
        ["sleek-dark", "retro", "wes", "clinical"].includes(savedTheme)
        ? savedTheme
        : defaultTheme;
    } catch (e) {
      console.error("Error accessing localStorage", e);
      return defaultTheme;
    }
  });

  // Check if current theme is a dark theme variant
  const isDarkMode = theme === "sleek-dark" || theme === "retro";

  // Set theme and save to localStorage
  const setTheme = useCallback((newTheme: ThemeType) => {
    if (["sleek-dark", "retro", "wes", "clinical"].includes(newTheme)) {
      try {
        localStorage.setItem("theme", newTheme);
      } catch (e) {
        console.error("Error saving theme to localStorage", e);
      }

      setThemeState(newTheme);

      // Update the document with the current theme for global CSS
      document.documentElement.setAttribute("data-theme", newTheme);

      // Set dark mode class for Tailwind
      if (newTheme === "sleek-dark" || newTheme === "retro") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      console.warn(`Invalid theme: ${newTheme}`);
    }
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      if (prevTheme === "clinical") {
        return "sleek-dark";
      }
      if (prevTheme === "sleek-dark") {
        return "clinical";
      }
      if (prevTheme === "wes") {
        return "retro";
      }
      if (prevTheme === "retro") {
        return "wes";
      }
      return "clinical";
    });
  }, []);

  // Set initial theme on mount
  useEffect(() => {
    // Apply theme on mount
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove(
      "theme-clinical",
      "theme-sleek-dark",
      "theme-retro",
      "theme-wes",
    );

    // Add current theme class
    root.classList.add(`theme-${theme}`);

    // Set dark mode class
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Listen for system theme changes - with safeguards for test environments
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
          const savedTheme = localStorage.getItem("theme");
          if (!savedTheme) {
            setTheme(e.matches ? "sleek-dark" : "clinical");
          }
        };

        // Ensure mediaQuery was successfully created before using it
        if (mediaQuery) {
          const handleChange = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem("theme");
            if (!savedTheme) {
              setTheme(e.matches ? "sleek-dark" : "clinical");
            }
          };

          // Modern API - addEventListener
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
          }
          // Fallback for older browsers - addListener
          else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange as any);
            return () => mediaQuery.removeListener(handleChange as any);
          }
        } else {
          console.warn("window.matchMedia returned undefined or null, cannot add listener.");
        }
      } catch (error) {
        console.warn("Error setting up media query listener:", error);
      }
    }
    
    // Return empty cleanup function if matchMedia isn't available
    return () => {};
  }, [theme, isDarkMode, setTheme]);

  // Get theme settings from defaultThemeSettings
  const settings = defaultThemeSettings[theme];

  // Context value
  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode,
    settings,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
