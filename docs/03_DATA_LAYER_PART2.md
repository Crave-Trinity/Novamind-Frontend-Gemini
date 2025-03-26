# NOVAMIND: Data Layer Implementation - Part 2

## 7. Database Models

### 7.1 Patient Model

```python
# app/data/models/patient.py
from sqlalchemy import Column, String, Date, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression

from app.data.models.base import BaseModel


class PatientModel(BaseModel):
    """SQLAlchemy ORM model for patients"""
    __tablename__ = "patients"
    
    # Basic patient information
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    active = Column(Boolean, server_default=expression.true(), nullable=False)
    
    # Value objects stored as JSON
    contact_info = Column(JSONB, nullable=False)
    address = Column(JSONB, nullable=True)
    insurance = Column(JSONB, nullable=True)
    emergency_contact = Column(JSONB, nullable=True)
    
    # Relationships
    appointments = relationship(
        "AppointmentModel", 
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    clinical_notes = relationship(
        "ClinicalNoteModel", 
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    medications = relationship(
        "MedicationModel", 
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Patient {self.first_name} {self.last_name}>"
```

### 7.2 Appointment Model

```python
# app/data/models/appointment.py
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship

from app.data.models.base import BaseModel
from app.domain.entities.appointment import AppointmentStatus, AppointmentType


class AppointmentModel(BaseModel):
    """SQLAlchemy ORM model for appointments"""
    __tablename__ = "appointments"
    
    # Foreign keys
    patient_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Appointment details
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    appointment_type = Column(
        ENUM(AppointmentType, name="appointment_type_enum"),
        nullable=False
    )
    status = Column(
        ENUM(AppointmentStatus, name="appointment_status_enum"),
        nullable=False
    )
    notes = Column(Text, nullable=True)
    virtual = Column(Boolean, default=False, nullable=False)
    location = Column(String(100), nullable=True)
    
    # Relationships
    patient = relationship("PatientModel", back_populates="appointments")
    clinical_notes = relationship(
        "ClinicalNoteModel", 
        back_populates="appointment",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Appointment {self.id}: {self.start_time} - {self.end_time}>"
```

### 7.3 Clinical Note Model

```python
# app/data/models/clinical_note.py
from sqlalchemy import Column, Text, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID, ENUM, JSONB
from sqlalchemy.orm import relationship

from app.data.models.base import BaseModel
from app.domain.entities.clinical_note import NoteType


class ClinicalNoteModel(BaseModel):
    """SQLAlchemy ORM model for clinical notes"""
    __tablename__ = "clinical_notes"
    
    # Foreign keys
    patient_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )
    appointment_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True
    )
    author_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Note content
    content = Column(Text, nullable=False)
    note_type = Column(ENUM(NoteType, name="note_type_enum"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    previous_versions = Column(JSONB, default=list, nullable=False)
    
    # Relationships
    patient = relationship("PatientModel", back_populates="clinical_notes")
    appointment = relationship("AppointmentModel", back_populates="clinical_notes")
    
    def __repr__(self):
        return f"<ClinicalNote {self.id}: {self.note_type.value} v{self.version}>"
```

### 7.4 Medication Model

```python
# app/data/models/medication.py
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship

from app.data.models.base import BaseModel
from app.domain.entities.medication import MedicationStatus, MedicationFrequency


class MedicationModel(BaseModel):
    """SQLAlchemy ORM model for medications"""
    __tablename__ = "medications"
    
    # Foreign keys
    patient_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )
    prescriber_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Medication details
    name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=False)
    frequency = Column(
        ENUM(MedicationFrequency, name="medication_frequency_enum"),
        nullable=False
    )
    instructions = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    status = Column(
        ENUM(MedicationStatus, name="medication_status_enum"),
        nullable=False
    )
    reason = Column(Text, nullable=True)
    
    # Relationships
    patient = relationship("PatientModel", back_populates="medications")
    
    def __repr__(self):
        return f"<Medication {self.id}: {self.name} {self.dosage}>"
```

## 8. Repository Implementations

### 8.1 Patient Repository Implementation

