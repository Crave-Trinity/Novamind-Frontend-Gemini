/**
 * Tailwind CSS Testing Example (Using Unified Test Setup)
 * 
 * This test file demonstrates how to properly test components
 * that use Tailwind CSS classes, including dark mode variants.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from './test-utils.unified';
import { tailwindHelper } from './setup.unified';

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

describe('Tailwind CSS Testing with Unified Setup', () => {
  // Ensure we have clean state before each test
  beforeEach(() => {
    tailwindHelper.disableDarkMode();
  });

  afterEach(() => {
    tailwindHelper.disableDarkMode();
  });

  it('renders correctly in light mode', () => {
    render(<TailwindComponent title="Light Mode Test" />);
    
    // Check if title is rendered
    expect(screen.getByText('Light Mode Test')).toBeInTheDocument();
    
    // Check if dark mode is disabled
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Check that light mode classes are applied
    const container = screen.getByText('Light Mode Test').parentElement;
    expect(container).toHaveClass('bg-white');
    expect(container).not.toHaveClass('bg-gray-800');
  });

  it('components have proper dark mode classes', () => {
    render(<TailwindComponent title="Dark Mode Classes Test" />);
    
    // Verify the component has dark mode variant classes
    const container = screen.getByText('Dark Mode Classes Test').parentElement;
    expect(container).toHaveClass('dark:bg-gray-800');
    
    // Check dark mode text class on paragraph
    const paragraph = screen.getByText('This text changes color in dark mode');
    expect(paragraph).toHaveClass('dark:text-gray-300');
    
    // Check dark mode on container
    const textContainer = paragraph.parentElement;
    expect(textContainer).toHaveClass('dark:bg-gray-900');
  });

  it('can toggle dark mode during test execution', () => {
    const { enableDarkMode, disableDarkMode } = render(
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