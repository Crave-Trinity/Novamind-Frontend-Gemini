# DATA_LAYER

## Overview

The Data Layer implements the persistence mechanisms for the NOVAMIND platform, following Clean Architecture principles to ensure separation of concerns. This layer contains the database configuration, ORM models, and repository implementations.

## Database Configuration

```python
# app/infrastructure/persistence/database.py
import os
from contextlib import contextmanager
from typing import Callable, Iterator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# Base class for all ORM models
Base = declarative_base()

# Get database URL from environment variables
DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/novamind"
)

# Create engine with connection pooling
engine = create_engine(
    DB_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    echo=False,
    connect_args={"sslmode": "require"} if "localhost" not in DB_URL else {}
)

# Create session factory
SessionFactory = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

@contextmanager
def get_db_session() -> Iterator[Session]:
    """
    Context manager for database sessions.
    Ensures session is properly closed after use.
    """
    session = SessionFactory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
```

## Base Model

```python
# app/infrastructure/persistence/models/base_model.py
import uuid
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.infrastructure.persistence.database import Base

class BaseModel(Base):
    """Base model for all database models with common fields."""
    
    __abstract__ = True
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
    created_by = Column(String, nullable=True)
    updated_by = Column(String, nullable=True)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
```

## Entity Models

### Patient Model

```python
# app/infrastructure/persistence/models/patient_model.py
from datetime import date
from sqlalchemy import Boolean, Column, Date, String, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.infrastructure.persistence.models.base_model import BaseModel

class PatientModel(BaseModel):
    """SQLAlchemy model for patient data."""
    
    __tablename__ = "patients"
    
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    phone = Column(String, nullable=False)
    address_dict = Column(JSON, nullable=True)
    insurance_dict = Column(JSON, nullable=True)
    emergency_contact_dict = Column(JSON, nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    
    def __repr__(self) -> str:
        return f"<Patient {self.first_name} {self.last_name}>"
```

### Appointment Model

```python
# app/infrastructure/persistence/models/appointment_model.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.persistence.models.base_model import BaseModel

class AppointmentModel(BaseModel):
    """SQLAlchemy model for appointment data."""
    
    __tablename__ = "appointments"
    
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    appointment_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="scheduled")
    notes = Column(String, nullable=True)
    virtual = Column(Boolean, nullable=False, default=False)
    location = Column(String, nullable=True)
    
    # Relationships
    patient = relationship("PatientModel", backref="appointments")
    
    def __repr__(self) -> str:
        return f"<Appointment {self.id} - {self.start_time}>"
```

### Digital Twin Model

```python
# app/infrastructure/persistence/models/digital_twin_model.py
from sqlalchemy import Column, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.persistence.models.base_model import BaseModel

class DigitalTwinModel(BaseModel):
    """SQLAlchemy model for digital twin data."""
    
    __tablename__ = "digital_twins"
    
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    
    symptom_forecast = Column(JSON, nullable=True)
    biometric_correlations = Column(JSON, nullable=True)
    medication_responses = Column(JSON, nullable=True)
    last_updated = Column(DateTime, nullable=False)
    
    # Relationships
    patient = relationship("PatientModel", backref="digital_twin", uselist=False)
    
    def __repr__(self) -> str:
        return f"<DigitalTwin {self.id} - Patient {self.patient_id}>"
```

## Repository Implementations

### Base Repository Implementation

