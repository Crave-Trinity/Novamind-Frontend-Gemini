/**
 * Tailwind CSS Testing Example
 * 
 * This file demonstrates how to properly test components that use Tailwind CSS classes
 * and theme-dependent styling in a JSDOM test environment.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cssMock, initTailwindMock, applyClassBasedDarkMode } from './tailwind-mock';

// Initialize the Tailwind mocking system before tests
beforeAll(() => {
  initTailwindMock();
});

// Reset dark mode between tests
afterEach(() => {
  cssMock.disableDarkMode();
});

// Example component that uses Tailwind classes and responds to theme
const ThemeAwareButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ 
  onClick, 
  children 
}) => (
  <button
    onClick={onClick}
    className="p-4 transition rounded-md dark:bg-dark-700 dark:text-white bg-primary-500 text-white"
    data-testid="theme-button"
  >
    {children}
  </button>
);

// Simple toggle component that changes theme
const ThemeToggler: React.FC = () => {
  const toggleTheme = () => {
    cssMock.toggleDarkMode();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="dark:text-white text-black">Current Theme: {cssMock.darkMode ? 'Dark' : 'Light'}</h2>
      <ThemeAwareButton onClick={toggleTheme}>
        Toggle Theme
      </ThemeAwareButton>
    </div>
  );
};

// Test suite
describe('Tailwind CSS and Theme Testing', () => {
  test('renders correctly with initial theme', () => {
    render(<ThemeToggler />);
    
    // Check initial state is light mode
    expect(cssMock.darkMode).toBe(false);
    expect(screen.getByText('Current Theme: Light')).toBeInTheDocument();
    
    // HTML document should not have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('toggles dark mode when button is clicked', async () => {
    render(<ThemeToggler />);
    
    // Initial state
    expect(cssMock.darkMode).toBe(false);
    
    // Click the button
    const button = screen.getByTestId('theme-button');
    await userEvent.click(button);
    
    // Check dark mode is enabled
    expect(cssMock.darkMode).toBe(true);
    expect(screen.getByText('Current Theme: Dark')).toBeInTheDocument();
    
    // HTML document should have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Click again to toggle back
    await userEvent.click(button);
    
    // Check dark mode is disabled
    expect(cssMock.darkMode).toBe(false);
    expect(screen.getByText('Current Theme: Light')).toBeInTheDocument();
    
    // HTML document should not have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('programmatically toggle dark mode', () => {
    render(<ThemeToggler />);
    
    // Initial state
    expect(screen.getByText('Current Theme: Light')).toBeInTheDocument();
    
    // Programmatically enable dark mode
    cssMock.enableDarkMode();
    
    // Check dark mode is enabled
    expect(cssMock.darkMode).toBe(true);
    expect(screen.getByText('Current Theme: Dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

// Integration with React Testing Library custom render
describe('Integration with React Testing Library', () => {
  // Example of a custom render function that could be used in test-utils.tsx
  const renderWithTheme = (
    ui: React.ReactElement,
    { isDarkMode = false } = {}
  ) => {
    // Set the theme before rendering
    if (isDarkMode) {
      cssMock.enableDarkMode();
    } else {
      cssMock.disableDarkMode();
    }
    
    return render(ui);
  };
  
  test('custom render function with dark mode', () => {
    renderWithTheme(<ThemeToggler />, { isDarkMode: true });
    
    // Should be rendered in dark mode
    expect(cssMock.darkMode).toBe(true);
    expect(screen.getByText('Current Theme: Dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});