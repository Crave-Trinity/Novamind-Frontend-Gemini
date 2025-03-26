# NOVAMIND: Domain Layer Implementation

## 1. Domain Layer Overview

The Domain Layer is the heart of our application, containing all business rules and clinical operations for the concierge psychiatry practice. This layer is completely independent of frameworks, databases, or external services, ensuring that our core business logic remains pure.

## 2. Implementation Principles

- **Framework Independence**: No imports from FastAPI, SQLAlchemy, or any other framework
- **Pure Business Logic**: Contains only business rules and psychiatric practice operations
- **Rich Domain Model**: Entities contain behavior, not just data
- **Value Objects**: Immutable objects representing concepts without identity
- **Domain Services**: Complex operations involving multiple entities

## 3. Key Domain Entities

### 3.1 Patient Entity

```python
# app/domain/entities/patient.py
from datetime import date
from typing import List, Optional
from uuid import UUID, uuid4

from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.insurance import Insurance


class Patient:
    """
    Patient entity representing a person receiving psychiatric care.
    Contains core patient data, completely framework-independent.
    """
    def __init__(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        contact_info: ContactInfo,
        id: UUID = None,
        address: Optional[Address] = None,
        insurance: Optional[Insurance] = None,
        active: bool = True,
        emergency_contact: Optional[ContactInfo] = None
    ):
        self.id = id or uuid4()
        self.first_name = first_name
        self.last_name = last_name
        self.date_of_birth = date_of_birth
        self.contact_info = contact_info
        self.address = address
        self.insurance = insurance
        self.active = active
        self.emergency_contact = emergency_contact
        self._appointments = []  # Stored separately to maintain domain purity
        self._notes = []  # Clinical notes
        self._medications = []  # Prescribed medications

    @property
    def full_name(self) -> str:
        """Returns patient's full name."""
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self) -> int:
        """Calculate patient age based on date of birth."""
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    def update_contact_info(self, contact_info: ContactInfo) -> None:
        """Update patient contact information."""
        self.contact_info = contact_info

    def update_address(self, address: Address) -> None:
        """Update patient address."""
        self.address = address

    def deactivate(self) -> None:
        """Deactivate a patient."""
        self.active = False

    def reactivate(self) -> None:
        """Reactivate a patient."""
        self.active = True
```python

### 3.2 Appointment Entity

