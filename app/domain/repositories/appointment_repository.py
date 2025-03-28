# -*- coding: utf-8 -*-
"""
Appointment repository interface for the NOVAMIND backend.

This module defines the interface for appointment data access operations.
Following the Dependency Inversion Principle, the domain layer depends on
this abstraction rather than concrete implementations.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from app.domain.entities.appointment import Appointment, AppointmentStatus


class AppointmentRepository(ABC):
    """
    Repository interface for Appointment entity operations.

    This abstract class defines the contract that any appointment repository
    implementation must fulfill, ensuring the domain layer remains
    independent of data access technologies.
    """

    @abstractmethod
    async def create(self, appointment: Appointment) -> Appointment:
        """
        Create a new appointment record

        Args:
            appointment: The appointment entity to create

        Returns:
            The created appointment with any system-generated fields populated

        Raises:
            RepositoryError: If there's an error during creation
        """
        pass

    @abstractmethod
    async def get_by_id(self, appointment_id: UUID) -> Optional[Appointment]:
        """
        Retrieve an appointment by ID

        Args:
            appointment_id: The UUID of the appointment to retrieve

        Returns:
            The appointment entity if found, None otherwise

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def update(self, appointment: Appointment) -> Appointment:
        """
        Update an existing appointment record

        Args:
            appointment: The appointment entity with updated fields

        Returns:
            The updated appointment entity

        Raises:
            RepositoryError: If there's an error during update
            EntityNotFoundError: If the appointment doesn't exist
        """
        pass

    @abstractmethod
    async def delete(self, appointment_id: UUID) -> bool:
        """
        Delete an appointment record

        Args:
            appointment_id: The UUID of the appointment to delete

        Returns:
            True if the appointment was deleted, False otherwise

        Raises:
            RepositoryError: If there's an error during deletion
        """
        pass

    @abstractmethod
    async def list_by_patient(
        self, patient_id: UUID, limit: int = 100, offset: int = 0
    ) -> List[Appointment]:
        """
        List all appointments for a specific patient with pagination

        Args:
            patient_id: The UUID of the patient
            limit: Maximum number of appointments to return
            offset: Number of appointments to skip

        Returns:
            List of appointment entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_by_provider(
        self, provider_id: UUID, limit: int = 100, offset: int = 0
    ) -> List[Appointment]:
        """
        List all appointments for a specific provider with pagination

        Args:
            provider_id: The UUID of the provider
            limit: Maximum number of appointments to return
            offset: Number of appointments to skip

        Returns:
            List of appointment entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        provider_id: Optional[UUID] = None,
    ) -> List[Appointment]:
        """
        List all appointments within a date range, optionally filtered by provider

        Args:
            start_date: The start of the date range
            end_date: The end of the date range
            provider_id: Optional UUID of the provider to filter by

        Returns:
            List of appointment entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_by_status(
        self, status: AppointmentStatus, limit: int = 100, offset: int = 0
    ) -> List[Appointment]:
        """
        List all appointments with a specific status

        Args:
            status: The appointment status to filter by
            limit: Maximum number of appointments to return
            offset: Number of appointments to skip

        Returns:
            List of appointment entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def get_upcoming_appointments(
        self, provider_id: Optional[UUID] = None, days: int = 7
    ) -> List[Appointment]:
        """
        Get upcoming appointments for the next specified number of days

        Args:
            provider_id: Optional UUID of the provider to filter by
            days: Number of days to look ahead

        Returns:
            List of upcoming appointment entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def check_availability(
        self, start_time: datetime, end_time: datetime, provider_id: UUID
    ) -> bool:
        """
        Check if a provider is available during a specific time slot

        Args:
            start_time: The start time of the slot to check
            end_time: The end time of the slot to check
            provider_id: The UUID of the provider

        Returns:
            True if the provider is available, False otherwise

        Raises:
            RepositoryError: If there's an error during checking
        """
        pass

    @abstractmethod
    async def count_by_patient(self, patient_id: UUID) -> int:
        """
        Count all appointments for a specific patient

        Args:
            patient_id: The UUID of the patient

        Returns:
            The total number of appointments for the patient

        Raises:
            RepositoryError: If there's an error during counting
        """
        pass
