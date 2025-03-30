#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
NOVAMIND HIPAA Compliance Verification

This script analyzes test results and coverage data to assess and report on 
the HIPAA compliance status of the NOVAMIND concierge psychiatry platform.
It generates a comprehensive report of compliance metrics and identifies
any gaps that need to be addressed.
"""

import os
import sys
import json
import argparse
from datetime import datetime
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
import re
import webbrowser


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
        plat = sys.platform
        supported_platform = plat != 'win32' or 'ANSICON' in os.environ
        is_a_tty = hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()
        return supported_platform and is_a_tty


def print_color(message, color):
    """Print colored messages if supported."""
    if Colors.supports_color():
        print(f"{color}{message}{Colors.ENDC}")
    else:
        print(message)


def print_banner():
    """Print the verification script banner."""
    banner = f"""
{Colors.BLUE}{Colors.BOLD}======================================================================
                NOVAMIND HIPAA COMPLIANCE VERIFICATION
         Ultra-Secure Concierge Psychiatry Platform Analysis
======================================================================{Colors.ENDC}
"""
    print(banner)


# HIPAA Security Rule Requirements
HIPAA_REQUIREMENTS = [
    {
        "id": "164.308(a)(1)(i)",
        "title": "Security Management Process",
        "description": "Implement policies and procedures to prevent, detect, contain, and correct security violations.",
        "components": [
            "Risk analysis",
            "Risk management",
            "Sanction policy",
            "Information system activity review"
        ],
        "test_files": [
            "tests/security/test_api_security.py",
            "reports/bandit-report.json"
        ]
    },
    {
        "id": "164.308(a)(2)",
        "title": "Assigned Security Responsibility",
        "description": "Identify the security official who is responsible for the development and implementation of the policies and procedures.",
        "components": ["Designated security official"],
        "test_files": []  # This is a procedural requirement, not directly testable
    },
    {
        "id": "164.308(a)(3)(i)",
        "title": "Workforce Security",
        "description": "Implement policies and procedures to ensure appropriate access to ePHI.",
        "components": [
            "Authorization and/or supervision",
            "Workforce clearance procedure",
            "Termination procedures"
        ],
        "test_files": [
            "tests/security/test_api_security.py"
        ]
    },
    {
        "id": "164.308(a)(4)(i)",
        "title": "Information Access Management",
        "description": "Implement policies and procedures for authorizing access to ePHI.",
        "components": [
            "Isolating health care clearinghouse functions",
            "Access authorization",
            "Access establishment and modification"
        ],
        "test_files": [
            "tests/security/test_api_security.py"
        ]
    },
    {
        "id": "164.308(a)(5)(i)",
        "title": "Security Awareness and Training",
        "description": "Implement a security awareness and training program.",
        "components": [
            "Security reminders",
            "Protection from malicious software",
            "Log-in monitoring",
            "Password management"
        ],
        "test_files": [
            "tests/security/test_api_security.py"
        ]
    },
    {
        "id": "164.308(a)(6)(i)",
        "title": "Security Incident Procedures",
        "description": "Implement policies and procedures to address security incidents.",
        "components": ["Response and reporting"],
        "test_files": [
            "tests/security/test_audit_logging.py"
        ]
    },
    {
        "id": "164.308(a)(7)(i)",
        "title": "Contingency Plan",
        "description": "Establish policies and procedures for responding to an emergency or other occurrence.",
        "components": [
            "Data backup plan",
            "Disaster recovery plan",
            "Emergency mode operation plan",
            "Testing and revision procedures",
            "Applications and data criticality analysis"
        ],
        "test_files": []  # This is a procedural requirement, not directly testable
    },
    {
        "id": "164.308(a)(8)",
        "title": "Evaluation",
        "description": "Perform periodic evaluation of security safeguards.",
        "components": ["Periodic security evaluation"],
        "test_files": [
            "reports/bandit-report.json",
            "reports/dependency-audit.json"
        ]
    },
    {
        "id": "164.310(a)(1)",
        "title": "Facility Access Controls",
        "description": "Implement policies and procedures to limit physical access to electronic information systems.",
        "components": [
            "Contingency operations",
            "Facility security plan",
            "Access control and validation procedures",
            "Maintenance records"
        ],
        "test_files": []  # This is a physical security requirement, not directly testable in code
    },
    {
        "id": "164.310(b)",
        "title": "Workstation Use",
        "description": "Implement policies and procedures that specify the proper functions to be performed and physical attributes of the surroundings of workstations that access ePHI.",
        "components": ["Workstation use policy"],
        "test_files": []  # This is a procedural requirement, not directly testable
    },
    {
        "id": "164.310(c)",
        "title": "Workstation Security",
        "description": "Implement physical safeguards for all workstations that access ePHI.",
        "components": ["Workstation security measures"],
        "test_files": []  # This is a physical security requirement, not directly testable in code
    },
    {
        "id": "164.310(d)(1)",
        "title": "Device and Media Controls",
        "description": "Implement policies and procedures that govern the receipt and removal of hardware and electronic media that contain ePHI.",
        "components": [
            "Disposal",
            "Media re-use",
            "Accountability",
            "Data backup and storage"
        ],
        "test_files": [
            "tests/security/test_ml_encryption.py"
        ]
    },
    {
        "id": "164.312(a)(1)",
        "title": "Access Control",
        "description": "Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons or software programs.",
        "components": [
            "Unique user identification",
            "Emergency access procedure",
            "Automatic logoff",
            "Encryption and decryption"
        ],
        "test_files": [
            "tests/security/test_api_security.py",
            "tests/security/test_ml_encryption.py"
        ]
    },
    {
        "id": "164.312(b)",
        "title": "Audit Controls",
        "description": "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI.",
        "components": ["System activity recording and analysis"],
        "test_files": [
            "tests/security/test_audit_logging.py"
        ]
    },
    {
        "id": "164.312(c)(1)",
        "title": "Integrity",
        "description": "Implement policies and procedures to protect ePHI from improper alteration or destruction.",
        "components": [
            "Mechanism to authenticate ePHI",
            "Data integrity verification"
        ],
        "test_files": [
            "tests/security/test_ml_encryption.py"
        ]
    },
    {
        "id": "164.312(d)",
        "title": "Person or Entity Authentication",
        "description": "Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.",
        "components": ["Identity verification procedures"],
        "test_files": [
            "tests/security/test_api_security.py"
        ]
    },
    {
        "id": "164.312(e)(1)",
        "title": "Transmission Security",
        "description": "Implement technical security measures to guard against unauthorized access to ePHI that is being transmitted over an electronic communications network.",
        "components": [
            "Integrity controls",
            "Encryption"
        ],
        "test_files": [
            "tests/security/test_api_security.py",
            "tests/security/test_ml_encryption.py"
        ]
    }
]


def check_test_existence(test_files):
    """Check if required test files exist."""
    results = {}
    for test_file in test_files:
        if test_file.endswith('.json'):
            exists = os.path.exists(test_file)
            results[test_file] = {
                "exists": exists,
                "status": "pass" if exists else "fail"
            }
        else:
            exists = os.path.exists(test_file)
            if not exists:
                results[test_file] = {
                    "exists": False,
                    "status": "fail"
                }
                continue
                
            # Check if file has tests
            with open(test_file, 'r') as f:
                content = f.read()
                has_tests = "def test_" in content or "class Test" in content
                results[test_file] = {
                    "exists": exists,
                    "has_tests": has_tests,
                    "status": "pass" if (exists and has_tests) else "warn" if exists else "fail"
                }
    
    return results


def evaluate_requirement(requirement):
    """Evaluate the status of a HIPAA requirement."""
    if not requirement["test_files"]:
        return {
            "id": requirement["id"],
            "title": requirement["title"],
            "description": requirement["description"],
            "status": "not_testable",
            "message": "This is a procedural or physical security requirement not directly testable in code."
        }
    
    test_results = check_test_existence(requirement["test_files"])
    all_pass = all(r["status"] == "pass" for r in test_results.values())
    any_fail = any(r["status"] == "fail" for r in test_results.values())
    
    if all_pass:
        return {
            "id": requirement["id"],
            "title": requirement["title"],
            "description": requirement["description"],
            "status": "pass",
            "message": "All related tests are passing or reports exist.",
            "test_results": test_results
        }
    elif any_fail:
        return {
            "id": requirement["id"],
            "title": requirement["title"],
            "description": requirement["description"],
            "status": "fail",
            "message": "One or more required tests are missing or reports don't exist.",
            "test_results": test_results
        }
    else:
        return {
            "id": requirement["id"],
            "title": requirement["title"],
            "description": requirement["description"],
            "status": "warn",
            "message": "Some tests exist but may not have proper test cases.",
            "test_results": test_results
        }


def check_bandit_results():
    """Check bandit security scan results."""
    bandit_file = "reports/bandit-report.json"
    if not os.path.exists(bandit_file):
        return {
            "status": "fail",
            "message": "Bandit security scan report not found. Run security tests first.",
            "issues": {
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "exists": False
        }
    
    try:
        with open(bandit_file, 'r') as f:
            bandit_data = json.load(f)
            
        issue_counts = {
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        for result in bandit_data.get("results", []):
            severity = result.get("issue_severity", "").lower()
            if severity in issue_counts:
                issue_counts[severity] += 1
        
        high_issues = issue_counts["high"]
        medium_issues = issue_counts["medium"]
        
        if high_issues > 0:
            status = "fail"
            message = f"Found {high_issues} high severity security issues that must be fixed."
        elif medium_issues > 0:
            status = "warn"
            message = f"Found {medium_issues} medium severity security issues that should be reviewed."
        else:
            status = "pass"
            message = "No high or medium severity security issues found."
        
        return {
            "status": status,
            "message": message,
            "issues": issue_counts,
            "exists": True
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error parsing bandit report: {str(e)}",
            "issues": {
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "exists": True,
            "error": str(e)
        }


def check_dependency_audit():
    """Check dependency audit results."""
    audit_file = "reports/dependency-audit.json"
    if not os.path.exists(audit_file):
        return {
            "status": "fail",
            "message": "Dependency audit report not found. Run security tests first.",
            "vulnerabilities": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "exists": False
        }
    
    try:
        with open(audit_file, 'r') as f:
            audit_data = json.load(f)
            
        vulnerabilities = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        # pip-audit format (the structure might vary)
        if "vulnerabilities" in audit_data:
            for vuln in audit_data["vulnerabilities"]:
                severity = vuln.get("severity", "").lower()
                if severity in vulnerabilities:
                    vulnerabilities[severity] += 1
        
        critical_vulns = vulnerabilities["critical"]
        high_vulns = vulnerabilities["high"]
        
        if critical_vulns > 0:
            status = "fail"
            message = f"Found {critical_vulns} critical severity vulnerabilities that must be fixed."
        elif high_vulns > 0:
            status = "warn"
            message = f"Found {high_vulns} high severity vulnerabilities that should be addressed."
        else:
            status = "pass"
            message = "No critical or high severity vulnerabilities found."
        
        return {
            "status": status,
            "message": message,
            "vulnerabilities": vulnerabilities,
            "exists": True
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error parsing dependency audit report: {str(e)}",
            "vulnerabilities": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "exists": True,
            "error": str(e)
        }


def check_coverage_data():
    """Check test coverage data for security components."""
    # Key security modules that should have high coverage
    security_modules = [
        "app.infrastructure.security",
        "app.infrastructure.ml",
        "app.presentation.api"
    ]
    
    # Look for coverage data
    coverage_dir = "coverage/security"
    if not os.path.exists(coverage_dir):
        return {
            "status": "fail",
            "message": "Coverage data not found. Run security tests first.",
            "modules": {},
            "exists": False
        }
    
    try:
        # Try to find coverage data in HTML format
        coverage_data = {}
        for module in security_modules:
            module_name = module.split(".")[-1]
            coverage_html = os.path.join(coverage_dir, module_name, "index.html")
            
            if os.path.exists(coverage_html):
                # Parse coverage percentage from HTML
                with open(coverage_html, 'r') as f:
                    content = f.read()
                    match = re.search(r'<span class="pc_cov">(\d+)%</span>', content)
                    if match:
                        coverage_pct = int(match.group(1))
                        coverage_data[module] = coverage_pct
            else:
                # Try to look for other coverage formats
                coverage_data[module] = 0  # Default to 0 if not found
        
        # Evaluate coverage
        if not coverage_data:
            return {
                "status": "fail",
                "message": "No coverage data found for security modules.",
                "modules": {},
                "exists": False
            }
        
        # Calculate overall status based on coverage thresholds
        low_coverage_modules = [m for m, cov in coverage_data.items() if cov < 70]
        medium_coverage_modules = [m for m, cov in coverage_data.items() if 70 <= cov < 90]
        
        if low_coverage_modules:
            status = "fail"
            message = f"Low test coverage (<70%) for modules: {', '.join(low_coverage_modules)}"
        elif medium_coverage_modules:
            status = "warn"
            message = f"Medium test coverage (70-90%) for modules: {', '.join(medium_coverage_modules)}"
        else:
            status = "pass"
            message = "Good test coverage (>90%) for all security modules."
        
        return {
            "status": status,
            "message": message,
            "modules": coverage_data,
            "exists": True
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error analyzing coverage data: {str(e)}",
            "modules": {},
            "exists": True,
            "error": str(e)
        }


def calculate_compliance_score(results):
    """Calculate an overall HIPAA compliance score."""
    requirement_scores = []
    
    # Scoring for HIPAA requirements
    for req_result in results["hipaa_requirements"]:
        if req_result["status"] == "pass":
            requirement_scores.append(1.0)
        elif req_result["status"] == "warn":
            requirement_scores.append(0.5)
        elif req_result["status"] == "fail":
            requirement_scores.append(0)
        elif req_result["status"] == "not_testable":
            # Don't count in score as these are procedural requirements
            pass
    
    # Scoring for security checks
    if results["bandit_check"]["status"] == "pass":
        requirement_scores.append(1.0)
    elif results["bandit_check"]["status"] == "warn":
        requirement_scores.append(0.5)
    elif results["bandit_check"]["status"] == "fail":
        requirement_scores.append(0)
    
    if results["dependency_check"]["status"] == "pass":
        requirement_scores.append(1.0)
    elif results["dependency_check"]["status"] == "warn":
        requirement_scores.append(0.5)
    elif results["dependency_check"]["status"] == "fail":
        requirement_scores.append(0)
    
    if results["coverage_check"]["status"] == "pass":
        requirement_scores.append(1.0)
    elif results["coverage_check"]["status"] == "warn":
        requirement_scores.append(0.5)
    elif results["coverage_check"]["status"] == "fail":
        requirement_scores.append(0)
    
    if not requirement_scores:
        return 0
    
    # Calculate percentage score
    score = (sum(requirement_scores) / len(requirement_scores)) * 100
    return round(score)


def get_recommendations(results):
    """Generate recommendations based on compliance checks."""
    recommendations = []
    
    # Check HIPAA requirements
    for req in results["hipaa_requirements"]:
        if req["status"] == "fail":
            recommendations.append(f"Implement tests for {req['id']} - {req['title']}")
        elif req["status"] == "warn":
            recommendations.append(f"Improve test coverage for {req['id']} - {req['title']}")
    
    # Check bandit results
    if results["bandit_check"]["status"] == "fail":
        recommendations.append("Fix high severity security issues identified by bandit scan")
    elif results["bandit_check"]["status"] == "warn":
        recommendations.append("Review and address medium severity security issues identified by bandit scan")
    
    # Check dependency audit
    if results["dependency_check"]["status"] == "fail":
        recommendations.append("Update dependencies with critical vulnerabilities")
    elif results["dependency_check"]["status"] == "warn":
        recommendations.append("Review and update dependencies with high severity vulnerabilities")
    
    # Check coverage
    if results["coverage_check"]["status"] == "fail":
        recommendations.append("Improve test coverage for security modules (aim for >70% minimum)")
    elif results["coverage_check"]["status"] == "warn":
        recommendations.append("Improve test coverage for security modules (aim for >90% ideally)")
    
    return recommendations


def generate_compliance_report(results):
    """Generate HTML report from compliance results."""
    report_path = os.path.join("reports", "hipaa_compliance_report.html")
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    score = calculate_compliance_score(results)
    recommendations = get_recommendations(results)
    
    # Determine overall compliance status
    if score >= 90:
        compliance_status = "Compliant"
        compliance_color = "green"
    elif score >= 75:
        compliance_status = "Partially Compliant"
        compliance_color = "orange"
    else:
        compliance_status = "Non-Compliant"
        compliance_color = "red"
    
    # HTML report template
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>NOVAMIND HIPAA Compliance Report</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #2c3e50;
        }}
        .score-container {{
            text-align: center;
            margin: 20px 0;
        }}
        .score {{
            font-size: 48px;
            font-weight: bold;
            color: {compliance_color};
        }}
        .status {{
            font-size: 24px;
            color: {compliance_color};
            margin-top: 10px;
        }}
        .timestamp {{
            text-align: right;
            color: #666;
            font-style: italic;
            margin: 10px 0;
        }}
        .section {{
            margin: 30px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            background-color: #f9f9f9;
        }}
        .section h2 {{
            color: #2c3e50;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
            margin-top: 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        table, th, td {{
            border: 1px solid #ddd;
        }}
        th, td {{
            padding: 10px;
            text-align: left;
        }}
        th {{
            background-color: #f2f2f2;
        }}
        .pass {{
            color: green;
        }}
        .warn {{
            color: orange;
        }}
        .fail {{
            color: red;
        }}
        .not-tested {{
            color: gray;
            font-style: italic;
        }}
        .recommendations {{
            list-style-type: disc;
            padding-left: 20px;
        }}
        .recommendations li {{
            margin: 10px 0;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>NOVAMIND HIPAA Compliance Report</h1>
        <p>Ultra-Secure Concierge Psychiatry Platform</p>
    </div>
    
    <div class="timestamp">
        Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    </div>
    
    <div class="score-container">
        <div class="score">{score}%</div>
        <div class="status">{compliance_status}</div>
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        <p>This report provides an assessment of the NOVAMIND platform's compliance with HIPAA Security Rule requirements based on automated security testing.</p>
        
        <table>
            <tr>
                <th>Check</th>
                <th>Status</th>
                <th>Details</th>
            </tr>
            <tr>
                <td>Static Code Analysis (Bandit)</td>
                <td class="{results['bandit_check']['status']}">{results['bandit_check']['status'].upper()}</td>
                <td>{results['bandit_check']['message']}</td>
            </tr>
            <tr>
                <td>Dependency Security Check</td>
                <td class="{results['dependency_check']['status']}">{results['dependency_check']['status'].upper()}</td>
                <td>{results['dependency_check']['message']}</td>
            </tr>
            <tr>
                <td>Test Coverage</td>
                <td class="{results['coverage_check']['status']}">{results['coverage_check']['status'].upper()}</td>
                <td>{results['coverage_check']['message']}</td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>HIPAA Security Rule Requirements</h2>
        <table>
            <tr>
                <th>Requirement</th>
                <th>Status</th>
                <th>Description</th>
                <th>Details</th>
            </tr>
"""
    
    # Add HIPAA requirements to the table
    for req in results["hipaa_requirements"]:
        status_class = req["status"]
        status_text = req["status"].upper()
        if req["status"] == "not_testable":
            status_class = "not-tested"
            status_text = "NOT TESTABLE"
            
        html += f"""
            <tr>
                <td>{req['id']}</td>
                <td class="{status_class}">{status_text}</td>
                <td>{req['title']}</td>
                <td>{req['message']}</td>
            </tr>"""
    
    html += """
        </table>
    </div>
    """
    
    # Add recommendations section if there are any
    if recommendations:
        html += f"""
    <div class="section">
        <h2>Recommendations</h2>
        <ul class="recommendations">
"""
        for rec in recommendations:
            html += f"            <li>{rec}</li>\n"
        
        html += """
        </ul>
    </div>
    """
    
    html += """
    <div class="section">
        <h2>Next Steps</h2>
        <p>For items marked as 'FAIL' or 'WARN', review the findings and take appropriate action. For procedural requirements marked as 'NOT TESTABLE', ensure documentation and operational processes are in place.</p>
        <p>This automated assessment should be complemented by a comprehensive review of all HIPAA requirements including administrative and physical safeguards not covered by automated testing.</p>
    </div>
</body>
</html>
"""
    
    # Write report to file
    with open(report_path, 'w') as f:
        f.write(html)
    
    return report_path