```python
# app/domain/entities/appointment.py
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from app.domain.exceptions.appointment_exceptions import AppointmentConflictError


class AppointmentStatus(Enum):
    """Enumeration of possible appointment statuses"""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class AppointmentType(Enum):
    """Enumeration of appointment types"""
    INITIAL_CONSULTATION = "initial_consultation"
    MEDICATION_MANAGEMENT = "medication_management"
    THERAPY_SESSION = "therapy_session"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"


class Appointment:
    """
    Appointment entity representing a scheduled meeting between
    provider and patient.
    """
    def __init__(
        self,
        patient_id: UUID,
        start_time: datetime,
        end_time: datetime,
        appointment_type: AppointmentType,
        id: UUID = None,
        notes: Optional[str] = None,
        status: AppointmentStatus = AppointmentStatus.SCHEDULED,
        virtual: bool = False,
        location: Optional[str] = None,
    ):
        self.id = id or uuid4()
        self.patient_id = patient_id
        self.start_time = start_time
        self.end_time = end_time
        self.appointment_type = appointment_type
        self.notes = notes
        self.status = status
        self.virtual = virtual
        self.location = location

        # Validate appointment time
        if start_time >= end_time:
            raise ValueError("End time must be after start time")

        # Validate duration based on appointment type
        min_duration = self._get_min_duration_for_type()
        actual_duration = (end_time - start_time).total_seconds() / 60  # minutes
        if actual_duration < min_duration:
            raise ValueError(
                f"{appointment_type.value} requires at least {min_duration} minutes"
            )

    def _get_min_duration_for_type(self) -> int:
        """Return minimum duration in minutes based on appointment type."""
        durations = {
            AppointmentType.INITIAL_CONSULTATION: 60,
            AppointmentType.MEDICATION_MANAGEMENT: 15,
            AppointmentType.THERAPY_SESSION: 45,
            AppointmentType.FOLLOW_UP: 30,
            AppointmentType.EMERGENCY: 20
        }
        return durations.get(self.appointment_type, 15)

    def cancel(self, cancellation_reason: Optional[str] = None) -> None:
        """Cancel an appointment with optional reason."""
        if self.status in (AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW):
            raise ValueError("Cannot cancel a completed or no-show appointment")

        self.status = AppointmentStatus.CANCELLED
        if cancellation_reason:
            self.notes = f"{self.notes or ''}\nCancellation reason: {cancellation_reason}"

    def reschedule(self, new_start: datetime, new_end: datetime) -> None:
        """Reschedule appointment to a new time."""
        if self.status in (AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW):
            raise ValueError("Cannot reschedule a completed or no-show appointment")

        if new_start >= new_end:
            raise ValueError("End time must be after start time")

        self.start_time = new_start
        self.end_time = new_end
        self.status = AppointmentStatus.SCHEDULED

    def confirm(self) -> None:
        """Confirm an appointment."""
        if self.status != AppointmentStatus.SCHEDULED:
            raise ValueError("Only scheduled appointments can be confirmed")

        self.status = AppointmentStatus.CONFIRMED

    def complete(self, session_notes: Optional[str] = None) -> None:
        """Mark appointment as completed with optional session notes."""
        if self.status in (AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW):
            raise ValueError("Cannot complete a cancelled or no-show appointment")

        self.status = AppointmentStatus.COMPLETED
        if session_notes:
            self.notes = f"{self.notes or ''}\n\nSession notes: {session_notes}"

    def mark_no_show(self) -> None:
        """Mark appointment as no-show."""
        if self.status != AppointmentStatus.SCHEDULED and self.status != AppointmentStatus.CONFIRMED:
            raise ValueError("Only scheduled or confirmed appointments can be marked no-show")

        self.status = AppointmentStatus.NO_SHOW

    def overlaps_with(self, other: 'Appointment') -> bool:
        """Check if this appointment overlaps with another."""
        return (
            (self.start_time < other.end_time and self.end_time > other.start_time) or
            (other.start_time < self.end_time and other.end_time > self.start_time)
        )
```python

### 3.3 Clinical Note Entity

```python
# app/domain/entities/clinical_note.py
from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4


class NoteType(Enum):
    """Types of clinical notes"""
    PROGRESS_NOTE = "progress_note"
    INTAKE_ASSESSMENT = "intake_assessment"
    MEDICATION_NOTE = "medication_note"
    TREATMENT_PLAN = "treatment_plan"
    DISCHARGE_SUMMARY = "discharge_summary"


class ClinicalNote:
    """
    Entity representing a clinical note for a patient.
    Implements versioning for audit compliance.
    """
    def __init__(
        self,
        patient_id: UUID,
        content: str,
        note_type: NoteType,
        author_id: UUID,
        id: UUID = None,
        appointment_id: Optional[UUID] = None,
        created_at: Optional[datetime] = None,
        version: int = 1,
        previous_versions: Optional[List[dict]] = None,
    ):
        self.id = id or uuid4()
        self.patient_id = patient_id
        self.content = content
        self.note_type = note_type
        self.author_id = author_id
        self.appointment_id = appointment_id
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = self.created_at
        self.version = version
        self.previous_versions = previous_versions or []

    def update_content(self, new_content: str, editor_id: UUID) -> None:
        """
        Update note content, preserving previous version.
        Maintains audit trail required for HIPAA compliance.
        """
        # Store the current version before updating
        previous_version = {
            "content": self.content,
            "version": self.version,
            "updated_at": self.updated_at,
            "editor_id": self.author_id
        }
        self.previous_versions.append(previous_version)

        # Update with new content
        self.content = new_content
        self.version += 1
        self.updated_at = datetime.utcnow()
        self.author_id = editor_id

    def get_version_history(self) -> List[dict]:
        """Get complete version history of this note."""
        history = self.previous_versions.copy()
        # Add current version
        history.append({
            "content": self.content,
            "version": self.version,
            "updated_at": self.updated_at,
            "editor_id": self.author_id
        })
        return sorted(history, key=lambda x: x["version"])
```python

