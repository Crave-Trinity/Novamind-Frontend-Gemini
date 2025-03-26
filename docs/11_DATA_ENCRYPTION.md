# NOVAMIND: Data Encryption Strategies

## 1. Overview

Data encryption is a cornerstone of our HIPAA-compliant psychiatry platform. This guide outlines the comprehensive encryption strategy that protects patient data at rest, in transit, and during processing, with a focus on field-level encryption for sensitive PHI.

## 2. HIPAA Requirements for Encryption

The HIPAA Security Rule (§ 164.312(a)(2)(iv) and § 164.312(e)(2)(ii)) establishes encryption as an "addressable" implementation specification:

> "Implement a mechanism to encrypt and decrypt electronic protected health information."

While addressable, encryption is effectively required for any modern healthcare application to demonstrate compliance with HIPAA's requirement to implement "reasonable and appropriate" safeguards.

## 3. Multi-Layered Encryption Architecture

NOVAMIND implements a defense-in-depth encryption strategy with multiple layers:

1. **Transport Layer Security**: HTTPS/TLS 1.3 for all communications
1. **Database Encryption**: Transparent Data Encryption (TDE) for the entire database
1. **Field-Level Encryption**: Selective encryption of sensitive PHI fields
1. **Encryption Key Management**: AWS KMS for secure key storage and rotation
1. **Client-Side Encryption**: Additional encryption for highly sensitive data

## 4. Transport Layer Security

### 4.1 HTTPS Configuration

```python
# app/main.py
from fastapi import FastAPI
import uvicorn

app = FastAPI()

# Include API routers and other setup...

if __name__ == "__main__":
    # Development-only direct execution
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="./certs/key.pem",
        ssl_certfile="./certs/cert.pem",
        ssl_ca_certs="./certs/ca.pem",
        ssl_ciphers="TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256",
        ssl_version=2,  # TLS 1.3
    )
```python

### 4.2 Secure Cookies Configuration

```python
# app/presentation/api/dependencies/auth.py
from fastapi import Response

# Set secure cookie
def set_auth_cookie(response: Response, token: str):
    """Set secure HTTP-only cookie with JWT token"""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # Only send over HTTPS
        samesite="strict",  # Protect against CSRF
        max_age=1800,  # 30 minutes
        expires=1800,
        path="/",
    )
```python

## 5. Database Encryption

### 5.1 PostgreSQL Database Configuration

```python
# app/infrastructure/database/base.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config.settings import get_settings

settings = get_settings()

# Configure database connection with SSL
DATABASE_URL = settings.DATABASE_URL
ssl_args = {
    "sslmode": "require",
    "sslrootcert": settings.DB_CA_CERT_PATH,
    "sslcert": settings.DB_CLIENT_CERT_PATH,
    "sslkey": settings.DB_CLIENT_KEY_PATH,
}

engine = create_async_engine(
    DATABASE_URL,
    connect_args=ssl_args,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
)

# Create session factory
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Declarative base for models
Base = declarative_base()

# Dependency for getting DB session
async def get_db():
    """Dependency for getting DB session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
```python

### 5.2 RDS Configuration with AWS

```python
# Infrastructure as Code example (Terraform)
resource "aws_db_instance" "novamind_db" {
  allocated_storage       = 100
  storage_type            = "gp3"
  engine                  = "postgres"
  engine_version          = "14.5"
  instance_class          = "db.m6g.large"
  db_name                 = "novamind"
  username                = "novamind_app"
  password                = var.db_password
  parameter_group_name    = aws_db_parameter_group.postgres14-hipaa.name
  db_subnet_group_name    = aws_db_subnet_group.private.name
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
  storage_encrypted       = true                  # Enable TDE
  kms_key_id              = aws_kms_key.db_key.arn # Use custom KMS key
  backup_retention_period = 35                    # HIPAA requires long retention
  copy_tags_to_snapshot   = true
  deletion_protection     = true
  multi_az                = true                  # High availability
  monitoring_interval     = 60
  performance_insights_enabled = true
  skip_final_snapshot     = false

  # Enable TLS/SSL
  iam_database_authentication_enabled = true
  enabled_cloudwatch_logs_exports     = ["postgresql", "upgrade"]
}
```python

## 6. Field-Level Encryption

