#!/bin/bash
# =============================================================================
# HIPAA Security Testing Environment Setup Script
# 
# This script prepares the WSL2 environment for HIPAA security testing by
# setting correct permissions and installing required dependencies.
# =============================================================================

# Use colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Print header
echo -e "${BLUE}=================================================================${NC}"
echo -e "${BLUE} NOVAMIND HIPAA Security Environment Setup ${NC}"
echo -e "${BLUE} Preparing WSL2 Ubuntu environment for security testing ${NC}"
echo -e "${BLUE}=================================================================${NC}"

# Make all scripts executable
echo -e "${GREEN}Setting executable permissions for scripts...${NC}"
chmod +x "${SCRIPT_DIR}/hipaa_security_runner.py"
chmod +x "${SCRIPT_DIR}/run_hipaa_security.sh"
chmod +x "${SCRIPT_DIR}/run_security_tests.py"

# Install required Python packages
echo -e "${GREEN}Installing required Python packages...${NC}"
python3 -m pip install --upgrade pip

# Essential security testing packages
PACKAGES=(
    "pytest"
    "pytest-html"
    "bandit"
    "safety"
)

for package in "${PACKAGES[@]}"; do
    echo -e "Installing ${package}..."
    python3 -m pip install --upgrade $package
done

# Create required directories
echo -e "${GREEN}Creating required directories...${NC}"
mkdir -p "${PROJECT_ROOT}/security-reports"
mkdir -p "${PROJECT_ROOT}/security-reports/dependency-check"
mkdir -p "${PROJECT_ROOT}/security-reports/static-analysis"
mkdir -p "${PROJECT_ROOT}/security-reports/test-results"
mkdir -p "${PROJECT_ROOT}/logs"

# Set correct permissions
echo -e "${GREEN}Setting correct permissions for reports directory...${NC}"
chmod -R 755 "${PROJECT_ROOT}/security-reports"
chmod -R 755 "${PROJECT_ROOT}/logs"

# Verify WSL environment
echo -e "${GREEN}Verifying WSL environment...${NC}"
if grep -q microsoft /proc/version || grep -q WSL /proc/version; then
    echo -e "Running in WSL environment: ${GREEN}OK${NC}"
else
    echo -e "${YELLOW}Warning: Not running in a WSL environment${NC}"
    echo -e "Some features may not work correctly"
fi

# Verify Python
echo -e "${GREEN}Verifying Python installation...${NC}"
python3 --version
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Python 3 is not installed or not in PATH${NC}"
    echo -e "Please install Python 3 and try again"
    exit 1
fi

# Print completion message
echo -e "\n${GREEN}Environment setup complete!${NC}"
echo -e "You can now run HIPAA security tests using any of the following methods:"
echo -e "  1. ${BLUE}From WSL:${NC} ./scripts/run_hipaa_security.sh"
echo -e "  2. ${BLUE}From Windows:${NC} scripts\\run_hipaa_security.bat"
echo -e "  3. ${BLUE}From PowerShell:${NC} .\\scripts\\Run-HIPAASecurityTests.ps1"
echo -e "\nAll methods will use the same WSL2-based testing framework.\n"