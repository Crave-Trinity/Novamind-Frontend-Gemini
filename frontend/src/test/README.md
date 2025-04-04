# Testing with Tailwind CSS

This directory contains utilities for testing components that use Tailwind CSS, including support for dark mode.

## Key Files

- `tailwind-mock.ts` - Mock implementation for Tailwind CSS in tests
- `setup.ts` - Test setup file that initializes the Tailwind mock
- `test-utils.tsx` - Enhanced rendering utilities with theme/dark mode support
- `tailwind-testing-example.test.tsx` - Example of how to test Tailwind CSS components

## Common Testing Issues & Solutions

### Problem: JSDOM Doesn't Process CSS

When running tests in a JSDOM environment (the default for Jest/Vitest), CSS is not actually processed or applied. This can cause issues when testing components that rely on CSS classes for styling, especially with:

- Dark mode toggles
- Theme changes
- Media queries
- CSS variables

### Solution: Class-Based Testing

Rather than trying to test the actual computed styles (which don't exist in JSDOM), we test that:

1. The correct Tailwind classes are applied to elements
2. Dark mode classes (`dark:*`) are present when they should be
3. Theme toggles modify the document classes appropriately

## Usage Guide

### Basic Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

test('component renders with correct Tailwind classes', () => {
  render(<YourComponent />);
  
  const element = screen.getByTestId('your-element');
  expect(element).toHaveClass('bg-white');
  expect(element).toHaveClass('dark:bg-gray-800');
});
```

### Testing Dark Mode

Use our enhanced rendering utilities:

```tsx
import { render, screen } from '../test/test-utils';
import { tailwindMock } from '../test/tailwind-mock';
import YourComponent from './YourComponent';

test('component toggles dark mode classes', () => {
  // Render with dark mode enabled
  const { enableDarkMode, disableDarkMode } = render(<YourComponent />);
  
  // Toggle dark mode
  enableDarkMode();
  
  // Check that dark mode class is added to document
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  
  // Toggle back to light mode
  disableDarkMode();
  expect(document.documentElement.classList.contains('dark')).toBe(false);
});
```

### Testing Components with Dark Mode Classes

```tsx
import { render, screen } from '../test/test-utils';
import YourComponent from './YourComponent';

test('component has appropriate dark mode classes', () => {
  render(<YourComponent />);
  
  // Verify dark mode classes are present (they will be applied when dark mode is active)
  const element = screen.getByTestId('your-element');
  expect(element).toHaveClass('dark:bg-gray-800');
  expect(element).toHaveClass('dark:text-white');
});
```

## Best Practices

1. **Focus on class presence**: Test that elements have the expected Tailwind classes.
2. **Avoid testing computed styles**: Don't try to test actual rendered appearance.
3. **Separate theme logic**: Test theme switching functions separately from visual appearance.
4. **Use test data attributes**: Add `data-testid` attributes to make selecting elements easier.
5. **Verify dark mode classes**: Make sure dark mode variants are correctly applied.

## Troubleshooting

- If dark mode classes aren't working, check that your tailwind.config.js is set to use `class` strategy: `darkMode: 'class'`
- If class-based tests fail, verify the components are using the correct Tailwind classes
- For theme-related issues, make sure the theme context is properly provided in tests

## Extending

To add support for additional Tailwind utilities in the test environment:

1. Update `tailwind-mock.ts` with new CSS classes in the `injectTailwindStyles` function
2. Add any new theme-related functionality to `test-utils.tsx`
