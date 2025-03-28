#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix indentation in run_hipaa_phi_audit.py
"""

import os
import re

def fix_indentation():
    """Fix indentation errors in the _audit_passed method."""
    filepath = "scripts/run_hipaa_phi_audit.py"
    
    # Create backup
    backup_path = f"{filepath}.bak_indent"
    with open(filepath, 'r') as src, open(backup_path, 'w') as dst:
        dst.write(src.read())
    print(f"Created backup at {backup_path}")
    
    # Read the file
    with open(filepath, 'r') as f:
        content = f.readlines()
    
    # Find the _audit_passed method and fix indentation
    in_method = False
    method_indentation = ""
    fixed_content = []
    
    for line in content:
        if re.match(r'\s*def _audit_passed\(', line):
            in_method = True
            method_indentation = re.match(r'^(\s*)', line).group(1)
            fixed_content.append(line)
        elif in_method and re.match(r'\s*"""', line):
            # Fix indentation of docstring
            docstring_line = method_indentation + "    \"\"\"Determine if the audit passed with no issues.\"\"\"\n"
            fixed_content.append(docstring_line)
            in_method = False  # We've fixed the docstring, move on
        else:
            fixed_content.append(line)
    
    # Write the fixed content back to the file
    with open(filepath, 'w') as f:
        f.writelines(fixed_content)
    
    print(f"Fixed indentation in {filepath}")
    return True

if __name__ == "__main__":
    print("Fixing indentation...")
    success = fix_indentation()
    if success:
        print("Indentation fixed! Running tests...")
    else:
        print("Fix failed.")