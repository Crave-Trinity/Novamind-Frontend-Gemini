import React, { createContext, useContext } from "react";
import type { ThemeSettings } from "@/types/brain";

// Define our own theme options to match what's used in the app
export type ThemeOption = "clinical" | "dark" | "sleek" | "retro" | "wes";

// Re-export ThemeSettings
export type { ThemeSettings };

/**
 * Theme context interface
 * Defines the contract for theme operations.
 * This should match the value provided by ThemeProvider.
 */
export interface ThemeContextType {
  theme: ThemeOption;
  isDarkMode: boolean;
  settings: ThemeSettings;
  setTheme: (newTheme: ThemeOption) => void;
  toggleTheme: () => void;
}

// Theme settings for different themes
export const themeSettings: Record<ThemeOption, ThemeSettings> = {
  "clinical": {
    bgColor: "#ffffff",
    glowIntensity: 0.5,
    useBloom: false,
    activeRegionColor: "#0066F0",
    inactiveRegionColor: "#c0c0c0",
    excitationColor: "#00cc66",
    inhibitionColor: "#cc3300",
    regionOpacity: 0.8,
    connectionOpacity: 0.6
  },
  "dark": {
    bgColor: "#111111",
    glowIntensity: 1.0,
    useBloom: true,
    activeRegionColor: "#00aaff",
    inactiveRegionColor: "#333333",
    excitationColor: "#00ffcc",
    inhibitionColor: "#ff3366",
    regionOpacity: 0.8,
    connectionOpacity: 0.7
  },
  "sleek": {
    bgColor: "#222222",
    glowIntensity: 1.0,
    useBloom: true,
    activeRegionColor: "#0099ff",
    inactiveRegionColor: "#444444",
    excitationColor: "#00eeff",
    inhibitionColor: "#ff4444",
    regionOpacity: 0.9,
    connectionOpacity: 0.8
  },
  "retro": {
    bgColor: "#f0f0e0",
    glowIntensity: 0.7,
    useBloom: true,
    activeRegionColor: "#ff8800",
    inactiveRegionColor: "#996633",
    excitationColor: "#ff6600",
    inhibitionColor: "#3366cc",
    regionOpacity: 0.9,
    connectionOpacity: 0.7
  },
  "wes": {
    bgColor: "#ffcc99",
    glowIntensity: 0.9,
    useBloom: true,
    activeRegionColor: "#cc6633",
    inactiveRegionColor: "#cc9966",
    excitationColor: "#ff9900",
    inhibitionColor: "#006699",
    regionOpacity: 0.85,
    connectionOpacity: 0.7
  }
};

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  theme: "clinical",
  isDarkMode: false,
  settings: themeSettings.clinical,
  setTheme: () => {},
  toggleTheme: () => {}
});

/**
 * Custom hook for consuming the theme context
 * Provides type safety and clear error messages.
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
