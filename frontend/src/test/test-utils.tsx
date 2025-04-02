import React, { PropsWithChildren, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import ThemeProvider from "@application/providers/ThemeProvider";
import { ThemeOption } from "@application/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Turn off retries for tests
        retry: false,
        // Don't cache between tests
        gcTime: 0,
        // Don't refetch on window focus
        refetchOnWindowFocus: false,
      },
    },
  });

  function Wrapper({ children }: PropsWithChildren<object>): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
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
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });

  const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );

  return ThemeWrapper;
}
