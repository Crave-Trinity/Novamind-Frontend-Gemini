# Tailwind CSS v3.4 Implementation Guidelines

## Overview

Novamind Digital Twin frontend uses Tailwind CSS v3.4.x with pure TypeScript ESM configuration, aligning with our commitment to excellence and modern development practices. This document outlines the key aspects of our implementation and provides guidelines for developers.

## Configuration Approach

### Pure TypeScript ESM Configuration

We've configured all Tailwind-related files using TypeScript ESM format wherever possible:

- `tailwind.config.ts` - Main Tailwind configuration (ESM)
- `postcss.config.mjs` - PostCSS configuration (ESM)

This approach honors our core architectural principle:

> **Application Code**: PURE TYPESCRIPT & ESM ONLY
> - All application code written in TypeScript
> - All application code using ESM (import/export) syntax

## Key Tailwind CSS v3.4 Features

### Using `@apply` for Custom Components

Tailwind CSS v3.4 fully supports the `@apply` directive for extracting common utility patterns into reusable components:

```css
/* Standard CSS file */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .my-component {
    @apply bg-neural-300 text-gray-800 p-4 rounded-neuro;
  }
}
```

### CSS Variables for Theme Customization

We use CSS variables in the `:root` selector to define our custom colors and values:

```css
:root {
  --color-primary-500: oklch(0.65 0.15 250);
  --color-neural-500: oklch(0.65 0.15 290);
  /* ... other variables */
}
```

### Component CSS Files

For Vue, React, or Svelte components with scoped styles:

```jsx
// Component.tsx
import './Component.css';

export function Component() {
  return <div className="my-component">Content</div>;
}
```

```css
/* Component.css */
@tailwind components;

@layer components {
  .my-component {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-luxury p-4;
  }
}
```

## Custom Color Palette

We've defined a luxury enterprise color palette that includes:

- **Primary Colors**: Blue-based professional palette
- **Neural Palette**: Purple-hued theme for brain visualization
- **Semantic Colors**: For success, warning, danger, and info states
- **Luxury Accents**: Gold, silver, platinum, and obsidian

All colors are configured using OKLCH color space for better perceptual uniformity and color vibrance.

## Neuromorphic Design System

Our Tailwind configuration includes custom components for neuromorphic UI elements:

```css
@layer components {
  .neural-card {
    @apply bg-white dark:bg-gray-800 rounded-neuro shadow-neuro dark:shadow-neuro-dark p-6;
  }
}
```

## Tailwind Best Practices for Brain Visualization

### Performance Optimization

When working with 3D brain visualizations:

- Use utility classes for container elements:
  ```html
  <div class="h-screen w-full relative overflow-hidden bg-gray-950">
    <canvas id="brain-canvas" class="absolute inset-0"></canvas>
  </div>
  ```

- Apply animations with Tailwind:
  ```html
  <div class="animate-neural-pulse">
    <!-- Neural activity indicator -->
  </div>
  ```

### Dark Mode Support

All brain visualization components should include responsive dark mode variants:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <!-- Visualization container -->
</div>
```

## Tailwind Plugins

We leverage several official Tailwind plugins to enhance our capabilities:

- `@tailwindcss/forms` - For better form styling
- `@tailwindcss/typography` - For rich text content
- `@tailwindcss/aspect-ratio` - For responsive media containers

## Development Workflow

### Using VS Code with Tailwind IntelliSense

Ensure the Tailwind CSS IntelliSense extension is configured in your VS Code settings:

```json
{
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

## Common Troubleshooting

### Issue: Custom Theme Values Not Applied

If your custom theme values aren't being applied, check:

1. The CSS variables are correctly defined in `:root`
2. The Tailwind theme is properly configured in `tailwind.config.ts`
3. Your `@apply` directives are in the correct layer

### Issue: Styles not being applied

Check that:

1. PostCSS is correctly processing your files
2. The correct Tailwind classes are being used
3. Your import paths for CSS files are correct

## Conclusion

By using Tailwind CSS v3.4.x with pure TypeScript ESM, we're creating a more maintainable, type-safe, and performance-optimized frontend for the Novamind Digital Twin platform. This approach aligns with our commitment to excellence in both code quality and user experience.