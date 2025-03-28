#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HIPAA Security Testing Suite - Unified Runner

This script provides a cross-platform solution for running HIPAA security tests
from either Windows or WSL2 Ubuntu 22.04 environments, with consistent reporting.

Usage:
    python hipaa_security_runner.py [options]
"""

import argparse
import asyncio
import json
import os
import platform
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

# Configure terminal colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text: str) -> None:
    """Print formatted header text"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")


def normalize_path(path: str) -> str:
    """Normalize path to consistent format regardless of platform"""
    # Convert Windows paths to WSL format if needed
    if platform.system() == "Windows" and not path.startswith("/"):
        # Convert C:\path\to\file to /mnt/c/path/to/file
        if ":" in path:
            drive, rest = path.split(":", 1)
            # Fix backslash escaping in f-string by pre-computing replaced path
            replaced_path = rest.replace('\\', '/')
            return f"/mnt/{drive.lower()}{replaced_path}"
        # Handle network paths
        elif path.startswith("\\\\"):
            return path.replace('\\', '/')
        # Handle relative paths
        else:
            return Path(path).absolute().as_posix()
    return path


def ensure_dir_exists(path: str) -> str:
    """Ensure a directory exists, create it if it doesn't"""
    path = normalize_path(path)
    os.makedirs(path, exist_ok=True)
    return path


def is_wsl() -> bool:
    """Detect if running in WSL environment"""
    if platform.system() == "Linux":
        try:
            with open('/proc/version', 'r') as f:
                return 'microsoft' in f.read().lower() or 'wsl' in f.read().lower()
        except:
            return False
    return False


def run_command(cmd: Union[List[str], str], cwd: Optional[str] = None, shell: bool = False) -> subprocess.CompletedProcess:
    """Run a command and return the result"""
    if isinstance(cmd, list) and shell:
        cmd = " ".join(cmd)
    
    print(f"{Colors.BLUE}Running: {cmd if isinstance(cmd, str) else ' '.join(cmd)}{Colors.ENDC}")
    
    try:
        return subprocess.run(
            cmd, 
            text=True, 
            capture_output=True, 
            cwd=normalize_path(cwd) if cwd else None, 
            shell=shell,
            check=False  # Don't raise exception on non-zero exit
        )
    except Exception as e:
        print(f"{Colors.RED}Command execution failed: {str(e)}{Colors.ENDC}")
        # Create a subprocess.CompletedProcess-like object with the error info
        class MockResult:
            def __init__(self, error):
                self.returncode = 1
                self.stdout = ""
                self.stderr = str(error)
        
        return MockResult(e)


def get_python_executable() -> str:
    """Get the appropriate Python executable based on the platform"""
    if platform.system() == "Windows":
        return sys.executable
    elif os.path.exists("/usr/bin/python3"):
        return "/usr/bin/python3"
    else:
        return "python3"  # Assume it's in the PATH


async def run_security_tests(output_dir: str, verbose: bool = False) -> Dict[str, Any]:
    """Run the core security tests module"""
    print_header("Running HIPAA Security Unit Tests")
    
    # Create output directory if it doesn't exist
    ensure_dir_exists(output_dir)
    
    py_exec = get_python_executable()
    cmd = [
        py_exec,
        "-m",
        "pytest",
        "tests/security",
        "--verbose" if verbose else "-q"
    ]
    
    result = run_command(cmd)
    
    # Save raw output for inspection
    log_path = os.path.join(output_dir, "security-test-output.log")
    with open(log_path, "w") as f:
        f.write(result.stdout)
        f.write("\n\n")
        f.write(result.stderr)
    
    if result.returncode != 0:
        print(f"{Colors.RED}Security tests failed with code {result.returncode}{Colors.ENDC}")
        if verbose:
            print(result.stdout)
            print(result.stderr)
    else:
        print(f"{Colors.GREEN}Security tests completed successfully{Colors.ENDC}")
    
    return {
        "success": result.returncode == 0,
        "report_path": os.path.join(output_dir, "security-report.html")
    }


