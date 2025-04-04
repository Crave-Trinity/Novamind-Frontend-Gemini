import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@application/providers/ThemeProvider';
import { cssMock, injectTailwindTestClasses } from './tailwind-mock';

/**
 * Test wrapper that provides all the necessary providers and context
 * for testing components in isolation
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
  initialDarkMode?: boolean;
}

/**
 * Custom wrapper component that provides all necessary contexts for testing
 * - ThemeProvider for dark/light mode themes
 * - Any other providers needed for the application
 */
const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  initialDarkMode = false,
}) => {
  // Initialize dark mode state based on the initialDarkMode prop
  React.useEffect(() => {
    if (initialDarkMode) {
      cssMock.enableDarkMode();
    } else {
      cssMock.disableDarkMode();
    }
  }, [initialDarkMode]);

  return (
    <ThemeProvider defaultTheme={initialDarkMode ? 'dark' : 'light'}>
      {children}
    </ThemeProvider>
  );
};

type CustomRenderOptions = {
  initialDarkMode?: boolean;
} & Omit<RenderOptions, 'wrapper'>;

/**
 * Custom render method that wraps components with the necessary providers
 * and injects minimal Tailwind-like utility classes for testing
 */
const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) => {
  // Inject Tailwind utility classes for testing
  injectTailwindTestClasses();

  // Set up wrapper with props from options
  const wrapper = (props: { children: React.ReactNode }) => (
    <AllTheProviders initialDarkMode={options?.initialDarkMode || false}>
      {props.children}
    </AllTheProviders>
  );

  // Render with the custom wrapper
  return render(ui, { wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { customRender as render };
