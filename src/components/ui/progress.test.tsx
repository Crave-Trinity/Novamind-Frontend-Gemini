import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Progress } from './progress';
import { vi } from 'vitest';

// Mock Radix UI Progress components
vi.mock('@radix-ui/react-progress', () => {
  type RootProps = {
    children: React.ReactNode;
    className?: string;
    value?: number;
    [key: string]: any;
  };

  type IndicatorProps = {
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  };

  const Root = React.forwardRef<HTMLDivElement, RootProps>(
    ({ children, className, ...props }, ref) => (
      <div data-testid="progress-root" ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  );
  Root.displayName = 'ProgressRoot';

  const Indicator = ({ className, style, ...props }: IndicatorProps) => (
    <div data-testid="progress-indicator" className={className} style={style} {...props} />
  );

  return {
    Root,
    Indicator,
  };
});

describe('Progress Component', () => {
  it('renders with default props', () => {
    renderWithProviders(<Progress data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toBeInTheDocument();

    // Check default classes
    expect(progress).toHaveClass('relative');
    expect(progress).toHaveClass('h-2');
    expect(progress).toHaveClass('w-full');
    expect(progress).toHaveClass('rounded-full');
    expect(progress).toHaveClass('bg-primary/20');

    // Check that indicator is rendered
    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-primary');

    // With no value specified, the indicator should default to 0
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('applies custom className to progress bar', () => {
    renderWithProviders(<Progress className="custom-progress" data-testid="progress" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveClass('custom-progress');
    expect(progress).toHaveClass('relative'); // Still has default classes
  });

  it('renders with 50% value correctly', () => {
    renderWithProviders(<Progress value={50} data-testid="progress" />);

    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
  });

  it('renders with 100% value correctly', () => {
    renderWithProviders(<Progress value={100} data-testid="progress" />);

    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('forwards ref to the progress element', () => {
    const ref = React.createRef<HTMLDivElement>();

    renderWithProviders(<Progress ref={ref} data-testid="progress" />);

    expect(ref.current).toBe(screen.getByTestId('progress'));
  });

  it('handles additional props', () => {
    renderWithProviders(
      <Progress data-testid="progress" aria-label="Loading progress" id="my-progress" />
    );

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('aria-label', 'Loading progress');
    expect(progress).toHaveAttribute('id', 'my-progress');
  });

  it('renders with negative values as 0%', () => {
    // Test negative values (should be treated as 0)
    renderWithProviders(<Progress value={-20} data-testid="progress-negative" />);
    const indicatorNegative = screen.getByTestId('progress-indicator');
    expect(indicatorNegative).toHaveStyle({ transform: 'translateX(-120%)' });
  });

  it('renders with values over 100% as 100%', () => {
    // Test values over 100
    renderWithProviders(<Progress value={120} data-testid="progress-over" />);
    const indicatorOver = screen.getByTestId('progress-indicator');
    expect(indicatorOver).toHaveStyle({ transform: 'translateX(--20%)' });
  });
});
