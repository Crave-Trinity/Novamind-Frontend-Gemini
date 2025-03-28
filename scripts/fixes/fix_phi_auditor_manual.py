#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Manually fix the PHIDetector class without string escaping issues
"""

import os
import re
import shutil

def fix_phi_auditor_manually():
    filepath = "scripts/run_hipaa_phi_audit.py"
    
    # Create backup
    backup_path = f"{filepath}.bak4"
    shutil.copy2(filepath, backup_path)
    print(f"✓ Created backup at {backup_path}")
    
    # Read the file content
    with open(filepath, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # Find the class PHIDetector line
    phi_detector_start = None
    for i, line in enumerate(lines):
        if "class PHIDetector:" in line:
            phi_detector_start = i
            break
    
    if phi_detector_start is None:
        print("❌ Could not find PHIDetector class")
        return
    
    # Replace the PHIDetector class with a fixed version
    # First, keep everything before the class
    new_content = lines[:phi_detector_start]
    
    # Add the fixed PHIDetector class
    new_content.append("class PHIDetector:\n")
    new_content.append("    \"\"\"PHI Detection class for identifying protected health information.\"\"\"\n")
    new_content.append("\n")
    new_content.append("    # Enhanced PHI patterns for better detection\n")
    new_content.append("    PHI_PATTERNS = [\n")
    new_content.append("        # SSN pattern - explicit format XXX-XX-XXXX\n")
    new_content.append("        r'\\b\\d{3}-\\d{2}-\\d{4}\\b',\n")
    new_content.append("        # SSN without dashes\n")
    new_content.append("        r'\\b\\d{9}\\b',\n")
    new_content.append("        # Email addresses\n")
    new_content.append("        r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',\n")
    new_content.append("        # Phone numbers\n")
    new_content.append("        r'\\b\\(\\d{3}\\)\\s*\\d{3}-\\d{4}\\b',\n")
    new_content.append("        r'\\b\\d{3}-\\d{3}-\\d{4}\\b',\n")
    new_content.append("        # Credit card numbers\n")
    new_content.append("        r'\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11})\\b',\n")
    new_content.append("        # Names (common pattern in code)\n")
    new_content.append("        r'\\b(?:Mr\\.|Mrs\\.|Ms\\.|Dr\\.)\\s[A-Z][a-z]+ [A-Z][a-z]+\\b',\n")
    new_content.append("        # Patient identifiers\n")
    new_content.append("        r'\\bPATIENT[_-]?ID[_-]?\\d+\\b',\n")
    new_content.append("        r'\\bPT[_-]?ID[_-]?\\d+\\b',\n")
    new_content.append("        # Medical record numbers\n")
    new_content.append("        r'\\bMRN[_-]?\\d+\\b',\n")
    new_content.append("        r'\\bMEDICAL[_-]?RECORD[_-]?\\d+\\b',\n")
    new_content.append("    ]\n")
    new_content.append("\n")
    new_content.append("    def __init__(self):\n")
    new_content.append("        \"\"\"Initialize the PHI detector with detection patterns.\"\"\"\n")
    new_content.append("        pass\n")
    new_content.append("\n")
    new_content.append("    def detect_phi(self, content: str) -> list:\n")
    new_content.append("        \"\"\"\n")
    new_content.append("        Detect PHI patterns in the content.\n")
    new_content.append("        \n")
    new_content.append("        Args:\n")
    new_content.append("            content: The text content to check for PHI\n")
    new_content.append("            \n")
    new_content.append("        Returns:\n")
    new_content.append("            List of PHI matches found\n")
    new_content.append("        \"\"\"\n")
    new_content.append("        import re\n")
    new_content.append("        matches = []\n")
    new_content.append("        \n")
    new_content.append("        for pattern in self.PHI_PATTERNS:\n")
    new_content.append("            pattern_matches = re.finditer(pattern, content)\n")
    new_content.append("            for match in pattern_matches:\n")
    new_content.append("                phi_value = match.group(0)\n")
    new_content.append("                phi_type = self._determine_phi_type(pattern)\n")
    new_content.append("                position = match.start()\n")
    new_content.append("                matches.append(PHIMatch(phi_type, phi_value, position))\n")
    new_content.append("        \n")
    new_content.append("        return matches\n")
    new_content.append("\n")
    new_content.append("    def _determine_phi_type(self, pattern: str) -> str:\n")
    new_content.append("        \"\"\"Determine the type of PHI based on the pattern.\"\"\"\n")
    new_content.append("        if \"\\d{3}-\\d{2}-\\d{4}\" in pattern:\n")
    new_content.append("            return \"SSN\"\n")
    new_content.append("        elif \"\\d{9}\" in pattern:\n")
    new_content.append("            return \"SSN (no dashes)\"\n")
    new_content.append("        elif \"@\" in pattern:\n")
    new_content.append("            return \"Email\"\n")
    new_content.append("        elif \"\\d{3}-\\d{3}-\\d{4}\" in pattern or \"\\(\\d{3}\\)\" in pattern:\n")
    new_content.append("            return \"Phone\"\n")
    new_content.append("        elif \"4[0-9]{12}\" in pattern or \"5[1-5][0-9]{14}\" in pattern:\n")
    new_content.append("            return \"Credit Card\"\n")
    new_content.append("        elif \"Mr\\.|Mrs\\.|Ms\\.|Dr\\.\" in pattern:\n")
    new_content.append("            return \"Name\"\n")
    new_content.append("        elif \"PATIENT\" in pattern or \"PT\" in pattern:\n")
    new_content.append("            return \"Patient ID\"\n")
    new_content.append("        elif \"MRN\" in pattern or \"MEDICAL\" in pattern:\n")
    new_content.append("            return \"Medical Record Number\"\n")
    new_content.append("        else:\n")
    new_content.append("            return \"Unknown PHI\"\n")
    new_content.append("\n")
    
    # Find the next class or function definition to continue with the rest of the file
    next_def_index = None
    for i in range(phi_detector_start + 1, len(lines)):
        if re.match(r'^class\s+', lines[i]) or re.match(r'^def\s+', lines[i]):
            next_def_index = i
            break
    
    if next_def_index:
        # Add the rest of the file
        new_content.extend(lines[next_def_index:])
    
    # Write the fixed content back to the file
    with open(filepath, 'w', encoding='utf-8') as file:
        file.writelines(new_content)
    
    print(f"✓ Manually fixed PHIDetector class in {filepath}")

if __name__ == "__main__":
    fix_phi_auditor_manually()