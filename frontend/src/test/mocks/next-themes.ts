/**
 * Mock for next-themes
 * Provides testing-friendly implementation of theme functionality
 */

import { vi } from "vitest";

export const useTheme = vi.fn().mockReturnValue({
  theme: "clinical",
  setTheme: vi.fn(),
  resolvedTheme: "clinical",
  themes: ["clinical", "dark", "modern", "highContrast"],
  systemTheme: "clinical"
});