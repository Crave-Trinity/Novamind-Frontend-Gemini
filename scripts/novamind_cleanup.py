#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Novamind Canonical Codebase Cleanup

This script performs a radical cleanup of the Novamind backend codebase:
- Removes all redundant and backup scripts
- Consolidates platform-specific implementations
- Preserves only essential canonical tests and scripts
- Ensures a clean, minimal, maintainable structure

Usage:
    python scripts/novamind_cleanup.py [--dry-run] [--backup]

Options:
    --dry-run     Print actions without making changes
    --backup      Create backups of files before deletion
"""

import os
import sys
import shutil
import argparse
import datetime
from pathlib import Path
from typing import List, Dict, Set, Optional, Tuple


# Define canonical files to keep
CANONICAL_SCRIPTS = {
    "unified_hipaa_security_suite.py",
    "unified_test_runner.py",
    "secure_logger.py",
    "novamind_cleanup.py",  # This script
    "README.md"
}

# Define canonical test structure
CANONICAL_TESTS = {
    "app/tests/domain/entities/test_neurotransmitter_mapping.py",
    "app/tests/domain/entities/test_temporal_neurotransmitter.py",
    "app/tests/domain/services/test_enhanced_xgboost_service.py",
    "app/tests/application/services/test_temporal_neurotransmitter_service.py",
    "app/tests/infrastructure/repositories/test_temporal_event_repository.py",
    "app/tests/infrastructure/repositories/test_temporal_sequence_repository.py",
    "app/tests/infrastructure/services/test_mock_enhanced_digital_twin_neurotransmitter_service.py",
    "app/tests/integration/test_digital_twin_integration.py",
    "app/tests/integration/test_temporal_neurotransmitter_integration.py",
}

# Scripts/tests that are redundant but should be examined before deletion
EXAMINE_BEFORE_DELETE = {
    "scripts/run_temporal_neurotransmitter_service.py",
    "scripts/run_temporal_neurotransmitter_tests.py",
}

# Patterns to immediately delete
DELETE_PATTERNS = [
    ".bak_",  # Backup files
    "fix_",   # Fix scripts
    ".bat",   # Windows batch files
    ".sh",    # Shell scripts
    ".ps1",   # PowerShell scripts
    "setup_", # Setup scripts
    "Run-",   # More Windows scripts
]


def create_backup_dir() -> str:
    """Create a backup directory with timestamp."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)
    return backup_dir


def should_delete(file_path: str) -> bool:
    """Determine if a file should be deleted."""
    # Keep canonical scripts
    if os.path.basename(file_path) in CANONICAL_SCRIPTS:
        return False
        
    # Keep canonical tests
    if file_path in CANONICAL_TESTS:
        return False
        
    # Keep files that need manual examination
    if file_path in EXAMINE_BEFORE_DELETE:
        return False
        
    # Delete files matching patterns
    for pattern in DELETE_PATTERNS:
        if pattern in file_path:
            return True
            
    # Handle script directory
    if file_path.startswith("scripts/") and not file_path.endswith("__init__.py"):
        # Delete everything in scripts/fixes/
        if "scripts/fixes/" in file_path:
            return True
            
        # Delete everything in scripts/tests/
        if "scripts/tests/" in file_path:
            return True
            
        # Delete scripts not in canonical list
        if os.path.basename(file_path) not in CANONICAL_SCRIPTS:
            return True
            
    return False


def backup_file(file_path: str, backup_dir: str) -> None:
    """Backup a file to the backup directory."""
    # Create nested directory structure
    dest_dir = os.path.join(backup_dir, os.path.dirname(file_path))
    os.makedirs(dest_dir, exist_ok=True)
    
    # Copy file to backup directory
    dest_path = os.path.join(backup_dir, file_path)
    shutil.copy2(file_path, dest_path)


def find_files_to_delete() -> List[str]:
    """Find all files that should be deleted."""
    files_to_delete = []
    
    # Check scripts directory
    for root, _, files in os.walk("scripts"):
        for file in files:
            file_path = os.path.join(root, file)
            if should_delete(file_path):
                files_to_delete.append(file_path)
    
    # Check test directories and find non-canonical tests
    for root, _, files in os.walk("app/tests"):
        for file in files:
            if not file.endswith(".py") or file.startswith("__"):
                continue
                
            file_path = os.path.join(root, file)
            if file_path not in CANONICAL_TESTS and "/__pycache__/" not in file_path:
                files_to_delete.append(file_path)
    
    return files_to_delete


def cleanup_codebase(dry_run: bool = False, create_backup: bool = False) -> None:
    """Clean up the codebase by removing redundant files."""
    backup_dir = create_backup_dir() if create_backup else None
    files_to_delete = find_files_to_delete()
    
    print(f"Found {len(files_to_delete)} files to delete.")
    
    if not files_to_delete:
        print("No files to delete. Codebase is already clean.")
        return
        
    # Sort by directory for clear output
    files_to_delete.sort()
    
    # Process files
    for file_path in files_to_delete:
        if create_backup:
            print(f"Backing up: {file_path}")
            if not dry_run:
                backup_file(file_path, backup_dir)
                
        print(f"{'Would delete' if dry_run else 'Deleting'}: {file_path}")
        if not dry_run:
            os.remove(file_path)
    
    # Clean up empty directories
    if not dry_run:
        for root, dirs, files in os.walk("scripts", topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                if not os.listdir(dir_path) and dir_name != "__pycache__":
                    print(f"Removing empty directory: {dir_path}")
                    os.rmdir(dir_path)
    
    print(f"\nSummary:")
    print(f"- {len(files_to_delete)} files {'would be' if dry_run else 'were'} deleted")
    if create_backup:
        print(f"- Backups {'would be' if dry_run else 'were'} created in {backup_dir}")
    print("\nRetained canonical scripts:")
    for script in sorted(CANONICAL_SCRIPTS):
        print(f"- scripts/{script}")
    print("\nRetained canonical tests:")
    for test in sorted(CANONICAL_TESTS):
        print(f"- {test}")


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Novamind Canonical Codebase Cleanup")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without making changes")
    parser.add_argument("--backup", action="store_true", help="Create backups of files before deletion")
    return parser.parse_args()


def main() -> int:
    """Main entry point for the script."""
    args = parse_args()
    
    print("=" * 80)
    print("NOVAMIND CANONICAL CODEBASE CLEANUP")
    print("=" * 80)
    print("\nWARNING: This script performs aggressive cleanup of the codebase.")
    print("It will delete redundant scripts and tests while preserving only canonical files.")
    
    if args.dry_run:
        print("\nDRY RUN MODE: No files will be deleted")
    
    if args.backup:
        print("\nBACKUP MODE: Files will be backed up before deletion")
    
    try:
        cleanup_codebase(args.dry_run, args.backup)
        return 0
    except Exception as e:
        print(f"Error during cleanup: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())