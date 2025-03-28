#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Direct test runner for the enhanced log sanitizer to validate its functionality.
This bypasses pytest configuration issues.
"""
import sys
import logging
import traceback
from typing import Dict, Any, List, Tuple

# Import the sanitizer components
from app.infrastructure.security.log_sanitizer import (
    LogSanitizer, 
    SanitizerConfig, 
    RedactionMode,
    PatternType,
)

# Configure logging for testing
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("sanitizer_test")

def run_test(test_name: str, test_func, *args, **kwargs) -> bool:
    """Run a test function and report success/failure."""
    logger.info(f"Running test: {test_name}")
    try:
        test_func(*args, **kwargs)
        logger.info(f"✅ PASSED: {test_name}")
        return True
    except AssertionError as e:
        logger.error(f"❌ FAILED: {test_name} - {str(e)}")
        logger.error(traceback.format_exc())
        return False
    except Exception as e:
        logger.error(f"❌ ERROR: {test_name} - Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def test_psychiatric_phi_detection():
    """Test detection and redaction of psychiatric-specific PHI."""
    config = SanitizerConfig(
        enabled=True,
        redaction_mode=RedactionMode.FULL,
        redaction_marker="[REDACTED]",
        max_log_size_kb=10,
        enable_contextual_detection=True
    )
    sanitizer = LogSanitizer(config)
    
    # Test psychiatric diagnosis detection
    text = "Patient diagnosis: Bipolar II Disorder with anxious features."
    result = sanitizer.sanitize(text)
    logger.info(f"Original text: {text}")
    logger.info(f"Sanitized text: {result}")
    assert "diagnosis:" in result, "Context word 'diagnosis:' should be preserved"
    assert "[REDACTED]" in result, "PHI should be redacted"
    assert "Bipolar II Disorder" not in result, "Diagnosis details should be redacted"
    
    # Test medication information
    text = "Current medication: Sertraline 100mg daily for depression."
    result = sanitizer.sanitize(text)
    logger.info(f"Original text: {text}")
    logger.info(f"Sanitized text: {result}")
    assert "medication:" in result, "Context word 'medication:' should be preserved"
    assert "[REDACTED]" in result, "PHI should be redacted"
    assert "Sertraline 100mg" not in result, "Medication details should be redacted"
    
    logger.info("Psychiatric PHI detection test successful")

def test_medical_identifiers():
    """Test detection of medical record numbers and dates of birth."""
    config = SanitizerConfig(
        enabled=True,
        redaction_mode=RedactionMode.FULL,
        redaction_marker="[REDACTED]"
    )
    sanitizer = LogSanitizer(config)
    
    # Test MRN pattern
    text = "Medical Record Number: MRN12345, admitted on 03/15/2025"
    result = sanitizer.sanitize(text)
    logger.info(f"Original text: {text}")
    logger.info(f"Sanitized text: {result}")
    assert "[REDACTED]" in result, "Failed to redact Medical Record Number"
    assert "MRN12345" not in result, "MRN was not redacted"
    
    # Test DOB pattern
    text = "DOB: 01/01/1980, Age: 45"
    result = sanitizer.sanitize(text)
    logger.info(f"Original text: {text}")
    logger.info(f"Sanitized text: {result}")
    assert "[REDACTED]" in result, "Failed to redact Date of Birth"
    assert "01/01/1980" not in result, "DOB was not redacted"
    
    logger.info("Medical identifier detection test successful")

def test_nested_object_sanitization():
    """Test sanitization of complex nested objects."""
    config = SanitizerConfig(
        enabled=True,
        redaction_mode=RedactionMode.FULL,
        redaction_marker="[REDACTED]"
    )
    sanitizer = LogSanitizer(config)
    
    # Create a complex dict with nested PHI
    data = {
        "patient": {
            "name": "John Smith",
            "contact": {
                "email": "john.smith@example.com",
                "phone": "555-123-4567"
            },
            "records": [
                {"visit_date": "2025-01-15", "diagnosis": "Major Depressive Disorder"},
                {"visit_date": "2025-02-28", "diagnosis": "Improving, continue current plan"}
            ]
        },
        "provider": "Dr. Jane Reynolds",
        "facility_id": "F12345"
    }
    
    result = sanitizer.sanitize(data)
    
    # Verify PHI is redacted at all levels
    assert result["patient"]["name"] == "[REDACTED]", "Patient name was not redacted"
    assert result["patient"]["contact"]["email"] == "[REDACTED]", "Email was not redacted"
    assert result["patient"]["contact"]["phone"] == "[REDACTED]", "Phone was not redacted"
    assert "Major Depressive Disorder" not in str(result), "Diagnosis was not redacted"
    assert result["provider"] == "[REDACTED]", "Provider name was not redacted"
    
    logger.info("Nested object sanitization test successful")

def test_error_handling():
    """Test robust error handling during pattern application."""
    config = SanitizerConfig(
        enabled=True,
        redaction_mode=RedactionMode.FULL,
        redaction_marker="[REDACTED]",
        exceptions_allowed=True
    )
    sanitizer = LogSanitizer(config)
    
    # Create a situation that would cause an error
    # but ensure sanitization still completes
    original_method = sanitizer._apply_default_phi_patterns
    
    def broken_method(*args, **kwargs):
        raise ValueError("Test error handling")
        
    sanitizer._apply_default_phi_patterns = broken_method
    
    # This should not crash but return a safe value
    try:
        result = sanitizer.sanitize("This contains PHI: John Smith with SSN 123-45-6789")
        assert "Error" in result or result == "[Sanitization Error]", "Error not properly handled"
        logger.info(f"Error handling result: {result}")
    finally:
        # Restore the original method
        sanitizer._apply_default_phi_patterns = original_method
    
    logger.info("Error handling test successful")

def test_partial_redaction_mode():
    """Test partial redaction mode that preserves some information."""
    config = SanitizerConfig(
        enabled=True,
        redaction_mode=RedactionMode.PARTIAL,
        redaction_marker="[REDACTED]"
    )
    sanitizer = LogSanitizer(config)
    
    # Test name with partial redaction
    text = "Patient: John Smith, Age: 45"
    result = sanitizer.sanitize(text)
    logger.info(f"Original text: {text}")
    logger.info(f"Partially redacted: {result}")
    
    # Test date with partial redaction
    text = "Appointment Date: 01/15/2025 at 2:30pm"
    result = sanitizer.sanitize(text)
    logger.info(f"Original text: {text}")
    logger.info(f"Partially redacted: {result}")
    
    logger.info("Partial redaction test successful")
    return True  # This test is informational only

def main():
    """Run all tests and report overall results."""
    logger.info("Starting Enhanced Log Sanitizer Tests")
    
    tests = [
        ("Psychiatric PHI Detection", test_psychiatric_phi_detection),
        ("Medical Identifiers", test_medical_identifiers),
        ("Nested Object Sanitization", test_nested_object_sanitization),
        ("Error Handling", test_error_handling),
        ("Partial Redaction Mode", test_partial_redaction_mode),
    ]
    
    results = []
    for name, test_func in tests:
        results.append(run_test(name, test_func))
    
    success_count = sum(results)
    total_count = len(results)
    
    logger.info("=" * 50)
    logger.info(f"Test Summary: {success_count}/{total_count} tests passed")
    logger.info("=" * 50)
    
    # Return non-zero exit code if any tests failed
    return 0 if all(results) else 1

if __name__ == "__main__":
    sys.exit(main())