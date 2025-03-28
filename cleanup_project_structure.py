#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Novamind Project Structure Cleanup

This script reorganizes the project structure to follow clean architecture principles,
improves maintainability, and ensures proper separation of concerns.

Key operations:
1. Create necessary directory structure
2. Move fix scripts out of root into appropriate directories
3. Organize test scripts and utilities
4. Clean up duplicate files and backup versions
"""

import os
import shutil
import re
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='project_cleanup.log',
    encoding='utf-8'
)
logger = logging.getLogger(__name__)

# Root directory of the project
ROOT_DIR = Path.cwd()

# Directory structure to create
DIRECTORIES = [
    "scripts/fixes",
    "scripts/tests",
    "scripts/utils",
    "scripts/security",
    "scripts/deployment",
    "tools/development",
    "tools/security",
    "tools/hipaa_compliance",
    "tools/maintenance",
]

# Files to exclude from moving (keep in root)
EXCLUDE_FILES = [
    ".gitignore",
    ".env.example",
    "README.md",
    "LICENSE",
    "pyproject.toml",
    "pytest.ini",
    "requirements.txt",
    "requirements-dev.txt",
    "requirements-security.txt",
    "docker-compose.yml",
    "Dockerfile",
    "main.py",
    "alembic.ini",
    ".clinerules",
    ".windsurfrules",
    ".markdownlint.json",
    ".coverage",
]
# Mapping file patterns to target directories
FILE_MAPPING = [
    # Fix scripts -> scripts/fixes
    (r"^fix_.*\.py$", "scripts/fixes"),
    (r"^.*_fix\.py$", "scripts/fixes"),
    (r"^comprehensive_fix\.py$", "scripts/fixes"),
    (r"^comprehensive_phi_fix\.py$", "scripts/fixes"),
    (r"^comprehensive_phi_audit_fix\.py$", "scripts/fixes"),
    (r"^direct_.*\.py$", "scripts/fixes"),
    (r"^enhanced_final_fix.*\.py$", "scripts/fixes"),
    (r"^final_.*_fix\.py$", "scripts/fixes"),
    (r"^ultimate_.*_fix\.py$", "scripts/fixes"),
    (r"^patch_.*\.py$", "scripts/fixes"),
    (r"^replace_.*\.py$", "scripts/fixes"),
    (r"^simple_.*_fix\.py$", "scripts/fixes"),
    (r"^targeted_fix\.py$", "scripts/fixes"),
    
    # Test runners -> scripts/tests
    (r"^run_.*_test.*\.py$", "scripts/tests"),
    (r"^run_.*\.py$", "scripts/tests"),
    (r"^test_.*\.py$", "scripts/tests"),
    (r"^.*_test_.*\.py$", "scripts/tests"),
    
    # Utilities -> tools/development
    (r"^generate_.*\.py$", "tools/development"),
    (r"^indentation_fix\.py$", "tools/development"),
    (r"^complete_indentation_fix\.py$", "tools/development"),
    
    # Security tools -> tools/security
    (r"^.*phi_audit.*\.py$", "tools/security"),
    (r"^phi_auditor.*\.py$", "tools/security"),
    (r"^.*security.*\.py$", "tools/security"),
    (r"^run_hipaa.*\.py$", "tools/security"),
    
    # Deployment -> scripts/deployment
    (r"^deploy.*\.py$", "scripts/deployment"),
    
    # Temp files -> tools/maintenance
    (r"^temp_.*\.ini$", "tools/maintenance"),
]

def create_directory_structure():
    """Create the necessary directory structure if it doesn't exist"""
    for directory in DIRECTORIES:
        dir_path = ROOT_DIR / directory
        if not dir_path.exists():
            dir_path.mkdir(parents=True)
            logger.info(f"Created directory {directory}")

def move_files():
    """Move files to their appropriate directories based on patterns"""
    root_files = [f for f in os.listdir(ROOT_DIR) if os.path.isfile(os.path.join(ROOT_DIR, f))]
    
    for file in root_files:
        # Skip excluded files
        if file in EXCLUDE_FILES or file == os.path.basename(__file__):
            continue
            
        # Find appropriate directory for the file
        target_dir = None
        for pattern, directory in FILE_MAPPING:
            if re.match(pattern, file):
                target_dir = directory
                break
                
        if target_dir:
            source = ROOT_DIR / file
            destination = ROOT_DIR / target_dir / file
            
            # Check if file already exists at destination
            if destination.exists():
                logger.warning(f"File {file} already exists at {target_dir}, skipping")
                continue
                
            try:
                shutil.move(source, destination)
                logger.info(f"Moved {file} to {target_dir}")
            except Exception as e:
                logger.error(f"Error moving {file} to {target_dir}: {e}")
        else:
            logger.warning(f"No target directory found for {file}, leaving in root")

def clean_backup_files():
    """Clean up backup files (.bak, .bak1, etc.)"""
    for root, _, files in os.walk(ROOT_DIR):
        for file in files:
            if re.match(r".*\.bak[0-9]*$", file):
                file_path = os.path.join(root, file)
                
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        logger.info(f"Removed backup file {file_path}")
                except Exception as e:
                    logger.error(f"Error removing backup file {file_path}: {e}")

def clean_empty_directories():
    """Remove empty directories"""
    for root, dirs, files in os.walk(ROOT_DIR, topdown=False):
        for directory in dirs:
            dir_path = os.path.join(root, directory)
            if not os.listdir(dir_path):
                try:
                    os.rmdir(dir_path)
                    logger.info(f"Removed empty directory {dir_path}")
                except Exception as e:
                    logger.error(f"Error removing empty directory {dir_path}: {e}")

