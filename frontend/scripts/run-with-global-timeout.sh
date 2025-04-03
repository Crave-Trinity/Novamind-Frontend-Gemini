#!/bin/bash
# Run tests with a global OS-level timeout to prevent hanging
# This script forcefully terminates the test process after a timeout

# Set default timeout (3 minutes)
TIMEOUT=${1:-180}

# Current directory
cd "$(dirname "$0")/.." || exit 1
echo "Running in directory: $(pwd)"
echo "Using timeout of $TIMEOUT seconds"

echo "Starting tests with global timeout"
echo "Tests will be terminated after $TIMEOUT seconds if not completed"

# Create function to run with timeout
function run_with_timeout() {
  # Start the test command
  npm run test &
  test_pid=$!
  
  # Wait for timeout
  sleep $TIMEOUT &
  timer_pid=$!
  
  # Monitor process - whichever finishes first
  wait -n $test_pid $timer_pid
  
  # Check which process finished
  if ps -p $test_pid > /dev/null; then
    echo ""
    echo "⚠️ TIMEOUT REACHED: Tests have been running for $TIMEOUT seconds"
    echo "⚠️ Forcefully terminating test process to prevent hanging"
    echo ""
    
    # Force kill the test process and all child processes
    pkill -P $test_pid
    kill -9 $test_pid 2>/dev/null
    
    # Kill the timer since we've handled the timeout
    kill $timer_pid 2>/dev/null
    
    # Exit with timeout code
    return 124
  else
    # Tests completed normally, kill the timer
    kill $timer_pid 2>/dev/null
    wait $test_pid
    return $?
  fi
}

# Execute with timeout
run_with_timeout
exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
  echo "✅ Tests completed successfully within the $TIMEOUT second timeout"
elif [ $exit_code -eq 124 ]; then
  echo "⚠️ Tests terminated due to timeout after $TIMEOUT seconds"
else
  echo "❌ Tests failed with exit code: $exit_code"
fi

exit $exit_code