def run_dependency_check(output_dir: str, verbose: bool = False) -> Dict[str, Any]:
    """Run dependency vulnerability check using pip-audit (or safety in WSL)"""
    print_header("Running Dependency Security Checks")
    
    # Create output directory if it doesn't exist
    ensure_dir_exists(output_dir)
    
    py_exec = get_python_executable()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Determine which tool to use based on environment
    if is_wsl():
        # In WSL, use safety which is more Linux-friendly
        use_safety = True
        tool_name = "safety"
        check_cmd = ["safety", "--version"]
        install_cmd = [py_exec, "-m", "pip", "install", "safety"]
    else:
        # In Windows, use pip-audit which is more Windows-friendly
        use_safety = False
        tool_name = "pip-audit"
        check_cmd = [py_exec, "-m", "pip", "show", "pip-audit"]
        install_cmd = [py_exec, "-m", "pip", "install", "pip-audit"]
    
    # Check if tool is installed
    tool_check = run_command(check_cmd, shell=False)
    
    if tool_check.returncode != 0:
        print(f"{Colors.YELLOW}{tool_name} not found, installing...{Colors.ENDC}")
        install_result = run_command(install_cmd, shell=False)
        if install_result.returncode != 0:
            print(f"{Colors.RED}Failed to install {tool_name}{Colors.ENDC}")
            if verbose:
                print(install_result.stderr)
            return {"success": False}
    
    # Run dependency check for each requirements file
    dependency_report = {"requirements": {}}
    all_success = True
    
    for req_file in ["requirements.txt", "requirements-dev.txt", "requirements-security.txt"]:
        if not os.path.exists(req_file):
            continue
            
        report_file = os.path.join(output_dir, f"dependency-check-{req_file}.json")
        
        if use_safety:
            cmd = [
                "safety", 
                "check", 
                "--json",
                "-r", 
                req_file
            ]
        else:
            cmd = [
                py_exec, 
                "-m", 
                "pip_audit", 
                "-r", 
                req_file,
                "--format", 
                "json",
                "-o",
                report_file
            ]
        
        print(f"{Colors.BLUE}Checking dependencies in {req_file}...{Colors.ENDC}")
        result = run_command(cmd, shell=False)
        
        if result.returncode != 0:
            print(f"{Colors.RED}Dependency check failed for {req_file}{Colors.ENDC}")
            if verbose:
                print(result.stderr)
            all_success = False
        else:
            print(f"{Colors.GREEN}Completed dependency check for {req_file}{Colors.ENDC}")
            
            # For safety, save the output manually as it goes to stdout
            if use_safety:
                with open(report_file, "w") as f:
                    f.write(result.stdout)
            
            # Save a human-readable summary
            if use_safety:
                summary_cmd = [
                    "safety", 
                    "check",
                    "-r", 
                    req_file
                ]
            else:
                summary_cmd = [
                    py_exec, 
                    "-m", 
                    "pip_audit", 
                    "-r", 
                    req_file
                ]
                
            summary_result = run_command(summary_cmd, shell=False)
            with open(os.path.join(output_dir, f"dependency-check-{req_file}.txt"), "w") as f:
                f.write(summary_result.stdout)
            
            dependency_report["requirements"][req_file] = report_file
    
    # Write a consolidated report
    consolidated_report = os.path.join(output_dir, f"dependency-report-{timestamp}.json")
    
    with open(consolidated_report, "w") as f:
        json.dump(dependency_report, f, indent=2)
    
    return {
        "success": all_success,
        "report_path": consolidated_report
    }


def run_static_analysis(output_dir: str, verbose: bool = False) -> Dict[str, Any]:
    """Run static security analysis using bandit"""
    print_header("Running Static Security Analysis")
    
    # Create output directory if it doesn't exist
    ensure_dir_exists(output_dir)
    
    py_exec = get_python_executable()
    
    # Check if bandit is installed
    bandit_check = run_command([py_exec, "-m", "pip", "show", "bandit"], shell=False)
    
    if bandit_check.returncode != 0:
        print(f"{Colors.YELLOW}Bandit not found, installing...{Colors.ENDC}")
        install_result = run_command([py_exec, "-m", "pip", "install", "bandit"], shell=False)
        if install_result.returncode != 0:
            print(f"{Colors.RED}Failed to install bandit{Colors.ENDC}")
            if verbose:
                print(install_result.stderr)
            return {"success": False}
    
    # Run bandit analysis
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_output = os.path.join(output_dir, f"static-analysis-{timestamp}.json")
    html_output = os.path.join(output_dir, f"static-analysis-{timestamp}.html")
    
    # First JSON report
    json_cmd = [
        py_exec,
        "-m",
        "bandit",
        "-r",
        "app",
        "-f",
        "json",
        "-o",
        json_output
    ]
    
    if verbose:
        json_cmd.append("-v")
    
    json_result = run_command(json_cmd, shell=False)
    
    # Then HTML report
    html_cmd = [
        py_exec,
        "-m",
        "bandit",
        "-r",
        "app",
        "-f",
        "html",
        "-o",
        html_output
    ]
    
    html_result = run_command(html_cmd, shell=False)
    
    if json_result.returncode != 0 or html_result.returncode != 0:
        print(f"{Colors.RED}Static analysis failed{Colors.ENDC}")
        if verbose:
            if json_result.returncode != 0:
                print(json_result.stderr)
            if html_result.returncode != 0:
                print(html_result.stderr)
        return {"success": False}
    else:
        print(f"{Colors.GREEN}Static analysis completed successfully{Colors.ENDC}")
        print(f"Reports saved to: {json_output} and {html_output}")
    
    return {
        "success": True,
        "report_paths": {
            "json": json_output,
            "html": html_output
        }
    }


