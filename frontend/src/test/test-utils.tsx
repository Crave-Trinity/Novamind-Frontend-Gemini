import React, { PropsWithChildren, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import ThemeContext from "../contexts/ThemeContext";
// Fixed imports for Theme components
import ThemeContext from "../contexts/ThemeContext";
import { ThemeProvider } from "../contexts/ThemeContext";

/**
 * Custom renderer that wraps components with necessary providers
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialTheme?: ThemeOption;
}

/**
 * Render with all providers for testing
 * @param ui - The component to render
 * @param options - Render options including initialTheme
 * @returns The render result
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialTheme = "clinical", ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<{}>): ReactElement {
    return (
      <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Custom wrapper for renderHook with ThemeProvider
 * @param initialTheme - Initial theme option
 * @returns A wrapper component with ThemeProvider
 */
export function createThemeWrapper(initialTheme: ThemeOption = "clinical") {
  const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>;

  return ThemeWrapper;
}
