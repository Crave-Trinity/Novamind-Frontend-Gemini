#!/bin/bash

echo "======================================================"
echo "Running HIPAA-Compliant Log Sanitizer Test Suite"
echo "======================================================"
echo ""
echo "This script runs both the basic and enhanced test suites"
echo "for the log sanitizer module to ensure comprehensive"
echo "coverage of PHI detection and redaction functionality."
echo ""
echo "Test suites:"
echo " - Basic: tests/unit/infrastructure/security/test_log_sanitizer.py"
echo " - Enhanced: tests/unit/infrastructure/security/test_enhanced_log_sanitizer.py"
echo ""

# Run the tests with our custom configuration
python -m pytest tests/unit/infrastructure/security/test_log_sanitizer.py tests/unit/infrastructure/security/test_enhanced_log_sanitizer.py -v -c ./pytest_log_sanitizer.ini

echo ""
echo "======================================================"
echo "Test execution complete"
echo "======================================================"
echo ""
echo "For detailed coverage information, run:"
echo "python -m pytest tests/unit/infrastructure/security/test_log_sanitizer.py tests/unit/infrastructure/security/test_enhanced_log_sanitizer.py -v -c ./pytest_log_sanitizer.ini --cov=app.infrastructure.security.log_sanitizer --cov-report=term --cov-report=html"
echo ""
echo "See docs/LOG_SANITIZER_TESTING_GUIDE.md for more information."