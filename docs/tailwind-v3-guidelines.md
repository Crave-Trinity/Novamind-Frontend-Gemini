# Tailwind CSS v3.4 Implementation Guidelines

## 1. Overview

Novamind Digital Twin frontend uses Tailwind CSS v3.4.x, aligning with our commitment to excellence and modern development practices. This document outlines the key aspects of our implementation and provides guidelines for developers.

*Note: Tailwind CSS v4 is available. Migration to v4 is a separate task and should be planned accordingly.*

## 2. Configuration & Integration

### 2.1. Configuration Files

We configure Tailwind primarily using CommonJS (`.cjs`) files, as required by the PostCSS ecosystem tools:

-   `config/tailwind/tailwind.config.cjs`: Main Tailwind configuration.
-   `config/postcss/postcss.config.cjs`: PostCSS configuration.

This approach honors our core architectural principle for application code (Pure TypeScript & ESM ONLY) while accommodating build tool requirements.

**`postcss.config.cjs`:**

```javascript
// config/postcss/postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-import': {}, // Handle @import statements
    'tailwindcss/nesting': {}, // Handle CSS nesting (based on postcss-nesting)
    tailwindcss: {}, // Process Tailwind directives
    autoprefixer: {}, // Add vendor prefixes
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}) // Minify in production
  }
}
```

**`tailwind.config.cjs`:**

```javascript
// config/tailwind/tailwind.config.cjs (Illustrative)
const { fontFamily } = require('tailwindcss/defaultTheme') // Example if needed

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan source files
  ],
  theme: {
    extend: {
      // --- Custom Theme Configuration ---
      // Example: colors, spacing, borderRadius, boxShadow, keyframes, animation
      // colors: { primary: { '500': 'oklch(0.65 0.15 250)' }, ... },
      // borderRadius: { neuro: '12px', ... },
      // boxShadow: { neuro: '...', 'neuro-dark': '...' },
    },
  },
  darkMode: 'class', // Enable class-based dark mode
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### 2.2. Integration Method: PostCSS Plugin

We use the standard PostCSS plugin integration, which offers excellent compatibility with our Vite build pipeline and optimal performance. Other methods like the Vite plugin or Tailwind CLI are not used.

### 2.3. CSS Entry Point

Tailwind directives are included in our main CSS entry point (e.g., `src/index.css` or similar):

```css
/* src/index.css or similar */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Theme variables and custom base styles */
:root {
  --color-primary-500: oklch(0.65 0.15 250);
  /* Other custom properties */
}

/* Example custom base style */
body {
  @apply bg-background text-foreground;
}
```

## 3. Key Tailwind CSS v3.4 Features & Usage

### 3.1. JIT (Just-In-Time) Mode

Tailwind v3.4 uses JIT mode by default, providing:
- On-demand CSS generation.
- Support for arbitrary values (e.g., `w-[127px]`).
- Faster build times and smaller production bundles.

### 3.2. Dark Mode (`class` strategy)

Our implementation uses the `class` strategy, managed via `ThemeProvider`:
- Enables toggle-based theme switching.
- Supports system preference detection.
- Allows persistent user preferences (via localStorage).

Apply dark mode variants using the `dark:` prefix:
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <!-- Content -->
</div>
```

### 3.3. Using `@apply` for Custom Components

Use the `@apply` directive within `@layer components` to extract reusable utility patterns:

```css
/* Example: src/presentation/atoms/Button.css */
@tailwind components;

@layer components {
  .btn-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-md;
  }
}
```
```jsx
// Usage in Button.tsx
import './Button.css';
<button className="btn-primary">Action</button>
```

### 3.4. CSS Variables for Theming

Define custom theme values (colors, spacing, etc.) using CSS variables in the `:root` selector of your main CSS file. These can then be referenced in `tailwind.config.cjs`.

```css
/* src/index.css */
:root {
  --color-primary-500: oklch(0.65 0.15 250);
  --radius-neuro: 12px;
  /* ... other variables */
}
```
```javascript
// tailwind.config.cjs
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: 'var(--color-primary-500)'
        }
      },
      borderRadius: {
        neuro: 'var(--radius-neuro)'
      }
    }
  }
  // ...
}
```

## 4. Customization

### 4.1. Custom Color Palette

We utilize a custom palette including primary, neural, semantic, and luxury accent colors, defined using the OKLCH color space in `tailwind.config.cjs`.

### 4.2. Neuromorphic Design Elements

Custom components and utilities for neuromorphic UI elements (e.g., `.neural-card`, `rounded-neuro`, `shadow-neuro`) are defined in the theme configuration and applied via utility classes or `@apply`.

## 5. Tailwind Plugins

We leverage official Tailwind plugins:
- `@tailwindcss/forms`
- `@tailwindcss/typography`
- `@tailwindcss/aspect-ratio`

These are added in the `plugins` array of `tailwind.config.cjs`.

## 6. Best Practices & Workflow

### 6.1. Brain Visualization Components
- Use utility classes for layout and basic styling of containers.
- Apply complex or dynamic styles via component logic or inline styles where necessary.
- Ensure `dark:` variants are applied for theme consistency.

### 6.2. VS Code IntelliSense
Ensure the Tailwind CSS IntelliSense extension is installed and configured in VS Code settings for autocompletion and linting:

```json
// .vscode/settings.json
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

## 7. Troubleshooting

### 7.1. Styles/Theme Values Not Applied
1.  Verify `tailwind.config.cjs` and `postcss.config.cjs` are correct.
2.  Ensure the `content` paths in `tailwind.config.cjs` cover all files using Tailwind classes.
3.  Check that CSS variables are correctly defined and referenced.
4.  Confirm PostCSS is processing the main CSS entry point.
5.  Clear browser/build cache.

### 7.2. Module Errors
1.  Ensure all Tailwind-related packages (`tailwindcss`, `postcss`, `autoprefixer`, plugins) are installed.
2.  Verify `.cjs` files use `require()` and `module.exports`.

## 8. Performance Benefits

Tailwind CSS v3.4 improves performance through its optimized JIT engine, efficient tree-shaking, and smaller production bundles.

## 9. Conclusion

Using Tailwind CSS v3.4 with the PostCSS integration provides a maintainable, type-safe, and performance-optimized styling solution for the Novamind Digital Twin platform.