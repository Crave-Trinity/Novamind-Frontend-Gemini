#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
NOVAMIND HIPAA Compliance Testing Suite

This script runs a comprehensive set of HIPAA compliance tests on the NOVAMIND
concierge psychiatry platform. It executes dependency checks, static analysis,
and specialized security tests to ensure the platform meets HIPAA requirements.

This cross-platform script works on Windows, macOS, and Linux environments.
"""

import os
import sys
import shutil
import subprocess
import platform
import argparse
import json
import venv
from pathlib import Path
from datetime import datetime


# ANSI colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    BOLD = '\033[1m'
    ENDC = '\033[0m'

    @staticmethod
    def supports_color():
        """Check if the terminal supports color."""
        plat = platform.system()
        supported_platform = plat != 'Windows' or 'ANSICON' in os.environ
        is_a_tty = hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()
        return supported_platform and is_a_tty


def print_color(message, color):
    """Print colored messages if supported."""
    if Colors.supports_color():
        print(f"{color}{message}{Colors.ENDC}")
    else:
        print(message)


def print_banner():
    """Print the test suite banner."""
    banner = f"""
{Colors.BLUE}{Colors.BOLD}======================================================================
                NOVAMIND HIPAA COMPLIANCE TEST SUITE
      Ultra-Secure Concierge Psychiatry Platform Test Runner
