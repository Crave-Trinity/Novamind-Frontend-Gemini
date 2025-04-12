import React from 'react';
import { vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Button, buttonVariants } from './button';
import { Slot } from '@radix-ui/react-slot';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    
    // Should have default variant and size classes
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders correct variants', () => {
    const { rerender } = renderWithProviders(
      <Button variant="destructive">Destructive</Button>
    );
    
    // Test destructive variant
    let button = screen.getByRole('button', { name: /destructive/i });
    expect(button).toHaveClass('bg-destructive');
    
    // Test outline variant
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border-input');
    
    // Test secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary');
    
    // Test ghost variant
    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');
    
    // Test link variant
    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: /link/i });
    expect(button).toHaveClass('text-primary');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('renders correct sizes', () => {
    const { rerender } = renderWithProviders(
      <Button size="sm">Small</Button>
    );
    
    // Test small size
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('px-3');
    
    // Test large size
    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-8');
    
    // Test icon size
    rerender(<Button size="icon">+</Button>);
    button = screen.getByRole('button', { name: /\+/i });
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('w-9');
  });

  it('renders as a slot when asChild is true', () => {
    const CustomButton = React.forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement>
    >(({ children, ...props }, ref) => (
      <a ref={ref} {...props}>
        {children}
      </a>
    ));
    
    CustomButton.displayName = 'CustomButton';
    
    renderWithProviders(
      <Button asChild>
        <CustomButton href="#test">Custom Button</CustomButton>
      </Button>
    );
    
    const link = screen.getByRole('link', { name: /custom button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#test');
    expect(link).toHaveClass('bg-primary'); // Should inherit button styles
  });

  it('applies custom className along with default styles', () => {
    renderWithProviders(
      <Button className="test-custom-class">Custom Class</Button>
    );
    
    const button = screen.getByRole('button', { name: /custom class/i });
    expect(button).toHaveClass('test-custom-class');
    expect(button).toHaveClass('bg-primary'); // Should also have default styles
  });

  it('supports disabled state', () => {
    const handleClick = vi.fn();
    
    renderWithProviders(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards additional props to the underlying element', () => {
    renderWithProviders(
      <Button aria-label="Action button" data-testid="test-button">
        Action
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Action button');
  });

  it('exports buttonVariants for use in other components', () => {
    // This is more of a TypeScript check, but we can verify basic functionality
    expect(typeof buttonVariants).toBe('function');
    
    const classes = buttonVariants({ variant: 'destructive', size: 'lg' });
    expect(classes).toContain('bg-destructive');
    expect(classes).toContain('h-10');
  });
});