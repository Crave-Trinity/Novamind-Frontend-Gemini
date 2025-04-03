#!/bin/bash
# Simple test runner with timeout mechanism using the timeout command
# Usage: ./timeout-test.sh [timeout_seconds]

# Default timeout (2 minutes)
TIMEOUT=${1:-120}

cd "$(dirname "$0")/.." || exit 1
echo "Running in directory: $(pwd)"
echo "Test will be terminated after $TIMEOUT seconds if not completed"

# Run the tests with timeout
timeout $TIMEOUT npm run test

# Capture exit code
result=$?

# Check if timeout occurred
if [ $result -eq 124 ]; then
  echo ""
  echo "⚠️ TIMEOUT REACHED: Tests terminated after $TIMEOUT seconds"
  echo "⚠️ Consider using one of these approaches to fix hanging tests:"
  echo "  1. Run specific test files individually"
  echo "  2. Use ./scripts/run-targeted-tests.sh which runs tests in compatible batches"
  echo "  3. Convert animation-heavy tests to minimal versions with ./scripts/fix-all-animation-tests.sh"
  exit 124
elif [ $result -eq 0 ]; then
  echo ""
  echo "✅ Tests completed successfully within $TIMEOUT seconds"
  exit 0
else
  echo ""
  echo "❌ Tests failed with exit code: $result"
  exit $result
fi