def run_phi_pattern_check(output_dir: str, verbose: bool = False) -> Dict[str, Any]:
    """Run PHI pattern detection in code"""
    print_header("Running PHI Pattern Detection")
    
    # Create output directory if it doesn't exist
    ensure_dir_exists(output_dir)
    
    py_exec = get_python_executable()
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "run_security_tests.py")
    
    # Run pattern detection
    cmd = [
        py_exec,
        script_path,
        "--check-critical",
        f"--input-dir={output_dir}"
    ]
    
    if verbose:
        cmd.append("--verbose")
    
    result = run_command(cmd, shell=False)
    
    # Save output
    output_file = os.path.join(output_dir, "phi-pattern-detection.log")
    with open(output_file, "w") as f:
        f.write(result.stdout)
        f.write("\n")
        f.write(result.stderr)
    
    if result.returncode != 0:
        print(f"{Colors.YELLOW}PHI pattern detection found issues{Colors.ENDC}")
        if verbose:
            print(result.stdout)
    else:
        print(f"{Colors.GREEN}No PHI patterns detected in code{Colors.ENDC}")
    
    return {
        "success": result.returncode == 0,
        "report_path": output_file
    }


def generate_summary_report(results: Dict[str, Any], output_dir: str) -> str:
    """Generate a consolidated HIPAA security report"""
    print_header("Generating HIPAA Security Report")
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report_file = os.path.join(output_dir, "security-report.md")
    
    with open(report_file, "w") as f:
        f.write(f"# HIPAA Security Compliance Report\n\n")
        f.write(f"Generated on: {timestamp}\n\n")
        f.write(f"Platform: {platform.system()} {'(WSL)' if is_wsl() else ''}\n\n")
        
        f.write("## Security Test Results\n\n")
        security_result = results.get("security", {})
        if security_result.get("success", False):
            f.write("✅ **Security Tests**: PASSED\n\n")
        else:
            f.write("❌ **Security Tests**: FAILED\n\n")
        
        f.write("## Static Analysis Results\n\n")
        static_result = results.get("static", {})
        if static_result.get("success", False):
            f.write("✅ **Static Analysis**: PASSED\n\n")
        else:
            f.write("❌ **Static Analysis**: FAILED\n\n")
        
        f.write("## Dependency Check Results\n\n")
        dependency_result = results.get("dependency", {})
        if dependency_result.get("success", False):
            f.write("✅ **Dependency Checks**: PASSED\n\n")
        else:
            f.write("❌ **Dependency Checks**: FAILED\n\n")
        
        f.write("## PHI Pattern Detection Results\n\n")
        phi_result = results.get("phi", {})
        if phi_result.get("success", False):
            f.write("✅ **PHI Pattern Detection**: PASSED\n\n")
        else:
            f.write("❌ **PHI Pattern Detection**: FAILED\n\n")
        
        # Overall assessment
        f.write("## Overall Assessment\n\n")
        all_passed = all([
            results.get("security", {}).get("success", False),
            results.get("static", {}).get("success", False),
            results.get("dependency", {}).get("success", False),
            results.get("phi", {}).get("success", False)
        ])
        
        if all_passed:
            f.write("✅ **HIPAA Security Assessment**: COMPLIANT\n\n")
        else:
            f.write("❌ **HIPAA Security Assessment**: NON-COMPLIANT\n\n")
        
        f.write("## Report Locations\n\n")
        for key, result in results.items():
            if "report_path" in result:
                f.write(f"- **{key.title()} Report**: {result['report_path']}\n")
            elif "report_paths" in result:
                for format_type, path in result["report_paths"].items():
                    f.write(f"- **{key.title()} Report ({format_type})**: {path}\n")
        
        f.write("\n## Recommendations\n\n")
        if not all_passed:
            f.write("1. Review and fix the security test failures\n")
            f.write("2. Ensure all dependencies are updated to secure versions\n")
            f.write("3. Address any static analysis issues, especially high-severity findings\n")
            f.write("4. Re-run the security suite after fixes are applied\n")
        else:
            f.write("1. Maintain regular security testing as part of the CI/CD pipeline\n")
            f.write("2. Schedule periodic comprehensive security reviews\n")
            f.write("3. Keep dependencies updated to latest secure versions\n")
    
    # Try to convert to HTML if pandoc is available
    html_report = os.path.join(output_dir, "security-report.html")
    try:
        pandoc_result = run_command([
            "pandoc", 
            report_file, 
            "-o", 
            html_report, 
            "--self-contained", 
            "--css=https://cdn.jsdelivr.net/npm/water.css@2/out/water.css"
        ], shell=False)
        
        if pandoc_result.returncode == 0:
            print(f"{Colors.GREEN}Generated HTML report: {html_report}{Colors.ENDC}")
        else:
            print(f"{Colors.YELLOW}Could not generate HTML report with pandoc: {pandoc_result.stderr}{Colors.ENDC}")
    except:
        print(f"{Colors.YELLOW}Could not generate HTML report (pandoc not available){Colors.ENDC}")
    
    print(f"{Colors.GREEN}Generated markdown report: {report_file}{Colors.ENDC}")
    return html_report if os.path.exists(html_report) else report_file


