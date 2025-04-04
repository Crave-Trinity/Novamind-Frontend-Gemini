#!/bin/bash
# Apply WebGL Mocks to Failing Visualization Tests
#
# This script identifies failing visualization tests and applies
# the WebGL mocking system to them automatically.

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Configuration
TEST_DIR="src"
DRY_RUN=false
FIX_ALL=false

# Parse command line arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --fix-all)
      FIX_ALL=true
      shift
      ;;
    --dir=*)
      TEST_DIR="${arg#*=}"
      shift
      ;;
    *)
      # Unknown option
      echo "Unknown option: $arg"
      echo "Usage: $0 [--dry-run] [--fix-all] [--dir=<directory>]"
      exit 1
      ;;
  esac
done

echo -e "${BOLD}${BLUE}🧠 Novamind WebGL Test Mocking System${RESET}"
echo -e "Looking for visualization tests in ${BOLD}${TEST_DIR}${RESET}..."
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}(Dry run mode - no changes will be made)${RESET}"
fi
if [ "$FIX_ALL" = true ]; then
  echo -e "${YELLOW}(Will apply fixes to all matching tests)${RESET}"
else
  echo -e "${YELLOW}(Will only fix failing tests)${RESET}"
fi

# Find all test files matching the visualization patterns
echo "Finding visualization tests..."
VISUALIZATION_TESTS=$(find "$TEST_DIR" -path "**/*Brain*.test.{ts,tsx}" -o -path "**/*Visual*.test.{ts,tsx}" -o -path "**/*Render*.test.{ts,tsx}" -o -path "**/*3D*.test.{ts,tsx}" -o -path "**/*Three*.test.{ts,tsx}" -o -path "**/*Neuron*.test.{ts,tsx}" -o -path "**/*Neural*.test.{ts,tsx}" 2>/dev/null)

# Count tests
TEST_COUNT=$(echo "$VISUALIZATION_TESTS" | wc -l)
echo -e "Found ${BOLD}$TEST_COUNT${RESET} visualization tests"

# Initialize counters
FIXED_TESTS=0
ALREADY_MOCKED_TESTS=0
STILL_FAILING_TESTS=0
SKIPPED_TESTS=0

