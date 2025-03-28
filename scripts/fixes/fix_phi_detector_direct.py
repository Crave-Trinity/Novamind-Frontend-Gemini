#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Directly fix the indentation issue in the PHIDetector class in run_hipaa_phi_audit.py
"""

import os
import shutil

def fix_indentation():
    filepath = "scripts/run_hipaa_phi_audit.py"
    
    # Create backup
    backup_path = f"{filepath}.bak2"
    shutil.copy2(filepath, backup_path)
    print(f"✓ Created backup at {backup_path}")
    
    # Read the file
    with open(filepath, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # Find and fix the indentation issue
    in_phi_detector_class = False
    fixed_lines = []
    
    for line in lines:
        if "class PHIDetector:" in line:
            in_phi_detector_class = True
            fixed_lines.append(line)
        elif in_phi_detector_class and line.strip() and not line.strip().startswith("def ") and not line.startswith("    "):
            # Add 4 spaces of indentation to lines inside the class
            fixed_lines.append("    " + line)
        elif in_phi_detector_class and line.strip().startswith("def "):
            # Exit the class context when we hit a new function
            in_phi_detector_class = False
            fixed_lines.append(line)
        else:
            fixed_lines.append(line)
    
    # Write the fixed content back to the file
    with open(filepath, 'w', encoding='utf-8') as file:
        file.writelines(fixed_lines)
    
    print(f"✓ Directly fixed indentation in {filepath}")

if __name__ == "__main__":
    fix_indentation()