# NOVAMIND: Data Layer Implementation - Part 3

## 8. Repository Implementations (Continued)

### 8.2 Appointment Repository Implementation

```python
# app/data/repositories/appointment_repository.py
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.data.models.appointment import AppointmentModel
from app.data.repositories.base_repository import BaseRepository
from app.domain.entities.appointment import Appointment, AppointmentStatus, AppointmentType
from app.domain.interfaces.appointment_repository import AppointmentRepository


class SQLAlchemyAppointmentRepository(BaseRepository[AppointmentModel, Appointment], AppointmentRepository):
    """SQLAlchemy implementation of the AppointmentRepository interface"""

    def __init__(self, db_session: Session):
        super().__init__(db_session, AppointmentModel)

    def _to_model(self, entity: Appointment) -> AppointmentModel:
        """Convert Appointment domain entity to AppointmentModel"""
        return AppointmentModel(
            id=entity.id,
            patient_id=entity.patient_id,
            start_time=entity.start_time,
            end_time=entity.end_time,
            appointment_type=entity.appointment_type,
            status=entity.status,
            notes=entity.notes,
            virtual=entity.virtual,
            location=entity.location,
            # Audit fields would be set by middleware in a real application
            created_by="system",
            updated_by="system"
        )

    def _to_entity(self, model: AppointmentModel) -> Appointment:
        """Convert AppointmentModel to Appointment domain entity"""
        return Appointment(
            id=model.id,
            patient_id=model.patient_id,
            start_time=model.start_time,
            end_time=model.end_time,
            appointment_type=model.appointment_type,
            status=model.status,
            notes=model.notes,
            virtual=model.virtual,
            location=model.location
        )

    def get_for_patient(self, patient_id: UUID) -> List[Appointment]:
        """Get all appointments for a patient"""
        models = self.db.query(AppointmentModel) \
            .filter(AppointmentModel.patient_id == patient_id) \
            .order_by(AppointmentModel.start_time.desc()) \
            .all()

        return [self._to_entity(model) for model in models]

    def get_in_time_range(
        self,
        start_time: datetime,
        end_time: datetime,
        status: Optional[List[AppointmentStatus]] = None
    ) -> List[Appointment]:
        """Get appointments in a time range with optional status filter"""
        query = self.db.query(AppointmentModel).filter(
            or_(
                # Appointment starts during the range
                and_(
                    AppointmentModel.start_time >= start_time,
                    AppointmentModel.start_time < end_time
                ),
                # Appointment ends during the range
                and_(
                    AppointmentModel.end_time > start_time,
                    AppointmentModel.end_time <= end_time
                ),
                # Appointment spans the entire range
                and_(
                    AppointmentModel.start_time <= start_time,
                    AppointmentModel.end_time >= end_time
                )
            )
        )

        # Apply status filter if provided
        if status:
            query = query.filter(AppointmentModel.status.in_([s for s in status]))

        # Order by start time
        query = query.order_by(AppointmentModel.start_time)

        # Execute query and convert to domain entities
        models = query.all()
        return [self._to_entity(model) for model in models]
```python

### 8.3 Clinical Note Repository Implementation

