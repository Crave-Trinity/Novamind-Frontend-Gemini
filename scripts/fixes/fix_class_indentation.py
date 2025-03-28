#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the class indentation in the PHIDetector class in run_hipaa_phi_audit.py
"""

import os
import re

def fix_indentation():
    """Fix the indentation in the PHIDetector class definition."""
    file_path = "scripts/run_hipaa_phi_audit.py"
    
    # Create a backup first
    backup_path = f"{file_path}.indent.bak"
    if not os.path.exists(backup_path):
        with open(file_path, "r", encoding="utf-8") as src:
            with open(backup_path, "w", encoding="utf-8") as dst:
                dst.write(src.read())
        print(f"✓ Created backup at {backup_path}")
    
    # Read the file
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Find the PHIDetector class and fix the indentation
    in_phi_detector = False
    for i in range(len(lines)):
        if "class PHIDetector" in lines[i]:
            in_phi_detector = True
        elif in_phi_detector and not lines[i].startswith(" ") and lines[i].strip():
            # This line should be indented
            lines[i] = "    " + lines[i]
        elif in_phi_detector and lines[i].startswith("    "):
            # We've found an already indented line, keep going
            continue
        elif in_phi_detector and not lines[i].strip():
            # Empty line, keep going
            continue
        elif in_phi_detector and lines[i].startswith("class "):
            # We've reached the next class definition, stop
            in_phi_detector = False
    
    # Write the fixed content back
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    
    print(f"✓ Fixed indentation in {file_path}")
    return True

if __name__ == "__main__":
    fix_indentation()