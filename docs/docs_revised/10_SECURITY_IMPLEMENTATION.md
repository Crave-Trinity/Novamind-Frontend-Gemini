# SECURITY_IMPLEMENTATION

## Overview

This document provides a comprehensive guide to the security implementation in the NOVAMIND platform, focusing on authentication, authorization, audit logging, and data encryption. All implementations adhere to HIPAA compliance requirements and follow Clean Architecture principles.

## Authentication System

### AWS Cognito Integration

NOVAMIND uses AWS Cognito for secure user authentication with the following HIPAA-compliant configuration:

```python
# app/infrastructure/security/cognito/cognito_service.py
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Optional

from app.core.config import settings
from app.core.utils.logging import logger

class CognitoService:
    """Service for AWS Cognito operations with HIPAA compliance."""
    
    def __init__(
        self,
        user_pool_id: Optional[str] = None,
        client_id: Optional[str] = None,
        region: Optional[str] = None
    ):
        """
        Initialize the Cognito service.
        
        Args:
            user_pool_id: AWS Cognito User Pool ID
            client_id: AWS Cognito App Client ID
            region: AWS Region
        """
        self.user_pool_id = user_pool_id or settings.AWS_COGNITO_USER_POOL_ID
        self.client_id = client_id or settings.AWS_COGNITO_CLIENT_ID
        self.region = region or settings.AWS_REGION
        
        # Initialize Cognito Identity Provider client
        self.client = boto3.client(
            'cognito-idp',
            region_name=self.region,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
    
    async def register_user(self, email: str, password: str, attributes: Dict) -> Dict:
        """
        Register a new user in Cognito.
        
        Args:
            email: User's email address
            password: User's password
            attributes: Additional user attributes
            
        Returns:
            Registration response
        """
        try:
            # Ensure no PHI in attributes
            sanitized_attributes = self._sanitize_attributes(attributes)
            
            # Convert attributes to Cognito format
            user_attributes = [
                {'Name': key, 'Value': value}
                for key, value in sanitized_attributes.items()
            ]
            
            # Add email to attributes
            user_attributes.append({'Name': 'email', 'Value': email})
            
            # Register user
            response = self.client.sign_up(
                ClientId=self.client_id,
                Username=email,
                Password=password,
                UserAttributes=user_attributes
            )
            
            logger.info(f"User registered successfully: {email}")
            return {
                'user_id': response['UserSub'],
                'email': email,
                'status': 'CONFIRMATION_PENDING'
            }
            
        except ClientError as e:
            logger.error(f"Error registering user: {str(e)}")
            raise
    
    async def authenticate(self, email: str, password: str) -> Dict:
        """
        Authenticate a user with Cognito.
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            Authentication response
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )
            
            # Check if MFA is required
            if response.get('ChallengeName') == 'SOFTWARE_TOKEN_MFA':
                logger.info(f"MFA required for user: {email}")
                return {
                    'status': 'MFA_REQUIRED',
                    'session': response['Session']
                }
            
            # Authentication successful
            tokens = response['AuthenticationResult']
            logger.info(f"User authenticated successfully: {email}")
            
            return {
                'status': 'AUTHENTICATED',
                'access_token': tokens['AccessToken'],
                'id_token': tokens['IdToken'],
                'refresh_token': tokens['RefreshToken'],
                'expires_in': tokens['ExpiresIn']
            }
            
        except ClientError as e:
            logger.error(f"Error authenticating user: {str(e)}")
            raise
    
    def _sanitize_attributes(self, attributes: Dict) -> Dict:
        """
        Sanitize user attributes to ensure no PHI is stored.
        
        Args:
            attributes: User attributes
            
        Returns:
            Sanitized attributes
        """
        # Define allowed non-PHI attributes
        allowed_attributes = {
            'given_name', 'family_name', 'preferred_username',
            'locale', 'timezone', 'picture', 'gender'
        }
        
        return {
            key: value for key, value in attributes.items()
            if key in allowed_attributes
        }
```

#### Cognito Configuration for HIPAA Compliance

1. **Multi-Factor Authentication (MFA)**
   - Required for all users
   - Software token (TOTP) preferred over SMS

