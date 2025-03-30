#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Novamind Backend Codebase Cleanup Script

This script performs a comprehensive cleanup of the Novamind Backend codebase:
1. Removes redundant backup files (*.bak_*)
2. Consolidates platform-specific scripts into cross-platform versions
3. Identifies and preserves canonical tests
4. Updates README files with documentation

Usage:
    python scripts/novamind_codebase_cleanup.py [--dry-run] [--backup]

Options:
    --dry-run    Only print actions without making changes
    --backup     Create backups of deleted files in a "backup" directory
"""

import os
import sys
import shutil
import argparse
import re
import json
from pathlib import Path
from datetime import datetime

# Configuration
BACKUP_DIR = "scripts/backup"
SCRIPTS_DIR = "scripts"
TESTS_DIR = "app/tests"

# File categories
BACKUP_FILES = []
REDUNDANT_SCRIPTS = []
PLATFORM_SPECIFIC_SCRIPTS = {
    "windows": [],
    "unix": [],
    "consolidated": []
}
CANONICAL_TESTS = []
ESSENTIAL_SCRIPTS = []

def setup_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Novamind Backend Codebase Cleanup")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without making changes")
    parser.add_argument("--backup", action="store_true", help="Create backups of deleted files")
    return parser.parse_args()

def ensure_backup_dir():
    """Ensure backup directory exists."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_subdir = os.path.join(BACKUP_DIR, timestamp)
    os.makedirs(backup_subdir, exist_ok=True)
    return backup_subdir

def find_backup_files():
    """Find all backup files (*.bak_*) in the scripts directory."""
    backup_pattern = re.compile(r'.*\.bak_.*$')
    
    for root, _, files in os.walk(SCRIPTS_DIR):
        for file in files:
            if backup_pattern.match(file):
                BACKUP_FILES.append(os.path.join(root, file))
                
    print(f"Found {len(BACKUP_FILES)} backup files to remove")
    return BACKUP_FILES

