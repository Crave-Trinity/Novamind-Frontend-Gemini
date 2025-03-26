#!/usr/bin/env python3
# create_application_layer.py - Creates the application layer structure for NOVAMIND
# HIPAA-compliant psychiatric digital twin platform

import os
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("project_creation.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Project root directory
PROJECT_ROOT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
APP_ROOT = os.path.join(PROJECT_ROOT, "app", "application")

# Application layer directories
APP_DIRS = [
    "use_cases",
    "use_cases/patient",
    "use_cases/digital_twin",
    "use_cases/appointment",
    "dto",
    "interfaces",
    "interfaces/notification",
    "interfaces/storage",
    "interfaces/ai",
    "services"
]

# Application layer files with content
APP_FILES = {
    # Base use case
    "use_cases/base_use_case.py": """# app/application/use_cases/base_use_case.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

# Input/Output type variables
I = TypeVar('I')
O = TypeVar('O')


class BaseUseCase(Generic[I, O], ABC):
    """
    Base class for all use cases following Clean Architecture principles.
    
    Generic type parameters:
    - I: Input type (DTO or simple type)
    - O: Output type (DTO or simple type)
    """
    @abstractmethod
    async def execute(self, input_data: I) -> O:
        """
        Execute the use case logic.
        
        Args:
            input_data: Input data for the use case
            
        Returns:
            Result of the use case execution
        """
        pass
""",

    # Digital Twin use cases
    "use_cases/digital_twin/create_digital_twin.py": """# app/application/use_cases/digital_twin/create_digital_twin.py
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from app.application.dto.digital_twin_dto import DigitalTwinDTO, DigitalTwinModelDTO
from app.application.use_cases.base_use_case import BaseUseCase
from app.domain.entities.digital_twin.digital_twin import DigitalTwin
from app.domain.entities.digital_twin.time_series_model import TimeSeriesModel
from app.domain.repositories.digital_twin_repository import DigitalTwinRepository
from app.domain.repositories.patient_repository import PatientRepository


@dataclass
class CreateDigitalTwinInput:
    """Input DTO for creating a digital twin"""
    patient_id: UUID
    model_parameters: Optional[dict] = None
    confidence_score: float = 0.0


class CreateDigitalTwinUseCase(BaseUseCase[CreateDigitalTwinInput, DigitalTwinDTO]):
    """
    Use case for creating a new digital twin for a patient.
    Follows the Command pattern.
    """
    def __init__(
        self,
        digital_twin_repository: DigitalTwinRepository,
        patient_repository: PatientRepository
    ):
        self.digital_twin_repository = digital_twin_repository
        self.patient_repository = patient_repository
    
    async def execute(self, input_data: CreateDigitalTwinInput) -> DigitalTwinDTO:
        """
        Create a new digital twin for a patient
        
        Args:
            input_data: Creation parameters
            
        Returns:
            DTO with created digital twin data
            
        Raises:
            ValueError: If patient doesn't exist
        """
        # Verify patient exists
        patient = await self.patient_repository.get_by_id(input_data.patient_id)
        if not patient:
            raise ValueError(f"Patient with ID {input_data.patient_id} not found")
        
        # Check if digital twin already exists
        existing_twin = await self.digital_twin_repository.get_by_patient_id(input_data.patient_id)
        if existing_twin:
            raise ValueError(f"Digital twin already exists for patient {input_data.patient_id}")
        
        # Create time series model (example model)
        time_series_model = TimeSeriesModel.create(
            name="SymptomTrajectoryModel",
            version="1.0.0",
            accuracy=0.85,
            parameters=input_data.model_parameters or {},
            forecast_horizon_days=30,
            data_frequency="daily",
            symptom_categories=["mood", "anxiety", "sleep"]
        )
        
        # Create digital twin
        digital_twin = DigitalTwin.create(
            patient_id=input_data.patient_id,
            models=[time_series_model],
            confidence_score=input_data.confidence_score
        )
        
        # Save to repository
        created_twin = await self.digital_twin_repository.create(digital_twin)
        
        # Map to DTO
        return DigitalTwinDTO(
            id=str(created_twin.id),
            patient_id=str(created_twin.patient_id),
            created_at=created_twin.created_at.isoformat(),
            updated_at=created_twin.updated_at.isoformat(),
            version=created_twin.version,
            confidence_score=created_twin.confidence_score,
            last_calibration=created_twin.last_calibration.isoformat(),
            models=[
                DigitalTwinModelDTO(
                    id=str(model.id),
                    name=model.name,
                    version=model.version,
                    accuracy=model.accuracy,
                    created_at=model.created_at.isoformat(),
                    last_trained=model.last_trained.isoformat() if model.last_trained else None,
                    type=model.__class__.__name__
                )
                for model in created_twin.models
            ],
            clinical_insights=[]
        )
""",

    "use_cases/digital_twin/generate_predictions.py": """# app/application/use_cases/digital_twin/generate_predictions.py
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID

from app.application.dto.digital_twin_dto import PredictionDTO
from app.application.use_cases.base_use_case import BaseUseCase
from app.domain.repositories.digital_twin_repository import DigitalTwinRepository


@dataclass
class GeneratePredictionsInput:
    """Input DTO for generating predictions"""
    patient_id: UUID
    prediction_horizon_days: int = 30
    symptom_categories: Optional[List[str]] = None


class GeneratePredictionsUseCase(BaseUseCase[GeneratePredictionsInput, PredictionDTO]):
    """
    Use case for generating predictions from a patient's digital twin.
    Implements the Strategy pattern for different prediction approaches.
    """
    def __init__(self, digital_twin_repository: DigitalTwinRepository):
        self.digital_twin_repository = digital_twin_repository
    
    async def execute(self, input_data: GeneratePredictionsInput) -> PredictionDTO:
        """
        Generate predictions using the digital twin model
        
        Args:
            input_data: Prediction parameters
            
        Returns:
            Prediction results DTO
            
        Raises:
            ValueError: If digital twin doesn't exist
        """
        # Retrieve digital twin
        digital_twin = await self.digital_twin_repository.get_by_patient_id(input_data.patient_id)
        if not digital_twin:
            raise ValueError(f"Digital twin not found for patient {input_data.patient_id}")
        
        # Get symptom categories to predict (use default from model if not specified)
        time_series_model = next(
            (m for m in digital_twin.models if m.__class__.__name__ == "TimeSeriesModel"),
            None
        )
        if not time_series_model:
            raise ValueError("Time series model not found in digital twin")
        
        categories = input_data.symptom_categories or time_series_model.symptom_categories
        
        # Generate predictions
        # In a real implementation, this would use actual model prediction
        # Here we just create placeholder data
        now = datetime.now()
        prediction_end = now + timedelta(days=input_data.prediction_horizon_days)
        
        # Mock symptom trajectories
        trajectories = {
            category: {
                "values": [0.5 + (i * 0.01) for i in range(input_data.prediction_horizon_days)],
                "confidence": 0.85
            }
            for category in categories
        }
        
        return PredictionDTO(
            patient_id=str(input_data.patient_id),
            digital_twin_id=str(digital_twin.id),
            generated_at=now.isoformat(),
            prediction_start=now.isoformat(),
            prediction_end=prediction_end.isoformat(),
            confidence_score=digital_twin.confidence_score,
            symptom_trajectories=trajectories
        )
""",

    # DTOs
    "dto/digital_twin_dto.py": """# app/application/dto/digital_twin_dto.py
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class DigitalTwinModelDTO:
    """DTO for digital twin model data"""
    id: str
    name: str
    version: str
    accuracy: float
    created_at: str
    type: str
    last_trained: Optional[str] = None


@dataclass
class ClinicalInsightDTO:
    """DTO for clinical insight data"""
    id: str
    created_at: str
    category: str
    content: str
    confidence_score: float
    generated_by: str
    supporting_evidence: List[str]


@dataclass
class DigitalTwinDTO:
    """DTO for digital twin data"""
    id: str
    patient_id: str
    created_at: str
    updated_at: str
    version: int
    confidence_score: float
    last_calibration: str
    models: List[DigitalTwinModelDTO]
    clinical_insights: List[ClinicalInsightDTO]


@dataclass
class PredictionDTO:
    """DTO for digital twin predictions"""
    patient_id: str
    digital_twin_id: str
    generated_at: str
    prediction_start: str
    prediction_end: str
    confidence_score: float
    symptom_trajectories: Dict[str, Dict[str, Any]]
""",

    "dto/patient_dto.py": """# app/application/dto/patient_dto.py
from dataclasses import dataclass
from typing import Optional


@dataclass
class AddressDTO:
    """DTO for address data"""
    street1: str
    city: str
    state: str
    postal_code: str
    street2: Optional[str] = None
    country: str = "USA"


@dataclass
class ContactInfoDTO:
    """DTO for contact information data"""
    email: str
    phone: str
    preferred_contact_method: Optional[str] = None


@dataclass
class PatientDTO:
    """DTO for patient data"""
    id: str
    first_name: str
    last_name: str
    date_of_birth: str
    contact_info: ContactInfoDTO
    address: Optional[AddressDTO] = None
    active: bool = True
    emergency_contact: Optional[ContactInfoDTO] = None
    
    @property
    def full_name(self) -> str:
        """Get patient's full name"""
        return f"{self.first_name} {self.last_name}"
""",

    # Interfaces
    "interfaces/ai/prediction_service.py": """# app/application/interfaces/ai/prediction_service.py
from abc import ABC, abstractmethod
from typing import Any, Dict, List


class PredictionService(ABC):
    """
    Interface for AI prediction services.
    Following Interface Segregation Principle from SOLID.
    """
    @abstractmethod
    async def predict_symptom_trajectory(
        self,
        patient_id: str,
        historical_data: List[Dict[str, Any]],
        horizon_days: int
    ) -> Dict[str, Any]:
        """
        Predict symptom trajectory for a patient
        
        Args:
            patient_id: Patient identifier
            historical_data: Historical symptom data
            horizon_days: Number of days to forecast
            
        Returns:
            Symptom trajectory predictions
        """
        pass
    
    @abstractmethod
    async def generate_clinical_insights(
        self,
        patient_id: str,
        data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate clinical insights from patient data
        
        Args:
            patient_id: Patient identifier
            data: Patient clinical data
            
        Returns:
            List of clinical insights
        """
        pass
    
    @abstractmethod
    async def evaluate_treatment_efficacy(
        self,
        patient_id: str,
        treatment_data: Dict[str, Any],
        symptom_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluate efficacy of treatments based on symptom changes
        
        Args:
            patient_id: Patient identifier
            treatment_data: Treatment history data
            symptom_data: Symptom tracking data
            
        Returns:
            Treatment efficacy analysis
        """
        pass
""",

    # Service interfaces
    "interfaces/notification/notification_service.py": """# app/application/interfaces/notification/notification_service.py
from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Optional


class NotificationType(Enum):
    """Types of notifications that can be sent"""
    APPOINTMENT_REMINDER = "appointment_reminder"
    CLINICAL_INSIGHT = "clinical_insight"
    TREATMENT_ALERT = "treatment_alert"
    SYMPTOM_ALERT = "symptom_alert"
    REPORT_AVAILABLE = "report_available"


class NotificationService(ABC):
    """
    Interface for notification services.
    Following Interface Segregation Principle from SOLID.
    """
    @abstractmethod
    async def send_email(
        self,
        recipient_email: str,
        subject: str,
        body: str,
        attachments: Optional[List[Dict[str, str]]] = None,
        cc: Optional[List[str]] = None
    ) -> bool:
        """
        Send email notification
        
        Args:
            recipient_email: Email address of recipient
            subject: Email subject
            body: Email body (HTML or text)
            attachments: Optional list of attachments
            cc: Optional list of CC recipients
            
        Returns:
            True if sent successfully, False otherwise
        """
        pass
    
    @abstractmethod
    async def send_sms(
        self,
        phone_number: str,
        message: str
    ) -> bool:
        """
        Send SMS notification
        
        Args:
            phone_number: Phone number of recipient
            message: SMS message content
            
        Returns:
            True if sent successfully, False otherwise
        """
        pass
    
    @abstractmethod
    async def send_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        deep_link: Optional[str] = None,
        data: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send in-app notification
        
        Args:
            user_id: User identifier
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            deep_link: Optional deep link URL
            data: Optional additional data
            
        Returns:
            True if sent successfully, False otherwise
        """
        pass
"""
}

def create_app_directories():
    """Create application layer directories"""
    for directory in APP_DIRS:
        dir_path = os.path.join(APP_ROOT, directory)
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create __init__.py in each directory
        init_file = os.path.join(dir_path, "__init__.py")
        with open(init_file, "w") as f:
            package_name = os.path.join("app", "application", directory).replace("/", ".")
            f.write(f"# {package_name}\n")
        logger.info(f"Created: {init_file}")

def create_app_files():
    """Create application layer files with content"""
    for rel_path, content in APP_FILES.items():
        file_path = os.path.join(APP_ROOT, rel_path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Created file: {file_path}")

def main():
    """Main function to create application layer structure"""
    logger.info("Creating application layer directories...")
    create_app_directories()
    
    logger.info("Creating application layer files...")
    create_app_files()
    
    logger.info("Application layer creation completed successfully!")

if __name__ == "__main__":
    main()
