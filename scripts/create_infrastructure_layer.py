#!/usr/bin/env python3
# create_infrastructure_layer.py - Creates the infrastructure layer structure for NOVAMIND
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
INFRA_ROOT = os.path.join(PROJECT_ROOT, "app", "infrastructure")

# Infrastructure layer directories
INFRA_DIRS = [
    "config",
    "persistence",
    "persistence/repositories",
    "persistence/models",
    "security",
    "logging",
    "aws",
    "external_services",
    "ai",
    "ai/models",
    "ai/pipelines"
]

# Infrastructure layer files with content
INFRA_FILES = {
    # Database configuration
    "config/settings.py": """# app/infrastructure/config/settings.py
import os
from functools import lru_cache
from typing import Optional

from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    """Application settings using Pydantic BaseSettings for environment variable loading"""
    PROJECT_NAME: str = "NOVAMIND"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # DATABASE
    DATABASE_URL: PostgresDsn
    
    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    # S3
    S3_BUCKET_NAME: Optional[str] = None
    
    # COGNITO
    COGNITO_USER_POOL_ID: Optional[str] = None
    COGNITO_APP_CLIENT_ID: Optional[str] = None
    
    # CORS
    BACKEND_CORS_ORIGINS: list[AnyHttpUrl] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        """Parse CORS origins from string or list"""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        case_sensitive = True
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
""",

    # Database setup
    "persistence/database.py": """# app/infrastructure/persistence/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.infrastructure.config.settings import get_settings

settings = get_settings()

# Create async engine for PostgreSQL
engine = create_async_engine(
    str(settings.DATABASE_URL),
    echo=False,
    future=True
)

# Create session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Create base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency for getting DB session
    
    Yields:
        AsyncSession: SQLAlchemy async session
    """
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()
""",

    # ORM models
    "persistence/models/patient_model.py": """# app/infrastructure/persistence/models/patient_model.py
import uuid
from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Column, Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.persistence.database import Base


class PatientModel(Base):
    """SQLAlchemy ORM model for patients"""
    __tablename__ = "patients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    active = Column(Boolean, default=True)
    
    # Contact information
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    preferred_contact_method = Column(String, nullable=True)
    
    # Address fields
    street1 = Column(String, nullable=True)
    street2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, default="USA")
    
    # Relationships
    digital_twin = relationship("DigitalTwinModel", back_populates="patient", uselist=False)
    appointments = relationship("AppointmentModel", back_populates="patient")
""",

    "persistence/models/digital_twin_model.py": """# app/infrastructure/persistence/models/digital_twin_model.py
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.infrastructure.persistence.database import Base


class DigitalTwinModel(Base):
    """SQLAlchemy ORM model for digital twins"""
    __tablename__ = "digital_twins"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    confidence_score = Column(Float, default=0.0, nullable=False)
    last_calibration = Column(DateTime, default=datetime.now, nullable=False)
    
    # Relationships
    patient = relationship("PatientModel", back_populates="digital_twin")
    models = relationship("TwinModelModel", back_populates="digital_twin", cascade="all, delete-orphan")
    insights = relationship("ClinicalInsightModel", back_populates="digital_twin", cascade="all, delete-orphan")


class TwinModelModel(Base):
    """SQLAlchemy ORM model for digital twin models"""
    __tablename__ = "twin_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    digital_twin_id = Column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), nullable=False)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Discriminator for model type
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    last_trained = Column(DateTime, nullable=True)
    accuracy = Column(Float, default=0.0, nullable=False)
    parameters = Column(JSONB, nullable=False, default={})
    
    # For TimeSeriesModel type
    forecast_horizon_days = Column(Integer, nullable=True)
    data_frequency = Column(String, nullable=True)
    symptom_categories = Column(JSONB, nullable=True)
    
    # Relationships
    digital_twin = relationship("DigitalTwinModel", back_populates="models")


class ClinicalInsightModel(Base):
    """SQLAlchemy ORM model for clinical insights"""
    __tablename__ = "clinical_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    digital_twin_id = Column(UUID(as_uuid=True), ForeignKey("digital_twins.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    category = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0, nullable=False)
    generated_by = Column(String, nullable=False)
    supporting_evidence = Column(JSONB, nullable=False, default=[])
    
    # Relationships
    digital_twin = relationship("DigitalTwinModel", back_populates="insights")
""",

    # Repository implementations
    "persistence/repositories/sqlalchemy_patient_repository.py": """# app/infrastructure/persistence/repositories/sqlalchemy_patient_repository.py
