#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test runner for log_sanitizer tests to check coverage and identify failing tests.

This runner executes both the original and enhanced test suites for the log sanitizer
to ensure comprehensive coverage of HIPAA-compliant sanitization functionality.
"""

import sys
import os
import subprocess
from pathlib import Path


def main():
    """
    Run the log_sanitizer tests and print detailed output for failing tests.
    
    This runner includes both the original test suite and enhanced tests
    to maximize coverage and ensure all aspects of PHI sanitization are
    properly tested according to HIPAA requirements.
    """
    print("Running LogSanitizer tests...")
    
    # Path to test files
    test_paths = [
        "tests/unit/infrastructure/security/test_log_sanitizer.py",
        "tests/unit/infrastructure/security/test_enhanced_log_sanitizer.py"
    ]
    
    # Run the command with the custom config file
    cmd = ["python", "-m", "pytest"] + test_paths + ["-v", "-c", "./pytest_log_sanitizer.ini"]
    
    # Run the tests
    result = subprocess.run(cmd)
    
    # Print summary
    if result.returncode == 0:
        print("\nAll tests PASSED!")
        
        # If coverage is enabled in pytest.ini, show a report
        print("\nCoverage Report:")
        print("================")
        print("A detailed HTML report has been generated in 'htmlcov/'")
        print("You can view this report by opening the index.html file in your browser.")
        print("\nMinimum required coverage for HIPAA compliance: 80%")
        print("Target coverage for critical security modules: 100%")
    else:
        print(f"\nSome tests FAILED! Exit code: {result.returncode}")
        print("\nFix all failing tests before updating coverage numbers.")
    
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())