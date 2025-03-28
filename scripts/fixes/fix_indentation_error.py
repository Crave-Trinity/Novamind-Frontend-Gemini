#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the indentation error in the PHIAuditor._audit_passed method.
"""
import re

def fix_indentation_error():
    """Fix the indentation error in the _audit_passed method."""
    with open("scripts/run_hipaa_phi_audit.py", "r") as f:
        content = f.read()
    
    # Fix the specific indentation error on line ~50
    pattern = r'def _audit_passed\(self\) -> bool:\n(\s+)"""Determine if the audit passed with no issues."""'
    replacement = r'def _audit_passed(self) -> bool:\n        """Determine if the audit passed with no issues."""'
    
    fixed_content = re.sub(pattern, replacement, content)
    
    with open("scripts/run_hipaa_phi_audit.py", "w") as f:
        f.write(fixed_content)
    
    print("Fixed indentation error in _audit_passed method")
    return True

if __name__ == "__main__":
    fix_indentation_error()