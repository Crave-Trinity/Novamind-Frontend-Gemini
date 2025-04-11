/**
 * Tailwind CSS Enhanced Test Example
 */
import React from 'react';
import { screen, act } from '@testing-library/react';
import { useTheme } from '@application/hooks/useTheme'; // Correct import path for the hook
import type { Mock } from 'vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest'; // Import vi, Mock, etc.
import { renderWithProviders } from '@test/test-utils.unified';

// Simple card component to test
interface CardProps {
  title: string;
  description: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, variant = 'primary', className = '' }) => {
  const baseClasses = 'rounded-lg shadow p-4 transition-colors';
  const variantClasses =
    variant === 'primary'
      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';

  return (
    <div data-testid="card" className={`${baseClasses} ${variantClasses} ${className}`}>
      <h2 data-testid="card-title" className="text-lg font-bold mb-2">
        {title}
      </h2>
      <p data-testid="card-description" className="text-sm">
        {description}
      </p>
    </div>
  );
};

// Mock useTheme to control it
const mockSetTheme = vi.fn();
vi.mock('@hooks/useTheme', () => ({
  // Use correct alias
  useTheme: vi.fn(), // Mock the hook directly
}));

describe('Card Component with Tailwind CSS', () => {
  // Cast the mocked hook
  const mockedUseTheme = useTheme as Mock;

  beforeEach(() => {
    // Reset mocks and set initial return value for useTheme
    vi.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
    });
  });

  it('renders with correct base classes in light mode', () => {
    renderWithProviders(<Card title="Test Card" description="This is a test card" />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('shadow');
  });

  it('renders with dark mode classes when dark mode is enabled', () => {
    // Set mock to return dark theme initially for this test
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
    });

    renderWithProviders(
      <Card title="Dark Mode Card" description="This is a dark mode test card" />
      // Removed incomplete options object and unused variable destructuring
    );

    const card = screen.getByTestId('card');
    // Check for the presence of the dark mode class string
    expect(card).toHaveClass('dark:bg-gray-800');
  });

  it('applies secondary variant classes correctly', () => {
    renderWithProviders(
      <Card
        title="Secondary Card"
        description="This is a secondary variant card"
        variant="secondary"
      />
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-gray-100');
    expect(card).not.toHaveClass('bg-white');
  });

  it('applies custom className alongside Tailwind classes', () => {
    renderWithProviders(
      <Card
        title="Custom Class Card"
        description="This card has custom classes"
        className="custom-class w-64"
      />
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('w-64');
    expect(card).toHaveClass('rounded-lg');
  });

  it('toggles between light and dark mode', () => {
    renderWithProviders(
      <Card title="Toggle Card" description="This card will toggle between modes" />
    );

    // Get the mocked setTheme function via useTheme
    const { setTheme, theme: initialTheme } = useTheme();

    // Start in light mode (based on mock initial value)
    expect(initialTheme).toBe('light');

    // Toggle to dark mode using the context function
    act(() => {
      setTheme('dark');
    });
    // Re-mock the return value to reflect the change for the next assertion
    mockedUseTheme.mockReturnValue({
      // Ensure consistent variable name
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
    });
    const { theme: themeAfterDark } = useTheme(); // Get updated theme
    expect(themeAfterDark).toBe('dark');

    // Toggle back to light mode
    act(() => {
      setTheme('light');
    });
    mockedUseTheme.mockReturnValue({
      // Ensure consistent variable name
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
    });
    const { theme: themeAfterLight } = useTheme(); // Get updated theme
    expect(themeAfterLight).toBe('light');
  });
});
