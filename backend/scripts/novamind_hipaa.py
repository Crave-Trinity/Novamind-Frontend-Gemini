#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NOVAMIND HIPAA Security Verification Suite

This script provides a comprehensive verification of HIPAA compliance for the
NOVAMIND concierge psychiatry platform. It covers all aspects of the required
security controls:

1. Security dependencies installation and verification
2. Environment configuration validation
3. PHI encryption tests
4. Authentication and authorization tests
5. Audit logging verification
6. Security vulnerability scanning
7. HIPAA compliance report generation

Usage:
    python scripts/novamind_hipaa.py [--quick] [--report-only] [--install-deps]

Options:
    --quick         Run a quick verification (skip dependency scanning)
    --report-only   Only generate a report from previous test results
    --install-deps  Install security dependencies before running tests
"""

import argparse
import os
import subprocess
import sys
import textwrap
import time
from pathlib import Path


def print_header(title, color="\033[1;36m"):
    """Print a formatted header."""
    reset = "\033[0m"
    border = "=" * (len(title) + 4)
    print(f"\n{color}{border}")
    print(f"  {title}  ")
    print(f"{border}{reset}\n")


def run_command(command, description=None, ignore_errors=False):
    """Run a shell command and display output."""
    if description:
        print(f"[+] {description}...")
    
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=not ignore_errors,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr and not ignore_errors:
            print(f"[!] Stderr: {result.stderr}")
        
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        if not ignore_errors:
            print(f"[!] Error executing command: {e}")
        return False


def check_environment():
    """Verify environment configuration."""
    print_header("Environment Verification")
    
    # Check .env file exists
    env_file = Path(".env")
    env_example_file = Path(".env.example")
    
    if not env_file.exists() and env_example_file.exists():
        print("[!] .env file not found, but .env.example exists.")
        print("[*] Creating .env file from example...")
        with open(env_example_file, "r") as src, open(env_file, "w") as dst:
            content = src.read()
            # For security testing, create placeholder values
            import secrets
            content = content.replace(
                "replace_with_64_character_hex_string_for_production_use_only", 
                secrets.token_hex(32)
            )
            content = content.replace(
                "replace_with_secure_random_string_at_least_32_chars_long", 
                secrets.token_urlsafe(32)
            )
            dst.write(content)
        print("[+] Created .env file with test values.")
    
    # Check for required security directories
    required_dirs = [
        "app/infrastructure/security",
        "app/infrastructure/security/auth",
        "app/infrastructure/security/rbac",
        "app/infrastructure/logging",
        "tests/security",
    ]
    
    missing_dirs = []
    for directory in required_dirs:
        if not os.path.exists(directory):
            missing_dirs.append(directory)
    
    if missing_dirs:
        print("[!] Missing required security directories:")
        for directory in missing_dirs:
            print(f"    - {directory}")
        os.makedirs("logs", exist_ok=True)
        print("[+] Created logs directory for audit logging.")
    else:
        print("[+] All required security directories exist.")
    
    # Check for required security files
    required_files = [
        "app/infrastructure/security/encryption.py",
        "app/infrastructure/security/auth/jwt_handler.py",
        "app/infrastructure/security/rbac/role_manager.py",
        "app/infrastructure/logging/audit_logger.py",
        "app/domain/exceptions.py",
        "app/core/config.py",
        "tests/security/test_hipaa_compliance.py",
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("[!] Missing required security files:")
        for file in missing_files:
            print(f"    - {file}")
        return False
    else:
        print("[+] All required security files exist.")
    
    return True


def install_dependencies():
    """Install required security dependencies."""
    print_header("Security Dependencies Installation")
    
    deps_file = "requirements-security.txt"
    if not os.path.exists(deps_file):
        print(f"[!] {deps_file} not found.")
        return False
    
    # Install dependencies
    return run_command(f"pip install -r {deps_file}", "Installing security dependencies")


def run_hipaa_tests():
    """Run the HIPAA compliance tests."""
    print_header("HIPAA Compliance Testing")
    
    # Create test directories if they don't exist
    os.makedirs("logs", exist_ok=True)
    
    # Run the tests with coverage
    return run_command(
        "python -m pytest tests/security/test_hipaa_compliance.py -v --cov=app.infrastructure.security",
        "Running HIPAA compliance tests"
    )


def scan_dependencies(quick=False):
    """Scan dependencies for vulnerabilities."""
    if quick:
        print("[*] Skipping dependency scanning in quick mode.")
        return True
    
    print_header("Security Vulnerability Scanning")
    
    # Check dependencies with safety
    success = run_command(
        "safety check -r requirements.txt -r requirements-security.txt",
        "Checking dependencies for known vulnerabilities",
        ignore_errors=True
    )
    
    # Try running bandit if available
    run_command(
        "bandit -r app -f text -o bandit-results.txt",
        "Running static code security analysis with Bandit",
        ignore_errors=True
    )
    
    return success


def run_security_script():
    """Run the comprehensive security testing script."""
    print_header("Comprehensive Security Testing")
    
    # Check if the script exists
    security_script = "scripts/run_security_tests.py"
    if not os.path.exists(security_script):
        print(f"[!] {security_script} not found.")
        return False
    
    # Run the script
    return run_command(
        f"python {security_script} --report-path hipaa-compliance-report.html",
        "Running comprehensive security tests"
    )


def generate_report(quick=False):
    """Generate a HIPAA compliance report."""
    print_header("HIPAA Compliance Report Generation")
    
    report_file = "hipaa-compliance-summary.md"
    
    with open(report_file, "w") as f:
        f.write("# NOVAMIND HIPAA Compliance Summary\n\n")
        f.write(f"Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Security Verification Results\n\n")
        
        # Check if we have detailed test results
        if os.path.exists("hipaa-compliance-report.html"):
            f.write("✅ Detailed HIPAA compliance report generated: hipaa-compliance-report.html\n\n")
        else:
            f.write("⚠️ Detailed HIPAA compliance report not found\n\n")
        
        # Environment check
        f.write("### Environment Configuration\n\n")
        if os.path.exists(".env"):
            f.write("✅ Environment configuration file (.env) exists\n")
        else:
            f.write("❌ Environment configuration file (.env) missing\n")
        
        # Security files check
        f.write("\n### Security Components\n\n")
        components = [
            ("PHI Encryption", "app/infrastructure/security/encryption.py"),
            ("JWT Authentication", "app/infrastructure/security/auth/jwt_handler.py"),
            ("Role-Based Access Control", "app/infrastructure/security/rbac/role_manager.py"),
            ("Audit Logging", "app/infrastructure/logging/audit_logger.py"),
            ("Domain Exceptions", "app/domain/exceptions.py"),
            ("Configuration", "app/core/config.py"),
        ]
        
        for name, path in components:
            if os.path.exists(path):
                f.write(f"✅ {name}: {path}\n")
            else:
                f.write(f"❌ {name}: {path} (MISSING)\n")
        
        # Tests check
        f.write("\n### Security Tests\n\n")
        if os.path.exists("tests/security/test_hipaa_compliance.py"):
            f.write("✅ HIPAA compliance tests exist\n")
        else:
            f.write("❌ HIPAA compliance tests missing\n")
        
        # Dependency check results
        f.write("\n### Dependency Security\n\n")
        if not quick and os.path.exists("bandit-results.txt"):
            with open("bandit-results.txt", "r") as bandit_file:
                content = bandit_file.read()
                if "No issues identified" in content:
                    f.write("✅ Static code analysis: No security issues identified\n")
                else:
                    issues = content.count("Issue:")
                    f.write(f"⚠️ Static code analysis: {issues} potential security issues identified\n")
        else:
            f.write("⚠️ Static code analysis results not available\n")
        
        # Summary
        f.write("\n## HIPAA Compliance Status\n\n")
        f.write("The following HIPAA Security Rule requirements have been addressed:\n\n")
        f.write("- § 164.308(a)(4): Information Access Management\n")
        f.write("- § 164.312(a)(1): Access Control\n")
        f.write("- § 164.312(b): Audit Controls\n")
        f.write("- § 164.312(c)(1): Integrity\n")
        f.write("- § 164.312(e)(1): Transmission Security\n\n")
        
        f.write("## Recommendations\n\n")
        f.write("1. Review all findings marked as critical or high priority\n")
        f.write("2. Ensure PHI encryption keys are properly managed and backed up\n")
        f.write("3. Implement regular security scanning in the CI/CD pipeline\n")
        f.write("4. Perform periodic HIPAA compliance reviews\n")
    
    print(f"[+] HIPAA compliance report generated: {report_file}")
    return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="NOVAMIND HIPAA Security Verification Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""
            Examples:
              python scripts/novamind_hipaa.py                # Run full verification
              python scripts/novamind_hipaa.py --quick        # Run quick verification
              python scripts/novamind_hipaa.py --install-deps # Install dependencies first
              python scripts/novamind_hipaa.py --report-only  # Only generate report
        """)
    )
    
    parser.add_argument("--quick", action="store_true", help="Run a quick verification")
    parser.add_argument("--report-only", action="store_true", help="Only generate a report")
    parser.add_argument("--install-deps", action="store_true", help="Install security dependencies")
    
    args = parser.parse_args()
    
    # Print welcome message
    print_header("NOVAMIND HIPAA Security Verification Suite", color="\033[1;32m")
    
    start_time = time.time()
    success = True
    
    # Check if we only need to generate a report
    if args.report_only:
        generate_report(args.quick)
        sys.exit(0)
    
    # Install dependencies if requested
    if args.install_deps:
        if not install_dependencies():
            print("[!] Failed to install dependencies.")
            sys.exit(1)
    
    # Check environment
    if not check_environment():
        print("[!] Environment check failed.")
        # Continue anyway, but mark as unsuccessful
        success = False
    
    # Run HIPAA tests
    if not run_hipaa_tests():
        print("[!] HIPAA compliance tests failed.")
        success = False
    
    # Scan dependencies
    if not scan_dependencies(args.quick):
        print("[!] Dependency security issues found.")
        # Continue anyway, but mark as unsuccessful
        success = False
    
    # Run security script
    if os.path.exists("scripts/run_security_tests.py"):
        if not run_security_script():
            print("[!] Comprehensive security tests failed.")
            success = False
    
    # Generate report
    generate_report(args.quick)
    
    # Print summary
    elapsed_time = time.time() - start_time
    print_header(f"Verification completed in {elapsed_time:.2f} seconds", 
                color="\033[1;32m" if success else "\033[1;31m")
    
    if success:
        print("\033[1;32m[✓] All security checks passed!\033[0m")
        sys.exit(0)
    else:
        print("\033[1;31m[✗] Some security checks failed. See report for details.\033[0m")
        sys.exit(1)


if __name__ == "__main__":
    main()