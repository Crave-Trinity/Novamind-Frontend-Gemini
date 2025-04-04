# Enhanced Testing with Tailwind CSS and Three.js

## Overview

This document outlines the comprehensive solution for testing React components using Tailwind CSS in the Novamind Digital Twin platform, with special consideration for components using Three.js/WebGL visualizations. The approach addresses common issues in testing environments, including:

- Proper handling of Tailwind CSS classes, especially in dark mode
- Prevention of hanging tests caused by animation loops and WebGL contexts
- Proper mocking of browser APIs and visual rendering
- Consistent cleanup to prevent memory leaks and test interference
- Type-safe testing utilities that maintain strict typing

## Architecture

The enhanced test solution consists of several key components:

### 1. Enhanced Test Setup (`src/test/setup.enhanced.ts`)

Provides the global test environment including:
- Tailwind CSS class simulation for proper testing of styled components
- Browser API mocking (ResizeObserver, IntersectionObserver, etc.)
- WebGL context handling with proper cleanup
- Console filtering to reduce noise from React internals
- DOM element initialization and cleanup

### 2. Enhanced Test Utilities (`src/test/test-utils.enhanced.tsx`)

Extends React Testing Library with:
- Dark mode control (enable, disable, toggle)
- Proper wrapping of components with ThemeProvider
- Helper functions for WebGL context cleanup
- Type-safe render function with enhanced return values

### 3. Three.js and React Three Fiber Mocks

Located in `src/test/mocks/`:
- Lightweight mocks of Three.js objects to prevent actual rendering
- Mocks for React Three Fiber hooks and components
- Animation frame handling without actual execution

### 4. Test Script (`scripts/run-enhanced-tests.sh`)

A unified test runner that:
- Uses a specialized test configuration
- Implements proper timeout handling
- Prevents test hanging through controlled execution
- Offers targeted test pattern execution

## How to Use

### Basic Component Testing

To test a component with Tailwind CSS classes:

```tsx
// example.enhanced.test.tsx
import { render, screen } from '@/test/test-utils.enhanced';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly in light mode', () => {
    render(<MyComponent />);
    const element = screen.getByTestId('my-element');
    expect(element).toHaveClass('bg-white');
    expect(element).not.toHaveClass('dark:bg-gray-800');
  });
  
  it('renders correctly in dark mode', () => {
    const { enableDarkMode } = render(<MyComponent />);
    
    // Enable dark mode
    enableDarkMode();
    
    const element = screen.getByTestId('my-element');
    // In JSDOM we can only check for presence of classes, not their application
    expect(element).toHaveClass('dark:bg-gray-800');
  });
});
```

### Running Tests

Use the provided npm scripts:

```bash
# Run all enhanced tests
npm run test:enhanced

# Run only Tailwind-specific tests
npm run test:enhanced:tailwind

# Run only ThemeProvider tests
npm run test:enhanced:theme

# Run specific test file or pattern
npm run test:enhanced "src/components/MyComponent.enhanced.test.tsx"
```

### Testing Three.js Components

For components that use Three.js or React Three Fiber:

1. Use minimal rendering tests that verify component existence without full rendering
2. Test the component's props and state changes without triggering animations
3. Use the enhanced setup that provides proper WebGL context mocking

Example:

```tsx
// BrainVisualizer.enhanced.test.tsx
import { render, screen } from '@/test/test-utils.enhanced';
import BrainVisualizer from './BrainVisualizer';

describe('BrainVisualizer', () => {
  it('renders without crashing', () => {
    render(<BrainVisualizer regions={[]} />);
    // Basic existence check is often sufficient for complex 3D components
    expect(screen.getByTestId('brain-visualizer')).toBeInTheDocument();
  });
  
  it('applies the correct classes when a region is active', () => {
    const { rerender } = render(
      <BrainVisualizer 
        regions={[{ id: 'region1', name: 'Region 1', active: false }]} 
      />
    );
    
    // Verify inactive state
    expect(screen.getByTestId('region-region1')).toHaveClass('opacity-50');
    
    // Update to active state
    rerender(
      <BrainVisualizer 
        regions={[{ id: 'region1', name: 'Region 1', active: true }]} 
      />
    );
    
    // Verify active state
    expect(screen.getByTestId('region-region1')).toHaveClass('opacity-100');
  });
});
```

## Best Practices

### 1. Testing Styled Components

- Add `data-testid` attributes to elements you want to test
- Test for the presence of Tailwind classes, not their visual effect
- Use the enhanced render function's `enableDarkMode` and `disableDarkMode` methods to test dark mode classes
- Focus on testing class application, not actual styling (JSDOM limitation)

### 2. Preventing Test Hangs

- Avoid tests that rely on animation loops
- Use the enhanced test setup that properly cleans up WebGL contexts
- For complex visualization components, test props and callbacks rather than rendering
- Separate unit tests (logic) from rendering tests (minimal tests just for validation)

### 3. Theme Context Testing

- Use the enhanced render function to properly set up theme context
- Test theme switching using the provided utilities
- Verify that components respond to theme changes by checking class changes

### 4. WebGL Cleanup

The enhanced setup automatically:
- Cleans up WebGL contexts after each test
- Restores animation frame mocks
- Removes canvas elements from the DOM
- Resets mocks between tests

## Technical Implementation Details

### Tailwind CSS Simulation

Since JSDOM doesn't actually apply CSS, we create a simulated environment by:

1. Adding minimal CSS classes that match Tailwind's syntax
2. Focusing tests on class application rather than visual outcomes
3. Using the `dark` class on the document root to simulate dark mode

### WebGL Context Management

WebGL contexts can cause memory leaks and hanging tests. We address this by:

1. Mocking Three.js objects to prevent actual rendering
2. Using `WEBGL_lose_context` extension to properly release contexts
3. Removing canvas elements from the DOM after each test
4. Restoring animation frame mocks to prevent memory leaks

### Animation Handling

Animation frames can cause tests to hang indefinitely. Our solution:

1. Mocks `requestAnimationFrame` and `cancelAnimationFrame`
2. Restores these mocks after each test
3. Implements a global timeout in the test runner script

## Conclusion

This enhanced testing solution provides a robust, type-safe way to test components that use Tailwind CSS classes and Three.js/WebGL visualizations. By properly handling dark mode, WebGL contexts, and animation frames, it prevents common issues like hanging tests and memory leaks, while maintaining the ability to test component logic and styling.

### WebGL Context Management

WebGL contexts can cause memory leaks and hanging tests. We address this by:

1. Mocking Three.js objects to prevent actual rendering
2. Using `WEBGL_lose_context` extension to properly release contexts
3. Removing canvas elements from the DOM after each test
4. Restoring animation frame mocks to prevent memory leaks

### Animation Handling

Animation frames can cause tests to hang indefinitely. Our solution:

1. Mocks `requestAnimationFrame` and `cancelAnimationFrame`
2. Restores these mocks after each test
3. Implements a global timeout in the test runner script

## Conclusion

This enhanced testing solution provides a robust, type-safe way to test components that use Tailwind CSS classes and Three.js/WebGL visualizations. By properly handling dark mode, WebGL contexts, and animation frames, it prevents common issues like hanging tests and memory leaks, while maintaining the ability to test component logic and styling.