from datetime import date
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.expression import or_

from app.domain.entities.patient import Patient
from app.domain.repositories.patient_repository import PatientRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo
from app.infrastructure.logging.logger import get_logger
from app.infrastructure.persistence.models.patient_model import PatientModel

logger = get_logger(__name__)


class SQLAlchemyPatientRepository(PatientRepository):
    """
    SQLAlchemy implementation of the PatientRepository interface.
    """
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, patient: Patient) -> Patient:
        """Create a new patient record"""
        try:
            # Map domain entity to ORM model
            patient_model = PatientModel(
                id=patient.id,
                first_name=patient.first_name,
                last_name=patient.last_name,
                date_of_birth=patient.date_of_birth,
                active=patient.active,
                email=patient.contact_info.email,
                phone=patient.contact_info.phone,
                preferred_contact_method=patient.contact_info.preferred_contact_method
            )
            
            # Add address fields if present
            if patient.address:
                patient_model.street1 = patient.address.street1
                patient_model.street2 = patient.address.street2
                patient_model.city = patient.address.city
                patient_model.state = patient.address.state
                patient_model.postal_code = patient.address.postal_code
                patient_model.country = patient.address.country
            
            # Add to session
            self.session.add(patient_model)
            await self.session.commit()
            await self.session.refresh(patient_model)
            
            # Return domain entity
            return patient
            
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error(f"Error creating patient: {e}")
            raise
    
    async def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        """Get patient by ID"""
        try:
            result = await self.session.execute(
                select(PatientModel).where(PatientModel.id == patient_id)
            )
            patient_model = result.scalars().first()
            
            if not patient_model:
                return None
            
            # Map ORM model to domain entity
            contact_info = ContactInfo(
                email=patient_model.email,
                phone=patient_model.phone,
                preferred_contact_method=patient_model.preferred_contact_method
            )
            
            # Map address if present
            address = None
            if patient_model.street1:
                address = Address(
                    street1=patient_model.street1,
                    street2=patient_model.street2,
                    city=patient_model.city,
                    state=patient_model.state,
                    postal_code=patient_model.postal_code,
                    country=patient_model.country
                )
            
            return Patient(
                id=patient_model.id,
                first_name=patient_model.first_name,
                last_name=patient_model.last_name,
                date_of_birth=patient_model.date_of_birth,
                contact_info=contact_info,
                address=address,
                active=patient_model.active
            )
            
        except SQLAlchemyError as e:
            logger.error(f"Error retrieving patient: {e}")
            raise
    
    async def update(self, patient: Patient) -> Patient:
        """Update an existing patient"""
        # Implementation similar to create but with existing record
        pass
    
    async def delete(self, patient_id: UUID) -> bool:
        """Delete a patient by ID"""
        # Implementation of soft delete
        pass
    
    async def list_all(self, limit: int = 100, offset: int = 0) -> List[Patient]:
        """List all patients with pagination"""
        # Implementation with pagination
        pass
    
    async def search_by_name(self, name: str) -> List[Patient]:
        """Search patients by name"""
        try:
            result = await self.session.execute(
                select(PatientModel).where(
                    or_(
                        PatientModel.first_name.ilike(f"%{name}%"),
                        PatientModel.last_name.ilike(f"%{name}%")
                    )
                )
            )
            
            patient_models = result.scalars().all()
            patients = []
            
            for patient_model in patient_models:
                # Map ORM model to domain entity (similar to get_by_id)
                contact_info = ContactInfo(
                    email=patient_model.email,
                    phone=patient_model.phone,
                    preferred_contact_method=patient_model.preferred_contact_method
                )
                
                # Map address if present
                address = None
                if patient_model.street1:
                    address = Address(
                        street1=patient_model.street1,
                        street2=patient_model.street2,
                        city=patient_model.city,
                        state=patient_model.state,
                        postal_code=patient_model.postal_code,
                        country=patient_model.country
                    )
                
                patients.append(Patient(
                    id=patient_model.id,
                    first_name=patient_model.first_name,
                    last_name=patient_model.last_name,
                    date_of_birth=patient_model.date_of_birth,
                    contact_info=contact_info,
                    address=address,
                    active=patient_model.active
                ))
            
            return patients
            
        except SQLAlchemyError as e:
            logger.error(f"Error searching patients: {e}")
            raise
