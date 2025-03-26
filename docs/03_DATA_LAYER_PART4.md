# NOVAMIND: Data Layer Implementation - Part 4

## 11. Dependency Injection

Dependency injection ensures our application layers remain decoupled and testable.

```python
# app/data/container.py
from typing import Callable
from sqlalchemy.orm import Session

from app.data.config.database import get_db
from app.data.repositories.patient_repository import SQLAlchemyPatientRepository
from app.data.repositories.appointment_repository import SQLAlchemyAppointmentRepository
from app.data.repositories.clinical_note_repository import SQLAlchemyClinicalNoteRepository
from app.data.repositories.medication_repository import SQLAlchemyMedicationRepository
from app.domain.interfaces.patient_repository import PatientRepository
from app.domain.interfaces.appointment_repository import AppointmentRepository
from app.domain.interfaces.clinical_note_repository import ClinicalNoteRepository
from app.domain.interfaces.medication_repository import MedicationRepository


def get_patient_repository(db: Session = next(get_db())) -> PatientRepository:
    """Dependency provider for PatientRepository"""
    return SQLAlchemyPatientRepository(db)


def get_appointment_repository(db: Session = next(get_db())) -> AppointmentRepository:
    """Dependency provider for AppointmentRepository"""
    return SQLAlchemyAppointmentRepository(db)


def get_clinical_note_repository(db: Session = next(get_db())) -> ClinicalNoteRepository:
    """Dependency provider for ClinicalNoteRepository"""
    return SQLAlchemyClinicalNoteRepository(db)


def get_medication_repository(db: Session = next(get_db())) -> MedicationRepository:
    """Dependency provider for MedicationRepository"""
    return SQLAlchemyMedicationRepository(db)


# Example usage with FastAPI dependency injection
"""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.data.config.database import get_db
from app.data.container import get_patient_repository
from app.domain.interfaces.patient_repository import PatientRepository

@app.get("/patients/{patient_id}")
async def get_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    patient_repository: PatientRepository = Depends(get_patient_repository)
):
    patient = patient_repository.get_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
"""
```python

## 12. Database Migrations

Database migrations are handled with Alembic to ensure structured schema evolution.

```python
# migrations/env.py (excerpt)
from alembic import context
from sqlalchemy import engine_from_config, pool

from app.data.config.database import Base
from app.data.models import patient, appointment, clinical_note, medication

# Import all models to ensure they're registered with the metadata
# This ensures Alembic can detect schema changes

config = context.config
target_metadata = Base.metadata

# ... rest of Alembic configuration ...
```python

## 13. Testing the Data Layer

### 13.1 Unit Testing Repositories

```python
# tests/unit/data/repositories/test_patient_repository.py
import pytest
from datetime import date
from unittest.mock import Mock, patch
from uuid import uuid4

from app.domain.entities.patient import Patient
from app.domain.value_objects.contact_info import ContactInfo
from app.data.repositories.patient_repository import SQLAlchemyPatientRepository


class TestPatientRepository:
    """Unit tests for the SQLAlchemyPatientRepository"""

    def test_add_patient(self):
        """Test adding a patient to the repository"""
        # Setup
        mock_session = Mock()
        mock_session.add.return_value = None
        mock_session.flush.return_value = None

        repository = SQLAlchemyPatientRepository(mock_session)

        contact_info = ContactInfo(email="test@example.com", phone="555-123-4567")
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            contact_info=contact_info
        )

        # Exercise
        result = repository.add(patient)

        # Verify
        assert mock_session.add.called
        assert mock_session.flush.called
        assert result.first_name == "John"
        assert result.last_name == "Doe"

    def test_get_by_id(self):
        """Test retrieving a patient by ID"""
        # Setup
        patient_id = uuid4()
        mock_query = Mock()
        mock_filter = Mock()
        mock_first = Mock()

        mock_session = Mock()
        mock_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = Mock(
            id=patient_id,
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            active=True,
            contact_info={
                "email": "test@example.com",
                "phone": "555-123-4567",
                "preferred_contact_method": "email"
            },
            address=None,
            insurance=None,
            emergency_contact=None,
            created_by="system",
            updated_by="system"
        )

        repository = SQLAlchemyPatientRepository(mock_session)

        # Exercise
        result = repository.get_by_id(patient_id)

        # Verify
        assert mock_session.query.called
        assert result.id == patient_id
        assert result.first_name == "John"
        assert result.last_name == "Doe"
```python

### 13.2 Integration Testing

