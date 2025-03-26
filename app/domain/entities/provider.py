"""
Provider entity module for the NOVAMIND backend.

This module contains the Provider entity, which is a core domain entity
representing healthcare providers in the concierge psychiatry practice.
"""
from dataclasses import dataclass, field
from datetime import datetime, time
from enum import Enum, auto
from typing import Dict, List, Optional, Set
from uuid import UUID, uuid4


class ProviderRole(Enum):
    """Enum representing the possible roles of providers"""
    PSYCHIATRIST = auto()
    PSYCHOLOGIST = auto()
    THERAPIST = auto()
    NURSE_PRACTITIONER = auto()
    PHYSICIAN_ASSISTANT = auto()
    CASE_MANAGER = auto()
    ADMINISTRATOR = auto()


class ProviderSpecialty(Enum):
    """Enum representing the possible specialties of providers"""
    GENERAL_PSYCHIATRY = auto()
    CHILD_ADOLESCENT = auto()
    GERIATRIC = auto()
    ADDICTION = auto()
    FORENSIC = auto()
    NEUROPSYCHIATRY = auto()
    PSYCHOTHERAPY = auto()
    MEDICATION_MANAGEMENT = auto()
    PSYCHOANALYSIS = auto()
    CONSULTATION_LIAISON = auto()
    EMERGENCY = auto()


@dataclass
class Credential:
    """Value object for provider credentials"""
    type: str  # e.g., "MD", "PhD", "LCSW"
    issuer: str  # e.g., "Harvard Medical School"
    issue_date: datetime
    expiration_date: Optional[datetime] = None
    identifier: Optional[str] = None  # e.g., license number
    verification_url: Optional[str] = None
    
    @property
    def is_expired(self) -> bool:
        """Check if the credential is expired"""
        if not self.expiration_date:
            return False
        return datetime.utcnow() > self.expiration_date
    
    @property
    def expires_soon(self) -> bool:
        """Check if the credential expires within 90 days"""
        if not self.expiration_date:
            return False
        days_until_expiration = (self.expiration_date - datetime.utcnow()).days
        return 0 < days_until_expiration <= 90


@dataclass
class AvailabilitySlot:
    """Value object for provider availability slots"""
    day_of_week: int  # 0 = Monday, 6 = Sunday
    start_time: time
    end_time: time
    is_telehealth: bool = True
    is_in_person: bool = True
    
    def __post_init__(self):
        """Validate availability slot data"""
        if not (0 <= self.day_of_week <= 6):
            raise ValueError("Day of week must be between 0 (Monday) and 6 (Sunday)")
        
        if self.start_time >= self.end_time:
            raise ValueError("End time must be after start time")
        
        if not (self.is_telehealth or self.is_in_person):
            raise ValueError("Availability slot must support at least one appointment type")