### 3.4 Medication Entity

```python
# app/domain/entities/medication.py
from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4


class MedicationStatus(Enum):
    """Status of a medication prescription"""
    ACTIVE = "active"
    DISCONTINUED = "discontinued"
    COMPLETED = "completed"


class MedicationFrequency(Enum):
    """Frequency of medication administration"""
    ONCE_DAILY = "once_daily"
    TWICE_DAILY = "twice_daily"
    THREE_TIMES_DAILY = "three_times_daily"
    FOUR_TIMES_DAILY = "four_times_daily"
    AS_NEEDED = "as_needed"
    ONCE_WEEKLY = "once_weekly"
    BEDTIME = "bedtime"
    MORNING = "morning"
    OTHER = "other"


class Medication:
    """
    Entity representing a medication prescribed to a patient.
    """
    def __init__(
        self,
        patient_id: UUID,
        name: str,
        dosage: str,
        frequency: MedicationFrequency,
        prescriber_id: UUID,
        id: UUID = None,
        instructions: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: MedicationStatus = MedicationStatus.ACTIVE,
        reason: Optional[str] = None,
    ):
        self.id = id or uuid4()
        self.patient_id = patient_id
        self.name = name
        self.dosage = dosage
        self.frequency = frequency
        self.prescriber_id = prescriber_id
        self.instructions = instructions
        self.start_date = start_date or datetime.utcnow()
        self.end_date = end_date
        self.status = status
        self.reason = reason

    def discontinue(self, reason: str) -> None:
        """
        Discontinue medication with reason.
        """
        if self.status != MedicationStatus.ACTIVE:
            raise ValueError("Can only discontinue active medications")

        self.status = MedicationStatus.DISCONTINUED
        self.end_date = datetime.utcnow()
        self.reason = reason

    def complete(self) -> None:
        """
        Mark medication as completed (course finished).
        """
        if self.status != MedicationStatus.ACTIVE:
            raise ValueError("Can only complete active medications")

        self.status = MedicationStatus.COMPLETED
        self.end_date = datetime.utcnow()

    def update_dosage(self, new_dosage: str, new_instructions: Optional[str] = None) -> None:
        """
        Update medication dosage and instructions.
        """
        if self.status != MedicationStatus.ACTIVE:
            raise ValueError("Can only update active medications")

        self.dosage = new_dosage
        if new_instructions:
            self.instructions = new_instructions

    def is_active(self) -> bool:
        """
        Check if medication is currently active.
        """
        return self.status == MedicationStatus.ACTIVE
```python

## 4. Value Objects

Value Objects are immutable objects that represent a concept in our domain that has no identity of its own.

### 4.1 Address Value Object

```python
# app/domain/value_objects/address.py
from dataclasses import dataclass


@dataclass(frozen=True)
class Address:
    """
    Immutable value object representing a physical address.
    """
    street: str
    city: str
    state: str
    zip_code: str

    def __str__(self) -> str:
        """String representation of address."""
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"
```python

### 4.2 ContactInfo Value Object

```python
# app/domain/value_objects/contact_info.py
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class ContactInfo:
    """
    Immutable value object representing contact information.
    """
    email: str
    phone: str
    preferred_contact_method: Optional[str] = "email"

    def __post_init__(self):
        # Basic validation
        if not self.email or '@' not in self.email:
            raise ValueError("Invalid email address")

        if not self.phone or len(self.phone) < 10:
            raise ValueError("Invalid phone number")
```python

### 4.3 Insurance Value Object

```python
# app/domain/value_objects/insurance.py
from dataclasses import dataclass
from typing import Optional
from datetime import date


@dataclass(frozen=True)
class Insurance:
    """
    Immutable value object representing insurance information.
    """
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    policy_holder: Optional[str] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None

    def is_valid(self, check_date: Optional[date] = None) -> bool:
        """
        Check if insurance is valid on the given date.
        Defaults to current date if none provided.
        """
        check_date = check_date or date.today()

        # If no dates are set, assume it's valid
        if not self.valid_from and not self.valid_to:
            return True

        # Check start date if set
        if self.valid_from and check_date < self.valid_from:
            return False

        # Check end date if set
        if self.valid_to and check_date > self.valid_to:
            return False

        return True
```python