def find_platform_specific_scripts():
    """Find platform-specific scripts (.bat, .sh, .ps1) and their potential counterparts."""
    # Windows: .bat, .ps1
    # Unix: .sh
    
    windows_pattern = re.compile(r'.*\.(bat|ps1)$')
    unix_pattern = re.compile(r'.*\.sh$')
    
    windows_scripts = {}
    unix_scripts = {}
    
    # Find Windows scripts
    for root, _, files in os.walk(SCRIPTS_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            
            if windows_pattern.match(file):
                base_name = os.path.splitext(file)[0]
                windows_scripts[base_name] = file_path
                PLATFORM_SPECIFIC_SCRIPTS["windows"].append(file_path)
            
            if unix_pattern.match(file):
                base_name = os.path.splitext(file)[0]
                unix_scripts[base_name] = file_path
                PLATFORM_SPECIFIC_SCRIPTS["unix"].append(file_path)
    
    # Find scripts with matching names across platforms
    for base_name in set(windows_scripts.keys()).intersection(set(unix_scripts.keys())):
        PLATFORM_SPECIFIC_SCRIPTS["consolidated"].append({
            "base_name": base_name,
            "windows": windows_scripts[base_name],
            "unix": unix_scripts[base_name]
        })
    
    print(f"Found {len(PLATFORM_SPECIFIC_SCRIPTS['windows'])} Windows scripts")
    print(f"Found {len(PLATFORM_SPECIFIC_SCRIPTS['unix'])} Unix scripts")
    print(f"Found {len(PLATFORM_SPECIFIC_SCRIPTS['consolidated'])} script pairs to consolidate")
    
    return PLATFORM_SPECIFIC_SCRIPTS

def find_canonical_tests():
    """Find canonical tests that should be preserved."""
    canonical_test_patterns = [
        # Domain layer tests
        r'app/tests/domain/entities/test_.*\.py$',
        r'app/tests/domain/services/test_.*\.py$',
        # Application layer tests
        r'app/tests/application/services/test_.*\.py$',
        # Infrastructure layer tests
        r'app/tests/infrastructure/repositories/test_.*\.py$',
        r'app/tests/infrastructure/services/test_.*\.py$',
        # Integration tests
        r'app/tests/integration/test_.*\.py$',
        # Enhanced tests
        r'app/tests/enhanced/test_.*\.py$'
    ]
    
    compiled_patterns = [re.compile(pattern) for pattern in canonical_test_patterns]
    
    for root, _, files in os.walk(TESTS_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            
            if any(pattern.match(file_path) for pattern in compiled_patterns):
                CANONICAL_TESTS.append(file_path)
    
    print(f"Found {len(CANONICAL_TESTS)} canonical test files to preserve")
    return CANONICAL_TESTS

def find_essential_scripts():
    """Find essential scripts that should be preserved."""
    essential_script_patterns = [
        # Main HIPAA scripts (consolidated versions)
        r'scripts/run_hipaa_security_suite\.py$',
        r'scripts/run_hipaa_phi_audit\.py$',
        # Main test runners
        r'scripts/run_temporal_neurotransmitter_tests\.py$',
        # Core security scripts
        r'scripts/security_scanner\.py$',
        # Configuration scripts
        r'scripts/generate_compliance_summary\.py$',
    ]
    
    compiled_patterns = [re.compile(pattern) for pattern in essential_script_patterns]
    
    for root, _, files in os.walk(SCRIPTS_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            
            if any(pattern.match(file_path) for pattern in compiled_patterns):
                ESSENTIAL_SCRIPTS.append(file_path)
    
    print(f"Found {len(ESSENTIAL_SCRIPTS)} essential scripts to preserve")
    return ESSENTIAL_SCRIPTS

def remove_backup_files(dry_run=False, backup_dir=None):
    """Remove all backup files."""
    for file_path in BACKUP_FILES:
        if backup_dir and not dry_run:
            # Preserve directory structure in backup
            rel_path = os.path.relpath(file_path, ".")
            backup_path = os.path.join(backup_dir, rel_path)
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(file_path, backup_path)
            
        if dry_run:
            print(f"Would remove backup file: {file_path}")
        else:
            print(f"Removing backup file: {file_path}")
            os.remove(file_path)

def consolidate_platform_scripts(dry_run=False, backup_dir=None):
    """Consolidate platform-specific scripts into cross-platform Python versions."""
    
    for script_pair in PLATFORM_SPECIFIC_SCRIPTS["consolidated"]:
        base_name = script_pair["base_name"]
        windows_script = script_pair["windows"]
        unix_script = script_pair["unix"]
        
        # Create new consolidated script path
        consolidated_script = os.path.join(SCRIPTS_DIR, f"{base_name}.py")
        
        if dry_run:
            print(f"Would consolidate {windows_script} and {unix_script} into {consolidated_script}")
            continue
            
        # Backup original files
        if backup_dir:
            # Windows script
            rel_path = os.path.relpath(windows_script, ".")
            backup_path = os.path.join(backup_dir, rel_path)
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(windows_script, backup_path)
            
            # Unix script
            rel_path = os.path.relpath(unix_script, ".")
            backup_path = os.path.join(backup_dir, rel_path)
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(unix_script, backup_path)
        
        # Create the consolidated Python script from template
        with open(consolidated_script, 'w') as f:
            f.write(f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
{base_name} - Cross-platform implementation

Consolidated from:
- {os.path.basename(windows_script)} (Windows)
- {os.path.basename(unix_script)} (Unix)

This script provides platform-independent functionality for {base_name}.
"""

import os
import sys
import argparse
import platform
import subprocess

def setup_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="{base_name} - Cross-platform")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    # Add more arguments as needed
    return parser.parse_args()

def is_windows():
    """Check if the current platform is Windows."""
    return platform.system().lower() == "windows"

def main():
    """Main entry point."""
    args = setup_args()
    
    print("=" * 80)
    print(f"{base_name} - Cross-platform")
    print("=" * 80)
    
    # Implement cross-platform functionality here
    # This skeleton should be updated with the actual logic from the platform-specific scripts
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
''')
        
        print(f"Created consolidated script: {consolidated_script}")
        
        # Remove original platform-specific scripts
        os.remove(windows_script)
        print(f"Removed Windows script: {windows_script}")
        
        os.remove(unix_script)
        print(f"Removed Unix script: {unix_script}")

def update_readme():
    """Update the README.md file in the scripts directory."""
    readme_path = os.path.join(SCRIPTS_DIR, "README.md")
    
    content = f'''# Novamind Backend Scripts

This directory contains utility scripts for the Novamind Backend project.

## Core Scripts

| Script | Purpose |
|--------|---------|
| run_hipaa_security_suite.py | Unified security test suite that performs static analysis, dependency checks, and PHI pattern detection |
| run_hipaa_phi_audit.py | Comprehensive PHI audit tool that scans for protected health information in the codebase |
| run_temporal_neurotransmitter_tests.py | Runs tests for the temporal neurotransmitter components |
| security_scanner.py | Core security scanning functionality |
| generate_compliance_summary.py | Generates compliance reports and summaries |

## Usage Guidelines

1. **HIPAA Security**: To run a complete security audit:
   ```
   python scripts/run_hipaa_security_suite.py
   ```

2. **PHI Audit**: To check for protected health information:
   ```
   python scripts/run_hipaa_phi_audit.py --dir app/
   ```

3. **Tests**: To run specific test suites:
   ```
   python scripts/run_temporal_neurotransmitter_tests.py
   ```

## Directory Structure

- `/scripts` - Main scripts directory
- `/scripts/security` - Security-specific utilities
- `/scripts/fixes` - Fixes for known issues
- `/scripts/tests` - Test-related utilities

## Notes

All scripts are designed to be cross-platform and can be run on both Windows and Unix-based systems.
'''
    
    with open(readme_path, 'w') as f:
        f.write(content)
    
    print(f"Updated README: {readme_path}")

def generate_report(dry_run=False):
    """Generate a JSON report of the cleanup actions taken."""
    report = {
        "timestamp": datetime.now().isoformat(),
        "dry_run": dry_run,
        "actions": {
            "backup_files_removed": [os.path.basename(f) for f in BACKUP_FILES],
            "platform_scripts_consolidated": [
                {
                    "base_name": pair["base_name"],
                    "windows": os.path.basename(pair["windows"]),
                    "unix": os.path.basename(pair["unix"]),
                    "consolidated": f"{pair['base_name']}.py"
                }
                for pair in PLATFORM_SPECIFIC_SCRIPTS["consolidated"]
            ],
            "canonical_tests": [os.path.basename(f) for f in CANONICAL_TESTS],
            "essential_scripts": [os.path.basename(f) for f in ESSENTIAL_SCRIPTS]
        }
    }
    
    report_path = os.path.join(SCRIPTS_DIR, "cleanup_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Generated report: {report_path}")
    return report_path

def main():
    """Main entry point for the script."""
    args = setup_args()
    
    print("=" * 80)
    print("NOVAMIND BACKEND CODEBASE CLEANUP")
    print("=" * 80)
    print(f"Dry run: {'yes' if args.dry_run else 'no'}")
    print(f"Create backups: {'yes' if args.backup else 'no'}")
    print("=" * 80)
    
    # Set up backup directory if needed
    backup_dir = None
    if args.backup:
        backup_dir = ensure_backup_dir()
        print(f"Backup directory: {backup_dir}")
    
    # Find files to process
    find_backup_files()
    find_platform_specific_scripts()
    find_canonical_tests()
    find_essential_scripts()
    
    # Process files
    remove_backup_files(args.dry_run, backup_dir)
    consolidate_platform_scripts(args.dry_run, backup_dir)
    
    # Update documentation
    if not args.dry_run:
        update_readme()
    
    # Generate report
    report_path = generate_report(args.dry_run)
    
    print("\n" + "=" * 80)
    print(f"CLEANUP {'SIMULATION' if args.dry_run else 'COMPLETE'}")
    print("=" * 80)
    print(f"Report saved to: {report_path}")
    print("=" * 80)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())