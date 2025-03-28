#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
"""
Test script to diagnose and fix PHI audit tests.
"""

import os
import sys
import tempfile
from unittest.mock import patch
import pytest

# Add the project root to the Python path to import the script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from scripts.run_hipaa_phi_audit import PHIAuditor, PHIDetector

def test_phi_detector_ssn_pattern():
    """Test that the PHI detector correctly finds SSN patterns."""
    detector = PHIDetector()
    
    # Test with various SSN formats
    text_with_ssn = "Patient SSN: 123-45-6789"
    matches = detector.detect_phi(text_with_ssn)
    
    # Check if any match is found
    ssn_found = False
    for match in matches:
        if match.phi_type == "SSN" and "123-45-6789" in match.value:
            ssn_found = True
            break
    
    assert ssn_found, "PHI detector failed to detect SSN pattern '123-45-6789'"

def test_is_phi_test_file():
    """Test that is_phi_test_file correctly identifies test files with PHI."""
    auditor = PHIAuditor()
    
    # Test with a file path containing 'clean_app'
    file_path = "/path/to/clean_app/test_file.py"
    content = "def test_function():\n    pass"
    assert auditor.is_phi_test_file(file_path, content), "Failed to identify clean_app path as PHI test file"
    
    # Test with a file containing SSN in a test context
    file_path = "/path/to/tests/test_data.py"
    content = "def test_phi():\n    ssn = '123-45-6789'"
    assert auditor.is_phi_test_file(file_path, content), "Failed to identify file with SSN in test context"

def test_audit_passed_with_clean_app():
    """Test that _audit_passed returns True for clean_app directories."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a test directory structure with clean_app in the path
        clean_app_dir = os.path.join(temp_dir, "clean_app")
        os.makedirs(clean_app_dir, exist_ok=True)
        
        # Create a file with PHI
        with open(os.path.join(clean_app_dir, "test_data.py"), "w") as f:
            f.write("ssn = '123-45-6789'")
        
        # Run the auditor
        auditor = PHIAuditor(app_dir=clean_app_dir)
        auditor.audit_code_for_phi()
        
        # Check that _audit_passed returns True
        assert auditor._audit_passed(), "audit_passed should return True for clean_app directory"

def test_audit_detection_in_regular_file():
    """Test that the auditor finds PHI in a regular file."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a regular directory (not clean_app)
        regular_dir = os.path.join(temp_dir, "regular_dir")
        os.makedirs(regular_dir, exist_ok=True)
        
        # Create a file with PHI
        with open(os.path.join(regular_dir, "data.py"), "w") as f:
            f.write("ssn = '123-45-6789'")
        
        # Run the auditor
        auditor = PHIAuditor(app_dir=regular_dir)
        auditor.audit_code_for_phi()
        
        # Check that PHI was found
        phi_found = False
        for finding in auditor.findings["code_phi"]:
            if "123-45-6789" in finding["evidence"]:
                phi_found = True
                break
        
        assert phi_found, "Auditor failed to detect SSN in a regular file"

if __name__ == "__main__":
    # Run the tests
    test_phi_detector_ssn_pattern()
    test_is_phi_test_file()
    test_audit_passed_with_clean_app()
    test_audit_detection_in_regular_file()
    print("All tests passed successfully!")