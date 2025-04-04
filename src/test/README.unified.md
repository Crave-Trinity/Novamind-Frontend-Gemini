# Unified Testing Framework for Novamind Digital Twin

This document explains the new unified testing approach for the Novamind Digital Twin project, which provides a clean, consistent way to test components that use Tailwind CSS, including dark mode support.

## Overview

The unified testing framework consolidates all testing-related configurations into a single source of truth, eliminating the confusion and inconsistencies of multiple test setups.

### Key Components

1. **`setup.unified.ts`**: Core test environment setup with proper DOM initialization, Tailwind CSS class simulation, and browser API mocks
2. **`test-utils.unified.tsx`**: Enhanced render functions with theme provider integration
3. **`vitest.config.unified.ts`**: Unified Vitest configuration
4. **`scripts/run-with-unified-config.sh`**: Convenience script for running tests with the unified config

## Features

- **JSDOM Environment**: Properly initialized for DOM testing
- **Tailwind CSS Support**: Mock implementation of Tailwind CSS classes
- **Dark Mode Testing**: Easy toggling of dark/light mode
- **ThemeProvider Integration**: Tests components with theme context

## Usage

### Running Tests

Use the `npm run test:unified` script to run all unified tests:

```bash
npm run test:unified
```

Or run specific test files:

```bash
npm run test:tailwind
# or directly
scripts/run-with-unified-config.sh src/your/test/file.unified.test.tsx
```

### Writing Tests

Create test files with the `.unified.test.tsx` extension to leverage the unified testing framework:

```tsx
// example.unified.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils.unified';

describe('Component Test', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('toggles dark mode correctly', () => {
    const { enableDarkMode, disableDarkMode } = render(<YourComponent />);
    
    // Start in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Toggle to dark mode
    enableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Toggle back to light mode
    disableDarkMode();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

## Technical Details

### Tailwind CSS Mock Implementation

The Tailwind CSS mock system injects basic utility classes that correspond to Tailwind's most common classes, allowing tests to verify that components have the correct classes without needing a full Tailwind implementation.

Key functionality:
- Light/dark mode class toggling via `document.documentElement.classList`
- Basic set of utility classes including colors, spacing, and layout
- Simulation of dark mode variants (dark:bg-gray-800, etc.)

### DOM Setup

The setup file ensures that:
- `document` and `window` objects are properly initialized
- Browser APIs like `matchMedia`, `IntersectionObserver`, and `ResizeObserver` are mocked
- The DOM tree has the expected structure for theme-related tests

### Benefits over Legacy Test Setup

- **Consolidated Configuration**: Single source of truth for all test settings
- **Consistent DOM Environment**: Properly initialized JSDOM for all tests
- **Simplified Theme Testing**: Easy dark mode toggling and theme context setup
- **Better Error Handling**: Clear error messages when DOM elements are missing
- **Performance**: Optimized setup with minimal overhead

## Migration Guide

To migrate existing tests to the unified framework:

1. Rename test files from `.test.tsx` to `.unified.test.tsx`
2. Import from `test-utils.unified` instead of `test-utils`:
   ```tsx
   import { render, screen } from '../test/test-utils.unified';
   ```
3. Update any theme-related tests to use the new helper functions:
   ```tsx
   const { enableDarkMode, disableDarkMode } = render(<Component />);
   ```

## Example

See `tailwind-example.unified.test.tsx` for a complete example of testing a component with Tailwind classes and dark mode support.