2. **Password Policy**
   - Minimum length: 12 characters
   - Require uppercase, lowercase, numbers, and special characters
   - Password expiration: 90 days
   - No password reuse (remember last 5 passwords)

3. **Advanced Security Features**
   - Compromised credential checking
   - Adaptive authentication
   - Risk-based challenges

### JWT Token Management

NOVAMIND uses JWT tokens for maintaining authentication state with the following HIPAA-compliant implementation:

```python
# app/infrastructure/security/jwt/token_handler.py
from datetime import datetime, timedelta
from typing import Dict, Optional, Union

import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from app.core.config import settings
from app.core.utils.logging import logger

class JWTHandler:
    """Handler for JWT token operations with HIPAA-compliant settings."""
    
    def __init__(self):
        """Initialize the JWT handler."""
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def create_access_token(
        self, 
        subject: Union[str, Dict], 
        scopes: Optional[list] = None
    ) -> str:
        """
        Create a HIPAA-compliant access token with short expiry time.
        
        Args:
            subject: User identity (typically user_id or email)
            scopes: Optional list of permission scopes
            
        Returns:
            JWT access token
        """
        # Create token data
        now = datetime.utcnow()
        expires = now + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode = {
            'exp': expires.timestamp(),
            'iat': now.timestamp(),
            'sub': str(subject) if not isinstance(subject, dict) else subject,
            'jti': self._generate_jti(),
            'iss': settings.JWT_ISSUER
        }
        
        # Add scopes if provided
        if scopes:
            to_encode['scopes'] = scopes
        
        # Encode token
        encoded_jwt = jwt.encode(
            to_encode, 
            self.secret_key, 
            algorithm=self.algorithm
        )
        
        return encoded_jwt
    
    def decode_token(self, token: str) -> Dict:
        """
        Decode and validate a JWT token.
        
        Args:
            token: JWT token to decode
            
        Returns:
            Decoded token payload
            
        Raises:
            InvalidTokenError: If token is invalid
            ExpiredSignatureError: If token has expired
        """
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={'verify_signature': True}
            )
            
            return payload
            
        except ExpiredSignatureError:
            logger.warning("Token has expired")
            raise
            
        except InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            raise
    
    def create_refresh_token(self, subject: Union[str, Dict]) -> str:
        """
        Create a refresh token with longer expiry time.
        
        Args:
            subject: User identity
            
        Returns:
            JWT refresh token
        """
        now = datetime.utcnow()
        expires = now + timedelta(days=self.refresh_token_expire_days)
        
        to_encode = {
            'exp': expires.timestamp(),
            'iat': now.timestamp(),
            'sub': str(subject) if not isinstance(subject, dict) else subject,
            'jti': self._generate_jti(),
            'iss': settings.JWT_ISSUER,
            'token_type': 'refresh'
        }
        
        encoded_jwt = jwt.encode(
            to_encode, 
            self.secret_key, 
            algorithm=self.algorithm
        )
        
        return encoded_jwt
    
    def _generate_jti(self) -> str:
        """
        Generate a unique JWT ID.
        
        Returns:
            Unique JWT ID
        """
        import uuid
        return str(uuid.uuid4())
```

#### JWT Configuration for HIPAA Compliance

1. **Token Expiration**
   - Access tokens: 15-30 minutes (HIPAA requirement)
   - Refresh tokens: 7 days maximum with rotation

2. **Token Security**
   - RS256 (RSA Signature with SHA-256) algorithm
   - Secure key storage in AWS KMS
   - Token blacklisting for revocation

3. **Token Claims**
   - `iss` (issuer): Identifies the token issuer
   - `sub` (subject): Identifies the user
   - `exp` (expiration time): Token expiry timestamp
   - `jti` (JWT ID): Unique token identifier for revocation
   - `iat` (issued at): Token issuance timestamp

## Role-Based Access Control (RBAC)

NOVAMIND implements a comprehensive RBAC system to control access to resources:

