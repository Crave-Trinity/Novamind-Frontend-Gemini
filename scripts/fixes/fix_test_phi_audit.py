#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix for test_phi_audit.py

This script fixes the indentation error in the test_ssn_pattern_detection function
and properly adds the mock_logger parameter.
"""

import os
import re

def fix_test_file():
    """Fix the indentation error in test_phi_audit.py."""
    test_file_path = "tests/security/test_phi_audit.py"
    
    if not os.path.exists(test_file_path):
        print(f"Error: {test_file_path} not found")
        return False
    
    # Read the file content
    with open(test_file_path, "r", encoding="utf-8") as f:
        content = f.read()
        lines = content.split("\n")
    
    # Find the test_ssn_pattern_detection method
    ssn_test_line_num = None
    for i, line in enumerate(lines):
        if "def test_ssn_pattern_detection" in line:
            ssn_test_line_num = i
            break
    
    if ssn_test_line_num is None:
        print("Error: test_ssn_pattern_detection method not found")
        return False
    
    # Check indentation of the method and if patch decorator exists
    indent = ""
    for char in lines[ssn_test_line_num]:
        if char in (' ', '\t'):
            indent += char
        else:
            break
    
    # Check if patch decorator already exists
    has_patch = False
    if ssn_test_line_num > 0 and "@patch" in lines[ssn_test_line_num - 1]:
        has_patch = True
    
    # Fix the method signature correctly
    if "mock_logger" not in lines[ssn_test_line_num]:
        # Replace the existing line with the fixed version
        lines[ssn_test_line_num] = lines[ssn_test_line_num].replace(
            "def test_ssn_pattern_detection(self, temp_dir):",
            "def test_ssn_pattern_detection(self, mock_logger, temp_dir):"
        )
    
    # Add patch decorator if needed
    if not has_patch:
        patch_line = f"{indent}@patch('scripts.run_hipaa_phi_audit.logger')"
        lines.insert(ssn_test_line_num, patch_line)
    
    # Write the fixed content back
    with open(test_file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    
    print(f"✅ Fixed {test_file_path}")
    return True

if __name__ == "__main__":
    fix_test_file()