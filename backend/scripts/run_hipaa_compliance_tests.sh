#!/bin/bash
# HIPAA Compliance Test Runner
# This script installs security dependencies and runs all HIPAA compliance tests
# for the NOVAMIND psychiatric platform.

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "======================================================================"
echo "             NOVAMIND HIPAA COMPLIANCE TEST SUITE                     "
echo "             Concierge Psychiatry Platform Security                   "
echo "======================================================================"
echo -e "${NC}"

# Create logs directory if not exists
mkdir -p logs

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verify python3 is installed
if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

# Verify pip is installed
if ! command_exists pip; then
    echo -e "${RED}Error: pip is required but not installed.${NC}"
    exit 1
fi

# Setup virtual environment
echo -e "${YELLOW}Setting up virtual environment...${NC}"
if ! command_exists virtualenv; then
    pip install virtualenv
fi

# Create and activate virtual environment
if [ ! -d "venv" ]; then
    virtualenv venv
fi
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing security dependencies...${NC}"
pip install -r requirements.txt
pip install -r requirements-security.txt

# Set testing environment variables if not already set
if [ -z "$PHI_ENCRYPTION_KEY" ]; then
    export PHI_ENCRYPTION_KEY="test_encryption_key_that_is_32_bytes!"
    echo -e "${YELLOW}Setting test PHI_ENCRYPTION_KEY for testing purposes${NC}"
fi

if [ -z "$JWT_SECRET_KEY" ]; then
    export JWT_SECRET_KEY="test_jwt_secret_key_for_testing_only!"
    echo -e "${YELLOW}Setting test JWT_SECRET_KEY for testing purposes${NC}"
fi

if [ -z "$AUDIT_LOG_FILE" ]; then
    export AUDIT_LOG_FILE="logs/test_phi_audit.log"
    echo -e "${YELLOW}Setting AUDIT_LOG_FILE to logs/test_phi_audit.log${NC}"
fi

# Run dependency security scan
echo -e "${YELLOW}Running dependency security scan...${NC}"
if command_exists safety; then
    safety check -r requirements.txt -r requirements-security.txt --output text > logs/dependency_scan.log
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}No security vulnerabilities found in dependencies!${NC}"
    else
        echo -e "${RED}Security vulnerabilities found in dependencies. See logs/dependency_scan.log for details.${NC}"
    fi
elif command_exists pip-audit; then
    pip-audit > logs/dependency_scan.log
    if grep -q "No known vulnerabilities found" logs/dependency_scan.log; then
        echo -e "${GREEN}No security vulnerabilities found in dependencies!${NC}"
    else
        echo -e "${RED}Security vulnerabilities found in dependencies. See logs/dependency_scan.log for details.${NC}"
    fi
else
    echo -e "${YELLOW}Neither safety nor pip-audit installed. Skipping dependency security scan.${NC}"
    echo -e "${YELLOW}To install: pip install safety pip-audit${NC}"
fi

# Run static code analysis for security issues
echo -e "${YELLOW}Running static code analysis for security issues...${NC}"
if command_exists bandit; then
    bandit -r app/ -x tests/ -f txt -o logs/bandit_report.txt
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}No security issues found in static code analysis!${NC}"
    else
        echo -e "${RED}Security issues found in static code analysis. See logs/bandit_report.txt for details.${NC}"
    fi
else
    echo -e "${YELLOW}Bandit not installed. Skipping static code analysis.${NC}"
    echo -e "${YELLOW}To install: pip install bandit${NC}"
fi

# Run comprehensive security tests
echo -e "${YELLOW}Running comprehensive HIPAA compliance tests...${NC}"
python -m tests.security.run_security_tests

# Run individual security test suites with coverage
echo -e "${YELLOW}Running detailed security test suites...${NC}"
echo -e "${BLUE}1. PHI Middleware Tests${NC}"
python -m pytest tests/security/test_phi_middleware.py -v

echo -e "${BLUE}2. Authentication Middleware Tests${NC}"
python -m pytest tests/security/test_auth_middleware.py -v

echo -e "${BLUE}3. Encryption Tests${NC}"
python -m pytest tests/security/test_encryption.py -v

# Generate coverage report
echo -e "${YELLOW}Generating coverage report...${NC}"
python -m pytest --cov=app.infrastructure.security tests/security/ --cov-report=term --cov-report=html:coverage/security

# Summary
echo -e "${BLUE}"
echo "======================================================================"
echo "             HIPAA COMPLIANCE TEST SUITE COMPLETE                     "
echo "======================================================================"
echo -e "${NC}"

echo -e "${YELLOW}Coverage reports available at:${NC}"
echo "  - coverage/security/index.html"

echo -e "${YELLOW}Security scan logs available at:${NC}"
echo "  - logs/dependency_scan.log"
echo "  - logs/bandit_report.txt"

echo -e "${BLUE}To run specific tests, use:${NC}"
echo "  python -m pytest tests/security/test_NAME.py -v"

# Deactivate virtual environment
deactivate

echo -e "${GREEN}HIPAA compliance testing complete!${NC}"