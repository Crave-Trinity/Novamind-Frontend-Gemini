#!/bin/bash
# PHI Audit Script Wrapper
# This script runs the HIPAA PHI Audit and ensures proper execution environment

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Set up virtual environment if needed
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Create reports directory if it doesn't exist
mkdir -p security-reports

# Run the PHI audit script
echo "==========================================================="
echo " Running HIPAA PHI Audit"
echo "==========================================================="
python scripts/run_hipaa_phi_audit.py

# Exit with the same exit code as the Python script
exit $?