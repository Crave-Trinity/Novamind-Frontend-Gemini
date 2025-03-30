import { createContext } from "react";
import { ThemeOption, ThemeSettings, isValidTheme, visualSettings } from "../types/theme";

/**
 * Theme context interface
 */
export interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  settings: ThemeSettings;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Default theme settings
 */
export const themeSettings: Record<ThemeOption, ThemeSettings> = {
  "light": {
    bgColor: "#ffffff",
    glowIntensity: 0.5,
    useBloom: false,
    activeRegionColor: "#2196f3",
    inactiveRegionColor: "#e0e0e0",
    excitationColor: "#00897b",
    inhibitionColor: "#e53935",
    connectionOpacity: 0.8,
    regionOpacity: 0.95,
  },
  "dark": {
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
  "sleek-dark": {
    bgColor: "#0a1128",
    glowIntensity: 1.0,
    useBloom: true,
    activeRegionColor: "#4dabf7",
    inactiveRegionColor: "#333333",
    excitationColor: "#4caf50",
    inhibitionColor: "#f44336",
    connectionOpacity: 0.7,
    regionOpacity: 0.9,
  },
  "retro": {
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
  "wes": {
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
  "clinical": {
    bgColor: "#f8f9fa",
    glowIntensity: 0.4,
    useBloom: false,
    activeRegionColor: "#2196f3",
    inactiveRegionColor: "#e0e0e0", 
    excitationColor: "#00897b",
    inhibitionColor: "#e53935",
    connectionOpacity: 0.8,
    regionOpacity: 0.95,
  },
};

// Export theme types and utils
export { isValidTheme, visualSettings };
export type { ThemeOption };

// Create context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: "clinical",
  setTheme: () => {},
  settings: themeSettings["clinical"],
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export default ThemeContext;