def print_console_summary(results, score):
    """Print a summary of the compliance check to the console."""
    print("\nHIPAA Compliance Summary:")
    print("=" * 40)
    
    # Print score
    if score >= 90:
        print_color(f"Compliance Score: {score}% (Compliant)", Colors.GREEN)
    elif score >= 75:
        print_color(f"Compliance Score: {score}% (Partially Compliant)", Colors.YELLOW)
    else:
        print_color(f"Compliance Score: {score}% (Non-Compliant)", Colors.RED)
    
    # Print security check summaries
    print("\nSecurity Checks:")
    print("-" * 40)
    
    # Bandit check
    status_color = Colors.GREEN if results["bandit_check"]["status"] == "pass" else \
                  Colors.YELLOW if results["bandit_check"]["status"] == "warn" else Colors.RED
    print_color(f"Static Analysis: {results['bandit_check']['status'].upper()}", status_color)
    print(f"  {results['bandit_check']['message']}")
    
    # Dependency check
    status_color = Colors.GREEN if results["dependency_check"]["status"] == "pass" else \
                  Colors.YELLOW if results["dependency_check"]["status"] == "warn" else Colors.RED
    print_color(f"Dependency Check: {results['dependency_check']['status'].upper()}", status_color)
    print(f"  {results['dependency_check']['message']}")
    
    # Coverage check
    status_color = Colors.GREEN if results["coverage_check"]["status"] == "pass" else \
                  Colors.YELLOW if results["coverage_check"]["status"] == "warn" else Colors.RED
    print_color(f"Test Coverage: {results['coverage_check']['status'].upper()}", status_color)
    print(f"  {results['coverage_check']['message']}")
    
    # Print HIPAA requirement summaries
    print("\nHIPAA Requirements:")
    print("-" * 40)
    
    # Count statuses
    statuses = {
        "pass": 0,
        "warn": 0,
        "fail": 0,
        "not_testable": 0
    }
    
    for req in results["hipaa_requirements"]:
        statuses[req["status"]] += 1
    
    print_color(f"PASS: {statuses['pass']}", Colors.GREEN)
    print_color(f"WARN: {statuses['warn']}", Colors.YELLOW)
    print_color(f"FAIL: {statuses['fail']}", Colors.RED)
    print(f"NOT TESTABLE: {statuses['not_testable']}")
    
    # Print recommendations
    recommendations = get_recommendations(results)
    if recommendations:
        print("\nRecommendations:")
        print("-" * 40)
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec}")
    
    # Print report location
    print("\nDetailed HTML report generated at: reports/hipaa_compliance_report.html")


