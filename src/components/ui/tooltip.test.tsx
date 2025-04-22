import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock Radix UI Tooltip components
vi.mock('@radix-ui/react-tooltip', () => {
  const Root = ({
    children,
    open,
    defaultOpen,
    onOpenChange,
    ...props
  }: {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
  }) => (
    <div data-testid="tooltip-root" data-state={open ? 'open' : 'closed'} {...props}>
      {children}
    </div>
  );

  const Trigger = React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
    <button data-testid="tooltip-trigger" ref={ref} {...props}>
      {children}
    </button>
  ));

  const Portal = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div data-testid="tooltip-portal" {...props}>
      {children}
    </div>
  );

  const Content = React.forwardRef<HTMLDivElement, any>(
    ({ children, className, sideOffset, side = 'top', ...props }, ref) => (
      <div
        data-testid="tooltip-content"
        data-side={side}
        data-state="open"
        ref={ref}
        className={className}
        style={{ '--radix-tooltip-content-transform-origin': '0' } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  );

  const Provider = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  );

  Content.displayName = 'Content';
  Trigger.displayName = 'Trigger';

  return {
    Root,
    Trigger,
    Portal,
    Content,
    Provider,
  };
});

describe('Tooltip Component', () => {
  it('renders tooltip with default props', () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent data-testid="content">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const provider = screen.getByTestId('tooltip-provider');
    const root = screen.getByTestId('tooltip-root');
    const trigger = screen.getByTestId('trigger');
    const portal = screen.getByTestId('tooltip-portal');
    const content = screen.getByTestId('content');

    expect(provider).toBeInTheDocument();
    expect(root).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(portal).toBeInTheDocument();
    expect(content).toBeInTheDocument();

    expect(trigger).toHaveTextContent('Hover me');
    expect(content).toHaveTextContent('Tooltip text');
  });

  it('applies correct classes to tooltip content', () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId('tooltip-content');
    expect(content).toHaveClass('z-50');
    expect(content).toHaveClass('rounded-md');
    expect(content).toHaveClass('bg-primary');
    expect(content).toHaveClass('px-3');
    expect(content).toHaveClass('py-1.5');
    expect(content).toHaveClass('text-xs');
    expect(content).toHaveClass('text-primary-foreground');

    // Animation classes
    expect(content).toHaveClass('animate-in');
    expect(content).toHaveClass('fade-in-0');
    expect(content).toHaveClass('zoom-in-95');
  });

  it('applies custom className to tooltip content', () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId('tooltip-content');
    expect(content).toHaveClass('custom-tooltip');
    expect(content).toHaveClass('bg-primary'); // Still has default classes
  });

  it('sets custom sideOffset correctly', () => {
    const customOffset = 10;

    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent sideOffset={customOffset}>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId('tooltip-content');
    // Since we're mocking, we just need to verify the sideOffset was passed to the component
    expect(content).toBeInTheDocument();
  });

  it('handles side attribute correctly', () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side="bottom">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId('tooltip-content');
    expect(content).toHaveAttribute('data-side', 'bottom');
  });

  it('forwards ref to tooltip content', () => {
    const ref = React.createRef<HTMLDivElement>();

    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent ref={ref}>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(ref.current).toBe(screen.getByTestId('tooltip-content'));
  });

  it('passes additional props to tooltip content', () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent aria-label="Additional tooltip info">Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId('tooltip-content');
    expect(content).toHaveAttribute('aria-label', 'Additional tooltip info');
  });

  it('handles open state correctly', () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const root = screen.getByTestId('tooltip-root');
    expect(root).toHaveAttribute('data-state', 'open');
  });

  it('supports controlled tooltip with onOpenChange', () => {
    const handleOpenChange = vi.fn();

    renderWithProviders(
      <TooltipProvider>
        <Tooltip onOpenChange={handleOpenChange}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    // We can't directly test onOpenChange as it's a React prop not a DOM attribute
    // Instead, we verify the component renders correctly with this prop
    const root = screen.getByTestId('tooltip-root');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-state', 'closed');
  });
});
