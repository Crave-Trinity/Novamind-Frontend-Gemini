# app/domain/repositories/patient_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.patient import Patient


class PatientRepository(ABC):
    """
    Abstract repository interface for Patient entity.
    Following the Repository pattern from DDD.
    """
    @abstractmethod
    async def create(self, patient: Patient) -> Patient:
        """
        Create a new patient
        
        Args:
            patient: Patient entity to create
            
        Returns:
            Created patient with ID
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        """
        Get patient by ID
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            Patient if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def update(self, patient: Patient) -> Patient:
        """
        Update an existing patient
        
        Args:
            patient: Patient entity with updated values
            
        Returns:
            Updated patient
        """
        pass
    
    @abstractmethod
    async def delete(self, patient_id: UUID) -> bool:
        """
        Delete a patient by ID
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            True if deleted, False otherwise
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
            List of patients
        """
        pass
    
    @abstractmethod
    async def search_by_name(self, name: str) -> List[Patient]:
        """
        Search patients by name
        
        Args:
            name: Name to search for
            
        Returns:
            List of matching patients
        """
        pass
