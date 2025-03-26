# app/domain/value_objects/psychiatric_assessment.py
# Value object representing a psychiatric assessment
# Value objects are immutable and equality is based on their attributes

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID


@dataclass(frozen=True)
class PsychiatricAssessment:
    """
    Value object representing a psychiatric assessment
    Immutable and equality is based on attributes
    """
    assessment_id: UUID
    patient_id: UUID
    assessment_date: datetime
    assessment_type: str  # e.g., "Initial", "Follow-up", "Emergency"
    mood_score: int  # Scale 1-10
    anxiety_score: int  # Scale 1-10
    sleep_quality_score: int  # Scale 1-10
    medication_adherence_score: Optional[int] = None  # Scale 1-10
    side_effects: Optional[List[str]] = None
    notes: Optional[str] = None
    
    def __post_init__(self):
        """Validate assessment data"""
        for score_name, score_value in [
            ("mood_score", self.mood_score),
            ("anxiety_score", self.anxiety_score),
            ("sleep_quality_score", self.sleep_quality_score),
        ]:
            if score_value is not None and not (1 <= score_value <= 10):
                raise ValueError(f"{score_name} must be between 1 and 10")
                
        if self.medication_adherence_score is not None and not (1 <= self.medication_adherence_score <= 10):
            raise ValueError("medication_adherence_score must be between 1 and 10")
    
    def get_overall_score(self) -> float:
        """
        Calculate an overall wellness score based on assessment metrics
        
        Returns:
            Float representing overall wellness (higher is better)
        """
        # Simple average of available scores
        scores = [self.mood_score, self.anxiety_score, self.sleep_quality_score]
        
        if self.medication_adherence_score is not None:
            scores.append(self.medication_adherence_score)
            
        return sum(scores) / len(scores)
    
    def has_concerning_symptoms(self) -> bool:
        """
        Check if assessment shows concerning symptoms that need attention
        
        Returns:
            Boolean indicating if there are concerning symptoms
        """
        # Example implementation - would be more sophisticated in real system
        return (
            self.mood_score <= 3 or
            self.anxiety_score >= 8 or
            self.sleep_quality_score <= 2
        )