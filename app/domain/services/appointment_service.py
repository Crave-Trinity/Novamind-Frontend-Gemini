"""
Appointment service module for the NOVAMIND backend.

This module contains the AppointmentService, which encapsulates complex business logic
related to appointment management in the concierge psychiatry practice.
"""
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from uuid import UUID

from app.domain.entities.appointment import Appointment, AppointmentStatus, AppointmentType
from app.domain.repositories.appointment_repository import AppointmentRepository
from app.domain.repositories.patient_repository import PatientRepository


class AppointmentConflictError(Exception):
    """Exception raised when there is a scheduling conflict"""
    pass


class AppointmentService:
    """
    Service for managing appointments in the concierge psychiatry practice.
    
    This service encapsulates complex business logic related to appointment
    scheduling, availability checking, and conflict resolution.
    """
    
    def __init__(self, 
                 appointment_repository: AppointmentRepository,
                 patient_repository: PatientRepository):
        """
        Initialize the appointment service
        
        Args:
            appointment_repository: Repository for appointment data access
            patient_repository: Repository for patient data access
        """
        self._appointment_repo = appointment_repository
        self._patient_repo = patient_repository
        
        # Define standard appointment durations by type (in minutes)
        self._standard_durations = {
            AppointmentType.INITIAL_CONSULTATION: 60,
            AppointmentType.FOLLOW_UP: 30,
            AppointmentType.MEDICATION_REVIEW: 20,
            AppointmentType.THERAPY: 50,
            AppointmentType.EMERGENCY: 45,
            AppointmentType.TELEHEALTH: 30,
            AppointmentType.IN_PERSON: 45
        }
    
    async def schedule_appointment(self, 
                                  patient_id: UUID,
                                  provider_id: UUID,
                                  start_time: datetime,
                                  appointment_type: AppointmentType,
                                  location: Optional[str] = None,
                                  virtual_meeting_link: Optional[str] = None,
                                  custom_duration: Optional[int] = None) -> Appointment:
        """
        Schedule a new appointment
        
        Args:
            patient_id: UUID of the patient
            provider_id: UUID of the provider
            start_time: Start time of the appointment
            appointment_type: Type of appointment
            location: Optional physical location for the appointment
            virtual_meeting_link: Optional link for telehealth appointments
            custom_duration: Optional custom duration in minutes
            
        Returns:
            The created appointment entity
            
        Raises:
            AppointmentConflictError: If there is a scheduling conflict
            ValueError: If the appointment data is invalid
        """
        # Verify patient exists
        patient = await self._patient_repo.get_by_id(patient_id)
        if not patient:
            raise ValueError(f"Patient with ID {patient_id} does not exist")
        
        # Calculate end time based on appointment type or custom duration
        duration_minutes = custom_duration or self._standard_durations.get(appointment_type, 30)
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Check for scheduling conflicts
        is_available = await self._appointment_repo.check_availability(
            start_time, end_time, provider_id
        )
        
        if not is_available:
            raise AppointmentConflictError(
                f"Provider {provider_id} is not available from {start_time} to {end_time}"
            )
        
        # Create appointment
        appointment = Appointment(
            patient_id=patient_id,
            provider_id=provider_id,
            start_time=start_time,
            end_time=end_time,
            appointment_type=appointment_type,
            location=location,
            virtual_meeting_link=virtual_meeting_link,
            status=AppointmentStatus.SCHEDULED
        )
        
        # Save to repository
        return await self._appointment_repo.create(appointment)
    
    async def reschedule_appointment(self,
                                    appointment_id: UUID,
                                    new_start_time: datetime,
                                    custom_duration: Optional[int] = None) -> Appointment:
        """
        Reschedule an existing appointment
        
        Args:
            appointment_id: UUID of the appointment to reschedule
            new_start_time: New start time for the appointment
            custom_duration: Optional custom duration in minutes
            
        Returns:
            The updated appointment entity
            
        Raises:
            AppointmentConflictError: If there is a scheduling conflict
            ValueError: If the appointment cannot be rescheduled
        """
        # Retrieve the appointment
        appointment = await self._appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist")
        
        # Check if appointment can be rescheduled
        if appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            raise ValueError(f"Cannot reschedule appointment with status {appointment.status}")
        
        # Calculate new end time
        if custom_duration:
            new_end_time = new_start_time + timedelta(minutes=custom_duration)
        else:
            # Keep the same duration as before
            original_duration = (appointment.end_time - appointment.start_time).total_seconds() / 60
            new_end_time = new_start_time + timedelta(minutes=original_duration)
        
        # Check for scheduling conflicts (excluding this appointment)
        is_available = await self._check_availability_excluding_current(
            new_start_time, new_end_time, appointment.provider_id, appointment_id
        )
        
        if not is_available:
            raise AppointmentConflictError(
                f"Provider {appointment.provider_id} is not available from {new_start_time} to {new_end_time}"
            )
        
        # Update appointment times
        appointment.reschedule(new_start_time, new_end_time)
        
        # Save to repository
        return await self._appointment_repo.update(appointment)
    
    async def cancel_appointment(self, appointment_id: UUID) -> Appointment:
        """
        Cancel an appointment
        
        Args:
            appointment_id: UUID of the appointment to cancel
            
        Returns:
            The updated appointment entity
            
        Raises:
            ValueError: If the appointment cannot be cancelled
        """
        # Retrieve the appointment
        appointment = await self._appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist")
        
        # Cancel the appointment
        appointment.cancel()
        
        # Save to repository
        return await self._appointment_repo.update(appointment)
    
    async def complete_appointment(self, appointment_id: UUID) -> Appointment:
        """
        Mark an appointment as completed
        
        Args:
            appointment_id: UUID of the appointment to mark as completed
            
        Returns:
            The updated appointment entity
            
        Raises:
            ValueError: If the appointment cannot be marked as completed
        """
        # Retrieve the appointment
        appointment = await self._appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist")
        
        # Complete the appointment
        appointment.complete()
        
        # Save to repository
        return await self._appointment_repo.update(appointment)
    
    async def get_available_slots(self, 
                                provider_id: UUID,
                                date: datetime,
                                appointment_type: AppointmentType,
                                custom_duration: Optional[int] = None) -> List[Tuple[datetime, datetime]]:
        """
        Get available appointment slots for a provider on a specific date
        
        Args:
            provider_id: UUID of the provider
            date: The date to check availability for
            appointment_type: Type of appointment
            custom_duration: Optional custom duration in minutes
            
        Returns:
            List of available time slots as (start_time, end_time) tuples
        """
        # Set business hours (9 AM to 5 PM by default)
        business_start = datetime.combine(date.date(), datetime.min.time().replace(hour=9))
        business_end = datetime.combine(date.date(), datetime.min.time().replace(hour=17))
        
        # Get appointment duration
        duration_minutes = custom_duration or self._standard_durations.get(appointment_type, 30)
        slot_duration = timedelta(minutes=duration_minutes)
        
        # Get all appointments for the provider on this date
        start_of_day = datetime.combine(date.date(), datetime.min.time())
        end_of_day = datetime.combine(date.date(), datetime.max.time())
        existing_appointments = await self._appointment_repo.list_by_date_range(
            start_of_day, end_of_day, provider_id
        )
        
        # Filter out cancelled appointments
        existing_appointments = [
            appt for appt in existing_appointments 
            if appt.status != AppointmentStatus.CANCELLED
        ]
        
        # Generate all possible slots
        current_slot_start = business_start
        available_slots = []
        
        while current_slot_start + slot_duration <= business_end:
            current_slot_end = current_slot_start + slot_duration
            
            # Check if slot conflicts with any existing appointment
            is_available = True
            for appt in existing_appointments:
                # Check for overlap
                if (current_slot_start < appt.end_time and 
                    current_slot_end > appt.start_time):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append((current_slot_start, current_slot_end))
            
            # Move to next slot (30-minute increments)
            current_slot_start += timedelta(minutes=30)
        
        return available_slots
    
    async def get_upcoming_appointments_for_patient(self, 
                                                  patient_id: UUID, 
                                                  days: int = 30) -> List[Appointment]:
        """
        Get upcoming appointments for a specific patient
        
        Args:
            patient_id: UUID of the patient
            days: Number of days to look ahead
            
        Returns:
            List of upcoming appointment entities
        """
        # Verify patient exists
        patient = await self._patient_repo.get_by_id(patient_id)
        if not patient:
            raise ValueError(f"Patient with ID {patient_id} does not exist")
        
        # Get all appointments for the patient
        appointments = await self._appointment_repo.list_by_patient(patient_id)
        
        # Filter for upcoming appointments within the specified days
        now = datetime.utcnow()
        end_date = now + timedelta(days=days)
        
        upcoming_appointments = [
            appt for appt in appointments 
            if (appt.start_time >= now and 
                appt.start_time <= end_date and
                appt.status not in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED])
        ]
        
        # Sort by start time
        upcoming_appointments.sort(key=lambda x: x.start_time)
        
        return upcoming_appointments
    
    async def _check_availability_excluding_current(self,
                                                  start_time: datetime,
                                                  end_time: datetime,
                                                  provider_id: UUID,
                                                  current_appointment_id: UUID) -> bool:
        """
        Check if a time slot is available, excluding the current appointment
        
        Args:
            start_time: Start time of the slot
            end_time: End time of the slot
            provider_id: UUID of the provider
            current_appointment_id: UUID of the current appointment to exclude
            
        Returns:
            True if the slot is available, False otherwise
        """
        # Get all appointments for the provider on this date
        day_start = datetime.combine(start_time.date(), datetime.min.time())
        day_end = datetime.combine(start_time.date(), datetime.max.time())
        
        existing_appointments = await self._appointment_repo.list_by_date_range(
            day_start, day_end, provider_id
        )
        
        # Filter out cancelled appointments and the current appointment
        existing_appointments = [
            appt for appt in existing_appointments 
            if (appt.status != AppointmentStatus.CANCELLED and 
                appt.id != current_appointment_id)
        ]
        
        # Check for conflicts
        for appt in existing_appointments:
            # Check for overlap
            if start_time < appt.end_time and end_time > appt.start_time:
                return False
        
        return True
