# -*- coding: utf-8 -*-
"""
Unit tests for the BiometricTwin entity.

This module contains tests for the BiometricTwin entity and its associated
BiometricDataPoint class, ensuring they function correctly and maintain
data integrity.
"""

import pytest
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from app.domain.entities.digital_twin.biometric_twin import BiometricTwin, BiometricDataPoint
from app.domain.exceptions import ValidationError


class TestBiometricDataPoint:
    """Tests for the BiometricDataPoint class."""
    
    def test_create_data_point_with_valid_data(self):
        """Test creating a data point with valid data."""
        # Arrange
        data_id = uuid4()
        timestamp = datetime.utcnow()
        
        # Act
        data_point = BiometricDataPoint(
            data_type="heart_rate",
            value=75,
            timestamp=timestamp,
            source="smartwatch",
            metadata={"activity": "resting"},
            confidence=0.95,
            data_id=data_id
        )
        
        # Assert
        assert data_point.data_id == data_id
        assert data_point.data_type == "heart_rate"
        assert data_point.value == 75
        assert data_point.timestamp == timestamp
        assert data_point.source == "smartwatch"
        assert data_point.metadata == {"activity": "resting"}
        assert data_point.confidence == 0.95
    
    def test_create_data_point_with_default_values(self):
        """Test creating a data point with default values."""
        # Act
        data_point = BiometricDataPoint(
            data_type="blood_pressure",
            value="120/80",
            timestamp=datetime.utcnow(),
            source="blood_pressure_monitor"
        )
        
        # Assert
        assert isinstance(data_point.data_id, UUID)
        assert data_point.metadata == {}
        assert data_point.confidence == 1.0
    
    def test_create_data_point_with_invalid_confidence(self):
        """Test creating a data point with invalid confidence value."""
        # Arrange & Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            BiometricDataPoint(
                data_type="heart_rate",
                value=75,
                timestamp=datetime.utcnow(),
                source="smartwatch",
                confidence=1.5  # Invalid: > 1.0
            )
        
        assert "Confidence must be between 0.0 and 1.0" in str(exc_info.value)
        
        with pytest.raises(ValidationError) as exc_info:
            BiometricDataPoint(
                data_type="heart_rate",
                value=75,
                timestamp=datetime.utcnow(),
                source="smartwatch",
                confidence=-0.1  # Invalid: < 0.0
            )
        
        assert "Confidence must be between 0.0 and 1.0" in str(exc_info.value)
    
    def test_create_data_point_with_empty_data_type(self):
        """Test creating a data point with empty data type."""
        # Arrange & Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            BiometricDataPoint(
                data_type="",  # Invalid: empty string
                value=75,
                timestamp=datetime.utcnow(),
                source="smartwatch"
            )
        
        assert "Biometric data type cannot be empty" in str(exc_info.value)
    
    def test_to_dict_method(self):
        """Test the to_dict method returns the correct dictionary representation."""
        # Arrange
        data_id = uuid4()
        timestamp = datetime.utcnow()
        data_point = BiometricDataPoint(
            data_type="heart_rate",
            value=75,
            timestamp=timestamp,
            source="smartwatch",
            metadata={"activity": "resting"},
            confidence=0.95,
            data_id=data_id
        )
        
        # Act
        result = data_point.to_dict()
        
        # Assert
        assert result["data_id"] == str(data_id)
        assert result["data_type"] == "heart_rate"
        assert result["value"] == 75
        assert result["timestamp"] == timestamp.isoformat()
        assert result["source"] == "smartwatch"
        assert result["metadata"] == {"activity": "resting"}
        assert result["confidence"] == 0.95


