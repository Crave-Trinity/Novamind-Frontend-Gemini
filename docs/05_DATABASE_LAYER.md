# NOVAMIND: Database Layer Implementation

## 1. Overview

The Database Layer implements the repository interfaces defined in the domain layer and provides concrete database operations using SQLAlchemy. This layer is responsible for:

- Defining ORM models
- Implementing repository pattern 
- Managing database connections
- Handling migrations with Alembic

## 2. SQLAlchemy Setup

### 2.1 Database Connection

```python
# app/infrastructure/database/session.py
from asyncio import current_task
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_scoped_session,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

from app.config.settings import get_settings

settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    future=True,
)

# Create session factory
async_session_factory = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Create scoped session
AsyncScopedSession = async_scoped_session(
    async_session_factory,
    scopefunc=current_task,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for getting a database session"""
    session = AsyncScopedSession()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()
```

### 2.2 Base Model

```python
# app/infrastructure/database/base.py
import uuid
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models"""
    
    # Make tablename automatically derived from class name
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    # Add common methods here
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class BaseModel(Base):
    """Base model with common columns"""
    
    __abstract__ = True
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
```

## 3. ORM Models

### 3.1 Patient Model

```python
# app/infrastructure/database/models/patient.py
from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Column, Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import BaseModel


class Patient(BaseModel):
    """ORM model for Patient entity"""
    
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Store complex data as JSON
    contact_info: Mapped[dict] = mapped_column(JSONB, nullable=False)
    address: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    insurance: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    emergency_contact: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    
    # Relationships
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete-orphan")
```

## 4. Repository Implementation

### 4.1 Base Repository

```python
# app/infrastructure/repositories/base_repository.py
from typing import Generic, List, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.repositories.base_repository import IBaseRepository
from app.infrastructure.database.base import BaseModel

T = TypeVar("T")
M = TypeVar("M", bound=BaseModel)


class BaseRepository(Generic[T, M], IBaseRepository[T]):
    """Base repository implementation with SQLAlchemy"""
    
    def __init__(self, session: AsyncSession, model_class: Type[M]):
        self.session = session
        self.model_class = model_class
    
    async def get_by_id(self, id: UUID) -> Optional[T]:
        """Get entity by id"""
        stmt = select(self.model_class).where(self.model_class.id == id)
        result = await self.session.execute(stmt)
        db_obj = result.scalars().first()
        return self._map_to_entity(db_obj) if db_obj else None
    
    async def list(self) -> List[T]:
        """List all entities"""
        stmt = select(self.model_class)
        result = await self.session.execute(stmt)
        return [self._map_to_entity(obj) for obj in result.scalars().all()]
    
    async def create(self, entity: T) -> T:
        """Create a new entity"""
        db_obj = self._map_to_model(entity)
        self.session.add(db_obj)
        await self.session.flush()
        return self._map_to_entity(db_obj)
    
    async def update(self, entity: T) -> T:
        """Update an existing entity"""
        db_obj = await self._get_model_by_id(entity.id)
        self._update_model(db_obj, entity)
        await self.session.flush()
        return self._map_to_entity(db_obj)
    
    async def delete(self, id: UUID) -> bool:
        """Delete an entity by id"""
        db_obj = await self._get_model_by_id(id)
        if not db_obj:
            return False
        await self.session.delete(db_obj)
        await self.session.flush()
        return True
    
    async def _get_model_by_id(self, id: UUID) -> Optional[M]:
        """Get model instance by id"""
        stmt = select(self.model_class).where(self.model_class.id == id)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    def _map_to_entity(self, model: M) -> T:
        """Map ORM model to domain entity - Override in child classes"""
        raise NotImplementedError
    
    def _map_to_model(self, entity: T) -> M:
        """Map domain entity to ORM model - Override in child classes"""
        raise NotImplementedError
    
    def _update_model(self, model: M, entity: T) -> None:
        """Update ORM model from domain entity - Override in child classes"""
        raise NotImplementedError
```

### 4.2 Patient Repository

