#!/bin/bash
# Direct WebGL Test Runner
# Runs tests with WebGL mocking directly without configuration issues

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

if [ -z "$1" ]; then
  echo -e "${RED}Error: No test file specified${RESET}"
  echo "Usage: $0 <test-file-path>"
  exit 1
fi

TEST_FILE="$1"

# Check if file exists
if [ ! -f "$TEST_FILE" ]; then
  echo -e "${RED}Error: Test file not found: $TEST_FILE${RESET}"
  exit 1
fi

echo -e "${BOLD}${BLUE}🧠 Novamind WebGL Test Runner${RESET}"
echo -e "${YELLOW}Running: $TEST_FILE${RESET}"

# Set NODE_OPTIONS for memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Create a temporary setup file that will be executed before the test
SETUP_FILE="temp-webgl-setup.js"

cat > $SETUP_FILE << 'EOF'
// Temporary WebGL setup for direct test runs
import { setupWebGLMocks, cleanupWebGLMocks } from './src/test/webgl/index.js';

// Set up mocks
console.log('Setting up WebGL mocks');
setupWebGLMocks({ 
  monitorMemory: true,
  debugMode: true
});

// Register cleanup on exit
process.on('beforeExit', () => {
  console.log('Cleaning up WebGL mocks');
  const report = cleanupWebGLMocks();
  if (report && report.leakedObjectCount > 0) {
    console.warn(`Memory leak detected: ${report.leakedObjectCount} objects not properly disposed`);
  }
});
EOF

# Run the test directly with Vitest, loading our setup file first
echo -e "${BOLD}Running test with WebGL mocks...${RESET}"
npx vitest run --config vitest.config.unified.ts --environment jsdom --no-threads --setup $SETUP_FILE $TEST_FILE

# Capture exit code
EXIT_CODE=$?

# Clean up temp file
rm -f $SETUP_FILE

# Report results
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}✅ Test passed successfully${RESET}"
else
  echo -e "\n${RED}❌ Test failed with exit code $EXIT_CODE${RESET}"
fi

exit $EXIT_CODE
