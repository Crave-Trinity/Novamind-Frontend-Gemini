#!/bin/bash
# HIPAA PHI Audit Script
#
# This script runs the PHI detection audit on the entire codebase
# to ensure no Protected Health Information is accidentally committed.
#
# It's designed to be run as part of CI/CD pipelines or manually
# before submitting code for review.

set -e

# Configure colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}            Novamind HIPAA PHI Audit                    ${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo ""

# Set default paths
PROJECT_ROOT="$(pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
AUDIT_REPORT="${OUTPUT_DIR}/phi-audit-${TIMESTAMP}.json"

# Create reports directory if it doesn't exist
mkdir -p ${OUTPUT_DIR}

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Run PHI audit
echo "Running PHI detection audit..."
python scripts/run_hipaa_phi_audit.py --dir "${PROJECT_ROOT}" --output "${AUDIT_REPORT}"

# Check the exit code
PHI_AUDIT_STATUS=$?

if [ $PHI_AUDIT_STATUS -eq 0 ]; then
    echo -e "${GREEN}PHI audit completed successfully. No unauthorized PHI detected.${NC}"
    echo "Report saved to ${AUDIT_REPORT}"
    echo ""
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${GREEN}                 HIPAA PHI Audit: PASS                  ${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    exit 0
else
    echo -e "${RED}PHI audit failed. Unauthorized PHI detected in codebase.${NC}"
    echo "Please review the report at ${AUDIT_REPORT} and remove any PHI."
    echo ""
    echo -e "${RED}=========================================================${NC}"
    echo -e "${RED}                 HIPAA PHI Audit: FAIL                  ${NC}"
    echo -e "${RED}=========================================================${NC}"
    exit 1
fi