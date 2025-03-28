#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
HIPAA Compliance Test Workflow

This script coordinates the HIPAA compliance testing workflow, integrating results
from security testing, penetration testing, and generating compliance reports.
"""

import os
import sys
import json
import argparse
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


class TermColors:
    """Terminal color codes for formatted output."""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


class HIPAAComplianceWorkflow:
    """Orchestrates the HIPAA compliance testing workflow."""
    
    def __init__(self, output_dir: str = "hipaa_compliance_reports", 
                 api_url: str = "http://localhost:8000",
                 skip_phases: Optional[List[str]] = None,
                 verbose: bool = False):
        """Initialize the workflow.
        
        Args:
            output_dir: Directory to store reports
            api_url: URL of the API to test
            skip_phases: List of phases to skip
            verbose: Whether to print verbose output
        """
        self.output_dir = output_dir
        self.api_url = api_url
        self.skip_phases = skip_phases or []
        self.verbose = verbose
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize results storage
        self.results = {
            "security_tests": {},
            "penetration_tests": {},
            "hipaa_compliance": {},
            "recommendations": {},
            "summary": {
                "timestamp": datetime.datetime.now().isoformat(),
                "hipaa_compliant": False,
                "compliance_score": 0.0,
                "critical_findings": 0,
                "high_findings": 0,
                "medium_findings": 0,
                "low_findings": 0,
            }
        }
    
    def run_workflow(self) -> Dict[str, Any]:
        """Run the complete workflow.
        
        Returns:
            Dict containing consolidated results and recommendations
        """
        self._print_header("HIPAA Compliance Testing Workflow")
        
        # Collect results from security tests
        self._collect_security_results()
        
        # Collect results from penetration tests
        self._collect_pentest_results()
        
        # Generate HIPAA compliance assessment
        self._generate_compliance_assessment()
        
        # Generate recommendations
        self._generate_recommendations()
        
        # Calculate summary
        self._calculate_summary()
        
        # Generate reports
        self._generate_reports()
        
        return self.results
    
    def _collect_security_results(self) -> None:
        """Collect results from security tests."""
        self._print_step("Collecting security test results")
        
        # Check for security test results
        security_report_path = os.path.join(self.output_dir, "security", "security_report.json")
        
        if os.path.exists(security_report_path):
            try:
                with open(security_report_path, 'r') as f:
                    security_results = json.load(f)
                    self.results["security_tests"] = security_results
                    self._print_success("Loaded security test results")
            except Exception as e:
                self._print_error(f"Error loading security test results: {str(e)}")
                self.results["security_tests"] = {"error": f"Failed to load: {str(e)}"}
        else:
            self._print_warning("No security test results found")
            self.results["security_tests"] = {"error": "No results found"}
    
    def _collect_pentest_results(self) -> None:
        """Collect results from penetration tests."""
        self._print_step("Collecting penetration test results")
        
        # Check for pentest results
        pentest_report_path = os.path.join(self.output_dir, "pentest", "pentest_results.json")
        
        if os.path.exists(pentest_report_path):
            try:
                with open(pentest_report_path, 'r') as f:
                    pentest_results = json.load(f)
                    self.results["penetration_tests"] = pentest_results
                    self._print_success("Loaded penetration test results")
            except Exception as e:
                self._print_error(f"Error loading penetration test results: {str(e)}")
                self.results["penetration_tests"] = {"error": f"Failed to load: {str(e)}"}
        else:
            self._print_warning("No penetration test results found")
            self.results["penetration_tests"] = {"error": "No results found"}
    
    def _generate_compliance_assessment(self) -> None:
        """Generate HIPAA compliance assessment."""
        self._print_step("Generating HIPAA compliance assessment")
        
        # Map HIPAA Security Rule requirements
        hipaa_assessment = {
            "administrative_safeguards": self._assess_administrative_safeguards(),
            "physical_safeguards": self._assess_physical_safeguards(),
            "technical_safeguards": self._assess_technical_safeguards(),
            "organizational_requirements": self._assess_organizational_requirements(),
            "policies_procedures_documentation": self._assess_policies_procedures(),
            "overall_score": 0.0
        }
        
        # Calculate overall score
        scores = [
            hipaa_assessment["administrative_safeguards"]["score"],
            hipaa_assessment["physical_safeguards"]["score"],
            hipaa_assessment["technical_safeguards"]["score"],
            hipaa_assessment["organizational_requirements"]["score"],
            hipaa_assessment["policies_procedures_documentation"]["score"]
        ]
        
        if scores:
            hipaa_assessment["overall_score"] = sum(scores) / len(scores)
        
        self.results["hipaa_compliance"] = hipaa_assessment
        self._print_success(f"HIPAA compliance score: {hipaa_assessment['overall_score']:.2f}%")
    
    def _assess_administrative_safeguards(self) -> Dict[str, Any]:
        """Assess compliance with Administrative Safeguards."""
        safeguards = {
            "security_management_process": {
                "requirements": [
                    "Risk Analysis (§164.308(a)(1)(ii)(A))",
                    "Risk Management (§164.308(a)(1)(ii)(B))",
                    "Sanction Policy (§164.308(a)(1)(ii)(C))",
                    "Information System Activity Review (§164.308(a)(1)(ii)(D))"
                ],
                "findings": [],
                "score": 0.0
            },
            "assigned_security_responsibility": {
                "requirements": [
                    "Security Official (§164.308(a)(2))"
                ],
                "findings": [],
                "score": 0.0
            },
            "workforce_security": {
                "requirements": [
                    "Authorization/Supervision (§164.308(a)(3)(ii)(A))",
                    "Workforce Clearance Procedure (§164.308(a)(3)(ii)(B))",
                    "Termination Procedures (§164.308(a)(3)(ii)(C))"
                ],
                "findings": [],
                "score": 0.0
            },
            "information_access_management": {
                "requirements": [
                    "Isolating Healthcare Clearinghouse Functions (§164.308(a)(4)(ii)(A))",
                    "Access Authorization (§164.308(a)(4)(ii)(B))",
                    "Access Establishment and Modification (§164.308(a)(4)(ii)(C))"
                ],
                "findings": [],
                "score": 0.0
            },
            "security_awareness_and_training": {
                "requirements": [
                    "Security Reminders (§164.308(a)(5)(ii)(A))",
                    "Protection from Malicious Software (§164.308(a)(5)(ii)(B))",
                    "Log-in Monitoring (§164.308(a)(5)(ii)(C))",
                    "Password Management (§164.308(a)(5)(ii)(D))"
                ],
                "findings": [],
                "score": 0.0
            },
            "security_incident_procedures": {
                "requirements": [
                    "Response and Reporting (§164.308(a)(6)(ii))"
                ],
                "findings": [],
                "score": 0.0
            },
            "contingency_plan": {
                "requirements": [
                    "Data Backup Plan (§164.308(a)(7)(ii)(A))",
                    "Disaster Recovery Plan (§164.308(a)(7)(ii)(B))",
                    "Emergency Mode Operation Plan (§164.308(a)(7)(ii)(C))",
                    "Testing and Revision Procedures (§164.308(a)(7)(ii)(D))",
                    "Applications and Data Criticality Analysis (§164.308(a)(7)(ii)(E))"
                ],
                "findings": [],
                "score": 0.0
            },
            "evaluation": {
                "requirements": [
                    "Evaluation (§164.308(a)(8))"
                ],
                "findings": [],
                "score": 0.0
            },
            "business_associate_contracts": {
                "requirements": [
                    "Written Contract or Other Arrangement (§164.308(b)(1))"
                ],
                "findings": [],
                "score": 0.0
            }
        }
        
        # Evaluate safeguards based on test results
        security_results = self.results.get("security_tests", {})
        pentest_results = self.results.get("penetration_tests", {})
        
        # Extract authentication findings from test results
        auth_findings = self._extract_findings(
            security_results, pentest_results, 
            categories=["Authentication", "Authorization"]
        )
        
        # Evaluate security management process
        risk_findings = self._extract_findings(
            security_results, pentest_results,
            categories=["Security Management"]
        )
        
        safeguards["security_management_process"]["findings"] = risk_findings
        safeguards["security_management_process"]["score"] = self._calculate_section_score(risk_findings)
        
        # Evaluate workforce security
        safeguards["workforce_security"]["findings"] = auth_findings
        safeguards["workforce_security"]["score"] = self._calculate_section_score(auth_findings)
        
        # Evaluate information access management
        access_findings = self._extract_findings(
            security_results, pentest_results,
            categories=["Authorization", "Access Control"]
        )
        
        safeguards["information_access_management"]["findings"] = access_findings
        safeguards["information_access_management"]["score"] = self._calculate_section_score(access_findings)
        
        # Calculate overall score
        scores = [section["score"] for section in safeguards.values() if section["score"] > 0]
        overall_score = sum(scores) / len(scores) if scores else 0.0
        
        return {
            "sections": safeguards,
            "score": overall_score
        }
    
    def _assess_physical_safeguards(self) -> Dict[str, Any]:
        """Assess compliance with Physical Safeguards."""
        # Since this is a software test only, we'll return a limited assessment
        return {
            "sections": {
                "facility_access_controls": {
                    "requirements": [
                        "Contingency Operations (§164.310(a)(2)(i))",
                        "Facility Security Plan (§164.310(a)(2)(ii))",
                        "Access Control and Validation Procedures (§164.310(a)(2)(iii))",
                        "Maintenance Records (§164.310(a)(2)(iv))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Physical safeguards assessment requires on-site inspection"}
                    ],
                    "score": 50.0  # Default score
                },
                "workstation_use": {
                    "requirements": [
                        "Workstation Use (§164.310(b))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Workstation use assessment requires on-site inspection"}
                    ],
                    "score": 50.0  # Default score
                },
                "workstation_security": {
                    "requirements": [
                        "Workstation Security (§164.310(c))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Workstation security assessment requires on-site inspection"}
                    ],
                    "score": 50.0  # Default score
                },
                "device_and_media_controls": {
                    "requirements": [
                        "Disposal (§164.310(d)(2)(i))",
                        "Media Re-use (§164.310(d)(2)(ii))",
                        "Accountability (§164.310(d)(2)(iii))",
                        "Data Backup and Storage (§164.310(d)(2)(iv))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Device and media controls assessment requires on-site inspection"}
                    ],
                    "score": 50.0  # Default score
                }
            },
            "score": 50.0  # Default score for physical safeguards
        }
    
    def _assess_technical_safeguards(self) -> Dict[str, Any]:
        """Assess compliance with Technical Safeguards."""
        safeguards = {
            "access_control": {
                "requirements": [
                    "Unique User Identification (§164.312(a)(2)(i))",
                    "Emergency Access Procedure (§164.312(a)(2)(ii))",
                    "Automatic Logoff (§164.312(a)(2)(iii))",
                    "Encryption and Decryption (§164.312(a)(2)(iv))"
                ],
                "findings": [],
                "score": 0.0
            },
            "audit_controls": {
                "requirements": [
                    "Audit Controls (§164.312(b))"
                ],
                "findings": [],
                "score": 0.0
            },
            "integrity": {
                "requirements": [
                    "Mechanism to Authenticate ePHI (§164.312(c)(2))"
                ],
                "findings": [],
                "score": 0.0
            },
            "person_or_entity_authentication": {
                "requirements": [
                    "Person or Entity Authentication (§164.312(d))"
                ],
                "findings": [],
                "score": 0.0
            },
            "transmission_security": {
                "requirements": [
                    "Integrity Controls (§164.312(e)(2)(i))",
                    "Encryption (§164.312(e)(2)(ii))"
                ],
                "findings": [],
                "score": 0.0
            }
        }
        
        # Evaluate safeguards based on test results
        security_results = self.results.get("security_tests", {})
        pentest_results = self.results.get("penetration_tests", {})
        
        # Extract findings for access control
        access_findings = self._extract_findings(
            security_results, pentest_results, 
            categories=["Authentication", "Authorization", "Access Control"]
        )
        
        safeguards["access_control"]["findings"] = access_findings
        safeguards["access_control"]["score"] = self._calculate_section_score(access_findings)
        
        # Extract findings for audit controls
        audit_findings = self._extract_findings(
            security_results, pentest_results,
            categories=["Audit", "Logging"]
        )
        
        safeguards["audit_controls"]["findings"] = audit_findings
        safeguards["audit_controls"]["score"] = self._calculate_section_score(audit_findings)
        
        # Extract findings for integrity
        integrity_findings = self._extract_findings(
            security_results, pentest_results,
            categories=["Integrity", "Data Protection"]
        )
        
        safeguards["integrity"]["findings"] = integrity_findings
        safeguards["integrity"]["score"] = self._calculate_section_score(integrity_findings)
        
        # Extract findings for person/entity authentication
        auth_findings = self._extract_findings(
            security_results, pentest_results,
            categories=["Authentication"]
        )
        
        safeguards["person_or_entity_authentication"]["findings"] = auth_findings
        safeguards["person_or_entity_authentication"]["score"] = self._calculate_section_score(auth_findings)
        
        # Extract findings for transmission security
        transmission_findings = self._extract_findings(
            security_results, pentest_results,
            categories=["Encryption", "Transmission Security"]
        )
        
        safeguards["transmission_security"]["findings"] = transmission_findings
        safeguards["transmission_security"]["score"] = self._calculate_section_score(transmission_findings)
        
        # Calculate overall score
        scores = [section["score"] for section in safeguards.values() if section["score"] > 0]
        overall_score = sum(scores) / len(scores) if scores else 0.0
        
        return {
            "sections": safeguards,
            "score": overall_score
        }
    
    def _assess_organizational_requirements(self) -> Dict[str, Any]:
        """Assess compliance with Organizational Requirements."""
        # Limited organizational assessment since we're focused on technical testing
        return {
            "sections": {
                "business_associate_contracts": {
                    "requirements": [
                        "Business Associate Contracts (§164.314(a))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Business associate contracts assessment requires documentation review"}
                    ],
                    "score": 50.0  # Default score
                },
                "group_health_plan_requirements": {
                    "requirements": [
                        "Group Health Plan Requirements (§164.314(b))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Group health plan requirements assessment requires documentation review"}
                    ],
                    "score": 50.0  # Default score
                }
            },
            "score": 50.0  # Default score for organizational requirements
        }
    
    def _assess_policies_procedures(self) -> Dict[str, Any]:
        """Assess compliance with Policies, Procedures, and Documentation."""
        # Limited policies assessment since we're focused on technical testing
        return {
            "sections": {
                "policies_and_procedures": {
                    "requirements": [
                        "Policies and Procedures (§164.316(a))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Policies and procedures assessment requires documentation review"}
                    ],
                    "score": 50.0  # Default score
                },
                "documentation": {
                    "requirements": [
                        "Time Limit (§164.316(b)(2)(i))",
                        "Availability (§164.316(b)(2)(ii))",
                        "Updates (§164.316(b)(2)(iii))"
                    ],
                    "findings": [
                        {"title": "Limited Assessment", "severity": "info", 
                         "description": "Documentation assessment requires documentation review"}
                    ],
                    "score": 50.0  # Default score
                }
            },
            "score": 50.0  # Default score for policies and procedures
        }
    
    def _extract_findings(self, security_results: Dict[str, Any], 
                         pentest_results: Dict[str, Any],
                         categories: List[str]) -> List[Dict[str, Any]]:
        """Extract findings related to specific categories from test results."""
        findings = []
        
        # Extract from security tests
        security_vulnerabilities = []
        if "static_analysis" in security_results:
            static_analysis = security_results.get("static_analysis", {})
            if "bandit" in static_analysis:
                security_vulnerabilities.extend(static_analysis.get("bandit", {}).get("findings", []))
            if "semgrep" in static_analysis:
                security_vulnerabilities.extend(static_analysis.get("semgrep", {}).get("findings", []))
        
        for vuln in security_vulnerabilities:
            # Map to HIPAA categories
            if any(category.lower() in vuln.get("message", "").lower() for category in categories):
                findings.append({
                    "title": vuln.get("message", "Security finding"),
                    "severity": vuln.get("severity", "medium"),
                    "description": f"Found in {vuln.get('file', 'unknown')} on line {vuln.get('line', 0)}"
                })
        
        # Extract from pentest results
        pentest_vulnerabilities = []
        if "vulnerabilities" in pentest_results:
            pentest_vulnerabilities = pentest_results.get("vulnerabilities", [])
        elif "summary" in pentest_results and "top_vulnerabilities" in pentest_results["summary"]:
            pentest_vulnerabilities = pentest_results["summary"].get("top_vulnerabilities", [])
        
        for vuln in pentest_vulnerabilities:
            # Map to HIPAA categories
            if any(category.lower() in vuln.get("category", "").lower() for category in categories):
                findings.append({
                    "title": vuln.get("title", "Penetration test finding"),
                    "severity": vuln.get("severity", "medium"),
                    "description": vuln.get("description", "No details provided")
                })
        
        return findings
    
    def _calculate_section_score(self, findings: List[Dict[str, Any]]) -> float:
        """Calculate compliance score for a section based on findings."""
        if not findings:
            return 100.0  # No findings means full compliance
        
        # Count findings by severity
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        
        for finding in findings:
            severity = finding.get("severity", "").lower()
            if severity in severity_counts:
                severity_counts[severity] += 1
        
        # Calculate score based on severity weights
        base_score = 100.0
        
        # Deduct points based on severity
        base_score -= severity_counts["critical"] * 25.0
        base_score -= severity_counts["high"] * 15.0
        base_score -= severity_counts["medium"] * 10.0
        base_score -= severity_counts["low"] * 5.0
        
        # Ensure score is within valid range
        return max(0.0, min(100.0, base_score))
    
    def _generate_recommendations(self) -> None:
        """Generate recommendations based on findings."""
        self._print_step("Generating recommendations")
        
        recommendations = {
            "high_priority": [],
            "medium_priority": [],
            "low_priority": [],
            "general": []
        }
        
        # Collect all findings
        all_findings = []
        
        # Extract findings from security tests
        security_results = self.results.get("security_tests", {})
        if "static_analysis" in security_results:
            static_analysis = security_results.get("static_analysis", {})
            if "bandit" in static_analysis:
                all_findings.extend(static_analysis.get("bandit", {}).get("findings", []))
            if "semgrep" in static_analysis:
                all_findings.extend(static_analysis.get("semgrep", {}).get("findings", []))
        
        # Extract findings from pentest results
        pentest_results = self.results.get("penetration_tests", {})
        if "vulnerabilities" in pentest_results:
            all_findings.extend(pentest_results.get("vulnerabilities", []))
        elif "summary" in pentest_results and "top_vulnerabilities" in pentest_results["summary"]:
            all_findings.extend(pentest_results["summary"].get("top_vulnerabilities", []))
        
        # Generate recommendations based on findings
        for finding in all_findings:
            severity = finding.get("severity", "").lower()
            title = finding.get("title", "")
            description = finding.get("description", "")
            recommendation = finding.get("recommendation", "Fix this security issue")
            
            if not title:
                continue
            
            rec = {
                "title": title,
                "description": description,
                "action": recommendation
            }
            
            if severity in ["critical", "high"]:
                recommendations["high_priority"].append(rec)
            elif severity == "medium":
                recommendations["medium_priority"].append(rec)
            elif severity == "low":
                recommendations["low_priority"].append(rec)
            else:
                recommendations["general"].append(rec)
        
        # Add general HIPAA recommendations if needed
        if not recommendations["general"]:
            recommendations["general"] = [
                {
                    "title": "Regular Security Risk Assessments",
                    "description": "HIPAA requires regular security risk assessments",
                    "action": "Implement a schedule for regular security assessments"
                },
                {
                    "title": "Security Training",
                    "description": "HIPAA requires security awareness training for staff",
                    "action": "Conduct regular security training sessions"
                },
                {
                    "title": "Incident Response Plan",
                    "description": "HIPAA requires a plan for responding to security incidents",
                    "action": "Develop and test an incident response plan"
                }
            ]
        
        self.results["recommendations"] = recommendations
        self._print_success(f"Generated {len(recommendations['high_priority'])} high priority recommendations")
    
    def _calculate_summary(self) -> None:
        """Calculate the summary statistics."""
        self._print_step("Calculating summary")
        
        # Get HIPAA compliance score
        hipaa_compliance = self.results.get("hipaa_compliance", {})
        compliance_score = hipaa_compliance.get("overall_score", 0.0)
        
        # Count findings by severity
        critical_count = 0
        high_count = 0
        medium_count = 0
        low_count = 0
        
        # Count from security tests
        security_results = self.results.get("security_tests", {})
        if "static_analysis" in security_results:
            static_analysis = security_results.get("static_analysis", {})
            high_count += static_analysis.get("high_severity_count", 0)
            medium_count += static_analysis.get("medium_severity_count", 0)
            low_count += static_analysis.get("low_severity_count", 0)
        
        # Count from pentest results
        pentest_results = self.results.get("penetration_tests", {})
        if "summary" in pentest_results:
            summary = pentest_results.get("summary", {})
            critical_count += summary.get("critical_count", 0)
            high_count += summary.get("high_count", 0)
            medium_count += summary.get("medium_count", 0)
            low_count += summary.get("low_count", 0)
        
        # Update summary
        summary = {
            "timestamp": datetime.datetime.now().isoformat(),
            "hipaa_compliant": compliance_score >= 80.0 and critical_count == 0 and high_count <= 1,
            "compliance_score": compliance_score,
            "critical_findings": critical_count,
            "high_findings": high_count,
            "medium_findings": medium_count,
            "low_findings": low_count,
        }
        
        self.results["summary"] = summary
        
        # Print summary
        compliance_status = "COMPLIANT" if summary["hipaa_compliant"] else "NON-COMPLIANT"
        color = TermColors.GREEN if summary["hipaa_compliant"] else TermColors.RED
        
        print(f"\nHIPAA Compliance Status: {color}{compliance_status}{TermColors.ENDC}")
        print(f"Compliance Score: {compliance_score:.2f}%")
        print(f"Critical Findings: {critical_count}")
        print(f"High Findings: {high_count}")
        print(f"Medium Findings: {medium_count}")
        print(f"Low Findings: {low_count}")
    
    def _generate_reports(self) -> None:
        """Generate the final reports."""
        self._print_step("Generating reports")
        
        # Create reports directory
        reports_dir = os.path.join(self.output_dir, "reports")
        os.makedirs(reports_dir, exist_ok=True)
        
        # Save full results
        full_report_path = os.path.join(reports_dir, "full_compliance_report.json")
        with open(full_report_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        # Save summary report
        summary_report_path = os.path.join(reports_dir, "compliance_summary.json")
        with open(summary_report_path, 'w') as f:
            summary = {
                "summary": self.results["summary"],
                "hipaa_compliance": {
                    "score": self.results["hipaa_compliance"].get("overall_score", 0.0),
                    "administrative_safeguards": self.results["hipaa_compliance"].get("administrative_safeguards", {}).get("score", 0.0),
                    "technical_safeguards": self.results["hipaa_compliance"].get("technical_safeguards", {}).get("score", 0.0),
                    "physical_safeguards": self.results["hipaa_compliance"].get("physical_safeguards", {}).get("score", 0.0)
                },
                "high_priority_recommendations": self.results["recommendations"].get("high_priority", [])
            }
            json.dump(summary, f, indent=2)
        
        # Generate HTML report (optional future enhancement)
        
        self._print_success(f"Reports saved to {reports_dir}")
    
    # Utility methods
    def _print_header(self, title: str) -> None:
        """Print a formatted section header."""
        print("\n" + "=" * 80)
        print(f"{TermColors.HEADER}{TermColors.BOLD}{title}{TermColors.ENDC}")
        print("=" * 80)
    
    def _print_step(self, step: str) -> None:
        """Print a step in the testing process."""
        print(f"\n{TermColors.BLUE}➤ {step}{TermColors.ENDC}")
    
    def _print_success(self, message: str) -> None:
        """Print a success message."""
        print(f"{TermColors.GREEN}[PASS] {message}{TermColors.ENDC}")
    
    def _print_warning(self, message: str) -> None:
        """Print a warning message."""
        print(f"{TermColors.YELLOW}[WARN] {message}{TermColors.ENDC}")
    
    def _print_error(self, message: str) -> None:
        """Print an error message."""
        print(f"{TermColors.RED}[FAIL] {message}{TermColors.ENDC}")


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="HIPAA Compliance Test Workflow"
    )
    
    parser.add_argument(
        "--output-dir",
        default="hipaa_compliance_reports",
        help="Directory to store reports"
    )
    
    parser.add_argument(
        "--api-url",
        default="http://localhost:8000",
        help="URL of the API to test"
    )
    
    parser.add_argument(
        "--skip-phases",
        help="Comma-separated list of phases to skip"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print verbose output"
    )
    
    return parser.parse_args()


if __name__ == "__main__":
    # Parse arguments
    args = parse_arguments()
    
    # Parse skip phases
    skip_phases = []
    if args.skip_phases:
        skip_phases = [phase.strip() for phase in args.skip_phases.split(",")]
    
    # Create and run workflow
    workflow = HIPAAComplianceWorkflow(
        output_dir=args.output_dir,
        api_url=args.api_url,
        skip_phases=skip_phases,
        verbose=args.verbose
    )
    
    # Run the workflow
    results = workflow.run_workflow()
    
    # Exit with appropriate status code
    sys.exit(0 if results["summary"]["hipaa_compliant"] else 1)