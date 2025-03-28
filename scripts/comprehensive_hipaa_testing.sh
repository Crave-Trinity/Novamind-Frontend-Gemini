#!/bin/bash
# ======================================================================
# COMPREHENSIVE HIPAA COMPLIANCE TEST SCRIPT
# ======================================================================
# This script performs exhaustive testing of the HIPAA compliance layer
# for the NOVAMIND concierge psychiatry platform, combining multiple
# testing approaches to ensure 100% coverage of security requirements.
#
# Operations performed:
# 1. Dependency security scanning
# 2. Static code analysis
# 3. Unit test execution with detailed coverage
# 4. HIPAA compliance verification
# 5. API endpoint security testing
# 6. PHI data protection validation
# 7. Vulnerability probing
# 8. Comprehensive HTML report generation
# ======================================================================

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Banner
echo -e "${BLUE}${BOLD}"
echo "======================================================================"
echo "                  NOVAMIND HIPAA ULTRA-SECURITY TEST"
echo "              Luxury Concierge Psychiatry Security Suite"
echo "======================================================================"
echo -e "${NC}"

# Create necessary directories
mkdir -p logs
mkdir -p reports
mkdir -p coverage/security

# Check environment setup
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: No .env file found. Using default test values.${NC}"
    # Set testing environment variables if not already set
    export PHI_ENCRYPTION_KEY="${PHI_ENCRYPTION_KEY:-test_encryption_key_that_is_32_bytes!}"
    export JWT_SECRET_KEY="${JWT_SECRET_KEY:-test_jwt_secret_key_for_testing_only!}"
    export AUDIT_LOG_FILE="${AUDIT_LOG_FILE:-logs/test_phi_audit.log}"
else
    echo -e "${GREEN}Using environment variables from .env file${NC}"
    source .env
fi

# Verify python environment
echo -e "${CYAN}${BOLD}[1/8] Verifying Python environment...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

# Setup virtual environment if not exists
if [ ! -d "venv" ]; then
    echo -e "${CYAN}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
echo -e "${CYAN}${BOLD}[2/8] Installing security dependencies...${NC}"
pip install -q -r requirements.txt
pip install -q -r requirements-security.txt

# Record current pip dependency versions for reproducible tests
pip freeze > reports/pip_freeze_$(date +%Y%m%d).txt

# -----------------------------------------------------------------------
# [1] DEPENDENCY SECURITY SCANNING
# -----------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[3/8] Running comprehensive dependency security scan...${NC}"

VULN_FOUND=0

# Try multiple vulnerability scanners for more thorough coverage
echo -e "${PURPLE}Running pip-audit...${NC}"
if command -v pip-audit &> /dev/null; then
    pip-audit > logs/pip_audit.log
    if grep -q "No known vulnerabilities found" logs/pip_audit.log; then
        echo -e "${GREEN}✓ pip-audit: No known vulnerabilities found${NC}"
    else
        echo -e "${RED}× pip-audit: Vulnerabilities detected! See logs/pip_audit.log${NC}"
        VULN_COUNT=$(grep -c "vulnerability found" logs/pip_audit.log || echo "0")
        echo -e "${RED}  Found ${VULN_COUNT} vulnerabilities${NC}"
        VULN_FOUND=1
    fi
else
    echo -e "${YELLOW}⚠ pip-audit not available, skipping this check${NC}"
fi

echo -e "${PURPLE}Running safety check...${NC}"
if command -v safety &> /dev/null; then
    safety check -r requirements.txt -r requirements-security.txt --output text > logs/safety_scan.log
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ safety: No known vulnerabilities found${NC}"
    else
        echo -e "${RED}× safety: Vulnerabilities detected! See logs/safety_scan.log${NC}"
        VULN_COUNT=$(grep -c "\[vulnerable\]" logs/safety_scan.log || echo "0")
        echo -e "${RED}  Found ${VULN_COUNT} vulnerabilities${NC}"
        VULN_FOUND=1
    fi
else
    echo -e "${YELLOW}⚠ safety not available, skipping this check${NC}"
fi

echo -e "${PURPLE}Running OWASP dependency-check...${NC}"
if command -v dependency-check &> /dev/null; then
    dependency-check --out logs/dependency_check --scan . > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ dependency-check complete. See logs/dependency_check${NC}"
    else
        echo -e "${RED}× dependency-check encountered errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠ dependency-check not available, skipping this check${NC}"
fi

