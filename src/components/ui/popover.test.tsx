import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './popover';
import { vi } from 'vitest';

// Mock Radix UI Popover components as they use DOM APIs not available in test environment
vi.mock('@radix-ui/react-popover', () => {
  // Define types for props to fix TypeScript errors
  type RootProps = {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
  };
  
  type TriggerProps = {
    children: React.ReactNode;
    [key: string]: any;
  };
  
  type ContentProps = {
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    className?: string;
    [key: string]: any;
  };
  
  type AnchorProps = {
    children: React.ReactNode;
    [key: string]: any;
  };
  
  type PortalProps = {
    children: React.ReactNode;
  };

  const Root = ({ children, ...props }: RootProps) => (
    <div data-testid="popover-root" {...props}>
      {children}
    </div>
  );
  
  const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
    ({ children, ...props }, ref) => (
      <button data-testid="popover-trigger" ref={ref} {...props}>
        {children}
      </button>
    )
  );
  Trigger.displayName = 'PopoverTrigger';

  const Content = React.forwardRef<HTMLDivElement, ContentProps>(
    ({ children, align, sideOffset, className, ...props }, ref) => (
      <div
        data-testid="popover-content"
        data-state="open"
        data-side="bottom"
        data-align={align}
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  );
  Content.displayName = 'PopoverContent';

  const Anchor = React.forwardRef<HTMLDivElement, AnchorProps>(
    ({ children, ...props }, ref) => (
      <div data-testid="popover-anchor" ref={ref} {...props}>
        {children}
      </div>
    )
  );
  Anchor.displayName = 'PopoverAnchor';

  const Portal = ({ children }: PortalProps) => (
    <div data-testid="popover-portal">
      {children}
    </div>
  );

  return {
    Root,
    Trigger,
    Content,
    Anchor,
    Portal
  };
});

describe('Popover Component', () => {
  it('renders popover with trigger and content', () => {
    renderWithProviders(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );
    
    // Verify the root component is rendered
    const popoverRoot = screen.getByTestId('popover-root');
    expect(popoverRoot).toBeInTheDocument();
    
    // Verify trigger is rendered with correct text
    const trigger = screen.getByTestId('popover-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Open Popover');
    
    // Verify content is rendered within portal
    const portal = screen.getByTestId('popover-portal');
    expect(portal).toBeInTheDocument();
    
    const content = screen.getByTestId('popover-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Popover content');
  });

  it('applies custom className to popover content', () => {
    renderWithProviders(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent className="custom-popover-class">
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );
    
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('custom-popover-class');
    expect(content).toHaveClass('z-50'); // Default class
    expect(content).toHaveClass('rounded-md'); // Default class
  });

  it('forwards align and sideOffset props to PopoverContent', () => {
    renderWithProviders(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent align="start" sideOffset={10}>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );
    
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveAttribute('data-align', 'start');
  });

  it('renders PopoverAnchor component', () => {
    renderWithProviders(
      <Popover>
        <PopoverAnchor>
          <div>Anchor Element</div>
        </PopoverAnchor>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );
    
    const anchor = screen.getByTestId('popover-anchor');
    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveTextContent('Anchor Element');
  });

  it('forwards ref to PopoverContent', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    renderWithProviders(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent ref={ref}>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );
    
    // Ref should be forwarded to the content element
    expect(ref.current).toBe(screen.getByTestId('popover-content'));
  });

  it('handles additional props on PopoverContent', () => {
    renderWithProviders(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent data-custom="test" aria-label="Popover label">
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );
    
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveAttribute('data-custom', 'test');
    expect(content).toHaveAttribute('aria-label', 'Popover label');
  });
});