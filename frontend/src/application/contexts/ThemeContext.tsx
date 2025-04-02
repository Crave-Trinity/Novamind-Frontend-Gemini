import { useContext } from "react";
// Import the actual context instance from the provider file
import { ThemeContext } from "./ThemeProvider";
import type { ThemeSettings, ThemeType as ThemeOption } from "@/types/brain"; // Use types from domain

// Re-export types for consumers if needed, or rely on imports from provider/domain types
export type { ThemeOption, ThemeSettings };

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
  toggleTheme: () => void; // Renamed from toggleDarkMode to match provider
}


/**
 * Custom hook for consuming the theme context
 * Provides type safety and clear error messages.
 * It now consumes the context imported from the ThemeProvider file.
 */
export const useTheme = (): ThemeContextType => {
  // We cast the context type here because the actual context instance
  // is created in ThemeProvider.tsx with potentially slightly different
  // initialization values (like functions being () => {} initially).
  // The real value comes from the Provider component itself.
  const context = useContext(ThemeContext) as ThemeContextType | undefined;

  if (context === undefined) {
    // This error signifies that useTheme() is called outside of a <ThemeProvider>
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Note: We no longer export ThemeContext from here.
// Consumers should import ThemeProvider and useTheme.
