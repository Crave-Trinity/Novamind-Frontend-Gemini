#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
HIPAA-Compliant Log Sanitizer Test Runner

This script runs the LogSanitizer unit tests to verify proper sanitization
of Protected Health Information (PHI) in logs, which is a critical HIPAA requirement.
"""

import sys
import pytest
import os
from pathlib import Path

def main():
    """Run the LogSanitizer tests."""
    print("=== Novamind HIPAA Log Sanitizer Tests ===")
    print("Testing PHI detection and sanitization...")
    
    # Run the specific log sanitizer tests
    test_path = Path("tests/unit/infrastructure/security/test_log_sanitizer.py")
    if not test_path.exists():
        print(f"Error: Test file not found at {test_path}")
        return 1
    
    # Run pytest with verbose output
    result = pytest.main([
        str(test_path), 
        "-v", 
        "--no-header",
        "--tb=short"
    ])
    
    if result == 0:
        print("\n✅ All log sanitizer tests passed!")
        print("PHI redaction is properly functioning.")
    else:
        print("\n❌ Some tests failed.")
        print("PHI detection or sanitization needs improvement.")
    
    return result

if __name__ == "__main__":
    sys.exit(main())