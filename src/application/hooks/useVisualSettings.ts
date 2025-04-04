/**
 * NOVAMIND Neural-Safe Application Hook
 * useVisualSettings - Quantum-level hook for visualization settings
 * with theme-aware clinical precision
 */

import { useState, useCallback, useEffect, useMemo } from "react"; // Add useMemo
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Import local useTheme hook derived from ThemeContext
import { useTheme } from '@application/hooks/useTheme';

// Domain types
import {
  VisualizationSettings,
  ThemeSettings,
  RenderMode,
} from "@domain/types/brain/visualization";
// Assuming the path alias is correct, ensure the file exists and exports these
import { Result, success, failure } from "@domain/types/shared/common";

// Default theme settings
const DEFAULT_THEME_SETTINGS: Record<string, ThemeSettings> = {
  // Clinical theme - precise, medical, focused on accuracy
  clinical: {
    name: "clinical", // Added missing prop
    backgroundColor: "#FFFFFF", // Added missing prop
    primaryColor: "#2C3E50", // Added missing prop
    secondaryColor: "#3498DB", // Added missing prop
    accentColor: "#8b5cf6",
    textColor: "#2C3E50", // Added missing prop
    regionBaseColor: "#ffffff",
    activeRegionColor: "#f87171",
    connectionBaseColor: "#94a3b8",
    activeConnectionColor: "#f97316",
    uiBackgroundColor: "#F8F9FA", // Added missing prop
    uiTextColor: "#2C3E50", // Added missing prop
    fontFamily: "Inter, system-ui, sans-serif", // Added missing prop
    glowIntensity: 0.1,
    useBloom: false, // Added missing prop
    // Removed invalid props: selectionColor, excitatoryColor, inhibitoryColor, shadowColor, directionalLightColor, ambientLightIntensity, directionalLightIntensity, bloomThreshold, bloomIntensity, environmentPreset, activityColorScale, showLabels, showFloor, curvedConnections, useDashedConnections, useEnvironmentLighting
  },

  // Dark theme - sleek, modern, high contrast
  dark: {
    name: "dark", // Added missing prop
    backgroundColor: "#121212", // Added missing prop
    primaryColor: "#6E64F0", // Added missing prop
    secondaryColor: "#3CCFCF", // Added missing prop
    accentColor: "#8b5cf6",
    textColor: "#FFFFFF", // Added missing prop
    regionBaseColor: "#1e293b",
    activeRegionColor: "#f87171",
    connectionBaseColor: "#475569",
    activeConnectionColor: "#f97316",
    uiBackgroundColor: "#1E1E1E", // Added missing prop
    uiTextColor: "#FFFFFF", // Added missing prop
    fontFamily: "Inter, system-ui, sans-serif", // Added missing prop
    glowIntensity: 0.3,
    useBloom: true, // Added missing prop
     // Removed invalid props...
  },

  // Removed "modern" theme as it's not a valid ThemeOption

  // High contrast theme - accessible, clear, distinct
  highContrast: {
    name: "high-contrast", // Added missing prop
    backgroundColor: "#000000", // Added missing prop
    primaryColor: "#FFFFFF", // Added missing prop
    secondaryColor: "#FFFF00", // Added missing prop
    accentColor: "#7e22ce",
    textColor: "#FFFFFF", // Added missing prop
    regionBaseColor: "#ffffff",
    activeRegionColor: "#ef4444",
    connectionBaseColor: "#000000",
    activeConnectionColor: "#ea580c",
    uiBackgroundColor: "#000000", // Added missing prop
    uiTextColor: "#FFFFFF", // Added missing prop
    fontFamily: "Inter, system-ui, sans-serif", // Added missing prop
    glowIntensity: 0.1,
    useBloom: true, // Added missing prop (Note: was true in original high-contrast example)
     // Removed invalid props...
  },
};

// Default visualization settings
// Use the actual default defined in the domain types
import { defaultVisualizationSettings } from "@domain/types/brain/visualization";

const DEFAULT_VISUALIZATION_SETTINGS: VisualizationSettings =
  defaultVisualizationSettings;
// Remove properties not present in the domain type:
// activityThreshold, showInactiveRegions, enableDepthOfField, showRegionCount, performanceMode, themeSettings
// These should be added to the domain type if they are truly part of the core settings.
// For now, assuming the domain type is the source of truth.
// We will apply theme colors dynamically based on the selected theme.

/**
 * Hook return type with neural-safe typing
 */
interface UseVisualSettingsReturn {
  // Settings
  visualizationSettings: VisualizationSettings;

  // Theme settings
  allThemeSettings: Record<string, ThemeSettings>; // Renamed for clarity
  activeThemeSettings: ThemeSettings; // Add the currently active theme settings

  // Methods
  updateVisualizationSettings: (
    settings: Partial<VisualizationSettings>,
  ) => void;
  getThemeSettings: (themeName: string) => ThemeSettings; // Keep getter for specific themes
  resetSettings: () => void;
  createCustomTheme: (name: string, settings: ThemeSettings) => void;
}

