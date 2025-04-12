import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils.unified';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Component', () => {
  const renderTabs = () => {
    return renderWithProviders(
      <Tabs defaultValue="tab1" data-testid="tabs-root">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1" data-testid="tab1-trigger">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3" data-testid="tab3-trigger" disabled>Tab 3 (Disabled)</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="tab1-content">
          Tab 1 Content
        </TabsContent>
        <TabsContent value="tab2" data-testid="tab2-content">
          Tab 2 Content
        </TabsContent>
        <TabsContent value="tab3" data-testid="tab3-content">
          Tab 3 Content
        </TabsContent>
      </Tabs>
    );
  };

  it('renders tabs with the correct structure and default tab selected', () => {
    renderTabs();
    
    // Verify the tabs structure
    const tabsList = screen.getByTestId('tabs-list');
    const tab1Trigger = screen.getByTestId('tab1-trigger');
    const tab2Trigger = screen.getByTestId('tab2-trigger');
    const tab3Trigger = screen.getByTestId('tab3-trigger');
    
    expect(tabsList).toBeInTheDocument();
    expect(tab1Trigger).toBeInTheDocument();
    expect(tab2Trigger).toBeInTheDocument();
    expect(tab3Trigger).toBeInTheDocument();
    
    // Verify the default tab is selected
    expect(tab1Trigger).toHaveAttribute('data-state', 'active');
    expect(tab2Trigger).toHaveAttribute('data-state', 'inactive');
    
    // Verify the content of the default tab is visible
    const tab1Content = screen.getByTestId('tab1-content');
    expect(tab1Content).toBeInTheDocument();
    expect(tab1Content).toHaveTextContent('Tab 1 Content');
    
    // Check that the other tab content exists but is not visible
    const tab2Content = screen.getByTestId('tab2-content');
    expect(tab2Content).toBeInTheDocument();
    expect(tab2Content).toHaveAttribute('data-state', 'inactive');
  });

  it('switches tab content when clicking a different tab', () => {
    renderTabs();
    
    const tab1Trigger = screen.getByTestId('tab1-trigger');
    const tab2Trigger = screen.getByTestId('tab2-trigger');
    
    // Initially, tab1 should be active
    expect(tab1Trigger).toHaveAttribute('data-state', 'active');
    expect(tab2Trigger).toHaveAttribute('data-state', 'inactive');
    
    // Click on tab2
    fireEvent.click(tab2Trigger);
    
    // After clicking, tab2 should be active
    expect(tab1Trigger).toHaveAttribute('data-state', 'inactive');
    expect(tab2Trigger).toHaveAttribute('data-state', 'active');
    
    // Tab1 content should not be visible, tab2 content should be visible
    const tab1Content = screen.getByTestId('tab1-content');
    const tab2Content = screen.getByTestId('tab2-content');
    
    expect(tab1Content).toHaveAttribute('data-state', 'inactive');
    expect(tab2Content).toHaveAttribute('data-state', 'active');
  });

  it('disables interaction with disabled tabs', () => {
    renderTabs();
    
    const tab3Trigger = screen.getByTestId('tab3-trigger');
    
    // Verify tab3 is disabled
    expect(tab3Trigger).toBeDisabled();
    
    // Try to click on tab3
    fireEvent.click(tab3Trigger);
    
    // Tab3 should not be activated
    expect(tab3Trigger).not.toHaveAttribute('data-state', 'active');
    
    // Tab3 content should not be visible
    const tab3Content = screen.getByTestId('tab3-content');
    expect(tab3Content).toHaveAttribute('data-state', 'inactive');
  });

  it('applies custom classes to each component', () => {
    renderWithProviders(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-tabs-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Tab 1 Content
        </TabsContent>
      </Tabs>
    );
    
    const tabsList = screen.getByRole('tablist');
    const tabTrigger = screen.getByRole('tab', { name: 'Tab 1' });
    const tabContent = screen.getByText('Tab 1 Content').closest('[data-radix-tabs-content]');
    
    expect(tabsList).toHaveClass('custom-tabs-list');
    expect(tabsList).toHaveClass('bg-muted'); // Should still have default classes
    
    expect(tabTrigger).toHaveClass('custom-trigger');
    expect(tabTrigger).toHaveClass('rounded-md'); // Should still have default classes
    
    expect(tabContent).toHaveClass('custom-content');
    expect(tabContent).toHaveClass('mt-2'); // Should still have default classes
  });

  it('renders tabs with accessibility attributes', () => {
    renderTabs();
    
    // Check tablist role
    const tabsList = screen.getByTestId('tabs-list');
    expect(tabsList).toHaveAttribute('role', 'tablist');
    
    // Check tab roles and aria-selected attributes
    const tab1Trigger = screen.getByTestId('tab1-trigger');
    const tab2Trigger = screen.getByTestId('tab2-trigger');
    
    expect(tab1Trigger).toHaveAttribute('role', 'tab');
    expect(tab2Trigger).toHaveAttribute('role', 'tab');
    
    expect(tab1Trigger).toHaveAttribute('aria-selected', 'true');
    expect(tab2Trigger).toHaveAttribute('aria-selected', 'false');
    
    // Check tabpanel roles and aria-labelledby
    const tab1Content = screen.getByTestId('tab1-content');
    expect(tab1Content).toHaveAttribute('role', 'tabpanel');
    expect(tab1Content).toHaveAttribute('tabindex', '0');
    
    // After switching tabs, accessibility attributes should update
    fireEvent.click(tab2Trigger);
    
    expect(tab1Trigger).toHaveAttribute('aria-selected', 'false');
    expect(tab2Trigger).toHaveAttribute('aria-selected', 'true');
  });

  it('supports dynamic values', () => {
    const TestTabs = ({ defaultTab }: { defaultTab: string }) => (
      <Tabs defaultValue={defaultTab} data-testid="dynamic-tabs">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    );
    
    const { rerender } = renderWithProviders(<TestTabs defaultTab="a" />);
    
    // With default tab "a", content A should be visible
    expect(screen.getByText('Content A')).toBeVisible();
    
    // Re-render with different default tab
    rerender(<TestTabs defaultTab="b" />);
    
    // With default tab "b", content B should be visible
    const tabB = screen.getByRole('tab', { name: 'Tab B' });
    expect(tabB).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Content B')).toBeVisible();
  });
});