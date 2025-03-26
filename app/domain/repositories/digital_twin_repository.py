# app/domain/repositories/digital_twin_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.digital_twin.digital_twin import DigitalTwin


class DigitalTwinRepository(ABC):
    """
    Abstract repository interface for DigitalTwin entity.
    Following the Repository pattern from DDD.
    """
    @abstractmethod
    async def create(self, digital_twin: DigitalTwin) -> DigitalTwin:
        """
        Create a new digital twin
        
        Args:
            digital_twin: DigitalTwin entity to create
            
        Returns:
            Created digital twin with ID
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, digital_twin_id: UUID) -> Optional[DigitalTwin]:
        """
        Get digital twin by ID
        
        Args:
            digital_twin_id: DigitalTwin UUID
            
        Returns:
            DigitalTwin if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_patient_id(self, patient_id: UUID) -> Optional[DigitalTwin]:
        """
        Get digital twin by patient ID
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            DigitalTwin if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def update(self, digital_twin: DigitalTwin) -> DigitalTwin:
        """
        Update an existing digital twin
        
        Args:
            digital_twin: DigitalTwin entity with updated values
            
        Returns:
            Updated digital twin
        """
        pass
    
    @abstractmethod
    async def list_versions(self, digital_twin_id: UUID) -> List[DigitalTwin]:
        """
        List all versions of a digital twin
        
        Args:
            digital_twin_id: DigitalTwin UUID
            
        Returns:
            List of digital twin versions
        """
        pass
