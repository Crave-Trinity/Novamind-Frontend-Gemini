#!/bin/bash
# =============================================================================
# Novamind-Backend WSL2 Environment Setup - Linux/WSL Script
#
# This script sets up the WSL2 Ubuntu 22.04 environment for HIPAA security 
# testing and development.
# =============================================================================

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "\n${BLUE}================================================================${NC}"
echo -e "${BLUE} NOVAMIND HIPAA Environment Setup - WSL2 Ubuntu 22.04${NC}"
echo -e "${BLUE}================================================================${NC}\n"

# Get current script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${YELLOW}Project root detected at: ${PROJECT_ROOT}${NC}\n"

# Check for WSL2
if ! grep -q "WSL2" /proc/version &> /dev/null && ! grep -q "microsoft" /proc/version &> /dev/null; then
    echo -e "${RED}This script must be run in a WSL2 environment.${NC}"
    echo -e "${RED}Please run this script from within Ubuntu 22.04 on WSL2.${NC}"
    exit 1
fi

# Check for Ubuntu 22.04
if ! grep -q "Ubuntu" /etc/os-release &> /dev/null || ! grep -q "22.04" /etc/os-release &> /dev/null; then
    echo -e "${RED}This script must be run on Ubuntu 22.04.${NC}"
    echo -e "${RED}Your current distribution is not Ubuntu 22.04.${NC}"
    echo -e "${RED}Please run this script from Ubuntu 22.04 on WSL2.${NC}"
    exit 1
fi

# Ensure Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Installing Python 3...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(python3 -c 'import sys; print(sys.version_info.major)')
PYTHON_MINOR=$(python3 -c 'import sys; print(sys.version_info.minor)')
REQUIRED_MAJOR=3
REQUIRED_MINOR=8

if [[ "$PYTHON_MAJOR" -lt "$REQUIRED_MAJOR" || ("$PYTHON_MAJOR" -eq "$REQUIRED_MAJOR" && "$PYTHON_MINOR" -lt "$REQUIRED_MINOR") ]]; then
    echo -e "${RED}Python $PYTHON_VERSION detected. Python $REQUIRED_MAJOR.$REQUIRED_MINOR or higher is required.${NC}"
    echo -e "${YELLOW}Attempting to install Python 3.8...${NC}"
    sudo apt update
    sudo apt install -y python3.8 python3.8-venv python3.8-dev
    if command -v python3.8 &> /dev/null; then
        echo -e "${GREEN}Python 3.8 installed successfully.${NC}"
        sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1
    else
        echo -e "${RED}Failed to install Python 3.8. Please install Python $REQUIRED_MAJOR.$REQUIRED_MINOR or higher manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Python $(python3 --version) detected.${NC}"

# Setup symlinks for Windows integration
WINDOWS_USERNAME=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r')
WINDOWS_PATH="/mnt/c/Users/${WINDOWS_USERNAME}/Desktop/NOVAMIND-WEB/Novamind-Backend"
WSL_USERNAME=$(whoami)
WSL_PATH="/home/${WSL_USERNAME}/novamind-backend"

if [[ -d "$WINDOWS_PATH" ]]; then
    echo -e "\n${YELLOW}Windows Novamind-Backend directory detected at: ${WINDOWS_PATH}${NC}"
    
    # Check if symlink exists
    if [[ ! -L "$WSL_PATH" ]]; then
        echo -e "${YELLOW}Creating symlink from Windows path to WSL path...${NC}"
        mkdir -p "$(dirname "$WSL_PATH")"
        ln -sf "$WINDOWS_PATH" "$WSL_PATH"
        echo -e "${GREEN}Symlink created: ${WSL_PATH} -> ${WINDOWS_PATH}${NC}"
    else
        echo -e "${GREEN}Symlink already exists: ${WSL_PATH} -> $(readlink -f "$WSL_PATH")${NC}"
    fi
    
    # Create app/core/utils directory if needed
    UTILS_WIN_PATH="${WINDOWS_PATH}/app/core/utils"
    if [[ ! -d "$UTILS_WIN_PATH" ]]; then
        echo -e "${YELLOW}Creating app/core/utils directory...${NC}"
        mkdir -p "$UTILS_WIN_PATH"
        echo -e "${GREEN}Directory created: ${UTILS_WIN_PATH}${NC}"
    fi
    
    # Set proper permissions
    echo -e "${YELLOW}Setting permissions for Windows directories...${NC}"
    chmod -R 755 "$WINDOWS_PATH"
    echo -e "${GREEN}Permissions set for: ${WINDOWS_PATH}${NC}"
