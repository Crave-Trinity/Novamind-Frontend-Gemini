#!/bin/bash
# Platform-independent test runner with a killswitch for hanging tests
# Usage: ./force-timeout.sh [seconds]

# Default timeout (2 minutes)
TIMEOUT=${1:-120}

cd "$(dirname "$0")/.." || exit 1
echo "Running in directory: $(pwd)"
echo "Using timeout of $TIMEOUT seconds"
echo "Tests will be forcefully terminated after $TIMEOUT seconds if not completed"

# Start the tests in the background
npm run test &
test_pid=$!

# Set up the kill timer in the background
(
  # Wait for the timeout
  sleep $TIMEOUT
  
  # Check if the test process is still running
  if ps -p $test_pid > /dev/null; then
    echo ""
    echo "⚠️ TIMEOUT REACHED: Tests have been running for $TIMEOUT seconds"
    echo "⚠️ Forcefully terminating test process to prevent hanging"
    
    # Kill all child processes first, then the main process
    pkill -P $test_pid 2>/dev/null
    kill -9 $test_pid 2>/dev/null
    
    # Exit with timeout code
    exit 124
  fi
) &
killer_pid=$!

# Wait for the test process to complete
wait $test_pid
exit_code=$?

# Kill the killer process since it's no longer needed
kill $killer_pid 2>/dev/null

# Check the result
if [ $exit_code -eq 0 ]; then
  echo ""
  echo "✅ Tests completed successfully within the $TIMEOUT second timeout"
elif [ $exit_code -eq 124 ]; then
  echo ""
  echo "⚠️ Tests terminated due to timeout after $TIMEOUT seconds"
  echo "⚠️ Consider using one of these approaches to fix hanging tests:"
  echo "  1. Run specific test files individually"
  echo "  2. Use ./scripts/run-targeted-tests.sh which runs tests in compatible batches"
  echo "  3. Convert animation-heavy tests to minimal versions with ./scripts/fix-all-animation-tests.sh"
  exit 124
else
  echo ""
  echo "❌ Tests failed with exit code: $exit_code"
  exit $exit_code
fi