```python
# app/data/repositories/clinical_note_repository.py
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.data.models.clinical_note import ClinicalNoteModel
from app.data.repositories.base_repository import BaseRepository
from app.domain.entities.clinical_note import ClinicalNote, NoteType
from app.domain.interfaces.clinical_note_repository import ClinicalNoteRepository


class SQLAlchemyClinicalNoteRepository(BaseRepository[ClinicalNoteModel, ClinicalNote], ClinicalNoteRepository):
    """SQLAlchemy implementation of the ClinicalNoteRepository interface"""

    def __init__(self, db_session: Session):
        super().__init__(db_session, ClinicalNoteModel)

    def _to_model(self, entity: ClinicalNote) -> ClinicalNoteModel:
        """Convert ClinicalNote domain entity to ClinicalNoteModel"""
        return ClinicalNoteModel(
            id=entity.id,
            patient_id=entity.patient_id,
            appointment_id=entity.appointment_id,
            author_id=entity.author_id,
            content=entity.content,
            note_type=entity.note_type,
            version=entity.version,
            previous_versions=entity.previous_versions,
            # Audit fields would be set by middleware in a real application
            created_by="system",
            updated_by="system"
        )

    def _to_entity(self, model: ClinicalNoteModel) -> ClinicalNote:
        """Convert ClinicalNoteModel to ClinicalNote domain entity"""
        return ClinicalNote(
            id=model.id,
            patient_id=model.patient_id,
            content=model.content,
            note_type=model.note_type,
            author_id=model.author_id,
            appointment_id=model.appointment_id,
            created_at=model.created_at,
            version=model.version,
            previous_versions=model.previous_versions
        )

    def get_for_patient(self, patient_id: UUID) -> List[ClinicalNote]:
        """Get all clinical notes for a patient"""
        models = self.db.query(ClinicalNoteModel) \
            .filter(ClinicalNoteModel.patient_id == patient_id) \
            .order_by(ClinicalNoteModel.created_at.desc()) \
            .all()

        return [self._to_entity(model) for model in models]

    def get_for_appointment(self, appointment_id: UUID) -> List[ClinicalNote]:
        """Get all clinical notes for an appointment"""
        models = self.db.query(ClinicalNoteModel) \
            .filter(ClinicalNoteModel.appointment_id == appointment_id) \
            .order_by(ClinicalNoteModel.created_at.desc()) \
            .all()

        return [self._to_entity(model) for model in models]

    def get_latest_by_type(self, patient_id: UUID, note_type: NoteType) -> Optional[ClinicalNote]:
        """Get the most recent clinical note of a specific type"""
        model = self.db.query(ClinicalNoteModel) \
            .filter(
                ClinicalNoteModel.patient_id == patient_id,
                ClinicalNoteModel.note_type == note_type
            ) \
            .order_by(ClinicalNoteModel.created_at.desc()) \
            .first()

        return self._to_entity(model) if model else None
```python

### 8.4 Medication Repository Implementation

```python
# app/data/repositories/medication_repository.py
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.data.models.medication import MedicationModel
from app.data.repositories.base_repository import BaseRepository
from app.domain.entities.medication import Medication, MedicationStatus
from app.domain.interfaces.medication_repository import MedicationRepository


class SQLAlchemyMedicationRepository(BaseRepository[MedicationModel, Medication], MedicationRepository):
    """SQLAlchemy implementation of the MedicationRepository interface"""

    def __init__(self, db_session: Session):
        super().__init__(db_session, MedicationModel)

    def _to_model(self, entity: Medication) -> MedicationModel:
        """Convert Medication domain entity to MedicationModel"""
        return MedicationModel(
            id=entity.id,
            patient_id=entity.patient_id,
            name=entity.name,
            dosage=entity.dosage,
            frequency=entity.frequency,
            prescriber_id=entity.prescriber_id,
            instructions=entity.instructions,
            start_date=entity.start_date,
            end_date=entity.end_date,
            status=entity.status,
            reason=entity.reason,
            # Audit fields would be set by middleware in a real application
            created_by="system",
            updated_by="system"
        )

    def _to_entity(self, model: MedicationModel) -> Medication:
        """Convert MedicationModel to Medication domain entity"""
        return Medication(
            id=model.id,
            patient_id=model.patient_id,
            name=model.name,
            dosage=model.dosage,
            frequency=model.frequency,
            prescriber_id=model.prescriber_id,
            instructions=model.instructions,
            start_date=model.start_date,
            end_date=model.end_date,
            status=model.status,
            reason=model.reason
        )

    def get_active_medications(self, patient_id: UUID) -> List[Medication]:
        """Get all active medications for a patient"""
        models = self.db.query(MedicationModel) \
            .filter(
                MedicationModel.patient_id == patient_id,
                MedicationModel.status == MedicationStatus.ACTIVE
            ) \
            .order_by(MedicationModel.name) \
            .all()

        return [self._to_entity(model) for model in models]

    def get_medication_history(self, patient_id: UUID) -> List[Medication]:
        """Get full medication history for a patient"""
        models = self.db.query(MedicationModel) \
            .filter(MedicationModel.patient_id == patient_id) \
            .order_by(MedicationModel.start_date.desc()) \
            .all()

        return [self._to_entity(model) for model in models]
```python

