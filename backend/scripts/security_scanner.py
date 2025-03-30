#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HIPAA Security Scanner
=====================

A specialized security scanning tool for HIPAA compliance verification in the
Novamind Concierge Psychiatry Platform. This scanner analyzes code for common
HIPAA security violations, PHI handling issues, and other security vulnerabilities.

The scanner looks for:
1. PHI data leaks (in logs, errors, etc.)
2. Authentication and authorization vulnerabilities
3. Encryption issues for sensitive data
4. HIPAA-specific compliance violations
5. Common security vulnerabilities (XSS, CSRF, injection, etc.)

Usage:
    python security_scanner.py [--full] [--report] [--report-format=FORMAT] [--output-dir=DIR]
    
Options:
    --full               Run a full deep scan (slower but more thorough)
    --report             Generate comprehensive reports
    --report-format      Report format: 'json', 'markdown', 'html' (default: json)
    --output-dir         Directory to save reports (default: 'reports')
"""

import os
import re
import sys
import json
import time
import argparse
import datetime
from pathlib import Path
from typing import Dict, List, Set, Any, Optional, Tuple, Pattern

# ANSI colors for terminal output
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
BOLD = "\033[1m"
NC = "\033[0m"  # No Color


class SecurityIssue:
    """Represents a security issue found during scanning."""
    
    def __init__(
        self,
        issue_type: str,
        severity: str,
        filename: str,
        line_number: int,
        code: str,
        description: str,
        recommendation: str
    ):
        """Initialize a security issue."""
        self.issue_type = issue_type
        self.severity = severity.upper()  # HIGH, MEDIUM, LOW
        self.filename = filename
        self.line_number = line_number
        self.code = code
        self.description = description
        self.recommendation = recommendation
        self.timestamp = datetime.datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "issue_type": self.issue_type,
            "severity": self.severity,
            "filename": self.filename,
            "line_number": self.line_number,
            "code": self.code,
            "description": self.description,
            "recommendation": self.recommendation,
            "timestamp": self.timestamp
        }
    
    def format_for_terminal(self) -> str:
        """Format the issue for terminal display."""
        severity_color = {
            "HIGH": RED,
            "MEDIUM": YELLOW,
            "LOW": BLUE
        }.get(self.severity, BLUE)
        
        return (
            f"{severity_color}{BOLD}[{self.severity}]{NC} {self.issue_type}\n"
            f"File: {self.filename}:{self.line_number}\n"
            f"Code: {self.code}\n"
            f"Description: {self.description}\n"
            f"Recommendation: {self.recommendation}\n"
        )


class HIPAASecurityScanner:
    """Security scanner specialized for HIPAA compliance."""
    
    def __init__(
        self,
        root_dir: str = ".",
        full_scan: bool = False,
        excluded_dirs: Optional[List[str]] = None
    ):
        """Initialize scanner with configuration options."""
        self.root_dir = root_dir
        self.full_scan = full_scan
        self.excluded_dirs = excluded_dirs or [
            "venv", "node_modules", ".git", "__pycache__", "migrations"
        ]
        self.issues = []
        
        # Initialize patterns for different security issues
        self._init_patterns()
    
    def _init_patterns(self) -> None:
        """Initialize detection patterns for various security issues."""
        # PHI Data Leakage Patterns
        self.phi_patterns = {
            # Logging PHI
            r'log\s*\.(info|warning|error|debug|critical)\s*\(.*(patient|medical|health|record|ssn|dob|name|email|address|phone|\bdob\b|\bssn\b)': {
                "issue_type": "PHI Logging",
                "severity": "HIGH",
                "description": "Potential PHI data being logged",
                "recommendation": "Redact PHI before logging. Use the PHIFilter logging handler."
            },
            
            # Sensitive data in exceptions
            r'raise\s+\w+\(.*(patient|medical|health|record|ssn|dob|name)': {
                "issue_type": "PHI in Exception",
                "severity": "HIGH",
                "description": "Potential PHI data in exception message",
                "recommendation": "Redact PHI before including in exception messages."
            },
            
            # Hard-coded patient info
            r'(patient|medical|health)\w*\s*=\s*[\'"]': {
                "issue_type": "Hard-coded PHI",
                "severity": "HIGH",
                "description": "Possible hard-coded patient information",
                "recommendation": "Never hard-code PHI. Use secure storage and retrieval mechanisms."
            }
        }
        
        # Authentication & Authorization Issues
        self.auth_patterns = {
            # Missing auth checks
            r'def\s+\w+\s*\([^)]*\):\s*(?!.*auth)': {
                "issue_type": "Missing Authentication",
                "severity": "MEDIUM",
                "description": "Endpoint may be missing authentication checks",
                "recommendation": "Ensure all endpoints properly verify authentication."
            },
            
            # Hard-coded credentials
            r'(password|token|secret|key)\s*=\s*[\'"][^\'"]+[\'"]': {
                "issue_type": "Hard-coded Credentials",
                "severity": "HIGH",
                "description": "Hard-coded credentials detected",
                "recommendation": "Move credentials to secure environment variables or secret management."
            },
            
            # JWT without verification
            r'jwt\s*\.\s*decode\s*\(.+verify\s*=\s*False': {
                "issue_type": "Insecure JWT Handling",
                "severity": "HIGH",
                "description": "JWT token decoded without verification",
                "recommendation": "Always verify JWT signatures and check expiration."
            }
        }
        
        # Encryption Issues
        self.encryption_patterns = {
            # Unencrypted PHI
            r'(patient|medical|health)\w*\s*=\s*': {
                "issue_type": "Potentially Unencrypted PHI",
                "severity": "MEDIUM",
                "description": "PHI data might be stored without encryption",
                "recommendation": "Ensure all PHI is encrypted at rest and in transit."
            },
            
            # Weak encryption
            r'(md5|sha1)\s*\(': {
                "issue_type": "Weak Hashing Algorithm",
                "severity": "HIGH",
                "description": "Weak hashing algorithm used",
                "recommendation": "Use strong algorithms like SHA-256 or better."
            },
            
            # Insecure TLS
            r'ssl_version\s*=\s*[\'"]SSLv[23][\'"]': {
                "issue_type": "Insecure TLS Version",
                "severity": "HIGH",
                "description": "Insecure SSL/TLS version specified",
                "recommendation": "Use TLS 1.2 or later."
            }
        }
        
        # General Security Issues
        self.security_patterns = {
            # SQL Injection
            r'execute\s*\(\s*[\'"][^\'"]*\s*\%\s*': {
                "issue_type": "SQL Injection Risk",
                "severity": "HIGH",
                "description": "Potential SQL injection vulnerability",
                "recommendation": "Use parameterized queries or an ORM."
            },
            
            # XSS
            r'html\s*=\s*': {
                "issue_type": "XSS Vulnerability",
                "severity": "MEDIUM",
                "description": "Potential XSS vulnerability",
                "recommendation": "Use proper content sanitization and escaping."
            },
            
            # CSRF token missing
            r'@app\s*\.\s*(post|put|delete)': {
                "issue_type": "CSRF Protection",
                "severity": "MEDIUM",
                "description": "Endpoint might be missing CSRF protection",
                "recommendation": "Implement proper CSRF token validation."
            },
            
            # Timing attacks
            r'if\s+\w+\s*==\s*': {
                "issue_type": "Timing Attack Risk",
                "severity": "LOW",
                "description": "Potential timing attack vulnerability in sensitive comparison",
                "recommendation": "Use constant-time comparison for secrets."
            }
        }
        
        # HIPAA Compliance Issues
        self.hipaa_patterns = {
            # Missing audit trail
            r'(update|delete|remove)\s*\(': {
                "issue_type": "Audit Trail",
                "severity": "MEDIUM",
                "description": "Database operation may be missing audit trail",
                "recommendation": "Implement proper audit logging for all data modifications."
            },
            
            # Potential data retention issues
            r'(archive|purge|clean)\s*\(': {
                "issue_type": "Data Retention",
                "severity": "MEDIUM",
                "description": "Check data retention compliance",
                "recommendation": "Ensure data retention policies comply with HIPAA requirements."
            }
        }
    
    def scan(self) -> List[SecurityIssue]:
        """Run a comprehensive security scan."""
        start_time = time.time()
        
        print(f"{BLUE}{BOLD}Starting HIPAA Security Scan...{NC}")
        print(f"Mode: {'Full Scan' if self.full_scan else 'Quick Scan'}")
        print(f"Root Directory: {self.root_dir}")
        print(f"Excluded Directories: {', '.join(self.excluded_dirs)}")
        print("=" * 70)
        
        # Get all relevant files
        files = self._get_files_to_scan()
        print(f"Found {len(files)} files to scan.")
        
        # Scan each file
        for i, file_path in enumerate(files):
            print(f"Scanning ({i+1}/{len(files)}): {file_path}", end="\r")
            self._scan_file(file_path)
        
        # Print stats
        end_time = time.time()
        duration = end_time - start_time
        print("\n" + "=" * 70)
        print(f"Scan completed in {duration:.2f} seconds")
        
        issue_counts = self._count_issues_by_severity()
        print(f"Found {len(self.issues)} potential security issues:")
        print(f"  HIGH: {issue_counts.get('HIGH', 0)}")
        print(f"  MEDIUM: {issue_counts.get('MEDIUM', 0)}")
        print(f"  LOW: {issue_counts.get('LOW', 0)}")
        
        # Show high-severity issues
        if issue_counts.get('HIGH', 0) > 0:
            print("\nHigh Severity Issues:")
            for issue in self.issues:
                if issue.severity == "HIGH":
                    print(issue.format_for_terminal())
        
        return self.issues
    
    def _get_files_to_scan(self) -> List[str]:
        """Get a list of files to scan based on configuration."""
        files_to_scan = []
        extensions = ['.py', '.js', '.ts', '.html', '.sql', '.yml', '.yaml']
        
        for root, dirs, files in os.walk(self.root_dir):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in self.excluded_dirs]
            
            for file in files:
                # Only scan relevant file types
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    files_to_scan.append(file_path)
        
        return files_to_scan
    
    def _scan_file(self, file_path: str) -> None:
        """Scan a single file for security issues."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                # Skip empty files
                if not content.strip():
                    return
                
                # Check all patterns for this file
                self._check_patterns(file_path, lines, self.phi_patterns)
                self._check_patterns(file_path, lines, self.auth_patterns)
                self._check_patterns(file_path, lines, self.encryption_patterns)
                self._check_patterns(file_path, lines, self.security_patterns)
                self._check_patterns(file_path, lines, self.hipaa_patterns)
                
                # Run additional deep scan checks
                if self.full_scan:
                    self._deep_scan(file_path, lines)
                
        except UnicodeDecodeError:
            # Skip binary files
            return
        except Exception as e:
            print(f"Error scanning {file_path}: {str(e)}")
    
    def _check_patterns(
        self,
        file_path: str,
        lines: List[str],
        patterns: Dict[str, Dict[str, str]]
    ) -> None:
        """Check a set of patterns against file content."""
        for i, line in enumerate(lines):
            line_number = i + 1
            
            for pattern, issue_info in patterns.items():
                if re.search(pattern, line, re.IGNORECASE):
                    # Skip false positives in common patterns
                    if self._is_false_positive(line, pattern):
                        continue
                    
                    # Create a new issue
                    issue = SecurityIssue(
                        issue_type=issue_info["issue_type"],
                        severity=issue_info["severity"],
                        filename=file_path,
                        line_number=line_number,
                        code=line.strip(),
                        description=issue_info["description"],
                        recommendation=issue_info["recommendation"]
                    )
                    
                    self.issues.append(issue)
    
    def _is_false_positive(self, line: str, pattern: str) -> bool:
        """Check if a match is likely a false positive."""
        # Skip comments
        if re.match(r'^\s*#', line):
            return True
        
        # Skip test assertions
        if 'assert' in line.lower() and 'test' in line.lower():
            return True
        
        # Add more false positive checks here
        
        return False
    
    def _deep_scan(self, file_path: str, lines: List[str]) -> None:
        """Perform more intensive scanning for the full scan mode."""
        # Check for proper HIPAA error handling
        self._check_hipaa_error_handling(file_path, lines)
        
        # Check for authorization in critical paths
        self._check_critical_auth_paths(file_path, lines)
        
        # Check for proper encryption usage
        self._check_encryption_usage(file_path, lines)
    
    def _check_hipaa_error_handling(self, file_path: str, lines: List[str]) -> None:
        """Check for proper HIPAA-compliant error handling."""
        # Look for catch-all exception handlers without proper PHI redaction
        in_try_block = False
        try_start_line = 0
        
        for i, line in enumerate(lines):
            if re.search(r'^\s*try\s*:', line):
                in_try_block = True
                try_start_line = i + 1
            elif in_try_block and re.search(r'^\s*except(\s+\w+)?:', line):
                # Check for overly broad exception handlers
                if re.search(r'^\s*except\s*:', line):
                    self.issues.append(SecurityIssue(
                        issue_type="Broad Exception Handler",
                        severity="MEDIUM",
                        filename=file_path,
                        line_number=i + 1,
                        code=line.strip(),
                        description="Broad exception handler may leak PHI in error messages",
                        recommendation="Use specific exception types and ensure PHI is redacted from errors"
                    ))
                
                # Check next few lines for lack of PHI handling
                has_phi_handling = False
                for j in range(i + 1, min(i + 6, len(lines))):
                    if 'phi' in lines[j].lower() or 'redact' in lines[j].lower():
                        has_phi_handling = True
                        break
                
                if not has_phi_handling and any('patient' in l.lower() for l in lines[try_start_line:i]):
                    self.issues.append(SecurityIssue(
                        issue_type="Missing PHI Error Handling",
                        severity="MEDIUM",
                        filename=file_path,
                        line_number=i + 1,
                        code=line.strip(),
                        description="Exception handler may not properly protect PHI",
                        recommendation="Ensure all exception handlers redact PHI from error messages"
                    ))
                
                in_try_block = False
    
    def _check_critical_auth_paths(self, file_path: str, lines: List[str]) -> None:
        """Check for proper authorization in critical code paths."""
        # Check for patient data access without authorization checks
        in_patient_function = False
        has_auth_check = False
        func_start_line = 0
        
        for i, line in enumerate(lines):
            # Detect function definitions related to patient data
            if re.search(r'def\s+\w*(patient|record|medical|health)\w*\s*\(', line, re.IGNORECASE):
                in_patient_function = True
                has_auth_check = False
                func_start_line = i + 1
            
            # Look for auth checks
            elif in_patient_function:
                if 'auth' in line.lower() or 'permission' in line.lower() or 'access' in line.lower():
                    has_auth_check = True
                
                # End of function detected
                elif re.search(r'^\s*def\s+', line) or i == len(lines) - 1:
                    if not has_auth_check:
                        self.issues.append(SecurityIssue(
                            issue_type="Missing Authorization",
                            severity="HIGH",
                            filename=file_path,
                            line_number=func_start_line,
                            code="<patient data access function>",
                            description="Function handling patient data may not verify authorization",
                            recommendation="Add explicit authorization checks for all patient data access"
                        ))
                    
                    in_patient_function = False
    
    def _check_encryption_usage(self, file_path: str, lines: List[str]) -> None:
        """Check for proper encryption of sensitive data."""
        # Look for proper encryption of PHI
        has_phi_data = False
        has_encryption = False
        
        for i, line in enumerate(lines):
            if re.search(r'(patient|medical|health|record|ssn|dob)\w*\s*=', line, re.IGNORECASE):
                has_phi_data = True
            
            if 'encrypt' in line.lower() or 'crypt' in line.lower():
                has_encryption = True
        
        # If PHI data is handled but no encryption is visible
        if has_phi_data and not has_encryption and not 'test' in file_path.lower():
            self.issues.append(SecurityIssue(
                issue_type="Possible Unencrypted PHI",
                severity="HIGH",
                filename=file_path,
                line_number=1,  # Whole file issue
                code="<PHI data handling without encryption>",
                description="File appears to handle PHI without encryption",
                recommendation="Ensure all PHI is encrypted at rest and in transit"
            ))
    
    def _count_issues_by_severity(self) -> Dict[str, int]:
        """Count issues by severity level."""
        counts = {}
        for issue in self.issues:
            counts[issue.severity] = counts.get(issue.severity, 0) + 1
        return counts
    
    def save_report(self, format_type: str, output_dir: str) -> str:
        """Save scan results to a report file."""
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"hipaa_security_scan_{timestamp}"
        
        if format_type == 'json':
            return self._save_json_report(filename, output_dir)
        elif format_type == 'markdown':
            return self._save_markdown_report(filename, output_dir)
        elif format_type == 'html':
            return self._save_html_report(filename, output_dir)
        else:
            print(f"Unknown report format: {format_type}")
            return self._save_json_report(filename, output_dir)
    
    def _save_json_report(self, filename: str, output_dir: str) -> str:
        """Save scan results in JSON format."""
        filepath = os.path.join(output_dir, f"{filename}.json")
        
        report_data = {
            "scan_timestamp": datetime.datetime.now().isoformat(),
            "scan_mode": "full" if self.full_scan else "quick",
            "root_directory": self.root_dir,
            "issues_count": len(self.issues),
            "issues": [issue.to_dict() for issue in self.issues]
        }
        
        with open(filepath, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"JSON report saved to: {filepath}")
        return filepath
    
    def _save_markdown_report(self, filename: str, output_dir: str) -> str:
        """Save scan results in Markdown format."""
        filepath = os.path.join(output_dir, f"{filename}.md")
        
        with open(filepath, 'w') as f:
            f.write("# HIPAA Security Scan Report\n\n")
            
            # Scan information
            f.write("## Scan Information\n\n")
            f.write(f"- **Timestamp:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"- **Scan Mode:** {'Full Scan' if self.full_scan else 'Quick Scan'}\n")
            f.write(f"- **Root Directory:** {self.root_dir}\n")
            f.write(f"- **Issues Found:** {len(self.issues)}\n\n")
            
            # Summary by severity
            issue_counts = self._count_issues_by_severity()
            f.write("## Summary\n\n")
            f.write("| Severity | Count |\n")
            f.write("|----------|-------|\n")
            f.write(f"| HIGH | {issue_counts.get('HIGH', 0)} |\n")
            f.write(f"| MEDIUM | {issue_counts.get('MEDIUM', 0)} |\n")
            f.write(f"| LOW | {issue_counts.get('LOW', 0)} |\n\n")
            
            # High Severity Issues
            f.write("## High Severity Issues\n\n")
            high_issues = [issue for issue in self.issues if issue.severity == "HIGH"]
            if high_issues:
                for i, issue in enumerate(high_issues, 1):
                    f.write(f"### {i}. {issue.issue_type}\n\n")
                    f.write(f"**File:** {issue.filename}:{issue.line_number}\n\n")
                    f.write(f"**Code:**\n```\n{issue.code}\n```\n\n")
                    f.write(f"**Description:** {issue.description}\n\n")
                    f.write(f"**Recommendation:** {issue.recommendation}\n\n")
            else:
                f.write("No high severity issues found.\n\n")
            
            # Medium Severity Issues
            f.write("## Medium Severity Issues\n\n")
            medium_issues = [issue for issue in self.issues if issue.severity == "MEDIUM"]
            if medium_issues:
                for i, issue in enumerate(medium_issues, 1):
                    f.write(f"### {i}. {issue.issue_type}\n\n")
                    f.write(f"**File:** {issue.filename}:{issue.line_number}\n\n")
                    f.write(f"**Code:**\n```\n{issue.code}\n```\n\n")
                    f.write(f"**Description:** {issue.description}\n\n")
                    f.write(f"**Recommendation:** {issue.recommendation}\n\n")
            else:
                f.write("No medium severity issues found.\n\n")
            
            # Low Severity Issues (summarized)
            f.write("## Low Severity Issues\n\n")
            low_issues = [issue for issue in self.issues if issue.severity == "LOW"]
            if low_issues:
                f.write("| Issue Type | File | Line |\n")
                f.write("|------------|------|------|\n")
                for issue in low_issues:
                    f.write(f"| {issue.issue_type} | {issue.filename} | {issue.line_number} |\n")
            else:
                f.write("No low severity issues found.\n\n")
            
            # Recommendations
            f.write("## Recommendations\n\n")
            recommendations = {}
            for issue in self.issues:
                if issue.recommendation not in recommendations:
                    recommendations[issue.recommendation] = 0
                recommendations[issue.recommendation] += 1
            
            for recommendation, count in recommendations.items():
                f.write(f"- {recommendation} ({count} issues)\n")
        
        print(f"Markdown report saved to: {filepath}")
        return filepath
    
    def _save_html_report(self, filename: str, output_dir: str) -> str:
        """Save scan results in HTML format."""
        filepath = os.path.join(output_dir, f"{filename}.html")
        
        # Generate the markdown report first
        md_filepath = self._save_markdown_report(filename, output_dir)
        
        # Read the markdown content
        with open(md_filepath, 'r') as f:
            md_content = f.read()
        
        # Simple HTML wrapper
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HIPAA Security Scan Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #2980b9; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }}
        h3 {{ color: #3498db; }}
        table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        code {{ background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 3px; padding: 2px 5px; }}
        pre {{ background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 3px; padding: 10px; overflow-x: auto; }}
        .high {{ color: #e74c3c; }}
        .medium {{ color: #f39c12; }}
        .low {{ color: #3498db; }}
    </style>
</head>
<body>
    {md_content}
</body>
</html>
"""
        
        # Save the HTML file
        with open(filepath, 'w') as f:
            f.write(html_content)
        
        print(f"HTML report saved to: {filepath}")
        return filepath


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="HIPAA Security Scanner")
    parser.add_argument(
        "--full", 
        action="store_true", 
        help="Run a full deep scan (slower but more thorough)"
    )
    parser.add_argument(
        "--report", 
        action="store_true", 
        help="Generate a report of findings"
    )
    parser.add_argument(
        "--report-format", 
        choices=["json", "markdown", "html"], 
        default="json",
        help="Report format (default: json)"
    )
    parser.add_argument(
        "--output-dir", 
        default="reports",
        help="Directory to save reports (default: 'reports')"
    )
    
    return parser.parse_args()


def main():
    """Main entry point for the scanner."""
    args = parse_args()
    
    print(f"\n{BLUE}{BOLD}HIPAA Security Scanner{NC}")
    print("====================")
    
    scanner = HIPAASecurityScanner(
        root_dir=".",
        full_scan=args.full
    )
    
    issues = scanner.scan()
    
    if args.report:
        scanner.save_report(args.report_format, args.output_dir)
    
    if len(issues) == 0:
        print(f"\n{GREEN}No security issues found!{NC}")
        return 0
    else:
        high_count = sum(1 for issue in issues if issue.severity == "HIGH")
        
        if high_count > 0:
            print(f"\n{RED}{BOLD}Found {high_count} high severity issues that require immediate attention!{NC}")
            return 1
        else:
            print(f"\n{YELLOW}{BOLD}Found issues to address, but no critical vulnerabilities.{NC}")
            return 0


if __name__ == "__main__":
    sys.exit(main())