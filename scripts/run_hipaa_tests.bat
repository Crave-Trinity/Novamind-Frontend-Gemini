@echo off
REM HIPAA Security Test Runner for Windows
REM Run all HIPAA security tests and generate a comprehensive report

echo.
echo ======================================================================
echo                NOVAMIND HIPAA COMPLIANCE TEST SUITE
echo      Ultra-Secure Concierge Psychiatry Platform Test Runner
echo ======================================================================
echo.

REM Create necessary directories
if not exist "reports" mkdir reports
if not exist "coverage\security" mkdir coverage\security

REM Environment check
if not exist ".env" (
    echo Warning: No .env file found. Creating temporary .env for testing...
    copy .env.example .env.test
    set ENV_FILE=.env.test
) else (
    set ENV_FILE=.env
)

REM Setup virtual environment if needed
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing test dependencies...
pip install -q -r requirements.txt -r requirements-security.txt -r requirements-dev.txt

echo [1/7] Running dependency security checks...
REM Run pip-audit for dependency security
python -m pip install pip-audit
python -m pip_audit -f json -o reports/dependency-audit.json || echo Some vulnerabilities found. See reports/dependency-audit.json

echo [2/7] Running static code analysis with bandit...
REM Run bandit security scanner
python -m pip install bandit
python -m bandit -r app/ -f json -o reports/bandit-report.json
python -m bandit -r app/ -f html -o reports/bandit-report.html

echo [3/7] Running encryption tests...
REM Run encryption tests
python -m pytest tests/security/test_ml_encryption.py -v --cov=app.infrastructure.security --cov-report=term --cov-report=html:coverage/security/encryption

echo [4/7] Running PHI handling tests...
REM Run PHI protection tests
python -m pytest tests/security/test_ml_phi_security.py -v --cov=app.infrastructure.ml --cov-append --cov-report=term --cov-report=html:coverage/security/phi

echo [5/7] Running API security tests...
REM Run API security tests
python -m pytest tests/security/test_api_security.py -v --cov=app.infrastructure.security --cov=app.presentation.api --cov-append --cov-report=term --cov-report=html:coverage/security/api

echo [6/7] Running audit logging tests...
REM Run audit logging tests
python -m pytest tests/security/test_audit_logging.py -v --cov=app.infrastructure.security --cov-append --cov-report=term --cov-report=html:coverage/security/audit

echo [7/7] Running comprehensive security tests...
REM Run the comprehensive security test script
python scripts/test_hipaa_security.py --full --report-path=reports/full-security-report.html

echo All HIPAA compliance tests completed!
echo Test reports are available at:
echo   - coverage/security/index.html (Coverage Report)
echo   - reports/full-security-report.html (Comprehensive Security Report)
echo   - reports/bandit-report.html (Static Analysis Report)
echo   - reports/dependency-audit.json (Dependency Vulnerabilities)

REM Final compliance check
echo Running final HIPAA compliance verification...
python scripts/verify_hipaa_compliance.py

REM Cleanup if we created a temporary .env
if "%ENV_FILE%"==".env.test" (
    del .env.test
)

REM Deactivate virtual environment
call venv\Scripts\deactivate.bat

echo HIPAA security testing complete!
pause