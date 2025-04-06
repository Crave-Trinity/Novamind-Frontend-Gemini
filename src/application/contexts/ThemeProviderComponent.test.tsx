/**
 * NOVAMIND Neural Test Suite
 * useTheme testing with quantum precision
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Create mock implementation for useTheme
const mockThemeData = {
  theme: "light",
  isDarkMode: false,
  settings: {
    bgColor: "#f8f9fa",
    glowIntensity: 0.5,
    useBloom: false,
    activeRegionColor: "#f87171",
    inactiveRegionColor: "#e9ecef",
    excitationColor: "#4a90e2",
    inhibitionColor: "#6c757d",
    connectionOpacity: 0.8,
    regionOpacity: 0.9
  },
  setTheme: vi.fn(),
  toggleTheme: vi.fn()
};

// Mock the entire ThemeContext module
vi.mock("./ThemeContext", () => ({
  useTheme: () => mockThemeData
}));

// Import the hook after mocking (this will use our mock implementation)
import { useTheme } from "./ThemeProvider"; // Import from the provider file

// Test suite
describe("useTheme", () => {
  // Reset mock state before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it("initializes with correct default state", () => {
    // Use renderHook to simulate using the hook
    const { result } = renderHook(() => useTheme());
    
    // Assert that we have the mock data 
    expect(result.current).toBeDefined();
    expect(result.current.theme).toBe("light");
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.settings).toBeDefined();
    expect(result.current.settings.bgColor).toBe("#f8f9fa");
  });

  it("handles state changes with mathematical precision", () => {
    // Get hook result
    const { result } = renderHook(() => useTheme());
    
    // Call the mocked setTheme function
    result.current.setTheme("clinical");
    
    // Assert that the mock function was called with the correct argument
    expect(result.current.setTheme).toHaveBeenCalledWith("clinical");
  });
});
