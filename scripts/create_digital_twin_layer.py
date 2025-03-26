#!/usr/bin/env python3
# scripts/create_digital_twin_layer.py
# Script to create the digital twin layer structure for the NOVAMIND backend

import os
import sys
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"

# Digital Twin specific directories
DOMAIN_DIR = APP_DIR / "domain"
APPLICATION_DIR = APP_DIR / "application"
INFRASTRUCTURE_DIR = APP_DIR / "infrastructure"
PRESENTATION_DIR = APP_DIR / "presentation"

# Digital Twin domain layer structure
DIGITAL_TWIN_DOMAIN = {
    "entities/digital_twin": [
        "__init__.py",
        "digital_twin.py",
        "time_series_model.py",
        "twin_model.py",
        "symptom_trajectory.py",
        "treatment_response.py",
        "biometric_correlation.py",
    ],
    "value_objects": [
        "biometric_reading.py",
        "symptom_score.py",
        "treatment_plan.py",
        "medication_response.py",
    ],
    "repositories": [
        "digital_twin_repository.py",
    ],
    "factories": [
        "digital_twin_factory.py",
    ],
}

# Digital Twin application layer structure
DIGITAL_TWIN_APPLICATION = {
    "use_cases/digital_twin": [
        "__init__.py",
        "generate_digital_twin.py",
        "update_digital_twin.py",
        "get_digital_twin.py",
        "forecast_symptoms.py",
        "simulate_treatment.py",
        "analyze_biometrics.py",
        "generate_insights.py",
    ],
    "services": [
        "digital_twin_service.py",
    ],
    "interfaces": [
        "ai_model_service.py",
        "wearable_data_service.py",
    ],
    "dtos": [
        "digital_twin_dto.py",
        "symptom_forecast_dto.py",
        "treatment_simulation_dto.py",
    ],
}

# Digital Twin infrastructure layer structure
DIGITAL_TWIN_INFRASTRUCTURE = {
    "persistence/sqlalchemy/models": [
        "digital_twin.py",
        "biometric_data.py",
        "symptom_record.py",
        "treatment_simulation.py",
    ],
    "persistence/sqlalchemy/repositories": [
        "digital_twin_repository.py",
    ],
    "ai/models": [
        "__init__.py",
        "symptom_forecasting.py",
        "treatment_simulation.py",
        "biometric_correlation.py",
    ],
    "ai/pipelines": [
        "__init__.py",
        "data_preprocessing.py",
        "model_training.py",
        "feature_extraction.py",
    ],
    "external/wearable": [
        "__init__.py",
        "fitbit_client.py",
        "apple_health_client.py",
        "google_fit_client.py",
        "oura_client.py",
    ],
}

# Digital Twin presentation layer structure
DIGITAL_TWIN_PRESENTATION = {
    "api/v1/endpoints": [
        "digital_twins.py",
    ],
    "api/v1/schemas": [
        "digital_twin.py",
        "symptom_forecast.py",
        "treatment_simulation.py",
    ],
}

def create_directory(dir_path):
    """Create directory if it doesn't exist"""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        print(f"Created directory: {dir_path}")

def create_file(file_path, content=""):
    """Create a file with optional content"""
    if not os.path.exists(file_path):
        # Create parent directory if it doesn't exist
        parent_dir = os.path.dirname(file_path)
        if not os.path.exists(parent_dir):
            os.makedirs(parent_dir)
            print(f"Created directory: {parent_dir}")
        
        # Create the file
        with open(file_path, "w") as f:
            if not content:
                rel_path = os.path.relpath(file_path, BASE_DIR)
                content = f"# {rel_path}\n# Placeholder file for Digital Twin architecture\n"
            f.write(content)
        print(f"Created file: {file_path}")

def create_layer_structure(base_dir, structure):
    """Create directory structure for a layer"""
    for subdir, files in structure.items():
        dir_path = os.path.join(base_dir, subdir)
        create_directory(dir_path)
        
        for file in files:
            file_path = os.path.join(dir_path, file)
            create_file(file_path)

