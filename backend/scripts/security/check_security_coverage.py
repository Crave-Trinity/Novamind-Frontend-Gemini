#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Security Module Test Coverage Checker

This script runs all security module tests and reports the coverage,
focusing particularly on the HIPAA compliance aspects of the codebase.

It produces a detailed report of test coverage for security-related modules
and identifies areas that need improvement to meet the 80% coverage target.
"""

import os
import subprocess
import sys
import json
import re
from pathlib import Path
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("security_coverage.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Root directory
ROOT_DIR = Path(__file__).parents[2]
SECURITY_MODULES = [
    "app/infrastructure/security/log_sanitizer.py",
    "app/infrastructure/security/encryption.py",
    "app/infrastructure/security/jwt_service.py",
    "app/infrastructure/security/auth_middleware.py",
    "app/infrastructure/security/phi_middleware.py",
    "app/infrastructure/security/rbac/role_manager.py",
    "app/infrastructure/security/password/password_handler.py",
    "app/core/utils/phi_sanitizer.py"
]
TARGET_COVERAGE = 80

def run_tests(module_path, verbose=True):
    """
    Run pytest on a specific module and return the result
    
    Args:
        module_path: Path to the module to test
        verbose: Whether to use verbose output
        
    Returns:
        tuple: (success, output)
    """
    # Convert path to test path
    if module_path.startswith("app/"):
        test_path = f"tests/{'/'.join(module_path.split('/')[1:])}"
        test_path = test_path.replace(".py", "_test.py")
        
        # Handle special cases
        if not os.path.exists(os.path.join(ROOT_DIR, test_path)):
            test_path = test_path.replace("_test.py", ".py")
            test_dir = os.path.dirname(test_path)
            test_file = os.path.basename(test_path)
            test_name = test_file.replace(".py", "")
            test_path = f"{test_dir}/test_{test_name}.py"
    else:
        test_path = module_path
    
    if not os.path.exists(os.path.join(ROOT_DIR, test_path)):
        logger.warning(f"Test file not found for {module_path}")
        return False, f"No test file found for {module_path}"
    
    # Run pytest with coverage
    cmd = [
        "python3", "-m", "pytest", 
        test_path, 
        f"--cov={module_path}", 
        "--cov-report=term"
    ]
    
    if verbose:
        cmd.append("-v")
    
    try:
        logger.info(f"Running tests for {module_path}")
        process = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            cwd=ROOT_DIR
        )
        
        # Check if tests passed
        if process.returncode == 0:
            return True, process.stdout
        else:
            logger.error(f"Tests failed for {module_path}")
            return False, process.stderr
    except Exception as e:
        logger.error(f"Error running tests: {e}")
        return False, str(e)

def extract_coverage(output):
    """
    Extract coverage percentage from pytest output
    
    Args:
        output: pytest output
        
    Returns:
        int: Coverage percentage
    """
    # Look for coverage percentage pattern: XX% in coverage report
    match = re.search(r'TOTAL\s+\d+\s+\d+\s+(\d+)%', output)
    if match:
        return int(match.group(1))
    return 0

def generate_report(results):
    """
    Generate a report of test coverage for security modules
    
    Args:
        results: Dictionary of module to (success, coverage, output)
        
    Returns:
        str: Report content
    """
    # Calculate average coverage
    coverages = [cov for _, cov, _ in results.values() if cov > 0]
    avg_coverage = sum(coverages) / len(coverages) if coverages else 0
    
    # Create report
    report = []
    report.append("=" * 80)
    report.append(f"HIPAA Security Module Test Coverage Report ({datetime.now().strftime('%Y-%m-%d %H:%M')})")
    report.append("=" * 80)
    report.append("")
    report.append(f"Average Coverage: {avg_coverage:.2f}% (Target: {TARGET_COVERAGE}%)")
    report.append("")
    report.append("Module Coverage Details:")
    report.append("-" * 80)
    
    # Sort modules by coverage
    sorted_results = sorted(
        results.items(), 
        key=lambda x: x[1][1], 
        reverse=True
    )
    
    for module, (success, coverage, _) in sorted_results:
        status = "✅ PASS" if success else "❌ FAIL"
        coverage_status = "✅" if coverage >= TARGET_COVERAGE else "❌"
        report.append(f"{status} | {coverage_status} {coverage:3d}% | {module}")
    
    report.append("")
    report.append("Modules Needing Improvement:")
    report.append("-" * 80)
    
    improvement_needed = False
    for module, (success, coverage, _) in sorted_results:
        if coverage < TARGET_COVERAGE:
            improvement_needed = True
            report.append(f"- {module}: {coverage}% coverage (need +{TARGET_COVERAGE - coverage}%)")
    
    if not improvement_needed:
        report.append("All modules meet or exceed the target coverage level!")
    
    return "\n".join(report)

def save_report(report, results=None, html=False):
    """
    Save the report to a file
    
    Args:
        report: Report content
        results: Dictionary of test results
        html: Whether to save as HTML
    """
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_dir = ROOT_DIR / "security-reports"
    
    # Create directory if it doesn't exist
    if not report_dir.exists():
        report_dir.mkdir(parents=True)
    
    # Save text report
    report_path = report_dir / f"security_coverage_{date_str}.txt"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    logger.info(f"Report saved to {report_path}")
    # Save HTML report if requested
    if html and results is not None:
        # Calculate average coverage for HTML report
        coverages = [cov for _, cov, _ in results.values() if cov > 0]
        avg_coverage = sum(coverages) / len(coverages) if coverages else 0
        
        # Sort results by coverage
        sorted_results = sorted(
            results.items(),
            key=lambda x: x[1][1],
            reverse=True
        )
        
        html_report = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>HIPAA Security Module Test Coverage Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1 {{ color: #333366; }}
                .pass {{ color: green; }}
                .fail {{ color: red; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                tr:nth-child(even) {{ background-color: #f9f9f9; }}
                .progress-bar {{
                    background-color: #e0e0e0;
                    border-radius: 5px;
                    width: 200px;
                }}
                .progress {{
                    height: 20px;
                    border-radius: 5px;
                    text-align: center;
                    color: white;
                    font-weight: bold;
                }}
            </style>
        </head>
        <body>
            <h1>HIPAA Security Module Test Coverage Report</h1>
            <p><strong>Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
            <p><strong>Average Coverage:</strong> {avg_coverage:.2f}% (Target: {TARGET_COVERAGE}%)</p>
            
            <h2>Module Coverage Details</h2>
            <table>
                <tr>
                    <th>Status</th>
                    <th>Module</th>
                    <th>Coverage</th>
                    <th>Progress</th>
                </tr>
        """
        """
        
        for module, (success, coverage, _) in sorted_results:
            status_class = "pass" if success else "fail"
            status_symbol = "✅" if success else "❌"
            progress_color = "#4CAF50" if coverage >= TARGET_COVERAGE else "#FF9800" if coverage >= TARGET_COVERAGE * 0.7 else "#F44336"
            
            html_report += f"""
                <tr>
                    <td class="{status_class}">{status_symbol}</td>
                    <td>{module}</td>
                    <td>{coverage}%</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress" style="width: {min(coverage, 100)}%; background-color: {progress_color};">
                                {coverage}%
                            </div>
                        </div>
                    </td>
                </tr>
            """
        
        html_report += """
            </table>
            
            <h2>Modules Needing Improvement</h2>
            <ul>
        """
        
        improvement_needed = False
        for module, (success, coverage, _) in sorted_results:
            if coverage < TARGET_COVERAGE:
                improvement_needed = True
                html_report += f"<li>{module}: {coverage}% coverage (need +{TARGET_COVERAGE - coverage}%)</li>"
        
        if not improvement_needed:
            html_report += "<li>All modules meet or exceed the target coverage level!</li>"
        
        html_report += """
            </ul>
        </body>
        </html>
        """
        
        html_path = report_dir / f"security_coverage_{date_str}.html"
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_report)
        
        logger.info(f"HTML report saved to {html_path}")

def main():
    """Main function"""
    logger.info("Starting security coverage check")
    
    # Check if modules exist
    modules_to_test = []
    for module in SECURITY_MODULES:
        if os.path.exists(os.path.join(ROOT_DIR, module)):
            modules_to_test.append(module)
        else:
            logger.warning(f"Module {module} not found, skipping")
    
    if not modules_to_test:
        logger.error("No security modules found!")
        return
    
    # Run tests for each module
    results = {}
    for module in modules_to_test:
        success, output = run_tests(module)
        coverage = extract_coverage(output)
        results[module] = (success, coverage, output)
        
        # Log results
        logger.info(f"Module {module}: {'PASS' if success else 'FAIL'} with {coverage}% coverage")
    
    # Generate and save report
    report = generate_report(results)
    save_report(report, results=results, html=True)
    
    # Print report to console
    print(report)
    
    # Check if any module fails to meet the target
    failing_modules = [(m, c) for m, (_, c, _) in results.items() if c < TARGET_COVERAGE]
    if failing_modules:
        logger.warning(f"{len(failing_modules)} modules do not meet the {TARGET_COVERAGE}% coverage target")
        for module, coverage in failing_modules:
            logger.warning(f"  - {module}: {coverage}%")
    else:
        logger.info(f"All modules meet the {TARGET_COVERAGE}% coverage target!")
    
    return results

if __name__ == "__main__":
    main()