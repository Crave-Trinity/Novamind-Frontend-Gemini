# -*- coding: utf-8 -*-
"""
Provider repository interface for the NOVAMIND backend.

This module defines the interface for provider data access operations.
Following the Dependency Inversion Principle, the domain layer depends on
this abstraction rather than concrete implementations.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Set
from uuid import UUID

from app.domain.entities.provider import Provider, ProviderRole, ProviderSpecialty


class ProviderRepository(ABC):
    """
    Repository interface for Provider entity operations.

    This abstract class defines the contract that any provider repository
    implementation must fulfill, ensuring the domain layer remains
    independent of data access technologies.
    """

    @abstractmethod
    async def create(self, provider: Provider) -> Provider:
        """
        Create a new provider record

        Args:
            provider: The provider entity to create

        Returns:
            The created provider with any system-generated fields populated

        Raises:
            RepositoryError: If there's an error during creation
        """
        pass

    @abstractmethod
    async def get_by_id(self, provider_id: UUID) -> Optional[Provider]:
        """
        Retrieve a provider by ID

        Args:
            provider_id: The UUID of the provider to retrieve

        Returns:
            The provider entity if found, None otherwise

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def update(self, provider: Provider) -> Provider:
        """
        Update an existing provider record

        Args:
            provider: The provider entity with updated fields

        Returns:
            The updated provider entity

        Raises:
            RepositoryError: If there's an error during update
            EntityNotFoundError: If the provider doesn't exist
        """
        pass

    @abstractmethod
    async def delete(self, provider_id: UUID) -> bool:
        """
        Delete a provider record

        Args:
            provider_id: The UUID of the provider to delete

        Returns:
            True if the provider was deleted, False otherwise

        Raises:
            RepositoryError: If there's an error during deletion
        """
        pass

    @abstractmethod
    async def list_all(self, limit: int = 100, offset: int = 0) -> List[Provider]:
        """
        List all providers with pagination

        Args:
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of provider entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_by_role(
        self, role: ProviderRole, limit: int = 100, offset: int = 0
    ) -> List[Provider]:
        """
        List all providers with a specific role

        Args:
            role: The provider role to filter by
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of provider entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_by_specialty(
        self, specialty: ProviderSpecialty, limit: int = 100, offset: int = 0
    ) -> List[Provider]:
        """
        List all providers with a specific specialty

        Args:
            specialty: The provider specialty to filter by
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of provider entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_active(self, limit: int = 100, offset: int = 0) -> List[Provider]:
        """
        List all active providers

        Args:
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of active provider entities

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def list_accepting_patients(
        self, limit: int = 100, offset: int = 0
    ) -> List[Provider]:
        """
        List all providers accepting new patients

        Args:
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of provider entities accepting new patients

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def search(
        self, query: str, limit: int = 100, offset: int = 0
    ) -> List[Provider]:
        """
        Search for providers by name or other fields

        Args:
            query: The search query
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of matching provider entities

        Raises:
            RepositoryError: If there's an error during search
        """
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[Provider]:
        """
        Retrieve a provider by email address

        Args:
            email: The email address to search for

        Returns:
            The provider entity if found, None otherwise

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def get_by_npi(self, npi_number: str) -> Optional[Provider]:
        """
        Retrieve a provider by NPI number

        Args:
            npi_number: The National Provider Identifier to search for

        Returns:
            The provider entity if found, None otherwise

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def get_prescribers(
        self, limit: int = 100, offset: int = 0
    ) -> List[Provider]:
        """
        Get all providers who can prescribe medications

        Args:
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of provider entities who can prescribe

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass

    @abstractmethod
    async def count_all(self) -> int:
        """
        Count all providers in the repository

        Returns:
            The total number of providers

        Raises:
            RepositoryError: If there's an error during counting
        """
        pass

    @abstractmethod
    async def get_available_on_day(
        self, day_of_week: int, limit: int = 100, offset: int = 0
    ) -> List[Provider]:
        """
        Get all providers available on a specific day of the week

        Args:
            day_of_week: Day of the week (0 = Monday, 6 = Sunday)
            limit: Maximum number of providers to return
            offset: Number of providers to skip

        Returns:
            List of provider entities available on the specified day

        Raises:
            RepositoryError: If there's an error during retrieval
        """
        pass
