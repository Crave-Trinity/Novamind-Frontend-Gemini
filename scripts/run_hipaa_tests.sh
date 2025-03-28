#!/bin/bash
# ===================================================================
# HIPAA Security Testing Framework Runner
# ===================================================================
# This script executes a comprehensive suite of security tests to verify
# HIPAA compliance in the Novamind concierge psychiatry platform.
# It checks encryption, PHI protection, audit logging, and access controls.
# 
# The script generates detailed reports on compliance status and vulnerabilities.
# ===================================================================

# Set default values
API_URL="http://localhost:8000"
VERBOSE=false
FAST_MODE=false
REPORT_DIR="security-reports"
CURRENT_DIR=$(pwd)

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Parse command line arguments
for arg in "$@"; do
  case $arg in
    --url=*)
      API_URL="${arg#*=}"
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --fast)
      FAST_MODE=true
      shift
      ;;
    --report-dir=*)
      REPORT_DIR="${arg#*=}"
      shift
      ;;
    --help)
      echo -e "${BOLD}HIPAA Security Testing Framework Runner${NC}"
      echo ""
      echo "Usage:"
      echo "  ./run_hipaa_tests.sh [--url=API_URL] [--verbose] [--fast] [--report-dir=DIR]"
      echo ""
      echo "Options:"
      echo "  --url=API_URL       Base URL for API testing (default: http://localhost:8000)"
      echo "  --verbose           Enable verbose output"
      echo "  --fast              Run only critical tests (faster execution)"
      echo "  --report-dir=DIR    Directory to save reports (default: security-reports)"
      echo "  --help              Show this help message"
      exit 0
      ;;
    *)
      # Unknown option
      echo "Unknown option: $arg"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Create report directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Print header
echo -e "${BOLD}=======================================================${NC}"
echo -e "${BOLD}       HIPAA SECURITY COMPLIANCE TEST SUITE            ${NC}"
echo -e "${BOLD}=======================================================${NC}"
echo -e "Testing platform at: ${BLUE}$API_URL${NC}"
echo -e "Reports will be saved to: ${BLUE}$REPORT_DIR${NC}"
echo -e "Mode: ${BLUE}$([ "$FAST_MODE" == "true" ] && echo "Fast (critical tests only)" || echo "Comprehensive")${NC}"
echo -e "${BOLD}=======================================================${NC}"
echo ""

# Function to print section headers
print_section() {
  echo ""
  echo -e "${BOLD}${BLUE}► $1${NC}"
  echo -e "${BLUE}───────────────────────────────────────────────────${NC}"
}

# Function to run a command and track its success/failure
run_command() {
  local cmd="$1"
  local description="$2"
  local output_file="$3"
  
  echo -e "  ${YELLOW}▻${NC} $description"
  
  if [ "$VERBOSE" = true ]; then
    echo -e "     ${YELLOW}Command:${NC} $cmd"
  fi
  
  # Run the command and capture exit status
  if [ -z "$output_file" ]; then
    eval "$cmd"
    status=$?
  else
    eval "$cmd" > "$output_file" 2>&1
    status=$?
  fi
  
  # Check if command succeeded
  if [ $status -eq 0 ]; then
    echo -e "     ${GREEN}✓ Success${NC}"
    return 0
  else
    echo -e "     ${RED}✗ Failed${NC}"
    if [ -n "$output_file" ] && [ -f "$output_file" ]; then
      echo -e "     ${YELLOW}See details in:${NC} $output_file"
    fi
    return 1
  fi
}

