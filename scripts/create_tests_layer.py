#!/usr/bin/env python3
# create_tests_layer.py - Creates the tests structure for NOVAMIND
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
TESTS_ROOT = os.path.join(PROJECT_ROOT, "tests")

# Tests directories
TESTS_DIRS = [
    "unit",
    "unit/domain",
    "unit/application",
    "unit/infrastructure",
    "unit/presentation",
    "integration",
    "integration/repositories",
    "integration/api",
    "e2e",
    "fixtures",
    "conftest"
]

# Tests files with content
TESTS_FILES = {
    # Configuration
    "conftest.py": """# tests/conftest.py
import asyncio
import os
from typing import AsyncGenerator, Dict, Generator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.domain.entities.user import User, UserRole
from app.domain.repositories.patient_repository import PatientRepository
from app.domain.repositories.digital_twin_repository import DigitalTwinRepository
from app.infrastructure.config.settings import get_settings
from app.infrastructure.persistence.database import Base, get_db
from app.infrastructure.persistence.repositories.sqlalchemy_patient_repository import SQLAlchemyPatientRepository
from app.infrastructure.persistence.repositories.sqlalchemy_digital_twin_repository import SQLAlchemyDigitalTwinRepository
from app.presentation.api.main import create_application

settings = get_settings()

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def db_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create engine for testing."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Get test database session."""
    connection = await db_engine.connect()
    transaction = await connection.begin()
    
    session_maker = sessionmaker(
        connection,
        expire_on_commit=False,
        class_=AsyncSession
    )
    session = session_maker()
    
    try:
        yield session
    finally:
        await session.close()
        await transaction.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def client(app: FastAPI, db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Get test client with overridden dependencies."""
    async def _get_test_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = _get_test_db
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def app(db_session: AsyncSession) -> FastAPI:
    """Create a FastAPI app for testing."""
    app = create_application()
    return app


@pytest.fixture
def patient_repository(db_session: AsyncSession) -> PatientRepository:
    """Get patient repository for testing."""
    return SQLAlchemyPatientRepository(db_session)


@pytest.fixture
def digital_twin_repository(db_session: AsyncSession) -> DigitalTwinRepository:
    """Get digital twin repository for testing."""
    return SQLAlchemyDigitalTwinRepository(db_session)


@pytest.fixture
def mock_doctor_user() -> User:
    """Create a mock doctor user for testing."""
    return User(
        id="01234567-89ab-cdef-0123-456789abcdef",
        username="test_doctor",
        email="doctor@example.com",
        roles=[UserRole.DOCTOR],
        is_active=True
    )


@pytest.fixture
def mock_admin_user() -> User:
    """Create a mock admin user for testing."""
    return User(
        id="12345678-89ab-cdef-0123-456789abcdef",
        username="test_admin",
        email="admin@example.com",
        roles=[UserRole.ADMIN],
        is_active=True
    )


@pytest.fixture
def mock_patient_user() -> User:
    """Create a mock patient user for testing."""
    return User(
        id="23456789-89ab-cdef-0123-456789abcdef",
        username="test_patient",
        email="patient@example.com",
        roles=[UserRole.PATIENT],
        is_active=True
    )
""",

    # Unit tests for domain layer
    "unit/domain/test_patient.py": """# tests/unit/domain/test_patient.py
from datetime import date
import uuid

import pytest

from app.domain.entities.patient import Patient
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.address import Address
from app.domain.exceptions.validation_error import ValidationError


class TestPatient:
    """Tests for Patient entity"""
    
    def test_create_patient_with_valid_data(self):
        """Test creating patient with valid data"""
        # Arrange
        patient_id = uuid.uuid4()
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567",
            preferred_contact_method="email"
        )
        address = Address(
            street1="123 Main St",
            street2="Apt 4B",
            city="New York",
            state="NY",
            postal_code="10001",
            country="USA"
        )
        
        # Act
        patient = Patient(
            id=patient_id,
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1980, 1, 1),
            contact_info=contact_info,
            address=address,
            active=True
        )
        
        # Assert
        assert patient.id == patient_id
        assert patient.first_name == "John"
        assert patient.last_name == "Doe"
        assert patient.date_of_birth == date(1980, 1, 1)
        assert patient.contact_info == contact_info
        assert patient.address == address
        assert patient.active is True
        assert patient.full_name == "John Doe"
    
    def test_create_patient_without_address(self):
        """Test creating patient without an address"""
        # Arrange
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567"
        )
        
        # Act
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1980, 1, 1),
            contact_info=contact_info
        )
        
        # Assert
        assert patient.id is not None  # Auto-generated UUID
        assert patient.first_name == "John"
        assert patient.last_name == "Doe"
        assert patient.address is None
        assert patient.active is True  # Default value
    
    def test_patient_deactivation(self):
        """Test deactivating a patient"""
        # Arrange
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567"
        )
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1980, 1, 1),
            contact_info=contact_info,
            active=True
        )
        
        # Act
        patient.deactivate()
        
        # Assert
        assert patient.active is False
    
    def test_patient_reactivation(self):
        """Test reactivating a patient"""
        # Arrange
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567"
        )
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1980, 1, 1),
            contact_info=contact_info,
            active=False
        )
        
        # Act
        patient.activate()
        
        # Assert
        assert patient.active is True
""",

    "unit/domain/test_digital_twin.py": """# tests/unit/domain/test_digital_twin.py
from datetime import datetime
import uuid

import pytest

from app.domain.entities.digital_twin.digital_twin import DigitalTwin
from app.domain.entities.digital_twin.time_series_model import TimeSeriesModel
from app.domain.exceptions.validation_error import ValidationError


class TestDigitalTwin:
    """Tests for DigitalTwin entity"""
    
    def test_create_digital_twin(self):
        """Test creating a digital twin with factory method"""
        # Arrange
        patient_id = uuid.uuid4()
        
        time_series_model = TimeSeriesModel.create(
            name="SymptomTrajectoryModel",
            version="1.0.0",
            accuracy=0.85,
            parameters={"alpha": 0.5, "beta": 0.2},
            forecast_horizon_days=30,
            data_frequency="daily",
            symptom_categories=["mood", "anxiety", "sleep"]
        )
        
        # Act
        digital_twin = DigitalTwin.create(
            patient_id=patient_id,
            models=[time_series_model],
            confidence_score=0.75
        )
        
        # Assert
        assert digital_twin.id is not None
        assert digital_twin.patient_id == patient_id
        assert digital_twin.created_at is not None
        assert digital_twin.updated_at is not None
        assert digital_twin.version == 1
        assert digital_twin.confidence_score == 0.75
        assert digital_twin.last_calibration is not None
        assert len(digital_twin.models) == 1
        assert digital_twin.models[0] == time_series_model
        assert len(digital_twin.clinical_insights) == 0
    
    def test_add_model_to_digital_twin(self):
        """Test adding a model to a digital twin"""
        # Arrange
        patient_id = uuid.uuid4()
        
        time_series_model = TimeSeriesModel.create(
            name="SymptomTrajectoryModel",
            version="1.0.0",
            accuracy=0.85,
            parameters={"alpha": 0.5, "beta": 0.2},
            forecast_horizon_days=30,
            data_frequency="daily",
            symptom_categories=["mood", "anxiety", "sleep"]
        )
        
        digital_twin = DigitalTwin.create(
            patient_id=patient_id,
            models=[],
            confidence_score=0.75
        )
        
        # Act
        updated_twin = digital_twin.add_model(time_series_model)
        
        # Assert
        assert updated_twin.id == digital_twin.id
        assert updated_twin.patient_id == digital_twin.patient_id
        assert updated_twin.version == digital_twin.version + 1
        assert len(updated_twin.models) == 1
        assert updated_twin.models[0] == time_series_model
    
    def test_calibrate_digital_twin(self):
        """Test calibrating a digital twin"""
        # Arrange
        patient_id = uuid.uuid4()
        
        time_series_model = TimeSeriesModel.create(
            name="SymptomTrajectoryModel",
            version="1.0.0",
            accuracy=0.85,
            parameters={"alpha": 0.5, "beta": 0.2},
            forecast_horizon_days=30,
            data_frequency="daily",
            symptom_categories=["mood", "anxiety", "sleep"]
        )
        
        digital_twin = DigitalTwin.create(
            patient_id=patient_id,
            models=[time_series_model],
            confidence_score=0.75
        )
        
        # Store the original calibration time for comparison
        original_calibration = digital_twin.last_calibration
        
        # Wait a small amount to ensure the timestamps are different
        import time
        time.sleep(0.01)
        
        # Act
        new_confidence = 0.85
        calibrated_twin = digital_twin.calibrate(new_confidence)
        
        # Assert
        assert calibrated_twin.id == digital_twin.id
        assert calibrated_twin.patient_id == digital_twin.patient_id
        assert calibrated_twin.version == digital_twin.version + 1
        assert calibrated_twin.confidence_score == new_confidence
        assert calibrated_twin.last_calibration > original_calibration
        assert len(calibrated_twin.models) == 1
""",

    # Unit tests for application layer
    "unit/application/test_create_digital_twin_use_case.py": """# tests/unit/application/test_create_digital_twin_use_case.py
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
import uuid

import pytest

from app.application.use_cases.digital_twin.create_digital_twin import (
    CreateDigitalTwinUseCase,
    CreateDigitalTwinInput
)
from app.domain.entities.digital_twin.digital_twin import DigitalTwin
from app.domain.entities.patient import Patient
from app.domain.value_objects.contact_info import ContactInfo


class TestCreateDigitalTwinUseCase:
    """Tests for CreateDigitalTwinUseCase"""
    
    @pytest.mark.asyncio
    async def test_create_digital_twin_successfully(self):
        """Test creating a digital twin when patient exists"""
        # Arrange
        patient_id = uuid.uuid4()
        
        # Mock patient
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567"
        )
        patient = Patient(
            id=patient_id,
            first_name="John",
            last_name="Doe",
            date_of_birth=datetime(1980, 1, 1).date(),
            contact_info=contact_info
        )
        
        # Mock repositories
        digital_twin_repository = AsyncMock()
        digital_twin_repository.get_by_patient_id.return_value = None
        
        patient_repository = AsyncMock()
        patient_repository.get_by_id.return_value = patient
        
        # Input DTO
        input_data = CreateDigitalTwinInput(
            patient_id=patient_id,
            model_parameters={"alpha": 0.5},
            confidence_score=0.8
        )
        
        # Create use case
        use_case = CreateDigitalTwinUseCase(
            digital_twin_repository=digital_twin_repository,
            patient_repository=patient_repository
        )
        
        # Act
        result = await use_case.execute(input_data)
        
        # Assert
        assert result is not None
        assert result.patient_id == str(patient_id)
        assert result.confidence_score == 0.8
        assert len(result.models) == 1
        
        # Verify repository calls
        patient_repository.get_by_id.assert_called_once_with(patient_id)
        digital_twin_repository.get_by_patient_id.assert_called_once_with(patient_id)
        digital_twin_repository.create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_digital_twin_patient_not_found(self):
        """Test creating a digital twin when patient doesn't exist"""
        # Arrange
        patient_id = uuid.uuid4()
        
        # Mock repositories
        digital_twin_repository = AsyncMock()
        patient_repository = AsyncMock()
        patient_repository.get_by_id.return_value = None
        
        # Input DTO
        input_data = CreateDigitalTwinInput(
            patient_id=patient_id,
            model_parameters={"alpha": 0.5},
            confidence_score=0.8
        )
        
        # Create use case
        use_case = CreateDigitalTwinUseCase(
            digital_twin_repository=digital_twin_repository,
            patient_repository=patient_repository
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match=f"Patient with ID {patient_id} not found"):
            await use_case.execute(input_data)
        
        # Verify repository calls
        patient_repository.get_by_id.assert_called_once_with(patient_id)
        digital_twin_repository.create.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_create_digital_twin_already_exists(self):
        """Test creating a digital twin when one already exists for the patient"""
        # Arrange
        patient_id = uuid.uuid4()
        
        # Mock patient
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567"
        )
        patient = Patient(
            id=patient_id,
            first_name="John",
            last_name="Doe",
            date_of_birth=datetime(1980, 1, 1).date(),
            contact_info=contact_info
        )
        
        # Mock existing digital twin
        existing_twin = DigitalTwin.create(
            patient_id=patient_id,
            models=[],
            confidence_score=0.5
        )
        
        # Mock repositories
        digital_twin_repository = AsyncMock()
        digital_twin_repository.get_by_patient_id.return_value = existing_twin
        
        patient_repository = AsyncMock()
        patient_repository.get_by_id.return_value = patient
        
        # Input DTO
        input_data = CreateDigitalTwinInput(
            patient_id=patient_id,
            model_parameters={"alpha": 0.5},
            confidence_score=0.8
        )
        
        # Create use case
        use_case = CreateDigitalTwinUseCase(
            digital_twin_repository=digital_twin_repository,
            patient_repository=patient_repository
        )
        
        # Act & Assert
        with pytest.raises(ValueError, match=f"Digital twin already exists for patient {patient_id}"):
            await use_case.execute(input_data)
        
        # Verify repository calls
        patient_repository.get_by_id.assert_called_once_with(patient_id)
        digital_twin_repository.get_by_patient_id.assert_called_once_with(patient_id)
        digital_twin_repository.create.assert_not_called()
""",

    # Integration tests
    "integration/repositories/test_patient_repository.py": """# tests/integration/repositories/test_patient_repository.py
from datetime import date
import uuid

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.patient import Patient
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.address import Address
from app.infrastructure.persistence.repositories.sqlalchemy_patient_repository import SQLAlchemyPatientRepository


class TestPatientRepository:
    """Integration tests for SQLAlchemyPatientRepository"""
    
    @pytest.mark.asyncio
    async def test_create_and_get_patient(self, db_session: AsyncSession):
        """Test creating and retrieving a patient"""
        # Arrange
        repository = SQLAlchemyPatientRepository(db_session)
        patient_id = uuid.uuid4()
        
        contact_info = ContactInfo(
            email="test@example.com",
            phone="555-123-4567",
            preferred_contact_method="email"
        )
        
        address = Address(
            street1="123 Main St",
            street2="Apt 4B",
            city="New York",
            state="NY",
            postal_code="10001",
            country="USA"
        )
        
        patient = Patient(
            id=patient_id,
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1980, 1, 1),
            contact_info=contact_info,
            address=address,
            active=True
        )
        
        # Act - Create
        created_patient = await repository.create(patient)
        
        # Act - Get by ID
        retrieved_patient = await repository.get_by_id(patient_id)
        
        # Assert
        assert retrieved_patient is not None
        assert retrieved_patient.id == patient_id
        assert retrieved_patient.first_name == "John"
        assert retrieved_patient.last_name == "Doe"
        assert retrieved_patient.date_of_birth == date(1980, 1, 1)
        assert retrieved_patient.contact_info.email == "test@example.com"
        assert retrieved_patient.contact_info.phone == "555-123-4567"
        assert retrieved_patient.contact_info.preferred_contact_method == "email"
        assert retrieved_patient.address is not None
        assert retrieved_patient.address.street1 == "123 Main St"
        assert retrieved_patient.address.street2 == "Apt 4B"
        assert retrieved_patient.address.city == "New York"
        assert retrieved_patient.address.state == "NY"
        assert retrieved_patient.address.postal_code == "10001"
        assert retrieved_patient.address.country == "USA"
        assert retrieved_patient.active is True
    
    @pytest.mark.asyncio
    async def test_search_by_name(self, db_session: AsyncSession):
        """Test searching for patients by name"""
        # Arrange
        repository = SQLAlchemyPatientRepository(db_session)
        
        # Create multiple patients
        patients = [
            Patient(
                first_name="John",
                last_name="Doe",
                date_of_birth=date(1980, 1, 1),
                contact_info=ContactInfo(
                    email="john@example.com",
                    phone="555-123-4567"
                )
            ),
            Patient(
                first_name="Jane",
                last_name="Doe",
                date_of_birth=date(1985, 5, 5),
                contact_info=ContactInfo(
                    email="jane@example.com",
                    phone="555-987-6543"
                )
            ),
            Patient(
                first_name="Bob",
                last_name="Smith",
                date_of_birth=date(1990, 10, 10),
                contact_info=ContactInfo(
                    email="bob@example.com",
                    phone="555-555-5555"
                )
            )
        ]
        
        for patient in patients:
            await repository.create(patient)
        
        # Act - Search by last name
        doe_patients = await repository.search_by_name("Doe")
        
        # Act - Search by first name
        john_patients = await repository.search_by_name("John")
        
        # Act - Search with no matches
        no_match_patients = await repository.search_by_name("Williams")
        
        # Assert
        assert len(doe_patients) == 2
        assert len(john_patients) == 1
        assert len(no_match_patients) == 0
        
        # Check full names for Doe search
        doe_names = [p.full_name for p in doe_patients]
        assert "John Doe" in doe_names
        assert "Jane Doe" in doe_names
        
        # Check name for John search
        assert john_patients[0].full_name == "John Doe"
