# -*- coding: utf-8 -*-
"""
Appointment entity module for the NOVAMIND backend.

This module contains the Appointment entity, which is a core domain entity
representing a scheduled appointment between a patient and a provider.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
from typing import Dict, List, Optional
from uuid import UUID, uuid4


class AppointmentStatus(Enum):
    """Enum representing the possible statuses of an appointment"""

    SCHEDULED = auto()
    CONFIRMED = auto()
    COMPLETED = auto()
    CANCELLED = auto()
    NO_SHOW = auto()
    RESCHEDULED = auto()


class AppointmentType(Enum):
    """Enum representing the possible types of appointments"""

    INITIAL_CONSULTATION = auto()
    FOLLOW_UP = auto()
    MEDICATION_REVIEW = auto()
    THERAPY = auto()
    EMERGENCY = auto()
    TELEHEALTH = auto()
    IN_PERSON = auto()


@dataclass
class AppointmentNote:
    """Value object for notes associated with an appointment"""

    content: str
    created_at: datetime = field(default_factory=datetime.utcnow)
    created_by: Optional[UUID] = None
    is_private: bool = False  # If True, only visible to providers


@dataclass
class Appointment:
    """
    Appointment entity representing a scheduled meeting between a patient and provider.

    This is a rich domain entity containing business logic related to appointment management.
    It follows DDD principles and is framework-independent.
    """

    patient_id: UUID
    provider_id: UUID
    start_time: datetime
    end_time: datetime
    appointment_type: AppointmentType
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    id: UUID = field(default_factory=uuid4)
    location: Optional[str] = None
    virtual_meeting_link: Optional[str] = None
    notes: List[AppointmentNote] = field(default_factory=list)
    reminder_sent: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        """Validate appointment data"""
        if self.start_time >= self.end_time:
            raise ValueError("Appointment end time must be after start time")

        # Ensure telehealth appointments have a virtual meeting link
        if (
            self.appointment_type == AppointmentType.TELEHEALTH
            and not self.virtual_meeting_link
        ):
            raise ValueError("Telehealth appointments must have a virtual meeting link")

        # Ensure in-person appointments have a location
        if self.appointment_type == AppointmentType.IN_PERSON and not self.location:
            raise ValueError("In-person appointments must have a location")

    @property
    def duration(self) -> timedelta:
        """Get the duration of the appointment"""
        return self.end_time - self.start_time

    @property
    def is_telehealth(self) -> bool:
        """Check if this is a telehealth appointment"""
        return self.appointment_type == AppointmentType.TELEHEALTH

    @property
    def is_active(self) -> bool:
        """Check if the appointment is still active (not cancelled or completed)"""
        return self.status in [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]

    def confirm(self) -> None:
        """Confirm the appointment"""
        if self.status == AppointmentStatus.CANCELLED:
            raise ValueError("Cannot confirm a cancelled appointment")

        self.status = AppointmentStatus.CONFIRMED
        self.updated_at = datetime.utcnow()

    def cancel(self) -> None:
        """Cancel the appointment"""
        if self.status == AppointmentStatus.COMPLETED:
            raise ValueError("Cannot cancel a completed appointment")

        self.status = AppointmentStatus.CANCELLED
        self.updated_at = datetime.utcnow()

    def complete(self) -> None:
        """Mark the appointment as completed"""
        if self.status == AppointmentStatus.CANCELLED:
            raise ValueError("Cannot complete a cancelled appointment")

        self.status = AppointmentStatus.COMPLETED
        self.updated_at = datetime.utcnow()

    def reschedule(self, new_start_time: datetime, new_end_time: datetime) -> None:
        """
        Reschedule the appointment to a new time

        Args:
            new_start_time: The new start time for the appointment
            new_end_time: The new end time for the appointment

        Raises:
            ValueError: If the appointment is already completed or cancelled,
                       or if the new end time is not after the new start time
        """
        if self.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise ValueError("Cannot reschedule a completed or cancelled appointment")

        if new_start_time >= new_end_time:
            raise ValueError("New appointment end time must be after start time")

        self.start_time = new_start_time
        self.end_time = new_end_time
        self.status = AppointmentStatus.RESCHEDULED
        self.updated_at = datetime.utcnow()

    def mark_no_show(self) -> None:
        """Mark the appointment as a no-show"""
        if self.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise ValueError(
                "Cannot mark a completed or cancelled appointment as no-show"
            )

        self.status = AppointmentStatus.NO_SHOW
        self.updated_at = datetime.utcnow()

    def add_note(
        self, content: str, created_by: Optional[UUID] = None, is_private: bool = False
    ) -> None:
        """
        Add a note to the appointment

        Args:
            content: The content of the note
            created_by: The ID of the user who created the note
            is_private: Whether the note is private (only visible to providers)
        """
        note = AppointmentNote(
            content=content,
            created_at=datetime.utcnow(),
            created_by=created_by,
            is_private=is_private,
        )
        self.notes.append(note)
        self.updated_at = datetime.utcnow()

    def mark_reminder_sent(self) -> None:
        """Mark that a reminder has been sent for this appointment"""
        self.reminder_sent = True
        self.updated_at = datetime.utcnow()

    def is_upcoming(self, reference_time: Optional[datetime] = None) -> bool:
        """
        Check if the appointment is upcoming

        Args:
            reference_time: The reference time to check against (defaults to now)

        Returns:
            True if the appointment is in the future, False otherwise
        """
        if reference_time is None:
            reference_time = datetime.utcnow()

        return self.start_time > reference_time and self.status not in [
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
        ]

    def is_in_progress(self, reference_time: Optional[datetime] = None) -> bool:
        """
        Check if the appointment is currently in progress

        Args:
            reference_time: The reference time to check against (defaults to now)

        Returns:
            True if the appointment is currently in progress, False otherwise
        """
        if reference_time is None:
            reference_time = datetime.utcnow()

        return (
            self.start_time <= reference_time <= self.end_time
            and self.status
            not in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]
        )
