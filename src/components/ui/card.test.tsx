import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from '../../test/test-utils.unified';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<Card data-testid="card">Card Content</Card>);
      
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Card Content');
      
      // Check default classes
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('shadow');
    });

    it('accepts and applies custom className', () => {
      renderWithProviders(
        <Card data-testid="card" className="custom-class">
          Card Content
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-xl'); // Should still have default classes
    });

    it('forwards additional props', () => {
      renderWithProviders(
        <Card data-testid="card" aria-label="Card element">
          Card Content
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-label', 'Card element');
    });
  });

  describe('CardHeader', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<CardHeader data-testid="header">Header Content</CardHeader>);
      
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Header Content');
      
      // Check default classes
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });

    it('accepts and applies custom className', () => {
      renderWithProviders(
        <CardHeader data-testid="header" className="custom-header">
          Header Content
        </CardHeader>
      );
      
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('p-6'); // Should still have default classes
    });
  });

  describe('CardTitle', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<CardTitle data-testid="title">Card Title</CardTitle>);
      
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
      
      // Check default classes
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
    });

    it('accepts and applies custom className', () => {
      renderWithProviders(
        <CardTitle data-testid="title" className="custom-title">
          Card Title
        </CardTitle>
      );
      
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('font-semibold'); // Should still have default classes
    });
  });

  describe('CardDescription', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(
        <CardDescription data-testid="description">Card Description</CardDescription>
      );
      
      const description = screen.getByTestId('description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Card Description');
      
      // Check default classes
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('accepts and applies custom className', () => {
      renderWithProviders(
        <CardDescription data-testid="description" className="custom-desc">
          Card Description
        </CardDescription>
      );
      
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-desc');
      expect(description).toHaveClass('text-sm'); // Should still have default classes
    });
  });

  describe('CardContent', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(
        <CardContent data-testid="content">Content goes here</CardContent>
      );
      
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content goes here');
      
      // Check default classes
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });

    it('accepts and applies custom className', () => {
      renderWithProviders(
        <CardContent data-testid="content" className="custom-content">
          Content goes here
        </CardContent>
      );
      
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('p-6'); // Should still have default classes
    });
  });

  describe('CardFooter', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<CardFooter data-testid="footer">Footer Content</CardFooter>);
      
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent('Footer Content');
      
      // Check default classes
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });

    it('accepts and applies custom className', () => {
      renderWithProviders(
        <CardFooter data-testid="footer" className="custom-footer">
          Footer Content
        </CardFooter>
      );
      
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('p-6'); // Should still have default classes
    });
  });

  describe('Card Component Integration', () => {
    it('renders a complete card with all subcomponents', () => {
      renderWithProviders(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the card content.</p>
          </CardContent>
          <CardFooter>
            <p>Footer content</p>
          </CardFooter>
        </Card>
      );
      
      // Check that all components are present
      const card = screen.getByTestId('full-card');
      expect(card).toBeInTheDocument();
      
      // Check content is rendered correctly
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('This is the card content.')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
      
      // Verify parent-child relationships (by checking text is within the full card)
      expect(card).toHaveTextContent('Card Title');
      expect(card).toHaveTextContent('Card Description');
      expect(card).toHaveTextContent('This is the card content.');
      expect(card).toHaveTextContent('Footer content');
    });
  });
});