""",

    # E2E tests
    "e2e/test_patient_api.py": """# tests/e2e/test_patient_api.py
from datetime import date
import json
from unittest import mock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from app.domain.entities.user import User, UserRole


@pytest.mark.asyncio
async def test_create_patient(client: AsyncClient, app: FastAPI, mock_doctor_user: User):
    """Test creating a patient via API"""
    # Mock authentication
    with mock.patch(
        "app.infrastructure.security.authentication.get_current_user",
        return_value=mock_doctor_user
    ):
        # Arrange
        patient_data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1980-01-01",
            "contact_info": {
                "email": "john.doe@example.com",
                "phone": "555-123-4567",
                "preferred_contact_method": "email"
            },
            "address": {
                "street1": "123 Main St",
                "street2": "Apt 4B",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "country": "USA"
            }
        }
        
        # Act
        response = await client.post(
            "/api/v1/patients/",
            json=patient_data,
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Assert
        assert response.status_code == 201
        
        result = response.json()
        assert result["first_name"] == "John"
        assert result["last_name"] == "Doe"
        assert result["date_of_birth"] == "1980-01-01"
        assert "id" in result
        
        # Verify contact info
        assert result["contact_info"]["email"] == "john.doe@example.com"
        assert result["contact_info"]["phone"] == "555-123-4567"
        
        # Verify address
        assert result["address"]["street1"] == "123 Main St"
        assert result["address"]["city"] == "New York"


@pytest.mark.asyncio
async def test_create_patient_unauthorized(client: AsyncClient, app: FastAPI, mock_patient_user: User):
    """Test creating a patient without proper authorization"""
    # Mock authentication with patient user (insufficient permissions)
    with mock.patch(
        "app.infrastructure.security.authentication.get_current_user",
        return_value=mock_patient_user
    ):
        # Arrange
        patient_data = {
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1980-01-01",
            "contact_info": {
                "email": "john.doe@example.com",
                "phone": "555-123-4567"
            }
        }
        
        # Act
        response = await client.post(
            "/api/v1/patients/",
            json=patient_data,
            headers={"Authorization": "Bearer mock_token"}
        )
        
        # Assert
        assert response.status_code == 403
        
        result = response.json()
        assert "detail" in result
        assert "Insufficient permissions" in result["detail"]
"""
}

def create_tests_directories():
    """Create tests directories"""
    for directory in TESTS_DIRS:
        dir_path = os.path.join(TESTS_ROOT, directory)
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create __init__.py in each directory
        init_file = os.path.join(dir_path, "__init__.py")
        with open(init_file, "w") as f:
            f.write(f"# tests/{directory}\n")
        logger.info(f"Created: {init_file}")

def create_tests_files():
    """Create tests files with content"""
    for rel_path, content in TESTS_FILES.items():
        file_path = os.path.join(TESTS_ROOT, rel_path)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Created file: {file_path}")

def main():
    """Main function to create tests structure"""
    logger.info("Creating tests directories...")
    create_tests_directories()
    
    logger.info("Creating tests files...")
    create_tests_files()
    
    logger.info("Tests structure creation completed successfully!")

if __name__ == "__main__":
    main()