class TestBiometricTwin:
    """Tests for the BiometricTwin class."""
    
    def test_create_biometric_twin_with_valid_data(self):
        """Test creating a biometric twin with valid data."""
        # Arrange
        patient_id = uuid4()
        twin_id = uuid4()
        created_at = datetime.utcnow()
        
        # Act
        twin = BiometricTwin(
            patient_id=patient_id,
            twin_id=twin_id,
            created_at=created_at,
            baseline_established=True,
            connected_devices={"smartwatch", "glucose_monitor"}
        )
        
        # Assert
        assert twin.twin_id == twin_id
        assert twin.patient_id == patient_id
        assert twin.created_at == created_at
        assert twin.updated_at == created_at
        assert twin.baseline_established is True
        assert twin.connected_devices == {"smartwatch", "glucose_monitor"}
        assert twin.data_points == []
    
    def test_create_biometric_twin_with_default_values(self):
        """Test creating a biometric twin with default values."""
        # Arrange
        patient_id = uuid4()
        
        # Act
        twin = BiometricTwin(patient_id=patient_id)
        
        # Assert
        assert isinstance(twin.twin_id, UUID)
        assert twin.patient_id == patient_id
        assert isinstance(twin.created_at, datetime)
        assert twin.updated_at == twin.created_at
        assert twin.baseline_established is False
        assert twin.connected_devices == set()
        assert twin.data_points == []
    
    def test_add_data_point(self):
        """Test adding a data point to a biometric twin."""
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(patient_id=patient_id)
        data_point = BiometricDataPoint(
            data_type="heart_rate",
            value=75,
            timestamp=datetime.utcnow(),
            source="smartwatch"
        )
        original_updated_at = twin.updated_at
        
        # Act
        twin.add_data_point(data_point)
        
        # Assert
        assert len(twin.data_points) == 1
        assert twin.data_points[0] == data_point
        assert twin.updated_at > original_updated_at
    
    def test_get_data_points_by_type(self):
        """Test retrieving data points by type."""
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(patient_id=patient_id)
        
        # Add heart rate data points
        for i in range(3):
            twin.add_data_point(BiometricDataPoint(
                data_type="heart_rate",
                value=70 + i,
                timestamp=datetime.utcnow() - timedelta(hours=i),
                source="smartwatch"
            ))
        
        # Add blood pressure data points
        for i in range(2):
            twin.add_data_point(BiometricDataPoint(
                data_type="blood_pressure",
                value=f"{120+i}/{80+i}",
                timestamp=datetime.utcnow() - timedelta(hours=i),
                source="blood_pressure_monitor"
            ))
        
        # Act
        heart_rate_points = twin.get_data_points_by_type("heart_rate")
        blood_pressure_points = twin.get_data_points_by_type("blood_pressure")
        sleep_points = twin.get_data_points_by_type("sleep_quality")
        
        # Assert
        assert len(heart_rate_points) == 3
        assert all(dp.data_type == "heart_rate" for dp in heart_rate_points)
        assert len(blood_pressure_points) == 2
        assert all(dp.data_type == "blood_pressure" for dp in blood_pressure_points)
        assert len(sleep_points) == 0
    
    def test_get_data_points_by_type_with_time_range(self):
        """Test retrieving data points by type with time range filtering."""
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(patient_id=patient_id)
        now = datetime.utcnow()
        
        # Add data points at different times
        for i in range(5):
            twin.add_data_point(BiometricDataPoint(
                data_type="heart_rate",
                value=70 + i,
                timestamp=now - timedelta(hours=i),
                source="smartwatch"
            ))
        
        # Act
        # Get points from the last 2 hours
        recent_points = twin.get_data_points_by_type(
            "heart_rate",
            start_time=now - timedelta(hours=2),
            end_time=now
        )
        
        # Get points from 3-4 hours ago
        older_points = twin.get_data_points_by_type(
            "heart_rate",
            start_time=now - timedelta(hours=4),
            end_time=now - timedelta(hours=3)
        )
        
        # Assert
        assert len(recent_points) == 3  # Points from 0, 1, and 2 hours ago
        assert len(older_points) == 1   # Point from 3 hours ago
    
    def test_establish_baseline(self):
        """Test establishing a baseline for a biometric twin."""
        # This is a simplified test as the actual implementation would be more complex
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(patient_id=patient_id)
        now = datetime.utcnow()
        
        # Add required data points for baseline
        for i in range(7):
            # Heart rate data
            twin.add_data_point(BiometricDataPoint(
                data_type="heart_rate",
                value=70 + i,
                timestamp=now - timedelta(days=i),
                source="smartwatch"
            ))
            
            # Sleep quality data
            twin.add_data_point(BiometricDataPoint(
                data_type="sleep_quality",
                value=0.8 - (i * 0.05),
                timestamp=now - timedelta(days=i),
                source="sleep_tracker"
            ))
            
            # Activity level data
            twin.add_data_point(BiometricDataPoint(
                data_type="activity_level",
                value=5000 + (i * 500),
                timestamp=now - timedelta(days=i),
                source="fitness_tracker"
            ))
        
        # Act
        result = twin.establish_baseline()
        
        # Assert
        assert result is True
        assert twin.baseline_established is True
    
    def test_establish_baseline_insufficient_data(self):
        """Test establishing a baseline with insufficient data."""
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(patient_id=patient_id)
        
        # Add some data but not enough for baseline
        twin.add_data_point(BiometricDataPoint(
            data_type="heart_rate",
            value=75,
            timestamp=datetime.utcnow(),
            source="smartwatch"
        ))
        
        # Act
        result = twin.establish_baseline()
        
        # Assert
        assert result is False
        assert twin.baseline_established is False
    
    def test_detect_anomalies(self):
        """Test detecting anomalies in biometric data."""
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(
            patient_id=patient_id,
            baseline_established=True  # Assume baseline is established
        )
        now = datetime.utcnow()
        
        # Add normal heart rate data
        for i in range(5):
            twin.add_data_point(BiometricDataPoint(
                data_type="heart_rate",
                value=70 + i,  # Normal range: 70-74
                timestamp=now - timedelta(hours=i),
                source="smartwatch"
            ))
        
        # Add an anomalous heart rate
        anomalous_point = BiometricDataPoint(
            data_type="heart_rate",
            value=120,  # Anomalous value
            timestamp=now - timedelta(hours=5),
            source="smartwatch"
        )
        twin.add_data_point(anomalous_point)
        
        # Act
        anomalies = twin.detect_anomalies("heart_rate")
        
        # Assert
        assert len(anomalies) == 1
        assert anomalies[0] == anomalous_point
    
    def test_to_dict_method(self):
        """Test the to_dict method returns the correct dictionary representation."""
        # Arrange
        patient_id = uuid4()
        twin_id = uuid4()
        created_at = datetime.utcnow()
        updated_at = created_at + timedelta(hours=1)
        
        twin = BiometricTwin(
            patient_id=patient_id,
            twin_id=twin_id,
            created_at=created_at,
            updated_at=updated_at,
            baseline_established=True,
            connected_devices={"smartwatch", "glucose_monitor"}
        )
        
        # Add some data points
        for i in range(3):
            twin.add_data_point(BiometricDataPoint(
                data_type="heart_rate",
                value=70 + i,
                timestamp=datetime.utcnow() - timedelta(hours=i),
                source="smartwatch"
            ))
        
        # Act
        result = twin.to_dict()
        
        # Assert
        assert result["twin_id"] == str(twin_id)
        assert result["patient_id"] == str(patient_id)
        assert result["created_at"] == created_at.isoformat()
        assert result["updated_at"] == updated_at.isoformat()
        assert result["baseline_established"] is True
        assert set(result["connected_devices"]) == {"smartwatch", "glucose_monitor"}
        assert result["data_points_count"] == 3
    
    def test_connect_and_disconnect_device(self):
        """Test connecting and disconnecting devices."""
        # Arrange
        patient_id = uuid4()
        twin = BiometricTwin(patient_id=patient_id)
        
        # Act - Connect devices
        twin.connect_device("smartwatch")
        twin.connect_device("glucose_monitor")
        
        # Assert
        assert twin.connected_devices == {"smartwatch", "glucose_monitor"}
        
        # Act - Disconnect a device
        twin.disconnect_device("smartwatch")
        
        # Assert
        assert twin.connected_devices == {"glucose_monitor"}
        
        # Act - Disconnect a non-existent device (should not raise an error)
        twin.disconnect_device("non_existent_device")
        
        # Assert
        assert twin.connected_devices == {"glucose_monitor"}