```python
# app/infrastructure/security/rbac/role_manager.py
from typing import Dict, List, Optional, Set

from app.core.config import settings
from app.core.utils.logging import logger
from app.domain.entities.user import User
from app.domain.value_objects.permission import Permission

class RoleManager:
    """Manager for role-based access control."""
    
    def __init__(self):
        """Initialize the role manager."""
        # Define role hierarchy
        self.role_hierarchy = {
            'admin': ['provider', 'staff', 'patient'],
            'provider': ['staff', 'patient'],
            'staff': ['patient'],
            'patient': []
        }
        
        # Define role permissions
        self.role_permissions = {
            'admin': {
                'user:create', 'user:read', 'user:update', 'user:delete',
                'patient:create', 'patient:read', 'patient:update', 'patient:delete',
                'provider:create', 'provider:read', 'provider:update', 'provider:delete',
                'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete',
                'digital_twin:create', 'digital_twin:read', 'digital_twin:update', 'digital_twin:delete',
                'billing:create', 'billing:read', 'billing:update', 'billing:delete',
                'audit:read'
            },
            'provider': {
                'patient:read', 'patient:update',
                'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete',
                'digital_twin:read',
                'clinical_note:create', 'clinical_note:read', 'clinical_note:update',
                'medication:create', 'medication:read', 'medication:update'
            },
            'staff': {
                'patient:read',
                'appointment:create', 'appointment:read', 'appointment:update',
                'billing:create', 'billing:read'
            },
            'patient': {
                'appointment:read',
                'digital_twin:read',
                'clinical_note:read',
                'medication:read'
            }
        }
    
    def get_user_permissions(self, user: User) -> Set[str]:
        """
        Get all permissions for a user based on their role.
        
        Args:
            user: User entity
            
        Returns:
            Set of permission strings
        """
        if not user or not user.role:
            return set()
        
        # Get direct permissions for user's role
        permissions = set(self.role_permissions.get(user.role, set()))
        
        # Add permissions from inherited roles
        for inherited_role in self._get_inherited_roles(user.role):
            permissions.update(self.role_permissions.get(inherited_role, set()))
        
        return permissions
    
    def has_permission(self, user: User, permission: str) -> bool:
        """
        Check if a user has a specific permission.
        
        Args:
            user: User entity
            permission: Permission string to check
            
        Returns:
            True if user has permission, False otherwise
        """
        if not user or not user.role:
            return False
        
        user_permissions = self.get_user_permissions(user)
        
        # Check for exact permission match
        if permission in user_permissions:
            return True
        
        # Check for wildcard permissions
        resource = permission.split(':')[0]
        wildcard_permission = f"{resource}:*"
        
        return wildcard_permission in user_permissions
    
    def _get_inherited_roles(self, role: str) -> List[str]:
        """
        Get all roles inherited by the given role.
        
        Args:
            role: Role name
            
        Returns:
            List of inherited role names
        """
        if role not in self.role_hierarchy:
            return []
        
        inherited_roles = []
        
        # Add direct inherited roles
        for inherited_role in self.role_hierarchy.get(role, []):
            inherited_roles.append(inherited_role)
            
            # Add transitively inherited roles
            inherited_roles.extend(self._get_inherited_roles(inherited_role))
        
        return inherited_roles
```

### RBAC Implementation Details

1. **Role Hierarchy**
   - Admin: Full system access
   - Provider: Clinical access to patient data
   - Staff: Administrative access
   - Patient: Limited access to own data

2. **Permission Structure**
   - Format: `resource:action`
   - Examples: `patient:read`, `appointment:create`
   - Wildcards: `resource:*` for all actions on a resource

3. **Access Control Enforcement**
   - API endpoint protection with permission checks
   - Data filtering based on user role
   - Audit logging of access attempts

## Audit Logging

NOVAMIND implements comprehensive audit logging for HIPAA compliance:

