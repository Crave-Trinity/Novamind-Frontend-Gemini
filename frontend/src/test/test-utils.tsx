import React, { PropsWithChildren, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import ThemeProvider from "@/application/contexts/ThemeProvider"; // Updated path
import { ThemeOption } from "@/application/contexts/ThemeContext"; // Updated path
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
// Import the mocked Canvas type/component if needed, or rely on global mock
// Assuming setup.ts handles the global mock for Canvas
import { Canvas } from "@react-three/fiber"; // Import Canvas for type usage if needed, mock handles implementation

/**
 * Custom renderer that wraps components with necessary providers
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialTheme?: ThemeOption;
  wrapInCanvas?: boolean; // Add option to wrap in Canvas
}

/**
 * Render with all providers for testing
 * @param ui - The component to render
 * @param options - Render options including initialTheme
 * @returns The render result
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialTheme = "clinical", wrapInCanvas = false, ...renderOptions }: ExtendedRenderOptions = {},
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
      // Wrap with MemoryRouter for components using react-router hooks
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {wrapInCanvas ? <Canvas>{children}</Canvas> : children}
          </ThemeProvider>
        </QueryClientProvider>
      </MemoryRouter>
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
    // Also wrap the hook wrapper if needed, though less common
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return ThemeWrapper;
}