```python
# app/data/repositories/patient_repository.py
from typing import List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.data.models.patient import PatientModel
from app.data.repositories.base_repository import BaseRepository
from app.domain.entities.patient import Patient
from app.domain.interfaces.patient_repository import PatientRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.insurance import Insurance
from app.domain.exceptions.patient_exceptions import PatientNotFoundError


class SQLAlchemyPatientRepository(BaseRepository[PatientModel, Patient], PatientRepository):
    """SQLAlchemy implementation of the PatientRepository interface"""
    
    def __init__(self, db_session: Session):
        super().__init__(db_session, PatientModel)
    
    def _to_model(self, entity: Patient) -> PatientModel:
        """Convert Patient domain entity to PatientModel"""
        # Convert value objects to dictionaries for JSON storage
        contact_info_dict = {
            "email": entity.contact_info.email,
            "phone": entity.contact_info.phone,
            "preferred_contact_method": entity.contact_info.preferred_contact_method
        }
        
        address_dict = None
        if entity.address:
            address_dict = {
                "street": entity.address.street,
                "city": entity.address.city,
                "state": entity.address.state,
                "zip_code": entity.address.zip_code
            }
        
        insurance_dict = None
        if entity.insurance:
            insurance_dict = {
                "provider": entity.insurance.provider,
                "policy_number": entity.insurance.policy_number,
                "group_number": entity.insurance.group_number,
                "policy_holder": entity.insurance.policy_holder,
                "valid_from": entity.insurance.valid_from.isoformat() if entity.insurance.valid_from else None,
                "valid_to": entity.insurance.valid_to.isoformat() if entity.insurance.valid_to else None
            }
        
        emergency_contact_dict = None
        if entity.emergency_contact:
            emergency_contact_dict = {
                "email": entity.emergency_contact.email,
                "phone": entity.emergency_contact.phone,
                "preferred_contact_method": entity.emergency_contact.preferred_contact_method
            }
        
        return PatientModel(
            id=entity.id,
            first_name=entity.first_name,
            last_name=entity.last_name,
            date_of_birth=entity.date_of_birth,
            active=entity.active,
            contact_info=contact_info_dict,
            address=address_dict,
            insurance=insurance_dict,
            emergency_contact=emergency_contact_dict,
            # Audit fields would be set by middleware in a real application
            created_by="system",
            updated_by="system"
        )
    
    def _to_entity(self, model: PatientModel) -> Patient:
        """Convert PatientModel to Patient domain entity"""
        # Convert JSON dictionaries back to value objects
        contact_info = ContactInfo(
            email=model.contact_info["email"],
            phone=model.contact_info["phone"],
            preferred_contact_method=model.contact_info.get("preferred_contact_method", "email")
        )
        
        address = None
        if model.address:
            address = Address(
                street=model.address["street"],
                city=model.address["city"],
                state=model.address["state"],
                zip_code=model.address["zip_code"]
            )
        
        insurance = None
        if model.insurance:
            from datetime import date, datetime
            
            # Convert string dates back to date objects
            valid_from = None
            if model.insurance.get("valid_from"):
                valid_from = datetime.fromisoformat(model.insurance["valid_from"]).date()
                
            valid_to = None
            if model.insurance.get("valid_to"):
                valid_to = datetime.fromisoformat(model.insurance["valid_to"]).date()
                
            insurance = Insurance(
                provider=model.insurance["provider"],
                policy_number=model.insurance["policy_number"],
                group_number=model.insurance.get("group_number"),
                policy_holder=model.insurance.get("policy_holder"),
                valid_from=valid_from,
                valid_to=valid_to
            )
        
        emergency_contact = None
        if model.emergency_contact:
            emergency_contact = ContactInfo(
                email=model.emergency_contact["email"],
                phone=model.emergency_contact["phone"],
                preferred_contact_method=model.emergency_contact.get("preferred_contact_method", "email")
            )
        
        return Patient(
            id=model.id,
            first_name=model.first_name,
            last_name=model.last_name,
            date_of_birth=model.date_of_birth,
            contact_info=contact_info,
            address=address,
            insurance=insurance,
            active=model.active,
            emergency_contact=emergency_contact
        )
    
    def list_active_patients(self, limit: int = 100, offset: int = 0) -> List[Patient]:
        """List active patients with pagination"""
        models = self.db.query(PatientModel) \
            .filter(PatientModel.active.is_(True)) \
            .order_by(PatientModel.last_name, PatientModel.first_name) \
            .limit(limit) \
            .offset(offset) \
            .all()
        
        return [self._to_entity(model) for model in models]
    
    def search_by_name(self, name: str) -> List[Patient]:
        """Search patients by name (first or last)"""
        search_term = f"%{name}%"
        
        models = self.db.query(PatientModel) \
            .filter(
                or_(
                    PatientModel.first_name.ilike(search_term),
                    PatientModel.last_name.ilike(search_term)
                )
            ) \
            .order_by(PatientModel.last_name, PatientModel.first_name) \
            .all()
        
        return [self._to_entity(model) for model in models]
```
