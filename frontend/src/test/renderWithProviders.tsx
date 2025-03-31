/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Test Rendering with Quantum Precision
 *
 * This utility provides a type-safe wrapper for rendering components
 * with all required providers in tests with clinical accuracy.
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { vi } from "vitest";

// Mock theme context with clinical precision
const ThemeContext = React.createContext({
  theme: "clinical",
  setTheme: vi.fn(),
  isDarkMode: false,
  toggleDarkMode: vi.fn(),
});

// Mock visualization settings context with quantum precision
const VisualizationSettingsContext = React.createContext({
  detailLevel: "medium",
  setDetailLevel: vi.fn(),
  performanceMode: false,
  setPerformanceMode: vi.fn(),
  renderQuality: "high",
  setRenderQuality: vi.fn(),
});

// Optional provider props with neural precision
type ProviderProps = {
  children?: React.ReactNode;
};

// Neural-safe AllTheProviders component with quantum precision
const AllTheProviders = ({ children }: ProviderProps) => {
  return (
    <ThemeContext.Provider
      value={{
        theme: "clinical",
        setTheme: vi.fn(),
        isDarkMode: false,
        toggleDarkMode: vi.fn(),
      }}
    >
      <VisualizationSettingsContext.Provider
        value={{
          detailLevel: "medium",
          setDetailLevel: vi.fn(),
          performanceMode: false,
          setPerformanceMode: vi.fn(),
          renderQuality: "high",
          setRenderQuality: vi.fn(),
        }}
      >
        {children}
      </VisualizationSettingsContext.Provider>
    </ThemeContext.Provider>
  );
};

// Type-safe renderWithProviders function with clinical precision
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
}

// Export testing utilities with quantum precision
export * from "@testing-library/react";

// Export contexts for direct use in tests with neural precision
export { ThemeContext, VisualizationSettingsContext };
