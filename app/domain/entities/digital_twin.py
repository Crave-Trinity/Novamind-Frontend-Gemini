# -*- coding: utf-8 -*-
"""
Digital Twin domain entities.

This module provides domain entities for digital twin functionality,
representing a virtual model of a patient used for clinical predictions,
personalized insights, and treatment recommendations.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Union


class DigitalTwinFeature:
    """
    Feature of a Digital Twin.
    
    A feature represents a specific aspect, characteristic, or data point
    of a digital twin, which can be used for analysis, prediction, or
    recommendation.
    """
    
    def __init__(
        self,
        name: str,
        value: Any,
        timestamp: Optional[datetime] = None
    ):
        """
        Initialize a Digital Twin Feature.
        
        Args:
            name: Name of the feature
            value: Value of the feature (any serializable type)
            timestamp: Timestamp when the feature was recorded
        """
        self.name = name
        self.value = value
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert feature to dictionary.
        
        Returns:
            Dictionary representation of the feature
        """
        return {
            "name": self.name,
            "value": self.value,
            "timestamp": self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DigitalTwinFeature":
        """
        Create feature from dictionary.
        
        Args:
            data: Dictionary representation of the feature
            
        Returns:
            DigitalTwinFeature instance
        """
        timestamp = None
        if "timestamp" in data:
            if isinstance(data["timestamp"], str):
                timestamp = datetime.fromisoformat(data["timestamp"])
            elif isinstance(data["timestamp"], datetime):
                timestamp = data["timestamp"]
        
        return cls(
            name=data["name"],
            value=data["value"],
            timestamp=timestamp
        )


class TreatmentOutcome:
    """
    Outcome of a treatment for a Digital Twin.
    
    Represents the real-world outcome of a treatment that was administered
    to the patient associated with the digital twin.
    """
    
    def __init__(
        self,
        id: Optional[str] = None,
        digital_twin_id: Optional[str] = None,
        treatment: str = "",
        outcome: str = "",
        effectiveness: str = "",
        notes: Optional[str] = None,
        timestamp: Optional[datetime] = None
    ):
        """
        Initialize a Treatment Outcome.
        
        Args:
            id: Unique ID for the outcome
            digital_twin_id: ID of the associated digital twin
            treatment: Treatment that was administered
            outcome: Observed outcome
            effectiveness: Effectiveness of the treatment
            notes: Additional notes about the outcome
            timestamp: Timestamp when the outcome was recorded
        """
        self.id = id or str(uuid.uuid4())
        self.digital_twin_id = digital_twin_id
        self.treatment = treatment
        self.outcome = outcome
        self.effectiveness = effectiveness
        self.notes = notes
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert treatment outcome to dictionary.
        
        Returns:
            Dictionary representation of the treatment outcome
        """
        return {
            "id": self.id,
            "digital_twin_id": self.digital_twin_id,
            "treatment": self.treatment,
            "outcome": self.outcome,
            "effectiveness": self.effectiveness,
            "notes": self.notes,
            "timestamp": self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TreatmentOutcome":
        """
        Create treatment outcome from dictionary.
        
        Args:
            data: Dictionary representation of the treatment outcome
            
        Returns:
            TreatmentOutcome instance
        """
        timestamp = None
        if "timestamp" in data:
            if isinstance(data["timestamp"], str):
                timestamp = datetime.fromisoformat(data["timestamp"])
            elif isinstance(data["timestamp"], datetime):
                timestamp = data["timestamp"]
        
        return cls(
            id=data.get("id"),
            digital_twin_id=data.get("digital_twin_id"),
            treatment=data.get("treatment", ""),
            outcome=data.get("outcome", ""),
            effectiveness=data.get("effectiveness", ""),
            notes=data.get("notes"),
            timestamp=timestamp
        )


class TreatmentPrediction:
    """
    Prediction of treatment outcome for a Digital Twin.
    
    Represents a model-generated prediction of how a specific treatment
    might affect the patient associated with the digital twin.
    """
    
    def __init__(
        self,
        id: Optional[str] = None,
        digital_twin_id: Optional[str] = None,
        treatment: str = "",
        condition: Optional[str] = None,
        likelihood: str = "",
        timeline: str = "",
        obstacles: List[str] = None,
        influencing_factors: List[str] = None,
        confidence: float = 0.0,
        timestamp: Optional[datetime] = None
    ):
        """
        Initialize a Treatment Prediction.
        
        Args:
            id: Unique ID for the prediction
            digital_twin_id: ID of the associated digital twin
            treatment: Treatment being predicted
            condition: Condition being treated
            likelihood: Likelihood of positive response
            timeline: Expected timeline for response
            obstacles: Potential obstacles to treatment
            influencing_factors: Factors influencing treatment response
            confidence: Confidence score for the prediction
            timestamp: Timestamp when the prediction was made
        """
        self.id = id or str(uuid.uuid4())
        self.digital_twin_id = digital_twin_id
        self.treatment = treatment
        self.condition = condition
        self.likelihood = likelihood
        self.timeline = timeline
        self.obstacles = obstacles or []
        self.influencing_factors = influencing_factors or []
        self.confidence = confidence
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert treatment prediction to dictionary.
        
        Returns:
            Dictionary representation of the treatment prediction
        """
        return {
            "id": self.id,
            "digital_twin_id": self.digital_twin_id,
            "treatment": self.treatment,
            "condition": self.condition,
            "likelihood": self.likelihood,
            "timeline": self.timeline,
            "obstacles": self.obstacles,
            "influencing_factors": self.influencing_factors,
            "confidence": self.confidence,
            "timestamp": self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TreatmentPrediction":
        """
        Create treatment prediction from dictionary.
        
        Args:
            data: Dictionary representation of the treatment prediction
            
        Returns:
            TreatmentPrediction instance
        """
        timestamp = None
        if "timestamp" in data:
            if isinstance(data["timestamp"], str):
                timestamp = datetime.fromisoformat(data["timestamp"])
            elif isinstance(data["timestamp"], datetime):
                timestamp = data["timestamp"]
        
        return cls(
            id=data.get("id"),
            digital_twin_id=data.get("digital_twin_id"),
            treatment=data.get("treatment", ""),
            condition=data.get("condition"),
            likelihood=data.get("likelihood", ""),
            timeline=data.get("timeline", ""),
            obstacles=data.get("obstacles", []),
            influencing_factors=data.get("influencing_factors", []),
            confidence=data.get("confidence", 0.0),
            timestamp=timestamp
        )


class DigitalTwin:
    """
    Digital Twin domain entity.
    
    A Digital Twin is a virtual representation of a patient, incorporating
    clinical data, treatment history, and predictive models to enable
    personalized medicine and improved clinical decision making.
    """
    
    def __init__(
        self,
        id: Optional[str] = None,
        patient_id: Optional[str] = None,
        name: Optional[str] = None,
        description: Optional[str] = None,
        features: List[DigitalTwinFeature] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        """
        Initialize a Digital Twin.
        
        Args:
            id: Unique ID for the digital twin
            patient_id: ID of the associated patient
            name: Name of the digital twin
            description: Description of the digital twin
            features: List of features of the digital twin
            created_at: Timestamp when the digital twin was created
            updated_at: Timestamp when the digital twin was last updated
        """
        self.id = id or str(uuid.uuid4())
        self.patient_id = patient_id
        self.name = name
        self.description = description
        self.features = features or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def add_feature(self, feature: DigitalTwinFeature) -> None:
        """
        Add a feature to the digital twin.
        
        Args:
            feature: Feature to add
        """
        self.features.append(feature)
        self.updated_at = datetime.utcnow()
    
    def get_feature(self, name: str) -> Optional[DigitalTwinFeature]:
        """
        Get a feature by name.
        
        Args:
            name: Name of the feature to get
            
        Returns:
            Feature if found, None otherwise
        """
        for feature in self.features:
            if feature.name == name:
                return feature
        return None
    
    def get_features_by_prefix(self, prefix: str) -> List[DigitalTwinFeature]:
        """
        Get features by name prefix.
        
        Args:
            prefix: Prefix to match feature names against
            
        Returns:
            List of features with names starting with the prefix
        """
        return [feature for feature in self.features if feature.name.startswith(prefix)]
    
    def update_feature(self, name: str, value: Any) -> bool:
        """
        Update a feature.
        
        Args:
            name: Name of the feature to update
            value: New value for the feature
            
        Returns:
            True if the feature was updated, False if not found
        """
        feature = self.get_feature(name)
        if feature:
            feature.value = value
            feature.timestamp = datetime.utcnow()
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    def remove_feature(self, name: str) -> bool:
        """
        Remove a feature.
        
        Args:
            name: Name of the feature to remove
            
        Returns:
            True if the feature was removed, False if not found
        """
        feature = self.get_feature(name)
        if feature:
            self.features.remove(feature)
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert digital twin to dictionary.
        
        Returns:
            Dictionary representation of the digital twin
        """
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "name": self.name,
            "description": self.description,
            "features": [feature.to_dict() for feature in self.features],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DigitalTwin":
        """
        Create digital twin from dictionary.
        
        Args:
            data: Dictionary representation of the digital twin
            
        Returns:
            DigitalTwin instance
        """
        created_at = None
        if "created_at" in data:
            if isinstance(data["created_at"], str):
                created_at = datetime.fromisoformat(data["created_at"])
            elif isinstance(data["created_at"], datetime):
                created_at = data["created_at"]
        
        updated_at = None
        if "updated_at" in data:
            if isinstance(data["updated_at"], str):
                updated_at = datetime.fromisoformat(data["updated_at"])
            elif isinstance(data["updated_at"], datetime):
                updated_at = data["updated_at"]
        
        features = []
        if "features" in data and isinstance(data["features"], list):
            features = [DigitalTwinFeature.from_dict(f) for f in data["features"]]
        
        return cls(
            id=data.get("id"),
            patient_id=data.get("patient_id"),
            name=data.get("name"),
            description=data.get("description"),
            features=features,
            created_at=created_at,
            updated_at=updated_at
        )