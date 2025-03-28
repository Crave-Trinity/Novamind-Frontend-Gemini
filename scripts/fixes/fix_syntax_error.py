#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the syntax error in run_hipaa_phi_audit.py
"""

import os
import re

def fix_syntax_error():
    """Fix the syntax error in run_hipaa_phi_audit.py"""
    file_path = "scripts/run_hipaa_phi_audit.py"
    
    # Create a backup first
    backup_path = f"{file_path}.syntax.bak"
    if not os.path.exists(backup_path):
        os.system(f"cp {file_path} {backup_path}")
        print(f"✓ Created backup at {backup_path}")
    
    # Read the file
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Fix the json.dump line - there's an extra ', f, indent=2)' at the end
    pattern = r'json\.dump\(report_data, f, indent=2\), f, indent=2\)'
    replacement = 'json.dump(report_data, f, indent=2)'
    
    if pattern in content:
        content = content.replace(pattern, replacement)
        print("✓ Fixed json.dump syntax error")
    else:
        modified_pattern = r'json\.dump\(report_data, f, indent=2\)(.*)'
        match = re.search(modified_pattern, content)
        if match:
            full_match = match.group(0)
            corrected = 'json.dump(report_data, f, indent=2)'
            content = content.replace(full_match, corrected)
            print("✓ Fixed json.dump syntax error using regex")
        else:
            print("⚠ Could not find the syntax error pattern")
    
    # Write the fixed content back
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"✓ Updated {file_path}")
    return True

if __name__ == "__main__":
    fix_syntax_error()