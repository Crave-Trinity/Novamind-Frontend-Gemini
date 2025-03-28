#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HIPAA Test Coverage Checker

This script runs pytest with coverage analysis, identifies modules with
insufficient test coverage, and provides a prioritized list of modules that
need additional tests to reach the HIPAA-required 80% coverage threshold.

The script focuses on critical areas first:
1. Security and PHI handling modules
2. Core utility modules
3. Domain entities and services
4. Application services
"""

import os
import sys
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional


class CoverageChecker:
    """Handles test coverage checking and reporting."""

    def __init__(self, project_dir: str = "."):
        """Initialize the CoverageChecker.
        
        Args:
            project_dir: The project root directory
        """
        self.project_dir = project_dir
        self.coverage_threshold = 80.0  # HIPAA requirement
        self.reports_dir = os.path.join(project_dir, "coverage-reports")
        self.xml_report = os.path.join(self.reports_dir, "coverage.xml")
        self.html_report_dir = os.path.join(self.reports_dir, "html")
        
        # Priority order for modules (highest priority first)
        self.priority_paths = [
            "app/infrastructure/security/",
            "app/core/utils/",
            "app/domain/entities/",
            "app/domain/services/",
            "app/application/services/",
        ]
        
        # Files to exclude from coverage concerns
        self.exclude_patterns = [
            r"__init__\.py$",
            r".*_test\.py$",
            r".*\.pyc$",
            r"conftest\.py$",
            r"test_.*\.py$",
            r".*\/migrations\/.*",
            r".*\/tests\/.*",
            r".*\/presentation\/web\/.*"
        ]
        
        # Ensure reports directory exists
        os.makedirs(self.reports_dir, exist_ok=True)
        os.makedirs(self.html_report_dir, exist_ok=True)

    def _is_excluded(self, file_path: str) -> bool:
        """Check if a file should be excluded from coverage analysis.
        
        Args:
            file_path: The file path to check
            
        Returns:
            bool: True if the file should be excluded
        """
        import re
        for pattern in self.exclude_patterns:
            if re.search(pattern, file_path):
                return True
        return False

    def run_coverage(self) -> bool:
        """Run pytest with coverage.
        
        Returns:
            bool: True if the command completed successfully
        """
        print("🔍 Running pytest with coverage analysis...")
        
        cmd = [
            "pytest",
            "--cov=app",
            "--cov-report=xml:" + self.xml_report,
            "--cov-report=html:" + self.html_report_dir,
            "--cov-report=term-missing"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print("❌ Failed to run coverage analysis.")
            print(f"Error: {result.stderr}")
            return False
            
        print("✅ Coverage analysis completed.")
        print(result.stdout)
        return True

    def parse_coverage_xml(self) -> Tuple[Dict[str, Dict[str, Any]], float]:
        """Parse the coverage XML report.
        
        Returns:
            Tuple containing:
            - Dict mapping file paths to their coverage data
            - Overall coverage percentage
        """
        if not os.path.exists(self.xml_report):
            print(f"❌ Coverage XML report not found at {self.xml_report}")
            return {}, 0.0
            
        try:
            tree = ET.parse(self.xml_report)
            root = tree.getroot()
            
            # Get overall coverage
            overall_coverage = float(root.attrib.get('line-rate', '0')) * 100
            
            # Get coverage for each file
            coverage_data = {}
            for package in root.findall('.//package'):
                for class_elem in package.findall('.//class'):
                    file_path = class_elem.attrib.get('filename', '')
                    
                    # Skip excluded files
                    if self._is_excluded(file_path):
                        continue
                        
                    line_rate = float(class_elem.attrib.get('line-rate', '0')) * 100
                    
                    # Get line hits data
                    line_hits = {}
                    for line in class_elem.findall('.//line'):
                        line_number = int(line.attrib.get('number', '0'))
                        hits = int(line.attrib.get('hits', '0'))
                        line_hits[line_number] = hits
                    
                    coverage_data[file_path] = {
                        'line_rate': line_rate,
                        'line_hits': line_hits,
                        'branches': [],  # Placeholder for branch coverage
                        'missing_lines': [ln for ln, hits in line_hits.items() if hits == 0]
                    }
            
            return coverage_data, overall_coverage
        except Exception as e:
            print(f"❌ Failed to parse coverage report: {str(e)}")
            return {}, 0.0

    def get_low_coverage_modules(
        self, 
        coverage_data: Dict[str, Dict[str, Any]], 
        threshold: float = 50.0
    ) -> List[Dict[str, Any]]:
        """Identify modules with coverage below the specified threshold.
        
        Args:
            coverage_data: Coverage data from parse_coverage_xml
            threshold: Coverage threshold percentage
            
        Returns:
            List of low-coverage modules with their data
        """
        low_coverage = []
        
        for file_path, data in coverage_data.items():
            if data['line_rate'] < threshold:
                low_coverage.append({
                    'file_path': file_path,
                    'coverage': data['line_rate'],
                    'missing_lines': data['missing_lines'],
                    'priority': self._get_priority_level(file_path)
                })
        
        # Sort by priority (lowest number = highest priority)
        return sorted(low_coverage, key=lambda x: (x['priority'], -len(x['missing_lines'])))

    def _get_priority_level(self, file_path: str) -> int:
        """Get the priority level for a file path.
        
        Args:
            file_path: The file path to check
            
        Returns:
            int: Priority level (lower number = higher priority)
        """
        for i, priority_path in enumerate(self.priority_paths):
            if priority_path in file_path:
                return i
        return len(self.priority_paths)

    def generate_coverage_report(self, overall_coverage: float, low_coverage_modules: List[Dict[str, Any]]) -> str:
        """Generate a formatted coverage report.
        
        Args:
            overall_coverage: Overall coverage percentage
            low_coverage_modules: List of low-coverage modules
            
        Returns:
            str: Formatted report
        """
        report = []
        report.append("\n" + "=" * 80)
        report.append(f"📊 HIPAA TEST COVERAGE REPORT - {overall_coverage:.2f}%")
        report.append("=" * 80)
        
        # HIPAA compliance status
        if overall_coverage >= self.coverage_threshold:
            report.append(f"✅ HIPAA COMPLIANT: Coverage meets the {self.coverage_threshold}% requirement")
        else:
            difference = self.coverage_threshold - overall_coverage
            report.append(f"❌ NOT HIPAA COMPLIANT: Coverage is {difference:.2f}% below the {self.coverage_threshold}% requirement")
        
        # Low coverage modules
        if low_coverage_modules:
            report.append("\n🔍 MODULES WITH <50% COVERAGE (Ordered by priority):")
            report.append("-" * 80)
            report.append(f"{'PRIORITY':<10} {'COVERAGE':<10} {'PATH':<60}")
            report.append("-" * 80)
            
            for module in low_coverage_modules:
                priority_names = ["SECURITY", "CORE", "DOMAIN", "APPLICATION", "OTHER"]
                priority_name = priority_names[module['priority']] if module['priority'] < len(priority_names) else "OTHER"
                
                report.append(f"{priority_name:<10} {module['coverage']:<10.2f} {module['file_path']:<60}")
            
            report.append("-" * 80)
            
            # Path to compliance
            report.append("\n🚀 PATH TO HIPAA COMPLIANCE:")
            if overall_coverage < self.coverage_threshold:
                report.append(f"To reach {self.coverage_threshold}% coverage, focus on these high-priority modules:")
                
                for i, module in enumerate(low_coverage_modules[:5]):
                    report.append(f"{i+1}. {module['file_path']} (current: {module['coverage']:.2f}%)")
        else:
            report.append("\n✅ All modules have at least 50% coverage.")
        
        # Report location
        report.append("\n📂 DETAILED REPORTS:")
        report.append(f"- HTML Report: {os.path.abspath(self.html_report_dir)}/index.html")
        report.append(f"- XML Report: {os.path.abspath(self.xml_report)}")
        
        return "\n".join(report)

    def check_coverage(self) -> None:
        """Run the full coverage check process."""
        # Run the coverage analysis
        if not self.run_coverage():
            return
        
        # Parse the coverage report
        coverage_data, overall_coverage = self.parse_coverage_xml()
        
        if not coverage_data:
            print("❌ No coverage data available.")
            return
        
        # Identify low coverage modules
        low_coverage_modules = self.get_low_coverage_modules(coverage_data)
        
        # Generate and print the report
        report = self.generate_coverage_report(overall_coverage, low_coverage_modules)
        print(report)
        
        # Save the report
        report_path = os.path.join(self.reports_dir, "coverage_report.txt")
        with open(report_path, "w") as f:
            f.write(report)
        
        print(f"\n📄 Report saved to {os.path.abspath(report_path)}")
        
        # Exit with status code based on compliance
        if overall_coverage < self.coverage_threshold:
            print(f"\n⚠️ Coverage {overall_coverage:.2f}% is below the HIPAA threshold of {self.coverage_threshold}%.")
            print("📝 Review the report and add tests to the prioritized modules.")
        else:
            print(f"\n🎉 Congratulations! Coverage {overall_coverage:.2f}% meets HIPAA requirements.")


def main():
    """Main entry point for the script."""
    checker = CoverageChecker()
    checker.check_coverage()


if __name__ == "__main__":
    main()