# Process each test file
for TEST_FILE in $VISUALIZATION_TESTS; do
  # Skip empty lines
  if [ -z "$TEST_FILE" ]; then
    continue
  fi

  echo -e "\n${BOLD}Checking ${TEST_FILE}...${RESET}"
  
  # Check if the test contains WebGL-related code
  if ! grep -q -E "three|@react-three/fiber|@react-three/drei|WebGLRenderer|Scene|Camera|Mesh|Geometry|Material" "$TEST_FILE"; then
    echo -e "${YELLOW}Skipping - no WebGL code detected${RESET}"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    continue
  fi
  
  # Check if the test already has WebGL mocks
  if grep -q -E "@test/webgl|setupWebGLForTest" "$TEST_FILE"; then
    echo -e "${GREEN}✅ Already has WebGL mocks${RESET}"
    ALREADY_MOCKED_TESTS=$((ALREADY_MOCKED_TESTS + 1))
    continue
  fi
  
  # Check if the test is failing (unless fix-all is specified)
  if [ "$FIX_ALL" = false ]; then
    echo "Running test to check if it's failing..."
    if npx vitest run "$TEST_FILE" --no-threads --timeout=5000 &>/dev/null; then
      echo -e "${GREEN}✅ Test is already passing - skipping${RESET}"
      SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
      continue
    else
      echo -e "${RED}❌ Test is failing - will apply WebGL mocks${RESET}"
    fi
  fi
  
  echo -e "${BLUE}📝 Applying WebGL mocks...${RESET}"
  
  # If this is a dry run, just report what would be done
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Would update ${TEST_FILE} (dry run)${RESET}"
    FIXED_TESTS=$((FIXED_TESTS + 1))
    continue
  fi
  
  # Determine the import line number (after the last import)
  IMPORT_LINE=$(grep -n "import " "$TEST_FILE" | tail -1 | cut -d: -f1)
  
  # Create a temporary file for modifications
  TMP_FILE=$(mktemp)
  
  # Add the WebGL mock import after the last import
  head -n "$IMPORT_LINE" "$TEST_FILE" > "$TMP_FILE"
  echo "import { setupWebGLForTest, cleanupWebGLAfterTest } from '@test/webgl/setup-test';" >> "$TMP_FILE"
  tail -n "+$((IMPORT_LINE + 1))" "$TEST_FILE" >> "$TMP_FILE"
  
  # Find all describe blocks and add beforeAll/afterAll hooks
  DESCRIBE_LINES=$(grep -n "describe(" "$TMP_FILE" | cut -d: -f1)
  
  # For each describe line, find the opening brace and add hooks
  for LINE in $DESCRIBE_LINES; do
    # Find the line with the opening brace
    BRACE_LINE=$LINE
    while [ "$BRACE_LINE" -lt "$(wc -l < "$TMP_FILE")" ]; do
      if grep -q "{" <<< "$(sed -n "${BRACE_LINE}p" "$TMP_FILE")"; then
        break
      fi
      BRACE_LINE=$((BRACE_LINE + 1))
    done
    
    # Check if this describe block already has hooks
    HAS_HOOKS=false
    NEXT_10_LINES=$(tail -n "+$BRACE_LINE" "$TMP_FILE" | head -n 10)
    if echo "$NEXT_10_LINES" | grep -q "beforeAll\|afterAll"; then
      HAS_HOOKS=true
    fi
    
    # If no hooks found, add them
    if [ "$HAS_HOOKS" = false ]; then
      # Create a temporary file with hooks inserted
      TMP_FILE2=$(mktemp)
      head -n "$BRACE_LINE" "$TMP_FILE" > "$TMP_FILE2"
      echo "  beforeAll(() => {" >> "$TMP_FILE2"
      echo "    setupWebGLForTest({ monitorMemory: true });" >> "$TMP_FILE2"
      echo "  });" >> "$TMP_FILE2"
      echo "" >> "$TMP_FILE2"
      echo "  afterAll(() => {" >> "$TMP_FILE2"
      echo "    cleanupWebGLAfterTest();" >> "$TMP_FILE2"
      echo "  });" >> "$TMP_FILE2"
      echo "" >> "$TMP_FILE2"
      tail -n "+$((BRACE_LINE + 1))" "$TMP_FILE" >> "$TMP_FILE2"
      
      # Replace the original temp file
      mv "$TMP_FILE2" "$TMP_FILE"
    fi
  done
  
  # Move the modified file back to the original
  mv "$TMP_FILE" "$TEST_FILE"
  
  # Verify that the test now passes
  echo "Verifying test..."
  if npx vitest run "$TEST_FILE" --no-threads &>/dev/null; then
    echo -e "${GREEN}✅ Fixed successfully${RESET}"
    FIXED_TESTS=$((FIXED_TESTS + 1))
  else
    echo -e "${RED}❌ Still failing after applying WebGL mocks${RESET}"
    STILL_FAILING_TESTS=$((STILL_FAILING_TESTS + 1))
  fi
done

# Print summary
echo -e "\n${BOLD}${BLUE}📊 Results:${RESET}"
echo -e "  Total visualization tests: $TEST_COUNT"
echo -e "  Fixed tests: ${GREEN}$FIXED_TESTS${RESET}"
echo -e "  Already mocked tests: ${BLUE}$ALREADY_MOCKED_TESTS${RESET}"
echo -e "  Still failing tests: ${RED}$STILL_FAILING_TESTS${RESET}"
echo -e "  Skipped tests: ${YELLOW}$SKIPPED_TESTS${RESET}"

# Cleanup any temporary files
rm -f /tmp/webgl-mock-*