async def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="HIPAA Security Testing Suite Runner")
    
    parser.add_argument(
        "--report-dir",
        default="security-reports",
        help="Directory to save reports"
    )
    
    parser.add_argument(
        "--skip-static",
        action="store_true",
        help="Skip static code analysis"
    )
    
    parser.add_argument(
        "--skip-dependency",
        action="store_true",
        help="Skip dependency vulnerability check"
    )

    parser.add_argument(
        "--skip-phi",
        action="store_true",
        help="Skip PHI pattern detection"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    # Print welcome message
    print(f"\n{Colors.BOLD}HIPAA Security Testing Suite Runner{Colors.ENDC}")
    print(f"Running comprehensive security tests for Novamind concierge psychiatry platform")
    print(f"Platform: {platform.system()} {platform.release()} {'(WSL)' if is_wsl() else ''}")
    print(f"Python: {sys.version.split()[0]}")
    
    # Create output directory
    ensure_dir_exists(args.report_dir)
    
    results = {}
    
    # Run security tests
    results["security"] = await run_security_tests(args.report_dir, args.verbose)
    
    # Run static analysis
    if not args.skip_static:
        results["static"] = run_static_analysis(args.report_dir, args.verbose)
    
    # Run dependency check
    if not args.skip_dependency:
        results["dependency"] = run_dependency_check(args.report_dir, args.verbose)
    
    # Run PHI pattern detection
    if not args.skip_phi:
        results["phi"] = run_phi_pattern_check(args.report_dir, args.verbose)
    
    # Generate report
    report_path = generate_summary_report(results, args.report_dir)
    
    # Print summary
    print_header("HIPAA Security Testing Summary")
    
    for key, result in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.ENDC}" if result.get("success", False) else f"{Colors.RED}FAILED{Colors.ENDC}"
        print(f"{key.title()} Tests: {status}")
    
    # Determine overall result
    overall_success = all(result.get("success", False) for result in results.values())
    
    print(f"\nOverall Result: {Colors.GREEN if overall_success else Colors.RED}{Colors.BOLD}{'PASSED' if overall_success else 'FAILED'}{Colors.ENDC}")
    print(f"Reports saved to: {args.report_dir}")
    print(f"Main report: {report_path}")
    
    # Return appropriate exit code
    return 0 if overall_success else 1


if __name__ == "__main__":
    if sys.platform == "win32":
        # Set up proper asyncio event loop policy for Windows
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    sys.exit(asyncio.run(main()))