```python
# app/infrastructure/repositories/patient_repository.py
from datetime import date
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.patient import Patient
from app.domain.repositories.patient_repository import IPatientRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo
from app.domain.value_objects.insurance import Insurance
from app.infrastructure.database.models.patient import Patient as PatientModel
from app.infrastructure.repositories.base_repository import BaseRepository


class PatientRepository(BaseRepository[Patient, PatientModel], IPatientRepository):
    """SQLAlchemy implementation of patient repository"""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, PatientModel)
    
    async def get_by_email(self, email: str) -> Optional[Patient]:
        """Get patient by email address"""
        stmt = select(PatientModel).where(
            PatientModel.contact_info["email"].astext == email
        )
        result = await self.session.execute(stmt)
        db_obj = result.scalars().first()
        return self._map_to_entity(db_obj) if db_obj else None
    
    async def get_active_patients(self) -> List[Patient]:
        """Get all active patients"""
        stmt = select(PatientModel).where(PatientModel.active == True)
        result = await self.session.execute(stmt)
        return [self._map_to_entity(obj) for obj in result.scalars().all()]
    
    def _map_to_entity(self, model: PatientModel) -> Patient:
        """Map ORM model to domain entity"""
        # Map contact info
        contact_info = ContactInfo(
            email=model.contact_info["email"],
            phone=model.contact_info["phone"],
            alternative_phone=model.contact_info.get("alternative_phone"),
        )
        
        # Map address if present
        address = None
        if model.address:
            address = Address(
                street=model.address["street"],
                city=model.address["city"],
                state=model.address["state"],
                zip_code=model.address["zip_code"],
            )
        
        # Map insurance if present
        insurance = None
        if model.insurance:
            insurance = Insurance(
                provider=model.insurance["provider"],
                policy_number=model.insurance["policy_number"],
                group_number=model.insurance.get("group_number"),
            )
        
        # Map emergency contact if present
        emergency_contact = None
        if model.emergency_contact:
            emergency_contact = ContactInfo(
                email=model.emergency_contact.get("email"),
                phone=model.emergency_contact["phone"],
                alternative_phone=model.emergency_contact.get("alternative_phone"),
            )
        
        # Create and return patient entity
        return Patient(
            id=model.id,
            first_name=model.first_name,
            last_name=model.last_name,
            date_of_birth=model.date_of_birth,
            contact_info=contact_info,
            address=address,
            insurance=insurance,
            active=model.active,
            emergency_contact=emergency_contact,
        )
    
    def _map_to_model(self, entity: Patient) -> PatientModel:
        """Map domain entity to ORM model"""
        # Create contact info dict
        contact_info = {
            "email": entity.contact_info.email,
            "phone": entity.contact_info.phone,
        }
        if entity.contact_info.alternative_phone:
            contact_info["alternative_phone"] = entity.contact_info.alternative_phone
        
        # Create address dict if present
        address = None
        if entity.address:
            address = {
                "street": entity.address.street,
                "city": entity.address.city,
                "state": entity.address.state,
                "zip_code": entity.address.zip_code,
            }
        
        # Create insurance dict if present
        insurance = None
        if entity.insurance:
            insurance = {
                "provider": entity.insurance.provider,
                "policy_number": entity.insurance.policy_number,
            }
            if entity.insurance.group_number:
                insurance["group_number"] = entity.insurance.group_number
        
        # Create emergency contact dict if present
        emergency_contact = None
        if entity.emergency_contact:
            emergency_contact = {
                "phone": entity.emergency_contact.phone,
            }
            if entity.emergency_contact.email:
                emergency_contact["email"] = entity.emergency_contact.email
            if entity.emergency_contact.alternative_phone:
                emergency_contact["alternative_phone"] = entity.emergency_contact.alternative_phone
        
        # Create and return patient model
        return PatientModel(
            id=entity.id,
            first_name=entity.first_name,
            last_name=entity.last_name,
            date_of_birth=entity.date_of_birth,
            contact_info=contact_info,
            address=address,
            insurance=insurance,
            active=entity.active,
            emergency_contact=emergency_contact,
        )
    
    def _update_model(self, model: PatientModel, entity: Patient) -> None:
        """Update ORM model from domain entity"""
        model.first_name = entity.first_name
        model.last_name = entity.last_name
        model.date_of_birth = entity.date_of_birth
        model.active = entity.active
        
        # Update contact info
        model.contact_info = {
            "email": entity.contact_info.email,
            "phone": entity.contact_info.phone,
        }
        if entity.contact_info.alternative_phone:
            model.contact_info["alternative_phone"] = entity.contact_info.alternative_phone
        
        # Update address
        if entity.address:
            model.address = {
                "street": entity.address.street,
                "city": entity.address.city,
                "state": entity.address.state,
                "zip_code": entity.address.zip_code,
            }
        else:
            model.address = None
        
        # Update insurance
        if entity.insurance:
            model.insurance = {
                "provider": entity.insurance.provider,
                "policy_number": entity.insurance.policy_number,
            }
            if entity.insurance.group_number:
                model.insurance["group_number"] = entity.insurance.group_number
        else:
            model.insurance = None
        
        # Update emergency contact
        if entity.emergency_contact:
            model.emergency_contact = {
                "phone": entity.emergency_contact.phone,
            }
            if entity.emergency_contact.email:
                model.emergency_contact["email"] = entity.emergency_contact.email
            if entity.emergency_contact.alternative_phone:
                model.emergency_contact["alternative_phone"] = entity.emergency_contact.alternative_phone
        else:
            model.emergency_contact = None
```

