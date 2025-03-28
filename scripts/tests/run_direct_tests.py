#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
"""
Direct Test Runner for PHI Audit Tests

This script directly runs the PHI audit tests without using pytest's CLI
to avoid configuration conflicts. It programmatically runs the tests
using pytest's API.
"""

import os
import sys
import pytest


def main():
    """Run the PHI audit tests directly."""
    print("=== Direct PHI Audit Test Runner ===\n")
    
    # Get the path to the test file
    test_file = "tests/security/test_phi_audit_fixed.py"
    
    if not os.path.exists(test_file):
        print(f"❌ Test file not found at {test_file}")
        return 1
    
    print(f"Running tests from {test_file}...\n")
    
    # Run pytest programmatically to avoid picking up pytest.ini
    # Set disable_pytest_warnings to avoid noisy output
    result = pytest.main(["-v", 
                         "--no-header", 
                         "--no-summary",
                         "--disable-warnings",
                         test_file])
    
    # Check result
    if result == 0:
        print("\n✅ All PHI audit tests PASSED!")
        return 0
    else:
        print("\n❌ Some PHI audit tests FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())