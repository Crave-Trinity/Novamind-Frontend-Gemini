import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import { ScrollArea } from './scroll-area';

describe('ScrollArea Component', () => {
  it('renders with default props', () => {
    renderWithProviders(
      <ScrollArea data-testid="scroll-area">
        <div>Scroll content</div>
      </ScrollArea>
    );

    // Main component should be rendered
    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toBeInTheDocument();

    // Should have the default classes
    expect(scrollArea).toHaveClass('relative');
    expect(scrollArea).toHaveClass('overflow-hidden');

    // Should render the content
    expect(screen.getByText('Scroll content')).toBeInTheDocument();
  });

  it('applies custom className to the scrollArea', () => {
    renderWithProviders(
      <ScrollArea className="custom-scroll" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('custom-scroll');
    expect(scrollArea).toHaveClass('relative'); // Still has default classes
  });

  it('forwards ref to the scroll area element', () => {
    const ref = React.createRef<HTMLDivElement>();

    renderWithProviders(
      <ScrollArea ref={ref} data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    // Check that the ref was assigned to the scroll area
    expect(ref.current).toBe(screen.getByTestId('scroll-area'));
  });

  it('renders content with correct height and scrolls when content overflows', () => {
    renderWithProviders(
      <ScrollArea className="h-[200px] w-[200px]" data-testid="scroll-area">
        <div style={{ height: '500px' }}>Tall content that should scroll</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveClass('h-[200px]');
    expect(scrollArea).toHaveClass('w-[200px]');

    // Content should be in the viewport
    expect(screen.getByText('Tall content that should scroll')).toBeInTheDocument();
  });

  it('passes additional props to the scroll area', () => {
    renderWithProviders(
      <ScrollArea data-testid="scroll-area" id="custom-scroll" aria-label="Scrollable content">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toHaveAttribute('id', 'custom-scroll');
    expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content');
  });

  it('renders scroll area correctly', () => {
    renderWithProviders(
      <ScrollArea data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toBeInTheDocument();

    // Check that content is rendered
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