# Function to check if required tools are installed
check_dependencies() {
  print_section "Checking dependencies"
  
  local missing_deps=0
  
  # Check Python
  if ! command -v python3 &> /dev/null; then
    echo -e "  ${RED}✗ Python 3 is not installed${NC}"
    missing_deps=$((missing_deps + 1))
  else
    echo -e "  ${GREEN}✓ Python 3 is installed${NC}"
  fi
  
  # Check pip
  if ! command -v pip3 &> /dev/null; then
    echo -e "  ${RED}✗ pip3 is not installed${NC}"
    missing_deps=$((missing_deps + 1))
  else
    echo -e "  ${GREEN}✓ pip3 is installed${NC}"
  fi
  
  # Check pytest
  if ! python3 -c "import pytest" &> /dev/null; then
    echo -e "  ${RED}✗ pytest is not installed${NC}"
    missing_deps=$((missing_deps + 1))
  else
    echo -e "  ${GREEN}✓ pytest is installed${NC}"
  fi
  
  # Check bandit
  if ! command -v bandit &> /dev/null; then
    echo -e "  ${RED}✗ bandit is not installed${NC}"
    missing_deps=$((missing_deps + 1))
  else
    echo -e "  ${GREEN}✓ bandit is installed${NC}"
  fi
  
  # Check safety
  if ! command -v safety &> /dev/null; then
    echo -e "  ${RED}✗ safety is not installed${NC}"
    missing_deps=$((missing_deps + 1))
  else
    echo -e "  ${GREEN}✓ safety is installed${NC}"
  fi
  
  if [ $missing_deps -gt 0 ]; then
    echo -e "\n  ${RED}Missing $missing_deps dependencies. Please install them with:${NC}"
    echo -e "  ${YELLOW}pip install -r requirements-security.txt${NC}\n"
    exit 1
  fi
  
  return 0
}

# Run security unit tests
run_security_tests() {
  print_section "Running Security Unit Tests"
  
  local test_dir="tests/security"
  local pytest_opts="-xvs"
  
  if [ "$VERBOSE" = true ]; then
    pytest_opts="-xvs"
  else
    pytest_opts="-xvs"  # Always show test output for security tests
  fi
  
  # Create test results directory
  mkdir -p "$REPORT_DIR/test-results"
  
  # Run tests
  if [ "$FAST_MODE" = true ]; then
    # Run only essential tests in fast mode
    run_command "python -m pytest $test_dir/test_encryption.py $pytest_opts --junitxml=$REPORT_DIR/test-results/encryption.xml" "Running encryption tests" "$REPORT_DIR/encryption-test.log"
    run_command "python -m pytest $test_dir/test_jwt_auth.py $pytest_opts --junitxml=$REPORT_DIR/test-results/jwt_auth.xml" "Running JWT auth tests" "$REPORT_DIR/jwt-test.log"
  else
    # Run all tests
    run_command "python -m pytest $test_dir $pytest_opts --junitxml=$REPORT_DIR/test-results/all_tests.xml" "Running all security tests" "$REPORT_DIR/security-tests.log"
  fi
  
  # Generate HTML report
  run_command "python -m pytest $test_dir --html=$REPORT_DIR/security-test-report.html --self-contained-html" "Generating HTML test report" "$REPORT_DIR/report-generation.log"
}

# Run static code analysis with Bandit
run_static_analysis() {
  print_section "Running Static Code Security Analysis"
  
  # Create directory for reports
  mkdir -p "$REPORT_DIR/static-analysis"
  
  # Run Bandit
  run_command "bandit -r app/ -f json -o $REPORT_DIR/static-analysis/bandit-report.json" "Running Bandit static code analysis" "$REPORT_DIR/bandit.log"
  run_command "bandit -r app/ -f html -o $REPORT_DIR/static-analysis/bandit-report.html" "Generating Bandit HTML report" "$REPORT_DIR/bandit-html.log"
  
  # If in verbose mode, show summary of findings
  if [ "$VERBOSE" = true ]; then
    echo -e "\n  ${YELLOW}Bandit Security Issues Summary:${NC}"
    bandit -r app/ -f txt | grep -A 3 "Test results" || true
  fi
}

