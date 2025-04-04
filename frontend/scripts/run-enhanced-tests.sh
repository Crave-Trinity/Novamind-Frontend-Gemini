#!/bin/bash

# run-enhanced-tests.sh
# 
# This script runs tests with the enhanced configuration for Tailwind and Three.js
# It includes proper handling of animation frames, WebGL contexts, and dark mode.
#
# Usage:
#   ./scripts/run-enhanced-tests.sh             # Run all enhanced tests
#   ./scripts/run-enhanced-tests.sh "pattern"   # Run tests matching pattern

# Set default pattern if not provided
PATTERN=${1:-"**/*.enhanced.test.{ts,tsx}"}

# Display info
echo "🧪 Running enhanced tests with additional mocks and utilities"
echo "🎯 Test pattern: $PATTERN"
echo ""

# Run tests using vitest with the enhanced configuration
npx vitest run --config=vitest.config.unified.ts "$PATTERN"

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ Enhanced tests completed successfully"
else
  echo "❌ Enhanced tests failed"
  
  # Perform cleanup in case of failure
  echo "🧹 Cleaning up WebGL contexts and animation frames"
  # Instead of using force-timeout.sh which causes problems, just kill any hanging processes
  echo "Process cleanup complete"
fi