```python
# app/infrastructure/persistence/repositories/base_repository.py
from typing import Generic, List, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.infrastructure.persistence.database import Base

T = TypeVar('T', bound=Base)
E = TypeVar('E')  # Domain entity type

class BaseRepository(Generic[T, E]):
    """Base repository implementation for SQLAlchemy models."""
    
    def __init__(self, db_session: Session, model_class: Type[T]):
        self.db_session = db_session
        self.model_class = model_class
    
    async def get_by_id(self, id: UUID) -> Optional[E]:
        """Get entity by ID."""
        model = self.db_session.query(self.model_class).get(id)
        if model is None:
            return None
        return self._to_entity(model)
    
    async def list(self, skip: int = 0, limit: int = 100) -> List[E]:
        """List entities with pagination."""
        models = self.db_session.query(self.model_class).offset(skip).limit(limit).all()
        return [self._to_entity(model) for model in models]
    
    async def add(self, entity: E) -> E:
        """Add a new entity."""
        model = self._to_model(entity)
        self.db_session.add(model)
        self.db_session.commit()
        self.db_session.refresh(model)
        return self._to_entity(model)
    
    async def update(self, entity: E) -> Optional[E]:
        """Update an existing entity."""
        model = self.db_session.query(self.model_class).get(entity.id)
        if model is None:
            return None
            
        # Update model with entity data
        updated_model = self._to_model(entity)
        for key, value in updated_model.__dict__.items():
            if not key.startswith('_'):
                setattr(model, key, value)
        
        self.db_session.commit()
        self.db_session.refresh(model)
        return self._to_entity(model)
    
    async def delete(self, id: UUID) -> bool:
        """Delete an entity by ID."""
        model = self.db_session.query(self.model_class).get(id)
        if model is None:
            return False
            
        self.db_session.delete(model)
        self.db_session.commit()
        return True
    
    def _to_entity(self, model: T) -> E:
        """Convert from ORM model to domain entity."""
        raise NotImplementedError("Subclasses must implement this method")
    
    def _to_model(self, entity: E) -> T:
        """Convert from domain entity to ORM model."""
        raise NotImplementedError("Subclasses must implement this method")
```

### Patient Repository Implementation

```python
# app/infrastructure/persistence/repositories/patient_repository.py
from datetime import date
from typing import List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.domain.entities.patient import Patient
from app.domain.repositories.patient_repository import PatientRepository
from app.infrastructure.persistence.models.patient_model import PatientModel
from app.infrastructure.persistence.repositories.base_repository import BaseRepository

class SQLAlchemyPatientRepository(BaseRepository[PatientModel, Patient], PatientRepository):
    """SQLAlchemy implementation of the PatientRepository interface."""
    
    def __init__(self, db_session: Session):
        super().__init__(db_session, PatientModel)
    
    async def find_by_email(self, email: str) -> Optional[Patient]:
        """Find a patient by email address."""
        model = self.db_session.query(PatientModel).filter(
            PatientModel.email == email
        ).first()
        
        if model is None:
            return None
            
        return self._to_entity(model)
    
    async def find_by_name(self, name: str) -> List[Patient]:
        """Find patients by name (partial match)."""
        models = self.db_session.query(PatientModel).filter(
            or_(
                PatientModel.first_name.ilike(f"%{name}%"),
                PatientModel.last_name.ilike(f"%{name}%")
            )
        ).all()
        
        return [self._to_entity(model) for model in models]
    
    async def find_by_date_of_birth(self, dob: date) -> List[Patient]:
        """Find patients by date of birth."""
        models = self.db_session.query(PatientModel).filter(
            PatientModel.date_of_birth == dob
        ).all()
        
        return [self._to_entity(model) for model in models]
    
    async def get_active_patients(self, skip: int = 0, limit: int = 100) -> List[Patient]:
        """Get only active patients."""
        models = self.db_session.query(PatientModel).filter(
            PatientModel.active == True
        ).offset(skip).limit(limit).all()
        
        return [self._to_entity(model) for model in models]
    
    def _to_entity(self, model: PatientModel) -> Patient:
        """Convert from ORM model to domain entity."""
        return Patient(
            id=model.id,
            first_name=model.first_name,
            last_name=model.last_name,
            date_of_birth=model.date_of_birth,
            email=model.email,
            phone=model.phone,
            address=model.address_dict,
            insurance=model.insurance_dict,
            active=model.active,
            emergency_contact=model.emergency_contact_dict
        )
    
    def _to_model(self, entity: Patient) -> PatientModel:
        """Convert from domain entity to ORM model."""
        return PatientModel(
            id=entity.id,
            first_name=entity.first_name,
            last_name=entity.last_name,
            date_of_birth=entity.date_of_birth,
            email=entity.email,
            phone=entity.phone,
            address_dict=entity.address,
            insurance_dict=entity.insurance,
            emergency_contact_dict=entity.emergency_contact,
            active=entity.active
        )
```

