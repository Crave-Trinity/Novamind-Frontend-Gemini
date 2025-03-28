# -*- coding: utf-8 -*-
"""
Patient Entity

This module defines the Patient entity for the domain layer,
representing a patient in the system.
"""

from datetime import datetime, date
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from uuid import UUID, uuid4

from app.domain.exceptions import ValidationException


class Gender(Enum):
    """Gender enum for patients."""
    
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class InsuranceStatus(Enum):
    """Insurance status enum for patients."""
    
    VERIFIED = "verified"
    PENDING = "pending"
    EXPIRED = "expired"
    NONE = "none"


class PatientStatus(Enum):
    """Status enum for patients."""
    
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    PENDING = "pending"


class Patient:
    """
    Patient entity representing a patient in the system.
    
    This entity encapsulates all the business logic related to patients,
    including personal information, medical history, and insurance details.
    """
    
    def __init__(
        self,
        id: Optional[Union[UUID, str]] = None,
        first_name: str = None,
        last_name: str = None,
        date_of_birth: Union[date, str] = None,
        gender: Union[Gender, str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[Dict[str, Any]] = None,
        emergency_contacts: Optional[List[Dict[str, Any]]] = None,
        insurance_info: Optional[Dict[str, Any]] = None,
        insurance_status: Union[InsuranceStatus, str] = InsuranceStatus.NONE,
        medical_history: Optional[List[Dict[str, Any]]] = None,
        medications: Optional[List[Dict[str, Any]]] = None,
        allergies: Optional[List[str]] = None,
        notes: Optional[str] = None,
        status: Union[PatientStatus, str] = PatientStatus.ACTIVE,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        last_appointment: Optional[datetime] = None,
        next_appointment: Optional[datetime] = None,
        preferred_provider_id: Optional[Union[UUID, str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a patient.
        
        Args:
            id: Unique identifier for the patient
            first_name: First name of the patient
            last_name: Last name of the patient
            date_of_birth: Date of birth of the patient
            gender: Gender of the patient
            email: Email address of the patient
            phone: Phone number of the patient
            address: Address of the patient
            emergency_contacts: Emergency contacts for the patient
            insurance_info: Insurance information for the patient
            insurance_status: Status of the patient's insurance
            medical_history: Medical history of the patient
            medications: Medications the patient is taking
            allergies: Allergies the patient has
            notes: Notes about the patient
            status: Status of the patient
            created_at: Time the patient was created
            updated_at: Time the patient was last updated
            last_appointment: Time of the patient's last appointment
            next_appointment: Time of the patient's next appointment
            preferred_provider_id: ID of the patient's preferred provider
            metadata: Additional metadata
        """
        self.id = id if id else uuid4()
        self.first_name = first_name
        self.last_name = last_name
        
        # Convert string date to date object if necessary
        if isinstance(date_of_birth, str):
            self.date_of_birth = date.fromisoformat(date_of_birth)
        else:
            self.date_of_birth = date_of_birth
        
        # Convert string to enum if necessary
        if isinstance(gender, str):
            self.gender = Gender(gender)
        else:
            self.gender = gender
        
        self.email = email
        self.phone = phone
        self.address = address or {}
        self.emergency_contacts = emergency_contacts or []
        self.insurance_info = insurance_info or {}
        
        # Convert string to enum if necessary
        if isinstance(insurance_status, str):
            self.insurance_status = InsuranceStatus(insurance_status)
        else:
            self.insurance_status = insurance_status
        
        self.medical_history = medical_history or []
        self.medications = medications or []
        self.allergies = allergies or []
        self.notes = notes
        
        # Convert string to enum if necessary
        if isinstance(status, str):
            self.status = PatientStatus(status)
        else:
            self.status = status
        
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.last_appointment = last_appointment
        self.next_appointment = next_appointment
        self.preferred_provider_id = preferred_provider_id
        self.metadata = metadata or {}
        
        # Validate the patient
        self._validate()
    
    def _validate(self) -> None:
        """
        Validate the patient.
        
        Raises:
            ValidationException: If the patient is invalid
        """
        # Check required fields
        if not self.first_name:
            raise ValidationException("First name is required")
        
        if not self.last_name:
            raise ValidationException("Last name is required")
        
        if not self.date_of_birth:
            raise ValidationException("Date of birth is required")
        
        if not self.gender:
            raise ValidationException("Gender is required")
        
        # Check that at least one contact method is provided
        if not self.email and not self.phone:
            raise ValidationException("At least one contact method (email or phone) is required")
        
        # Validate email format if provided
        if self.email and not self._is_valid_email(self.email):
            raise ValidationException(f"Invalid email format: {self.email}")
        
        # Validate phone format if provided
        if self.phone and not self._is_valid_phone(self.phone):
            raise ValidationException(f"Invalid phone format: {self.phone}")
    
    def _is_valid_email(self, email: str) -> bool:
        """
        Check if an email is valid.
        
        Args:
            email: Email to check
            
        Returns:
            True if valid, False otherwise
        """
        # Simple email validation
        return "@" in email and "." in email.split("@")[1]
    
    def _is_valid_phone(self, phone: str) -> bool:
        """
        Check if a phone number is valid.
        
        Args:
            phone: Phone number to check
            
        Returns:
            True if valid, False otherwise
        """
        # Simple phone validation (digits, spaces, dashes, parentheses)
        return all(c.isdigit() or c in " -.()" for c in phone)
    
    def update_personal_info(
        self,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        date_of_birth: Optional[Union[date, str]] = None,
        gender: Optional[Union[Gender, str]] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Update personal information.
        
        Args:
            first_name: New first name
            last_name: New last name
            date_of_birth: New date of birth
            gender: New gender
            email: New email
            phone: New phone
            address: New address
            
        Raises:
            ValidationException: If the updated information is invalid
        """
        # Update fields if provided
        if first_name is not None:
            self.first_name = first_name
        
        if last_name is not None:
            self.last_name = last_name
        
        if date_of_birth is not None:
            if isinstance(date_of_birth, str):
                self.date_of_birth = date.fromisoformat(date_of_birth)
            else:
                self.date_of_birth = date_of_birth
        
        if gender is not None:
            if isinstance(gender, str):
                self.gender = Gender(gender)
            else:
                self.gender = gender
        
        if email is not None:
            self.email = email
        
        if phone is not None:
            self.phone = phone
        
        if address is not None:
            self.address = address
        
        # Update timestamp
        self.updated_at = datetime.now()
        
        # Validate the updated patient
        self._validate()
    
    def update_insurance_info(
        self,
        insurance_info: Dict[str, Any],
        insurance_status: Union[InsuranceStatus, str] = None
    ) -> None:
        """
        Update insurance information.
        
        Args:
            insurance_info: New insurance information
            insurance_status: New insurance status
            
        Raises:
            ValidationException: If the updated information is invalid
        """
        self.insurance_info = insurance_info
        
        if insurance_status is not None:
            if isinstance(insurance_status, str):
                self.insurance_status = InsuranceStatus(insurance_status)
            else:
                self.insurance_status = insurance_status
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def add_emergency_contact(self, contact: Dict[str, Any]) -> None:
        """
        Add an emergency contact.
        
        Args:
            contact: Emergency contact information
            
        Raises:
            ValidationException: If the contact is invalid
        """
        # Validate contact
        if not contact.get("name"):
            raise ValidationException("Emergency contact name is required")
        
        if not contact.get("phone") and not contact.get("email"):
            raise ValidationException("Emergency contact must have phone or email")
        
        # Add contact
        self.emergency_contacts.append(contact)
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def remove_emergency_contact(self, contact_index: int) -> None:
        """
        Remove an emergency contact.
        
        Args:
            contact_index: Index of the contact to remove
            
        Raises:
            IndexError: If the index is out of range
        """
        if contact_index < 0 or contact_index >= len(self.emergency_contacts):
            raise IndexError("Emergency contact index out of range")
        
        # Remove contact
        self.emergency_contacts.pop(contact_index)
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def add_medical_history_item(self, item: Dict[str, Any]) -> None:
        """
        Add a medical history item.
        
        Args:
            item: Medical history item
            
        Raises:
            ValidationException: If the item is invalid
        """
        # Validate item
        if not item.get("condition"):
            raise ValidationException("Medical history condition is required")
        
        # Add item
        self.medical_history.append(item)
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def add_medication(self, medication: Dict[str, Any]) -> None:
        """
        Add a medication.
        
        Args:
            medication: Medication information
            
        Raises:
            ValidationException: If the medication is invalid
        """
        # Validate medication
        if not medication.get("name"):
            raise ValidationException("Medication name is required")
        
        if not medication.get("dosage"):
            raise ValidationException("Medication dosage is required")
        
        # Add medication
        self.medications.append(medication)
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def remove_medication(self, medication_index: int) -> None:
        """
        Remove a medication.
        
        Args:
            medication_index: Index of the medication to remove
            
        Raises:
            IndexError: If the index is out of range
        """
        if medication_index < 0 or medication_index >= len(self.medications):
            raise IndexError("Medication index out of range")
        
        # Remove medication
        self.medications.pop(medication_index)
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def add_allergy(self, allergy: str) -> None:
        """
        Add an allergy.
        
        Args:
            allergy: Allergy to add
        """
        if allergy not in self.allergies:
            self.allergies.append(allergy)
            
            # Update timestamp
            self.updated_at = datetime.now()
    
    def remove_allergy(self, allergy: str) -> None:
        """
        Remove an allergy.
        
        Args:
            allergy: Allergy to remove
        """
        if allergy in self.allergies:
            self.allergies.remove(allergy)
            
            # Update timestamp
            self.updated_at = datetime.now()
    
    def update_status(self, status: Union[PatientStatus, str]) -> None:
        """
        Update the patient's status.
        
        Args:
            status: New status
        """
        if isinstance(status, str):
            self.status = PatientStatus(status)
        else:
            self.status = status
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def update_notes(self, notes: str) -> None:
        """
        Update the patient's notes.
        
        Args:
            notes: New notes
        """
        self.notes = notes
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def update_appointment_times(
        self,
        last_appointment: Optional[datetime] = None,
        next_appointment: Optional[datetime] = None
    ) -> None:
        """
        Update appointment times.
        
        Args:
            last_appointment: Time of the last appointment
            next_appointment: Time of the next appointment
        """
        if last_appointment is not None:
            self.last_appointment = last_appointment
        
        if next_appointment is not None:
            self.next_appointment = next_appointment
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def set_preferred_provider(self, provider_id: Union[UUID, str]) -> None:
        """
        Set the preferred provider.
        
        Args:
            provider_id: ID of the preferred provider
        """
        self.preferred_provider_id = provider_id
        
        # Update timestamp
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the patient to a dictionary.
        
        Returns:
            Dictionary representation of the patient
        """
        return {
            "id": str(self.id),
            "first_name": self.first_name,
            "last_name": self.last_name,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender.value if self.gender else None,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "emergency_contacts": self.emergency_contacts,
            "insurance_info": self.insurance_info,
            "insurance_status": self.insurance_status.value if self.insurance_status else None,
            "medical_history": self.medical_history,
            "medications": self.medications,
            "allergies": self.allergies,
            "notes": self.notes,
            "status": self.status.value if self.status else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_appointment": self.last_appointment.isoformat() if self.last_appointment else None,
            "next_appointment": self.next_appointment.isoformat() if self.next_appointment else None,
            "preferred_provider_id": str(self.preferred_provider_id) if self.preferred_provider_id else None,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Patient':
        """
        Create a patient from a dictionary.
        
        Args:
            data: Dictionary representation of a patient
            
        Returns:
            Patient instance
        """
        # Convert ISO format strings to datetime objects
        for field in ["created_at", "updated_at", "last_appointment", "next_appointment"]:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field])
        
        return cls(**data)
    
    def __eq__(self, other: object) -> bool:
        """
        Check if two patients are equal.
        
        Args:
            other: Other object to compare with
            
        Returns:
            True if equal, False otherwise
        """
        if not isinstance(other, Patient):
            return False
        
        return str(self.id) == str(other.id)
    
    def __hash__(self) -> int:
        """
        Get the hash of the patient.
        
        Returns:
            Hash value
        """
        return hash(str(self.id))
    
    def __str__(self) -> str:
        """
        Get a string representation of the patient.
        
        Returns:
            String representation
        """
        return f"Patient(id={self.id}, name={self.first_name} {self.last_name})"
