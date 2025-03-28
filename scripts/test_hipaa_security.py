#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NOVAMIND HIPAA Security Test Runner

This script performs comprehensive HIPAA security testing to validate compliance
of the NOVAMIND concierge psychiatry platform.
"""

import os
import sys
import time
import json
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from termcolor import colored


class HIPAASecurityTester:
    """
    Comprehensive HIPAA security testing framework for NOVAMIND.
    Tests encryption, PHI handling, API security, and audit logging.
    """

    def __init__(self, test_dir="tests/security", report_dir="reports"):
        """Initialize the security test runner with paths."""
        self.test_dir = Path(test_dir)
        self.report_dir = Path(report_dir)
        self.report_dir.mkdir(parents=True, exist_ok=True)
        
        self.test_results = {
            "overall": {
                "pass": 0,
                "fail": 0,
                "score": 0,
                "total": 0,
                "timestamp": datetime.now().isoformat()
            },
            "categories": {},
            "details": []
        }

    def run_all_tests(self, verbose=False):
        """Run all HIPAA security tests."""
        print(colored("\n=== NOVAMIND HIPAA SECURITY TEST SUITE ===\n", "cyan", attrs=["bold"]))
        print(colored("Running comprehensive security tests for HIPAA compliance...\n", "cyan"))
        
        # Define test categories and their weights
        categories = [
            {"name": "Encryption", "file": "test_ml_encryption.py", "weight": 0.25},
            {"name": "PHI Security", "file": "test_ml_phi_security.py", "weight": 0.30},
            {"name": "API Security", "file": "test_api_security.py", "weight": 0.25},
            {"name": "Audit Logging", "file": "test_audit_logging.py", "weight": 0.20}
        ]
        
        overall_start = time.time()
        
        for category in categories:
            category_name = category["name"]
            test_file = category["file"]
            weight = category["weight"]
            
            print(colored(f"\n[Testing {category_name}]", "blue", attrs=["bold"]))
            
            # Initialize category in results
            self.test_results["categories"][category_name] = {
                "pass": 0,
                "fail": 0,
                "score": 0,
                "weight": weight,
                "weighted_score": 0
            }
            
            # Run pytest for this category
            start_time = time.time()
            result = self._run_pytest(
                str(self.test_dir / test_file),
                verbose=verbose
            )
            duration = time.time() - start_time
            
            # Parse and store results
            pass_count, fail_count = self._parse_test_result(result)
            total = pass_count + fail_count
            
            if total > 0:
                score = (pass_count / total) * 100
            else:
                score = 0
                
            # Update category results
            self.test_results["categories"][category_name]["pass"] = pass_count
            self.test_results["categories"][category_name]["fail"] = fail_count
            self.test_results["categories"][category_name]["score"] = score
            self.test_results["categories"][category_name]["weighted_score"] = score * weight
            self.test_results["categories"][category_name]["duration"] = duration
            
            # Update overall results
            self.test_results["overall"]["pass"] += pass_count
            self.test_results["overall"]["fail"] += fail_count
            self.test_results["overall"]["total"] += total
            
            # Print category summary
            result_color = "green" if fail_count == 0 else "yellow" if fail_count <= 2 else "red"
            print(colored(f"\nCategory: {category_name}", "blue"))
            print(colored(f"Tests Passed: {pass_count}/{total} ({score:.1f}%)", result_color))
            print(colored(f"Duration: {duration:.2f} seconds", "blue"))
            print("-" * 50)
        
        # Calculate overall score
        overall_duration = time.time() - overall_start
        self.test_results["overall"]["duration"] = overall_duration
        
        if self.test_results["overall"]["total"] > 0:
            overall_score = 0
            for category_name, category_data in self.test_results["categories"].items():
                overall_score += category_data["weighted_score"]
            
            self.test_results["overall"]["score"] = overall_score
        else:
            self.test_results["overall"]["score"] = 0
        
        # Generate final report
        self._generate_report()
        
        return self.test_results

    def _run_pytest(self, test_path, verbose=False):
        """Run pytest for the specified test file and return results."""
        print(colored(f"Running: {test_path}", "blue"))
        
        # Construct pytest command
        cmd = [
            "python", "-m", "pytest", 
            test_path, 
            "-v" if verbose else "-q",
            "--cov=app.infrastructure.security", 
            "--cov-append",
            f"--cov-report=html:{self.report_dir}/coverage",
            "--cov-report=term-missing"
        ]
        
        # Run pytest
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            
            # Print verbose output if requested
            if verbose:
                print(result.stdout)
                if result.stderr:
                    print(colored(result.stderr, "red"))
            
            return result
            
        except subprocess.CalledProcessError as e:
            print(colored(f"Error running tests: {e}", "red"))
            return e

    def _parse_test_result(self, result):
        """Parse pytest result to extract pass/fail counts."""
        if not hasattr(result, "stdout") or not result.stdout:
            return 0, 0
            
        # Look for summary line like: "4 passed, 1 failed in 0.12s"
        stdout_lines = result.stdout.strip().split("\n")
        summary_line = next((line for line in reversed(stdout_lines) 
                           if "passed" in line or "failed" in line), None)
        
        if not summary_line:
            return 0, 0
            
        # Extract pass/fail counts
        pass_count = 0
        fail_count = 0
        
        if "passed" in summary_line:
            pass_parts = summary_line.split("passed")[0].strip().split()
            if pass_parts:
                try:
                    pass_count = int(pass_parts[-1])
                except ValueError:
                    pass_count = 0
        
        if "failed" in summary_line:
            fail_parts = summary_line.split("failed")[0].strip().split()
            if fail_parts:
                try:
                    fail_count = int(fail_parts[-1])
                except ValueError:
                    fail_count = 0
        
        return pass_count, fail_count

    def run_static_analysis(self):
        """Run static security analysis with bandit."""
        print(colored("\n[Running Static Security Analysis]", "blue", attrs=["bold"]))
        
        # Run bandit
        cmd = [
            "bandit", "-r", "app/", 
            "-f", "json", 
            "-o", f"{self.report_dir}/bandit-report.json"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            
            # Parse bandit results
            try:
                if result.stdout:
                    bandit_results = json.loads(result.stdout)
                elif os.path.exists(f"{self.report_dir}/bandit-report.json"):
                    with open(f"{self.report_dir}/bandit-report.json", "r") as f:
                        bandit_results = json.load(f)
                else:
                    bandit_results = {"results": []}
                
                # Count by severity
                issues = {
                    "high": 0,
                    "medium": 0,
                    "low": 0
                }
                
                for issue in bandit_results.get("results", []):
                    severity = issue.get("issue_severity", "low").lower()
                    issues[severity] += 1
                
                total_issues = sum(issues.values())
                
                # Print summary
                if total_issues == 0:
                    print(colored("No security issues found!", "green"))
                else:
                    print(colored(f"Found {total_issues} potential security issues:", "yellow"))
                    print(colored(f"  High: {issues['high']}", "red" if issues['high'] > 0 else "green"))
                    print(colored(f"  Medium: {issues['medium']}", "yellow" if issues['medium'] > 0 else "green"))
                    print(colored(f"  Low: {issues['low']}", "blue"))
                
                # Add to results
                self.test_results["static_analysis"] = {
                    "issues": issues,
                    "total": total_issues
                }
                
            except json.JSONDecodeError:
                print(colored("Error parsing bandit results", "red"))
                
        except subprocess.CalledProcessError as e:
            print(colored(f"Error running bandit: {e}", "red"))
            
        print("-" * 50)

    def run_dependency_check(self):
        """Check dependencies for security vulnerabilities."""
        print(colored("\n[Checking Dependencies for Vulnerabilities]", "blue", attrs=["bold"]))
        
        # Run pip-audit
        cmd = [
            "pip-audit",
            "-f", "json",
            "-o", f"{self.report_dir}/dependency-audit.json"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            
            # Parse pip-audit results
            try:
                if os.path.exists(f"{self.report_dir}/dependency-audit.json"):
                    with open(f"{self.report_dir}/dependency-audit.json", "r") as f:
                        audit_results = json.load(f)
                else:
                    audit_results = {"vulnerabilities": []}
                
                vulnerabilities = audit_results.get("vulnerabilities", [])
                total_vulns = len(vulnerabilities)
                
                # Print summary
                if total_vulns == 0:
                    print(colored("No vulnerable dependencies found!", "green"))
                else:
                    print(colored(f"Found {total_vulns} vulnerable dependencies:", "yellow"))
                    for vuln in vulnerabilities[:5]:  # Show top 5
                        package = vuln.get("name", "Unknown")
                        severity = vuln.get("severity", "Unknown").upper()
                        severity_color = "red" if severity == "HIGH" else "yellow" if severity == "MEDIUM" else "blue"
                        
                        print(colored(f"  {package}: {severity} severity", severity_color))
                    
                    if total_vulns > 5:
                        print(colored(f"  ...and {total_vulns - 5} more", "yellow"))
                
                # Add to results
                self.test_results["dependency_check"] = {
                    "total_vulnerabilities": total_vulns,
                    "details": vulnerabilities
                }
                
            except json.JSONDecodeError:
                print(colored("Error parsing pip-audit results", "red"))
                
        except subprocess.CalledProcessError as e:
            print(colored(f"Error running pip-audit: {e}", "red"))
            
        print("-" * 50)

    def _generate_report(self):
        """Generate comprehensive HIPAA compliance report."""
        # Calculate HIPAA compliance score
        overall_score = self.test_results["overall"]["score"]
        hipaa_score = overall_score
        
        # Adjust for static analysis
        if "static_analysis" in self.test_results:
            static_issues = self.test_results["static_analysis"]["total"]
            if static_issues > 0:
                # Reduce score based on severity
                high_issues = self.test_results["static_analysis"]["issues"]["high"]
                medium_issues = self.test_results["static_analysis"]["issues"]["medium"]
                
                penalty = (high_issues * 5) + (medium_issues * 2)
                hipaa_score = max(0, hipaa_score - penalty)
        
        # Adjust for dependency vulnerabilities
        if "dependency_check" in self.test_results:
            vuln_count = self.test_results["dependency_check"]["total_vulnerabilities"]
            if vuln_count > 0:
                # Reduce score based on number of vulnerabilities
                penalty = min(10, vuln_count * 2)
                hipaa_score = max(0, hipaa_score - penalty)
        
        # Save the HIPAA score
        self.test_results["hipaa_score"] = hipaa_score
        
        # Print overall results
        print(colored("\n=== HIPAA COMPLIANCE TEST RESULTS ===\n", "cyan", attrs=["bold"]))
        
        print(colored(f"Overall Test Result: ", "white", attrs=["bold"]), end="")
        if self.test_results["overall"]["fail"] == 0:
            print(colored("PASS", "green", attrs=["bold"]))
        else:
            print(colored("FAIL", "red", attrs=["bold"]))
        
        print(colored(f"Tests Passed: {self.test_results['overall']['pass']}/{self.test_results['overall']['total']} "
                     f"({self.test_results['overall']['score']:.1f}%)", "white"))
        
        print(colored(f"HIPAA Compliance Score: ", "white", attrs=["bold"]), end="")
        if hipaa_score >= 90:
            print(colored(f"{hipaa_score:.1f}% (EXCELLENT)", "green", attrs=["bold"]))
        elif hipaa_score >= 80:
            print(colored(f"{hipaa_score:.1f}% (GOOD)", "blue", attrs=["bold"]))
        elif hipaa_score >= 70:
            print(colored(f"{hipaa_score:.1f}% (FAIR)", "yellow", attrs=["bold"]))
        else:
            print(colored(f"{hipaa_score:.1f}% (NEEDS IMPROVEMENT)", "red", attrs=["bold"]))
        
        print(colored(f"Total Duration: {self.test_results['overall']['duration']:.2f} seconds", "white"))
        
        # Print category breakdown
        print(colored("\nCategory Breakdown:", "white", attrs=["bold"]))
        for name, data in self.test_results["categories"].items():
            score_color = "green" if data["score"] >= 90 else "blue" if data["score"] >= 80 else "yellow" if data["score"] >= 70 else "red"
            print(f"  {name}: ", end="")
            print(colored(f"{data['score']:.1f}% ({data['pass']}/{data['pass'] + data['fail']})", score_color))
        
        # Save full report to JSON
        report_path = self.report_dir / "hipaa_security_report.json"
        with open(report_path, "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        print(colored(f"\nDetailed report saved to: {report_path}", "white"))
        print(colored(f"Coverage report saved to: {self.report_dir}/coverage/index.html", "white"))
        print(colored("\nSee report files for detailed findings and recommendations.", "white"))


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="NOVAMIND HIPAA Security Test Runner")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    parser.add_argument("--skip-static", action="store_true", help="Skip static analysis")
    parser.add_argument("--skip-deps", action="store_true", help="Skip dependency checks")
    parser.add_argument("--report-dir", default="reports", help="Directory to store reports")
    parser.add_argument("--open", action="store_true", help="Open HTML report after completion")
    
    args = parser.parse_args()
    
    # Run the tests
    tester = HIPAASecurityTester(report_dir=args.report_dir)
    
    # Run dynamic tests
    tester.run_all_tests(verbose=args.verbose)
    
    # Run static analysis
    if not args.skip_static:
        tester.run_static_analysis()
    
    # Run dependency check
    if not args.skip_deps:
        tester.run_dependency_check()
    
    # Open report if requested
    if args.open and sys.platform in ["win32", "darwin"]:
        report_path = os.path.join(args.report_dir, "coverage", "index.html")
        if os.path.exists(report_path):
            if sys.platform == "win32":
                os.system(f"start {report_path}")
            elif sys.platform == "darwin":
                os.system(f"open {report_path}")


if __name__ == "__main__":
    main()