## 5. Domain Repository Interfaces

Repository interfaces define how the domain objects will be persisted without specifying the implementation.

### 5.1 Patient Repository Interface

```python
# app/domain/interfaces/patient_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.patient import Patient


class PatientRepository(ABC):
    """Interface for patient data access"""

    @abstractmethod
    def add(self, patient: Patient) -> Patient:
        """Add a new patient"""
        pass

    @abstractmethod
    def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        """Get patient by ID"""
        pass

    @abstractmethod
    def update(self, patient: Patient) -> Patient:
        """Update patient information"""
        pass

    @abstractmethod
    def list_active_patients(self, limit: int, offset: int) -> List[Patient]:
        """List active patients with pagination"""
        pass

    @abstractmethod
    def search_by_name(self, name: str) -> List[Patient]:
        """Search patients by name"""
        pass
```python

### 5.2 Appointment Repository Interface

```python
# app/domain/interfaces/appointment_repository.py
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from app.domain.entities.appointment import Appointment, AppointmentStatus


class AppointmentRepository(ABC):
    """Interface for appointment data access"""

    @abstractmethod
    def add(self, appointment: Appointment) -> Appointment:
        """Add a new appointment"""
        pass

    @abstractmethod
    def get_by_id(self, appointment_id: UUID) -> Optional[Appointment]:
        """Get appointment by ID"""
        pass

    @abstractmethod
    def update(self, appointment: Appointment) -> Appointment:
        """Update an appointment"""
        pass

    @abstractmethod
    def delete(self, appointment_id: UUID) -> None:
        """Delete an appointment"""
        pass

    @abstractmethod
    def get_for_patient(self, patient_id: UUID) -> List[Appointment]:
        """Get all appointments for a patient"""
        pass

    @abstractmethod
    def get_in_time_range(
        self,
        start_time: datetime,
        end_time: datetime,
        status: Optional[List[AppointmentStatus]] = None
    ) -> List[Appointment]:
        """Get appointments in a time range with optional status filter"""
        pass
```python

## 6. Domain Services

Domain services encapsulate business logic that doesn't naturally fit within a single entity.

### 6.1 Appointment Service

```python
# app/domain/services/appointment_service.py
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from app.domain.entities.appointment import Appointment, AppointmentStatus
from app.domain.exceptions.appointment_exceptions import AppointmentConflictError
from app.domain.interfaces.appointment_repository import AppointmentRepository


class AppointmentService:
    """
    Domain service for appointment business logic.
    Contains rules for scheduling, checking availability, etc.
    """

    def schedule_appointment(
        self,
        appointment: Appointment,
        appointment_repository: AppointmentRepository
    ) -> Appointment:
        """
        Schedule a new appointment, checking for conflicts.

        Args:
            appointment: The appointment to schedule
            appointment_repository: Repository for persistence

        Returns:
            The scheduled appointment

        Raises:
            AppointmentConflictError: If appointment conflicts with existing one
        """
        # Check for conflicts
        existing_appointments = appointment_repository.get_in_time_range(
            appointment.start_time,
            appointment.end_time,
            [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
        )

        for existing in existing_appointments:
            if appointment.overlaps_with(existing):
                raise AppointmentConflictError(
                    f"Appointment conflicts with existing appointment at {existing.start_time}"
                )

        # Schedule the appointment
        return appointment_repository.add(appointment)

    def get_available_slots(
        self,
        date: datetime.date,
        duration_minutes: int,
        appointment_repository: AppointmentRepository,
        start_hour: int = 9,
        end_hour: int = 17,
        slot_interval_minutes: int = 15
    ) -> List[dict]:
        """
        Find available appointment slots for a given date.

        Args:
            date: The date to check for availability
            duration_minutes: Duration of the appointment in minutes
            appointment_repository: Repository for checking existing appointments
            start_hour: Hour to start checking (default: 9 AM)
            end_hour: Hour to end checking (default: 5 PM)
            slot_interval_minutes: Interval between slots in minutes (default: 15)

        Returns:
            List of available time slots as {start_time, end_time} dictionaries
        """
        # Create day boundaries
        day_start = datetime.combine(date, datetime.time(start_hour, 0))
        day_end = datetime.combine(date, datetime.time(end_hour, 0))

        # Get existing appointments for that day
        existing_appointments = appointment_repository.get_in_time_range(
            day_start,
            day_end,
            [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
        )

        # Generate all possible slots
        all_slots = []
        current_time = day_start
        while current_time <= day_end - timedelta(minutes=duration_minutes):
            slot_end = current_time + timedelta(minutes=duration_minutes)
            all_slots.append({
                "start_time": current_time,
                "end_time": slot_end
            })
            current_time += timedelta(minutes=slot_interval_minutes)

        # Filter out slots that conflict with existing appointments
        available_slots = []
        for slot in all_slots:
            temp_appointment = Appointment(
                patient_id=UUID('00000000-0000-0000-0000-000000000000'),  # Dummy ID
                start_time=slot["start_time"],
                end_time=slot["end_time"],
                appointment_type=None  # Dummy type for checking overlaps
            )

            has_conflict = False
            for existing in existing_appointments:
                if temp_appointment.overlaps_with(existing):
                    has_conflict = True
                    break

            if not has_conflict:
                available_slots.append(slot)

        return available_slots
```python