```python
# app/core/utils/audit.py
import json
import time
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.utils.logging import logger
from app.infrastructure.persistence.models.audit_log_model import AuditLogModel

def log_audit(
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: Optional[Dict[str, Any]] = None,
    db_session: Optional[Session] = None
) -> None:
    """
    Log audit event for HIPAA compliance.
    
    Args:
        user_id: ID of the user performing the action
        action: Action being performed (e.g., "view", "create", "update", "delete")
        resource_type: Type of resource being accessed (e.g., "patient", "appointment")
        resource_id: ID of the resource being accessed
        details: Additional details about the action
        db_session: Optional database session for persistence
    """
    timestamp = datetime.utcnow()
    audit_id = str(uuid.uuid4())
    
    # Sanitize details to remove PHI
    sanitized_details = _sanitize_details(details or {})
    
    audit_data = {
        "id": audit_id,
        "timestamp": timestamp.isoformat(),
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": sanitized_details,
        "ip_address": None,  # Will be set by middleware
        "user_agent": None,  # Will be set by middleware
    }
    
    # Log to file
    logger.info(f"AUDIT: {json.dumps(audit_data)}")
    
    # Persist to database if session provided
    if db_session:
        try:
            audit_log = AuditLogModel(
                id=audit_id,
                timestamp=timestamp,
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=sanitized_details,
                ip_address=None,
                user_agent=None
            )
            
            db_session.add(audit_log)
            db_session.commit()
        except Exception as e:
            logger.error(f"Failed to persist audit log: {str(e)}")
            db_session.rollback()

def _sanitize_details(details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize audit details to remove PHI.
    
    Args:
        details: Audit details
        
    Returns:
        Sanitized details
    """
    # Define PHI fields to redact
    phi_fields = {
        'name', 'first_name', 'last_name', 'email', 'phone', 'address',
        'dob', 'date_of_birth', 'ssn', 'social_security_number',
        'medical_record_number', 'mrn'
    }
    
    sanitized = {}
    
    for key, value in details.items():
        if key.lower() in phi_fields:
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = _sanitize_details(value)
        elif isinstance(value, list):
            sanitized[key] = [
                _sanitize_details(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    
    return sanitized
```

### Audit Logging Implementation Details

1. **Logged Events**
   - Authentication events (login, logout, failed attempts)
   - Data access events (view, create, update, delete)
   - Administrative actions (user management, configuration changes)
   - Security events (permission changes, role assignments)

2. **Logged Information**
   - Timestamp (UTC)
   - User ID and role
   - Action performed
   - Resource type and ID
   - IP address and user agent
   - Success/failure status

3. **Storage and Retention**
   - Database storage for structured querying
   - File-based logging for backup
   - 6-year retention period (HIPAA requirement)
   - Tamper-proof storage with integrity checks

## Data Encryption

NOVAMIND implements comprehensive data encryption to protect PHI:

```python
# app/core/utils/encryption.py
import base64
import os
from typing import Any, Dict, List, Union

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.core.config import settings
from app.core.utils.logging import logger

class EncryptionService:
    """Service for encrypting and decrypting sensitive data."""
    
    def __init__(self):
        """Initialize encryption service with key from environment."""
        # Get encryption key from environment or generate one
        encryption_key = settings.ENCRYPTION_KEY
        
        if encryption_key:
            self.key = base64.urlsafe_b64decode(encryption_key)
        else:
            # Generate a key from password and salt
            password = settings.ENCRYPTION_PASSWORD.encode()
            salt = settings.ENCRYPTION_SALT.encode()
            
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
        """
        Encrypt data and return base64-encoded string.
        
        Args:
            data: Data to encrypt
            
        Returns:
            Base64-encoded encrypted data
        """
        if isinstance(data, str):
            data = data.encode()
        
        encrypted_data = self.cipher.encrypt(data)
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt(self, encrypted_data: Union[str, bytes]) -> str:
        """
        Decrypt base64-encoded encrypted data.
        
        Args:
            encrypted_data: Encrypted data to decrypt
            
        Returns:
            Decrypted data as string
        """
        if isinstance(encrypted_data, str):
            encrypted_data = base64.urlsafe_b64decode(encrypted_data)
        
        decrypted_data = self.cipher.decrypt(encrypted_data)
        return decrypted_data.decode()
    
    def encrypt_dict(self, data: Dict[str, Any], keys_to_encrypt: List[str]) -> Dict[str, Any]:
        """
        Encrypt specific keys in a dictionary.
        
        Args:
            data: Dictionary to encrypt
            keys_to_encrypt: Keys to encrypt
            
        Returns:
            Dictionary with encrypted values
        """
        result = {}
        
        for key, value in data.items():
            if key in keys_to_encrypt and value is not None:
                if isinstance(value, (str, bytes)):
                    result[key] = self.encrypt(value)
                else:
                    # Convert to string if not already
                    result[key] = self.encrypt(str(value))
            elif isinstance(value, dict):
                result[key] = self.encrypt_dict(value, keys_to_encrypt)
            else:
                result[key] = value
        
        return result
    
    def decrypt_dict(self, data: Dict[str, Any], keys_to_decrypt: List[str]) -> Dict[str, Any]:
        """
        Decrypt specific keys in a dictionary.
        
        Args:
            data: Dictionary to decrypt
            keys_to_decrypt: Keys to decrypt
            
        Returns:
            Dictionary with decrypted values
        """
        result = {}
        
        for key, value in data.items():
            if key in keys_to_decrypt and value is not None and isinstance(value, str):
                try:
                    result[key] = self.decrypt(value)
                except Exception as e:
                    logger.warning(f"Failed to decrypt key {key}: {str(e)}")
                    result[key] = value
            elif isinstance(value, dict):
                result[key] = self.decrypt_dict(value, keys_to_decrypt)
            else:
                result[key] = value
        
        return result

# Create singleton instance
encryption_service = EncryptionService()
```

