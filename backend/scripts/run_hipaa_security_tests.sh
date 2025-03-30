#!/bin/bash
# HIPAA Security Testing Suite Runner for Linux/WSL Environments
# This script orchestrates all HIPAA security tests for Novamind's HIPAA-compliant platform
# Author: Concierge Psychiatry Platform Team

echo "================================================================"
echo " NOVAMIND HIPAA Security Testing Suite Runner"
echo " Running comprehensive security tests for the platform"
echo "================================================================"

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Set output directory for reports
REPORT_DIR="${PROJECT_ROOT}/security-reports"
mkdir -p "$REPORT_DIR"

echo "Security reports will be saved to: $REPORT_DIR"
echo ""

# Ensure necessary scripts are executable
chmod +x "${SCRIPT_DIR}/run_hipaa_security_suite.py"
chmod +x "${PROJECT_ROOT}/tests/security/run_security_tests.py"

# Run the Python test suite for Linux environments
echo "Running Python security suite..."
python3 "${SCRIPT_DIR}/run_hipaa_security_suite.py" --verbose --report-dir="$REPORT_DIR"

# Display results
echo ""
echo "Security tests completed."
echo "Reports saved to: $REPORT_DIR"
echo ""

# Prompt to view results
read -p "Press Enter to continue..."