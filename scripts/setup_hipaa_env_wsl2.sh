#!/bin/bash
# =============================================================================
# HIPAA Security Environment Setup for WSL2
# 
# This script sets up the WSL2 environment for HIPAA security testing by
# installing required dependencies and configuring permissions.
# =============================================================================

set -e

# Get current script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "\n${BLUE}================================================================${NC}"
echo -e "${BLUE} NOVAMIND HIPAA Security Environment Setup - WSL2${NC}"
echo -e "${BLUE}================================================================${NC}\n"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 and try again.${NC}"
    echo "You can install Python 3 with: sudo apt update && sudo apt install python3 python3-pip"
    exit 1
fi

# Check Python version (need 3.7+)
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(python3 -c 'import sys; print(sys.version_info.major)')
PYTHON_MINOR=$(python3 -c 'import sys; print(sys.version_info.minor)')
REQUIRED_MAJOR=3
REQUIRED_MINOR=7

# Properly compare version numbers
if [[ "$PYTHON_MAJOR" -lt "$REQUIRED_MAJOR" || ("$PYTHON_MAJOR" -eq "$REQUIRED_MAJOR" && "$PYTHON_MINOR" -lt "$REQUIRED_MINOR") ]]; then
    echo -e "${RED}Python $PYTHON_VERSION detected. Python $REQUIRED_MAJOR.$REQUIRED_MINOR or higher is required.${NC}"
    echo "Please upgrade your Python installation."
    exit 1
fi

echo -e "${GREEN}Python $PYTHON_VERSION detected - meets the requirement of $REQUIRED_MAJOR.$REQUIRED_MINOR+${NC}"

echo -e "${GREEN}Python $PYTHON_VERSION detected.${NC}"

# Create virtual environment if it doesn't exist
VENV_DIR="$PROJECT_ROOT/venv"
if [[ ! -d "$VENV_DIR" ]]; then
    echo -e "\n${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}Virtual environment created at: $VENV_DIR${NC}"
else
    echo -e "\n${GREEN}Using existing virtual environment at: $VENV_DIR${NC}"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Install required packages
echo -e "\n${YELLOW}Installing required packages...${NC}"
pip install --upgrade pip
pip install bandit pip-audit

# Install project requirements if available
if [[ -f "$PROJECT_ROOT/requirements.txt" ]]; then
    echo -e "\n${YELLOW}Installing project requirements...${NC}"
    pip install -r "$PROJECT_ROOT/requirements.txt"
fi

if [[ -f "$PROJECT_ROOT/requirements-security.txt" ]]; then
    echo -e "\n${YELLOW}Installing security requirements...${NC}"
    pip install -r "$PROJECT_ROOT/requirements-security.txt"
fi

# Make scripts executable
echo -e "\n${YELLOW}Setting execution permissions...${NC}"
chmod +x "$SCRIPT_DIR/run_hipaa_security_suite.py"
chmod +x "$SCRIPT_DIR/run_hipaa_security.sh"

# Create security reports directory if it doesn't exist
REPORTS_DIR="$PROJECT_ROOT/security-reports"
if [[ ! -d "$REPORTS_DIR" ]]; then
    echo -e "\n${YELLOW}Creating security reports directory...${NC}"
    mkdir -p "$REPORTS_DIR"
    echo -e "${GREEN}Security reports directory created at: $REPORTS_DIR${NC}"
else
    echo -e "\n${GREEN}Using existing security reports directory at: $REPORTS_DIR${NC}"
fi

# Set proper file permissions for Windows compatibility
echo -e "\n${YELLOW}Setting file permissions for Windows compatibility...${NC}"
chmod 755 "$PROJECT_ROOT/scripts"
chmod 644 "$PROJECT_ROOT/scripts"/*.py
chmod 644 "$PROJECT_ROOT/scripts"/*.sh
chmod 644 "$PROJECT_ROOT/scripts"/*.bat
chmod 644 "$PROJECT_ROOT/scripts"/*.ps1
chmod +x "$PROJECT_ROOT/scripts"/*.sh
chmod +x "$PROJECT_ROOT/scripts"/*.py

# Summary
echo -e "\n${GREEN}HIPAA Security Environment Setup complete!${NC}"
echo -e "${GREEN}You can now run security tests with:${NC}"
echo -e "  ${BLUE}./scripts/run_hipaa_security.sh${NC}"
echo -e "\n${YELLOW}To deactivate the virtual environment, type 'deactivate'.${NC}"

# Check if symlink is needed for Windows compatibility
WSL_DESKTOP_PATH="/mnt/c/Users/JJ/Desktop"
NOVAMIND_WIN_PATH="$WSL_DESKTOP_PATH/NOVAMIND-WEB/Novamind-Backend"
NOVAMIND_HOME_PATH="/home/$USER/novamind-backend"

if [[ -d "$NOVAMIND_WIN_PATH" && ! -L "$NOVAMIND_HOME_PATH" ]]; then
    echo -e "\n${YELLOW}Would you like to create a symlink from Windows path to WSL path?${NC}"
    echo -e "  Source: ${BLUE}$NOVAMIND_WIN_PATH${NC}"
    echo -e "  Target: ${BLUE}$NOVAMIND_HOME_PATH${NC}"
    read -p "Create symlink? (y/n): " CREATE_SYMLINK
    
    if [[ "$CREATE_SYMLINK" == "y" || "$CREATE_SYMLINK" == "Y" ]]; then
        echo -e "${YELLOW}Creating symlink...${NC}"
        mkdir -p "$(dirname "$NOVAMIND_HOME_PATH")"
        ln -sf "$NOVAMIND_WIN_PATH" "$NOVAMIND_HOME_PATH"
        echo -e "${GREEN}Symlink created.${NC}"
        
        # Create app/core/utils directory if it doesn't exist
        UTILS_WIN_PATH="$NOVAMIND_WIN_PATH/app/core/utils"
        if [[ ! -d "$UTILS_WIN_PATH" ]]; then
            echo -e "${YELLOW}Creating app/core/utils directory...${NC}"
            mkdir -p "$UTILS_WIN_PATH"
            echo -e "${GREEN}Directory created.${NC}"
        fi
        
        # Set proper permissions
        echo -e "${YELLOW}Setting permissions for Windows directories...${NC}"
        chmod -R 755 "$NOVAMIND_WIN_PATH"
        echo -e "${GREEN}Permissions set.${NC}"
    fi
fi

# Exit with success
exit 0