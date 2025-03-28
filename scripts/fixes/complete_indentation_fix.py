#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix all indentation issues in run_hipaa_phi_audit.py
"""

def fix_indentation():
    """Fix indentation in the entire run_hipaa_phi_audit.py file."""
    filepath = "scripts/run_hipaa_phi_audit.py"
    
    # Read the file content
    with open(filepath, 'r') as f:
        content = f.readlines()
    
    # Variables to track current context
    fixed_lines = []
    in_class = ""
    class_indent = 0
    method_indent = 4
    
    # Process each line
    for line in content:
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            fixed_lines.append("")
            continue
        
        # Detect class definition
        if stripped.startswith("class ") and stripped.endswith(":"):
            in_class = stripped.split()[1].split("(")[0].split(":")[0]
            class_indent = 0
            method_indent = 4
            fixed_lines.append(line.rstrip())
            continue
        
        # Handle method definitions within classes
        if in_class and stripped.startswith("def ") and "self" in stripped and stripped.endswith(":"):
            # Class method should be indented with 4 spaces
            fixed_lines.append(" " * method_indent + stripped + "\n")
            continue
        
        # Handle indentation inside methods
        if in_class and stripped and not stripped.startswith("class "):
            # Determine the indentation level based on context
            if "def " in stripped and stripped.endswith(":"):
                # Function declaration outside class
                fixed_lines.append(stripped + "\n")
            elif "if " in stripped or "else:" in stripped or "elif " in stripped or \
                 "for " in stripped or "while " in stripped or "try:" in stripped or \
                 "except " in stripped or "with " in stripped:
                # Control flow statements inside methods should be indented properly
                fixed_lines.append(" " * method_indent + stripped + "\n")
            else:
                # Regular code inside methods
                fixed_lines.append(" " * (method_indent + 4) + stripped + "\n")
            continue
        
        # Default case
        fixed_lines.append(line.rstrip() + "\n")
    
    # Write the fixed content back to the file
    with open(filepath, 'w') as f:
        f.writelines(fixed_lines)
    
    print(f"Successfully fixed indentation in {filepath}")
    return True

if __name__ == "__main__":
    fix_indentation()