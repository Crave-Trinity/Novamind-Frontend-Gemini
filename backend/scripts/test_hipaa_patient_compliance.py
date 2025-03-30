#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Comprehensive HIPAA compliance test for patient data protection.

This script validates the HIPAA compliance of patient data handling in the
Novamind platform, focusing on:
1. PHI encryption at rest
2. Secure data handling in memory
3. No PHI leakage in logs/errors
4. Audit trail compliance

Usage:
    python scripts/test_hipaa_patient_compliance.py
"""

import asyncio
import os
import sys
import uuid
import logging
from datetime import date
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.domain.entities.patient import Patient
from app.domain.value_objects.address import Address
from app.domain.value_objects.emergency_contact import EmergencyContact
from app.domain.value_objects.insurance import Insurance
from app.infrastructure.persistence.sqlalchemy.models.patient import PatientModel
from app.infrastructure.security.encryption import EncryptionService
from app.infrastructure.persistence.sqlalchemy.config.database import get_db_session, get_engine

# Configure logging without PHI
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("hipaa-compliance-test")


def create_test_patient() -> Patient:
    """Create a test patient with representative PHI for testing."""
    return Patient(
        id=uuid.uuid4(),
        first_name="TestPatient",
        last_name="PHIProtection",
        date_of_birth=date(1980, 1, 1),
        email="test.patient@example.com",
        phone="555-123-4567",
        address=Address(
            line1="123 Test Street",
            line2="Suite 456",
            city="Securetown",
            state="ST",
            postal_code="12345",
            country="USA"
        ),
        emergency_contact=EmergencyContact(
            name="Emergency Contact",
            phone="555-987-6543",
            relationship="Relative"
        ),
        insurance=Insurance(
            provider="Test Insurance Co",
            policy_number="POLICY123456",
            group_number="GROUP789"
        ),
        active=True,
        created_by=None
    )


async def test_encryption_decryption():
    """Test that patient PHI is properly encrypted and decrypted."""
    logger.info("Testing patient PHI encryption/decryption...")
    
    # Create test patient
    patient = create_test_patient()
    patient_id = patient.id
    
    # Convert to model (encrypts PHI)
    patient_model = PatientModel.from_domain(patient)
    
    # Verify PHI fields are encrypted
    assert patient_model.first_name != patient.first_name, "First name not encrypted"
    assert patient_model.email != patient.email, "Email not encrypted"
    assert patient_model.address_line1 != patient.address.line1, "Address not encrypted"
    
    # Convert back to domain entity (decrypts PHI)
    decrypted_patient = patient_model.to_domain()
    
    # Verify PHI is correctly recovered after decryption
    assert decrypted_patient.id == patient_id, "Patient ID mismatch"
    assert decrypted_patient.first_name == patient.first_name, "First name decryption failed"
    assert decrypted_patient.last_name == patient.last_name, "Last name decryption failed"
    assert decrypted_patient.email == patient.email, "Email decryption failed"
    assert decrypted_patient.phone == patient.phone, "Phone decryption failed"
    
    logger.info("✅ Encryption/decryption test passed")
    return True


async def test_database_encryption():
    """Test that PHI is encrypted in the database."""
    logger.info("Testing database encryption of PHI...")
    
    # Create test patient
    patient = create_test_patient()
    
    # Get database session
    engine = await get_engine()
    async with await get_db_session() as session:
        # Save patient to database
        patient_model = PatientModel.from_domain(patient)
        session.add(patient_model)
        await session.commit()
        
        # Get patient ID for later lookup
        patient_id = patient_model.id
        
        # Close session to clear cache
        await session.close()
        
        # Get a new session
        async with await get_db_session() as new_session:
            # Get raw data directly with SQL to verify encryption
            result = await new_session.execute(f"""
                SELECT first_name, last_name, email, phone, date_of_birth, address_line1
                FROM patients WHERE id = '{patient_id}'
            """)
            row = result.fetchone()
            
            # Verify PHI is stored encrypted
            assert row.first_name != patient.first_name, "First name not encrypted in database"
            assert row.email != patient.email, "Email not encrypted in database"
            
            # Load through ORM and verify decryption
            db_patient_model = await new_session.get(PatientModel, patient_id)
            retrieved_patient = db_patient_model.to_domain()
            
            # Verify PHI is correctly decrypted
            assert retrieved_patient.first_name == patient.first_name, "First name decryption failed"
            assert retrieved_patient.email == patient.email, "Email decryption failed"
            
            # Clean up test data
            await new_session.delete(db_patient_model)
            await new_session.commit()
    
    logger.info("✅ Database encryption test passed")
    return True


async def test_no_phi_in_logs():
    """Test that PHI is not included in logs even during errors."""
    logger.info("Testing PHI exclusion from logs...")
    
    # Create test patient
    patient = create_test_patient()
    patient_id = patient.id
    
    # Create a test log handler to capture log output
    log_capture = []
    test_handler = logging.StreamHandler(sys.stdout)
    test_handler.setLevel(logging.DEBUG)
    
    class TestLogCapture:
        def handle(self, record):
            log_capture.append(record.getMessage())
    
    capture_handler = TestLogCapture()
    logging.getLogger().addHandler(capture_handler)
    
    try:
        # Trigger an error that would normally expose PHI
        patient_model = PatientModel.from_domain(patient)
        
        # Simulate encryption error 
        original_decrypt = EncryptionService.decrypt
        
        def mock_decrypt_error(self, text):
            if text:
                raise ValueError(f"Decryption error: {text}")
            return None
            
        # Patch the decrypt method to raise an error
        EncryptionService.decrypt = mock_decrypt_error
        
        try:
            # This should trigger the error which should be logged
            patient_model.to_domain()
        except Exception as e:
            logger.exception(f"Expected error occurred (ID: {patient_id})")
        
        # Restore original method
        EncryptionService.decrypt = original_decrypt
        
        # Check logs for PHI
        phi_elements = [
            patient.first_name,
            patient.last_name,
            patient.email,
            patient.phone,
            str(patient.date_of_birth),
        ]
        
        # Verify PHI is not in logs
        for log_message in log_capture:
            for phi in phi_elements:
                assert phi not in log_message, f"PHI '{phi}' found in log: {log_message}"
        
        logger.info("✅ No PHI found in logs during error handling")
        return True
    finally:
        # Clean up handlers
        logging.getLogger().removeHandler(capture_handler)


async def run_tests():
    """Run all HIPAA compliance tests."""
    try:
        logger.info("Starting HIPAA compliance tests for patient data...")
        
        # Run the tests
        enc_dec_result = await test_encryption_decryption()
        db_result = await test_database_encryption()
        log_result = await test_no_phi_in_logs()
        
        # Report results
        if all([enc_dec_result, db_result, log_result]):
            logger.info("🔒 All HIPAA compliance tests PASSED")
            return 0
        else:
            logger.error("❌ Some HIPAA compliance tests FAILED")
            return 1
    except Exception as e:
        logger.exception("Unexpected error in HIPAA compliance tests")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_tests())
    sys.exit(exit_code)