## 9. Transaction Management

A key aspect of the Data Layer is handling transactions properly to ensure data consistency, especially important for HIPAA compliance.

```python
# app/data/repositories/unit_of_work.py
from contextlib import contextmanager
from typing import Generator, Optional

from sqlalchemy.orm import Session

from app.data.config.database import SessionLocal
from app.data.repositories.patient_repository import SQLAlchemyPatientRepository
from app.data.repositories.appointment_repository import SQLAlchemyAppointmentRepository
from app.data.repositories.clinical_note_repository import SQLAlchemyClinicalNoteRepository
from app.data.repositories.medication_repository import SQLAlchemyMedicationRepository


class UnitOfWork:
    """
    Implements the Unit of Work pattern to manage database transactions.
    Provides a consistent interface to all repositories.
    """
    def __init__(self, session: Optional[Session] = None):
        self.session = session or SessionLocal()

        # Create repositories
        self.patients = SQLAlchemyPatientRepository(self.session)
        self.appointments = SQLAlchemyAppointmentRepository(self.session)
        self.clinical_notes = SQLAlchemyClinicalNoteRepository(self.session)
        self.medications = SQLAlchemyMedicationRepository(self.session)

    def commit(self) -> None:
        """Commit the current transaction"""
        self.session.commit()

    def rollback(self) -> None:
        """Rollback the current transaction"""
        self.session.rollback()

    def close(self) -> None:
        """Close the session"""
        self.session.close()


@contextmanager
def get_unit_of_work() -> Generator[UnitOfWork, None, None]:
    """
    Context manager for UnitOfWork.
    Ensures proper transaction handling with automatic rollback on errors.
    """
    uow = UnitOfWork()
    try:
        yield uow
        uow.commit()
    except:
        uow.rollback()
        raise
    finally:
        uow.close()
```python

## 10. Data Layer Security and HIPAA Compliance

HIPAA compliance requires careful handling of Protected Health Information (PHI). The Data Layer implements several security measures:

### 10.1 Encryption at Rest

```python
# app/data/config/encryption.py
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

# Load encryption key from environment or generate one
# In production, this would come from a secure secret manager
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # For development only - in production, always use a stored key
    salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    ENCRYPTION_KEY = base64.urlsafe_b64encode(kdf.derive(b"development-only-key"))

# Create Fernet cipher for symmetric encryption
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive PHI before storing in database"""
    if not data:
        return data
    return cipher.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive PHI when retrieving from database"""
    if not encrypted_data:
        return encrypted_data
    return cipher.decrypt(encrypted_data.encode()).decode()
```python

### 10.2 Data Access Auditing

```python
# app/data/config/audit.py
import json
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

class DataAccessAudit:
    """
    Audits all data access operations for HIPAA compliance.
    Records who accessed what data and when.
    """
    @staticmethod
    def record_access(
        db: Session,
        user_id: UUID,
        entity_type: str,
        entity_id: UUID,
        action: str,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Record a data access event

        Args:
            db: Database session
            user_id: ID of user performing the action
            entity_type: Type of entity being accessed (Patient, Appointment, etc.)
            entity_id: ID of the entity being accessed
            action: Type of access (view, create, update, delete)
            details: Additional details about the access
        """
        from app.data.models.audit import DataAccessAuditModel

        audit_record = DataAccessAuditModel(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            timestamp=datetime.utcnow(),
            details=json.dumps(details) if details else None,
            # These would be set by middleware in a real application
            created_by=str(user_id),
            updated_by=str(user_id)
        )

        db.add(audit_record)
        db.flush()
```