```python
# tests/integration/data/repositories/test_patient_repository.py
import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from app.data.config.database import Base
from app.data.repositories.patient_repository import SQLAlchemyPatientRepository
from app.domain.entities.patient import Patient
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.address import Address


@pytest.fixture(scope="function")
def db_session():
    """Create a clean database session for each test"""
    # Use in-memory SQLite for testing
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after the test
        Base.metadata.drop_all(bind=engine)


class TestPatientRepositoryIntegration:
    """Integration tests for the SQLAlchemyPatientRepository"""

    def test_patient_lifecycle(self, db_session):
        """Test full patient lifecycle: create, read, update, delete"""
        # Setup
        repository = SQLAlchemyPatientRepository(db_session)

        contact_info = ContactInfo(email="test@example.com", phone="555-123-4567")
        address = Address(street="123 Main St", city="Anytown", state="CA", zip_code="12345")

        # Create
        patient = Patient(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            contact_info=contact_info,
            address=address
        )

        created_patient = repository.add(patient)
        db_session.commit()

        # Read
        retrieved_patient = repository.get_by_id(created_patient.id)
        assert retrieved_patient is not None
        assert retrieved_patient.first_name == "John"
        assert retrieved_patient.last_name == "Doe"
        assert retrieved_patient.address.street == "123 Main St"

        # Update
        new_contact_info = ContactInfo(email="updated@example.com", phone="555-987-6543")
        retrieved_patient.update_contact_info(new_contact_info)

        updated_patient = repository.update(retrieved_patient)
        db_session.commit()

        # Verify update
        fresh_patient = repository.get_by_id(created_patient.id)
        assert fresh_patient.contact_info.email == "updated@example.com"

        # Search by name
        search_results = repository.search_by_name("Doe")
        assert len(search_results) == 1
        assert search_results[0].id == created_patient.id
```python

## 14. Data Layer Best Practices

1. **Error Handling**: Always use domain-specific exceptions rather than generic database errors.
1. **Transaction Management**: Use the Unit of Work pattern to maintain data consistency.
1. **Repository Isolation**: Repositories should be self-contained and not depend on each other.
1. **Security**: Encrypt sensitive PHI at all times, both in transit and at rest.
1. **Audit Logs**: Maintain comprehensive audit logs for all data access operations.
1. **Connection Pooling**: Configure appropriate connection pooling for production use.
1. **Use Caching Wisely**: When appropriate, implement caching for frequently accessed, non-sensitive data.

## 15. Implementing the Repository Pattern with Generics

The Repository Pattern with generics can help reduce boilerplate code while maintaining type safety:

```python
# app/data/repositories/generic_repository.py
from typing import Generic, List, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.data.models.base import BaseModel

T = TypeVar('T', bound=BaseModel)  # Database model type
E = TypeVar('E')  # Domain entity type


class GenericRepository(Generic[T, E]):
    """Generic repository for common CRUD operations"""

    def __init__(
        self,
        db_session: Session,
        model_class: Type[T],
        to_entity_fn,  # Function to convert model to entity
        to_model_fn   # Function to convert entity to model
    ):
        self.db = db_session
        self.model = model_class
        self._to_entity = to_entity_fn
        self._to_model = to_model_fn

    def add(self, entity: E) -> E:
        """Add a new entity"""
        model = self._to_model(entity)
        self.db.add(model)
        self.db.flush()
        return self._to_entity(model)

    def get_by_id(self, entity_id: UUID) -> Optional[E]:
        """Get entity by ID"""
        model = self.db.query(self.model).filter(self.model.id == entity_id).first()
        return self._to_entity(model) if model else None

    def list_all(self, limit: int = 100, offset: int = 0) -> List[E]:
        """List all entities with pagination"""
        models = self.db.query(self.model).limit(limit).offset(offset).all()
        return [self._to_entity(model) for model in models]

    def update(self, entity: E) -> E:
        """Update an existing entity"""
        model = self._to_model(entity)
        self.db.merge(model)
        self.db.flush()
        updated_model = self.db.query(self.model).filter(self.model.id == model.id).first()
        return self._to_entity(updated_model)

    def delete(self, entity_id: UUID) -> None:
        """Delete an entity by ID"""
        model = self.db.query(self.model).filter(self.model.id == entity_id).first()
        if model:
            self.db.delete(model)
            self.db.flush()
```python

## 16. Conclusion

The Data Layer is responsible for implementing the persistence mechanisms while adhering to the interfaces defined in the Domain Layer. By clearly separating these concerns, we ensure that:

1. The Domain Layer remains pure and focused on business rules
1. Implementation details like databases can be swapped out if needed
1. Testing is simplified through proper dependency injection
1. HIPAA compliance requirements are properly addressed

In the next section, we will explore the Application Layer, which serves as a coordination layer between the Domain/Data Layers and the Presentation Layer.
