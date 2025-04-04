import React from 'react';
import { render, screen } from './test-utils';
import { cssMock } from './tailwind-mock';

/**
 * Example component that uses Tailwind classes with dark mode variants
 */
const TailwindTestComponent: React.FC = () => {
  return (
    <div data-testid="tailwind-test-container" className="p-4 bg-white dark:bg-gray-800">
      <h1 className="text-primary-500 dark:text-white">
        Testing with Tailwind
      </h1>
      <p className="text-gray-700 dark:text-gray-300">
        This component uses Tailwind CSS classes with dark mode variants
      </p>
      <button 
        className="bg-primary-500 text-white p-4 dark:bg-neural-600"
        data-testid="tailwind-button"
      >
        Click me
      </button>
    </div>
  );
};

describe('Tailwind CSS Testing', () => {
  beforeEach(() => {
    // Reset dark mode state before each test
    cssMock.disableDarkMode();
  });

  it('renders component with correct light mode classes', () => {
    render(<TailwindTestComponent />);
    
    // Verify that the container has the light mode class
    const container = screen.getByTestId('tailwind-test-container');
    expect(container.classList.contains('bg-white')).toBe(true);
    expect(container.classList.contains('dark:bg-gray-800')).toBe(true);
    
    // Verify that dark classes aren't applied in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders component with correct dark mode classes when dark mode is enabled', () => {
    // Render with dark mode enabled
    render(<TailwindTestComponent />, { initialDarkMode: true });
    
    // Verify that the dark mode class is applied to the html element
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Verify that the container has both light and dark mode classes
    // Even though only dark mode classes will be applied by Tailwind
    const container = screen.getByTestId('tailwind-test-container');
    expect(container.classList.contains('bg-white')).toBe(true);
    expect(container.classList.contains('dark:bg-gray-800')).toBe(true);
  });

  it('correctly toggles between light and dark mode', () => {
    render(<TailwindTestComponent />);
    
    // Start in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Toggle to dark mode
    cssMock.enableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Toggle back to light mode
    cssMock.disableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('simulates clicking a button with tailwind classes', () => {
    render(<TailwindTestComponent />);
    
    const button = screen.getByTestId('tailwind-button');
    expect(button).toBeInTheDocument();
    expect(button.classList.contains('bg-primary-500')).toBe(true);
    expect(button.classList.contains('text-white')).toBe(true);
    
    // In a real test, you might do something like:
    // fireEvent.click(button);
    // expect(...).toBe(...);
  });
});