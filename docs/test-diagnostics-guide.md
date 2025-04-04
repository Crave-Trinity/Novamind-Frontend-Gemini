# Novamind Test Diagnostics Guide

This guide provides detailed instructions for diagnosing and fixing test issues with the Novamind frontend test suite.

## Testing Environment Setup

When running tests in the Novamind frontend, ensure your environment is properly configured:

1. Use the correct Node.js version (check .nvmrc)
2. Ensure all dependencies are installed (`npm install`)
3. Run tests with appropriate timeout settings to prevent hang issues

Common test commands:
```bash
# Run standard tests
npm test

# Run with extended timeout for complex UI components
npm run test:timeout -- --testTimeout=30000

# Run specific tests
npm test -- -t "ThemeContext"
```

## Theme System Testing Issues

### Theme Toggle Not Working

If your theme tests fail with issues related to theme toggling:

**Solution:**
1. Make sure the theme elements have the correct IDs in your test HTML:
   - `#theme-indicator` - Shows whether dark mode is enabled
   - `#active-theme` - Shows the current theme name
   - `#dark-mode-status` - Explicit dark mode status element

2. Verify the ThemeProvider correctly implements:
   - Theme persistence via localStorage
   - System theme preference detection via `window.matchMedia`
   - Proper dark mode class application on the document root

3. Check that the test is waiting for UI updates after theme changes:
   ```typescript
   // Always add a small delay after theme changes
   await new Promise(resolve => setTimeout(resolve, 100));
   ```

### Simplified Theme Support

The theme system has been streamlined to focus on core themes:
- `light`: Default light theme
- `dark`: Dark interface theme
- `system`: Follows system preference
- `clinical`: Clinical interface
- `retro`: Retro-styled interface

If your tests are looking for removed themes ('sleek-dark', 'wes'), update them to use the current theme names.

## React Three Fiber Testing

Three.js components can be challenging to test. Some best practices:

1. **Memory Management Issues**
   - Ensure `unmount()` is called in test cleanup
   - Verify all geometries/materials/textures are properly disposed
   - Watch for memory leaks with multiple test runs

2. **Renderer Creation**
   - Create renderer in `beforeEach` and dispose in `afterEach`
   - Use mocks for WebGL contexts when running in JSDOM

3. **Animation Loop**
   - Tests with animation loops should use `act()` for renders
   - Mock `requestAnimationFrame` for deterministic testing

## Common Test Issues

### Path Alias Resolution

If tests fail with errors related to imports:

```
Cannot find module '@domain/models' from 'src/components/MyComponent.tsx'
```

**Solution:**
1. Verify aliases in `tsconfig.json` match those in `vite.config.ts` and `vitest.config.ts`
2. Ensure the path-alias-fix.ts file is included in the setup files

### Test Timeouts

Tests involving complex UI components, especially those with animations or async operations, may timeout:

**Solution:**
1. Increase the test timeout in the specific test:
   ```typescript
   describe('Complex component', () => {
     // Set longer timeout for this test suite
     vi.setConfig({ testTimeout: 30000 });
     
     // Your tests...
   });
   ```

2. Or use the `timeout` parameter on individual tests:
   ```typescript
   it('should render complex visualization', async () => {
     // Test logic here
   }, 30000);
   ```

## Continuous Integration

For CI environments, configure appropriate test settings:

```yaml
# Example for GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

## Test Debugging

When tests are failing and you need more information:

1. **Enable verbose logging**:
   ```bash
   npm test -- --verbose
   ```

2. **Debug specific test**:
   ```bash
   node --inspect-brk node_modules/.bin/vitest run -t "MyComponent"
   ```

3. **Use console.log effectively**:
   - Log component props and state
   - Log rendered HTML with `screen.debug()`
   - Check element visibility with `.toBeVisible()` assertions