def ensure_utf8_encoding():
    """Ensure all python files use UTF-8 encoding"""
    for root, _, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                
                try:
                    # Try to read the file to check its encoding
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check if the file has encoding declaration
                    first_line = content.split('\n', 1)[0] if content else ""
                    has_encoding = "coding: utf-8" in first_line or "coding: UTF-8" in first_line or "coding=utf-8" in first_line
                    
                    # Add encoding declaration if missing
                    if not has_encoding and content and not file_path.endswith('__init__.py'):
                        with open(file_path, 'w', encoding='utf-8') as f:
                            if content.startswith('#!/'):
                                # If it starts with shebang, add encoding on second line
                                lines = content.split('\n', 1)
                                f.write(f"{lines[0]}\n# -*- coding: utf-8 -*-\n{lines[1] if len(lines) > 1 else ''}")
                            else:
                                # Otherwise add at the top
                                f.write(f"# -*- coding: utf-8 -*-\n{content}")
                        logger.info(f"Added UTF-8 encoding declaration to {file_path}")
                
                except UnicodeDecodeError:
                    logger.warning(f"File {file_path} is not UTF-8 encoded, attempting to convert")
                    try:
                        # Try to read with latin-1 as fallback and write as UTF-8
                        with open(file_path, 'r', encoding='latin-1') as f:
                            content = f.read()
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(f"# -*- coding: utf-8 -*-\n{content}")
                        
                        logger.info(f"Successfully converted {file_path} to UTF-8")
                    except Exception as e:
                        logger.error(f"Error converting {file_path} to UTF-8: {e}")
                
                except Exception as e:
                    logger.error(f"Error processing file {file_path}: {e}")

def clean_scripts_directory():
    """Organize the scripts directory"""
    scripts_dir = ROOT_DIR / "scripts"
    if not scripts_dir.exists():
        return

    # Move backup scripts to scripts/fixes
    backup_pattern = re.compile(r".*\.bak[0-9]*$")
    
    for file in os.listdir(scripts_dir):
        file_path = scripts_dir / file
        
        if not file_path.is_file():
            continue
            
        # Move backup files to scripts/fixes
        if backup_pattern.match(file):
            target_dir = scripts_dir / "fixes"
            if not target_dir.exists():
                target_dir.mkdir(parents=True)
                
            try:
                shutil.move(file_path, target_dir / file)
                logger.info(f"Moved backup script {file} to scripts/fixes")
            except Exception as e:
                logger.error(f"Error moving backup script {file}: {e}")

def generate_readme_file():
    """Generate a README.md file explaining the project structure"""
    readme_content = """# Novamind Backend

A HIPAA-compliant concierge psychiatry platform built with clean architecture principles.

## Project Structure

```
.
├── app/                    # Main application code
│   ├── domain/             # Domain layer (pure business logic)
│   ├── application/        # Application layer (use cases)
│   ├── infrastructure/     # Infrastructure layer (external interfaces)
│   └── presentation/       # Presentation layer (API, UI)
├── scripts/                # Scripts for various operations
│   ├── fixes/              # Fix scripts for specific issues
│   ├── tests/              # Test runners
│   ├── utils/              # Utility scripts
│   ├── security/           # Security-related scripts
│   └── deployment/         # Deployment scripts
├── tools/                  # Development and maintenance tools
│   ├── development/        # Tools for development
│   ├── security/           # Security tools
│   ├── hipaa_compliance/   # HIPAA compliance tools
│   └── maintenance/        # Maintenance tools
├── tests/                  # Test suites
├── docs/                   # Documentation
├── alembic/                # Database migrations
└── venv/                   # Virtual environment
```

## Development

1. Create a virtual environment: `python -m venv venv`
2. Activate the virtual environment:
   - Windows: `venv\\Scripts\\activate`
   - Unix/MacOS: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. For development: `pip install -r requirements-dev.txt`
5. For security testing: `pip install -r requirements-security.txt`

## HIPAA Compliance

This platform is designed to be HIPAA-compliant with comprehensive security measures:

- PHI (Protected Health Information) sanitization in logs
- Secure authentication and authorization
- Encryption of sensitive data
- Audit logging
- Penetration testing

See `docs/HIPAA_COMPLIANCE_INSTRUCTIONS.md` for more details.

## Testing

Run tests with: `pytest`

For coverage report: `pytest --cov=app`

Security tests: `python scripts/security/run_hipaa_security_tests.py`
Coverage verification: `python scripts/security/check_security_coverage.py`
"""

    readme_path = ROOT_DIR / "README.md"
    # Only write if the file doesn't exist or is empty
    if not readme_path.exists() or os.path.getsize(readme_path) == 0:
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(readme_content)
        logger.info("Generated README.md file")
    else:
        logger.info("README.md already exists, skipping generation")

def main():
    """Main function to run the cleanup process"""
    logger.info("Starting project structure cleanup")
    
    create_directory_structure()
    move_files()
    clean_backup_files()
    clean_scripts_directory()
    clean_empty_directories()
    ensure_utf8_encoding()
    generate_readme_file()
    
    logger.info("Project structure cleanup completed successfully")
    print("Project structure cleanup completed successfully. See project_cleanup.log for details.")

if __name__ == "__main__":
    main()