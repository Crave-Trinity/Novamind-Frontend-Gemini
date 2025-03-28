#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the missing logger message in PHIAuditor.run_audit method.
"""

import re

def fix_missing_log():
    """Add missing log message when no issues are found."""
    file_path = "scripts/run_hipaa_phi_audit.py"
    
    try:
        # Read the file
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Make a backup
        with open(f"{file_path}.bak3", 'w') as f:
            f.write(content)
        
        # Find the run_audit method
        run_audit_pattern = r"def run_audit\(self\)(.*?)return audit_passed"
        run_audit_match = re.search(run_audit_pattern, content, re.DOTALL)
        
        if not run_audit_match:
            raise ValueError("Could not find run_audit method in file")
        
        run_audit_content = run_audit_match.group(1)
        
        # Check if there's a log message for successful audits with no issues
        if "No issues found" not in run_audit_content:
            # Add log message for successful audits with no issues
            modified_run_audit = run_audit_content.rstrip()
            
            # Find the right place to insert the log message - before the return
            # But after calculating audit_passed
            audit_passed_match = re.search(r"audit_passed\s*=\s*self\._audit_passed\(\)", modified_run_audit)
            
            if not audit_passed_match:
                raise ValueError("Could not find where audit_passed is calculated")
            
            audit_passed_pos = audit_passed_match.end()
            
            # Insert the log message after computing audit_passed
            file_count_var = "\n        file_count = sum(1 for _ in self._iter_files())"
            log_message = f"{file_count_var}\n        if audit_passed and len(self.findings.get('code_phi', [])) == 0:\n            logger.info(f\"PHI audit complete. No issues found in {{{file_count}}} files.\")"
            
            # Construct the modified run_audit method
            modified_run_audit = modified_run_audit[:audit_passed_pos] + log_message + modified_run_audit[audit_passed_pos:]
            
            # Replace the old run_audit method with the modified one
            modified_content = content.replace(run_audit_match.group(1), modified_run_audit)
            
            # Write the modified content back
            with open(file_path, 'w') as f:
                f.write(modified_content)
            
            print(f"Successfully added missing log message in {file_path}")
            return True
        else:
            print("Log message already exists in run_audit method")
            return False
    
    except Exception as e:
        print(f"Error adding missing log message: {e}")
        return False

if __name__ == "__main__":
    fix_missing_log()
    print("\nRun tests to verify the fix:")
    print("python -m pytest tests/security/test_phi_audit.py::TestPHIAudit::test_audit_with_clean_files -v -c temp_pytest.ini")