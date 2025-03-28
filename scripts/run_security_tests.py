#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Security Test Runner for NOVAMIND HIPAA Compliance

This script analyzes security scan results from various tools and identifies
critical security issues that need immediate attention.

Usage:
    python run_security_tests.py --check-critical --input-dir reports/security
"""
import argparse
import json
import os
import sys
from typing import List, Dict, Any, Optional


def load_json_file(filepath: str) -> Optional[Dict[str, Any]]:
    """Load a JSON file safely, returning None if the file doesn't exist or is invalid."""
    if not os.path.exists(filepath):
        print(f"Warning: File {filepath} does not exist.")
        return None
    
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"Error: File {filepath} contains invalid JSON.")
        return None
    except Exception as e:
        print(f"Error loading {filepath}: {str(e)}")
        return None


def check_bandit_results(input_dir: str) -> List[str]:
    """Check Bandit static code analysis results for high severity issues."""
    issues = []
    bandit_file = os.path.join(input_dir, 'bandit-results.json')
    data = load_json_file(bandit_file)
    
    if data:
        high_severity_count = 0
        for result in data.get('results', []):
            if result.get('issue_severity', '').upper() == 'HIGH':
                high_severity_count += 1
                issue_text = result.get('issue_text', 'Unknown')
                filename = result.get('filename', 'Unknown')
                line = result.get('line_number', 0)
                issues.append(f"HIGH severity issue in {filename}:{line} - {issue_text}")
                
                # Limit to top 5 issues for clarity
                if len(issues) >= 5:
                    issues.append(f"... and {high_severity_count - 5} more high severity issues")
                    break
    
    return issues


def check_safety_results(input_dir: str) -> List[str]:
    """Check Safety vulnerability scan results."""
    issues = []
    safety_file = os.path.join(input_dir, 'safety-report.json')
    data = load_json_file(safety_file)
    
    if data:
        vulnerabilities = data.get('vulnerabilities', [])
        if vulnerabilities:
            for i, vuln in enumerate(vulnerabilities[:5]):
                package = vuln.get('package_name', 'Unknown')
                version = vuln.get('installed_version', 'Unknown')
                vulnerability = vuln.get('vulnerability', 'Unknown')
                issues.append(f"Vulnerable dependency: {package} {version} - {vulnerability}")
            
            if len(vulnerabilities) > 5:
                issues.append(f"... and {len(vulnerabilities) - 5} more vulnerable dependencies")
    
    return issues


def check_secrets_results(input_dir: str) -> List[str]:
    """Check for detected secrets in code."""
    issues = []
    secrets_file = os.path.join(input_dir, 'secrets-scan.json')
    data = load_json_file(secrets_file)
    
    if data:
        results = data.get('results', {})
        if results:
            secret_count = len(results)
            issues.append(f"Found {secret_count} potential secrets in the codebase")
            
            # List a few examples
            count = 0
            for filepath, secrets in results.items():
                if isinstance(secrets, list):
                    for secret in secrets:
                        line = secret.get('line_number', 'Unknown')
                        type_str = secret.get('type', 'Unknown')
                        issues.append(f"Secret detected: {filepath}:{line} - Type: {type_str}")
                        count += 1
                        if count >= 3:
                            break
                if count >= 3:
                    break
    
    return issues


def check_phi_patterns(input_dir: str) -> List[str]:
    """Check for PHI patterns in code."""
    issues = []
    phi_file = os.path.join(input_dir, 'phi-patterns-scan.json')
    data = load_json_file(phi_file)
    
    if data:
        phi_findings = data.get('findings', [])
        if phi_findings:
            issues.append(f"Found {len(phi_findings)} potential PHI patterns in code")
            
            # List a few examples
            for i, finding in enumerate(phi_findings[:3]):
                filepath = finding.get('file', 'Unknown')
                line = finding.get('line', 'Unknown')
                pattern = finding.get('pattern', 'Unknown')
                issues.append(f"Potential PHI: {filepath}:{line} - Pattern: {pattern}")
            
            if len(phi_findings) > 3:
                issues.append(f"... and {len(phi_findings) - 3} more PHI findings")
    
    return issues


def main():
    parser = argparse.ArgumentParser(description='Run HIPAA security compliance checks')
    parser.add_argument('--check-critical', action='store_true', help='Check for critical security issues')
    parser.add_argument('--input-dir', type=str, default='reports/security', 
                      help='Directory containing security scan results')
    args = parser.parse_args()
    
    if args.check_critical:
        print("Checking for critical security issues...")
        
        # Initialize lists to store issues
        all_issues = []
        
        # Check each security scan result
        all_issues.extend(check_bandit_results(args.input_dir))
        all_issues.extend(check_safety_results(args.input_dir))
        all_issues.extend(check_secrets_results(args.input_dir))
        all_issues.extend(check_phi_patterns(args.input_dir))
        
        # Report findings
        if all_issues:
            print("\n🚨 CRITICAL SECURITY ISSUES FOUND 🚨")
            for issue in all_issues:
                print(f"- {issue}")
            print("\nReview the full security reports for details.")
            sys.exit(1)
        else:
            print("✅ No critical security issues found")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()