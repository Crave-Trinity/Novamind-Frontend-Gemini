/**
 * NOVAMIND Neural Test Suite
 * MainLayout testing with quantum precision
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"; // Import hooks

import { screen, fireEvent } from "@testing-library/react"; // render is imported from unified utils
import React from "react";
import userEvent from "@testing-library/user-event";
import MainLayout from "./MainLayout"; // Assuming default export
import { render } from "@test/test-utils.unified"; // Import the unified render

// Mock data with clinical precision
// Mock data with clinical precision - MainLayout requires children
const mockProps = {
  children: React.createElement("div", null, "Test Child Content"),
};

describe("MainLayout", () => { // Re-enabled suite
  // Store original matchMedia
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia; // Store original

    // Mock matchMedia specifically for this test suite
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true, // Ensure it can be restored
      value: vi.fn().mockImplementation(query => {
        console.log(`[TEST] matchMedia called with query: ${query}`); // Diagnostic log
        const isLightQuery = query === '(prefers-color-scheme: light)';
        const isDarkQuery = query === '(prefers-color-scheme: dark)';
        // Default to light theme unless dark is explicitly queried, ensure boolean
        const matches = isLightQuery || !isDarkQuery;
        return {
          matches: matches,
          media: query,
          onchange: null,
          addListener: vi.fn(), // Deprecated but mock
          removeListener: vi.fn(), // Deprecated but mock
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }),
    });
    // Clear mocks AFTER setting up matchMedia mock if needed,
    // but generally clear before setting up mocks for the test run.
    // Let's clear before setting up specific mocks for this test.
    vi.clearAllMocks(); // Clear previous test mocks first

    // Re-apply the mock after clearing (or ensure clear doesn't remove it)
    // The above Object.defineProperty should suffice as it runs each time.
  });

  afterEach(() => {
    // Restore original matchMedia to avoid side-effects between test files
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
     vi.restoreAllMocks(); // Restore any other mocks
  });

  // Optional: Restore if needed, though less critical if beforeEach redefines
  // afterEach(() => {
  //   vi.restoreAllMocks();
  // });

  it("renders with neural precision", () => {
    render(<MainLayout {...mockProps} />); // Use the unified render

    // Add assertions for rendered content
    // Check if the child content is rendered
    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
    // Check for a key element, e.g., the Novamind title/logo
    expect(screen.getByText("Novamind")).toBeInTheDocument();
  });

  it("responds to user interaction with quantum precision", async () => {
    const user = userEvent.setup();
    render(<MainLayout {...mockProps} />); // Use the unified render

    // Simulate user interactions
    // Example: Simulate clicking the theme toggle button (assuming it exists and is accessible)
    const themeToggleButton = screen.getByTestId('theme-toggle-button'); // Use test ID
    expect(themeToggleButton).toBeInTheDocument();
    await user.click(themeToggleButton);
    // Add assertion for expected change, e.g., theme change reflected in DOM or localStorage mock
    // await waitFor(() => expect(...));
  });

  // Add more component-specific tests
});
