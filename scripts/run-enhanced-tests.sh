#!/bin/bash

# Enhanced Test Runner for Novamind Digital Twin
# 
# This script runs tests with the enhanced Tailwind CSS setup and proper timeouts.
# It's designed to prevent hanging tests and ensure proper CSS class testing.
#
# Usage:
#   ./scripts/run-enhanced-tests.sh [testPattern]

# Configuration
TIMEOUT=60000  # 60 seconds
CONFIG_FILE="vitest.config.unified.ts"
SETUP_FILE="src/test/setup.ts"

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Print banner
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}║                                                            ║${RESET}"
echo -e "${BOLD}${BLUE}║  ${GREEN}Novamind Digital Twin${BLUE} - ${YELLOW}Enhanced Test Runner${BLUE}            ║${RESET}"
echo -e "${BOLD}${BLUE}║                                                            ║${RESET}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Check if Tailwind mock is imported in setup file
if ! grep -q "tailwind-mock" "$SETUP_FILE"; then
  echo -e "${YELLOW}⚠️  Warning: Tailwind mock not imported in setup file${RESET}"
  echo -e "${YELLOW}   Consider adding: import './tailwind-mock'; to $SETUP_FILE${RESET}"
  echo ""
fi

# Get test pattern from command line args
TEST_PATTERN=$1

# Build the command
CMD="npx ts-node --esm scripts/run-with-timeout.ts"
if [ -n "$TEST_PATTERN" ]; then
  CMD="$CMD $TEST_PATTERN"
fi

# Print info
echo -e "${BLUE}ℹ️  Running tests with:${RESET}"
echo -e "${BLUE}   - Tailwind CSS mocking${RESET}"
echo -e "${BLUE}   - ${TIMEOUT}ms timeout${RESET}"
echo -e "${BLUE}   - Unified test configuration${RESET}"
if [ -n "$TEST_PATTERN" ]; then
  echo -e "${BLUE}   - Test pattern: ${YELLOW}$TEST_PATTERN${RESET}"
fi
echo ""

# Run the tests
echo -e "${GREEN}🧪 Starting tests...${RESET}"
echo ""

# Execute the command
eval $CMD

# Get exit code
EXIT_CODE=$?

# Print summary
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Tests completed successfully!${RESET}"
else
  echo -e "${RED}❌ Tests failed with exit code: $EXIT_CODE${RESET}"
fi

# Exit with the same code
exit $EXIT_CODE