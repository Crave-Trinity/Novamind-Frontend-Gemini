#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix the missing logger message in PHIAuditor.run_audit method.
"""

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
        old_run_audit = """    def run_audit(self) -> bool:
        \"\"\"
        Run a complete PHI audit on the codebase.
        
        Returns:
            True if audit passed, False otherwise
        \"\"\"
        # Audit code for PHI
        self.audit_code_for_phi()
        
        # Audit logging for sanitization
        self.audit_logging_sanitization()
        
        # Audit API endpoints for security
        self.audit_api_endpoints()
        
        # Audit configuration
        self.audit_configuration()
        
        # Return audit result
        return self._audit_passed()"""

        # Add log message for successful audits with no issues
        new_run_audit = """    def run_audit(self) -> bool:
        \"\"\"
        Run a complete PHI audit on the codebase.
        
        Returns:
            True if audit passed, False otherwise
        \"\"\"
        # Audit code for PHI
        self.audit_code_for_phi()
        
        # Audit logging for sanitization
        self.audit_logging_sanitization()
        
        # Audit API endpoints for security
        self.audit_api_endpoints()
        
        # Audit configuration
        self.audit_configuration()
        
        # Determine audit result
        audit_passed = self._audit_passed()
        
        # Count files and log result
        file_count = len(self.files_examined)
        if audit_passed and len(self.findings.get('code_phi', [])) == 0:
            logger.info(f"PHI audit complete. No issues found in {file_count} files.")
        
        # Return audit result
        return audit_passed"""
        
        # Replace the old run_audit method with the modified one
        modified_content = content.replace(old_run_audit, new_run_audit)
        
        if modified_content == content:
            print("Warning: Could not find the run_audit method to replace")
            return False
        
        # Write the modified content back
        with open(file_path, 'w') as f:
            f.write(modified_content)
        
        print(f"Successfully added missing log message in {file_path}")
        return True
    
    except Exception as e:
        print(f"Error adding missing log message: {e}")
        return False

if __name__ == "__main__":
    fix_missing_log()
    print("\nRun tests to verify the fix:")
    print("python -m pytest tests/security/test_phi_audit.py::TestPHIAudit::test_audit_with_clean_files -v -c temp_pytest.ini")