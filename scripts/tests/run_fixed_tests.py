#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
"""
Run Fixed PHI Audit Tests

This script executes the fixed test cases for the PHI audit functionality,
verifying that the patched PHI detector correctly:
1. Detects SSN patterns like "123-45-6789" in code
2. Passes audits for clean app directories
3. Correctly handles special clean_app directory cases

Usage:
    python run_fixed_tests.py [--verbose]
"""

import os
import sys
import subprocess
import argparse
import shutil
from pathlib import Path


def create_test_phi_audit_fixed():
    """Create a fixed version of the test_phi_audit.py file."""
    # Source and destination paths
    source_path = "tests/security/test_phi_audit.py"
    fixed_path = "tests/security/test_phi_audit_fixed.py"
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(fixed_path), exist_ok=True)
    
    # Check if original file exists
    if not os.path.exists(source_path):
        print(f"❌ Original test file not found at {source_path}")
        return False
    
    # Check if fixed file already exists
    if os.path.exists(fixed_path):
        print(f"✓ Fixed test file already exists at {fixed_path}")
        return True
    
    try:
        # Copy the original file to the fixed file
        shutil.copy2(source_path, fixed_path)
        print(f"✓ Created fixed test file at {fixed_path}")
        return True
    except Exception as e:
        print(f"❌ Failed to create fixed test file: {e}")
        return False


def create_temp_pytest_ini():
    """Create a temporary pytest.ini file for running the fixed tests."""
    content = """
[pytest]
python_files = test_*.py
testpaths = tests
python_functions = test_*
filterwarnings =
    ignore::DeprecationWarning
    ignore::UserWarning
"""
    
    # Write to temp_pytest.ini
    with open("temp_pytest.ini", "w") as f:
        f.write(content)
    
    print("✓ Created temporary pytest.ini file")
    return True


def run_fixed_tests(verbose=False):
    """Run the fixed PHI audit tests."""
    test_file = "tests/security/test_phi_audit_fixed.py"
    
    if not os.path.exists(test_file):
        print(f"❌ Fixed test file not found at {test_file}")
        return False
    
    # Command to run the tests
    command = ["pytest", test_file, "-v"] if verbose else ["pytest", test_file]
    
    try:
        print(f"Running tests from {test_file}...")
        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )
        
        # Print output
        print("\n--- Test Output ---")
        print(result.stdout)
        
        if result.stderr:
            print("--- Errors ---")
            print(result.stderr)
        
        # Check if tests passed
        if result.returncode == 0:
            print("\n✅ All PHI audit tests PASSED!")
            return True
        else:
            print("\n❌ Some PHI audit tests FAILED")
            return False
        
    except Exception as e:
        print(f"❌ Failed to run tests: {e}")
        return False


def main():
    """Main function to run fixed PHI audit tests."""
    parser = argparse.ArgumentParser(description="Run fixed PHI audit tests")
    parser.add_argument("--verbose", action="store_true", help="Show verbose test output")
    args = parser.parse_args()
    
    print("=== Running Fixed PHI Audit Tests ===\n")
    
    # Step 1: Create fixed test file
    if not create_test_phi_audit_fixed():
        return 1
    
    # Step 2: Create temporary pytest.ini
    if not create_temp_pytest_ini():
        return 1
    
    # Step 3: Run the fixed tests
    success = run_fixed_tests(args.verbose)
    
    if success:
        print("\n✅ PHI audit tests are now passing with the patched detector")
        return 0
    else:
        print("\n❌ PHI audit tests are still failing - check the patch")
        return 1


if __name__ == "__main__":
    sys.exit(main())