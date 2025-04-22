import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from './select';

// Mock the Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Check: () => <div data-testid="check-icon" />
}));

// Mock Radix UI Select components
vi.mock('@radix-ui/react-select', () => {
  // Create mock components
  const Root = ({ children, onValueChange, value, defaultValue, ...props }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
    defaultValue?: string;
    [key: string]: any;
  }) => (
    <div data-testid="select-root" data-value={value || defaultValue} {...props}>
      {children}
    </div>
  );

  const Group = ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  );

  const Value = ({ children, placeholder, ...props }: {
    children?: React.ReactNode;
    placeholder?: string;
    [key: string]: any;
  }) => (
    <span data-testid="select-value" data-placeholder={placeholder} {...props}>
      {children}
    </span>
  );

  const Trigger = React.forwardRef<HTMLButtonElement, any>(({ children, className, disabled, ...props }, ref) => (
    <button
      data-testid="select-trigger"
      className={className}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  ));
  Trigger.displayName = 'Trigger';

  const Icon = ({ children, asChild, ...props }: {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: any;
  }) => (
    <span data-testid="select-icon" data-aschild={asChild ? 'true' : undefined} {...props}>
      {children}
    </span>
  );

  const Portal = ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="select-portal" {...props}>
      {children}
    </div>
  );

  const Content = React.forwardRef<HTMLDivElement, any>(({ 
    children, 
    className,
    position,
    ...props
  }, ref) => (
    <div
      data-testid="select-content"
      className={className}
      data-position={position}
      data-state="open"
      ref={ref}
      style={{ '--radix-select-content-transform-origin': '0' } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  ));
  Content.displayName = 'Content';

  const Viewport = ({ children, className, ...props }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
  }) => (
    <div data-testid="select-viewport" className={className} {...props}>
      {children}
    </div>
  );

  const Item = React.forwardRef<HTMLDivElement, any>(({ 
    children,
    className,
    value,
    disabled,
    ...props
  }, ref) => (
    <div
      data-testid="select-item"
      className={className}
      data-value={value}
      data-disabled={disabled ? 'true' : undefined}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ));
  Item.displayName = 'Item';

  const ItemText = ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <span data-testid="select-item-text" {...props}>
      {children}
    </span>
  );

  const ItemIndicator = ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <span data-testid="select-item-indicator" {...props}>
      {children}
    </span>
  );

  const Label = React.forwardRef<HTMLLabelElement, any>(({ 
    children, 
    className,
    ...props
  }, ref) => (
    <label
      data-testid="select-label"
      className={className}
      ref={ref}
      {...props}
    >
      {children}
    </label>
  ));
  Label.displayName = 'Label';

  const Separator = React.forwardRef<HTMLDivElement, any>(({ 
    className,
    ...props
  }, ref) => (
    <div
      data-testid="select-separator"
      className={className}
      ref={ref}
      {...props}
    />
  ));
  Separator.displayName = 'Separator';

  const ScrollUpButton = React.forwardRef<HTMLDivElement, any>(({ 
    className,
    ...props
  }, ref) => (
    <div
      data-testid="select-scroll-up-button"
      className={className}
      ref={ref}
      {...props}
    />
  ));
  ScrollUpButton.displayName = 'ScrollUpButton';

  const ScrollDownButton = React.forwardRef<HTMLDivElement, any>(({ 
    className,
    ...props
  }, ref) => (
    <div
      data-testid="select-scroll-down-button"
      className={className}
      ref={ref}
      {...props}
    />
  ));
  ScrollDownButton.displayName = 'ScrollDownButton';

  return {
    Root,
    Group,
    Value,
    Trigger,
    Icon,
    Portal,
    Content,
    Viewport,
    Item,
    ItemText,
    ItemIndicator,
    Label,
    Separator,
    ScrollUpButton,
    ScrollDownButton
  };
});

describe('Select Component', () => {
  it('renders with default props', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    
    const root = screen.getByTestId('select-root');
    const trigger = screen.getByTestId('trigger');
    const value = screen.getByTestId('select-value');
    
    expect(root).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(value).toBeInTheDocument();
    expect(value).toHaveAttribute('data-placeholder', 'Select an option');
  });

  it('applies custom className to SelectTrigger', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger className="custom-trigger" data-testid="trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('custom-trigger');
    expect(trigger).toHaveClass('flex');
    expect(trigger).toHaveClass('h-9');
  });

  it('renders SelectGroup with label', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    
    const group = screen.getByTestId('select-group');
    const label = screen.getByTestId('select-label');
    
    expect(group).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Fruits');
    expect(label).toHaveClass('px-2');
    expect(label).toHaveClass('py-1.5');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-semibold');
  });

  it('renders SelectItem with correct styling', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple" data-testid="apple-item">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const item = screen.getByTestId('apple-item');
    const itemText = screen.getByTestId('select-item-text');
    const itemIndicator = screen.getByTestId('select-item-indicator');
    
    expect(item).toBeInTheDocument();
    expect(itemText).toBeInTheDocument();
    expect(itemIndicator).toBeInTheDocument();
    expect(itemText).toHaveTextContent('Apple');
    expect(item).toHaveAttribute('data-value', 'apple');
    expect(item).toHaveClass('relative');
    expect(item).toHaveClass('flex');
    expect(item).toHaveClass('w-full');
    expect(item).toHaveClass('cursor-default');
    expect(item).toHaveClass('select-none');
    expect(item).toHaveClass('rounded-sm');
  });

  it('handles disabled SelectItem', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple" disabled data-testid="disabled-item">
            Apple
          </SelectItem>
        </SelectContent>
      </Select>
    );
    
    const item = screen.getByTestId('disabled-item');
    expect(item).toHaveAttribute('data-disabled', 'true');
    expect(item).toHaveClass('data-[disabled]:pointer-events-none');
    expect(item).toHaveClass('data-[disabled]:opacity-50');
  });

  it('renders SelectSeparator correctly', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    
    const separator = screen.getByTestId('select-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('-mx-1');
    expect(separator).toHaveClass('my-1');
    expect(separator).toHaveClass('h-px');
    expect(separator).toHaveClass('bg-muted');
  });

  it('handles defaultValue correctly', () => {
    renderWithProviders(
      <Select defaultValue="banana">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const root = screen.getByTestId('select-root');
    expect(root).toHaveAttribute('data-value', 'banana');
  });

  it('renders content with different position prop', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const content = screen.getByTestId('select-content');
    expect(content).toHaveAttribute('data-position', 'item-aligned');
  });

  it('forwards ref to trigger element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    
    renderWithProviders(
      <Select>
        <SelectTrigger ref={ref} data-testid="trigger-with-ref">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    expect(ref.current).toBe(screen.getByTestId('trigger-with-ref'));
  });

  it('handles disabled trigger state', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger disabled data-testid="disabled-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const trigger = screen.getByTestId('disabled-trigger');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass('disabled:cursor-not-allowed');
    expect(trigger).toHaveClass('disabled:opacity-50');
  });

  it('renders ChevronDown icon in the trigger', () => {
    renderWithProviders(
      <Select>
        <SelectTrigger data-testid="trigger-with-icon">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    // Get the trigger element first
    const trigger = screen.getByTestId('trigger-with-icon');
    // Then find the icon within the trigger
    const triggerIcon = screen.getByTestId('select-icon');
    expect(triggerIcon).toBeInTheDocument();
  });

  it('renders check icon for selected item', () => {
    renderWithProviders(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const check = screen.getByTestId('check-icon');
    expect(check).toBeInTheDocument();
  });
});