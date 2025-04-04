#!/bin/bash
# WebGL Test Runner for Novamind Brain Visualization Tests
# This script fixes and runs tests with WebGL/Three.js mocking to prevent test hanging

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Default parameters
SPECIFIC_TESTS=""
USE_NEURAL_MOCKS=false
DETAIL_LEVEL="normal" # normal, verbose, silent
MEM_SIZE="4096"       # Memory allocation in MB

# Process command-line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --neural)
      USE_NEURAL_MOCKS=true
      shift
      ;;
    --verbose)
      DETAIL_LEVEL="verbose"
      shift
      ;;
    --memory=*)
      MEM_SIZE="${1#*=}"
      shift
      ;;
    --file=*)
      # Specific test file
      SPECIFIC_TESTS="${1#*=}"
      shift
      ;;
    --pattern=*)
      # Pattern for tests
      PATTERN="${1#*=}"
      # Find files matching the pattern
      SPECIFIC_TESTS=$(find src -path "${PATTERN}" | tr '\n' ' ')
      shift
      ;;
    --dir=*)
      # Directory for tests
      DIR="${1#*=}"
      # Find all visualization-related tests in the directory
      SPECIFIC_TESTS=$(find "${DIR}" \( -name "*Brain*.test.tsx" -o -name "*Visual*.test.tsx" -o -name "*Render*.test.tsx" -o -name "*3D*.test.tsx" -o -name "*Three*.test.tsx" -o -name "*Neural*.test.tsx" \) | tr '\n' ' ')
      shift
      ;;
    *)
      # Unknown option or specific test file
      if [[ -f "$1" ]]; then
        SPECIFIC_TESTS="$SPECIFIC_TESTS $1"
      else
        echo -e "${RED}Unknown option: $1${RESET}"
        echo "Usage: $0 [--neural] [--verbose] [--memory=SIZE] [--file=FILE] [--pattern=PATTERN] [--dir=DIR]"
        exit 1
      fi
      shift
      ;;
  esac
done

# Print banner
echo -e "${BOLD}${BLUE}🧠 Novamind WebGL Testing System${RESET}"
echo -e "${BOLD}Running visualization tests with WebGL mocking${RESET}"

# Set environment variables for the test
export NODE_OPTIONS="--max-old-space-size=${MEM_SIZE}"
export VITEST_TIMEOUT=60000 # 60 seconds timeout
export WEBGL_MEMORY_MONITOR=true
export WEBGL_DEBUG=true
export NEURAL_MOCKS=$USE_NEURAL_MOCKS

# Construct Vitest command
VITEST_CMD="npx vitest run --config vitest.webgl.config.ts"

# Add options based on detail level
case "$DETAIL_LEVEL" in
  "verbose")
    VITEST_CMD="$VITEST_CMD --reporter verbose"
    ;;
  "silent")
    VITEST_CMD="$VITEST_CMD --silent"
    ;;
esac

# Add specific tests if provided
if [[ -n "$SPECIFIC_TESTS" ]]; then
  # Print the test files being run
  echo -e "${YELLOW}Running tests:${RESET}"
  for TEST in $SPECIFIC_TESTS; do
    echo "  - $TEST"
  done
  
  # Add to command
  VITEST_CMD="$VITEST_CMD $SPECIFIC_TESTS"
else
  # If no specific tests, run brain visualization tests
  echo -e "${YELLOW}Running all brain visualization tests${RESET}"
  
  # Find all visualization-related tests
  TESTS=$(find src \( -name "*Brain*.test.tsx" -o -name "*Visual*.test.tsx" -o -name "*Render*.test.tsx" -o -name "*3D*.test.tsx" -o -name "*Three*.test.tsx" -o -name "*Neural*.test.tsx" \) | tr '\n' ' ')
  VITEST_CMD="$VITEST_CMD $TESTS"
fi

# Run the tests
echo -e "${BOLD}Running command: $VITEST_CMD${RESET}"
$VITEST_CMD

# Store exit code
EXIT_CODE=$?

# Report test results
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}✅ Visualization tests completed successfully${RESET}"
else
  echo -e "\n${RED}❌ Visualization tests failed with exit code $EXIT_CODE${RESET}"
fi

exit $EXIT_CODE
