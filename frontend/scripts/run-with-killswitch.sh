#!/bin/bash
# Run tests with a killswitch - this script will forcefully terminate
# the test process after a specified timeout to prevent infinite hanging

# Default timeout in seconds (3 minutes)
TIMEOUT=180

# Parse arguments
PATTERN=""
CUSTOM_TIMEOUT=""

for arg in "$@"; do
  if [[ $arg == --timeout=* ]]; then
    CUSTOM_TIMEOUT="${arg#*=}"
  else
    PATTERN="$arg"
  fi
done

# Use custom timeout if provided
if [[ -n "$CUSTOM_TIMEOUT" ]]; then
  TIMEOUT=$CUSTOM_TIMEOUT
fi

cd "$(dirname "$0")/.." || exit 1
echo "Running in directory: $(pwd)"
echo "Using timeout of $TIMEOUT seconds"

# If no pattern is provided, use a default pattern
if [[ -z "$PATTERN" ]]; then
  PATTERN="src/**/*.{test,spec}.{ts,tsx}"
  echo "No test pattern provided. Using default: $PATTERN"
fi

echo "Starting tests with pattern: $PATTERN"
echo "Tests will be forcefully terminated after $TIMEOUT seconds if they haven't completed"

# Start the timer
start_time=$(date +%s)

# Run the tests with timeout config
test_command="NODE_OPTIONS='--max-old-space-size=8192' npx vitest run --config vitest.config.timeout.ts \"$PATTERN\""
echo "Executing: $test_command"

# Run test command in background
eval "$test_command" &
test_pid=$!

# Set up the killswitch
(
  sleep $TIMEOUT
  
  # Check if process still running
  if ps -p $test_pid > /dev/null; then
    echo ""
    echo "⚠️ TIMEOUT REACHED: Tests have been running for $TIMEOUT seconds"
    echo "⚠️ Forcefully terminating test process to prevent hanging"
    echo ""
    
    # Force kill the process and its children
    pkill -P $test_pid
    kill -9 $test_pid 2>/dev/null
    
    # Exit with error code
    exit 124
  fi
) &
killer_pid=$!

# Wait for test process to complete
wait $test_pid
exit_code=$?

# Kill the killer process since it's no longer needed
pkill -P $killer_pid 2>/dev/null
kill $killer_pid 2>/dev/null

# Calculate duration
end_time=$(date +%s)
duration=$((end_time - start_time))
minutes=$((duration / 60))
seconds=$((duration % 60))

echo ""
echo "Tests completed in ${minutes}m ${seconds}s with exit code: $exit_code"

if [ $exit_code -eq 0 ]; then
  echo "✅ Tests passed successfully!"
else
  echo "❌ Tests failed or were terminated due to timeout"
fi

exit $exit_code