# Test Environment Setup - Single Source of Truth

## Overview

This document defines the standardized test environment setup for the Novamind Frontend project. It serves as the source of truth for test configuration, ensuring consistency and maintainability across the codebase.

## Core Test Files

The test environment is built around four key files:

1. **`config/vitest.config.ts`** - The canonical Vitest configuration
2. **`src/test/setup.jest-dom.ts`** - Jest-DOM matchers extension
3. **`src/test/setup.ts`** - Core test environment setup with browser API mocks
4. **`src/test/test-utils.tsx`** - React component test utilities and custom render functions

## File Descriptions

### 1. Vitest Configuration (`config/vitest.config.ts`)

This file defines the core testing configuration including file patterns, environment settings, and setup file loading order. Key settings include:

- JSDOM environment for browser simulation
- Proper path aliases for import resolution
- Test file patterns (`*.test.ts`, `*.test.tsx`, `*.spec.tsx`)
- Coverage configuration

**Critical:** Setup files are loaded in a specific order, with Jest-DOM matchers loaded first to ensure they're available throughout the test environment.

### 2. Jest-DOM Setup (`src/test/setup.jest-dom.ts`)

This file extends Vitest's `expect` with Jest-DOM matchers, enabling DOM-specific assertions like:

```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
```

It also extends TypeScript typings to provide proper IntelliSense for these matchers.

### 3. Core Setup (`src/test/setup.ts`)

This file provides:

- Browser API mocks (localStorage, matchMedia, IntersectionObserver, etc.)
- Canvas and WebGL context mocks
- Three.js mocks
- Global cleanup hooks
- Test utility functions

The mocks are implemented using Vitest's `vi.fn()` and carefully structured to avoid conflicts and ensure consistent behavior across tests.

### 4. Test Utilities (`src/test/test-utils.tsx`)

This file provides:

- A custom `render` function that wraps components with all necessary providers
- Mock implementations of context providers (Theme, User, Data, etc.)
- A QueryClient factory for React Query tests
- Re-exports from `@testing-library/react` for convenience

## Using the Test Environment

### Basic Component Test Example

```typescript
import { render, screen } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Testing with Context Providers

The custom `render` function accepts options to customize the testing environment:

```typescript
import { render, screen } from '@/test/test-utils';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders with dark theme', () => {
    render(<UserProfile />, { 
      theme: 'dark',
      initialRoute: '/profile',
      // Custom data context can be provided
      mockData: {
        ...defaultMockData,
        patientData: { name: 'Test Patient' }
      }
    });
    
    expect(screen.getByText('Test Patient')).toBeInTheDocument();
  });
});
```

## Troubleshooting Common Issues

### "Invalid Chai property: toBeInTheDocument"

This error indicates that Jest-DOM matchers are not properly extended. Check that:

1. `setup.jest-dom.ts` is being loaded first in the Vitest configuration
2. The `expect.extend(matchers)` call isn't overridden elsewhere

### "TypeError: window is not defined"

This error occurs when browser APIs are accessed in a non-browser environment. Ensure:

1. Tests are running with `--environment jsdom` flag
2. Browser API access is wrapped in `typeof window !== 'undefined'` checks

### React Query-Related Errors

For tests involving React Query:

1. Use the provided `createTestQueryClient()` function
2. Set appropriate options: `{ retry: false, gcTime: 0, staleTime: Infinity }`
3. Use `renderWithProviders` which automatically sets up a QueryClientProvider

## Extending the Test Environment

When extending the test environment:

1. **DO NOT** create new setup files; modify the existing canonical files
2. Add new mock implementations to the appropriate file based on their purpose
3. Document all changes in code comments
4. Update this document if introducing significant changes

## Best Practices

1. **Isolation**: Tests should be isolated and not depend on global state
2. **Consistent Mocking**: Use the provided mocks instead of creating new ones
3. **Explicit Dependencies**: Clearly state what is being tested and mocked
4. **Clean Teardown**: Ensure tests clean up after themselves using afterEach hooks
5. **Minimal Assertions**: Test one thing per test case
