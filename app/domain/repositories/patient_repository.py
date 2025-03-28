# -*- coding: utf-8 -*-
"""
Patient repository interface for the NOVAMIND backend.

This module defines the interface for patient data access operations.
Following the Dependency Inversion Principle, the domain layer depends on
this abstraction rather than concrete implementations.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.patient import Patient


class PatientRepository(ABC):
    """
    Repository interface for Patient entity operations.

    This abstract class defines the contract that any patient repository
    implementation must fulfill, ensuring the domain layer remains
    independent of data access technologies.
    """

    @abstractmethod
    async def create(self, patient: Patient) -> Patient:
        """
        Create a new patient record

        Args:
            patient: The patient entity to create

        Returns:
            The created patient with any system-generated fields populated

        Raises:
            RepositoryError: If there's an error during creation
        """
        pass

    @abstractmethod
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        """
        Retrieve a patient by ID

        Args:
            patient_id: The UUID of the patient to retrieve

        Returns:
            The patient entity if found, None otherwise

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def update(self, patient: Patient) -> Patient:
        """
        Update an existing patient record

        Args:
            patient: The patient entity with updated fields

        Returns:
            The updated patient entity

        Raises:
            RepositoryError: If there's an error during update
            EntityNotFoundError: If the patient doesn't exist
        """
        pass

    @abstractmethod
    async def delete(self, patient_id: UUID) -> bool:
        """
        Delete a patient record

        Args:
            patient_id: The UUID of the patient to delete

        Returns:
            True if the patient was deleted, False otherwise

        Raises:
            RepositoryError: If there's an error during deletion
        """
        pass

    @abstractmethod
    async def list_all(self, limit: int = 100, offset: int = 0) -> List[Patient]:
        """
        List all patients with pagination

        Args:
            limit: Maximum number of patients to return
            offset: Number of patients to skip

        Returns:
            List of patient entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def search(
        self, query: str, limit: int = 100, offset: int = 0
    ) -> List[Patient]:
        """
        Search for patients by name, email, or phone

        Args:
            query: The search query
            limit: Maximum number of patients to return
            offset: Number of patients to skip

        Returns:
            List of matching patient entities

        Raises:
            RepositoryError: If there's an error during search
        """
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[Patient]:
        """
        Retrieve a patient by email address

        Args:
            email: The email address to search for

        Returns:
            The patient entity if found, None otherwise

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def count_all(self) -> int:
        """
        Count all patients in the repository

        Returns:
            The total number of patients

        Raises:
            RepositoryError: If there's an error during counting
        """
        pass
