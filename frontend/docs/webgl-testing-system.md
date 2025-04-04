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

```json
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
