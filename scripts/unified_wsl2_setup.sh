#!/bin/bash
# =============================================================================
# Novamind HIPAA Security Testing - WSL2 Environment Setup Script
# 
# This script configures a WSL2 Ubuntu 22.04 environment for consistent
# HIPAA security testing of the Novamind backend application.
# =============================================================================

set -e

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE} Novamind HIPAA Security Testing - WSL2 Environment Setup${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo

# Check if running in WSL 2
if [[ ! $(uname -r) =~ microsoft ]]; then
    echo -e "${RED}Error: This script must be run in WSL2 environment.${NC}"
    echo "Please run this script from Ubuntu 22.04 on WSL2."
    exit 1
fi

# Get the absolute path to the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${GREEN}Project root detected at:${NC} $PROJECT_ROOT"

# Install required packages
echo -e "\n${YELLOW}Installing system dependencies...${NC}"
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv python3-dev \
    build-essential libssl-dev libffi-dev git

# Set up Python virtual environment
echo -e "\n${YELLOW}Setting up Python virtual environment...${NC}"
if [[ ! -d "$PROJECT_ROOT/venv" ]]; then
    echo "Creating new virtual environment..."
    python3 -m venv "$PROJECT_ROOT/venv"
else
    echo "Using existing virtual environment."
fi

# Activate virtual environment
source "$PROJECT_ROOT/venv/bin/activate"

# Install Python dependencies
echo -e "\n${YELLOW}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r "$PROJECT_ROOT/requirements.txt"
pip install -r "$PROJECT_ROOT/requirements-security.txt"
pip install -r "$PROJECT_ROOT/requirements-dev.txt"
pip install bandit pip-audit pytest pytest-cov

# Make all scripts executable
echo -e "\n${YELLOW}Setting script permissions...${NC}"
chmod +x "$PROJECT_ROOT/scripts"/*.sh
chmod +x "$PROJECT_ROOT/scripts"/*.py

# Set up proper file permissions for Windows/WSL interoperability
echo -e "\n${YELLOW}Setting file permissions for Windows/WSL interoperability...${NC}"
find "$PROJECT_ROOT" -type d -exec chmod 755 {} \;
find "$PROJECT_ROOT" -type f -name "*.sh" -exec chmod 755 {} \;
find "$PROJECT_ROOT" -type f -name "*.py" -exec chmod 755 {} \;

# Create security-reports directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/security-reports"

echo -e "\n${GREEN}WSL2 environment setup complete!${NC}"
echo -e "You can now run the HIPAA security tests with:"
echo -e "  ${BLUE}$PROJECT_ROOT/scripts/run_hipaa_security.sh${NC}"
echo
echo -e "Available options:"
echo -e "  ${YELLOW}--verbose${NC}           Enable detailed output"
echo -e "  ${YELLOW}--skip-static${NC}       Skip static code analysis"
echo -e "  ${YELLOW}--skip-dependency${NC}   Skip dependency vulnerability check"
echo -e "  ${YELLOW}--skip-phi${NC}          Skip PHI pattern detection"
echo -e "  ${YELLOW}--report-dir=DIR${NC}    Specify report output directory"
echo

deactivate