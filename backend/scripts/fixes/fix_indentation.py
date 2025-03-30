#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix indentation in the _audit_passed method of run_hipaa_phi_audit.py
"""

import re

def fix_audit_passed_indentation():
    """Fix the indentation in the _audit_passed method."""
    file_path = "scripts/run_hipaa_phi_audit.py"
    
    # Read the file content
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find the _audit_passed method with regex
    pattern = r'def _audit_passed\(self\) -> bool:\s+"""Determine if the audit passed with no issues."""\s+(.*?)(?=\s+def)'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("Could not find the _audit_passed method.")
        return False
    
    # Get the method body and indent it properly
    method_body = match.group(1).strip()
    indented_body = ""
    for line in method_body.split('\n'):
        indented_body += "    " + line + "\n"
    
    # Replace the unindented method body with the indented one
    fixed_method = f'def _audit_passed(self) -> bool:\n    """Determine if the audit passed with no issues."""\n{indented_body}'
    fixed_content = re.sub(pattern, fixed_method, content, flags=re.DOTALL)
    
    # Write the fixed content back to the file
    with open(file_path, 'w') as f:
        f.write(fixed_content)
    
    print(f"Fixed indentation in {file_path}")
    return True

if __name__ == "__main__":
    success = fix_audit_passed_indentation()
    if success:
        print("Indentation fixed successfully! You can now run the tests.")
    else:
        print("Failed to fix indentation.")