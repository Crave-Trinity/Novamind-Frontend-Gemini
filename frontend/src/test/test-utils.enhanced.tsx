/**
 * Enhanced Test Utilities
 * 
 * Provides improved rendering and testing capabilities with proper support for:
 * - Dark mode toggling
 * - Tailwind CSS class application
 * - Context providers
 * - Proper cleanup
 */
import React, { ReactElement, useEffect } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import ThemeProvider from '@application/providers/ThemeProvider';

/**
 * Test wrapper that includes all necessary providers
 */
interface TestProvidersProps {
  children: React.ReactNode;
  initialDarkMode?: boolean;
}

/**
 * Return type for the enhanced render function
 */
interface EnhancedRenderResult extends ReturnType<typeof rtlRender> {
  enableDarkMode: () => void;
  disableDarkMode: () => void;
  toggleDarkMode: () => void;
  getIsDarkMode: () => boolean;
}

/**
 * Test providers wrapper component
 * Includes all necessary context providers for tests
 */
const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  initialDarkMode = false 
}) => {
  // Apply dark mode to document
  useEffect(() => {
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Clean up on unmount
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [initialDarkMode]);
  
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

/**
 * Enhanced render function with theme controls
 */
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialDarkMode?: boolean }
): EnhancedRenderResult {
  const initialDarkMode = options?.initialDarkMode || false;
  
  // Keep track of the dark mode state
  let isDarkMode = initialDarkMode;
  
  // Handler functions for dark mode
  const enableDarkMode = () => {
    document.documentElement.classList.add('dark');
    isDarkMode = true;
  };
  
  const disableDarkMode = () => {
    document.documentElement.classList.remove('dark');
    isDarkMode = false;
  };
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  };
  
  const getIsDarkMode = () => isDarkMode;
  
  // Create wrapper with providers
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <TestProviders initialDarkMode={initialDarkMode}>
      {children}
    </TestProviders>
  );
  
  // Render with RTL
  const result = rtlRender(ui, { 
    wrapper: Wrapper, 
    ...options 
  });
  
  // Return result with added methods
  return {
    ...result,
    enableDarkMode,
    disableDarkMode,
    toggleDarkMode,
    getIsDarkMode
  };
}

// Re-export everything from testing library
export * from '@testing-library/react';

// Export enhanced render function
export { render };

/**
 * Mock for CSS/Tailwind functions
 */
export const cssMock = {
  darkMode: false,
  enableDarkMode: () => { cssMock.darkMode = true; },
  disableDarkMode: () => { cssMock.darkMode = false; }
};

/**
 * Helper function to apply class-based dark mode in tests
 */
export const applyClassBasedDarkMode = (): void => {
  if (cssMock.darkMode && document.documentElement) {
    document.documentElement.classList.add('dark');
  } else if (document.documentElement) {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Helper function to clean up WebGL contexts and animation frames
 */
export const cleanupWebGL = (): void => {
  // Clean up any canvas contexts
  document.querySelectorAll('canvas').forEach(canvas => {
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (gl && typeof gl.getExtension === 'function') {
      const extension = gl.getExtension('WEBGL_lose_context');
      if (extension) {
        extension.loseContext();
      }
    }
  });
};

/**
 * Helper function to clean up animation frames
 */
export const cleanupAnimations = (): void => {
  // This is handled globally in setup.enhanced.ts
};