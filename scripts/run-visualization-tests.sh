#!/bin/bash
# Run visualization tests with WebGL mocking
# This script runs tests for 3D visualization components with WebGL mocks

# Create temporary setup file
echo "Creating temporary setup file..."
cat > temp-webgl-setup.js << 'EOF'
// WebGL Testing Setup
import { beforeAll, afterAll } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks } from './src/test/webgl/index.js';

beforeAll(() => {
  console.log('Setting up WebGL mocks for visualization tests...');
  setupWebGLMocks({ monitorMemory: true, debugMode: true });
  
  try {
    import('./src/test/webgl/examples/neural-controllers-mock.js')
      .then(({ applyNeuralControllerMocks }) => {
        if (typeof applyNeuralControllerMocks === 'function') {
          applyNeuralControllerMocks();
          console.log('Neural controller mocks applied');
        }
      })
      .catch(e => {
        console.log('Neural controller mocks not available:', e.message);
      });
  } catch (e) {
    console.log('Error importing neural mocks:', e);
  }
});

afterAll(() => {
  try {
    import('./src/test/webgl/examples/neural-controllers-mock.js')
      .then(({ cleanupNeuralControllerMocks }) => {
        if (typeof cleanupNeuralControllerMocks === 'function') {
          cleanupNeuralControllerMocks();
          console.log('Neural controller mocks cleaned up');
        }
      })
      .catch(() => {
        // Ignore errors
      });
  } catch (e) {
    // Ignore
  }
  
  const report = cleanupWebGLMocks();
  if (report && report.leakedObjectCount > 0) {
    console.warn(`Memory leak detected: ${report.leakedObjectCount} objects not properly disposed`);
    console.warn('Leaked objects by type:', report.leakedObjectTypes);
  }
});
EOF

# Default values
TEST_DIR="src"
TEST_PATTERN="**/*{Visual,Render,Brain,3D,Three}*.test.{ts,tsx}"
SPECIFIC_TEST=""

# Process command line options
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir=*)
      TEST_DIR="${1#*=}"
      shift
      ;;
    --pattern=*)
      TEST_PATTERN="${1#*=}"
      shift
      ;;
    *)
      # If not an option, treat as specific test file
      SPECIFIC_TEST="$1"
      shift
      ;;
  esac
done

# Find the test files matching the pattern if no specific test is provided
if [ -z "$SPECIFIC_TEST" ]; then
  echo "Finding tests in $TEST_DIR with pattern: $TEST_PATTERN"
  TEST_FILES=$(find "$TEST_DIR" -path "$TEST_PATTERN" | tr '\n' ' ')
  
  if [ -z "$TEST_FILES" ]; then
    echo "No test files found matching the pattern!"
    exit 1
  fi
  
  echo "Found test files:"
  echo "$TEST_FILES" | tr ' ' '\n' | head -5 | sed 's/^/- /'
else
  TEST_FILES="$SPECIFIC_TEST"
  echo "Running specific test: $TEST_FILES"
fi

# Run the tests with WebGL mocks
echo "Running visualization tests with WebGL mocks..."
NODE_OPTIONS="--max-old-space-size=4096 ${NODE_OPTIONS:-}" \
VITEST_TIMEOUT=30000 \
WEBGL_MEMORY_MONITOR=1 \
WEBGL_DEBUG_MODE=1 \
NEURAL_CONTROLLER_MOCKS=1 \
npx vitest run \
  --config vitest.config.unified.ts \
  --globals \
  ${TEST_FILES}

# Store exit code
EXIT_CODE=$?

# Clean up
echo "Cleaning up..."
rm -f temp-webgl-setup.js

# Report test results
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "\n✅ Visualization tests completed successfully"
else
  echo -e "\n❌ Visualization tests failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