======================================================================{Colors.ENDC}
"""
    print(banner)


def ensure_directories():
    """Ensure all necessary directories exist."""
    os.makedirs("reports", exist_ok=True)
    os.makedirs(os.path.join("coverage", "security"), exist_ok=True)


def check_environment():
    """Check and set up the environment."""
    if not os.path.exists(".env"):
        print_color("Warning: No .env file found. Creating temporary .env for testing...", Colors.YELLOW)
        shutil.copy(".env.example", ".env.test")
        os.environ["ENV_FILE"] = ".env.test"
    else:
        os.environ["ENV_FILE"] = ".env"


def setup_virtual_env():
    """Set up and activate virtual environment."""
    if not os.path.exists("venv"):
        print_color("Creating virtual environment...", Colors.BLUE)
        venv.create("venv", with_pip=True)
    
    # Return the path to the Python executable in the virtual environment
    if platform.system() == "Windows":
        return os.path.join("venv", "Scripts", "python.exe")
    else:
        return os.path.join("venv", "bin", "python")


def install_dependencies(venv_python):
    """Install required dependencies."""
    print_color("Installing test dependencies...", Colors.BLUE)
    subprocess.check_call([venv_python, "-m", "pip", "install", "-q", "-r", "requirements.txt", 
                          "-r", "requirements-security.txt", "-r", "requirements-dev.txt"])


def run_command(cmd, description, failure_ok=False):
    """Run a command and handle its output."""
    print_color(f"Running {description}...", Colors.PURPLE)
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0 and not failure_ok:
            print_color(f"Command failed: {' '.join(cmd)}", Colors.RED)
            print_color(f"Error: {result.stderr}", Colors.RED)
            return False
        return True
    except Exception as e:
        print_color(f"Error executing command: {e}", Colors.RED)
        return False


def run_dependency_check(venv_python):
    """Run dependency security checks."""
    print_color(f"{Colors.BOLD}{Colors.BLUE}[1/7] Running dependency security checks...{Colors.ENDC}", Colors.BLUE)
    
    # Install pip-audit if needed
    subprocess.check_call([venv_python, "-m", "pip", "install", "pip-audit"])
    
    # Run pip-audit
    run_command(
        [venv_python, "-m", "pip_audit", "-f", "json", "-o", "reports/dependency-audit.json"],
        "pip-audit security scan",
        failure_ok=True  # It's OK if vulnerabilities are found
    )


def run_static_analysis(venv_python):
    """Run static code analysis for security issues."""
    print_color(f"{Colors.BOLD}{Colors.BLUE}[2/7] Running static code analysis with bandit...{Colors.ENDC}", Colors.BLUE)
    
    # Install bandit if needed
    subprocess.check_call([venv_python, "-m", "pip", "install", "bandit"])
    
    # Run bandit
    run_command(
        [venv_python, "-m", "bandit", "-r", "app/", "-f", "json", "-o", "reports/bandit-report.json"],
        "bandit JSON report"
    )
    run_command(
        [venv_python, "-m", "bandit", "-r", "app/", "-f", "html", "-o", "reports/bandit-report.html"],
        "bandit HTML report"
    )


def run_pytest(venv_python, test_path, description, cov_paths, cov_append=False):
    """Run pytest with the specified coverage paths."""
    print_color(f"{Colors.BOLD}{Colors.BLUE}{description}{Colors.ENDC}", Colors.BLUE)
    
    cmd = [venv_python, "-m", "pytest", test_path, "-v"]
    
    # Add coverage parameters
    for path in cov_paths:
        cmd.extend(["--cov=" + path])
    
    if cov_append:
        cmd.append("--cov-append")
    
    cmd.extend(["--cov-report=term", "--cov-report=html:coverage/security/" + test_path.split("/")[-1].split(".")[0]])
    
    return run_command(cmd, f"pytest for {test_path}")


def run_security_tests(venv_python):
    """Run all the security test suites."""
    # Run encryption tests
    run_pytest(
        venv_python,
        "tests/security/test_ml_encryption.py",
        "[3/7] Running encryption tests...",
        ["app.infrastructure.security"]
    )
    
    # Run PHI handling tests
    run_pytest(
        venv_python,
        "tests/security/test_ml_phi_security.py",
        "[4/7] Running PHI handling tests...",
        ["app.infrastructure.ml"],
        cov_append=True
    )
    
    # Run API security tests
    run_pytest(
        venv_python,
        "tests/security/test_api_security.py",
        "[5/7] Running API security tests...",
        ["app.infrastructure.security", "app.presentation.api"],
        cov_append=True
    )
    
    # Run audit logging tests
    run_pytest(
        venv_python,
        "tests/security/test_audit_logging.py",
        "[6/7] Running audit logging tests...",
        ["app.infrastructure.security"],
        cov_append=True
    )


def run_comprehensive_security_test(venv_python):
    """Run the comprehensive security test script."""
    print_color(f"{Colors.BOLD}{Colors.BLUE}[7/7] Running comprehensive security tests...{Colors.ENDC}", Colors.BLUE)
    
    run_command(
        [venv_python, "scripts/test_hipaa_security.py", "--full", "--report-path=reports/full-security-report.html"],
        "comprehensive security testing"
    )


def run_final_verification(venv_python):
    """Run the final HIPAA compliance verification."""
    print_color(f"{Colors.BOLD}{Colors.BLUE}Running final HIPAA compliance verification...{Colors.ENDC}", Colors.BLUE)
    
    run_command(
        [venv_python, "scripts/verify_hipaa_compliance.py"],
        "HIPAA compliance verification"
    )


def cleanup():
    """Clean up any temporary files."""
    if os.environ.get("ENV_FILE") == ".env.test" and os.path.exists(".env.test"):
        os.remove(".env.test")


def main():
    """Main function to run the HIPAA compliance test suite."""
    parser = argparse.ArgumentParser(description="NOVAMIND HIPAA Compliance Test Suite")
    parser.add_argument("--skip-deps", action="store_true", help="Skip dependency installation")
    args = parser.parse_args()
    
    print_banner()
    ensure_directories()
    check_environment()
    
    # Setup virtual environment
    venv_python = setup_virtual_env()
    
    # Install dependencies if not skipped
    if not args.skip_deps:
        install_dependencies(venv_python)
    
    # Run security checks
    run_dependency_check(venv_python)
    run_static_analysis(venv_python)
    run_security_tests(venv_python)
    run_comprehensive_security_test(venv_python)
    run_final_verification(venv_python)
    
    # Cleanup
    cleanup()
    
    print_color(f"{Colors.BOLD}{Colors.GREEN}All HIPAA compliance tests completed!{Colors.ENDC}", Colors.GREEN)
    print_color(f"{Colors.BOLD}Test reports are available at:{Colors.ENDC}", Colors.BLUE)
    print("  - coverage/security/index.html (Coverage Report)")
    print("  - reports/full-security-report.html (Comprehensive Security Report)")
    print("  - reports/bandit-report.html (Static Analysis Report)")
    print("  - reports/dependency-audit.json (Dependency Vulnerabilities)")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())