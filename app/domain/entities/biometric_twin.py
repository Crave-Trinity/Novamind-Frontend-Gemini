# -*- coding: utf-8 -*-
"""
Biometric Twin domain entities.

This module defines the domain entities for the biometric twin feature,
including biometric data points and related concepts.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID


class BiometricDataPoint:
    """
    A single biometric data point from a patient's wearable device or other source.
    
    This class represents a measurement of a specific biometric parameter
    (e.g., heart rate, blood pressure, sleep duration) at a specific point in time.
    """
    
    def __init__(
        self,
        data_id: UUID,
        patient_id: Optional[UUID],
        data_type: str,
        value: float,
        timestamp: datetime,
        source: str,
        metadata: Dict[str, Any] = None,
        confidence: float = 1.0
    ):
        """
        Initialize a new biometric data point.
        
        Args:
            data_id: Unique identifier for the data point
            patient_id: ID of the patient this data belongs to
            data_type: Type of biometric data (e.g., heart_rate, blood_pressure)
            value: Numerical value of the measurement
            timestamp: Time when the measurement was taken
            source: Source of the data (e.g., apple_watch, fitbit)
            metadata: Additional contextual information about the measurement
            confidence: Confidence level in the measurement (0.0 to 1.0)
        """
        self.data_id = data_id
        self.patient_id = patient_id
        self.data_type = data_type
        self.value = value
        self.timestamp = timestamp
        self.source = source
        self.metadata = metadata or {}
        self.confidence = confidence
    
    def __eq__(self, other):
        """
        Check if two data points are equal.
        
        Args:
            other: Another BiometricDataPoint to compare with
            
        Returns:
            True if the data points are equal, False otherwise
        """
        if not isinstance(other, BiometricDataPoint):
            return False
        
        return (
            self.data_id == other.data_id and
            self.patient_id == other.patient_id and
            self.data_type == other.data_type and
            self.value == other.value and
            self.timestamp == other.timestamp and
            self.source == other.source
        )
    
    def __repr__(self):
        """
        Get a string representation of the data point.
        
        Returns:
            String representation
        """
        return (
            f"BiometricDataPoint(data_id={self.data_id}, "
            f"patient_id={self.patient_id}, "
            f"data_type={self.data_type}, "
            f"value={self.value}, "
            f"timestamp={self.timestamp}, "
            f"source={self.source})"
        )


class BiometricTwin:
    """
    A digital twin of a patient's biometric profile.
    
    This class represents a comprehensive collection of biometric data
    and derived insights for a specific patient.
    """
    
    def __init__(
        self,
        twin_id: UUID,
        patient_id: UUID,
        created_at: datetime,
        updated_at: datetime,
        status: str = "initializing",
        data_points: Dict[str, Dict[datetime, BiometricDataPoint]] = None,
        models: Dict[str, Any] = None,
        insights: Dict[str, Any] = None
    ):
        """
        Initialize a new biometric twin.
        
        Args:
            twin_id: Unique identifier for the twin
            patient_id: ID of the patient this twin represents
            created_at: Time when the twin was created
            updated_at: Time when the twin was last updated
            status: Current status of the twin
            data_points: Dictionary of biometric data points by type and timestamp
            models: Dictionary of ML models associated with this twin
            insights: Dictionary of derived insights from the twin's data
        """
        self.twin_id = twin_id
        self.patient_id = patient_id
        self.created_at = created_at
        self.updated_at = updated_at
        self.status = status
        self.data_points = data_points or {}
        self.models = models or {}
        self.insights = insights or {}
    
    def add_data_point(self, data_point: BiometricDataPoint) -> None:
        """
        Add a new data point to the twin.
        
        Args:
            data_point: Data point to add
        """
        if data_point.patient_id != self.patient_id:
            raise ValueError("Data point patient ID does not match twin patient ID")
        
        if data_point.data_type not in self.data_points:
            self.data_points[data_point.data_type] = {}
        
        self.data_points[data_point.data_type][data_point.timestamp] = data_point
        self.updated_at = datetime.utcnow()
    
    def get_latest_data_point(self, data_type: str) -> Optional[BiometricDataPoint]:
        """
        Get the most recent data point of a specific type.
        
        Args:
            data_type: Type of data to get
            
        Returns:
            The most recent data point, or None if no data points exist
        """
        if data_type not in self.data_points or not self.data_points[data_type]:
            return None
        
        latest_timestamp = max(self.data_points[data_type].keys())
        return self.data_points[data_type][latest_timestamp]
    
    def get_data_points_in_range(
        self,
        data_type: str,
        start_time: datetime,
        end_time: datetime
    ) -> Dict[datetime, BiometricDataPoint]:
        """
        Get all data points of a specific type within a time range.
        
        Args:
            data_type: Type of data to get
            start_time: Start of the time range
            end_time: End of the time range
            
        Returns:
            Dictionary of data points by timestamp
        """
        if data_type not in self.data_points:
            return {}
        
        return {
            timestamp: data_point
            for timestamp, data_point in self.data_points[data_type].items()
            if start_time <= timestamp <= end_time
        }
    
    def __repr__(self):
        """
        Get a string representation of the twin.
        
        Returns:
            String representation
        """
        data_point_count = sum(len(points) for points in self.data_points.values())
        return (
            f"BiometricTwin(twin_id={self.twin_id}, "
            f"patient_id={self.patient_id}, "
            f"status={self.status}, "
            f"data_points={data_point_count})"
        )