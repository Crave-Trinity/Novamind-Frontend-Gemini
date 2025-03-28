#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the indentation issues in the PHIDetector class in run_hipaa_phi_audit.py
"""

import os
import re
import shutil

def fix_indentation():
    filepath = "scripts/run_hipaa_phi_audit.py"
    
    # Create backup
    backup_path = f"{filepath}.bak"
    shutil.copy2(filepath, backup_path)
    print(f"✓ Created backup at {backup_path}")
    
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix the indentation of PHI_PATTERNS inside PHIDetector class
    pattern = r'class PHIDetector:\s*\n(\s*)# Enhanced PHI patterns for better detection\s*\nPHI_PATTERNS'
    replacement = r'class PHIDetector:\n\1# Enhanced PHI patterns for better detection\n\1PHI_PATTERNS'
    
    fixed_content = re.sub(pattern, replacement, content)
    
    # Fix indentation of subsequent lines in the list
    lines = fixed_content.splitlines()
    in_phi_patterns = False
    
    for i, line in enumerate(lines):
        if "PHI_PATTERNS = [" in line and not line.startswith("    "):
            lines[i] = "    " + line
            in_phi_patterns = True
        elif in_phi_patterns and not line.strip().startswith("def "):
            if line.strip() and not line.startswith("    "):
                lines[i] = "    " + line
            else:
                in_phi_patterns = False
    
    fixed_content = "\n".join(lines)
    
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(fixed_content)
    
    print(f"✓ Fixed indentation in {filepath}")

if __name__ == "__main__":
    fix_indentation()