## 5. Database Migrations with Alembic

### 5.1 Alembic Setup

Create an Alembic configuration at the root of the project:

```bash
# Install alembic
pip install alembic

# Initialize alembic
alembic init alembic
```

Update the `alembic.ini` file:

```ini
# alembic.ini
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = driver://user:pass@localhost/dbname  # Will be overridden

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

Update the `alembic/env.py` file:

```python
# alembic/env.py
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.config.settings import get_settings
from app.infrastructure.database.base import Base
# Import all models to ensure they're registered with the metadata
from app.infrastructure.database.models import patient, appointment, medical_record  # noqa

# this is the Alembic Config object
config = context.config

# Override sqlalchemy.url with our connection string from settings
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata
target_metadata = Base.metadata


def run_migrations_offline() -> None:
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


def do_run_migrations(connection: Connection) -> None:
    """Run migrations with a direct connection."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

### 5.2 Creating Migrations

Create a new migration:

```bash
# Create a migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## 6. Using Repositories in Application Services

```python
# app/application/services/patient_service.py
from typing import List, Optional
from uuid import UUID

from app.domain.entities.patient import Patient
from app.domain.repositories.patient_repository import IPatientRepository
from app.domain.value_objects.address import Address
from app.domain.value_objects.contact_info import ContactInfo


class PatientService:
    """Service for patient operations"""
    
    def __init__(self, patient_repository: IPatientRepository):
        self.patient_repository = patient_repository
    
    async def get_patient(self, patient_id: UUID) -> Optional[Patient]:
        """Get a patient by ID"""
        return await self.patient_repository.get_by_id(patient_id)
    
    async def get_patients(self) -> List[Patient]:
        """Get all patients"""
        return await self.patient_repository.list()
    
    async def get_active_patients(self) -> List[Patient]:
        """Get all active patients"""
        return await self.patient_repository.get_active_patients()
    
    async def create_patient(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: str,
        email: str,
        phone: str,
        address: Optional[dict] = None,
    ) -> Patient:
        """Create a new patient"""
        # Create contact info
        contact_info = ContactInfo(email=email, phone=phone)
        
        # Create address if provided
        patient_address = None
        if address:
            patient_address = Address(
                street=address["street"],
                city=address["city"],
                state=address["state"],
                zip_code=address["zip_code"],
            )
        
        # Create patient entity
        patient = Patient(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            contact_info=contact_info,
            address=patient_address,
        )
        
        # Save to repository
        return await self.patient_repository.create(patient)
```

## 7. HIPAA Considerations

1. **Data Encryption**: Database fields containing PHI should be encrypted using field-level encryption:

```python
# app/infrastructure/database/encryption.py
from cryptography.fernet import Fernet

from app.config.settings import get_settings

settings = get_settings()
fernet = Fernet(settings.FERNET_KEY)


def encrypt_phi(data: str) -> str:
    """Encrypt PHI data"""
    if not data:
        return data
    return fernet.encrypt(data.encode()).decode()


def decrypt_phi(data: str) -> str:
    """Decrypt PHI data"""
    if not data:
        return data
    return fernet.decrypt(data.encode()).decode()
```

2. **Audit Logging**: Implement database-level auditing for access to PHI:

```python
# app/infrastructure/database/audit.py
import json
from datetime import datetime
from typing import Dict, Optional

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database.base import BaseModel


class AuditLog(BaseModel):
    """Audit log for tracking database operations"""
    
    user_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    changes: Mapped[Optional[Dict]] = mapped_column(JSONB, nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


async def log_audit(
    session: AsyncSession,
    user_id: Optional[UUID],
    action: str,
    entity_type: str,
    entity_id: Optional[UUID] = None,
    changes: Optional[Dict] = None,
    details: Optional[str] = None,
) -> None:
    """Create an audit log entry"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes,
        details=details,
    )
    session.add(audit_log)
    await session.flush()
```

## 8. Database Security Best Practices

1. **Use TLS for Database Connections**
2. **Implement Connection Pooling with Appropriate Timeouts**
3. **Use a Dedicated Database User with Limited Permissions**
4. **Regularly Backup and Test Restore Procedures**
5. **Monitor Database Access and Performance**
