#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
HIPAA Security Test Runner

This script runs all security-related tests in the Novamind platform,
analyzes the results, and generates a comprehensive HIPAA compliance report.

Usage:
    python security_test_runner.py [--report-dir DIRECTORY] [--verbose]
"""

import os
import sys
import json
import time
import argparse
import subprocess
import datetime
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import concurrent.futures


class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


class HIPAASecurityTestRunner:
    """
    Comprehensive HIPAA Security Test Runner
    
    This class is responsible for:
    1. Running all security-related tests for the Novamind platform
    2. Collecting and analyzing test results
    3. Generating a detailed HIPAA compliance report
    4. Providing recommendations for addressing any security issues
    """
    
    # HIPAA Security Rule requirements
    HIPAA_REQUIREMENTS = {
        "access_control": {
            "title": "Access Control",
            "description": "Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons or software programs.",
            "tests": ["test_auth_middleware.py", "test_jwt_service.py"]
        },
        "audit_controls": {
            "title": "Audit Controls",
            "description": "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI.",
            "tests": ["test_log_sanitizer.py", "test_audit_logging.py"]
        },
        "integrity": {
            "title": "Integrity",
            "description": "Implement policies and procedures to protect ePHI from improper alteration or destruction.",
            "tests": ["test_unit_of_work.py", "test_ml_encryption.py"]
        },
        "transmission_security": {
            "title": "Transmission Security",
            "description": "Implement technical security measures to guard against unauthorized access to ePHI that is being transmitted over an electronic communications network.",
            "tests": ["test_ml_encryption.py", "test_jwt_service.py"]
        },
        "person_or_entity_authentication": {
            "title": "Person or Entity Authentication",
            "description": "Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.",
            "tests": ["test_auth_middleware.py", "test_jwt_service.py"]
        }
    }
    
    def __init__(self, report_dir: str = "security-reports", verbose: bool = False, 
                 pen_test_url: Optional[str] = None):
        """Initialize the test runner.
        
        Args:
            report_dir: Directory to store test reports
            verbose: Whether to print verbose output
            pen_test_url: URL to use for penetration testing (optional)
        """
        self.report_dir = report_dir
        self.verbose = verbose
        self.pen_test_url = pen_test_url
        
        # Create report directory
        os.makedirs(report_dir, exist_ok=True)
        
        # Setup logging
        log_level = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(os.path.join(report_dir, "security_tests.log")),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("hipaa_security_tests")
        
        # Results storage
        self.results = {
            "timestamp": datetime.datetime.now().isoformat(),
            "tests": {},
            "pentest": {},
            "coverage": {},
            "compliance": {},
            "summary": {}
        }
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all security tests and generate a report.
        
        Returns:
            Dict containing test results and compliance report
        """
        print(f"\n{Colors.HEADER}{Colors.BOLD}HIPAA Security Testing Suite{Colors.ENDC}")
        print("=" * 60)
        
        # Run pytest tests
        self._run_pytest_tests()
        
        # Run penetration test if URL provided
        if self.pen_test_url:
            self._run_penetration_test()
        
        # Analyze coverage
        self._analyze_test_coverage()
        
        # Assess HIPAA compliance
        self._assess_compliance()
        
        # Generate summary
        self._generate_summary()
        
        # Save results
        self._save_results()
        
        return self.results
    
    def _run_pytest_tests(self) -> None:
        """Run all pytest security tests."""
        print(f"\n{Colors.BLUE}{Colors.BOLD}Running Unit and Integration Tests{Colors.ENDC}")
        print("-" * 60)
        
        pytest_args = [
            "pytest",
            "-xvs",  # Fail fast, verbose, no capture
            "tests/security/"
        ]
        
        if self.verbose:
            pytest_args.insert(1, "-v")
        
        try:
            print(f"Running: {' '.join(pytest_args)}")
            result = subprocess.run(
                pytest_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False  # Don't raise on non-zero exit
            )
            
            # Process test results
            self._parse_pytest_output(result.stdout, result.stderr)
            
            # Store return code
            self.results["tests"]["return_code"] = result.returncode
            
            # Print summary
            if result.returncode == 0:
                print(f"{Colors.GREEN}All tests passed!{Colors.ENDC}")
            else:
                print(f"{Colors.RED}Some tests failed. See logs for details.{Colors.ENDC}")
                
        except subprocess.SubprocessError as e:
            self.logger.error(f"Error running pytest: {str(e)}")
            print(f"{Colors.RED}Error running pytest: {str(e)}{Colors.ENDC}")
            self.results["tests"]["error"] = str(e)
    
    def _parse_pytest_output(self, stdout: str, stderr: str) -> None:
        """Parse pytest output to extract test results.
        
        Args:
            stdout: Standard output from pytest
            stderr: Standard error from pytest
        """
        # Store raw output
        self.results["tests"]["stdout"] = stdout
        self.results["tests"]["stderr"] = stderr
        
        # Parse test results
        test_results = {}
        current_test = None
        
        for line in stdout.split('\n'):
            if line.startswith("tests/security/test_"):
                # Extract test file and test name
                parts = line.split('::')
                if len(parts) >= 2:
                    test_file = parts[0].split('/')[-1]
                    test_name = parts[1]
                    
                    if test_file not in test_results:
                        test_results[test_file] = {}
                    
                    current_test = test_name
                    test_results[test_file][current_test] = {
                        "status": "unknown",
                        "details": []
                    }
            
            # Look for test outcome
            elif current_test and any(s in line for s in ["PASSED", "FAILED", "SKIPPED", "ERROR"]):
                for outcome in ["PASSED", "FAILED", "SKIPPED", "ERROR"]:
                    if outcome in line:
                        if current_test and test_file in test_results and current_test in test_results[test_file]:
                            test_results[test_file][current_test]["status"] = outcome.lower()
            
            # Collect output for current test
            elif current_test and test_file in test_results and current_test in test_results[test_file]:
                test_results[test_file][current_test]["details"].append(line)
        
        # Count test outcomes
        test_counts = {"passed": 0, "failed": 0, "skipped": 0, "error": 0, "unknown": 0}
        for test_file, tests in test_results.items():
            for test_name, test_data in tests.items():
                status = test_data.get("status", "unknown")
                test_counts[status] = test_counts.get(status, 0) + 1
        
        # Store parsed results
        self.results["tests"]["results"] = test_results
        self.results["tests"]["counts"] = test_counts
    
    def _run_penetration_test(self) -> None:
        """Run penetration test using hipaa_pentest.py."""
        print(f"\n{Colors.BLUE}{Colors.BOLD}Running Penetration Tests{Colors.ENDC}")
        print("-" * 60)
        
        pentest_args = [
            "python",
            "hipaa_pentest.py",
            self.pen_test_url,
            "--output-dir", os.path.join(self.report_dir, "pentest")
        ]
        
        if self.verbose:
            pentest_args.append("--verbose")
        
        try:
            print(f"Running: {' '.join(pentest_args)}")
            result = subprocess.run(
                pentest_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False  # Don't raise on non-zero exit
            )
            
            # Store results
            self.results["pentest"]["stdout"] = result.stdout
            self.results["pentest"]["stderr"] = result.stderr
            self.results["pentest"]["return_code"] = result.returncode
            
            # Try to load JSON results
            pentest_results_path = os.path.join(self.report_dir, "pentest", "pentest_results.json")
            if os.path.exists(pentest_results_path):
                with open(pentest_results_path, 'r') as f:
                    self.results["pentest"]["results"] = json.load(f)
            
            # Print summary
            if result.returncode == 0:
                print(f"{Colors.GREEN}Penetration test completed successfully.{Colors.ENDC}")
            else:
                print(f"{Colors.RED}Penetration test completed with issues.{Colors.ENDC}")
                
        except subprocess.SubprocessError as e:
            self.logger.error(f"Error running penetration test: {str(e)}")
            print(f"{Colors.RED}Error running penetration test: {str(e)}{Colors.ENDC}")
            self.results["pentest"]["error"] = str(e)
    
    def _analyze_test_coverage(self) -> None:
        """Analyze test coverage for HIPAA requirements."""
        print(f"\n{Colors.BLUE}{Colors.BOLD}Analyzing Test Coverage{Colors.ENDC}")
        print("-" * 60)
        
        coverage = {}
        
        # Check which HIPAA requirements have test coverage
        for req_id, req_data in self.HIPAA_REQUIREMENTS.items():
            covered_tests = []
            
            for test_file in req_data["tests"]:
                # Check if the test file exists and has test results
                if test_file in self.results["tests"].get("results", {}):
                    test_results = self.results["tests"]["results"][test_file]
                    # Check if any tests passed
                    passed_tests = [test for test, data in test_results.items() 
                                   if data.get("status") == "passed"]
                    if passed_tests:
                        covered_tests.append({
                            "file": test_file,
                            "passed_tests": len(passed_tests),
                            "total_tests": len(test_results)
                        })
            
            coverage_percentage = 0
            if covered_tests:
                # Calculate coverage percentage based on passed tests
                total_passed = sum(t["passed_tests"] for t in covered_tests)
                total_tests = sum(t["total_tests"] for t in covered_tests)
                if total_tests > 0:
                    coverage_percentage = (total_passed / total_tests) * 100
            
            coverage[req_id] = {
                "title": req_data["title"],
                "description": req_data["description"],
                "covered_tests": covered_tests,
                "coverage_percentage": coverage_percentage
            }
        
        # Store coverage results
        self.results["coverage"] = coverage
        
        # Print coverage summary
        print(f"\n{Colors.BOLD}HIPAA Requirement Coverage:{Colors.ENDC}")
        for req_id, req_coverage in coverage.items():
            coverage_color = Colors.GREEN if req_coverage["coverage_percentage"] >= 80 else \
                            Colors.YELLOW if req_coverage["coverage_percentage"] >= 50 else \
                            Colors.RED
            print(f"  {req_coverage['title']}: {coverage_color}{req_coverage['coverage_percentage']:.1f}%{Colors.ENDC}")
    
    def _assess_compliance(self) -> None:
        """Assess HIPAA compliance based on test results and coverage."""
        print(f"\n{Colors.BLUE}{Colors.BOLD}Assessing HIPAA Compliance{Colors.ENDC}")
        print("-" * 60)
        
        compliance = {}
        
        # Assess compliance for each HIPAA requirement
        for req_id, req_coverage in self.results["coverage"].items():
            # Start with coverage percentage as the base score
            compliance_score = req_coverage["coverage_percentage"]
            
            # Reduce score for failed tests
            for test_data in req_coverage["covered_tests"]:
                test_file = test_data["file"]
                if test_file in self.results["tests"].get("results", {}):
                    test_results = self.results["tests"]["results"][test_file]
                    failed_tests = [test for test, data in test_results.items() 
                                  if data.get("status") == "failed"]
                    if failed_tests:
                        # Reduce score based on number of failed tests
                        compliance_score -= (len(failed_tests) / len(test_results)) * 50
            
            # Further reduce score based on penetration test findings if available
            if "results" in self.results.get("pentest", {}) and "vulnerabilities" in self.results["pentest"]["results"]:
                for vuln in self.results["pentest"]["results"]["vulnerabilities"]:
                    # Map vulnerability severity to score reduction
                    severity_reductions = {
                        "Critical": 30,
                        "High": 20,
                        "Medium": 10,
                        "Low": 5
                    }
                    
                    # Apply reduction if vulnerability applies to this requirement
                    # This is a simplified mapping - in reality would need more sophisticated mapping
                    if any(keyword in vuln.get("title", "").lower() for keyword in req_id.split("_")):
                        severity = vuln.get("severity", "Medium")
                        compliance_score -= severity_reductions.get(severity, 10)
            
            # Ensure score is between 0 and 100
            compliance_score = max(0, min(100, compliance_score))
            
            # Determine compliance status
            if compliance_score >= 80:
                status = "Compliant"
            elif compliance_score >= 60:
                status = "Partially Compliant"
            else:
                status = "Non-Compliant"
            
            compliance[req_id] = {
                "title": req_coverage["title"],
                "score": compliance_score,
                "status": status
            }
        
        # Store compliance results
        self.results["compliance"] = compliance
        
        # Print compliance summary
        print(f"\n{Colors.BOLD}HIPAA Compliance Status:{Colors.ENDC}")
        for req_id, req_compliance in compliance.items():
            status_color = Colors.GREEN if req_compliance["status"] == "Compliant" else \
                          Colors.YELLOW if req_compliance["status"] == "Partially Compliant" else \
                          Colors.RED
            print(f"  {req_compliance['title']}: {status_color}{req_compliance['status']} ({req_compliance['score']:.1f}%){Colors.ENDC}")
    
    def _generate_summary(self) -> None:
        """Generate overall summary of test results and compliance status."""
        print(f"\n{Colors.BLUE}{Colors.BOLD}Generating Summary{Colors.ENDC}")
        print("-" * 60)
        
        # Calculate overall test pass rate
        test_counts = self.results["tests"].get("counts", {})
        total_tests = sum(test_counts.values())
        passed_tests = test_counts.get("passed", 0)
        pass_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Calculate overall compliance score
        compliance_scores = [data["score"] for data in self.results["compliance"].values()]
        overall_compliance = sum(compliance_scores) / len(compliance_scores) if compliance_scores else 0
        
        # Determine overall compliance status
        if overall_compliance >= 80:
            compliance_status = "Compliant"
        elif overall_compliance >= 60:
            compliance_status = "Partially Compliant"
        else:
            compliance_status = "Non-Compliant"
        
        # Create summary
        summary = {
            "timestamp": datetime.datetime.now().isoformat(),
            "test_pass_rate": pass_rate,
            "overall_compliance_score": overall_compliance,
            "compliance_status": compliance_status,
            "critical_findings": self._count_critical_findings()
        }
        
        self.results["summary"] = summary
        
        # Print summary
        status_color = Colors.GREEN if compliance_status == "Compliant" else \
                      Colors.YELLOW if compliance_status == "Partially Compliant" else \
                      Colors.RED
        
        print(f"\n{Colors.BOLD}Overall HIPAA Compliance Status:{Colors.ENDC} {status_color}{compliance_status}{Colors.ENDC}")
        print(f"  Compliance Score: {status_color}{overall_compliance:.1f}%{Colors.ENDC}")
        print(f"  Test Pass Rate: {Colors.GREEN if pass_rate >= 80 else Colors.YELLOW if pass_rate >= 60 else Colors.RED}{pass_rate:.1f}%{Colors.ENDC}")
        print(f"  Critical Findings: {Colors.GREEN if summary['critical_findings'] == 0 else Colors.RED}{summary['critical_findings']}{Colors.ENDC}")
        
        # Print recommendations
        self._generate_recommendations()
    
    def _count_critical_findings(self) -> int:
        """Count the number of critical security findings.
        
        Returns:
            int: Number of critical findings
        """
        critical_count = 0
        
        # Count failed tests
        test_counts = self.results["tests"].get("counts", {})
        critical_count += test_counts.get("failed", 0)
        
        # Count critical and high vulnerabilities from penetration test
        if "results" in self.results.get("pentest", {}) and "vulnerabilities" in self.results["pentest"]["results"]:
            for vuln in self.results["pentest"]["results"]["vulnerabilities"]:
                severity = vuln.get("severity", "")
                if severity in ["Critical", "High"]:
                    critical_count += 1
        
        return critical_count
    
    def _generate_recommendations(self) -> None:
        """Generate recommendations for addressing compliance issues."""
        print(f"\n{Colors.BOLD}Recommendations:{Colors.ENDC}")
        
        recommendations = []
        
        # Check for failed tests
        for test_file, tests in self.results["tests"].get("results", {}).items():
            for test_name, test_data in tests.items():
                if test_data.get("status") == "failed":
                    recommendations.append(
                        f"Fix failing test: {test_file}::{test_name}"
                    )
        
        # Check for low coverage areas
        for req_id, req_coverage in self.results["coverage"].items():
            if req_coverage["coverage_percentage"] < 80:
                recommendations.append(
                    f"Improve test coverage for {req_coverage['title']}"
                )
        
        # Check for vulnerabilities from penetration test
        if "results" in self.results.get("pentest", {}) and "vulnerabilities" in self.results["pentest"]["results"]:
            for vuln in self.results["pentest"]["results"]["vulnerabilities"]:
                severity = vuln.get("severity", "")
                title = vuln.get("title", "")
                if severity in ["Critical", "High"]:
                    recommendations.append(
                        f"Fix {severity} vulnerability: {title}"
                    )
        
        # Print recommendations
        if recommendations:
            for i, rec in enumerate(recommendations, 1):
                print(f"  {i}. {rec}")
        else:
            print(f"  {Colors.GREEN}No critical recommendations - system appears compliant.{Colors.ENDC}")
        
        # Store recommendations
        self.results["recommendations"] = recommendations
    
    def _save_results(self) -> None:
        """Save test results to file."""
        # Create results directory
        os.makedirs(self.report_dir, exist_ok=True)
        
        # Save JSON results
        json_file = os.path.join(self.report_dir, "security-report.json")
        with open(json_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        # Generate HTML report
        html_file = os.path.join(self.report_dir, "security-report.html")
        self._generate_html_report(html_file)
        
        # Generate Markdown report
        md_file = os.path.join(self.report_dir, "security-report.md")
        self._generate_markdown_report(md_file)
        
        print(f"\n{Colors.GREEN}Results saved to:{Colors.ENDC}")
        print(f"  JSON: {json_file}")
        print(f"  HTML: {html_file}")
        print(f"  Markdown: {md_file}")
    
    def _generate_html_report(self, filename: str) -> None:
        """Generate HTML report from test results.
        
        Args:
            filename: Output file name
        """
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HIPAA Security Test Report</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    background-color: #f8f9fa;
                }}
                .container {{
                    max-width: 1200px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    border-radius: 5px;
                }}
                header {{
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 20px;
                }}
                h1, h2, h3 {{
                    color: #2c3e50;
                }}
                h1 {{
                    margin: 0;
                }}
                .summary {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 5px;
                    margin-bottom: 30px;
                }}
                .summary-item {{
                    margin-bottom: 10px;
                }}
                .status {{
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 3px;
                    color: white;
                    font-weight: bold;
                }}
                .Compliant {{ background-color: #28a745; }}
                .Partially-Compliant {{ background-color: #ffc107; color: #000; }}
                .Non-Compliant {{ background-color: #dc3545; }}
                
                .passed {{ background-color: #28a745; }}
                .failed {{ background-color: #dc3545; }}
                .warning {{ background-color: #ffc107; color: #000; }}
                .error {{ background-color: #6c757d; }}
                
                .coverage-meter, .compliance-meter {{
                    height: 20px;
                    background-color: #e9ecef;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-top: 5px;
                }}
                .meter-fill {{
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    transition: width 0.5s ease;
                }}
                .coverage-fill {{
                    background-color: #007bff;
                }}
                .compliance-fill.Compliant {{
                    background-color: #28a745;
                }}
                .compliance-fill.Partially-Compliant {{
                    background-color: #ffc107;
                    color: #000;
                }}
                .compliance-fill.Non-Compliant {{
                    background-color: #dc3545;
                }}
                .test-results, .requirements, .recommendations {{
                    margin-bottom: 30px;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }}
                th, td {{
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }}
                th {{
                    background-color: #f8f9fa;
                    font-weight: bold;
                }}
                tr:hover {{
                    background-color: #f8f9fa;
                }}
                .requirement-card {{
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 15px;
                }}
                .recommendation {{
                    background-color: #f8f9fa;
                    padding: 10px 15px;
                    border-left: 4px solid #007bff;
                    margin-bottom: 10px;
                }}
                .critical {{
                    border-left-color: #dc3545;
                }}
                footer {{
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    margin-top: 30px;
                    color: #6c757d;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>HIPAA Security Test Report</h1>
                    <p>Novamind Concierge Psychiatry Platform</p>
                    <p>Generated: {self.results["timestamp"]}</p>
                </header>
                
                <section class="summary">
                    <h2>Executive Summary</h2>
                    <div class="summary-item">
                        <strong>Overall Compliance Status:</strong> 
                        <span class="status {self.results["summary"]["compliance_status"].replace(" ", "-")}">
                            {self.results["summary"]["compliance_status"]}
                        </span>
                    </div>
                    <div class="summary-item">
                        <strong>Compliance Score:</strong> {self.results["summary"]["overall_compliance_score"]:.1f}%
                        <div class="compliance-meter">
                            <div class="meter-fill compliance-fill {self.results["summary"]["compliance_status"].replace(" ", "-")}" 
                                 style="width: {self.results["summary"]["overall_compliance_score"]}%">
                                {self.results["summary"]["overall_compliance_score"]:.1f}%
                            </div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <strong>Test Pass Rate:</strong> {self.results["summary"]["test_pass_rate"]:.1f}%
                        <div class="coverage-meter">
                            <div class="meter-fill coverage-fill" 
                                 style="width: {self.results["summary"]["test_pass_rate"]}%">
                                {self.results["summary"]["test_pass_rate"]:.1f}%
                            </div>
                        </div>
                    </div>
                    <div class="summary-item">
                        <strong>Critical Findings:</strong> {self.results["summary"]["critical_findings"]}
                    </div>
                </section>
                
                <section class="requirements">
                    <h2>HIPAA Security Rule Compliance</h2>
        """
        
        for req_id, req_data in self.results["compliance"].items():
            requirement = self.HIPAA_REQUIREMENTS[req_id]
            coverage = self.results["coverage"][req_id]
            
            status_class = req_data["status"].replace(" ", "-")
            
            html += f"""
                    <div class="requirement-card">
                        <h3>{req_data["title"]}</h3>
                        <p>{requirement["description"]}</p>
                        <div class="summary-item">
                            <strong>Status:</strong> 
                            <span class="status {status_class}">
                                {req_data["status"]}
                            </span>
                        </div>
                        <div class="summary-item">
                            <strong>Compliance Score:</strong> {req_data["score"]:.1f}%
                            <div class="compliance-meter">
                                <div class="meter-fill compliance-fill {status_class}" 
                                     style="width: {req_data["score"]}%">
                                    {req_data["score"]:.1f}%
                                </div>
                            </div>
                        </div>
                        <div class="summary-item">
                            <strong>Test Coverage:</strong> {coverage["coverage_percentage"]:.1f}%
                            <div class="coverage-meter">
                                <div class="meter-fill coverage-fill" 
                                     style="width: {coverage["coverage_percentage"]}%">
                                    {coverage["coverage_percentage"]:.1f}%
                                </div>
                            </div>
                        </div>
                    </div>
            """
        
        html += """
                </section>
                
                <section class="test-results">
                    <h2>Test Results</h2>
                    <table>
                        <tr>
                            <th>Status</th>
                            <th>Count</th>
                            <th>Percentage</th>
                        </tr>
        """
        
        test_counts = self.results["tests"].get("counts", {})
        total_tests = sum(test_counts.values())
        
        for status, count in test_counts.items():
            percentage = (count / total_tests) * 100 if total_tests > 0 else 0
            html += f"""
                        <tr>
                            <td><span class="status {status}">{status.capitalize()}</span></td>
                            <td>{count}</td>
                            <td>{percentage:.1f}%</td>
                        </tr>
            """
        
        html += """
                    </table>
                </section>
        """
        
        if self.results.get("recommendations"):
            html += """
                <section class="recommendations">
                    <h2>Recommendations</h2>
            """
            
            for i, rec in enumerate(self.results["recommendations"], 1):
                # Determine if critical based on keywords
                is_critical = any(kw in rec.lower() for kw in ["critical", "high", "fix", "vulnerability", "failing"])
                html += f"""
                    <div class="recommendation {'critical' if is_critical else ''}">
                        <strong>{i}.</strong> {rec}
                    </div>
                """
            
            html += """
                </section>
            """
        
        html += """
                <footer>
                    <p>This report is for internal use only. It contains sensitive security information.</p>
                    <p>Generated by HIPAA Security Test Runner</p>
                </footer>
            </div>
        </body>
        </html>
        """
        
        with open(filename, 'w') as f:
            f.write(html)
    
    def _generate_markdown_report(self, filename: str) -> None:
        """Generate Markdown report from test results.
        
        Args:
            filename: Output file name
        """
        md = f"""# HIPAA Security Test Report

## Executive Summary

- **Report Date:** {self.results["timestamp"]}
- **Overall Compliance Status:** {self.results["summary"]["compliance_status"]}
- **Compliance Score:** {self.results["summary"]["overall_compliance_score"]:.1f}%
- **Test Pass Rate:** {self.results["summary"]["test_pass_rate"]:.1f}%
- **Critical Findings:** {self.results["summary"]["critical_findings"]}

## HIPAA Security Rule Compliance

"""
        
        for req_id, req_data in self.results["compliance"].items():
            requirement = self.HIPAA_REQUIREMENTS[req_id]
            coverage = self.results["coverage"][req_id]
            
            md += f"""### {req_data["title"]}

- **Description:** {requirement["description"]}
- **Status:** {req_data["status"]}
- **Compliance Score:** {req_data["score"]:.1f}%
- **Test Coverage:** {coverage["coverage_percentage"]:.1f}%

"""
        
        md += """## Test Results

| Status | Count | Percentage |
|--------|-------|------------|
"""
        
        test_counts = self.results["tests"].get("counts", {})
        total_tests = sum(test_counts.values())
        
        for status, count in test_counts.items():
            percentage = (count / total_tests) * 100 if total_tests > 0 else 0
            md += f"| {status.capitalize()} | {count} | {percentage:.1f}% |\n"
        
        if self.results.get("recommendations"):
            md += "\n## Recommendations\n\n"
            
            for i, rec in enumerate(self.results["recommendations"], 1):
                md += f"{i}. {rec}\n"
        
        md += """
## Disclaimer

This report is for internal use only. It contains sensitive security information.

Generated by HIPAA Security Test Runner
"""
        
        with open(filename, 'w') as f:
            f.write(md)


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="HIPAA Security Test Runner"
    )
    
    parser.add_argument(
        "--report-dir",
        default="security-reports",
        help="Directory to store test reports"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print verbose output"
    )
    
    parser.add_argument(
        "--pen-test-url",
        help="URL to use for penetration testing (optional)"
    )
    
    return parser.parse_args()


if __name__ == "__main__":
    # Parse arguments
    args = parse_arguments()
    
    # Run tests
    runner = HIPAASecurityTestRunner(
        report_dir=args.report_dir,
        verbose=args.verbose,
        pen_test_url=args.pen_test_url
    )
    
    results = runner.run_all_tests()
    
    # Exit with appropriate status code
    sys.exit(0 if results["summary"]["compliance_status"] == "Compliant" else 1)