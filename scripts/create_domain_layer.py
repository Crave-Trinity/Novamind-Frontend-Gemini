#!/usr/bin/env python3
# create_domain_layer.py - Creates the domain layer structure for NOVAMIND
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
DOMAIN_ROOT = os.path.join(PROJECT_ROOT, "app", "domain")

# Domain layer directories
DOMAIN_DIRS = [
    "entities",
    "entities/digital_twin",
    "value_objects",
    "exceptions",
    "repositories",
    "services",
    "events"
]

# Domain layer files with content
DOMAIN_FILES = {
    # Core entity files
    "entities/patient.py": """# app/domain/entities/patient.py
from datetime import date
from typing import List, Optional
from uuid import UUID, uuid4

from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo


class Patient:
    \"\"\"
    Patient entity representing a person receiving psychiatric care.
    Core domain entity with no external dependencies.
    \"\"\"
    def __init__(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: date,
        contact_info: ContactInfo,
        id: Optional[UUID] = None,
        address: Optional[Address] = None,
        active: bool = True,
        emergency_contact: Optional[ContactInfo] = None
    ):
        self.id = id or uuid4()
        self.first_name = first_name
        self.last_name = last_name
        self.date_of_birth = date_of_birth
        self.contact_info = contact_info
        self.address = address
        self.active = active
        self.emergency_contact = emergency_contact
    
    @property
    def full_name(self) -> str:
        \"\"\"Get patient's full name\"\"\"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        \"\"\"Calculate patient's age\"\"\"
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    def deactivate(self) -> None:
        \"\"\"Deactivate a patient\"\"\"
        self.active = False
    
    def reactivate(self) -> None:
        \"\"\"Reactivate a patient\"\"\"
        self.active = True
""",

    "entities/user.py": """# app/domain/entities/user.py
from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4


class UserRole(Enum):
    \"\"\"User roles for role-based access control\"\"\"
    ADMIN = "admin"
    PROVIDER = "provider"
    ASSISTANT = "assistant"
    PATIENT = "patient"


class User:
    \"\"\"
    User entity representing a system user with role-based permissions.
    Core domain entity with no external dependencies.
    \"\"\"
    def __init__(
        self,
        username: str,
        email: str,
        roles: List[UserRole],
        id: Optional[UUID] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        last_login: Optional[datetime] = None
    ):
        self.id = id or uuid4()
        self.username = username
        self.email = email
        self.roles = roles
        self.first_name = first_name
        self.last_name = last_name
        self.is_active = is_active
        self.created_at = created_at or datetime.now()
        self.last_login = last_login
    
    @property
    def full_name(self) -> str:
        \"\"\"Get user's full name if available, otherwise username\"\"\"
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def has_role(self, role: UserRole) -> bool:
        \"\"\"Check if user has a specific role\"\"\"
        return role in self.roles
    
    def add_role(self, role: UserRole) -> None:
        \"\"\"Add a role to user if not already present\"\"\"
        if role not in self.roles:
            self.roles.append(role)
    
    def remove_role(self, role: UserRole) -> None:
        \"\"\"Remove a role from user\"\"\"
        if role in self.roles:
            self.roles.remove(role)
    
    def deactivate(self) -> None:
        \"\"\"Deactivate user account\"\"\"
        self.is_active = False
    
    def activate(self) -> None:
        \"\"\"Activate user account\"\"\"
        self.is_active = True
    
    def update_last_login(self) -> None:
        \"\"\"Update last login timestamp\"\"\"
        self.last_login = datetime.now()
""",

    # Digital Twin entities
    "entities/digital_twin/digital_twin.py": """# app/domain/entities/digital_twin/digital_twin.py
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from app.domain.entities.digital_twin.clinical_insight import ClinicalInsight
from app.domain.entities.digital_twin.twin_model import DigitalTwinModel


@dataclass(frozen=True)
class DigitalTwin:
    \"\"\"
    Core entity representing a patient's digital twin model.
    Immutable by design to ensure state transitions are tracked.
    \"\"\"
    id: UUID
    patient_id: UUID
    created_at: datetime
    updated_at: datetime
    version: int
    confidence_score: float
    models: List[DigitalTwinModel]
    clinical_insights: List[ClinicalInsight]
    last_calibration: datetime
    
    @classmethod
    def create(
        cls,
        patient_id: UUID,
        models: List[DigitalTwinModel],
        confidence_score: float = 0.0,
    ) -> 'DigitalTwin':
        \"\"\"Factory method to create a new DigitalTwin\"\"\"
        now = datetime.now()
        return cls(
            id=uuid4(),
            patient_id=patient_id,
            created_at=now,
            updated_at=now,
            version=1,
            confidence_score=confidence_score,
            models=models,
            clinical_insights=[],
            last_calibration=now
        )
    
    def add_clinical_insight(self, insight: ClinicalInsight) -> 'DigitalTwin':
        \"\"\"
        Adds a clinical insight to the digital twin, returning a new instance.
        
        Args:
            insight: The clinical insight to add
            
        Returns:
            A new DigitalTwin instance with the updated insights
        \"\"\"
        return DigitalTwin(
            id=self.id,
            patient_id=self.patient_id,
            created_at=self.created_at,
            updated_at=datetime.now(),
            version=self.version + 1,
            confidence_score=self.confidence_score,
            models=self.models.copy(),
            clinical_insights=[*self.clinical_insights, insight],
            last_calibration=self.last_calibration
        )
    
    def recalibrate(
        self, 
        models: List[DigitalTwinModel], 
        confidence_score: float
    ) -> 'DigitalTwin':
        \"\"\"
        Recalibrates the digital twin with updated models.
        
        Args:
            models: Updated model list
            confidence_score: New overall confidence score
            
        Returns:
            A new DigitalTwin instance with updated models
        \"\"\"
        return DigitalTwin(
            id=self.id,
            patient_id=self.patient_id,
            created_at=self.created_at,
            updated_at=datetime.now(),
            version=self.version + 1,
            confidence_score=confidence_score,
            models=models,
            clinical_insights=self.clinical_insights.copy(),
            last_calibration=datetime.now()
        )
""",

    "entities/digital_twin/twin_model.py": """# app/domain/entities/digital_twin/twin_model.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID, uuid4


@dataclass(frozen=True)
class ModelParameters:
    \"\"\"Value object for model parameters\"\"\"
    parameters: Dict[str, Any]


@dataclass(frozen=True)
class DigitalTwinModel(ABC):
    \"\"\"Base abstract class for all digital twin models\"\"\"
    id: UUID
    name: str
    version: str
    created_at: datetime
    last_trained: Optional[datetime]
    accuracy: float
    parameters: ModelParameters
    
    @abstractmethod
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        \"\"\"
        Make prediction using the model
        
        Args:
            input_data: Input data for the prediction
            
        Returns:
            Prediction results
        \"\"\"
        pass
    
    @classmethod
    def create_model_id(cls) -> UUID:
        \"\"\"Generate a new model ID\"\"\"
        return uuid4()
""",

    "entities/digital_twin/time_series_model.py": """# app/domain/entities/digital_twin/time_series_model.py
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.domain.entities.digital_twin.twin_model import DigitalTwinModel, ModelParameters


@dataclass(frozen=True)
class TimeSeriesModel(DigitalTwinModel):
    \"\"\"
    Model for forecasting symptom trajectories over time.
    Implements the Digital Twin Model interface.
    \"\"\"
    forecast_horizon_days: int
    data_frequency: str  # e.g., 'daily', 'weekly'
    symptom_categories: List[str]
    
    @classmethod
    def create(
        cls,
        name: str,
        version: str,
        accuracy: float,
        parameters: Dict[str, Any],
        forecast_horizon_days: int,
        data_frequency: str,
        symptom_categories: List[str],
        last_trained: Optional[datetime] = None
    ) -> 'TimeSeriesModel':
        \"\"\"Factory method to create a new TimeSeriesModel\"\"\"
        return cls(
            id=cls.create_model_id(),
            name=name,
            version=version,
            created_at=datetime.now(),
            last_trained=last_trained,
            accuracy=accuracy,
            parameters=ModelParameters(parameters=parameters),
            forecast_horizon_days=forecast_horizon_days,
            data_frequency=data_frequency,
            symptom_categories=symptom_categories
        )
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        \"\"\"
        Forecast symptom trajectories based on historical data
        
        Args:
            input_data: Dictionary containing historical symptom data
            
        Returns:
            Dictionary with forecasted symptom trajectories
        \"\"\"
        # In a real implementation, this would call the actual prediction logic
        # Here we just return a placeholder
        return {
            "forecast_start_date": datetime.now().isoformat(),
            "forecast_end_date": datetime.now().isoformat(),
            "symptom_forecasts": {}
        }
""",

    # Value objects
    "value_objects/address.py": """# app/domain/value_objects/address.py
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Address:
    \"\"\"
    Immutable value object representing a physical address.
    Frozen to ensure immutability.
    \"\"\"
    street1: str
    city: str
    state: str
    postal_code: str
    street2: Optional[str] = None
    country: str = "USA"
    
    def __post_init__(self):
        \"\"\"Validate address fields after initialization\"\"\"
        if not self.street1:
            raise ValueError("Street1 cannot be empty")
        
        if not self.city:
            raise ValueError("City cannot be empty")
        
        if not self.state or len(self.state) != 2:
            raise ValueError("State must be a valid 2-letter code")
        
        if not self.postal_code or not self._is_valid_postal_code(self.postal_code):
            raise ValueError("Invalid postal code format")
    
    def _is_valid_postal_code(self, postal_code: str) -> bool:
        \"\"\"
        Validate US postal code format (basic check)
        
        Args:
            postal_code: The postal code to validate
            
        Returns:
            True if valid, False otherwise
        \"\"\"
        # Basic US zip code validation (5 digits or 5+4)
        if self.country == "USA":
            return (len(postal_code) == 5 and postal_code.isdigit()) or \
                   (len(postal_code) == 10 and postal_code[5] == '-' and 
                    postal_code[:5].isdigit() and postal_code[6:].isdigit())
        return True  # Skip validation for non-US countries
    
    @property
    def formatted(self) -> str:
        \"\"\"Return formatted address string\"\"\"
        street = f"{self.street1}, {self.street2}" if self.street2 else self.street1
        return f"{street}, {self.city}, {self.state} {self.postal_code}, {self.country}"
""",

    "value_objects/contact_info.py": """# app/domain/value_objects/contact_info.py
import re
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class ContactInfo:
    \"\"\"
    Immutable value object representing contact information.
    Frozen to ensure immutability.
    \"\"\"
    email: str
    phone: str
    preferred_contact_method: Optional[str] = None
    
    def __post_init__(self):
        \"\"\"Validate contact information after initialization\"\"\"
        if not self._is_valid_email(self.email):
            raise ValueError("Invalid email format")
        
        if not self._is_valid_phone(self.phone):
            raise ValueError("Invalid phone format")
        
        if self.preferred_contact_method and self.preferred_contact_method not in ["email", "phone"]:
            raise ValueError("Preferred contact method must be either 'email' or 'phone'")
    
    def _is_valid_email(self, email: str) -> bool:
        \"\"\"
        Validate email format
        
        Args:
            email: The email to validate
            
        Returns:
            True if valid, False otherwise
        \"\"\"
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        return bool(email_pattern.match(email))
    
    def _is_valid_phone(self, phone: str) -> bool:
        \"\"\"
        Validate phone format (basic check)
        
        Args:
            phone: The phone number to validate
            
        Returns:
            True if valid, False otherwise
        \"\"\"
        # Remove common separators for validation
        clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Basic check for US phone format (10 digits)
        return len(clean_phone) == 10 and clean_phone.isdigit()
    
    @property
    def formatted_phone(self) -> str:
        \"\"\"Return formatted phone number\"\"\"
        clean_phone = re.sub(r'[\s\-\(\)]', '', self.phone)
        if len(clean_phone) == 10:
            return f"({clean_phone[:3]}) {clean_phone[3:6]}-{clean_phone[6:]}"
        return self.phone
""",

    # Repository interfaces
    "repositories/patient_repository.py": """# app/domain/repositories/patient_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.patient import Patient


class PatientRepository(ABC):
    \"\"\"
    Abstract repository interface for Patient entity.
    Following the Repository pattern from DDD.
    \"\"\"
    @abstractmethod
    async def create(self, patient: Patient) -> Patient:
        \"\"\"
        Create a new patient
        
        Args:
            patient: Patient entity to create
            
        Returns:
            Created patient with ID
        \"\"\"
        pass
    
    @abstractmethod
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        \"\"\"
        Get patient by ID
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            Patient if found, None otherwise
        \"\"\"
        pass
    
    @abstractmethod
    async def update(self, patient: Patient) -> Patient:
        \"\"\"
        Update an existing patient
        
        Args:
            patient: Patient entity with updated values
            
        Returns:
            Updated patient
        \"\"\"
        pass
    
    @abstractmethod
    async def delete(self, patient_id: UUID) -> bool:
        \"\"\"
        Delete a patient by ID
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            True if deleted, False otherwise
        \"\"\"
        pass
    
    @abstractmethod
    async def list_all(self, limit: int = 100, offset: int = 0) -> List[Patient]:
        \"\"\"
        List all patients with pagination
        
        Args:
            limit: Maximum number of patients to return
            offset: Number of patients to skip
            
        Returns:
            List of patients
        \"\"\"
        pass
    
    @abstractmethod
    async def search_by_name(self, name: str) -> List[Patient]:
        \"\"\"
        Search patients by name
        
        Args:
            name: Name to search for
            
        Returns:
            List of matching patients
        \"\"\"
        pass
""",

    "repositories/digital_twin_repository.py": """# app/domain/repositories/digital_twin_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.digital_twin.digital_twin import DigitalTwin


class DigitalTwinRepository(ABC):
    \"\"\"
    Abstract repository interface for DigitalTwin entity.
    Following the Repository pattern from DDD.
    \"\"\"
    @abstractmethod
    async def create(self, digital_twin: DigitalTwin) -> DigitalTwin:
        \"\"\"
        Create a new digital twin
        
        Args:
            digital_twin: DigitalTwin entity to create
            
        Returns:
            Created digital twin with ID
        \"\"\"
        pass
    
    @abstractmethod
    async def get_by_id(self, digital_twin_id: UUID) -> Optional[DigitalTwin]:
        \"\"\"
        Get digital twin by ID
        
        Args:
            digital_twin_id: DigitalTwin UUID
            
        Returns:
            DigitalTwin if found, None otherwise
        \"\"\"
        pass
    
    @abstractmethod
    async def get_by_patient_id(self, patient_id: UUID) -> Optional[DigitalTwin]:
        \"\"\"
        Get digital twin by patient ID
        
        Args:
            patient_id: Patient UUID
            
        Returns:
            DigitalTwin if found, None otherwise
        \"\"\"
        pass
    
    @abstractmethod
    async def update(self, digital_twin: DigitalTwin) -> DigitalTwin:
        \"\"\"
        Update an existing digital twin
        
        Args:
            digital_twin: DigitalTwin entity with updated values
            
        Returns:
            Updated digital twin
        \"\"\"
        pass
    
    @abstractmethod
    async def list_versions(self, digital_twin_id: UUID) -> List[DigitalTwin]:
        \"\"\"
        List all versions of a digital twin
        
        Args:
            digital_twin_id: DigitalTwin UUID
            
        Returns:
            List of digital twin versions
        \"\"\"
        pass
"""
}

def create_domain_directories():
    """Create domain layer directories"""
    for directory in DOMAIN_DIRS:
        dir_path = os.path.join(DOMAIN_ROOT, directory)
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create __init__.py in each directory
        init_file = os.path.join(dir_path, "__init__.py")
        with open(init_file, "w") as f:
            package_name = os.path.join("app", "domain", directory).replace("/", ".")
            f.write(f"# {package_name}\n")
        logger.info(f"Created: {init_file}")

def create_domain_files():
    """Create domain layer files with content"""
    for rel_path, content in DOMAIN_FILES.items():
        file_path = os.path.join(DOMAIN_ROOT, rel_path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Created file: {file_path}")

def main():
    """Main function to create domain layer structure"""
    logger.info("Creating domain layer directories...")
    create_domain_directories()
    
    logger.info("Creating domain layer files...")
    create_domain_files()
    
    logger.info("Domain layer creation completed successfully!")

if __name__ == "__main__":
    main()