### 6.1 Encryption Service

```python
# app/infrastructure/services/encryption_service.py
import base64
import os
from typing import Any, Dict, List, Optional, Union

import boto3
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.config.settings import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class EncryptionService:
    """Service for field-level encryption of sensitive data"""

    def __init__(self):
        self.use_kms = settings.USE_AWS_KMS

        if self.use_kms:
            # Initialize AWS KMS client
            self.kms_client = boto3.client(
                'kms',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            self.data_key_id = settings.KMS_DATA_KEY_ID
        else:
            # Local encryption key for development
            salt = base64.b64decode(settings.ENCRYPTION_SALT)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(
                kdf.derive(settings.ENCRYPTION_MASTER_KEY.encode())
            )
            self.cipher = Fernet(key)

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext data

        Args:
            plaintext: String to encrypt

        Returns:
            Base64-encoded encrypted string
        """
        if not plaintext:
            return plaintext

        try:
            if self.use_kms:
                # Encrypt with AWS KMS
                response = self.kms_client.encrypt(
                    KeyId=self.data_key_id,
                    Plaintext=plaintext.encode('utf-8')
                )
                ciphertext = base64.b64encode(response['CiphertextBlob']).decode('utf-8')
            else:
                # Encrypt with local Fernet key
                ciphertext = self.cipher.encrypt(plaintext.encode('utf-8')).decode('utf-8')

            return ciphertext

        except Exception as e:
            logger.error(f"Encryption error: {str(e)}")
            raise

    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt ciphertext data

        Args:
            ciphertext: Base64-encoded encrypted string

        Returns:
            Decrypted plaintext
        """
        if not ciphertext:
            return ciphertext

        try:
            if self.use_kms:
                # Decrypt with AWS KMS
                response = self.kms_client.decrypt(
                    CiphertextBlob=base64.b64decode(ciphertext)
                )
                plaintext = response['Plaintext'].decode('utf-8')
            else:
                # Decrypt with local Fernet key
                plaintext = self.cipher.decrypt(ciphertext.encode('utf-8')).decode('utf-8')

            return plaintext

        except Exception as e:
            logger.error(f"Decryption error: {str(e)}")
            raise

    def encrypt_dict(self, data: Dict[str, Any], fields_to_encrypt: List[str]) -> Dict[str, Any]:
        """
        Encrypt specified fields in a dictionary

        Args:
            data: Dictionary with data to encrypt
            fields_to_encrypt: List of field names to encrypt

        Returns:
            Dictionary with encrypted fields
        """
        if not data:
            return data

        encrypted_data = data.copy()

        for field in fields_to_encrypt:
            if field in encrypted_data and encrypted_data[field]:
                # Only encrypt strings
                if isinstance(encrypted_data[field], str):
                    encrypted_data[field] = self.encrypt(encrypted_data[field])

        return encrypted_data

    def decrypt_dict(self, data: Dict[str, Any], fields_to_decrypt: List[str]) -> Dict[str, Any]:
        """
        Decrypt specified fields in a dictionary

        Args:
            data: Dictionary with encrypted data
            fields_to_decrypt: List of field names to decrypt

        Returns:
            Dictionary with decrypted fields
        """
        if not data:
            return data

        decrypted_data = data.copy()

        for field in fields_to_decrypt:
            if field in decrypted_data and decrypted_data[field]:
                # Only decrypt strings
                if isinstance(decrypted_data[field], str):
                    decrypted_data[field] = self.decrypt(decrypted_data[field])

        return decrypted_data
```python

### 6.2 SQLAlchemy Type for Encrypted Fields

