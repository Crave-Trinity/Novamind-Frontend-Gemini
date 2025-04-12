import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Button, buttonVariants } from './button';
import { vi } from 'vitest';

// Mock Radix UI Slot component
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, className, ...props }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any
  }) => (
    <div data-testid="slot-component" className={className} {...props}>
      {children}
    </div>
  ),
}));

describe('Button Component', () => {
  it('renders with default props', () => {
    renderWithProviders(<Button data-testid="button">Click me</Button>);
    
    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    
    // Should have the default variant classes
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
    
    // Should have the default size classes
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  it('renders with variant destructive', () => {
    renderWithProviders(
      <Button variant="destructive" data-testid="button">
        Delete
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-destructive');
    expect(button).toHaveClass('text-destructive-foreground');
  });

  it('renders with variant outline', () => {
    renderWithProviders(
      <Button variant="outline" data-testid="button">
        Outline
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-input');
    expect(button).toHaveClass('bg-background');
  });

  it('renders with variant secondary', () => {
    renderWithProviders(
      <Button variant="secondary" data-testid="button">
        Secondary
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-secondary');
    expect(button).toHaveClass('text-secondary-foreground');
  });

  it('renders with variant ghost', () => {
    renderWithProviders(
      <Button variant="ghost" data-testid="button">
        Ghost
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('hover:bg-accent');
    expect(button).toHaveClass('hover:text-accent-foreground');
    
    // Ghost buttons don't have background color by default
    expect(button).not.toHaveClass('bg-primary');
  });

  it('renders with variant link', () => {
    renderWithProviders(
      <Button variant="link" data-testid="button">
        Link
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('text-primary');
    expect(button).toHaveClass('hover:underline');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('renders with size sm', () => {
    renderWithProviders(
      <Button size="sm" data-testid="button">
        Small
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('text-xs');
  });

  it('renders with size lg', () => {
    renderWithProviders(
      <Button size="lg" data-testid="button">
        Large
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-8');
  });

  it('renders with size icon', () => {
    renderWithProviders(
      <Button size="icon" data-testid="button">
        <svg data-testid="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" />
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('w-9');
    
    // Icon should be rendered
    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    renderWithProviders(
      <Button className="custom-class" data-testid="button">
        Custom Button
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('custom-class');
    // Should still have the default classes
    expect(button).toHaveClass('bg-primary');
  });

  it('renders as a Slot component when asChild is true', () => {
    renderWithProviders(
      <Button asChild data-testid="button">
        <a href="#" data-testid="anchor">Link Button</a>
      </Button>
    );
    
    // When asChild is true, it should render the child component (anchor in this case)
    const button = screen.getByTestId('button');
    const anchor = screen.getByTestId('anchor');
    
    expect(button).toBeInTheDocument();
    expect(anchor).toBeInTheDocument();
    expect(button).toHaveTextContent('Link Button');
    
    // The button classes should be applied to the container
    expect(button).toHaveClass('bg-primary');
  });

  it('handles disabled state correctly', () => {
    renderWithProviders(
      <Button disabled data-testid="button">
        Disabled
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('handles click events correctly', () => {
    const handleClick = vi.fn();
    
    renderWithProviders(
      <Button onClick={handleClick} data-testid="button">
        Click Me
      </Button>
    );
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn();
    
    renderWithProviders(
      <Button onClick={handleClick} disabled data-testid="button">
        Disabled Button
      </Button>
    );
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    
    renderWithProviders(
      <Button ref={ref} data-testid="button">
        Ref Button
      </Button>
    );
    
    expect(ref.current).toBe(screen.getByTestId('button'));
  });

  it('applies different combinations of variants and sizes', () => {
    renderWithProviders(
      <Button variant="destructive" size="lg" data-testid="button">
        Big Destructive
      </Button>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-destructive');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-8');
  });

  it('exposes buttonVariants for use outside the component', () => {
    // Test that buttonVariants function returns expected classes
    const classes = buttonVariants({ variant: 'outline', size: 'sm' });
    
    expect(classes).toContain('border');
    expect(classes).toContain('h-8');
    expect(classes).toContain('px-3');
  });
});