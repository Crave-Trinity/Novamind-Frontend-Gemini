import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  type ReactNode,
} from "react";

import type { ThemeMode } from "../../domain/types/theme"; // Already type-only

// Define ThemeSettings interface for visualization settings
interface ThemeSettings {
  bgColor: string;
  glowIntensity: number;
  useBloom: boolean;
  activeRegionColor: string;
  inactiveRegionColor: string;
  excitationColor: string;
  inhibitionColor: string;
  connectionOpacity: number;
  regionOpacity: number;
}

// Using our ThemeMode type for consistency
type ThemeType = ThemeMode;

// Define default theme settings for each theme
const defaultThemeSettings: Record<ThemeType, ThemeSettings> = {
  light: {
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
  dark: {
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
  system: {
    // System will use light or dark based on user's system preference
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
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    // This error ensures the hook is used correctly within the provider tree
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

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
        ["light", "dark", "system", "clinical", "retro"].includes(savedTheme)
        ? savedTheme
        : defaultTheme;
    } catch (e) {
      console.error("Error accessing localStorage", e);
      return defaultTheme;
    }
  });

  // Check if current theme is a dark theme variant
  const isDarkMode = theme === "dark" || theme === "retro" || (theme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Set theme and save to localStorage
  const setTheme = useCallback((newTheme: ThemeType) => {
    if (["light", "dark", "system", "clinical", "retro"].includes(newTheme)) {
      try {
        localStorage.setItem("theme", newTheme);
      } catch (e) {
        console.error("Error saving theme to localStorage", e);
      }

      setThemeState(newTheme);

      // Update the document with the current theme for global CSS
      document.documentElement.setAttribute("data-theme", newTheme);

      // Set dark mode class for Tailwind
      // Set dark mode class based on theme or system preference
      if (newTheme === "dark" || newTheme === "retro" ||
          (newTheme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
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
      // Simpler toggle logic with fewer themes
      if (prevTheme === "light" || prevTheme === "clinical") {
        return "dark";
      }
      if (prevTheme === "dark" || prevTheme === "retro") {
        return "light";
      }
      if (prevTheme === "system") {
        // If system theme, toggle to explicit light/dark based on current system preference
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark";
      }
      return "light"; // Default fallback
    });
  }, []);

  // Set initial theme on mount
  useEffect(() => {
    // Apply theme on mount
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-system",
      "theme-clinical",
      "theme-retro"
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
        // const handleChange = (e: MediaQueryListEvent) => { // Removed unused variable TS6133
        //   const savedTheme = localStorage.getItem("theme");
        //   if (!savedTheme) {
        //     setTheme(e.matches ? "dark" : "light");
        //   }
        // };

        // Ensure mediaQuery was successfully created before using it
        if (mediaQuery) {
          // Define handleChange inline or ensure it's defined if used below
          const inlineHandleChange = (e: MediaQueryListEvent) => { // Renamed to avoid conflict if outer one is restored
            const savedTheme = localStorage.getItem("theme");
            // Only set theme based on system change if no theme is explicitly saved
            if (!savedTheme || savedTheme === 'system') {
              setTheme(e.matches ? "dark" : "light");
            }
          };

          // Modern API - addEventListener
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", inlineHandleChange); // Use renamed handler
            return () => mediaQuery.removeEventListener("change", inlineHandleChange); // Use renamed handler
          }
          // Fallback for older browsers - addListener
          else if (mediaQuery.addListener) {
            mediaQuery.addListener(inlineHandleChange as any); // Use renamed handler
            return () => mediaQuery.removeListener(inlineHandleChange as any); // Use renamed handler
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
