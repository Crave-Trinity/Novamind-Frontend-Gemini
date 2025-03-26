# DOMAIN_LAYER

## Overview

The Domain Layer contains the core business logic and entities for the NOVAMIND psychiatric platform. This layer is completely independent of frameworks, databases, or external services.

## Key Principles

- **Zero External Dependencies**: No imports from FastAPI, SQLAlchemy, or any other framework
- **Pure Business Logic**: Contains only domain rules and psychiatric practice operations
- **Rich Domain Model**: Entities contain behavior, not just data
- **Value Objects**: Immutable objects representing concepts without identity

## Core Domain Entities

### Patient Entity

```python
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID, uuid4

class Patient:
    """Patient entity representing a person receiving psychiatric care."""
    
    def __init__(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        email: str,
        phone: str,
        id: Optional[UUID] = None,
        address: Optional[dict] = None,
        insurance: Optional[dict] = None,
        active: bool = True,
        emergency_contact: Optional[dict] = None
    ):
        self.id = id or uuid4()
        self.first_name = first_name
        self.last_name = last_name
        self.date_of_birth = date_of_birth
        self.email = email
        self.phone = phone
        self.address = address
        self.insurance = insurance
        self.active = active
        self.emergency_contact = emergency_contact
        self.created_at = datetime.utcnow()
        self.updated_at = self.created_at
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def deactivate(self) -> None:
        self.active = False
        self.updated_at = datetime.utcnow()
    
    def reactivate(self) -> None:
        self.active = True
        self.updated_at = datetime.utcnow()
```

### Appointment Entity

```python
from datetime import datetime
from enum import Enum, auto
from typing import Optional
from uuid import UUID, uuid4

class AppointmentType(Enum):
    INITIAL_CONSULTATION = "initial_consultation"
    FOLLOW_UP = "follow_up"
    MEDICATION_REVIEW = "medication_review"
    THERAPY = "therapy"
    EMERGENCY = "emergency"

class AppointmentStatus(Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Appointment:
    """Appointment entity representing a scheduled meeting between patient and provider."""
    
    def __init__(
        self,
        patient_id: UUID,
        start_time: datetime,
        end_time: datetime,
        appointment_type: AppointmentType,
        id: Optional[UUID] = None,
        status: AppointmentStatus = AppointmentStatus.SCHEDULED,
        notes: Optional[str] = None,
        virtual: bool = False,
        location: Optional[str] = None
    ):
        self.id = id or uuid4()
        self.patient_id = patient_id
        self.start_time = start_time
        self.end_time = end_time
        self.appointment_type = appointment_type
        self.status = status
        self.notes = notes
        self.virtual = virtual
        self.location = location
        self.created_at = datetime.utcnow()
        self.updated_at = self.created_at
    
    @property
    def duration_minutes(self) -> int:
        delta = self.end_time - self.start_time
        return int(delta.total_seconds() / 60)
    
    def confirm(self) -> None:
        self.status = AppointmentStatus.CONFIRMED
        self.updated_at = datetime.utcnow()
    
    def complete(self) -> None:
        self.status = AppointmentStatus.COMPLETED
        self.updated_at = datetime.utcnow()
    
    def cancel(self) -> None:
        self.status = AppointmentStatus.CANCELLED
        self.updated_at = datetime.utcnow()
    
    def mark_no_show(self) -> None:
        self.status = AppointmentStatus.NO_SHOW
        self.updated_at = datetime.utcnow()
```

### Digital Twin Entity

```python
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4

class DigitalTwin:
    """
    Digital Twin entity representing a computational model of a patient's psychiatric state.
    """
    
    def __init__(
        self,
        patient_id: UUID,
        id: Optional[UUID] = None,
        symptom_forecast: Optional[Dict] = None,
        biometric_correlations: Optional[Dict] = None,
        medication_responses: Optional[Dict] = None,
        last_updated: Optional[datetime] = None
    ):
        self.id = id or uuid4()
        self.patient_id = patient_id
        self.symptom_forecast = symptom_forecast or {}
        self.biometric_correlations = biometric_correlations or {}
        self.medication_responses = medication_responses or {}
        self.last_updated = last_updated or datetime.utcnow()
        self.created_at = datetime.utcnow()
    
    def update_symptom_forecast(self, forecast_data: Dict) -> None:
        self.symptom_forecast = forecast_data
        self.last_updated = datetime.utcnow()
    
    def update_biometric_correlations(self, correlation_data: Dict) -> None:
        self.biometric_correlations = correlation_data
        self.last_updated = datetime.utcnow()
    
    def update_medication_responses(self, medication_data: Dict) -> None:
        self.medication_responses = medication_data
        self.last_updated = datetime.utcnow()
    
    @property
    def is_stale(self) -> bool:
        """Return True if the digital twin data is older than 7 days."""
        if not self.last_updated:
            return True
        delta = datetime.utcnow() - self.last_updated
        return delta.days > 7
```

## Repository Interfaces

### Base Repository Interface