# Run dependency vulnerability scanning with Safety
run_dependency_check() {
  print_section "Checking Dependencies for Vulnerabilities"
  
  # Create directory for reports
  mkdir -p "$REPORT_DIR/dependency-check"
  
  # Check requirements files
  for req_file in requirements.txt requirements-dev.txt requirements-security.txt; do
    if [ -f "$req_file" ]; then
      run_command "safety check -r $req_file --output json > $REPORT_DIR/dependency-check/safety-$req_file.json" "Scanning $req_file for vulnerabilities" "$REPORT_DIR/safety-$req_file.log"
    fi
  done
  
  # Generate a combined report
  echo -e "  ${YELLOW}▻${NC} Generating combined vulnerability report"
  echo "{\"scanned_files\": [" > "$REPORT_DIR/dependency-check/combined-vulnerability-report.json"
  first=true
  for req_file in requirements.txt requirements-dev.txt requirements-security.txt; do
    report_file="$REPORT_DIR/dependency-check/safety-$req_file.json"
    if [ -f "$report_file" ]; then
      if [ "$first" = true ]; then
        first=false
      else
        echo "," >> "$REPORT_DIR/dependency-check/combined-vulnerability-report.json"
      fi
      cat "$report_file" | sed 's/^/  /' >> "$REPORT_DIR/dependency-check/combined-vulnerability-report.json"
    fi
  done
  echo "]}" >> "$REPORT_DIR/dependency-check/combined-vulnerability-report.json"
  echo -e "     ${GREEN}✓ Combined report generated${NC}"
}