@dataclass
class Provider:
    """
    Provider entity representing a healthcare provider in the concierge psychiatry practice.
    
    This is a rich domain entity containing business logic related to provider management.
    It follows DDD principles and is framework-independent.
    """
    first_name: str
    last_name: str
    role: ProviderRole
    email: str
    id: UUID = field(default_factory=uuid4)
    specialties: Set[ProviderSpecialty] = field(default_factory=set)
    credentials: List[Credential] = field(default_factory=list)
    npi_number: Optional[str] = None  # National Provider Identifier
    dea_number: Optional[str] = None  # Drug Enforcement Administration number
    phone: Optional[str] = None
    bio: Optional[str] = None
    availability: List[AvailabilitySlot] = field(default_factory=list)
    max_patients: Optional[int] = None
    is_active: bool = True
    accepts_new_patients: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, str] = field(default_factory=dict)
    
    @property
    def full_name(self) -> str:
        """Get the provider's full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def display_name(self) -> str:
        """Get the provider's display name with credentials"""
        credentials_str = ", ".join(cred.type for cred in self.credentials if cred.type)
        if credentials_str:
            return f"{self.full_name}, {credentials_str}"
        return self.full_name
    
    @property
    def is_prescriber(self) -> bool:
        """Check if the provider can prescribe medications"""
        prescriber_roles = [
            ProviderRole.PSYCHIATRIST,
            ProviderRole.NURSE_PRACTITIONER,
            ProviderRole.PHYSICIAN_ASSISTANT
        ]
        return self.role in prescriber_roles and bool(self.dea_number)
    
    @property
    def has_expired_credentials(self) -> bool:
        """Check if any credentials are expired"""
        return any(cred.is_expired for cred in self.credentials)
    
    @property
    def has_credentials_expiring_soon(self) -> bool:
        """Check if any credentials are expiring soon"""
        return any(cred.expires_soon for cred in self.credentials)
    
    def add_specialty(self, specialty: ProviderSpecialty) -> None:
        """Add a specialty to the provider"""
        self.specialties.add(specialty)
        self.updated_at = datetime.utcnow()
    
    def remove_specialty(self, specialty: ProviderSpecialty) -> None:
        """Remove a specialty from the provider"""
        if specialty in self.specialties:
            self.specialties.remove(specialty)
            self.updated_at = datetime.utcnow()
    
    def add_credential(self, credential: Credential) -> None:
        """Add a credential to the provider"""
        self.credentials.append(credential)
        self.updated_at = datetime.utcnow()
    
    def update_credential(self, index: int, credential: Credential) -> None:
        """
        Update a credential
        
        Args:
            index: Index of the credential to update
            credential: New credential data
            
        Raises:
            IndexError: If the index is out of range
        """
        if not 0 <= index < len(self.credentials):
            raise IndexError("Credential index out of range")
        
        self.credentials[index] = credential
        self.updated_at = datetime.utcnow()
    
    def remove_credential(self, index: int) -> None:
        """
        Remove a credential
        
        Args:
            index: Index of the credential to remove
            
        Raises:
            IndexError: If the index is out of range
        """
        if not 0 <= index < len(self.credentials):
            raise IndexError("Credential index out of range")
        
        self.credentials.pop(index)
        self.updated_at = datetime.utcnow()
    
    def add_availability(self, availability: AvailabilitySlot) -> None:
        """Add an availability slot to the provider"""
        self.availability.append(availability)
        self.updated_at = datetime.utcnow()
    
    def remove_availability(self, index: int) -> None:
        """
        Remove an availability slot
        
        Args:
            index: Index of the availability slot to remove
            
        Raises:
            IndexError: If the index is out of range
        """
        if not 0 <= index < len(self.availability):
            raise IndexError("Availability index out of range")
        
        self.availability.pop(index)
        self.updated_at = datetime.utcnow()
    
    def deactivate(self) -> None:
        """Deactivate the provider"""
        self.is_active = False
        self.accepts_new_patients = False
        self.updated_at = datetime.utcnow()
    
    def activate(self) -> None:
        """Activate the provider"""
        self.is_active = True
        self.updated_at = datetime.utcnow()
    
    def stop_accepting_patients(self) -> None:
        """Stop accepting new patients"""
        self.accepts_new_patients = False
        self.updated_at = datetime.utcnow()
    
    def start_accepting_patients(self) -> None:
        """Start accepting new patients"""
        if not self.is_active:
            raise ValueError("Cannot accept patients while inactive")
        
        self.accepts_new_patients = True
        self.updated_at = datetime.utcnow()
    
    def set_max_patients(self, max_patients: Optional[int]) -> None:
        """
        Set the maximum number of patients
        
        Args:
            max_patients: Maximum number of patients or None for unlimited
            
        Raises:
            ValueError: If max_patients is negative
        """
        if max_patients is not None and max_patients < 0:
            raise ValueError("Maximum patients cannot be negative")
        
        self.max_patients = max_patients
        self.updated_at = datetime.utcnow()
    
    def is_available_on_day(self, day_of_week: int) -> bool:
        """
        Check if the provider has any availability slots on a specific day
        
        Args:
            day_of_week: Day of the week (0 = Monday, 6 = Sunday)
            
        Returns:
            True if the provider has availability on the specified day, False otherwise
        """
        return any(slot.day_of_week == day_of_week for slot in self.availability)
    
    def get_availability_for_day(self, day_of_week: int) -> List[AvailabilitySlot]:
        """
        Get all availability slots for a specific day
        
        Args:
            day_of_week: Day of the week (0 = Monday, 6 = Sunday)
            
        Returns:
            List of availability slots for the specified day
        """
        return [slot for slot in self.availability if slot.day_of_week == day_of_week]
