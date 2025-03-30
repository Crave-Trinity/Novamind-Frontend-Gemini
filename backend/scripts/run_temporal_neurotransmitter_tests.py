#!/usr/bin/env python
"""
Test runner for the temporal neurotransmitter system.

This script executes the complete test suite for the temporal neurotransmitter
mapping system, including unit tests, integration tests, and specific feature tests.
"""
import argparse
import os
import subprocess
import sys
from typing import List

# Add the current directory to Python path to ensure app module is findable
# This is critical to make imports like "from app.domain..." work
def ensure_app_importable():
    """Ensure the app module is importable by adding current dir to Python path."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    # Create __init__.py files if they don't exist to ensure proper module imports
    app_dir = os.path.join(current_dir, "app")
    if not os.path.exists(os.path.join(app_dir, "__init__.py")):
        with open(os.path.join(app_dir, "__init__.py"), "w") as f:
            f.write("# Package initialization\n")
    
    # Check for critical module imports before running tests
    try:
        # Import a few key modules to verify import paths are working
        from app.domain.entities.digital_twin_enums import BrainRegion, Neurotransmitter
        print("✅ Import paths are correctly configured.")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Fixing import paths...")
        
        # Create necessary __init__.py files in subdirectories
        for root, dirs, files in os.walk(app_dir):
            for dir_name in dirs:
                init_path = os.path.join(root, dir_name, "__init__.py")
                if not os.path.exists(init_path):
                    with open(init_path, "w") as f:
                        f.write("# Package initialization\n")
        
        print("Import paths fixed. Try running tests again.")


def run_tests(test_paths: List[str], verbose: bool = False, cov: bool = True) -> int:
    """
    Run pytest on the specified test paths.
    
    Args:
        test_paths: List of test paths to run
        verbose: Whether to show verbose output
        cov: Whether to calculate coverage
        
    Returns:
        Exit code from pytest
    """
    # Ensure app module is importable
    ensure_app_importable()
    
    # Build pytest command
    command = ["python", "-m", "pytest"]
    
    # Add coverage if requested
    if cov:
        command.extend([
            "--cov=app.domain.entities",
            "--cov=app.domain.services",
            "--cov=app.application.services",
            "--cov=app.infrastructure.repositories",
            "--cov=app.api.routes",
            "--cov-report=term-missing",
        ])
    
    # Add verbose flag if requested
    if verbose:
        command.append("-v")
    
    # Add test paths
    command.extend(test_paths)
    
    # Print command for debugging
    print(f"Running: {' '.join(command)}")
    
    # Run tests
    result = subprocess.run(command)
    return result.returncode


def main():
    """Run the test suite for the temporal neurotransmitter system."""
    parser = argparse.ArgumentParser(description="Run temporal neurotransmitter tests")
    parser.add_argument("--no-cov", action="store_true", help="Disable coverage")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--unit-only", action="store_true", help="Run only unit tests")
    parser.add_argument("--integration-only", action="store_true", help="Run only integration tests")
    parser.add_argument("--specific", type=str, help="Run a specific test file")
    parser.add_argument("--fix-imports", action="store_true", help="Fix import paths by creating __init__.py files")
    args = parser.parse_args()
    
    # Fix imports if requested
    if args.fix_imports:
        ensure_app_importable()
        return 0
    
    # Define test directories
    test_dirs = []
    
    if args.specific:
        # Run a specific test file
        test_dirs = [args.specific]
    elif args.unit_only:
        # Run only unit tests
        test_dirs = [
            "app/tests/domain/entities/test_temporal_neurotransmitter.py",
            "app/tests/domain/services/test_enhanced_xgboost_service.py",
            "app/tests/application/services/test_temporal_neurotransmitter_service.py"
        ]
    elif args.integration_only:
        # Run only integration tests
        test_dirs = ["app/tests/integration/test_temporal_neurotransmitter_integration.py"]
    else:
        # Run all tests
        test_dirs = [
            "app/tests/domain/entities/test_temporal_neurotransmitter.py",
            "app/tests/domain/services/test_enhanced_xgboost_service.py",
            "app/tests/application/services/test_temporal_neurotransmitter_service.py",
            "app/tests/integration/test_temporal_neurotransmitter_integration.py"
        ]
    
    # Run tests
    exit_code = run_tests(
        test_paths=test_dirs,
        verbose=args.verbose,
        cov=not args.no_cov
    )
    
    # Return exit code
    return exit_code


if __name__ == "__main__":
    sys.exit(main())