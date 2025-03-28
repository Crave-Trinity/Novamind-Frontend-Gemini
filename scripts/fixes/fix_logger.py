#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add missing logger to run_hipaa_phi_audit.py.
"""

import re

def fix_logger():
    """Add missing logger to the file."""
    file_path = "scripts/run_hipaa_phi_audit.py"
    
    try:
        # Read the file
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Make a backup
        with open(f"{file_path}.bak2", 'w') as f:
            f.write(content)
        
        # Add logger import and initialization at the top of the file
        # Look for imports
        import_section_end = re.search(r'import.*\n\n', content)
        if import_section_end:
            pos = import_section_end.end()
            new_content = content[:pos] + "import logging\n\n# Configure logger\nlogger = logging.getLogger(__name__)\n\n" + content[pos:]
        else:
            # If we can't find the import section, just add it at the top
            new_content = "import logging\n\n# Configure logger\nlogger = logging.getLogger(__name__)\n\n" + content
        
        # Write the modified content back
        with open(file_path, 'w') as f:
            f.write(new_content)
        
        print(f"Successfully added logger to {file_path}")
        return True
    
    except Exception as e:
        print(f"Error adding logger: {e}")
        return False

if __name__ == "__main__":
    fix_logger()
    print("\nRun tests to verify the fix:")
    print("python -m pytest tests/security/test_phi_audit.py -v -c temp_pytest.ini")