```python
from abc import ABC, abstractmethod
from typing import Generic, List, Optional, TypeVar
from uuid import UUID

T = TypeVar('T')

class Repository(Generic[T], ABC):
    """Base repository interface for all domain entities."""
    
    @abstractmethod
    async def get_by_id(self, id: UUID) -> Optional[T]:
        """Get entity by ID."""
        pass
    
    @abstractmethod
    async def list(self, skip: int = 0, limit: int = 100) -> List[T]:
        """List entities with pagination."""
        pass
    
    @abstractmethod
    async def add(self, entity: T) -> T:
        """Add a new entity."""
        pass
    
    @abstractmethod
    async def update(self, entity: T) -> Optional[T]:
        """Update an existing entity."""
        pass
    
    @abstractmethod
    async def delete(self, id: UUID) -> bool:
        """Delete an entity by ID."""
        pass
```

### Patient Repository Interface

```python
from abc import ABC, abstractmethod
from datetime import date
from typing import List, Optional
from uuid import UUID

from app.domain.entities.patient import Patient
from app.domain.repositories.base_repository import Repository

class PatientRepository(Repository[Patient], ABC):
    """Repository interface for Patient entities."""
    
    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[Patient]:
        """Find a patient by email address."""
        pass
    
    @abstractmethod
    async def find_by_name(self, name: str) -> List[Patient]:
        """Find patients by name (partial match)."""
        pass
    
    @abstractmethod
    async def find_by_date_of_birth(self, dob: date) -> List[Patient]:
        """Find patients by date of birth."""
        pass
    
    @abstractmethod
    async def get_active_patients(self, skip: int = 0, limit: int = 100) -> List[Patient]:
        """Get only active patients."""
        pass
```

## Domain Services

### Appointment Scheduling Service

```python
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from app.domain.entities.appointment import Appointment, AppointmentStatus, AppointmentType
from app.domain.entities.patient import Patient

class AppointmentSchedulingService:
    """Domain service for appointment scheduling logic."""
    
    def validate_appointment_time(self, start_time: datetime, end_time: datetime) -> bool:
        """
        Validate appointment time constraints:
        - Must be in the future
        - Must be during business hours (9 AM - 5 PM)
        - Must be on a weekday
        - Must have valid duration (30, 45, or 60 minutes)
        """
        now = datetime.utcnow()
        
        # Must be in the future
        if start_time <= now:
            return False
        
        # Must be during business hours (9 AM - 5 PM)
        if start_time.hour < 9 or end_time.hour > 17:
            return False
        
        # Must be on a weekday
        if start_time.weekday() > 4:  # 5 = Saturday, 6 = Sunday
            return False
        
        # Calculate duration in minutes
        duration = (end_time - start_time).total_seconds() / 60
        
        # Must have valid duration (30, 45, or 60 minutes)
        if duration not in (30, 45, 60):
            return False
        
        return True
    
    def check_appointment_conflict(
        self, 
        proposed_start: datetime, 
        proposed_end: datetime,
        existing_appointments: List[Appointment]
    ) -> bool:
        """
        Check if a proposed appointment conflicts with existing appointments.
        Returns True if there is a conflict, False otherwise.
        """
        for appointment in existing_appointments:
            # Skip cancelled appointments
            if appointment.status == AppointmentStatus.CANCELLED:
                continue
                
            # Check for overlap
            if (proposed_start < appointment.end_time and 
                proposed_end > appointment.start_time):
                return True
                
        return False
    
    def suggest_available_slots(
        self,
        preferred_date: datetime,
        duration_minutes: int,
        existing_appointments: List[Appointment]
    ) -> List[dict]:
        """
        Suggest available appointment slots on the preferred date.
        """
        available_slots = []
        
        # Start at 9 AM on the preferred date
        current_date = preferred_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        # End at 5 PM
        end_of_day = current_date.replace(hour=17, minute=0, second=0, microsecond=0)
        
        # Create a timedelta for the appointment duration
        duration = timedelta(minutes=duration_minutes)
        
        # Iterate through the day in 15-minute increments
        while current_date + duration <= end_of_day:
            slot_end = current_date + duration
            
            # Check if this slot conflicts with existing appointments
            if not self.check_appointment_conflict(current_date, slot_end, existing_appointments):
                available_slots.append({
                    "start_time": current_date,
                    "end_time": slot_end
                })
            
            # Move to the next 15-minute increment
            current_date += timedelta(minutes=15)
        
        return available_slots
```

## Value Objects

### ContactInfo Value Object

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class ContactInfo:
    """Immutable value object representing contact information."""
    email: str
    phone: str
```

### Address Value Object

```python
from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class Address:
    """Immutable value object representing a physical address."""
    street1: str
    street2: Optional[str]
    city: str
    state: str
    zip_code: str
    country: str = "USA"
```

## Implementation Guidelines

1. **Entity Creation**: Always use factories or constructors to create entities
2. **Value Objects**: Use immutable dataclasses for value objects
3. **Domain Logic**: Keep business rules in domain entities or services
4. **Repository Interfaces**: Define in domain layer, implement in infrastructure
5. **Validation**: Implement domain-specific validation in entities or value objects
6. **Error Handling**: Use domain-specific exceptions for business rule violations