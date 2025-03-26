# NOVAMIND: Data Layer Implementation - Part 1

## 1. Data Layer Overview

The Data Layer implements persistence mechanisms for our domain entities while ensuring complete separation of concerns. It translates between domain entities and database models, implements repository interfaces defined in the domain layer, and manages database connections and transactions.

## 2. Implementation Principles

- **Dependency Inversion**: The Data Layer depends on abstractions (interfaces) defined in the Domain Layer
- **Repository Pattern**: Encapsulates data access logic behind consistent interfaces
- **ORMs for Persistence**: Uses SQLAlchemy for database interactions
- **Separation of Models**: Database models are separate from domain entities
- **HIPAA Compliance**: Ensures data is properly secured, encrypted, and auditable
- **Transaction Management**: Provides atomic database operations

## 3. Architecture Structure

```text
app/
├── data/
│   ├── repositories/          # Repository implementations
│   │   ├── __init__.py
│   │   ├── patient_repository.py
│   │   ├── appointment_repository.py
│   │   ├── clinical_note_repository.py
│   │   └── medication_repository.py
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── patient.py
│   │   ├── appointment.py
│   │   ├── clinical_note.py
│   │   └── medication.py
│   ├── config/                # Database configuration
│   │   ├── __init__.py
│   │   └── database.py
│   └── __init__.py
```python

## 4. Database Configuration

```python
# app/data/config/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load database URL from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://username:password@localhost/novamind"
)

# Create engine with appropriate connection pool settings
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections every 30 minutes
    connect_args={"sslmode": "require"}  # Enforce SSL for HIPAA compliance
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy models
Base = declarative_base()

# Dependency for obtaining a database session
def get_db():
    """
    Get a database session from the pool.
    Used with FastAPI dependency injection.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```python

## 5. Base Model with Audit Fields

```python
# app/data/models/base.py
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr

from app.data.config.database import Base


class AuditMixin:
    """
    Mixin to add audit fields to all models.
    HIPAA compliance requires tracking all data modifications.
    """
    @declared_attr
    def created_by(cls):
        return Column(String(50), nullable=False)

    @declared_attr
    def updated_by(cls):
        return Column(String(50), nullable=False)

    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.utcnow, nullable=False)

    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False
        )


class BaseModel(Base, AuditMixin):
    """
    Base model class that includes GUID primary keys and audit fields.
    """
    __abstract__ = True

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
```python

## 6. Repository Base Class

```python
# app/data/repositories/base_repository.py
from typing import Generic, List, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.data.models.base import BaseModel

# Generic type variables for ORM models and domain entities
T = TypeVar('T', bound=BaseModel)
E = TypeVar('E')


class BaseRepository(Generic[T, E]):
    """
    Base repository with common CRUD operations.
    Generic implementation for all repositories.

    Type parameters:
        T: The SQLAlchemy model type
        E: The domain entity type
    """
    def __init__(self, db_session: Session, model_class: Type[T]):
        self.db = db_session
        self.model = model_class

    def _to_model(self, entity: E) -> T:
        """
        Convert domain entity to database model.
        Must be implemented by child classes.
        """
        raise NotImplementedError("Must be implemented by child classes")

    def _to_entity(self, model: T) -> E:
        """
        Convert database model to domain entity.
        Must be implemented by child classes.
        """
        raise NotImplementedError("Must be implemented by child classes")

    def add(self, entity: E) -> E:
        """Add a new entity"""
        model = self._to_model(entity)
        self.db.add(model)
        self.db.flush()  # Generate ID without committing transaction
        return self._to_entity(model)

    def get_by_id(self, entity_id: UUID) -> Optional[E]:
        """Get entity by ID"""
        model = self.db.query(self.model).filter(self.model.id == entity_id).first()
        return self._to_entity(model) if model else None

    def update(self, entity: E) -> E:
        """Update an existing entity"""
        model = self._to_model(entity)

        # Merge the updated entity with the session
        self.db.merge(model)
        self.db.flush()

        # Return the updated entity
        updated_model = self.db.query(self.model).filter(self.model.id == model.id).first()
        return self._to_entity(updated_model)

    def delete(self, entity_id: UUID) -> None:
        """Delete an entity by ID"""
        model = self.db.query(self.model).filter(self.model.id == entity_id).first()
        if model:
            self.db.delete(model)
            self.db.flush()
```
