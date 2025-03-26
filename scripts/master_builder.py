#!/usr/bin/env python3
# master_builder.py - Main orchestrator script for building the NOVAMIND
# HIPAA-compliant psychiatric digital twin platform project structure

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

# List of scripts to run in order
SCRIPTS = [
    "create_base_structure.py",
    "create_domain_layer.py",
    "create_application_layer.py",
    "create_infrastructure_layer.py",
    "create_presentation_layer.py",
    "create_tests_layer.py"
]

def run_script(script_name):
    """Run a Python script and return its success status"""
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    logger.info(f"Running script: {script_name}")
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            check=True,
            capture_output=True,
            text=True
        )
        logger.info(f"Script output: {result.stdout}")
        if result.stderr:
            logger.warning(f"Script errors: {result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Script failed: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Errors: {e.stderr}")
        return False

def main():
    """Main function to run all scripts in sequence"""
    logger.info("Starting master builder for NOVAMIND Digital Twin project")
    
    os.makedirs(SCRIPTS_DIR, exist_ok=True)
    
    success = True
    for script in SCRIPTS:
        if not run_script(script):
            logger.error(f"Failed to run {script}. Stopping build process.")
            success = False
            break
    
    if success:
        logger.info("✅ NOVAMIND Digital Twin project structure created successfully!")
        logger.info(f"Project location: {PROJECT_ROOT}")
        logger.info(f"NOVAMIND project structure created successfully at {datetime.now()}")
    else:
        logger.error("❌ NOVAMIND Digital Twin project creation failed")

if __name__ == "__main__":
    main()