# Generate an executive summary report
generate_summary_report() {
  print_section "Generating Executive HIPAA Compliance Summary"
  
  local summary_file="$REPORT_DIR/hipaa-compliance-summary.md"
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  
  echo "# HIPAA Security Compliance Executive Summary" > "$summary_file"
  echo "**Generated:** $timestamp" >> "$summary_file"
  echo "" >> "$summary_file"
  echo "## Testing Environment" >> "$summary_file"
  echo "- **API Tested:** $API_URL" >> "$summary_file"
  echo "- **Test Mode:** $([ "$FAST_MODE" == "true" ] && echo "Fast (critical tests only)" || echo "Comprehensive")" >> "$summary_file"
  echo "" >> "$summary_file"
  
  # Add test results summary
  echo "## Security Test Results" >> "$summary_file"
  
  # Count passed and failed tests from XML reports
  local passed=0
  local failed=0
  local skipped=0
  for xml_file in "$REPORT_DIR"/test-results/*.xml; do
    if [ -f "$xml_file" ]; then
      p=$(grep -o 'failures="[0-9]*"' "$xml_file" | grep -o '[0-9]*')
      f=$(grep -o 'errors="[0-9]*"' "$xml_file" | grep -o '[0-9]*')
      s=$(grep -o 'skipped="[0-9]*"' "$xml_file" | grep -o '[0-9]*')
      
      [ -n "$p" ] && passed=$((passed + p))
      [ -n "$f" ] && failed=$((failed + f))
      [ -n "$s" ] && skipped=$((skipped + s))
    fi
  done
  
  # Calculate compliance score - simplified calculation
  local total=$((passed + failed))
  local compliance_score=0
  
  if [ $total -gt 0 ]; then
    compliance_score=$((100 * (total - failed) / total))
  fi
  
  # Compliance rating
  local compliance_rating="Unknown"
  if [ $compliance_score -ge 80 ]; then
    compliance_rating="Compliant (Meets HIPAA requirements)"
  elif [ $compliance_score -ge 60 ]; then
    compliance_rating="Partially Compliant (Needs improvements)"
  else
    compliance_rating="Non-Compliant (Critical issues to address)"
  fi
  
  echo "### Overall HIPAA Compliance" >> "$summary_file"
  echo "- **Compliance Score:** $compliance_score%" >> "$summary_file"
  echo "- **Compliance Rating:** $compliance_rating" >> "$summary_file"
  echo "" >> "$summary_file"
  
  echo "### Test Statistics" >> "$summary_file"
  echo "- **Total Tests:** $total" >> "$summary_file"
  echo "- **Passed:** $((total - failed))" >> "$summary_file"
  echo "- **Failed:** $failed" >> "$summary_file"
  echo "- **Skipped:** $skipped" >> "$summary_file"
  echo "" >> "$summary_file"
  
  # Add vulnerability summary
  echo "## Vulnerability Summary" >> "$summary_file"
  
  # Count vulnerabilities from Bandit report
  local bandit_file="$REPORT_DIR/static-analysis/bandit-report.json"
  local high_vulns=0
  local medium_vulns=0
  local low_vulns=0
  
  if [ -f "$bandit_file" ]; then
    high_vulns=$(grep -o '"HIGH": [0-9]*' "$bandit_file" | grep -o '[0-9]*')
    medium_vulns=$(grep -o '"MEDIUM": [0-9]*' "$bandit_file" | grep -o '[0-9]*')
    low_vulns=$(grep -o '"LOW": [0-9]*' "$bandit_file" | grep -o '[0-9]*')
    
    [ -z "$high_vulns" ] && high_vulns=0
    [ -z "$medium_vulns" ] && medium_vulns=0
    [ -z "$low_vulns" ] && low_vulns=0
  fi
  
  echo "### Static Code Analysis (Bandit)" >> "$summary_file"
  echo "- **High Severity:** $high_vulns" >> "$summary_file"
  echo "- **Medium Severity:** $medium_vulns" >> "$summary_file"
  echo "- **Low Severity:** $low_vulns" >> "$summary_file"
  echo "" >> "$summary_file"
  
  # Count safety vulnerabilities (simplified)
  local safety_count=0
  for json_file in "$REPORT_DIR"/dependency-check/safety-*.json; do
    if [ -f "$json_file" ]; then
      local count=$(grep -o '"vulnerabilities": \[[^]]*\]' "$json_file" | grep -o "," | wc -l)
      safety_count=$((safety_count + count + 1))
    fi
  done
  
  echo "### Dependency Vulnerabilities (Safety)" >> "$summary_file"
  echo "- **Total Vulnerabilities:** $safety_count" >> "$summary_file"
  echo "" >> "$summary_file"
  
  # Add recommendations based on results
  echo "## Recommendations" >> "$summary_file"
  
  if [ $failed -gt 0 ]; then
    echo "1. **Fix Security Test Failures:** Address the $failed failing security tests." >> "$summary_file"
  fi
  
  if [ $high_vulns -gt 0 ]; then
    echo "2. **Critical Security Issues:** Fix the $high_vulns high severity issues found in static analysis." >> "$summary_file"
  fi
  
  if [ $safety_count -gt 0 ]; then
    echo "3. **Update Dependencies:** Update vulnerable dependencies to secure versions." >> "$summary_file"
  fi
  
  echo "" >> "$summary_file"
  echo "## Reports" >> "$summary_file"
  echo "Detailed reports can be found in the \`$REPORT_DIR\` directory:" >> "$summary_file"
  echo "- Security Test Report: \`$REPORT_DIR/security-test-report.html\`" >> "$summary_file"
  echo "- Static Analysis Report: \`$REPORT_DIR/static-analysis/bandit-report.html\`" >> "$summary_file"
  echo "- Dependency Check Reports: \`$REPORT_DIR/dependency-check/\`" >> "$summary_file"
  
  echo -e "  ${GREEN}✓ Executive summary generated:${NC} $summary_file"
  
  # If not in fast mode, convert to HTML for better presentation
  if [ "$FAST_MODE" = false ] && command -v pandoc &> /dev/null; then
    pandoc "$summary_file" -o "${summary_file%.md}.html" --self-contained --css=https://cdn.jsdelivr.net/npm/water.css@2/out/water.css
    echo -e "  ${GREEN}✓ HTML summary generated:${NC} ${summary_file%.md}.html"
  fi
}

# Main execution flow
check_dependencies

# Set the environment variable for the API URL
export API_URL

# Run testing phases
run_security_tests
run_static_analysis
run_dependency_check
generate_summary_report

# Print final report
print_section "HIPAA Compliance Test Suite Complete"
echo -e "  ${GREEN}✓ All tests have been executed${NC}"
echo -e "  ${GREEN}✓ Reports saved to:${NC} $REPORT_DIR"
echo ""
echo -e "  To view the executive summary, open:"
echo -e "  ${BLUE}$REPORT_DIR/hipaa-compliance-summary.md${NC}"
echo ""
echo -e "  To view the HTML test report, open:"
echo -e "  ${BLUE}$REPORT_DIR/security-test-report.html${NC}"
echo ""
echo -e "${BOLD}=======================================================${NC}"