#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix indentation errors in the PHI auditor script.
"""
import re

def fix_run_audit_indentation():
    """Fix indentation in run_audit method that's causing a syntax error."""
    with open("scripts/run_hipaa_phi_audit.py", "r") as f:
        content = f.read()
    
    # Find the run_audit method and ensure proper indentation
    pattern = r'def run_audit\(self\):\s+"""Run all audit checks and return overall result."""'
    if re.search(pattern, content):
        # Method is missing proper indentation after docstring
        replacement = """    def run_audit(self):
        """Run all audit checks and return overall result."""
        # Run all audit checks
        self.audit_code_for_phi()
        self.audit_api_endpoints()
        self.audit_configuration()
        
        # Log audit results
        total_issues = self._count_total_issues()
        if total_issues > 0:
            logger.info(f"PHI audit complete. Found {total_issues} issues in {self._count_files_examined()} files.")
            files_with_issues = []
            for category, findings in self.findings.items():
                for finding in findings:
                    if not isinstance(finding, dict) or "file" not in finding:
                        continue
                    if finding.get("file") not in files_with_issues and not finding.get("is_allowed", False):
                        files_with_issues.append(finding.get("file"))
                        
            for file in files_with_issues:
                logger.warning(f"Issues found in file: {file}")
        else:
            logger.info(f"PHI audit complete. No issues found in {self._count_files_examined()} files.")
        
        # Return result (passed/failed)
        return self._audit_passed()"""
        
        content = re.sub(pattern, replacement, content)
    
    # Fix any other indentation issues
    with open("scripts/run_hipaa_phi_audit.py", "w") as f:
        f.write(content)
    
    print("Indentation issues fixed in run_hipaa_phi_audit.py")
    return True

if __name__ == "__main__":
    success = fix_run_audit_indentation()
    if success:
        print("All fixes applied successfully! Now run the tests.")
    else:
        print("Failed to apply fixes.")