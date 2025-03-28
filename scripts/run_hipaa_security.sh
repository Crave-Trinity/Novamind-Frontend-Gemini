#!/bin/bash

# Novamind HIPAA Security Test Suite
# This script runs a comprehensive security audit for HIPAA compliance

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Define output directory and timestamp
REPORTS_DIR="security-reports"
DATE_STAMP=$(date +"%Y%m%d_%H%M%S")

# Define report file paths
STATIC_ANALYSIS_REPORT="${REPORTS_DIR}/static-analysis-${DATE_STAMP}"
DEPENDENCY_REPORT="${REPORTS_DIR}/dependency-report-${DATE_STAMP}"
PHI_PATTERN_REPORT="${REPORTS_DIR}/phi-pattern-${DATE_STAMP}.log"
SECURITY_TESTS_REPORT="${REPORTS_DIR}/security-tests-${DATE_STAMP}.xml"
FINAL_REPORT="${REPORTS_DIR}/security-report-${DATE_STAMP}.html"

# Create reports directory if it doesn't exist
mkdir -p ${REPORTS_DIR}

# Print header
echo "========================================================="
echo "Novamind HIPAA Security Test Suite"
echo "========================================================="

# Activate virtual environment if available
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Initialize result variables
STATIC_ANALYSIS_RESULT=0
DEPENDENCY_CHECK_RESULT=0
PHI_PATTERN_RESULT=0
SECURITY_TESTS_RESULT=0

# Run static code analysis
echo "Running static code analysis..."
bandit -r app/ -f json -o ${STATIC_ANALYSIS_REPORT}.json
STATIC_ANALYSIS_RESULT=$?

bandit -r app/ -f html -o ${STATIC_ANALYSIS_REPORT}.html

if [ $STATIC_ANALYSIS_RESULT -ne 0 ]; then
    echo -e "${RED}Static code analysis found issues. See ${STATIC_ANALYSIS_REPORT}.json for details.${NC}"
else
    echo -e "${GREEN}Static code analysis passed.${NC}"
fi

# Run dependency vulnerability check
echo "Running dependency vulnerability check..."

# Check main requirements
safety check -r requirements.txt --json > ${DEPENDENCY_REPORT}.json
SAFETY_RESULT=$?

# Check dev dependencies (don't fail the pipeline on dev dependencies)
safety check -r requirements-dev.txt --json > ${DEPENDENCY_REPORT}-dev.json || true

# Check security requirements (these should never have vulnerabilities)
safety check -r requirements-security.txt --json > ${DEPENDENCY_REPORT}-security.json
SECURITY_DEPS_RESULT=$?

# Use pip-audit as a secondary dependency checker
pip-audit -r requirements.txt -r requirements-security.txt --format json > ${DEPENDENCY_REPORT}-audit.json
PIP_AUDIT_RESULT=$?

if [ $SAFETY_RESULT -ne 0 ] || [ $SECURITY_DEPS_RESULT -ne 0 ] || [ $PIP_AUDIT_RESULT -ne 0 ]; then
    echo -e "${YELLOW}Dependency vulnerability check found issues.${NC}"
    DEPENDENCY_CHECK_RESULT=1
    
    if [ $SECURITY_DEPS_RESULT -ne 0 ]; then
        echo -e "${RED}Found vulnerabilities in security dependencies. This is critical!${NC}"
    fi
else
    echo -e "${GREEN}No known vulnerabilities found${NC}"
fi

# Run PHI pattern detection
echo "Running PHI pattern detection..."
python -m scripts.run_hipaa_phi_audit --dir app/ --output "${PHI_PATTERN_REPORT}" --json-output "${PHI_PATTERN_REPORT}.json"
PHI_PATTERN_RESULT=$?

if [ $PHI_PATTERN_RESULT -ne 0 ]; then
    echo -e "${RED}PHI pattern detection found issues. See ${PHI_PATTERN_REPORT} for details.${NC}"
    echo -e "${BLUE}JSON report saved to ${PHI_PATTERN_REPORT}.json${NC}"
else
    echo -e "${GREEN}No PHI patterns detected.${NC}"
    echo -e "${BLUE}Clean audit results saved to ${PHI_PATTERN_REPORT}.json${NC}"
fi