## 7. Domain Exceptions

Custom exceptions that represent business rule violations.

```python
# app/domain/exceptions/appointment_exceptions.py
class AppointmentConflictError(Exception):
    """Raised when an appointment conflicts with an existing one."""
    pass


class AppointmentValidationError(Exception):
    """Raised when appointment data fails validation."""
    pass


# app/domain/exceptions/patient_exceptions.py
class PatientNotFoundError(Exception):
    """Raised when a patient cannot be found."""
    pass


class PatientValidationError(Exception):
    """Raised when patient data fails validation."""
    pass


# app/domain/exceptions/medication_exceptions.py
class MedicationValidationError(Exception):
    """Raised when medication data fails validation."""
    pass
```python

## 8. Implementation Steps

1. Create the basic directory structure for the domain layer
1. Implement value objects first (Address, ContactInfo, Insurance)
1. Create domain exceptions
1. Implement core entities (Patient, Appointment, ClinicalNote, Medication)
1. Define repository interfaces
1. Implement domain services

## 9. Testing Strategy for Domain Layer

Domain layer tests should be pure unit tests, focusing on business rules without dependencies:

```python
# tests/unit/domain/test_patient.py
import pytest
from datetime import date
from uuid import uuid4

from app.domain.entities.patient import Patient
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.address import Address


class TestPatient:
    """Tests for Patient entity"""

    def test_patient_creation(self):
        """Test that a patient can be created with valid data"""
        contact = ContactInfo(email="patient@example.com", phone="555-123-4567")
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            contact_info=contact
        )

        assert patient.first_name == "John"
        assert patient.last_name == "Doe"
        assert patient.date_of_birth == date(1990, 1, 15)
        assert patient.contact_info == contact
        assert patient.active is True
        assert patient.id is not None

    def test_patient_full_name(self):
        """Test full_name property"""
        contact = ContactInfo(email="patient@example.com", phone="555-123-4567")
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            contact_info=contact
        )

        assert patient.full_name == "John Doe"

    def test_patient_age_calculation(self):
        """Test age calculation logic"""
        contact = ContactInfo(email="patient@example.com", phone="555-123-4567")
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            contact_info=contact
        )

        # This test needs to account for the current date
        today = date.today()
        expected_age = today.year - 1990 - ((today.month, today.day) < (1, 15))

        assert patient.age == expected_age

    def test_patient_deactivation(self):
        """Test patient deactivation"""
        contact = ContactInfo(email="patient@example.com", phone="555-123-4567")
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            contact_info=contact
        )

        assert patient.active is True
        patient.deactivate()
        assert patient.active is False
        patient.reactivate()
        assert patient.active is True
```python

These tests ensure that the domain entities work correctly and enforce business rules as expected.
