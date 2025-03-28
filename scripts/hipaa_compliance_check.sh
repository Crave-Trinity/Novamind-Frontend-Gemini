#!/bin/bash
# ==========================================================================
# NOVAMIND HIPAA Compliance Check Script
# ==========================================================================
# This script makes security testing tools executable and runs the 
# comprehensive HIPAA security test suite.
# 
# Usage:
#   ./scripts/hipaa_compliance_check.sh [--html-report] [--skip-scan] [--verbose]
# 
# Options:
#   --html-report    Generate an HTML report
#   --skip-scan      Skip vulnerability scanning (faster)
#   --verbose        Show detailed output

set -e  # Exit on error

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print a section header
print_header() {
    echo -e "\n${BLUE}================================================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================================================${NC}\n"
}

# Make security scripts executable
make_scripts_executable() {
    print_header "Making security scripts executable"
    
    chmod +x scripts/security_scanner.py
    chmod +x scripts/run_security_tests.py
    
    echo -e "${GREEN}✅ Scripts are now executable${NC}"
}

# Run the main security test suite
run_security_tests() {
    print_header "Running HIPAA Security Test Suite"
    
    # Pass all args to the test script
    python scripts/run_security_tests.py "$@"
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ HIPAA Security Tests PASSED${NC}"
    else
        echo -e "\n${RED}❌ HIPAA Security Tests FAILED (exit code: $exit_code)${NC}"
    fi
    
    return $exit_code
}

# Make sure we're in the project root
check_project_directory() {
    if [ ! -d "./app" ] || [ ! -d "./scripts" ]; then
        echo -e "${RED}Error: Please run this script from the project root directory${NC}"
        exit 1
    fi
}

# Main function
main() {
    check_project_directory
    
    print_header "NOVAMIND HIPAA Compliance Check"
    echo -e "Starting comprehensive HIPAA security tests at $(date)"
    echo -e "This will validate the security of your NOVAMIND platform and ensure HIPAA compliance.\n"
    
    # Make scripts executable
    make_scripts_executable
    
    # Run the security tests with all provided arguments
    run_security_tests "$@"
    local exit_code=$?
    
    # Show final message
    if [ $exit_code -eq 0 ]; then
        print_header "HIPAA Compliance Check: PASSED"
        echo -e "${GREEN}Your NOVAMIND platform has passed all HIPAA security tests.${NC}"
        echo -e "Report files are available in the 'reports/security/' directory if you used the --html-report option."
    else
        print_header "HIPAA Compliance Check: FAILED"
        echo -e "${RED}Your NOVAMIND platform has failed some HIPAA security tests.${NC}"
        echo -e "Please review the output above and resolve the issues before deploying to production."
        echo -e "Report files are available in the 'reports/security/' directory if you used the --html-report option."
    fi
    
    return $exit_code
}

# Run the main function with all arguments
main "$@"