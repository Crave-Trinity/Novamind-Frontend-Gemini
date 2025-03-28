#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Completely rewrite the PHIDetector class in run_hipaa_phi_audit.py with proper indentation
"""

import os
import shutil

def fix_phi_auditor_completely():
    filepath = "scripts/run_hipaa_phi_audit.py"
    
    # Create backup
    backup_path = f"{filepath}.bak3"
    shutil.copy2(filepath, backup_path)
    print(f"✓ Created backup at {backup_path}")
    
    # Read the file
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Find the PHIDetector class
    class_start = content.find("class PHIDetector:")
    if class_start == -1:
        print("❌ Could not find PHIDetector class")
        return
    
    # Extract content before the class
    pre_class_content = content[:class_start]
    
    # Find where the class ends
    next_class_or_def = content.find("\nclass ", class_start + 1)
    if next_class_or_def == -1:
        next_class_or_def = content.find("\ndef ", class_start + 1)
    
    # Extract content after the class
    post_class_content = content[next_class_or_def:]
    
    # Create a properly indented PHIDetector class
    phi_detector_class = """class PHIDetector:
    """PHI Detection class for identifying protected health information."""
    
    # Enhanced PHI patterns for better detection
    PHI_PATTERNS = [
        # SSN pattern - explicit format XXX-XX-XXXX
        r'\\b\\d{3}-\\d{2}-\\d{4}\\b',
        # SSN without dashes
        r'\\b\\d{9}\\b',
        # Email addresses
        r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
        # Phone numbers
        r'\\b\\(\\d{3}\\)\\s*\\d{3}-\\d{4}\\b',
        r'\\b\\d{3}-\\d{3}-\\d{4}\\b',
        # Credit card numbers
        r'\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11})\\b',
        # Names (common pattern in code)
        r'\\b(?:Mr\\.|Mrs\\.|Ms\\.|Dr\\.)\\s[A-Z][a-z]+ [A-Z][a-z]+\\b',
        # Patient identifiers
        r'\\bPATIENT[_-]?ID[_-]?\\d+\\b',
        r'\\bPT[_-]?ID[_-]?\\d+\\b',
        # Medical record numbers
        r'\\bMRN[_-]?\\d+\\b',
        r'\\bMEDICAL[_-]?RECORD[_-]?\\d+\\b',
    ]
    
    def __init__(self):
        """Initialize the PHI detector with detection patterns."""
        pass
    
    def detect_phi(self, content: str) -> list:
        """
        Detect PHI patterns in the content.
        
        Args:
            content: The text content to check for PHI
            
        Returns:
            List of PHI matches found
        """
        import re
        matches = []
        
        for pattern in self.PHI_PATTERNS:
            pattern_matches = re.finditer(pattern, content)
            for match in pattern_matches:
                phi_value = match.group(0)
                phi_type = self._determine_phi_type(pattern)
                position = match.start()
                matches.append(PHIMatch(phi_type, phi_value, position))
        
        return matches
    
    def _determine_phi_type(self, pattern: str) -> str:
        """Determine the type of PHI based on the pattern."""
        if "\\d{3}-\\d{2}-\\d{4}" in pattern:
            return "SSN"
        elif "\\d{9}" in pattern:
            return "SSN (no dashes)"
        elif "@" in pattern:
            return "Email"
        elif "\\d{3}-\\d{3}-\\d{4}" in pattern or "\\(\\d{3}\\)" in pattern:
            return "Phone"
        elif "4[0-9]{12}" in pattern or "5[1-5][0-9]{14}" in pattern:
            return "Credit Card"
        elif "Mr\\.|Mrs\\.|Ms\\.|Dr\\." in pattern:
            return "Name"
        elif "PATIENT" in pattern or "PT" in pattern:
            return "Patient ID"
        elif "MRN" in pattern or "MEDICAL" in pattern:
            return "Medical Record Number"
        else:
            return "Unknown PHI"
"""
    
    # Combine the parts
    fixed_content = pre_class_content + phi_detector_class + post_class_content
    
    # Write the fixed content back to the file
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(fixed_content)
    
    print(f"✓ Completely rewrote PHIDetector class in {filepath}")

if __name__ == "__main__":
    fix_phi_auditor_completely()