""",

    # Security
    "security/authentication.py": """# app/infrastructure/security/authentication.py
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.domain.entities.user import User, UserRole
from app.infrastructure.config.settings import get_settings

settings = get_settings()

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")


class TokenData(BaseModel):
    """Decoded token data model"""
    sub: str
    roles: list[str]
    exp: datetime


def create_access_token(subject: str, roles: list[str], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        subject: Subject identifier (user ID)
        roles: List of user roles
        expires_delta: Optional token expiration time
        
    Returns:
        Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": subject,
        "roles": roles,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Get current user from JWT token
    
    Args:
        token: JWT token from authorization header
        
    Returns:
        User entity
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract user ID and roles
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        role_strings = payload.get("roles", [])
        if not role_strings:
            raise credentials_exception
        
        # Convert role strings to UserRole enum
        roles = [UserRole(role) for role in role_strings if role in [r.value for r in UserRole]]
        
        # Create user entity
        # Note: In a real implementation, you would fetch the user from the repository
        # This is a simplified version
        user = User(
            id=user_id,
            username="user",  # Placeholder
            email="user@example.com",  # Placeholder
            roles=roles,
            is_active=True
        )
        
        return user
        
    except JWTError:
        raise credentials_exception
""",

    # Logging
    "logging/logger.py": """# app/infrastructure/logging/logger.py
import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional, Union

from app.infrastructure.config.settings import get_settings

settings = get_settings()

# HIPAA-compliant JSON formatter
class HIPAAJSONFormatter(logging.Formatter):
    """
    JSON formatter for logging that ensures HIPAA compliance by:
    1. Masking sensitive PHI fields
    2. Including audit information for compliance
    3. Standardizing log format for easy searching
    """
    def __init__(self):
        super().__init__()
        self.default_fields = {
            "service": settings.PROJECT_NAME,
            "environment": "production"  # Should be configurable
        }
        
        # Fields that might contain PHI and should be masked
        self.phi_fields = [
            "patient_id",
            "name",
            "email",
            "phone",
            "address",
            "ssn",
            "mrn",
            "dob"
        ]
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as HIPAA-compliant JSON"""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "line": record.lineno
        }
        
        # Add default fields
        log_data.update(self.default_fields)
        
        # Add extra fields from record
        if hasattr(record, "extra") and record.extra:
            for key, value in record.extra.items():
                log_data[key] = self._mask_phi(key, value)
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info)
            }
        
        return json.dumps(log_data)
    
    def _mask_phi(self, key: str, value: Any) -> Any:
        """Mask PHI fields to ensure HIPAA compliance"""
        if isinstance(key, str) and any(phi in key.lower() for phi in self.phi_fields):
            if isinstance(value, str):
                if len(value) > 4:
                    # Mask all but last 4 characters
                    return "*" * (len(value) - 4) + value[-4:]
                return "*" * len(value)
            return "[REDACTED]"
        return value


def setup_logging():
    """Configure application logging"""
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    for handler in root_logger.handlers:
        root_logger.removeHandler(handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(HIPAAJSONFormatter())
    root_logger.addHandler(console_handler)
    
    # File handler
    file_handler = logging.FileHandler("app.log")
    file_handler.setFormatter(HIPAAJSONFormatter())
    root_logger.addHandler(file_handler)
    
    # Disable propagation for some third-party loggers
    for logger_name in ["sqlalchemy.engine.base"]:
        logging.getLogger(logger_name).propagate = False


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger with the given name
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


# Initialize logging when module is imported
setup_logging()
"""
}

def create_infra_directories():
    """Create infrastructure layer directories"""
    for directory in INFRA_DIRS:
        dir_path = os.path.join(INFRA_ROOT, directory)
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create __init__.py in each directory
        init_file = os.path.join(dir_path, "__init__.py")
        with open(init_file, "w") as f:
            package_name = os.path.join("app", "infrastructure", directory).replace("/", ".")
            f.write(f"# {package_name}\n")
        logger.info(f"Created: {init_file}")

def create_infra_files():
    """Create infrastructure layer files with content"""
    for rel_path, content in INFRA_FILES.items():
        file_path = os.path.join(INFRA_ROOT, rel_path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Created file: {file_path}")

def main():
    """Main function to create infrastructure layer structure"""
    logger.info("Creating infrastructure layer directories...")
    create_infra_directories()
    
    logger.info("Creating infrastructure layer files...")
    create_infra_files()
    
    logger.info("Infrastructure layer creation completed successfully!")

if __name__ == "__main__":
    main()
