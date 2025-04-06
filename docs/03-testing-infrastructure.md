# Testing Infrastructure

## Overview

Our testing infrastructure is designed to support comprehensive testing at all levels while maintaining simplicity and reliability.

## Core Principles

1. **Test Organization**
   - Tests colocated with implementation
   - Clear naming conventions
   - Consistent structure
   - Proper isolation

2. **Test Types**
   - Unit tests
   - Integration tests
   - Component tests
   - End-to-end tests

3. **Test Quality**
   - High coverage
   - Meaningful assertions
   - Clear descriptions
   - Maintainable code

## Implementation

### 1. Test Setup

```typescript
// src/test/setup.ts

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Global test setup
afterEach(() => {
  cleanup();
});
```

### 2. Test Utilities

```typescript
// src/test/utils/renderHook.ts

import { renderHook as render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: {
    initialProps?: Props;
    wrapper?: React.ComponentType;
  }
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    ...options,
  });
}
```

### 3. Mock Factories

```typescript
// src/test/factories/brainModel.ts

import { faker } from '@faker-js/faker';
import type { BrainModel } from '@domain/types';

export function createMockBrainModel(override?: Partial<BrainModel>): BrainModel {
  return {
    id: faker.string.uuid(),
    patientId: faker.string.uuid(),
    regions: [],
    connections: [],
    scan: {
      id: faker.string.uuid(),
      scanDate: faker.date.recent(),
      type: 'MRI',
      url: faker.internet.url(),
    },
    ...override,
  };
}
```

## Test Examples

### 1. Component Tests

```typescript
// src/presentation/components/BrainViewer/BrainViewer.test.tsx

import { render, screen } from '@testing-library/react';
import { BrainViewer } from './BrainViewer';
import { createMockBrainModel } from '@test/factories';

describe('BrainViewer', () => {
  it('renders brain model correctly', () => {
    const model = createMockBrainModel();
    render(<BrainViewer model={model} />);
    expect(screen.getByTestId('brain-viewer')).toBeInTheDocument();
  });
});
```

### 2. Hook Tests

```typescript
// src/application/hooks/useBrainVisualization.test.ts

import { renderHook, waitFor } from '@test/utils';
import { useBrainVisualization } from './useBrainVisualization';
import { createMockBrainModel } from '@test/factories';

describe('useBrainVisualization', () => {
  it('fetches and returns brain model', async () => {
    const { result } = renderHook(() => 
      useBrainVisualization('test-id')
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## Test Configuration

### 1. Vitest Config

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### 2. TypeScript Config

```json
// tsconfig.json

{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "paths": {
      "@test/*": ["./src/test/*"]
    }
  }
}
```

## Best Practices

1. **Test Structure**
   ```typescript
   describe('ComponentName', () => {
     beforeEach(() => {
       // Setup
     });

     afterEach(() => {
       // Cleanup
     });

     it('should do something specific', () => {
       // Test
     });
   });
   ```

2. **Naming Conventions**
   - Files: `*.test.ts` or `*.test.tsx`
   - Descriptions: Clear and specific
   - Variables: Descriptive names

3. **Assertions**
   - Use specific matchers
   - Check meaningful states
   - Avoid implementation details

4. **Mocking**
   - Mock at boundaries
   - Use factories
   - Keep mocks simple

## CI/CD Integration

1. **GitHub Actions**
   ```yaml
   name: Test
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm ci
         - run: npm test
   ```

2. **Coverage Reports**
   - Generate on CI
   - Upload artifacts
   - Track trends

## Migration Guide

1. **Preparation**
   - Set up test infrastructure
   - Create test utilities
   - Configure test runners

2. **Implementation**
   - Write new tests
   - Update existing tests
   - Add test factories

3. **Validation**
   - Run test suite
   - Check coverage
   - Review test quality

4. **Maintenance**
   - Regular updates
   - Performance monitoring
   - Documentation updates 