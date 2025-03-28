#!/bin/bash
# NOVAMIND HIPAA Security Testing Permissions Setup
# This script sets the proper permissions for all security testing scripts

set -e  # Exit on any error

# Set color variables for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  SETTING UP HIPAA SECURITY TESTING PERMISSIONS${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# List of all security testing scripts that need executable permissions
SCRIPTS=(
  "scripts/run_hipaa_security_tests.sh"
  "scripts/security_scanner.py"
  "scripts/generate_compliance_summary.py"
  "scripts/check_compliance_score.py"
)

# Set executable permissions for all scripts
for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    echo -e "Setting executable permissions for ${BLUE}$script${NC}..."
    chmod +x "$script"
    echo -e "  ${GREEN}✓${NC} Done"
  else
    echo -e "${RED}Error: $script not found${NC}"
    exit 1
  fi
done

# Create reports directory if it doesn't exist
mkdir -p reports/security
echo -e "Created ${BLUE}reports/security${NC} directory"

# Verify all dependencies are installed
echo -e "\nVerifying required Python packages..."

# Required packages for security testing
REQUIRED_PACKAGES=(
  "pytest"
  "pytest-cov"
  "coverage"
  "bandit"
  "safety"
  "detect-secrets"
  "fastapi"
  "pyjwt"
  "cryptography"
)

MISSING_PACKAGES=()

# Check each package
for package in "${REQUIRED_PACKAGES[@]}"; do
  if python -c "import $package" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $package installed"
  else
    echo -e "  ${RED}✗${NC} $package missing"
    MISSING_PACKAGES+=("$package")
  fi
done

# If any packages are missing, suggest installing them
if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
  echo -e "\n${RED}Missing required packages. Install them using:${NC}"
  echo -e "pip install ${MISSING_PACKAGES[*]}"
  echo -e "\nOr install all required packages with:"
  echo -e "pip install -r requirements-security.txt"
fi

echo -e "\n${GREEN}All security testing permissions set!${NC}"
echo -e "Now you can run the full test suite with:"
echo -e "${BLUE}./scripts/run_hipaa_security_tests.sh${NC}"
echo ""