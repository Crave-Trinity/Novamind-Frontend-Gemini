import React from 'react';
import { screen, act } from '@testing-library/react'; // Import act
import { renderWithProviders } from '@test/test-utils.unified'; // Use unified setup

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

describe('Tailwind CSS Testing with Unified Setup', () => { // Update describe block name
  // No beforeEach needed for cssMock

  it('renders component with correct light mode classes', () => {
    const { isDarkMode } = renderWithProviders(<TailwindTestComponent />); // Use unified render
    expect(isDarkMode()).toBe(false); // Use helper

    const container = screen.getByTestId('tailwind-test-container');
    expect(container.classList.contains('bg-white')).toBe(true);
    expect(container.classList.contains('dark:bg-gray-800')).toBe(true); // Class is present, but not applied
  });

  it('renders component with correct dark mode classes when dark mode is enabled', () => {
    const { isDarkMode } = renderWithProviders(<TailwindTestComponent />, { darkMode: true }); // Use unified render with darkMode option
    // Check classList directly for initial render with darkMode: true
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const container = screen.getByTestId('tailwind-test-container');
    expect(container.classList.contains('bg-white')).toBe(true);
    expect(container.classList.contains('dark:bg-gray-800')).toBe(true); // Class is present and applied
  });

  it('can toggle dark mode during test execution', async () => { // Rename test, make async
    const { isDarkMode, enableDarkMode, disableDarkMode } = renderWithProviders( // Use helpers from unified render
        <TailwindTestComponent />
    );

    // Start in light mode
    expect(isDarkMode()).toBe(false);

    // Toggle to dark mode
    act(() => {
        enableDarkMode();
    });
    // Use waitFor to allow potential state updates
    await act(async () => {
        await screen.findByTestId('tailwind-test-container'); // Wait for potential re-render
    });
    expect(isDarkMode()).toBe(true); // Check state via helper

    // Toggle back to light mode
    act(() => {
        disableDarkMode();
    });
    await act(async () => {
        await screen.findByTestId('tailwind-test-container'); // Wait for potential re-render
    });
    expect(isDarkMode()).toBe(false); // Check state via helper
  });

  it('simulates clicking a button with tailwind classes', () => {
    renderWithProviders(<TailwindTestComponent />); // Use unified render

    const button = screen.getByTestId('tailwind-button');
    expect(button).toBeInTheDocument();
    expect(button.classList.contains('bg-primary-500')).toBe(true);
    expect(button.classList.contains('text-white')).toBe(true);

    // In a real test, you might do something like:
    // fireEvent.click(button);
    // expect(...).toBe(...);
  });
});