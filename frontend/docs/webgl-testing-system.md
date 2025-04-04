# WebGL/Three.js Testing System

## Architecture

The WebGL/Three.js testing system provides a comprehensive solution for testing Three.js visualization components in a Node.js/JSDOM environment without browser compatibility issues or test hanging.

### Core Architecture

The system follows a clear separation of concerns with three distinct levels:

1. **Low-level WebGL Context Mocks** (`mock-webgl.ts`)
   - Provides the foundation by mocking browser WebGL contexts
   - Handles HTML5 Canvas getContext() for 'webgl' and 'webgl2'
   - Mocks core animation frame APIs (requestAnimationFrame)
   - Exposes `CoreWebGLRenderer` for basic rendering functionality

2. **Three.js Object Mocks** (`three-mocks.ts`)
   - Builds on top of the WebGL context mocks
   - Provides complete mocks for all Three.js objects (Scene, Camera, Meshes, etc.)
   - Implements proper object hierarchy and parent-child relationships
   - Handles memory management through proper dispose() methods
   - Exposes `MockWebGLRenderer` specifically designed for Three.js

3. **Integration Layer** (`index.ts`)
   - Brings both layers together in a unified API
   - Provides convenience functions for test setup and teardown
   - Maintains clear naming to avoid confusion

### Source of Truth

The **clear source of truth** in this architecture is:

- `CoreWebGLRenderer` in `mock-webgl.ts` - For low-level WebGL rendering
- `MockWebGLRenderer` in `three-mocks.ts` - For Three.js specific rendering
- The integration in `index.ts` - For test usage

## Usage

### Basic Setup

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks, ThreeMocks } from '@test/webgl';

describe('YourThreeJsComponent', () => {
  beforeEach(() => {
    setupWebGLMocks();
  });

  afterEach(() => {
    cleanupWebGLMocks();
  });

  it('should render without errors', () => {
    const scene = new ThreeMocks.Scene();
    const camera = new ThreeMocks.PerspectiveCamera();
    const renderer = new ThreeMocks.WebGLRenderer();
    
    // Test your component...
    renderer.render(scene, camera);
  });
});
```

### Memory Management

The mock system is designed to prevent memory leaks during testing:

```typescript
// Always dispose Three.js objects when finished
mesh.dispose(); // Automatically disposes geometry and material
renderer.dispose(); // Cleans up WebGL context resources
```

## Best Practices

1. **Always use setupWebGLMocks/cleanupWebGLMocks** in beforeEach/afterEach hooks
2. **Always dispose resources** after tests to prevent memory leaks
3. **Use ThreeMocks namespace** for consistent access to all mock objects
4. **Test memory management** in your components to ensure proper cleanup

## Test Examples

See `frontend/src/test/webgl/examples/ThreeJsComponent.test.ts` for a complete example of testing a Three.js visualization component.

## Resolving Test Hangs

This system was specifically designed to prevent test hanging issues that commonly occur when testing Three.js components in JSDOM environments. The two main causes of test hangs are addressed:

1. **WebGL Context Creation** - Normally crashes in JSDOM, our mocks provide safe alternatives
2. **Animation Frame Loops** - Replaced with deterministic timing for testing
3. **Memory Leaks** - Proper disposal of all resources prevents memory accumulation

## Implementation Details

The system uses TypeScript for type safety and follows mock implementation patterns compatible with testing frameworks like Vitest and Jest, but without direct dependencies on them.

## Test Implementation Results

Testing with the new WebGL/Three.js mocking system has produced excellent results:

1. **All Tests Pass**: Both the core WebGL mocks and Three.js component tests now pass
2. **No More Hanging Tests**: Tests that previously hung due to WebGL and animation frame issues now run correctly
3. **Clean Memory Management**: The dispose() pattern ensures resources are properly released
4. **Type Safety**: TypeScript integration provides proper type checking and IDE support

The architecture with clear separation between `CoreWebGLRenderer` (for low-level WebGL) and `MockWebGLRenderer` (for Three.js integration) allows for a more maintainable and understandable testing system.

## Recommended Implementation Pattern

When implementing new Three.js visualization components for the Novamind Digital Twin system, we recommend:

1. **Always implement dispose()**: Every component should have a dispose method that cleans up all resources
2. **Avoid animation loops in components**: Use a controlled render pattern that can be called by parent components
3. **Test with provided mocks**: Use the WebGL/Three.js mocking system for all tests
4. **Verify memory cleanup**: Include specific tests that verify all resources are properly released

Following these patterns will ensure robust, testable, and memory-efficient components that will scale with the complexity of the brain visualization system.
