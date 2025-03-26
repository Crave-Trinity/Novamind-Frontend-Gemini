# app/domain/entities/patient.py
from datetime import date
from typing import List, Optional
from uuid import UUID, uuid4

from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo


class Patient:
    """
    Patient entity representing a person receiving psychiatric care.
    Core domain entity with no external dependencies.
    """
    def __init__(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        contact_info: ContactInfo,
        id: Optional[UUID] = None,
        address: Optional[Address] = None,
        active: bool = True,
        emergency_contact: Optional[ContactInfo] = None
    ):
        self.id = id or uuid4()
        self.first_name = first_name
        self.last_name = last_name
        self.date_of_birth = date_of_birth
        self.contact_info = contact_info
        self.address = address
        self.active = active
        self.emergency_contact = emergency_contact
    
    @property
    def full_name(self) -> str:
        """Get patient's full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        """Calculate patient's age"""
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def deactivate(self) -> None:
        """Deactivate a patient"""
        self.active = False
    
    def reactivate(self) -> None:
        """Reactivate a patient"""
        self.active = True