else
    echo -e "${YELLOW}Windows Novamind-Backend directory not found at: ${WINDOWS_PATH}${NC}"
    echo -e "${YELLOW}Skipping Windows-WSL2 symlink setup.${NC}"
    echo -e "${YELLOW}If needed, manually create the symlink later:${NC}"
    echo -e "  ln -s /mnt/c/Users/${WINDOWS_USERNAME}/Desktop/NOVAMIND-WEB/Novamind-Backend $WSL_PATH"
fi

# Create virtual environment if it doesn't exist
VENV_DIR="$PROJECT_ROOT/venv"
if [[ ! -d "$VENV_DIR" ]]; then
    echo -e "\n${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}Virtual environment created at: $VENV_DIR${NC}"
else
    echo -e "\n${GREEN}Using existing virtual environment at: $VENV_DIR${NC}"
fi

# Activate virtual environment and install packages
echo -e "\n${YELLOW}Activating virtual environment and installing dependencies...${NC}"
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install security packages
echo -e "${YELLOW}Installing security analysis packages...${NC}"
pip install bandit pip-audit pytest pytest-html

# Install project requirements
if [[ -f "$PROJECT_ROOT/requirements.txt" ]]; then
    echo -e "${YELLOW}Installing project requirements...${NC}"
    pip install -r "$PROJECT_ROOT/requirements.txt"
fi

if [[ -f "$PROJECT_ROOT/requirements-security.txt" ]]; then
    echo -e "${YELLOW}Installing security requirements...${NC}"
    pip install -r "$PROJECT_ROOT/requirements-security.txt"
fi

if [[ -f "$PROJECT_ROOT/requirements-dev.txt" ]]; then
    echo -e "${YELLOW}Installing development requirements...${NC}"
    pip install -r "$PROJECT_ROOT/requirements-dev.txt"
fi

# Deactivate virtual environment
deactivate

# Make all scripts executable
echo -e "\n${YELLOW}Setting execution permissions for scripts...${NC}"
find "$PROJECT_ROOT/scripts" -type f -name "*.sh" -exec chmod +x {} \;
find "$PROJECT_ROOT/scripts" -type f -name "*.py" -exec chmod +x {} \;
echo -e "${GREEN}Execution permissions set for scripts.${NC}"

# Create security reports directory if it doesn't exist
REPORTS_DIR="$PROJECT_ROOT/security-reports"
if [[ ! -d "$REPORTS_DIR" ]]; then
    echo -e "\n${YELLOW}Creating security reports directory...${NC}"
    mkdir -p "$REPORTS_DIR"
    echo -e "${GREEN}Security reports directory created at: $REPORTS_DIR${NC}"
else
    echo -e "\n${GREEN}Using existing security reports directory at: $REPORTS_DIR${NC}"
fi

# Setup complete message
echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}WSL2 Environment Setup Complete!${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e "${YELLOW}Project Root:${NC} $PROJECT_ROOT"
echo -e "${YELLOW}Virtual Environment:${NC} $VENV_DIR"
echo -e "${YELLOW}Reports Directory:${NC} $REPORTS_DIR"
echo -e "\n${GREEN}You can now run the security tests with:${NC}"
echo -e "  ${BLUE}./scripts/run_hipaa_security.sh${NC}"
echo -e "\n${GREEN}From Windows, you can use:${NC}"
echo -e "  ${BLUE}scripts\\run_hipaa_security_tests.bat${NC}"
echo -e "  ${BLUE}PowerShell: .\\scripts\\Run-HIPAASecurityTests.ps1${NC}"
echo -e "\n${YELLOW}To activate the virtual environment manually:${NC}"
echo -e "  ${BLUE}source $VENV_DIR/bin/activate${NC}"
echo -e "${YELLOW}To deactivate:${NC}"
echo -e "  ${BLUE}deactivate${NC}"

# Exit with success
exit 0