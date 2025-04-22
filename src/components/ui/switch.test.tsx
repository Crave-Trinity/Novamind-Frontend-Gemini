import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Switch } from './switch';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock Radix UI Switch components
vi.mock('@radix-ui/react-switch', () => {
  const Root = React.forwardRef<HTMLButtonElement, any>(
    (
      { children, className, defaultChecked, checked, disabled, onCheckedChange, ...props },
      ref
    ) => {
      const [isChecked, setIsChecked] = React.useState(defaultChecked || checked || false);

      // Handle controlled and uncontrolled components
      const handleClick = () => {
        if (disabled) return;

        if (checked === undefined) {
          setIsChecked(!isChecked);
        }

        if (onCheckedChange) {
          onCheckedChange(!isChecked);
        }
      };

      const state = checked !== undefined ? checked : isChecked;

      return (
        <button
          role="switch"
          aria-checked={state}
          data-state={state ? 'checked' : 'unchecked'}
          disabled={disabled}
          onClick={handleClick}
          className={className}
          ref={ref}
          {...props}
        >
          {children}
        </button>
      );
    }
  );

  const Thumb = ({ className, ...props }: { className?: string; [key: string]: any }) => (
    <span className={className} data-state={props['data-state']} {...props} />
  );

  return {
    Root,
    Thumb,
  };
});

describe('Switch Component', () => {
  it('renders correctly in unchecked state by default', () => {
    renderWithProviders(<Switch data-testid="test-switch" />);

    const switchElement = screen.getByTestId('test-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');

    // Check for correct styling classes
    expect(switchElement).toHaveClass('peer');
    expect(switchElement).toHaveClass('rounded-full');
    expect(switchElement).toHaveClass('cursor-pointer');
  });

  it('renders in checked state when defaultChecked is true', () => {
    renderWithProviders(<Switch data-testid="test-switch" defaultChecked />);

    const switchElement = screen.getByTestId('test-switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('toggles state when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Switch data-testid="test-switch" />);

    const switchElement = screen.getByTestId('test-switch');

    // Initially unchecked
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');

    // Click to check
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('data-state', 'checked');

    // Click again to uncheck
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('calls onCheckedChange handler when toggled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Switch data-testid="test-switch" onCheckedChange={handleChange} />);

    const switchElement = screen.getByTestId('test-switch');

    // Click the switch
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);

    // Click again
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('applies custom className to the switch', () => {
    renderWithProviders(<Switch data-testid="test-switch" className="custom-class" />);

    const switchElement = screen.getByTestId('test-switch');
    expect(switchElement).toHaveClass('custom-class');
    expect(switchElement).toHaveClass('peer'); // Still has default classes
  });

  it('handles disabled state correctly', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <Switch data-testid="test-switch" disabled onCheckedChange={handleChange} />
    );

    const switchElement = screen.getByTestId('test-switch');

    // Should have disabled styles
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed');
    expect(switchElement).toHaveClass('disabled:opacity-50');
    expect(switchElement).toBeDisabled();

    // Click should not trigger state change
    await user.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('forwards ref to the underlying switch element', () => {
    const ref = React.createRef<HTMLButtonElement>();

    renderWithProviders(<Switch data-testid="test-switch" ref={ref} />);

    const switchElement = screen.getByTestId('test-switch');
    expect(ref.current).toBe(switchElement);
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<Switch data-testid="test-switch" aria-label="Toggle feature" />);

    const switchElement = screen.getByTestId('test-switch');

    // Should have role="switch"
    expect(switchElement).toHaveAttribute('role', 'switch');

    // Should have aria-checked attribute
    expect(switchElement).toHaveAttribute('aria-checked', 'false');

    // Should have passed aria-label
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle feature');

    // After clicking, aria-checked should update
    fireEvent.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('renders the thumb with correct positioning', () => {
    renderWithProviders(<Switch data-testid="test-switch" />);

    // Find the thumb element (it's the only child of the switch)
    const switchElement = screen.getByTestId('test-switch');
    const thumbElement = switchElement.firstChild as HTMLElement;

    // Thumb should have correct classes
    expect(thumbElement).toHaveClass('pointer-events-none');
    expect(thumbElement).toHaveClass('rounded-full');
    expect(thumbElement).toHaveClass('bg-background');

    // Initially the thumb should be in the unchecked position
    expect(thumbElement).toHaveClass('data-[state=unchecked]:translate-x-0');

    // After clicking, the thumb should move
    fireEvent.click(switchElement);
    expect(thumbElement).toHaveClass('data-[state=checked]:translate-x-4');
  });
});
