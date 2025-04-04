#!/bin/bash
# Run tests with unified configuration
# This script runs tests using our consolidated test setup

# Go to project directory
cd "$(dirname "$0")/.."
FRONTEND_DIR="$(pwd)"

echo "Running tests with unified configuration from directory: $FRONTEND_DIR"

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test pattern - directly pass test file path
if [ -z "$1" ]; then
  # Default pattern if no argument is provided
  TEST_ARGS="src/**/*.unified.test.{ts,tsx}"
else
  # Use the provided path directly
  TEST_ARGS="$1"
fi

echo "Using test pattern: $TEST_ARGS"

# Run the tests with the unified configuration
echo -e "${YELLOW}Starting test runner with unified configuration...${NC}"
NODE_OPTIONS='--max-old-space-size=8192' npx vitest run $TEST_ARGS --config vitest.config.unified.ts

# Store the exit code
EXIT_CODE=$?

# Display result
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Tests completed successfully${NC}"
else
  echo -e "${RED}✗ Tests failed with exit code $EXIT_CODE${NC}"
fi

exit $EXIT_CODE