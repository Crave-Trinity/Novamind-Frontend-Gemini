# -*- coding: utf-8 -*-
"""
Patient entity module for the NOVAMIND backend.

This module contains the Patient entity, which is a core domain entity
representing a patient in the concierge psychiatry practice.
"""

from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.emergency_contact import EmergencyContact
from app.domain.value_objects.psychiatric_assessment import PsychiatricAssessment
from app.infrastructure.security.encryption import EncryptionService


@dataclass
class InsuranceInfo:
    """Value object for patient insurance information"""

    provider: str
    policy_number: str
    group_number: Optional[str] = None
    coverage_details: Optional[Dict[str, str]] = None


@dataclass
class EmergencyContact:
    """Value object for patient emergency contact"""

    name: str
    relationship: str
    phone: str
    email: Optional[str] = None


class Patient:
    """
    Patient entity representing a patient in the concierge psychiatry practice.

    This is a rich domain entity containing business logic related to patient management.
    It follows DDD principles and is framework-independent.
    """

    def __init__(
        self,
        id: UUID,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        contact_info: ContactInfo,
        address: Address,
        encryption_service: Optional[EncryptionService] = None,
        gender: Optional[str] = None,
        insurance_info: Optional[InsuranceInfo] = None,
        emergency_contacts: List[EmergencyContact] = None,
        assessments: List[PsychiatricAssessment] = None,
        medical_history: Dict[str, str] = None,
        medication_allergies: List[str] = None,
        active: bool = True
    ) -> None:
        """Initialize a new patient."""
        self.id = id
        self._encryption = encryption_service or EncryptionService()
        
        # Encrypt PHI fields
        self._first_name = self._encryption.encrypt(first_name)
        self._last_name = self._encryption.encrypt(last_name)
        self._date_of_birth = date_of_birth
        
        # Encrypt contact info
        self._contact_info = ContactInfo(
            email=self._encryption.encrypt(contact_info.email),
            phone=self._encryption.encrypt(contact_info.phone)
        )
        
        # Store address
        self._address = address
        
        self.gender = gender
        self.insurance_info = insurance_info
        self.emergency_contacts = emergency_contacts if emergency_contacts else []
        self.assessments = assessments if assessments else []
        self.medical_history = medical_history if medical_history else {}
        self.medication_allergies = medication_allergies if medication_allergies else []
        self.active = active
    
    @property
    def first_name(self) -> str:
        """Get decrypted first name."""
        return self._encryption.decrypt(self._first_name)
    
    @property
    def last_name(self) -> str:
        """Get decrypted last name."""
        return self._encryption.decrypt(self._last_name)
    
    @property
    def date_of_birth(self) -> date:
        """Get date of birth."""
        return self._date_of_birth
    
    @property
    def contact_info(self) -> ContactInfo:
        """Get decrypted contact info."""
        return ContactInfo(
            email=self._encryption.decrypt(self._contact_info.email),
            phone=self._encryption.decrypt(self._contact_info.phone)
        )
    
    @property
    def address(self) -> Address:
        """Get address."""
        return self._address
    
    @property
    def full_name(self) -> str:
        """Get the patient's full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        """Calculate the patient's age based on date of birth"""
        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )
    
    def update(
        self,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        contact_info: Optional[ContactInfo] = None,
        address: Optional[Address] = None,
        gender: Optional[str] = None,
        insurance_info: Optional[InsuranceInfo] = None,
        emergency_contacts: Optional[List[EmergencyContact]] = None,
        assessments: Optional[List[PsychiatricAssessment]] = None,
        medical_history: Optional[Dict[str, str]] = None,
        medication_allergies: Optional[List[str]] = None,
        active: Optional[bool] = None
    ) -> None:
        """
        Update patient information.
        
        Only provided fields will be updated.
        """
        if first_name is not None:
            self._first_name = self._encryption.encrypt(first_name)
        
        if last_name is not None:
            self._last_name = self._encryption.encrypt(last_name)
        
        if contact_info is not None:
            self._contact_info = ContactInfo(
                email=self._encryption.encrypt(contact_info.email),
                phone=self._encryption.encrypt(contact_info.phone)
            )
        
        if address is not None:
            self._address = address
        
        if gender is not None:
            self.gender = gender
        
        if insurance_info is not None:
            self.insurance_info = insurance_info
        
        if emergency_contacts is not None:
            self.emergency_contacts = emergency_contacts
        
        if assessments is not None:
            self.assessments = assessments
        
        if medical_history is not None:
            self.medical_history = medical_history
        
        if medication_allergies is not None:
            self.medication_allergies = medication_allergies
        
        if active is not None:
            self.active = active
    
    def add_assessment(self, assessment: PsychiatricAssessment) -> None:
        """
        Add a psychiatric assessment to the patient's record

        Args:
            assessment: The psychiatric assessment to add
        """
        self.assessments.append(assessment)
    
    def get_latest_assessment(self) -> Optional[PsychiatricAssessment]:
        """
        Get the patient's most recent psychiatric assessment

        Returns:
            The most recent assessment or None if no assessments exist
        """
        if not self.assessments:
            return None

        return max(self.assessments, key=lambda a: a.assessment_date)
    
    def add_emergency_contact(self, contact: EmergencyContact) -> None:
        """
        Add an emergency contact for the patient

        Args:
            contact: The emergency contact to add
        """
        self.emergency_contacts.append(contact)
    
    def add_medication_allergy(self, medication: str) -> None:
        """
        Add a medication allergy to the patient's record

        Args:
            medication: The medication the patient is allergic to
        """
        if medication not in self.medication_allergies:
            self.medication_allergies.append(medication)
    
    def deactivate(self) -> None:
        """Deactivate the patient (e.g., if they are no longer a client)"""
        self.active = False
    
    def reactivate(self) -> None:
        """Reactivate a previously deactivated patient"""
        self.active = True
    
    def is_allergic_to(self, medication: str) -> bool:
        """
        Check if the patient is allergic to a specific medication

        Args:
            medication: The medication to check

        Returns:
            True if the patient is allergic, False otherwise
        """
        return medication in self.medication_allergies
    
    def to_dict(self) -> dict:
        """Convert patient to dictionary with masked PHI."""
        return {
            "id": str(self.id),
            "first_name": "[REDACTED]",
            "last_name": "[REDACTED]",
            "date_of_birth": str(self.date_of_birth),
            "contact_info": {
                "email": "[REDACTED]",
                "phone": "[REDACTED]"
            },
            "address": self.address.to_dict(),
            "gender": self.gender,
            "insurance_info": self.insurance_info,
            "emergency_contacts": self.emergency_contacts,
            "assessments": self.assessments,
            "medical_history": self.medical_history,
            "medication_allergies": self.medication_allergies,
            "active": self.active
        }
    
    def __str__(self) -> str:
        """Get string representation with masked PHI."""
        return f"Patient(id={self.id}, name=[REDACTED], dob=[REDACTED])"