## Data Encryption

```python
# app/infrastructure/persistence/encryption.py
import base64
import os
from typing import Any, Dict, Union

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class EncryptionService:
    """Service for encrypting and decrypting sensitive data."""
    
    def __init__(self):
        # Get encryption key from environment or generate one
        encryption_key = os.getenv("NOVAMIND_ENCRYPTION_KEY")
        
        if encryption_key:
            self.key = base64.urlsafe_b64decode(encryption_key)
        else:
            # Generate a key from password and salt
            password = os.getenv("NOVAMIND_ENCRYPTION_PASSWORD", "").encode()
            salt = os.getenv("NOVAMIND_ENCRYPTION_SALT", "").encode()
            
            if not password or not salt:
                # Generate random values if not provided
                password = os.urandom(32)
                salt = os.urandom(16)
            
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            self.key = base64.urlsafe_b64encode(kdf.derive(password))
        
        # Initialize Fernet cipher
        self.cipher = Fernet(self.key)
    
    def encrypt(self, data: Union[str, bytes]) -> str:
        """Encrypt data and return a base64-encoded string."""
        if isinstance(data, str):
            data = data.encode()
        
        encrypted_data = self.cipher.encrypt(data)
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt(self, encrypted_data: Union[str, bytes]) -> str:
        """Decrypt base64-encoded encrypted data."""
        if isinstance(encrypted_data, str):
            encrypted_data = base64.urlsafe_b64decode(encrypted_data)
        
        decrypted_data = self.cipher.decrypt(encrypted_data)
        return decrypted_data.decode()
    
    def encrypt_dict(self, data: Dict[str, Any], keys_to_encrypt: list) -> Dict[str, Any]:
        """Encrypt specific keys in a dictionary."""
        result = {}
        
        for key, value in data.items():
            if key in keys_to_encrypt and isinstance(value, (str, bytes)):
                result[key] = self.encrypt(value)
            elif isinstance(value, dict):
                result[key] = self.encrypt_dict(value, keys_to_encrypt)
            else:
                result[key] = value
        
        return result
    
    def decrypt_dict(self, data: Dict[str, Any], keys_to_decrypt: list) -> Dict[str, Any]:
        """Decrypt specific keys in a dictionary."""
        result = {}
        
        for key, value in data.items():
            if key in keys_to_decrypt and isinstance(value, str):
                try:
                    result[key] = self.decrypt(value)
                except Exception:
                    # If decryption fails, assume it wasn't encrypted
                    result[key] = value
            elif isinstance(value, dict):
                result[key] = self.decrypt_dict(value, keys_to_decrypt)
            else:
                result[key] = value
        
        return result
```

## Migrations

```python
# alembic/env.py
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.infrastructure.persistence.database import Base
from app.infrastructure.persistence.models import *  # Import all models
from app.core.config import settings

# this is the Alembic Config object
config = context.config

# Set database URL from settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging
fileConfig(config.config_file_name)

# Add model's MetaData object for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## Implementation Guidelines

1. **Repository Pattern**: Always use repositories to access data, never direct ORM queries in application code
2. **Session Management**: Use context managers for database sessions to ensure proper cleanup
3. **Data Encryption**: Encrypt sensitive PHI fields before storing in the database
4. **Audit Trail**: Maintain created_by, updated_by, created_at, and updated_at fields for all records
5. **Migrations**: Use Alembic for database migrations, never modify schema directly
6. **Transactions**: Ensure all related database operations are wrapped in transactions
7. **Error Handling**: Implement proper error handling and rollback for database operations
8. **Type Safety**: Use type hints and generics for repository implementations