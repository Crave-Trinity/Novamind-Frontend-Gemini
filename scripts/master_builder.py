#!/usr/bin/env python3
# master_builder.py - Main orchestrator for creating NOVAMIND project structure
# HIPAA-compliant psychiatric digital twin platform

import os
import sys
import logging
import subprocess
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("project_creation.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Project root directory 
PROJECT_ROOT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, "scripts")

logger.info(f"Starting NOVAMIND project structure creation at {datetime.now()}")
logger.info(f"Project root: {PROJECT_ROOT}")

# Scripts to execute in sequence
SCRIPTS = [
    "create_base_structure.py",  # Creates the base directory structure
    "create_domain_layer.py",    # Creates the domain layer files
    "create_application_layer.py", # Creates the application layer files
    "create_infrastructure_layer.py", # Creates the infrastructure layer files
    "create_presentation_layer.py", # Creates the presentation layer files
    "create_tests.py",           # Creates the test directory structure
    "create_config_files.py"     # Creates configuration files
]

def run_script(script_name):
    """Run a Python script and return its exit code"""
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    logger.info(f"Running {script_name}...")
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            capture_output=True,
            text=True
        )
        logger.info(f"Successfully ran {script_name}")
        logger.info(result.stdout)
        return 0
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running {script_name}: {e}")
        logger.error(f"STDOUT: {e.stdout}")
        logger.error(f"STDERR: {e.stderr}")
        return e.returncode

def main():
    """Run all scripts in sequence"""
    os.makedirs(SCRIPTS_DIR, exist_ok=True)
    
    for script in SCRIPTS:
        exit_code = run_script(script)
        if exit_code != 0:
            logger.error(f"Failed to run {script}. Aborting.")
            sys.exit(exit_code)
    
    logger.info(f"NOVAMIND project structure created successfully at {datetime.now()}")
    logger.info("The following scripts were executed:")
    for script in SCRIPTS:
        logger.info(f"  - {script}")

if __name__ == "__main__":
    main()
