#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Custom test script for LogSanitizer's structured log sanitization.
"""

import sys
import json
from app.infrastructure.security.log_sanitizer import (
    LogSanitizer,
    SanitizerConfig,
    RedactionMode,
    PatternType,
    PHIPattern
)


def setup_test_sanitizer():
    """Create a test-ready log sanitizer."""
    config = SanitizerConfig(
        enabled=True,
        redaction_mode=RedactionMode.FULL,
        redaction_marker="[REDACTED]",
        enable_contextual_detection=True,
        scan_nested_objects=True,
        sensitive_field_names=[
            "ssn", "social_security", "dob", "birth_date", "address", 
            "phone", "email", "full_name", "patient_name", "mrn",
            "medical_record_number", "credit_card", "insurance_id"
        ]
    )
    
    sanitizer = LogSanitizer(config=config)
    
    # Add some test patterns
    mock_patterns = [
        PHIPattern(
            name="SSN",
            pattern=r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b",
            type=PatternType.REGEX,
            context_words=["social", "security", "ssn"]
        ),
        PHIPattern(
            name="Email",
            pattern=r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            type=PatternType.REGEX,
            context_words=["email", "contact", "@"]
        ),
        PHIPattern(
            name="Phone",
            pattern=r"\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b",
            type=PatternType.REGEX,
            context_words=["phone", "call", "tel"]
        )
    ]
    
    # Set up patterns
    sanitizer.pattern_repository._patterns = mock_patterns
    
    return sanitizer


def test_structured_log_sanitization():
    """Test sanitization of structured logs with nested patient data."""
    sanitizer = setup_test_sanitizer()
    
    # Test case 1: Standard structured log with patient data
    structured_log = {
        "timestamp": "2025-03-27T10:30:00Z",
        "level": "INFO",
        "message": "Patient data accessed",
        "context": {
            "user": "doctor_smith",
            "action": "view",
            "patient": {
                "id": "PT123456",
                "name": "John Doe",
                "ssn": "123-45-6789",
                "contact": {
                    "email": "john.doe@example.com",
                    "phone": "(555) 123-4567"
                }
            }
        }
    }
    
    # Sanitize the structured log
    sanitized = sanitizer.sanitize_structured_log(structured_log)
    
    # Verify PHI was sanitized in patient data
    print("\nTest Case 1: Standard structured log")
    print(f"Original log: {json.dumps(structured_log, indent=2)}")
    print(f"Sanitized log: {json.dumps(sanitized, indent=2)}")
    
    # Verify all PHI in patient object was redacted
    assert sanitized["context"]["patient"]["id"] != "PT123456"
    assert sanitized["context"]["patient"]["name"] != "John Doe"
    assert sanitized["context"]["patient"]["ssn"] != "123-45-6789"
    assert sanitized["context"]["patient"]["contact"]["email"] != "john.doe@example.com"
    assert sanitized["context"]["patient"]["contact"]["phone"] != "(555) 123-4567"
    
    # Verify non-PHI information was preserved
    assert sanitized["timestamp"] == "2025-03-27T10:30:00Z"
    assert sanitized["level"] == "INFO"
    assert sanitized["message"] == "Patient data accessed"
    assert sanitized["context"]["user"] == "doctor_smith"
    assert sanitized["context"]["action"] == "view"
    
    print("✅ First test passed: Patient data in structured logs is properly sanitized")
    
    # Test case 2: Nested structured log with multiple patients
    complex_log = {
        "timestamp": "2025-03-27T11:30:00Z",
        "level": "INFO",
        "operation": "group_session",
        "context": {
            "provider": "dr_jane_smith",
            "session_id": "GS12345",
            "participants": [
                {
                    "patient": {
                        "id": "PT111111",
                        "name": "Alice Brown",
                        "ssn": "111-22-3333"
                    }
                },
                {
                    "patient": {
                        "id": "PT222222",
                        "name": "Bob Green",
                        "ssn": "444-55-6666"
                    }
                }
            ]
        }
    }
    
    # Sanitize the complex structured log
    sanitized_complex = sanitizer.sanitize_structured_log(complex_log)
    
    print("\nTest Case 2: Complex nested structured log")
    print(f"Original log: {json.dumps(complex_log, indent=2)}")
    print(f"Sanitized log: {json.dumps(sanitized_complex, indent=2)}")
    
    # Verify all patients in the list were sanitized
    for i, participant in enumerate(sanitized_complex["context"]["participants"]):
        assert participant["patient"]["id"] != complex_log["context"]["participants"][i]["patient"]["id"]
        assert participant["patient"]["name"] != complex_log["context"]["participants"][i]["patient"]["name"]
        assert participant["patient"]["ssn"] != complex_log["context"]["participants"][i]["patient"]["ssn"]
    
    print("✅ Second test passed: Multiple patients in nested structures are properly sanitized")
    
    # Test case 3: Verify special handling for empty values
    edge_cases = {
        "timestamp": "2025-03-27T12:30:00Z",
        "level": "INFO",
        "message": "Patient with missing data",
        "context": {
            "patient": {
                "id": "",  # Empty ID
                "name": None,  # None value
                "contact": None  # None object
            }
        }
    }
    
    # Sanitize edge cases
    sanitized_edges = sanitizer.sanitize_structured_log(edge_cases)
    
    print("\nTest Case 3: Edge cases with empty/null values")
    print(f"Original log: {json.dumps(edge_cases, indent=2)}")
    print(f"Sanitized log: {json.dumps(sanitized_edges, indent=2)}")
    
    # Structure should be preserved
    assert "patient" in sanitized_edges["context"]
    assert "id" in sanitized_edges["context"]["patient"]
    
    print("✅ Third test passed: Edge cases with empty/null values are handled properly")
    
    print("\n✅ All tests passed successfully!")
    return 0


if __name__ == "__main__":
    sys.exit(test_structured_log_sanitization())