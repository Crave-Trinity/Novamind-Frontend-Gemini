#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unified Test Runner for Novamind Backend

This script provides a consolidated, cross-platform test runner that can:
1. Run all tests or specific test categories
2. Generate coverage reports
3. Focus on specific application layers (domain, application, infrastructure, api)
4. Run tests with different verbosity levels

Usage:
    python scripts/unified_test_runner.py [options]

Options:
    --layer LAYER         Run tests for a specific layer (domain, application, infrastructure, api, integration)
    --module MODULE       Run tests for a specific module (e.g., temporal_neurotransmitter)
    --coverage            Generate coverage report
    --report-dir DIR      Directory to store reports (default: ./coverage-reports)
    --verbose, -v         Increase verbosity (can be used multiple times)
    --quiet               Minimize output
    --junit               Generate JUnit XML report
    --html                Generate HTML report
"""

import os
import sys
import argparse
import subprocess
import platform
import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any


# Constants
DEFAULT_REPORT_DIR = "./coverage-reports"
TEST_DIR = "app/tests"
TIMESTAMP = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")


def setup_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Unified Test Runner for Novamind Backend")
    
    parser.add_argument("--layer", 
                      choices=["domain", "application", "infrastructure", "api", "integration", "all"],
                      default="all",
                      help="Run tests for a specific layer")
    
    parser.add_argument("--module", 
                      help="Run tests for a specific module (e.g., temporal_neurotransmitter)")
    
    parser.add_argument("--coverage", action="store_true", 
                      help="Generate coverage report")
    
    parser.add_argument("--report-dir", default=DEFAULT_REPORT_DIR, 
                      help=f"Directory to store reports (default: {DEFAULT_REPORT_DIR})")
    
    parser.add_argument("--verbose", "-v", action="count", default=0,
                      help="Increase verbosity (can be used multiple times)")
    
    parser.add_argument("--quiet", action="store_true",
                      help="Minimize output")
    
    parser.add_argument("--junit", action="store_true",
                      help="Generate JUnit XML report")
    
    parser.add_argument("--html", action="store_true",
                      help="Generate HTML report")
    
    return parser.parse_args()


def ensure_directory(path: str) -> str:
    """Ensure directory exists, creating it if necessary."""
    os.makedirs(path, exist_ok=True)
    return path


def build_pytest_command(args: argparse.Namespace) -> List[str]:
    """Build the pytest command based on the provided arguments."""
    cmd = ["python", "-m", "pytest"]
    
    # Determine test path based on layer and module
    if args.layer != "all":
        test_path = os.path.join(TEST_DIR, args.layer)
    else:
        test_path = TEST_DIR
    
    # Add module filter if specified
    if args.module:
        module_pattern = f"*{args.module}*"
        cmd.extend(["-k", module_pattern])
    
    # Add test path
    cmd.append(test_path)
    
    # Set verbosity
    if args.quiet:
        cmd.append("-q")
    elif args.verbose > 0:
        cmd.extend(["-" + "v" * args.verbose])
    
    # Add coverage options
    if args.coverage:
        cmd.extend(["--cov=app", "--cov-report=term"])
        
        # Ensure report directory exists
        ensure_directory(args.report_dir)
        
        # Add HTML coverage report
        if args.html:
            html_dir = os.path.join(args.report_dir, f"html-{TIMESTAMP}")
            ensure_directory(html_dir)
            cmd.extend([f"--cov-report=html:{html_dir}"])
        
        # Add XML coverage report
        xml_report = os.path.join(args.report_dir, f"coverage-{TIMESTAMP}.xml")
        cmd.extend([f"--cov-report=xml:{xml_report}"])
    
    # Add JUnit XML report
    if args.junit:
        ensure_directory(args.report_dir)
        junit_report = os.path.join(args.report_dir, f"junit-{TIMESTAMP}.xml")
        cmd.extend(["--junitxml", junit_report])
    
    return cmd


def run_tests(cmd: List[str], verbose: int = 0) -> bool:
    """Run tests using the provided command."""
    if verbose > 0:
        print(f"Running command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=(verbose == 0))
        return result.returncode == 0
    except Exception as e:
        print(f"Error running tests: {e}")
        return False


def print_header(title: str, width: int = 80) -> None:
    """Print a formatted header."""
    print("=" * width)
    print(title.center(width))
    print("=" * width)


def print_section(title: str, width: int = 80) -> None:
    """Print a formatted section header."""
    print("\n" + "-" * width)
    print(title)
    print("-" * width)


def print_system_info() -> None:
    """Print system information."""
    print_section("System Information")
    print(f"Python Version: {platform.python_version()}")
    print(f"Platform: {platform.platform()}")
    print(f"Timestamp: {datetime.datetime.now().isoformat()}")


def print_test_summary(success: bool, args: argparse.Namespace) -> None:
    """Print a summary of the test run."""
    print_section("Test Summary")
    
    status = "PASSED" if success else "FAILED"
    print(f"Status: {status}")
    
    if args.layer != "all":
        print(f"Layer: {args.layer}")
    
    if args.module:
        print(f"Module: {args.module}")
    
    if args.coverage:
        print(f"Coverage Report: {args.report_dir}")
    
    if args.junit:
        print(f"JUnit Report: {args.report_dir}")


def run_temporal_neurotransmitter_tests(args: argparse.Namespace) -> bool:
    """Run tests specifically for the temporal neurotransmitter module."""
    # Override args for temporal neurotransmitter tests
    args.module = "temporal_neurotransmitter"
    
    print_header("Running Temporal Neurotransmitter Tests")
    cmd = build_pytest_command(args)
    return run_tests(cmd, args.verbose)


def main() -> int:
    """Main entry point for the script."""
    args = setup_args()
    
    # Special case: if no module is specified but the script filename indicates 
    # temporal neurotransmitter, use that as the default module
    script_name = os.path.basename(sys.argv[0])
    if "temporal_neurotransmitter" in script_name and args.module is None:
        return 0 if run_temporal_neurotransmitter_tests(args) else 1
    
    print_header("NOVAMIND UNIFIED TEST RUNNER")
    print_system_info()
    
    print_section("Test Configuration")
    print(f"Layer: {args.layer}")
    if args.module:
        print(f"Module: {args.module}")
    print(f"Coverage: {'Yes' if args.coverage else 'No'}")
    print(f"Report Directory: {args.report_dir if args.coverage or args.junit else 'N/A'}")
    print(f"Verbosity: {args.verbose}")
    
    cmd = build_pytest_command(args)
    success = run_tests(cmd, args.verbose)
    
    print_test_summary(success, args)
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())