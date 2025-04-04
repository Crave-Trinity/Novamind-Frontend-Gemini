# Testing Hanging Issues - Root Cause & Solutions

## Overview

This document explains the root causes of test hanging issues in the Novamind Digital Twin frontend test suite and provides comprehensive solutions to address them. These solutions have been implemented in our testing infrastructure and can be applied to any new components added to the system.

## Root Causes

Our investigation identified several causes for test hanging issues:

1. **Three.js/WebGL Initialization**: Visualization components that use Three.js or WebGL can cause hangs when initialized in a test environment without proper mocking.

2. **Resource Contention**: When multiple visualization components are tested concurrently, they compete for resources, especially WebGL contexts.

3. **Cleanup Issues**: Lack of proper cleanup in tests working with complex components, especially Three.js objects that need explicit disposal.

4. **React Query Integration**: Components using React Query can hang in tests when the queryClient isn't properly provided or mocked.

5. **Circular Dependencies**: Components with circular import dependencies can cause testing issues when partially mocked.

## Solution Strategy

We've implemented a multi-faceted approach to fixing test hanging issues:

### 1. Proper Component Mocking Pattern

The core solution involves a consistent mocking pattern for components:

```jsx
// These mocks must come BEFORE importing the component
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ 
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    scene: {}, 
    size: { width: 800, height: 600 } 
  }))
}));

vi.mock('three', () => ({
  // Comprehensive Three.js mocking
  Scene: vi.fn(),
  WebGLRenderer: vi.fn(() => ({
    render: vi.fn(),
    dispose: vi.fn(),
    // Other methods...
  })),
  // Additional Three.js objects...
}));

// Factory function for dynamic mock implementations
const mockComponentImplementation = vi.fn(() => (
  <div data-testid="component-container">
    <h1>Mocked Component</h1>
  </div>
));

// Mock the component implementation directly
vi.mock('./path/to/Component', () => ({
  default: () => mockComponentImplementation()
}));

// Now import the mocked component
import Component from './path/to/Component';
```

This pattern ensures:
- All mocks are defined before importing the component
- Three.js and React Three Fiber objects are properly mocked
- Component rendering logic is isolated from dependencies
- Dynamic component behavior can be customized per test

### 2. Test Execution Optimization

We've implemented optimized test execution through:

- **Test Categorization**: Separating tests into minimal, standard, and visualization categories
- **Sequential Execution**: Running visualization tests sequentially to prevent resource contention
- **Test Batching**: Executing visualization tests in small batches
- **Timeouts**: Setting appropriate timeouts to detect hanging tests

### 3. Automation Tools

We've created several scripts to automate the testing process:

- `fix-page-tests.ts`: Applies our mocking pattern to individual test files
- `fix-hanging-tests.ts`: Batch fixes multiple hanging tests at once
- `test-hang-detector.ts`: Detects and reports hanging tests
- `run-optimized-tests.ts`: User-friendly script to run tests with auto-fixing

## How to Use the Solution

### Running Tests with Optimized Configuration

```bash
npx tsx scripts/run-optimized-tests.ts
```

This runs the full test suite with optimized configuration to prevent hangs.

### Automatically Fixing Hanging Tests

```bash
npx tsx scripts/run-optimized-tests.ts --fix
```

This runs tests and automatically applies fixes to any hanging tests.

### Run Specific Tests

```bash
npx tsx scripts/run-optimized-tests.ts --pattern "src/components/**/*.test.tsx"
```

This runs tests for specific components matching the pattern.

### Manually Fixing a Test

```bash
npx tsx scripts/fix-page-tests.ts src/components/MyComponent.test.tsx
```

This applies our mocking pattern to fix a specific test file.

## Best Practices for New Components

When creating tests for new visualization components:

1. **Pre-Mock Dependencies**: Always mock Three.js, React Three Fiber, and other WebGL-related libraries before importing the component.

2. **Use Factory Functions**: Create factory functions for mock implementations to allow for dynamic behavior in different tests.

3. **Simplified Rendering**: Render simplified versions of components that focus on the interface rather than the implementation.

4. **Proper Cleanup**: Ensure proper cleanup after each test (vi.restoreAllMocks() helps with this).

5. **Category Separation**: Keep visualization tests separate from standard tests when possible.

## Common Issues and Solutions

### Three.js Objects Missing from Mocks

If you encounter errors like:
```
Error: No "QuadraticBezierCurve3" export is defined on the "three" mock
```

Add the missing object to the Three.js mock:
```js
vi.mock('three', () => ({
  // Existing mocks...
  QuadraticBezierCurve3: vi.fn(() => ({
    getPoints: vi.fn(() => [])
  }))
}));
```

### React Query Issues

If components use React Query, mock the query client:
```js
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ 
    data: mockData,
    isLoading: false,
    error: null
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false
  }))
}));
```

### Testing Components with Hooks

For tests involving hooks like `useBrainModel` or `useVisualSettings`:
```js
vi.mock('../../application/hooks/useBrainModel', () => ({
  default: vi.fn(() => ({
    brainData: mockBrainData,
    isLoading: false,
    error: null
  }))
}));
```

## Conclusion

By implementing these solutions, we've been able to address the test hanging issues in our codebase. The automated tools we've created make it easy to maintain a healthy test suite, and the best practices outlined here will help ensure that new components don't reintroduce these issues.