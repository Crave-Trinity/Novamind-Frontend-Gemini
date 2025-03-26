#!/usr/bin/env python3
# create_presentation_layer.py - Creates the presentation layer structure for NOVAMIND
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
PRESENTATION_ROOT = os.path.join(PROJECT_ROOT, "app", "presentation")

# Presentation layer directories
PRESENTATION_DIRS = [
    "api",
    "api/v1",
    "api/v1/endpoints",
    "api/v1/middleware",
    "api/v1/deps",
    "api/v1/schemas",
    "web",
    "web/controllers",
    "web/templates",
    "web/static"
]

# Presentation layer files with content
PRESENTATION_FILES = {
    # FastAPI app configuration
    "api/main.py": """# app/presentation/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.infrastructure.config.settings import get_settings
from app.presentation.api.v1.api import api_router

settings = get_settings()


def create_application() -> FastAPI:
    """
    Factory function to create and configure the FastAPI application
    
    Returns:
        Configured FastAPI application
    """
    # Create FastAPI app
    app = FastAPI(
        title=f"{settings.PROJECT_NAME} API",
        description="HIPAA-compliant psychiatric digital twin platform API",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json"
    )
    
    # Set up CORS
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    # Health check endpoint
    @app.get("/health", tags=["Health Check"])
    async def health_check():
        return {"status": "healthy"}
    
    # Exception handlers
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred"}
        )
    
    return app


app = create_application()
""",

    # API router
    "api/v1/api.py": """# app/presentation/api/v1/api.py
from fastapi import APIRouter

from app.presentation.api.v1.endpoints import auth, digital_twins, patients

# Create main router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(digital_twins.router, prefix="/digital-twins", tags=["Digital Twins"])
""",

    # Authentication endpoint
    "api/v1/endpoints/auth.py": """# app/presentation/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.domain.entities.user import User
from app.infrastructure.security.authentication import create_access_token
from app.presentation.api.v1.schemas.auth import Token, UserResponse
from app.presentation.api.v1.deps import get_user_repository

router = APIRouter()


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_repository = Depends(get_user_repository)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Authenticate user
    user = await user_repository.authenticate(
        username=form_data.username,
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        subject=str(user.id),
        roles=[role.value for role in user.roles]
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_user_repository)):
    """
    Get current user
    """
    return current_user
""",

    # Patients endpoint
    "api/v1/endpoints/patients.py": """# app/presentation/api/v1/endpoints/patients.py
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.use_cases.patient.create_patient import CreatePatientUseCase, CreatePatientInput
from app.application.use_cases.patient.get_patient import GetPatientUseCase, GetPatientInput
from app.application.use_cases.patient.list_patients import ListPatientsUseCase, ListPatientsInput
from app.domain.entities.user import User, UserRole
from app.infrastructure.security.authentication import get_current_user
from app.presentation.api.v1.deps import (
    get_create_patient_use_case,
    get_get_patient_use_case, 
    get_list_patients_use_case
)
from app.presentation.api.v1.schemas.patient import (
    PatientCreate,
    PatientResponse,
    PatientsResponse
)

router = APIRouter()


@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)]
)
async def create_patient(
    patient_data: PatientCreate,
    create_patient_use_case: CreatePatientUseCase = Depends(get_create_patient_use_case),
    current_user: User = Depends(get_current_user)
):
    """
    Create new patient.
    
    Requires authenticated user with DOCTOR or ADMIN role.
    """
    # Check user permissions
    if UserRole.DOCTOR not in current_user.roles and UserRole.ADMIN not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Create input DTO
    input_data = CreatePatientInput(
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        date_of_birth=patient_data.date_of_birth,
        email=patient_data.contact_info.email,
        phone=patient_data.contact_info.phone,
        preferred_contact_method=patient_data.contact_info.preferred_contact_method,
        address=patient_data.address.dict() if patient_data.address else None
    )
    
    # Execute use case
    try:
        result = await create_patient_use_case.execute(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
    dependencies=[Depends(get_current_user)]
)
async def get_patient(
    patient_id: UUID,
    get_patient_use_case: GetPatientUseCase = Depends(get_get_patient_use_case),
    current_user: User = Depends(get_current_user)
):
    """
    Get patient details by ID.
    
    Requires authenticated user with appropriate role.
    """
    # Check user permissions
    if UserRole.DOCTOR not in current_user.roles and UserRole.ADMIN not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Create input DTO
    input_data = GetPatientInput(patient_id=patient_id)
    
    # Execute use case
    try:
        result = await get_patient_use_case.execute(input_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient with ID {patient_id} not found"
            )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/",
    response_model=PatientsResponse,
    dependencies=[Depends(get_current_user)]
)
async def list_patients(
    search: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    list_patients_use_case: ListPatientsUseCase = Depends(get_list_patients_use_case),
    current_user: User = Depends(get_current_user)
):
    """
    List patients with optional search and pagination.
    
    Requires authenticated user with appropriate role.
    """
    # Check user permissions
    if UserRole.DOCTOR not in current_user.roles and UserRole.ADMIN not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Create input DTO
    input_data = ListPatientsInput(
        search=search,
        limit=limit,
        offset=offset
    )
    
    # Execute use case
    try:
        result = await list_patients_use_case.execute(input_data)
        return PatientsResponse(
            items=result.items,
            total=result.total,
            limit=result.limit,
            offset=result.offset
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
""",

    # Digital Twins endpoint
    "api/v1/endpoints/digital_twins.py": """# app/presentation/api/v1/endpoints/digital_twins.py
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.use_cases.digital_twin.create_digital_twin import CreateDigitalTwinUseCase, CreateDigitalTwinInput
from app.application.use_cases.digital_twin.generate_predictions import GeneratePredictionsUseCase, GeneratePredictionsInput
from app.domain.entities.user import User, UserRole
from app.infrastructure.security.authentication import get_current_user
from app.presentation.api.v1.deps import (
    get_create_digital_twin_use_case,
    get_generate_predictions_use_case
)
from app.presentation.api.v1.schemas.digital_twin import (
    DigitalTwinCreate,
    DigitalTwinResponse,
    PredictionResponse
)

router = APIRouter()


@router.post(
    "/",
    response_model=DigitalTwinResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_user)]
)
async def create_digital_twin(
    twin_data: DigitalTwinCreate,
    create_digital_twin_use_case: CreateDigitalTwinUseCase = Depends(get_create_digital_twin_use_case),
    current_user: User = Depends(get_current_user)
):
    """
    Create new digital twin for a patient.
    
    Requires authenticated user with DOCTOR role.
    """
    # Check user permissions
    if UserRole.DOCTOR not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create digital twins"
        )
    
    # Create input DTO
    input_data = CreateDigitalTwinInput(
        patient_id=twin_data.patient_id,
        model_parameters=twin_data.model_parameters,
        confidence_score=twin_data.confidence_score
    )
    
    # Execute use case
    try:
        result = await create_digital_twin_use_case.execute(input_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/{patient_id}/predictions",
    response_model=PredictionResponse,
    dependencies=[Depends(get_current_user)]
)
async def generate_predictions(
    patient_id: UUID,
    horizon_days: int = Query(30, ge=1, le=365),
    symptom_categories: Optional[str] = None,
    generate_predictions_use_case: GeneratePredictionsUseCase = Depends(get_generate_predictions_use_case),
    current_user: User = Depends(get_current_user)
):
    """
    Generate predictions from patient's digital twin.
    
    Requires authenticated user with DOCTOR role.
    """
    # Check user permissions
    if UserRole.DOCTOR not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access predictions"
        )
    
    # Parse symptom categories if provided
    categories = None
    if symptom_categories:
        categories = [cat.strip() for cat in symptom_categories.split(",")]
    
    # Create input DTO
    input_data = GeneratePredictionsInput(
        patient_id=patient_id,
        prediction_horizon_days=horizon_days,
        symptom_categories=categories
    )
    
    # Execute use case
    try:
        result = await generate_predictions_use_case.execute(input_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
""",

    # Dependency injection
    "api/v1/deps.py": """# app/presentation/api/v1/deps.py
from typing import Generator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.digital_twin.create_digital_twin import CreateDigitalTwinUseCase
from app.application.use_cases.digital_twin.generate_predictions import GeneratePredictionsUseCase
from app.application.use_cases.patient.create_patient import CreatePatientUseCase
from app.application.use_cases.patient.get_patient import GetPatientUseCase
from app.application.use_cases.patient.list_patients import ListPatientsUseCase
from app.domain.repositories.digital_twin_repository import DigitalTwinRepository
from app.domain.repositories.patient_repository import PatientRepository
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.persistence.database import get_db
from app.infrastructure.persistence.repositories.sqlalchemy_digital_twin_repository import SQLAlchemyDigitalTwinRepository
from app.infrastructure.persistence.repositories.sqlalchemy_patient_repository import SQLAlchemyPatientRepository
from app.infrastructure.persistence.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository


# Repository dependencies
def get_patient_repository(session: AsyncSession = Depends(get_db)) -> PatientRepository:
    """Get patient repository instance"""
    return SQLAlchemyPatientRepository(session)


def get_digital_twin_repository(session: AsyncSession = Depends(get_db)) -> DigitalTwinRepository:
    """Get digital twin repository instance"""
    return SQLAlchemyDigitalTwinRepository(session)


def get_user_repository(session: AsyncSession = Depends(get_db)) -> UserRepository:
    """Get user repository instance"""
    return SQLAlchemyUserRepository(session)


# Use case dependencies
def get_create_patient_use_case(
    patient_repository: PatientRepository = Depends(get_patient_repository)
) -> CreatePatientUseCase:
    """Get create patient use case instance"""
    return CreatePatientUseCase(patient_repository)


def get_get_patient_use_case(
    patient_repository: PatientRepository = Depends(get_patient_repository)
) -> GetPatientUseCase:
    """Get get patient use case instance"""
    return GetPatientUseCase(patient_repository)


def get_list_patients_use_case(
    patient_repository: PatientRepository = Depends(get_patient_repository)
) -> ListPatientsUseCase:
    """Get list patients use case instance"""
    return ListPatientsUseCase(patient_repository)


def get_create_digital_twin_use_case(
    digital_twin_repository: DigitalTwinRepository = Depends(get_digital_twin_repository),
    patient_repository: PatientRepository = Depends(get_patient_repository)
) -> CreateDigitalTwinUseCase:
    """Get create digital twin use case instance"""
    return CreateDigitalTwinUseCase(
        digital_twin_repository=digital_twin_repository,
        patient_repository=patient_repository
    )


def get_generate_predictions_use_case(
    digital_twin_repository: DigitalTwinRepository = Depends(get_digital_twin_repository)
) -> GeneratePredictionsUseCase:
    """Get generate predictions use case instance"""
    return GeneratePredictionsUseCase(digital_twin_repository)
""",

    # Pydantic schemas
    "api/v1/schemas/auth.py": """# app/presentation/api/v1/schemas/auth.py
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    """Token schema"""
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    username: str
    email: EmailStr
    roles: List[str]
    is_active: bool

    class Config:
        orm_mode = True
""",

    "api/v1/schemas/patient.py": """# app/presentation/api/v1/schemas/patient.py
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class AddressBase(BaseModel):
    """Base schema for address data"""
    street1: str
    city: str
    state: str
    postal_code: str
    street2: Optional[str] = None
    country: str = "USA"


class ContactInfoBase(BaseModel):
    """Base schema for contact info data"""
    email: EmailStr
    phone: str
    preferred_contact_method: Optional[str] = None


class PatientBase(BaseModel):
    """Base schema for patient data"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    active: bool = True


class PatientCreate(PatientBase):
    """Schema for creating a patient"""
    contact_info: ContactInfoBase
    address: Optional[AddressBase] = None
    emergency_contact: Optional[ContactInfoBase] = None


class PatientResponse(PatientBase):
    """Schema for patient response"""
    id: str
    contact_info: ContactInfoBase
    address: Optional[AddressBase] = None
    emergency_contact: Optional[ContactInfoBase] = None
    
    class Config:
        orm_mode = True


class PatientsResponse(BaseModel):
    """Schema for paginated patients response"""
    items: List[PatientResponse]
    total: int
    limit: int
    offset: int

    class Config:
        orm_mode = True
""",

    "api/v1/schemas/digital_twin.py": """# app/presentation/api/v1/schemas/digital_twin.py
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, UUID4


class DigitalTwinModelResponse(BaseModel):
    """Response schema for digital twin model"""
    id: str
    name: str
    version: str
    accuracy: float
    created_at: str
    type: str
    last_trained: Optional[str] = None


class ClinicalInsightResponse(BaseModel):
    """Response schema for clinical insight"""
    id: str
    created_at: str
    category: str
    content: str
    confidence_score: float
    generated_by: str
    supporting_evidence: List[str]


class DigitalTwinCreate(BaseModel):
    """Schema for creating a digital twin"""
    patient_id: UUID4
    model_parameters: Optional[Dict[str, Any]] = None
    confidence_score: float = Field(0.0, ge=0.0, le=1.0)


class DigitalTwinResponse(BaseModel):
    """Response schema for digital twin"""
    id: str
    patient_id: str
    created_at: str
    updated_at: str
    version: int
    confidence_score: float
    last_calibration: str
    models: List[DigitalTwinModelResponse]
    clinical_insights: List[ClinicalInsightResponse]


class PredictionResponse(BaseModel):
    """Response schema for digital twin predictions"""
    patient_id: str
    digital_twin_id: str
    generated_at: str
    prediction_start: str
    prediction_end: str
    confidence_score: float
    symptom_trajectories: Dict[str, Dict[str, Any]]
"""
}

def create_presentation_directories():
    """Create presentation layer directories"""
    for directory in PRESENTATION_DIRS:
        dir_path = os.path.join(PRESENTATION_ROOT, directory)
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create __init__.py in each directory
        init_file = os.path.join(dir_path, "__init__.py")
        with open(init_file, "w") as f:
            package_name = os.path.join("app", "presentation", directory).replace("/", ".")
            f.write(f"# {package_name}\n")
        logger.info(f"Created: {init_file}")

def create_presentation_files():
    """Create presentation layer files with content"""
    for rel_path, content in PRESENTATION_FILES.items():
        file_path = os.path.join(PRESENTATION_ROOT, rel_path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Created file: {file_path}")

def main():
    """Main function to create presentation layer structure"""
    logger.info("Creating presentation layer directories...")
    create_presentation_directories()
    
    logger.info("Creating presentation layer files...")
    create_presentation_files()
    
    logger.info("Presentation layer creation completed successfully!")

if __name__ == "__main__":
    main()
