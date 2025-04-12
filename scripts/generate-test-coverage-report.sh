#!/bin/bash

# =============================================================================
# Test Coverage Report Generator
# =============================================================================
#
# This script runs all tests with coverage enabled and generates a comprehensive
# report to help achieve 80% test coverage for production readiness.
#
# Usage: 
#   ./scripts/generate-test-coverage-report.sh [options]
#
# Options:
#   --skip-tests: Skip running tests and only generate report from existing coverage data
#   --focus-areas: Only show high-priority areas needing tests
#   --ci: Format output for CI environments
#   --html: Generate HTML report in addition to markdown
#
# =============================================================================

# Set script to exit on error
set -e

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Process args
SKIP_TESTS=false
FOCUS_AREAS=false
CI_MODE=false
HTML_REPORT=false

for arg in "$@"; do
  case $arg in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --focus-areas)
      FOCUS_AREAS=true
      shift
      ;;
    --ci)
      CI_MODE=true
      shift
      ;;
    --html)
      HTML_REPORT=true
      shift
      ;;
  esac
done

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}           Novamind Test Coverage Generator               ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

# Create log directory if it doesn't exist
mkdir -p test-reports

# Run tests with coverage if not skipped
if [ "$SKIP_TESTS" = false ]; then
  echo -e "${YELLOW}Running tests with coverage...${NC}"
  
  # Using vitest for running tests with coverage
  npx vitest run --coverage > test-reports/test-output.log 2>&1 || {
    echo -e "${RED}Some tests failed, but continuing with coverage analysis...${NC}"
    echo "See test-reports/test-output.log for details"
  }
else
  echo -e "${YELLOW}Skipping tests, using existing coverage data...${NC}"
fi

# Check if coverage file exists
if [ ! -f "coverage/coverage-final.json" ]; then
  echo -e "${RED}Error: Coverage file not found. Make sure tests were run with --coverage flag.${NC}"
  exit 1
fi

# Generate coverage report
echo -e "${YELLOW}Analyzing test coverage...${NC}"

# Run the coverage analyzer
if [ "$FOCUS_AREAS" = true ]; then
  node scripts/analyze-test-coverage.js --focus-areas > test-reports/coverage-analysis.log
else
  node scripts/analyze-test-coverage.js > test-reports/coverage-analysis.log
fi

if [ "$HTML_REPORT" = true ]; then
  echo -e "${YELLOW}Generating HTML report...${NC}"
  npx vitest-coverage-report-html
fi

# Check if the report was generated
if [ -f "coverage-report.md" ]; then
  echo -e "${GREEN}Coverage report generated successfully!${NC}"
  
  # Move the report to test-reports directory
  mv coverage-report.md test-reports/coverage-report.md
  
  # Extract the overall coverage percentage
  COVERAGE_PCT=$(grep -o '[0-9]\+\.[0-9]\+%' test-reports/coverage-report.md | head -1)
  
  # Extract the number of recommendations
  REC_COUNT=$(grep -c '- ' test-reports/coverage-report.md)
  
  echo -e "${BLUE}Overall coverage: $COVERAGE_PCT${NC}"
  echo -e "${BLUE}Recommendations: $REC_COUNT${NC}"
  echo -e "${BLUE}Report saved to: test-reports/coverage-report.md${NC}"
  
  # Open the report if not in CI mode
  if [ "$CI_MODE" = false ]; then
    # Try different commands to open the file based on the OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
      open test-reports/coverage-report.md
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      if [ -n "$(command -v xdg-open)" ]; then
        xdg-open test-reports/coverage-report.md
      fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
      start test-reports/coverage-report.md
    fi
  fi
  
  # Check coverage target
  COVERAGE_NUM=${COVERAGE_PCT%\%}
  if (( $(echo "$COVERAGE_NUM < 80" | bc -l) )); then
    echo -e "${YELLOW}Warning: Coverage is below the 80% target for production readiness.${NC}"
    echo -e "${YELLOW}Review the recommendations in the report to increase coverage.${NC}"
    
    if [ "$CI_MODE" = true ]; then
      exit 1
    fi
  else
    echo -e "${GREEN}Success! Coverage meets or exceeds the 80% target.${NC}"
  fi
else
  echo -e "${RED}Error: Failed to generate coverage report.${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}                      Report Complete                      ${NC}"
echo -e "${BLUE}=========================================================${NC}"