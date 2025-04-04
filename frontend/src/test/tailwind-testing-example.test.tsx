import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, renderWithProviders } from './test-utils';
import { tailwindMock } from './tailwind-mock';

// Sample component that uses Tailwind classes including dark mode variants
const TailwindComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-gray-800 dark:text-white">{title}</h2>
      <div className="bg-primary-500 text-white px-4 py-2 rounded">
        This is a primary button
      </div>
      <div className="mt-2 bg-gray-100 dark:bg-gray-900 p-2">
        <p className="text-black dark:text-gray-300">
          This text changes color in dark mode
        </p>
      </div>
    </div>
  );
};

describe('Tailwind CSS Testing Example', () => {
  // Ensure we have clean state before each test
  beforeEach(() => {
    tailwindMock.disableDarkMode();
  });

  afterEach(() => {
    tailwindMock.disableDarkMode();
  });

  it('renders correctly in light mode', () => {
    render(<TailwindComponent title="Light Mode Test" />);
    
    // Check if title is rendered
    expect(screen.getByText('Light Mode Test')).toBeInTheDocument();
    
    // Check if dark mode is disabled
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Check that light mode styles are applied (we can't actually check the computed styles,
    // but we can verify the elements have the expected classes)
    const container = screen.getByText('Light Mode Test').parentElement;
    expect(container).toHaveClass('bg-white');
    expect(container).not.toHaveClass('bg-gray-800');
  });

  it('components have proper dark mode classes', () => {
    // Just check that components have appropriate classes for dark mode
    // This doesn't test if dark mode is actually active, just the component structure
    render(<TailwindComponent title="Dark Mode Classes Test" />);
    
    // Verify the component has dark mode variant classes present
    const container = screen.getByText('Dark Mode Classes Test').parentElement;
    expect(container).toHaveClass('dark:bg-gray-800');
    
    // Check that dark mode text class is applied to paragraph
    const paragraph = screen.getByText('This text changes color in dark mode');
    expect(paragraph).toHaveClass('dark:text-gray-300');
    
    // Also check container
    const textContainer = paragraph.parentElement;
    expect(textContainer).toHaveClass('dark:bg-gray-900');
  });

  it('can toggle dark mode during test execution', () => {
    const { enableDarkMode, disableDarkMode } = renderWithProviders(
      <TailwindComponent title="Toggle Dark Mode Test" />
    );
    
    // Initially in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Toggle to dark mode
    enableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Toggle back to light mode
    disableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});