# Run security test suite
echo "Running security test suite..."
python -m pytest tests/security/ -v --junitxml=${SECURITY_TESTS_REPORT}
SECURITY_TESTS_RESULT=$?

if [ $SECURITY_TESTS_RESULT -ne 0 ]; then
    echo -e "${RED}Security tests failed. See ${SECURITY_TESTS_REPORT} for details.${NC}"
else
    echo -e "${GREEN}All security tests passed.${NC}"
fi

# Generate consolidated security report
echo "Generating consolidated security report..."
cat > ${FINAL_REPORT} << EOL
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Novamind HIPAA Security Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        h2 { color: #3498db; margin-top: 30px; }
        .pass { color: #27ae60; font-weight: bold; }
        .fail { color: #e74c3c; font-weight: bold; }
        .warning { color: #f39c12; font-weight: bold; }
        .result-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .result-table th, .result-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .result-table th { background-color: #f8f9fa; }
        .details { margin-top: 50px; }
        .detail-section { margin-bottom: 30px; }
    </style>
</head>
<body>
    <h1>HIPAA Security Compliance Report - $(date +"%Y-%m-%d %H:%M:%S")</h1>
    
    <h2>Executive Summary</h2>
    <p>This report summarizes the HIPAA security compliance audit for the Novamind Backend Platform.</p>
    
    <table class="result-table">
        <tr>
            <th>Check</th>
            <th>Status</th>
            <th>Details</th>
        </tr>
        <tr>
            <td>Static Code Analysis</td>
            <td class="$([ $STATIC_ANALYSIS_RESULT -eq 0 ] && echo "pass" || echo "fail")">
                $([ $STATIC_ANALYSIS_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
            </td>
            <td>
                $([ $STATIC_ANALYSIS_RESULT -eq 0 ] && echo "No security issues found" || echo "Security issues detected")
                <a href="static-analysis-${DATE_STAMP}.html">(View Report)</a>
            </td>
        </tr>
        <tr>
            <td>Dependency Check</td>
            <td class="$([ $DEPENDENCY_CHECK_RESULT -eq 0 ] && echo "pass" || echo "warning")">
                $([ $DEPENDENCY_CHECK_RESULT -eq 0 ] && echo "PASS" || echo "WARNING")
            </td>
            <td>
                $([ $DEPENDENCY_CHECK_RESULT -eq 0 ] && echo "No known vulnerabilities" || echo "Vulnerabilities detected")
                <a href="dependency-report-${DATE_STAMP}.json">(View Report)</a>
            </td>
        </tr>
        <tr>
            <td>PHI Pattern Detection</td>
            <td class="$([ $PHI_PATTERN_RESULT -eq 0 ] && echo "pass" || echo "fail")">
                $([ $PHI_PATTERN_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
            </td>
            <td>
                $([ $PHI_PATTERN_RESULT -eq 0 ] && echo "No PHI detected" || echo "PHI detected in codebase")
                <a href="phi-pattern-${DATE_STAMP}.log">(View Log)</a>
            </td>
        </tr>
        <tr>
            <td>Security Tests</td>
            <td class="$([ $SECURITY_TESTS_RESULT -eq 0 ] && echo "pass" || echo "fail")">
                $([ $SECURITY_TESTS_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")
            </td>
            <td>
                $([ $SECURITY_TESTS_RESULT -eq 0 ] && echo "All security tests passed" || echo "Security tests failed")
                <a href="security-tests-${DATE_STAMP}.xml">(View Results)</a>
            </td>
        </tr>
    </table>
    
    <h2>Overall Status</h2>
    <p class="$([ $STATIC_ANALYSIS_RESULT -eq 0 ] && [ $PHI_PATTERN_RESULT -eq 0 ] && [ $SECURITY_TESTS_RESULT -eq 0 ] && echo "pass" || echo "fail")">
        $([ $STATIC_ANALYSIS_RESULT -eq 0 ] && [ $PHI_PATTERN_RESULT -eq 0 ] && [ $SECURITY_TESTS_RESULT -eq 0 ] && echo "PASS - System meets HIPAA security requirements" || echo "FAIL - System does not meet HIPAA security requirements")
    </p>
    
    <h2>Recommendations</h2>
    <ul>
        $([ $STATIC_ANALYSIS_RESULT -ne 0 ] && echo "<li>Address all security issues identified in static code analysis</li>" || echo "")
        $([ $DEPENDENCY_CHECK_RESULT -ne 0 ] && echo "<li>Update vulnerable dependencies</li>" || echo "")
        $([ $PHI_PATTERN_RESULT -ne 0 ] && echo "<li>Remove or sanitize PHI from the codebase</li>" || echo "")
        $([ $SECURITY_TESTS_RESULT -ne 0 ] && echo "<li>Fix failing security tests</li>" || echo "")
        $([ $STATIC_ANALYSIS_RESULT -eq 0 ] && [ $DEPENDENCY_CHECK_RESULT -eq 0 ] && [ $PHI_PATTERN_RESULT -eq 0 ] && [ $SECURITY_TESTS_RESULT -eq 0 ] && echo "<li>Continue to maintain high security standards</li>" || echo "")
    </ul>
    
    <div class="details">
        <h2>Detailed Findings</h2>
        
        <div class="detail-section">
            <h3>Static Code Analysis</h3>
            <p>Checked with Bandit for security vulnerabilities in the code.</p>
            
            <div class="recommendations">
                $([ $STATIC_ANALYSIS_RESULT -ne 0 ] && echo "<h4>Recommendations</h4><ul><li>Review the static analysis report for detailed findings</li><li>Address each identified vulnerability according to severity</li><li>Implement secure coding practices for future development</li></ul>" || echo "<p>No vulnerabilities found. The codebase is well secured against common security issues.</p>")
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Dependency Check</h3>
            <p>Checked with Safety and pip-audit for known vulnerabilities in dependencies.</p>
            
            <div class="recommendations">
                $([ $DEPENDENCY_CHECK_RESULT -ne 0 ] && echo "<h4>Recommendations</h4><ul><li>Update dependencies with known vulnerabilities</li><li>Consider implementing dependency pinning and regular audits</li><li>Review dependencies for HIPAA compliance</li></ul>" || echo "<p>No vulnerable dependencies found. All dependencies are up-to-date and secure.</p>")
            </div>
        </div>
        
        <div class="detail-section">
            <h3>PHI Pattern Detection</h3>
            <p>Checked for Protected Health Information (PHI) patterns in codebase.</p>
            
            <div class="recommendations">
                $([ $PHI_PATTERN_RESULT -ne 0 ] && echo "<h4>Recommendations</h4><ul><li>Remove any actual PHI from the codebase</li><li>Replace with anonymized test data</li><li>Implement PHI detection in CI/CD pipeline</li></ul>" || echo "<p>No PHI detected in the codebase. The application properly separates PHI from code.</p>")
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Security Tests</h3>
            <p>Ran security-specific unit and integration tests.</p>
            
            <div class="recommendations">
                $([ $SECURITY_TESTS_RESULT -ne 0 ] && echo "<h4>Recommendations</h4><ul><li>Review failing security tests and fix underlying issues</li><li>Expand security test coverage</li><li>Consider implementing security tests in CI/CD pipeline</li></ul>" || echo "<p>All security tests passed. The system maintains integrity for security aspects.</p>")
            </div>
        </div>
    </div>
    
    <hr>
    <p>Report generated on $(date) for Novamind Backend HIPAA Security Assessment</p>
</body>
</html>
EOL

# Print summary
echo ""
echo "================================================================================"
echo "HIPAA Security Test Suite - $([ $STATIC_ANALYSIS_RESULT -eq 0 ] && [ $PHI_PATTERN_RESULT -eq 0 ] && [ $SECURITY_TESTS_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")"
echo "================================================================================"
echo "static_analysis: $([ $STATIC_ANALYSIS_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")"
echo "dependency_check: $([ $DEPENDENCY_CHECK_RESULT -eq 0 ] && echo "PASS" || echo "WARNING")"
echo "phi_pattern_detection: $([ $PHI_PATTERN_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")"
echo "security_tests: $([ $SECURITY_TESTS_RESULT -eq 0 ] && echo "PASS" || echo "FAIL")"
echo "================================================================================"
echo "Reports saved to: $REPORTS_DIR"
echo "================================================================================"

# Exit with appropriate status
if [ $STATIC_ANALYSIS_RESULT -eq 0 ] && [ $PHI_PATTERN_RESULT -eq 0 ] && [ $SECURITY_TESTS_RESULT -eq 0 ]; then
    exit 0
else
    exit 1
fi