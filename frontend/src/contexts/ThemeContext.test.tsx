/// <reference types="vitest/globals" /> 
/// <reference types="@testing-library/jest-dom" />
/**
 * NOVAMIND Neural Test Suite
 * ThemeProvider testing with quantum precision
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach, SpyInstance } from "vitest"; // Import SpyInstance
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./Theme"; // Use relative path
import { renderWithProviders } from "../test/test-utils"; // Use relative path

// Helper component to access context values
const TestComponent = () => {
  const { theme, toggleDarkMode } = useTheme();
  return (
    <div>
      <span>Current theme: {theme}</span>
      <button onClick={toggleDarkMode}>Toggle Theme</button>
    </div>
  );
};

describe("ThemeProvider", () => {
  // Mock localStorage directly
  let storage: { [key: string]: string };
  let setItemSpy: SpyInstance; // Keep spy for assertions

  beforeEach(() => {
    // Reset storage and create mock object
    storage = {}; // Start with empty storage for a clean slate
    setItemSpy = vi.fn((key: string, value: string) => { storage[key] = value; });

    const localStorageMock = {
      // getItem reads from our 'storage' object
      getItem: vi.fn((key: string) => storage[key] || null), 
      // setItem uses the spy AND updates our 'storage' object
      setItem: setItemSpy, 
      clear: vi.fn(() => { storage = {}; }),
      removeItem: vi.fn((key: string) => { delete storage[key]; }),
      // Provide required properties for Storage interface
      length: Object.keys(storage).length, 
      key: vi.fn((index: number) => Object.keys(storage)[index] || null),
    };

    // Define window.localStorage with the mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true 
    });

    // Mock matchMedia to default to light scheme
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: light)', // Simulate light mode preference
        media: query,
        onchange: null,
        addListener: vi.fn(), 
        removeListener: vi.fn(), 
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Clear any previous mock calls AFTER setup
    vi.clearAllMocks(); 
  });

  // No afterEach needed for this specific mock strategy, 
  // as beforeEach redefines window.localStorage

  it("renders with neural precision", () => {
    renderWithProviders(<TestComponent />);

    // Assert initial state (should default to 'clinical' based on provider logic and light preference)
    expect(screen.getByText("Current theme: clinical")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
    // Check that setItem was called by the initial useEffect to set the default
    expect(setItemSpy).toHaveBeenCalledWith("novamind-theme", "clinical");
  });

  it("responds to user interaction with quantum precision", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);

    // Initial state check
    expect(screen.getByText("Current theme: clinical")).toBeInTheDocument();
    // The initial render's useEffect already called setItem. Reset spy for interaction checks.
    vi.clearAllMocks(); 

    // Simulate first theme toggle (clinical -> sleek-dark)
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggleButton);

    // Assert theme changed to sleek-dark, waiting for update
    await waitFor(() => {
      expect(screen.getByText("Current theme: sleek-dark")).toBeInTheDocument();
    });
    // Check localStorage update for the FIRST toggle
    expect(setItemSpy).toHaveBeenCalledWith("novamind-theme", "sleek-dark");
    expect(setItemSpy).toHaveBeenCalledTimes(1); // Only one call since vi.clearAllMocks()

    // Simulate toggle back to clinical (sleek-dark -> clinical)
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText("Current theme: clinical")).toBeInTheDocument();
    });
     // Check localStorage update for the SECOND toggle
    expect(setItemSpy).toHaveBeenCalledWith("novamind-theme", "clinical");
    expect(setItemSpy).toHaveBeenCalledTimes(2); // Two calls total since vi.clearAllMocks()
  });

  // Add more component-specific tests
});