```python
# app/infrastructure/database/types.py
import json
from typing import Any, Dict, Optional, Type

from sqlalchemy import String, TypeDecorator

from app.infrastructure.services.encryption_service import EncryptionService
from app.utils.logger import get_logger

logger = get_logger(__name__)
encryption_service = EncryptionService()


class EncryptedString(TypeDecorator):
    """SQLAlchemy type for encrypted string fields"""

    impl = String

    def process_bind_parameter(self, value: Optional[str], dialect: Any) -> Optional[str]:
        """Encrypt string before saving to database"""
        if value is not None:
            return encryption_service.encrypt(value)
        return value

    def process_result_value(self, value: Optional[str], dialect: Any) -> Optional[str]:
        """Decrypt string when loading from database"""
        if value is not None:
            return encryption_service.decrypt(value)
        return value


class EncryptedJSON(TypeDecorator):
    """SQLAlchemy type for encrypted JSON fields"""

    impl = String

    def process_bind_parameter(self, value: Optional[Dict[str, Any]], dialect: Any) -> Optional[str]:
        """Encrypt JSON before saving to database"""
        if value is not None:
            json_str = json.dumps(value)
            return encryption_service.encrypt(json_str)
        return value

    def process_result_value(self, value: Optional[str], dialect: Any) -> Optional[Dict[str, Any]]:
        """Decrypt JSON when loading from database"""
        if value is not None:
            json_str = encryption_service.decrypt(value)
            return json.loads(json_str)
        return value
```python

### 6.3 Using Encrypted Fields in Models

```python
# app/infrastructure/database/models/patient.py
import sqlalchemy as sa
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base
from app.infrastructure.database.types import EncryptedString, EncryptedJSON


class Patient(Base):
    """Database model for patients with encrypted PHI fields"""
    __tablename__ = "patients"

    id = sa.Column(sa.String(36), primary_key=True)
    created_at = sa.Column(sa.DateTime, nullable=False)
    updated_at = sa.Column(sa.DateTime, nullable=False)

    # Regular fields (not encrypted)
    status = sa.Column(sa.String(20), nullable=False, index=True)

    # Encrypted PHI fields
    first_name = sa.Column(EncryptedString(100), nullable=False)
    last_name = sa.Column(EncryptedString(100), nullable=False)
    date_of_birth = sa.Column(EncryptedString(10), nullable=False)
    ssn = sa.Column(EncryptedString(11), nullable=True)
    email = sa.Column(EncryptedString(255), nullable=False)
    phone = sa.Column(EncryptedString(20), nullable=False)

    # Encrypted address
    address_line1 = sa.Column(EncryptedString(255), nullable=True)
    address_line2 = sa.Column(EncryptedString(255), nullable=True)
    city = sa.Column(EncryptedString(100), nullable=True)
    state = sa.Column(EncryptedString(50), nullable=True)
    postal_code = sa.Column(EncryptedString(20), nullable=True)
    country = sa.Column(EncryptedString(50), nullable=True)

    # Encrypted JSON field for additional data
    additional_info = sa.Column(EncryptedJSON, nullable=True)

    # Foreign keys and relationships
    user_id = sa.Column(sa.String(36), sa.ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="patient")

    # Searchable fields (duplicated for search)
    search_name = sa.Column(sa.String(255), nullable=False, index=True)
    search_email = sa.Column(sa.String(255), nullable=False, index=True)

    __table_args__ = (
        sa.Index("ix_patients_search", "search_name", "search_email"),
    )
```python

## 7. Encryption Key Management

### 7.1 AWS KMS Configuration

```python
# app/config/settings.py
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # KMS configuration
    USE_AWS_KMS: bool = Field(True, env="USE_AWS_KMS")
    AWS_REGION: str = Field(..., env="AWS_REGION")
    AWS_ACCESS_KEY_ID: str = Field(..., env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = Field(..., env="AWS_SECRET_ACCESS_KEY")
    KMS_DATA_KEY_ID: str = Field(..., env="KMS_DATA_KEY_ID")

    # Local encryption fallback (for development only)
    ENCRYPTION_MASTER_KEY: str = Field("", env="ENCRYPTION_MASTER_KEY")
    ENCRYPTION_SALT: str = Field("", env="ENCRYPTION_SALT")

    # Fields that should be encrypted
    PHI_FIELDS: list = [
        "first_name", "last_name", "date_of_birth", "ssn",
        "email", "phone", "address_line1", "address_line2",
        "city", "state", "postal_code", "country",
        "diagnosis", "medication", "treatment_notes"
    ]

    class Config:
        env_file = ".env"
```python

### 7.2 Key Rotation Strategy