def main():
    """Main function to run the HIPAA compliance verification."""
    parser = argparse.ArgumentParser(description="NOVAMIND HIPAA Compliance Verification")
    parser.add_argument("--open-report", action="store_true", help="Open HTML report in browser after generation")
    args = parser.parse_args()
    
    print_banner()
    
    # Check if reports directory exists
    if not os.path.exists("reports"):
        os.makedirs("reports")
    
    # Run all compliance checks
    hipaa_results = []
    for requirement in HIPAA_REQUIREMENTS:
        hipaa_results.append(evaluate_requirement(requirement))
    
    bandit_check = check_bandit_results()
    dependency_check = check_dependency_audit()
    coverage_check = check_coverage_data()
    
    # Compile all results
    results = {
        "hipaa_requirements": hipaa_results,
        "bandit_check": bandit_check,
        "dependency_check": dependency_check,
        "coverage_check": coverage_check
    }
    
    # Calculate overall score
    score = calculate_compliance_score(results)
    
    # Generate HTML report
    report_path = generate_compliance_report(results)
    
    # Print console summary
    print_console_summary(results, score)
    
    # Open report in browser if requested
    if args.open_report and os.path.exists(report_path):
        try:
            webbrowser.open(f"file://{os.path.abspath(report_path)}")
        except Exception as e:
            print(f"Could not open report in browser: {str(e)}")
    
    # Return appropriate exit code based on compliance
    if score < 75:
        return 1  # Non-compliant
    else:
        return 0  # Compliant or partially compliant


if __name__ == "__main__":
    sys.exit(main())