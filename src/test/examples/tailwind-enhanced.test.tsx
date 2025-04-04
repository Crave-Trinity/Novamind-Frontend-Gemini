/**
 * Tailwind CSS Enhanced Test Example
 * 
 * This file demonstrates how to use the enhanced test utilities for testing
 * components that rely on Tailwind CSS classes, dark mode, and WebGL rendering.
 */
import React from 'react';
import { render, screen } from '@test/test-utils.unified'; // Corrected import path

// Simple card component to test
interface CardProps {
  title: string;
  description: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  variant = 'primary',
  className = ''
}) => {
  // Classes that change based on variant
  const baseClasses = "rounded-lg shadow p-4 transition-colors";
  const variantClasses = variant === 'primary' 
    ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white" 
    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  
  return (
    <div 
      data-testid="card"
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <h2 
        data-testid="card-title" 
        className="text-lg font-bold mb-2"
      >
        {title}
      </h2>
      <p 
        data-testid="card-description"
        className="text-sm"
      >
        {description}
      </p>
    </div>
  );
};

describe('Card Component with Tailwind CSS', () => {
  it('renders with correct base classes in light mode', () => {
    render(
      <Card 
        title="Test Card" 
        description="This is a test card"
      />
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('shadow');
    expect(card).not.toHaveClass('dark:bg-gray-800'); // Dark mode class won't be applied
  });
  
  it('renders with dark mode classes when dark mode is enabled', () => {
    const { enableDarkMode } = render(
      <Card 
        title="Dark Mode Card" 
        description="This is a dark mode test card"
      />
    );
    
    // Enable dark mode
    enableDarkMode();
    
    const card = screen.getByTestId('card');
    // In test environment, we can only check for the presence of classes, not their application
    expect(card).toHaveClass('dark:bg-gray-800');
  });
  
  it('applies secondary variant classes correctly', () => {
    render(
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
    render(
      <Card 
        title="Custom Class Card" 
        description="This card has custom classes"
        className="custom-class w-64"
      />
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('w-64');
    // Original classes should still be there
    expect(card).toHaveClass('rounded-lg');
  });
  
  it('toggles between light and dark mode', () => {
    // Destructure the correct helpers provided by the unified render function
    const { isDarkMode, enableDarkMode, disableDarkMode } = render(
      <Card 
        title="Toggle Card" 
        description="This card will toggle between modes"
      />
    );
    
    // Start in light mode
    expect(isDarkMode()).toBe(false);
    
    // Toggle to dark mode
    enableDarkMode(); // Use the available helper
    expect(isDarkMode()).toBe(true);
    
    // Toggle back to light mode
    disableDarkMode(); // Use the available helper
    expect(isDarkMode()).toBe(false);
  });
});