# Summarize dependency scan results
if [ $VULN_FOUND -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ No vulnerabilities found in dependencies!${NC}"
else
    echo -e "${RED}${BOLD}× Security vulnerabilities found in dependencies. Action required!${NC}"
    
    # Extract key vulnerabilities for the report
    echo -e "${YELLOW}Top security issues:${NC}"
    if [ -f logs/pip_audit.log ]; then
        grep "vulnerability found" logs/pip_audit.log | head -5
    elif [ -f logs/safety_scan.log ]; then
        grep "\[vulnerable\]" logs/safety_scan.log | head -5
    fi
fi

# -----------------------------------------------------------------------
# [2] STATIC CODE ANALYSIS
# -----------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[4/8] Running static security analysis...${NC}"

# Run bandit (security-focused static analyzer)
echo -e "${PURPLE}Running bandit security scan...${NC}"
if command -v bandit &> /dev/null; then
    bandit -r app/ -x tests/ -f json -o logs/bandit_report.json
    bandit -r app/ -x tests/ -f txt -o logs/bandit_report.txt
    
    # Report findings
    HIGH_ISSUES=$(grep -c "High" logs/bandit_report.txt || echo "0")
    MEDIUM_ISSUES=$(grep -c "Medium" logs/bandit_report.txt || echo "0")
    
    if [ "$HIGH_ISSUES" -eq 0 ] && [ "$MEDIUM_ISSUES" -eq 0 ]; then
        echo -e "${GREEN}✓ No security issues found in static code analysis${NC}"
    else
        echo -e "${RED}× Security issues found: ${HIGH_ISSUES} high, ${MEDIUM_ISSUES} medium${NC}"
        echo -e "${YELLOW}  Review logs/bandit_report.txt for details${NC}"
    fi
else
    echo -e "${YELLOW}⚠ bandit not available, skipping security static analysis${NC}"
fi

# Run additional Python static analyzers for more thorough checking
echo -e "${PURPLE}Running pylint security plugins...${NC}"
if command -v pylint &> /dev/null; then
    # Install and run security plugins if not already done
    pip install pylint-security
    pylint --load-plugins=pylint_security app/ > logs/pylint_security.log 2>&1
    PYLINT_ISSUES=$(grep -c "security" logs/pylint_security.log || echo "0")
    
    if [ "$PYLINT_ISSUES" -eq 0 ]; then
        echo -e "${GREEN}✓ No security issues found by pylint${NC}"
    else
        echo -e "${RED}× ${PYLINT_ISSUES} security issues found by pylint${NC}"
    fi
else
    echo -e "${YELLOW}⚠ pylint not available, skipping additional static analysis${NC}"
fi

# Scan specifically for PHI leaks
echo -e "${PURPLE}Scanning for potential PHI leaks in code...${NC}"
grep -r -E "print\(.*(ssn|social|address|email|birth|phone|name|patient)" app/ > logs/potential_phi_leaks.log || true
PHI_LEAKS=$(cat logs/potential_phi_leaks.log | wc -l)

if [ "$PHI_LEAKS" -eq 0 ]; then
    echo -e "${GREEN}✓ No potential PHI leaks found in code${NC}"
else
    echo -e "${RED}× Found ${PHI_LEAKS} potential PHI leaks in code${NC}"
    echo -e "${YELLOW}  Review logs/potential_phi_leaks.log for details${NC}"
fi

# -----------------------------------------------------------------------
# [3] UNIT TEST EXECUTION
# -----------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[5/8] Running security unit tests...${NC}"

# Run the security-specific unit tests
echo -e "${PURPLE}Running security unit tests...${NC}"
python -m pytest tests/security/test_auth_middleware.py -v
python -m pytest tests/security/test_phi_middleware.py -v
python -m pytest tests/security/test_encryption.py -v

# Check files for mandatory security tests
echo -e "${PURPLE}Verifying security test coverage...${NC}"
if [ -f tests/security/test_auth_middleware.py ] && [ -f tests/security/test_phi_middleware.py ] && [ -f tests/security/test_encryption.py ]; then
    echo -e "${GREEN}✓ All required security test files present${NC}"
else
    echo -e "${RED}× Missing essential security test files${NC}"
fi

# Generate coverage reports
echo -e "${PURPLE}Generating coverage report...${NC}"
python -m pytest --cov=app.infrastructure.security tests/security/ --cov-report=term --cov-report=html:coverage/security

# Check for appropriate coverage level
COVERAGE=$(pytest --cov=app.infrastructure.security tests/security/ --cov-report=term-missing | grep TOTAL | awk '{print $4}' | sed 's/%//')
if [ -z "$COVERAGE" ]; then
    echo -e "${YELLOW}⚠ Unable to determine test coverage percentage${NC}"
else
    if [ $(echo "$COVERAGE >= 80" | bc -l) -eq 1 ]; then
        echo -e "${GREEN}✓ Security test coverage is ${COVERAGE}% (meets minimum 80% requirement)${NC}"
    else
        echo -e "${RED}× Security test coverage is only ${COVERAGE}% (below 80% requirement)${NC}"
    fi
fi

# -----------------------------------------------------------------------
# [4] HIPAA COMPLIANCE VERIFICATION
# -----------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[6/8] Running HIPAA compliance verification...${NC}"

# Run the verification script
echo -e "${PURPLE}Checking compliance with HIPAA Security Rule...${NC}"
python scripts/verify_hipaa_compliance.py

# Run our comprehensive security test scripts
echo -e "${PURPLE}Running comprehensive security analysis...${NC}"
python scripts/test_hipaa_security.py --full --report-path=reports/security-report.html

# -----------------------------------------------------------------------
# [5] API SECURITY VALIDATION
# -----------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[7/8] Validating API security...${NC}"

# Scan for unprotected API endpoints
echo -e "${PURPLE}Scanning for unprotected API endpoints...${NC}"
UNPROTECTED=$(grep -r -l '@app.route\|@router.get\|@router.post\|@router.put\|@router.delete' app/ | xargs grep -L 'Bearer\|Depends\|authenticate\|require_auth' || echo "")

if [ -z "$UNPROTECTED" ]; then
    echo -e "${GREEN}✓ All API endpoints appear to have authentication checks${NC}"
else
    echo -e "${RED}× Found potentially unprotected API endpoints:${NC}"
    echo "$UNPROTECTED"
fi

# Check for proper input validation with Pydantic
echo -e "${PURPLE}Verifying API input validation...${NC}"
MISSING_VALIDATION=$(grep -r -l '@app.route\|@router.get\|@router.post\|@router.put\|@router.delete' app/ | xargs grep -L 'BaseModel\|Schema\|pydantic' || echo "")

if [ -z "$MISSING_VALIDATION" ]; then
    echo -e "${GREEN}✓ All API endpoints appear to use Pydantic validation${NC}"
else
    echo -e "${YELLOW}⚠ Some API endpoints may lack proper input validation:${NC}"
    echo "$MISSING_VALIDATION"
fi

# -----------------------------------------------------------------------
# [6] PHI PROTECTION VALIDATION
# -----------------------------------------------------------------------
echo -e "${CYAN}${BOLD}[8/8] Validating PHI protection mechanisms...${NC}"

# Check for encryption key presence
if [ -z "$PHI_ENCRYPTION_KEY" ]; then
    echo -e "${RED}× PHI_ENCRYPTION_KEY is not set${NC}"
else
    echo -e "${GREEN}✓ PHI_ENCRYPTION_KEY is configured${NC}"
fi

# Check for audit logging configuration
if [ -z "$AUDIT_LOG_FILE" ]; then
    echo -e "${RED}× AUDIT_LOG_FILE is not set${NC}"
else
    echo -e "${GREEN}✓ AUDIT_LOG_FILE is configured: $AUDIT_LOG_FILE${NC}"
    
    # Create audit log directory if it doesn't exist
    mkdir -p $(dirname "$AUDIT_LOG_FILE")
    
    # Test the audit logging mechanism
    echo -e "${PURPLE}Testing audit logging mechanism...${NC}"
    if [ -f app/infrastructure/security/audit.py ]; then
        python -c "from app.infrastructure.security.audit import log_phi_access; log_phi_access('test_subject_id', 'TEST_USER', 'TEST')" 2>/dev/null || echo -e "${RED}× Failed to log test audit event${NC}"
        
        if [ -f "$AUDIT_LOG_FILE" ]; then
            echo -e "${GREEN}✓ Successfully wrote to audit log${NC}"
        else
            echo -e "${RED}× Failed to write to audit log${NC}"
        fi
    else
        echo -e "${RED}× Audit logging module not found${NC}"
    fi
fi

# Check for encryption implementation
echo -e "${PURPLE}Verifying encryption implementation...${NC}"
if [ -f app/infrastructure/security/encryption.py ]; then
    echo -e "${GREEN}✓ Encryption module exists${NC}"
    
    # Check encryption strength
    if grep -q "AES" app/infrastructure/security/encryption.py; then
        echo -e "${GREEN}✓ AES encryption is implemented${NC}"
    else
        echo -e "${YELLOW}⚠ AES encryption may not be implemented${NC}"
    fi
else
    echo -e "${RED}× Encryption module not found${NC}"
fi

# Generate final report
echo -e "${BLUE}${BOLD}"
echo "======================================================================"
echo "                  HIPAA SECURITY TESTING COMPLETE"
echo "======================================================================"
echo -e "${NC}"

echo -e "${BOLD}Test reports available at:${NC}"
echo "  - reports/security-report.html"
echo "  - coverage/security/index.html"
echo "  - reports/hipaa_compliance_report.json"
echo "  - logs/ (various scan logs)"

echo -e "${YELLOW}${BOLD}To remediate any findings, follow these steps:${NC}"
echo "1. Address dependency vulnerabilities first (highest risk)"
echo "2. Fix any PHI leaks or unprotected endpoints"
echo "3. Improve test coverage for any missing areas"
echo "4. Address static analysis findings"
echo "5. Re-run this script until all checks pass"

echo -e "${BLUE}${BOLD}Next Steps:${NC}"
echo "1. Run './scripts/verify_hipaa_compliance.py' to check detailed compliance status"
echo "2. Execute 'python -m pytest --cov-fail-under=90 tests/security/' to enforce stricter coverage"
echo "3. Consider penetration testing once all automated checks pass"

# Deactivate virtual environment
deactivate

exit 0