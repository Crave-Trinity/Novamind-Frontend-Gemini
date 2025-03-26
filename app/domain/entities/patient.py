"""
Patient entity module for the NOVAMIND backend.

This module contains the Patient entity, which is a core domain entity
representing a patient in the concierge psychiatry practice.
"""
from dataclasses import dataclass, field
from datetime import date
from typing import List, Optional, Dict
from uuid import UUID, uuid4

from app.domain.value_objects.address import Address
from app.domain.value_objects.psychiatric_assessment import PsychiatricAssessment


@dataclass
class ContactInfo:
    """Value object for patient contact information"""
    email: str
    phone: str
    address: Address
    preferred_contact_method: str = "email"  # email, phone, or text
    
    def __post_init__(self):
        """Validate contact information"""
        if self.preferred_contact_method not in ["email", "phone", "text"]:
            raise ValueError("Preferred contact method must be email, phone, or text")
        
        # Email validation
        if not "@" in self.email or not "." in self.email:
            raise ValueError("Invalid email format")
        
        # Phone validation (basic)
        if not self.phone or len(self.phone.replace("-", "").replace(" ", "")) < 10:
            raise ValueError("Phone number must be at least 10 digits")


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


@dataclass
class Patient:
    """
    Patient entity representing a patient in the concierge psychiatry practice.
    
    This is a rich domain entity containing business logic related to patient management.
    It follows DDD principles and is framework-independent.
    """
    first_name: str
    last_name: str
    date_of_birth: date
    contact_info: ContactInfo
    id: UUID = field(default_factory=uuid4)
    gender: Optional[str] = None
    insurance_info: Optional[InsuranceInfo] = None
    emergency_contacts: List[EmergencyContact] = field(default_factory=list)
    assessments: List[PsychiatricAssessment] = field(default_factory=list)
    medical_history: Dict[str, str] = field(default_factory=dict)
    medication_allergies: List[str] = field(default_factory=list)
    active: bool = True
    
    @property
    def full_name(self) -> str:
        """Get the patient's full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        """Calculate the patient's age based on date of birth"""
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
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
    
    def update_contact_info(self, contact_info: ContactInfo) -> None:
        """
        Update the patient's contact information
        
        Args:
            contact_info: The new contact information
        """
        self.contact_info = contact_info
    
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