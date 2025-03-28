# -*- coding: utf-8 -*-
"""
Patient Repository Interface

This module defines the interface for patient repositories.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Union, Dict, Any
from uuid import UUID

from app.domain.entities.patient import Patient


class PatientRepository(ABC):
    """
    Interface for patient repositories.
    
    This abstract class defines the contract that all patient repositories
    must implement, ensuring consistent access to patient data regardless
    of the underlying storage mechanism.
    """
    
    @abstractmethod
    def get_by_id(self, patient_id: Union[UUID, str]) -> Optional[Patient]:
        """
        Get a patient by ID.
        
        Args:
            patient_id: ID of the patient
            
        Returns:
            Patient if found, None otherwise
        """
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Patient]:
        """
        Get a patient by email.
        
        Args:
            email: Email of the patient
            
        Returns:
            Patient if found, None otherwise
        """
        pass
    
    @abstractmethod
    def get_by_phone(self, phone: str) -> Optional[Patient]:
        """
        Get a patient by phone number.
        
        Args:
            phone: Phone number of the patient
            
        Returns:
            Patient if found, None otherwise
        """
        pass
    
    @abstractmethod
    def save(self, patient: Patient) -> Patient:
        """
        Save a patient.
        
        Args:
            patient: Patient to save
            
        Returns:
            Saved patient
        """
        pass
    
    @abstractmethod
    def delete(self, patient_id: Union[UUID, str]) -> bool:
        """
        Delete a patient.
        
        Args:
            patient_id: ID of the patient to delete
            
        Returns:
            True if deleted, False otherwise
        """
        pass
    
    @abstractmethod
    def search(
        self,
        query: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Patient]:
        """
        Search for patients.
        
        Args:
            query: Search query
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of matching patients
        """
        pass
    
    @abstractmethod
    def get_all(
        self,
        limit: int = 100,
        offset: int = 0,
        sort_by: str = "last_name",
        sort_order: str = "asc"
    ) -> List[Patient]:
        """
        Get all patients with pagination.
        
        Args:
            limit: Maximum number of results
            offset: Offset for pagination
            sort_by: Field to sort by
            sort_order: Sort order (asc or desc)
            
        Returns:
            List of patients
        """
        pass
    
    @abstractmethod
    def count(self) -> int:
        """
        Count all patients.
        
        Returns:
            Number of patients
        """
        pass
    
    @abstractmethod
    def exists(self, patient_id: Union[UUID, str]) -> bool:
        """
        Check if a patient exists.
        
        Args:
            patient_id: ID of the patient
            
        Returns:
            True if exists, False otherwise
        """
        pass
    
    @abstractmethod
    def exists_by_email(self, email: str) -> bool:
        """
        Check if a patient exists by email.
        
        Args:
            email: Email of the patient
            
        Returns:
            True if exists, False otherwise
        """
        pass
    
    @abstractmethod
    def exists_by_phone(self, phone: str) -> bool:
        """
        Check if a patient exists by phone number.
        
        Args:
            phone: Phone number of the patient
            
        Returns:
            True if exists, False otherwise
        """
        pass
    
    @abstractmethod
    def get_patients_with_upcoming_appointments(
        self,
        days: int = 7
    ) -> List[Patient]:
        """
        Get patients with upcoming appointments.
        
        Args:
            days: Number of days to look ahead
            
        Returns:
            List of patients with upcoming appointments
        """
        pass