### Encryption Implementation Details

1. **Data at Rest**
   - Field-level encryption for PHI in database
   - Transparent Data Encryption (TDE) for database files
   - Encrypted backups with separate key management

2. **Data in Transit**
   - TLS 1.3 for all communications
   - Certificate pinning for API clients
   - Secure WebSockets for real-time data

3. **Key Management**
   - AWS KMS for key storage and rotation
   - Separate keys for different data categories
   - Automatic key rotation every 90 days

## API Security

NOVAMIND implements comprehensive API security measures:

```python
# app/presentation/middleware/security_middleware.py
import time
from typing import Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.utils.logging import logger

def setup_security_middleware(app: FastAPI) -> None:
    """Configure security middleware for the application."""
    # CORS middleware
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Security headers middleware
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Request logging middleware
    app.add_middleware(RequestLoggingMiddleware)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        
        return response
```

### API Security Implementation Details

1. **Authentication**
   - JWT-based authentication for all API endpoints
   - Token validation and signature verification
   - Short-lived tokens with refresh mechanism

2. **Authorization**
   - Role-based access control for all endpoints
   - Resource-level permissions
   - Data filtering based on user role

3. **Input Validation**
   - Strict schema validation for all requests
   - Input sanitization to prevent injection attacks
   - Rate limiting to prevent abuse

4. **Security Headers**
   - Content Security Policy (CSP)
   - HTTP Strict Transport Security (HSTS)
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection

## Implementation Guidelines

### Security Best Practices

1. **Defense in Depth**
   - Implement multiple layers of security controls
   - Assume breach mentality in security design
   - Regular security testing and validation

2. **Least Privilege**
   - Grant minimal permissions needed for each role
   - Regularly review and audit permissions
   - Time-bound elevated access for administrative tasks

3. **Secure Development**
   - Security code reviews for all changes
   - Static application security testing (SAST)
   - Dynamic application security testing (DAST)
   - Regular dependency scanning for vulnerabilities

### HIPAA Compliance Checklist

1. **Administrative Safeguards**
   - Security management process
   - Assigned security responsibility
   - Workforce security
   - Information access management
   - Security awareness and training
   - Security incident procedures
   - Contingency plan
   - Evaluation
   - Business associate contracts

2. **Physical Safeguards**
   - Facility access controls
   - Workstation use
   - Workstation security
   - Device and media controls

3. **Technical Safeguards**
   - Access control
   - Audit controls
   - Integrity controls
   - Transmission security
   - Authentication

### Security Monitoring and Incident Response

1. **Monitoring**
   - Real-time monitoring of authentication events
   - Anomaly detection for unusual access patterns
   - Regular review of audit logs
   - Automated alerts for security events

2. **Incident Response**
   - Documented incident response plan
   - Defined roles and responsibilities
   - Regular tabletop exercises
   - Post-incident analysis and improvement

3. **Breach Notification**
   - Documented breach notification procedures
   - Risk assessment process
   - Notification templates and communication plan
   - Documentation and reporting requirements