def create_digital_twin_placeholder_files():
    """Create placeholder files with appropriate content for Digital Twin components"""
    # Digital Twin entity
    dt_entity_path = os.path.join(DOMAIN_DIR, "entities/digital_twin/digital_twin.py")
    dt_entity_content = """# app/domain/entities/digital_twin/digital_twin.py
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from app.domain.value_objects.biometric_reading import BiometricReading
from app.domain.value_objects.symptom_score import SymptomScore


@dataclass
class DigitalTwin:
    \"\"\"
    Digital Twin entity representing a computational model of a patient's psychiatric state.
    This is the core of the NOVAMIND precision psychiatry approach.
    \"\"\"
    id: UUID
    patient_id: UUID
    created_at: datetime
    updated_at: datetime
    confidence_score: float  # 0.0 to 1.0 representing model confidence
    symptom_scores: Dict[str, SymptomScore]
    biometric_data: Optional[List[BiometricReading]] = None
    version: int = 1
    
    @classmethod
    def create(cls, patient_id: UUID) -> "DigitalTwin":
        \"\"\"Factory method to create a new Digital Twin\"\"\"
        now = datetime.utcnow()
        return cls(
            id=uuid4(),
            patient_id=patient_id,
            created_at=now,
            updated_at=now,
            confidence_score=0.7,  # Initial confidence score
            symptom_scores={},
            version=1
        )
    
    def update_symptom_score(self, symptom_type: str, score: SymptomScore) -> None:
        \"\"\"Update a symptom score in the digital twin\"\"\"
        self.symptom_scores[symptom_type] = score
        self.updated_at = datetime.utcnow()
    
    def add_biometric_reading(self, reading: BiometricReading) -> None:
        \"\"\"Add a biometric reading to the digital twin\"\"\"
        if self.biometric_data is None:
            self.biometric_data = []
        self.biometric_data.append(reading)
        self.updated_at = datetime.utcnow()
    
    def get_overall_wellness_score(self) -> float:
        \"\"\"Calculate overall wellness score based on symptom scores\"\"\"
        if not self.symptom_scores:
            return 0.0
        
        total = sum(score.value for score in self.symptom_scores.values())
        return total / len(self.symptom_scores)
"""
    create_file(dt_entity_path, dt_entity_content)
    
    # Symptom Score value object
    symptom_score_path = os.path.join(DOMAIN_DIR, "value_objects/symptom_score.py")
    symptom_score_content = """# app/domain/value_objects/symptom_score.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class SymptomScore:
    \"\"\"
    Value object representing a symptom score.
    Immutable and equality is based on attributes.
    \"\"\"
    value: float  # 0.0 to 10.0 scale
    recorded_at: datetime
    source: str  # e.g., "self-report", "clinician", "model-predicted"
    notes: Optional[str] = None
    
    def __post_init__(self):
        \"\"\"Validate symptom score data\"\"\"
        if not (0 <= self.value <= 10):
            raise ValueError("Symptom score must be between 0 and 10")
"""
    create_file(symptom_score_path, symptom_score_content)
    
    # Digital Twin Service
    dt_service_path = os.path.join(APPLICATION_DIR, "services/digital_twin_service.py")
    dt_service_content = """# app/application/services/digital_twin_service.py
from typing import Dict, List, Optional
from uuid import UUID

from app.application.interfaces.ai_model_service import AIModelService
from app.application.interfaces.wearable_data_service import WearableDataService
from app.domain.entities.digital_twin.digital_twin import DigitalTwin
from app.domain.repositories.digital_twin_repository import DigitalTwinRepository
from app.domain.repositories.patient_repository import PatientRepository


class DigitalTwinService:
    \"\"\"Service for managing digital twin operations\"\"\"
    
    def __init__(
        self,
        digital_twin_repository: DigitalTwinRepository,
        patient_repository: PatientRepository,
        ai_model_service: AIModelService,
        wearable_data_service: WearableDataService
    ):
        \"\"\"Initialize with required repositories and services\"\"\"
        self.digital_twin_repository = digital_twin_repository
        self.patient_repository = patient_repository
        self.ai_model_service = ai_model_service
        self.wearable_data_service = wearable_data_service
    
    async def get_digital_twin(self, digital_twin_id: UUID) -> Optional[DigitalTwin]:
        \"\"\"
        Get a digital twin by ID
        
        Args:
            digital_twin_id: UUID of the digital twin
            
        Returns:
            DigitalTwin entity if found, None otherwise
        \"\"\"
        return await self.digital_twin_repository.get_by_id(digital_twin_id)
    
    async def forecast_symptom_trajectory(self, digital_twin_id: UUID, days: int = 14) -> Dict:
        \"\"\"
        Forecast symptom trajectory for a specific digital twin
        
        Args:
            digital_twin_id: UUID of the digital twin
            days: Number of days to forecast
            
        Returns:
            Forecast data for the specified period
            
        Raises:
            ValueError: If digital twin doesn't exist
        \"\"\"
        digital_twin = await self.digital_twin_repository.get_by_id(digital_twin_id)
        if not digital_twin:
            raise ValueError(f"Digital twin with ID {digital_twin_id} not found")
        
        # This would call the AI model service in a real implementation
        forecast_data = {
            "digital_twin_id": str(digital_twin_id),
            "forecast_days": days,
            "symptom_trajectories": {
                "anxiety": [5.0, 4.8, 4.5, 4.2, 4.0, 3.8, 3.5, 3.3, 3.1, 3.0, 2.9, 2.8, 2.7, 2.6],
                "depression": [6.0, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4, 5.3, 5.2, 5.1, 5.0, 4.9, 4.8, 4.7],
                "sleep_quality": [3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0, 5.2, 5.4, 5.6]
            },
            "confidence_intervals": {
                "anxiety": [[4.0, 6.0], [3.8, 5.8], [3.5, 5.5], [3.2, 5.2], [3.0, 5.0], 
                           [2.8, 4.8], [2.5, 4.5], [2.3, 4.3], [2.1, 4.1], [2.0, 4.0], 
                           [1.9, 3.9], [1.8, 3.8], [1.7, 3.7], [1.6, 3.6]],
                "depression": [[5.0, 7.0], [4.9, 6.9], [4.8, 6.8], [4.7, 6.7], [4.6, 6.6], 
                              [4.5, 6.5], [4.4, 6.4], [4.3, 6.3], [4.2, 6.2], [4.1, 6.1], 
                              [4.0, 6.0], [3.9, 5.9], [3.8, 5.8], [3.7, 5.7]],
                "sleep_quality": [[2.0, 4.0], [2.2, 4.2], [2.4, 4.4], [2.6, 4.6], [2.8, 4.8], 
                                 [3.0, 5.0], [3.2, 5.2], [3.4, 5.4], [3.6, 5.6], [3.8, 5.8], 
                                 [4.0, 6.0], [4.2, 6.2], [4.4, 6.4], [4.6, 6.6]]
            }
        }
        
        return forecast_data
    
    async def simulate_treatment_response(self, digital_twin_id: UUID, treatment_plan: Dict) -> Dict:
        \"\"\"
        Simulate treatment response for a specific digital twin
        
        Args:
            digital_twin_id: UUID of the digital twin
            treatment_plan: Treatment plan details
            
        Returns:
            Simulated response data
            
        Raises:
            ValueError: If digital twin doesn't exist
        \"\"\"
        digital_twin = await self.digital_twin_repository.get_by_id(digital_twin_id)
        if not digital_twin:
            raise ValueError(f"Digital twin with ID {digital_twin_id} not found")
        
        # This would call the AI model service in a real implementation
        simulation_data = {
            "digital_twin_id": str(digital_twin_id),
            "treatment_plan": treatment_plan,
            "predicted_response": {
                "efficacy_score": 0.75,  # 0.0 to 1.0
                "time_to_response": 14,  # days
                "symptom_trajectories": {
                    "anxiety": [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1],
                    "depression": [6.0, 5.5, 5.0, 4.5, 4.0, 3.5, 3.0, 2.8, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1],
                    "sleep_quality": [3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9]
                },
                "side_effect_risks": {
                    "nausea": 0.15,
                    "headache": 0.10,
                    "insomnia": 0.05
                }
            }
        }
        
        return simulation_data
"""
    create_file(dt_service_path, dt_service_content)
    
    # Digital Twin API Endpoint
    dt_api_path = os.path.join(PRESENTATION_DIR, "api/v1/endpoints/digital_twins.py")
    dt_api_content = """# app/presentation/api/v1/endpoints/digital_twins.py
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel

from app.application.services.digital_twin_service import DigitalTwinService
from app.infrastructure.di.container import get_digital_twin_service
from app.presentation.api.v1.schemas.digital_twin import (
    DigitalTwinCreate,
    DigitalTwinResponse,
    SymptomForecastResponse,
    TreatmentSimulationRequest,
    TreatmentSimulationResponse,
)


router = APIRouter(prefix="/digital-twins", tags=["Digital Twins"])


@router.get("/{digital_twin_id}", response_model=DigitalTwinResponse)
async def get_digital_twin(
    digital_twin_id: UUID = Path(..., description="The ID of the digital twin"),
    digital_twin_service: DigitalTwinService = Depends(get_digital_twin_service),
):
    \"\"\"Get a digital twin by ID\"\"\"
    digital_twin = await digital_twin_service.get_digital_twin(digital_twin_id)
    if not digital_twin:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    return digital_twin


@router.get("/{digital_twin_id}/forecast", response_model=SymptomForecastResponse)
async def forecast_symptoms(
    digital_twin_id: UUID = Path(..., description="The ID of the digital twin"),
    days: int = Query(14, description="Number of days to forecast"),
    digital_twin_service: DigitalTwinService = Depends(get_digital_twin_service),
):
    \"\"\"Forecast symptom trajectory for a digital twin\"\"\"
    try:
        forecast = await digital_twin_service.forecast_symptom_trajectory(digital_twin_id, days)
        return forecast
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{digital_twin_id}/simulate", response_model=TreatmentSimulationResponse)
async def simulate_treatment(
    digital_twin_id: UUID,
    simulation_request: TreatmentSimulationRequest,
    digital_twin_service: DigitalTwinService = Depends(get_digital_twin_service),
):
    \"\"\"Simulate treatment response for a digital twin\"\"\"
    try:
        simulation = await digital_twin_service.simulate_treatment_response(
            digital_twin_id, simulation_request.treatment_plan
        )
        return simulation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
"""
    create_file(dt_api_path, dt_api_content)

def main():
    """Main function to create the digital twin layer structure"""
    print(f"Creating Digital Twin layer structure for NOVAMIND backend in {BASE_DIR}")
    
    # Create layer structures
    create_layer_structure(DOMAIN_DIR, DIGITAL_TWIN_DOMAIN)
    create_layer_structure(APPLICATION_DIR, DIGITAL_TWIN_APPLICATION)
    create_layer_structure(INFRASTRUCTURE_DIR, DIGITAL_TWIN_INFRASTRUCTURE)
    create_layer_structure(PRESENTATION_DIR, DIGITAL_TWIN_PRESENTATION)
    
    # Create specific placeholder files with content
    create_digital_twin_placeholder_files()
    
    print("Digital Twin layer structure created successfully!")
    print("NOVAMIND Digital Twin architecture is now ready for implementation.")

if __name__ == "__main__":
    main()