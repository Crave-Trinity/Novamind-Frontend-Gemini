"""
SQLAlchemy model for Patient entity.

This module defines the SQLAlchemy ORM model for the Patient entity,
mapping the domain entity to the database schema.
"""
import uuid
from datetime import date, datetime
from typing import Optional, List

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.persistence.sqlalchemy.config.database import Base


class PatientModel(Base):
    """
    SQLAlchemy model for the Patient entity.
    
    This model maps to the 'patients' table in the database and
    represents patients in the NOVAMIND concierge psychiatry platform.
    """
    __tablename__ = "patients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    email = Column(String(255), nullable=True, unique=True)
    phone = Column(String(20), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    emergency_contact_name = Column(String(200), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    emergency_contact_relationship = Column(String(50), nullable=True)
    insurance_provider = Column(String(100), nullable=True)
    insurance_policy_number = Column(String(100), nullable=True)
    insurance_group_number = Column(String(100), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    appointments = relationship("AppointmentModel", back_populates="patient")
    medications = relationship("MedicationModel", back_populates="patient")
    clinical_notes = relationship("ClinicalNoteModel", back_populates="patient")
    digital_twin = relationship("DigitalTwinModel", back_populates="patient", uselist=False)
    
    def __repr__(self) -> str:
        """Return string representation of the patient."""
        return f"<Patient(id={self.id}, name={self.first_name} {self.last_name})>"
    
    @classmethod
    def from_domain(cls, patient) -> "PatientModel":
        """
        Create a SQLAlchemy model instance from a domain entity.
        
        Args:
            patient: Domain Patient entity
            
        Returns:
            PatientModel: SQLAlchemy model instance
        """
        return cls(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            date_of_birth=patient.date_of_birth,
            email=patient.email,
            phone=patient.phone,
            address_line1=patient.address.line1 if patient.address else None,
            address_line2=patient.address.line2 if patient.address else None,
            city=patient.address.city if patient.address else None,
            state=patient.address.state if patient.address else None,
            postal_code=patient.address.postal_code if patient.address else None,
            country=patient.address.country if patient.address else None,
            emergency_contact_name=patient.emergency_contact.name if patient.emergency_contact else None,
            emergency_contact_phone=patient.emergency_contact.phone if patient.emergency_contact else None,
            emergency_contact_relationship=patient.emergency_contact.relationship if patient.emergency_contact else None,
            insurance_provider=patient.insurance.provider if patient.insurance else None,
            insurance_policy_number=patient.insurance.policy_number if patient.insurance else None,
            insurance_group_number=patient.insurance.group_number if patient.insurance else None,
            active=patient.active,
            created_by=patient.created_by
        )
    
    def to_domain(self):
        """
        Convert SQLAlchemy model instance to domain entity.
        
        Returns:
            Patient: Domain entity instance
        """
        from app.domain.entities.patient import Patient
        from app.domain.value_objects.address import Address
        from app.domain.value_objects.emergency_contact import EmergencyContact
        from app.domain.value_objects.insurance import Insurance
        
        # Create value objects from model attributes
        address = None
        if any([self.address_line1, self.city, self.state, self.postal_code, self.country]):
            address = Address(
                line1=self.address_line1,
                line2=self.address_line2,
                city=self.city,
                state=self.state,
                postal_code=self.postal_code,
                country=self.country
            )
            
        emergency_contact = None
        if self.emergency_contact_name:
            emergency_contact = EmergencyContact(
                name=self.emergency_contact_name,
                phone=self.emergency_contact_phone,
                relationship=self.emergency_contact_relationship
            )
            
        insurance = None
        if self.insurance_provider:
            insurance = Insurance(
                provider=self.insurance_provider,
                policy_number=self.insurance_policy_number,
                group_number=self.insurance_group_number
            )
            
        return Patient(
            id=self.id,
            first_name=self.first_name,
            last_name=self.last_name,
            date_of_birth=self.date_of_birth,
            email=self.email,
            phone=self.phone,
            address=address,
            emergency_contact=emergency_contact,
            insurance=insurance,
            active=self.active,
            created_by=self.created_by,
            created_at=self.created_at,
            updated_at=self.updated_at
        )