```python
# app/infrastructure/tasks/key_rotation.py
from datetime import datetime
import boto3
from typing import List, Tuple

from app.config.settings import get_settings
from app.infrastructure.database.dependencies import get_db
from app.infrastructure.services.encryption_service import EncryptionService
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def rotate_encryption_keys(old_key_id: str, new_key_id: str):
    """
    Rotate encryption keys by re-encrypting all sensitive data

    Args:
        old_key_id: Current KMS key ID
        new_key_id: New KMS key ID
    """
    try:
        # Initialize AWS KMS client
        kms_client = boto3.client(
            'kms',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        # Initialize encryption service with old key
        old_encryption_service = EncryptionService()

        # Create a new encryption service with new key
        new_encryption_service = EncryptionService()
        new_encryption_service.data_key_id = new_key_id

        # Get database session
        async with get_db() as db:
            # Re-encrypt patient data (process in batches)
            await _reencrypt_patient_data(
                db, old_encryption_service, new_encryption_service
            )

            # Re-encrypt other sensitive data tables...
            # [similar implementation for other tables]

        logger.info(f"Successfully rotated encryption keys from {old_key_id} to {new_key_id}")

    except Exception as e:
        logger.error(f"Failed to rotate encryption keys: {str(e)}")
        raise


async def _reencrypt_patient_data(
    db, old_encryption_service: EncryptionService, new_encryption_service: EncryptionService
):
    """Re-encrypt all patient data with new key"""
    # Query patients in batches
    batch_size = 100
    offset = 0

    while True:
        # Get batch of patients
        query = sa.select(Patient).offset(offset).limit(batch_size)
        result = await db.execute(query)
        patients = result.scalars().all()

        if not patients:
            break

        # Process each patient
        for patient in patients:
            # Re-encrypt all PHI fields
            for field_name in settings.PHI_FIELDS:
                if hasattr(patient, field_name) and getattr(patient, field_name):
                    # Get value using column instrumentation to bypass type converters
                    encrypted_value = getattr(patient.__table__.c, field_name).expression.compile(
                        compile_kwargs={"literal_binds": True}
                    )

                    # Decrypt with old key
                    plaintext = old_encryption_service.decrypt(encrypted_value)

                    # Encrypt with new key
                    new_encrypted = new_encryption_service.encrypt(plaintext)

                    # Update field
                    setattr(patient, field_name, new_encrypted)

            # Update patient
            db.add(patient)

        # Commit batch
        await db.commit()

        # Move to next batch
        offset += batch_size
```python

## 8. Client-Side Encryption

For additional security of highly sensitive data:

```typescript
// frontend/src/utils/encryption.ts
import CryptoJS from 'crypto-js';

/**
 * Encrypt sensitive data on the client side before sending to server
 * Used for highest-sensitivity fields as an additional security layer
 */
export const clientEncrypt = (
  data: string,
  key: string
): string => {
  if (!data) return data;
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypt client-encrypted data
 */
export const clientDecrypt = (
  encryptedData: string,
  key: string
): string => {
  if (!encryptedData) return encryptedData;
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Derive encryption key from user password
 * Uses key stretching with PBKDF2
 */
export const deriveEncryptionKey = (
  password: string,
  salt: string
): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
};
```python

## 9. Searchable Encryption

To enable searching on encrypted fields:

```python
# app/infrastructure/repositories/patient_repository.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.domain.entities.patient import Patient as PatientEntity
from app.infrastructure.database.models.patient import Patient
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PatientRepository:
    """Repository for patient data with searchable encryption"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_patient(self, patient: PatientEntity) -> PatientEntity:
        """Create a new patient record"""
        # Create search fields for encrypted data
        search_name = f"{patient.first_name} {patient.last_name}".lower()
        search_email = patient.email.lower()

        db_patient = Patient(
            id=patient.id,
            created_at=patient.created_at,
            updated_at=patient.updated_at,
            status=patient.status,
            first_name=patient.first_name,
            last_name=patient.last_name,
            date_of_birth=patient.date_of_birth,
            ssn=patient.ssn,
            email=patient.email,
            phone=patient.phone,
            address_line1=patient.address_line1,
            address_line2=patient.address_line2,
            city=patient.city,
            state=patient.state,
            postal_code=patient.postal_code,
            country=patient.country,
            additional_info=patient.additional_info,
            user_id=patient.user_id,
            # Searchable fields (not encrypted)
            search_name=search_name,
            search_email=search_email,
        )

        self.session.add(db_patient)
        await self.session.commit()
        await self.session.refresh(db_patient)

        # Convert to domain entity
        return self._to_entity(db_patient)

    async def search_patients(self, search_term: str) -> List[PatientEntity]:
        """
        Search patients by name or email

        Uses searchable non-encrypted fields for performance
        """
        # Normalize search term
        search_term = f"%{search_term.lower()}%"

        # Search using non-encrypted search fields
        query = select(Patient).where(
            (Patient.search_name.like(search_term)) |
            (Patient.search_email.like(search_term))
        )

        result = await self.session.execute(query)
        patients = result.scalars().all()

        # Convert to domain entities
        return [self._to_entity(p) for p in patients]

    def _to_entity(self, db_patient: Patient) -> PatientEntity:
        """Convert DB model to domain entity"""
        return PatientEntity(
            id=db_patient.id,
            created_at=db_patient.created_at,
            updated_at=db_patient.updated_at,
            status=db_patient.status,
            first_name=db_patient.first_name,
            last_name=db_patient.last_name,
            date_of_birth=db_patient.date_of_birth,
            ssn=db_patient.ssn,
            email=db_patient.email,
            phone=db_patient.phone,
            address_line1=db_patient.address_line1,
            address_line2=db_patient.address_line2,
            city=db_patient.city,
            state=db_patient.state,
            postal_code=db_patient.postal_code,
            country=db_patient.country,
            additional_info=db_patient.additional_info,
            user_id=db_patient.user_id,
        )
```python

## 10. Backup Encryption

```python
# app/infrastructure/tasks/backup.py
import boto3
import json
from datetime import datetime
from sqlalchemy import select
from typing import Dict, List

from app.config.settings import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def backup_encrypted_data():
    """Create encrypted backup of database data"""
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        # Generate backup timestamp
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')

        # Get database session
        async with get_db() as db:
            # Backup patients (with encrypted fields)
            await _backup_table(db, s3_client, "patients", timestamp)

            # Backup other tables
            # [similar implementation for other tables]

        logger.info(f"Successfully created encrypted backup at {timestamp}")

    except Exception as e:
        logger.error(f"Failed to create backup: {str(e)}")
        raise


async def _backup_table(db, s3_client, table_name: str, timestamp: str):
    """Backup a single table to S3"""
    # Map table name to model
    model_map = {
        "patients": Patient,
        # Add other tables
    }

    model = model_map.get(table_name)
    if not model:
        logger.error(f"Unknown table for backup: {table_name}")
        return

    # Query all records (in batches)
    batch_size = 1000
    offset = 0
    batch_num = 0

    while True:
        # Get batch of records
        query = select(model).offset(offset).limit(batch_size)
        result = await db.execute(query)
        records = result.scalars().all()

        if not records:
            break

        # Convert to dictionaries
        data = [
            {c.name: getattr(record, c.name) for c in record.__table__.columns}
            for record in records
        ]

        # Save to S3 (data is already encrypted at field level)
        key = f"backups/{timestamp}/{table_name}/batch_{batch_num}.json"
        s3_client.put_object(
            Bucket=settings.BACKUP_BUCKET,
            Key=key,
            Body=json.dumps(data, default=str),
            ServerSideEncryption='AES256'  # Additional S3 encryption
        )

        # Move to next batch
        offset += batch_size
        batch_num += 1
```python

## 11. Best Practices for HIPAA-Compliant Encryption

1. **Defense in Depth**: Implement multiple layers of encryption
1. **Key Management**: Use a robust key management system (AWS KMS)
1. **Field-Level Encryption**: Encrypt PHI at the field level
1. **Key Rotation**: Regularly rotate encryption keys
1. **No PHI in Logs**: Ensure PHI is never logged, even in encrypted form
1. **Secure Key Storage**: Never store encryption keys alongside encrypted data
1. **Minimal Access**: Restrict access to encryption keys
1. **Encryption in Transit**: Always use TLS 1.3 for data transmission
1. **Backup Encryption**: Ensure all backups are encrypted
1. **Documentation**: Maintain documentation of encryption methods for HIPAA audits

## 12. Conclusion

A comprehensive encryption strategy is essential for HIPAA compliance. NOVAMIND's multi-layered approach ensures that all PHI is protected at rest, in transit, and during processing, providing the highest level of security for our concierge psychiatry platform while maintaining usability and performance.
