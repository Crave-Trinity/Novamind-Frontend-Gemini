/**
 * NOVAMIND Neural-Safe Application Hook
 * useVisualSettings - Quantum-level hook for visualization settings
 * with theme-aware clinical precision
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";

// Domain types
import {
  VisualizationSettings,
  ThemeSettings,
  RenderMode,
} from "@domain/types/brain/visualization";
import { Result, success, failure } from "@domain/types/common";

// Default theme settings
const DEFAULT_THEME_SETTINGS: Record<string, ThemeSettings> = {
  // Clinical theme - precise, medical, focused on accuracy
  clinical: {
    regionBaseColor: "#ffffff",
    activeRegionColor: "#f87171", // Red for active regions
    selectionColor: "#3b82f6", // Blue for selection
    accentColor: "#8b5cf6", // Purple for accent elements
    connectionBaseColor: "#94a3b8", // Slate for connections
    activeConnectionColor: "#f97316", // Orange for active connections
    excitatoryColor: "#22c55e", // Green for excitatory connections
    inhibitoryColor: "#ef4444", // Red for inhibitory connections
    shadowColor: "#1e293b", // Dark slate for shadows
    directionalLightColor: "#ffffff",
    ambientLightIntensity: 0.3,
    directionalLightIntensity: 0.8,
    glowIntensity: 0.1,
    bloomThreshold: 0.2,
    bloomIntensity: 0.4,
    environmentPreset: "city",
    activityColorScale: {
      none: "#6b7280", // Gray
      low: "#60a5fa", // Blue
      medium: "#fbbf24", // Yellow
      high: "#ef4444", // Red
    },
    showLabels: true,
    showFloor: true,
    curvedConnections: true,
    useDashedConnections: false,
    useEnvironmentLighting: true,
  },

  // Dark theme - sleek, modern, high contrast
  dark: {
    regionBaseColor: "#1e293b",
    activeRegionColor: "#f87171", // Red for active regions
    selectionColor: "#3b82f6", // Blue for selection
    accentColor: "#8b5cf6", // Purple for accent elements
    connectionBaseColor: "#475569", // Slate for connections
    activeConnectionColor: "#f97316", // Orange for active connections
    excitatoryColor: "#22c55e", // Green for excitatory connections
    inhibitoryColor: "#ef4444", // Red for inhibitory connections
    shadowColor: "#0f172a", // Dark slate for shadows
    directionalLightColor: "#94a3b8",
    ambientLightIntensity: 0.2,
    directionalLightIntensity: 0.7,
    glowIntensity: 0.3,
    bloomThreshold: 0.1,
    bloomIntensity: 0.6,
    environmentPreset: "night",
    activityColorScale: {
      none: "#334155", // Slate
      low: "#1d4ed8", // Dark blue
      medium: "#b45309", // Dark amber
      high: "#b91c1c", // Dark red
    },
    showLabels: true,
    showFloor: true,
    curvedConnections: true,
    useDashedConnections: true,
    useEnvironmentLighting: true,
  },

  // Modern theme - clean, minimal, focus on data
  modern: {
    regionBaseColor: "#f8fafc",
    activeRegionColor: "#f87171", // Red for active regions
    selectionColor: "#3b82f6", // Blue for selection
    accentColor: "#8b5cf6", // Purple for accent elements
    connectionBaseColor: "#cbd5e1", // Slate for connections
    activeConnectionColor: "#f97316", // Orange for active connections
    excitatoryColor: "#22c55e", // Green for excitatory connections
    inhibitoryColor: "#ef4444", // Red for inhibitory connections
    shadowColor: "#94a3b8", // Slate for shadows
    directionalLightColor: "#ffffff",
    ambientLightIntensity: 0.4,
    directionalLightIntensity: 0.6,
    glowIntensity: 0.1,
    bloomThreshold: 0.3,
    bloomIntensity: 0.3,
    environmentPreset: "sunset",
    activityColorScale: {
      none: "#cbd5e1", // Slate
      low: "#93c5fd", // Light blue
      medium: "#fcd34d", // Light amber
      high: "#fca5a5", // Light red
    },
    showLabels: true,
    showFloor: false,
    curvedConnections: false,
    useDashedConnections: false,
    useEnvironmentLighting: true,
  },

  // High contrast theme - accessible, clear, distinct
  highContrast: {
    regionBaseColor: "#ffffff",
    activeRegionColor: "#ef4444", // Red for active regions
    selectionColor: "#1d4ed8", // Dark blue for selection
    accentColor: "#7e22ce", // Purple for accent elements
    connectionBaseColor: "#000000", // Black for connections
    activeConnectionColor: "#ea580c", // Dark orange for active connections
    excitatoryColor: "#15803d", // Dark green for excitatory connections
    inhibitoryColor: "#b91c1c", // Dark red for inhibitory connections
    shadowColor: "#000000", // Black for shadows
    directionalLightColor: "#ffffff",
    ambientLightIntensity: 0.4,
    directionalLightIntensity: 0.8,
    glowIntensity: 0.1,
    bloomThreshold: 0.3,
    bloomIntensity: 0.3,
    environmentPreset: "dawn",
    activityColorScale: {
      none: "#000000", // Black
      low: "#1e40af", // Very dark blue
      medium: "#a16207", // Dark amber
      high: "#991b1b", // Very dark red
    },
    showLabels: true,
    showFloor: true,
    curvedConnections: false,
    useDashedConnections: true,
    useEnvironmentLighting: false,
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
  themeSettings: Record<string, ThemeSettings>;

  // Methods
  updateVisualizationSettings: (
    settings: Partial<VisualizationSettings>,
  ) => void;
  getThemeSettings: (theme: string) => ThemeSettings;
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

  return {
    // Settings
    visualizationSettings: localSettings,

    // Theme settings
    themeSettings: localThemeSettings,

    // Methods
    updateVisualizationSettings,
    getThemeSettings,
    resetSettings,
    createCustomTheme,
  };
}
