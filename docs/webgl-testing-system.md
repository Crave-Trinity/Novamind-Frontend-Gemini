# WebGL Testing System for Novamind

## Overview

The WebGL Testing System provides a comprehensive solution for testing Three.js and WebGL-based visualization components within the Novamind platform. This system addresses several critical challenges:

1. **Preventing Test Hanging**: Tests that rely on WebGL often hang in JSDOM test environments
2. **Memory Monitoring**: Track memory usage to detect leaks in visualization components
3. **Consistent Mocking**: Ensure reliable test behavior with comprehensive Three.js mocks
4. **Neural Controller Integration**: Special support for testing the neural visualization components

## Core Components

The WebGL testing system consists of several key components:

### 1. Core WebGL Mocking (`src/test/webgl/`)

- **index.ts**: Main entry point with setup/cleanup functions
- **memory-monitor.ts**: System for tracking memory usage and detecting leaks
- **mock-webgl.ts**: Low-level WebGL context mocking
- **three-mocks.ts**: Comprehensive Three.js object mocks
- **mock-types.ts**: TypeScript definitions for mocks
- **mock-utils.ts**: Utility functions for mocking

### 2. Neural Controller Mocking (`src/test/webgl/examples/`)

- **neural-controllers-mock.ts**: Specialized mocks for the neural visualization controllers
  - Provides mocks for: NeuroSyncOrchestrator, NeuralActivityController, etc.
  - Simulates brain models, neural connections, and biometric data

### 3. Test Runner Scripts

- **scripts/run-all-tests-with-webgl.ts**: Run all tests with WebGL mocking enabled
- **scripts/run-3d-visualization-tests.ts**: Specifically target 3D visualization tests

## Using the WebGL Testing System

### Running Tests with WebGL Mocks

Add the following commands to your package.json:

"scripts": {
  "test:webgl": "npx ts-node --esm scripts/run-all-tests-with-webgl.ts",
  "test:3d": "npx ts-node --esm scripts/run-3d-visualization-tests.ts",
  "test:visualization": "npx ts-node --esm scripts/run-3d-visualization-tests.ts --dir=src/presentation --pattern=\"**/*{Visual,Render,Brain,3D,Three}*.test.tsx\""
}

```

Then run tests using:

```bash
npm run test:webgl      # Run all tests with WebGL mocking
npm run test:3d         # Run only 3D visualization tests
npm run test:visualization  # Run specific visualization tests
```

### Writing Tests for WebGL Components

When writing tests for components that use Three.js/WebGL, follow these best practices:

1. **Proper Cleanup**: Ensure all Three.js resources are properly disposed
2. **Use Memory Monitoring**: Enable memory monitoring to detect leaks
3. **Mock Neural Controllers**: Use the neural controller mocks for coordinator tests

Example test with WebGL mocking:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks } from '@test/webgl';
import { render, screen } from '@testing-library/react';
import BrainVisualization from '@presentation/components/BrainVisualization';

describe('BrainVisualization', () => {
  beforeAll(() => {
    setupWebGLMocks({ monitorMemory: true });
  });

  afterAll(() => {
    cleanupWebGLMocks();
  });

  it('renders the brain model', () => {
    render(<BrainVisualization />);
    expect(screen.getByTestId('brain-container')).toBeInTheDocument();
  });
});
```

### Testing Neural Visualization Components

Neural visualization components often depend on multiple controllers. Use the specialized neural controller mocks:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks } from '@test/webgl';
import { applyNeuralControllerMocks, cleanupNeuralControllerMocks } from '@test/webgl/examples/neural-controllers-mock';
import { render, screen } from '@testing-library/react';
import NeuralVisualizationCoordinator from '@application/controllers/coordinators/NeuralVisualizationCoordinator';

describe('NeuralVisualizationCoordinator', () => {
  beforeAll(() => {
    setupWebGLMocks({ monitorMemory: true });
    applyNeuralControllerMocks();
  });

  afterAll(() => {
    cleanupNeuralControllerMocks();
    cleanupWebGLMocks();
  });

  it('renders with neural precision', () => {
    render(<NeuralVisualizationCoordinator patientId="test-123">
      <div>Test Content</div>
    </NeuralVisualizationCoordinator>);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

## Technical Implementation Details

### WebGL Context Mocking

The system mocks the WebGL context by overriding `HTMLCanvasElement.prototype.getContext` to return a mock implementation instead of attempting to create a real WebGL context (which is not available in JSDOM).

### Memory Monitoring

Memory monitoring tracks objects created during tests and ensures they are properly disposed. This helps identify memory leaks that could impact performance in the production application.

Key features:

- Track objects by type
- Monitor disposal calls
- Generate memory snapshots
- Provide detailed reports of leaked objects

### Three.js Mock Objects

The system provides mock implementations for common Three.js objects:

- **Scene**: Mock scene with add/remove functions
- **Camera**: Mock perspective camera
- **Renderer**: Mock WebGLRenderer
- **Geometries**: BoxGeometry, SphereGeometry, BufferGeometry
- **Materials**: MeshStandardMaterial, MeshBasicMaterial
- **Objects**: Object3D, Mesh, Group
- **Math**: Vector3, Color
- **Animation**: Clock
- **React Three Fiber**: useThree, useFrame, Canvas

### Neural Controller Mocks

Specialized mocks for the neural visualization system:

- **NeuroSyncOrchestrator**: Central orchestration
- **NeuralActivityController**: Neural activity simulation
- **ClinicalPredictionController**: Clinical prediction
- **BiometricStreamController**: Biometric data
- **TemporalDynamicsController**: Temporal patterns

## Troubleshooting

### Tests Still Hanging

If tests are still hanging despite WebGL mocks:

1. Ensure the test is properly cleaning up resources
2. Check for async operations that aren't being awaited
3. Look for animation loops that aren't being canceled
4. Try running with the `--threads false` option

### Memory Leaks

If memory leaks are detected:

1. Check for Three.js objects not being disposed
2. Ensure all event listeners are removed
3. Look for unmounted components still updating state
4. Verify cleanup in useEffect hooks

### Framework Integration Issues

For problems with specific frameworks:

1. **React**: Ensure all Three.js setup/cleanup is in useEffect hooks
2. **React Three Fiber**: Use proper cleanup in useFrame callbacks
3. **drei**: Check for resources created by drei components

## Future Enhancements

Planned enhancements to the WebGL testing system:

1. **Shader Testing**: Direct testing of GLSL shaders
2. **Performance Metrics**: Automated performance testing
3. **Visual Regression**: Screenshot comparison for visual tests
4. **Extended Event Support**: More comprehensive event simulation
5. **Headless Rendering**: WebGL rendering in headless environments