/**
 * Get settings key for localStorage
 */
const SETTINGS_STORAGE_KEY = "novamind_visualization_settings";
const THEME_SETTINGS_STORAGE_KEY = "novamind_theme_settings";

/**
 * useVisualSettings - Application hook for neural visualization settings
 * Implements theme-aware visualization with clinical precision
 */
export function useVisualSettings(): UseVisualSettingsReturn {
  // Access the current theme
  const { theme } = useTheme();

  // Query Client
  const queryClient = useQueryClient();

  // Settings query key
  const settingsQueryKey = "visualizationSettings";

  // Local state for settings
  const [localSettings, setLocalSettings] = useState<VisualizationSettings>(
    DEFAULT_VISUALIZATION_SETTINGS,
  );

  // Local state for theme settings
  const [localThemeSettings, setLocalThemeSettings] = useState<
    Record<string, ThemeSettings>
  >(DEFAULT_THEME_SETTINGS);

  // Initialize from localStorage if available
  useEffect(() => {
    try {
      // Load visualization settings
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(
          storedSettings,
        ) as VisualizationSettings;
        setLocalSettings(parsedSettings);
      }

      // Load theme settings
      const storedThemeSettings = localStorage.getItem(
        THEME_SETTINGS_STORAGE_KEY,
      );
      if (storedThemeSettings) {
        const parsedThemeSettings = JSON.parse(storedThemeSettings) as Record<
          string,
          ThemeSettings
        >;
        setLocalThemeSettings({
          ...DEFAULT_THEME_SETTINGS,
          ...parsedThemeSettings,
        });
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  // Update visualization settings
  const updateVisualizationSettings = useCallback(
    (settings: Partial<VisualizationSettings>) => {
      setLocalSettings((prev) => {
        const updatedSettings = { ...prev, ...settings };

        // Removed logic related to nested themeSettings as it's not part of VisualizationSettings type
        // Save to localStorage
        try {
          localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(updatedSettings),
          );
        } catch (error) {
          console.error("Failed to save settings to localStorage", error);
        }

        // Update query cache
        queryClient.setQueryData([settingsQueryKey], updatedSettings);

        return updatedSettings;
      });
    },
    [theme, queryClient],
  );

  // Get theme settings by name
  const getThemeSettings = useCallback(
    (themeName: string): ThemeSettings => {
      return localThemeSettings[themeName] || DEFAULT_THEME_SETTINGS.clinical;
    },
    [localThemeSettings],
  );

  // Reset to default settings
  const resetSettings = useCallback(() => {
    setLocalSettings(DEFAULT_VISUALIZATION_SETTINGS);

    // Save default to localStorage
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(DEFAULT_VISUALIZATION_SETTINGS),
      );
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }

    // Update query cache
    queryClient.setQueryData(
      [settingsQueryKey],
      DEFAULT_VISUALIZATION_SETTINGS,
    );
  }, [queryClient]);

  // Create a custom theme
  const createCustomTheme = useCallback(
    (name: string, settings: ThemeSettings) => {
      setLocalThemeSettings((prev) => {
        const updatedThemes = { ...prev, [name]: settings };

        // Save to localStorage
        try {
          localStorage.setItem(
            THEME_SETTINGS_STORAGE_KEY,
            JSON.stringify(updatedThemes),
          );
        } catch (error) {
          console.error("Failed to save theme settings to localStorage", error);
        }

        return updatedThemes;
      });
    },
    [],
  );

  // When theme changes, update relevant visualization settings based on the theme
  useEffect(() => {
    if (theme) {
      const currentThemeSettings = getThemeSettings(theme);
      // Update specific visualization settings derived from the theme
      updateVisualizationSettings({
        backgroundColor: currentThemeSettings.backgroundColor,
        highlightColor: currentThemeSettings.activeRegionColor, // Example mapping
        // Add other relevant mappings from ThemeSettings to VisualizationSettings
        // e.g., connectionOpacity, bloomIntensity based on theme?
        // This depends on which VisualizationSettings properties should be theme-dependent.
        // For now, only updating background and highlight color as examples.
      });
    }
  }, [theme, getThemeSettings, updateVisualizationSettings]);

  // Determine the active theme settings based on the current theme from useTheme
  const activeThemeSettings = useMemo(() => {
    const currentThemeName = theme || 'clinical'; // Default to clinical if theme is undefined
    return getThemeSettings(currentThemeName);
  }, [theme, getThemeSettings]);

  return {
    // Settings
    visualizationSettings: localSettings,

    // Theme settings
    allThemeSettings: localThemeSettings, // Map of all themes
    activeThemeSettings, // Currently active theme settings object

    // Methods
    updateVisualizationSettings,
    getThemeSettings,
    resetSettings,
    createCustomTheme,
  };
}
