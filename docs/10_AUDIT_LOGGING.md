# NOVAMIND: Audit Logging Implementation

## 1. Overview

Comprehensive audit logging is a critical component of HIPAA compliance in healthcare applications. NOVAMIND implements a robust audit logging system that tracks all access to PHI, system changes, authentication events, and user activities.

## 2. Audit Requirements for HIPAA Compliance

### 2.1 HIPAA Audit Requirements

According to HIPAA Security Rule § 164.312(b):

> "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information."

The audit logging system must track:

- **Access Events**: All access to PHI
- **Authorization Events**: Login attempts, role changes
- **Security Events**: Configuration changes, failed logins
- **User Events**: Account creation, modification, deletion
- **System Events**: Startup, shutdown, updates

### 2.2 Audit Data Retention

- Retention period: 6 years minimum
- Immutable storage (tamper-proof)
- Encrypted at rest and in transit

## 3. Audit Architecture

NOVAMIND implements a multi-layered audit logging strategy:

1. **Application Level**: Detailed events within the application
2. **Database Level**: Data access and changes
3. **Infrastructure Level**: Network and system events
4. **Storage Level**: S3/CloudWatch secure storage

## 4. Core Components

### 4.1 Audit Domain Model

```python
# app/domain/entities/audit.py
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import uuid


class AuditEventType(Enum):
    """Types of events that can be audited"""
    # PHI access events
    PHI_ACCESS = "phi_access"
    PHI_CREATE = "phi_create"
    PHI_UPDATE = "phi_update"
    PHI_DELETE = "phi_delete"
    
    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    PASSWORD_RESET_REQUEST = "password_reset_request"
    PASSWORD_RESET_COMPLETE = "password_reset_complete"
    MFA_SUCCESS = "mfa_success"
    MFA_FAILURE = "mfa_failure"
    
    # Authorization events
    ROLE_ASSIGNED = "role_assigned"
    ROLE_REMOVED = "role_removed"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_DENIED = "permission_denied"
    
    # User management events
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DISABLED = "user_disabled"
    USER_ENABLED = "user_enabled"
    
    # System events
    SYSTEM_STARTUP = "system_startup"
    SYSTEM_SHUTDOWN = "system_shutdown"
    SYSTEM_CONFIGURATION_CHANGE = "system_configuration_change"
    
    # API events
    API_REQUEST = "api_request"
    API_RESPONSE = "api_response"
    
    # Data export events
    DATA_EXPORT = "data_export"
    REPORT_GENERATED = "report_generated"


class AuditEvent(BaseModel):
    """Represents an auditable event in the system"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: AuditEventType
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: str
    status: str  # 'success', 'failure', 'error'
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        from_attributes = True
```

### 4.2 Audit Database Model

```python
# app/infrastructure/database/models/audit.py
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class AuditLog(Base):
    """Database model for audit logs"""
    __tablename__ = "audit_logs"
    
    id = sa.Column(sa.String(36), primary_key=True)
    timestamp = sa.Column(sa.DateTime, nullable=False, index=True)
    event_type = sa.Column(sa.String(50), nullable=False, index=True)
    user_id = sa.Column(sa.String(36), sa.ForeignKey("users.id"), nullable=True, index=True)
    ip_address = sa.Column(sa.String(40), nullable=True)
    user_agent = sa.Column(sa.String(500), nullable=True)
    resource_type = sa.Column(sa.String(50), nullable=True, index=True)
    resource_id = sa.Column(sa.String(36), nullable=True, index=True)
    action = sa.Column(sa.String(100), nullable=False)
    status = sa.Column(sa.String(20), nullable=False, index=True)
    metadata = sa.Column(JSONB, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    __table_args__ = (
        # Index for efficient access pattern queries
        sa.Index("ix_audit_logs_user_timestamp", "user_id", "timestamp"),
        sa.Index("ix_audit_logs_resource_timestamp", "resource_type", "resource_id", "timestamp"),
        sa.Index("ix_audit_logs_event_type_timestamp", "event_type", "timestamp"),
    )
```

## 5. Audit Service Implementation

### 5.1 Audit Logger Service

```python
# app/infrastructure/services/audit_service.py
import json
from datetime import datetime
import uuid
from typing import Any, Dict, List, Optional, Union

from fastapi import Depends, Request
from pydantic import BaseModel
import boto3
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.config.settings import get_settings
from app.domain.entities.audit import AuditEvent, AuditEventType
from app.infrastructure.database.dependencies import get_db
from app.infrastructure.database.models.audit import AuditLog
from app.utils.logger import get_logger
from app.utils.sanitize import sanitize_phi

settings = get_settings()
logger = get_logger(__name__)


class AuditService:
    """Service for creating and managing audit logs"""
    
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
        
        # Optional AWS CloudWatch integration for redundant logging
        if settings.CLOUDWATCH_ENABLED:
            self.cloudwatch = boto3.client(
                'logs',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            self.log_group = settings.CLOUDWATCH_LOG_GROUP
            self.log_stream = f"novamind-audit-{datetime.utcnow().strftime('%Y-%m-%d')}"
        else:
            self.cloudwatch = None
    
    async def log_event(
        self,
        event_type: AuditEventType,
        action: str,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: str = "success",
        metadata: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None,
    ) -> AuditEvent:
        """
        Log an audit event
        
        Args:
            event_type: Type of audit event
            action: Description of the action
            user_id: ID of user who performed the action
            resource_type: Type of resource affected
            resource_id: ID of resource affected
            status: Outcome status (success, failure, error)
            metadata: Additional data about the event
            request: FastAPI request object (for extracting IP, user agent)
            
        Returns:
            Created audit event
        """
        try:
            # Extract request details if available
            ip_address = None
            user_agent = None
            if request:
                ip_address = request.client.host if request.client else None
                user_agent = request.headers.get("user-agent")
            
            # Sanitize metadata to remove PHI
            safe_metadata = {}
            if metadata:
                safe_metadata = sanitize_phi(metadata, settings.PHI_FIELDS)
            
            # Create audit event
            event = AuditEvent(
                id=str(uuid.uuid4()),
                timestamp=datetime.utcnow(),
                event_type=event_type,
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                resource_type=resource_type,
                resource_id=resource_id,
                action=action,
                status=status,
                metadata=safe_metadata,
            )
            
            # Save to database
            db_event = AuditLog(
                id=event.id,
                timestamp=event.timestamp,
                event_type=event.event_type.value,
                user_id=event.user_id,
                ip_address=event.ip_address,
                user_agent=event.user_agent,
                resource_type=event.resource_type,
                resource_id=event.resource_id,
                action=event.action,
                status=event.status,
                metadata=event.metadata,
            )
            
            self.db.add(db_event)
            await self.db.commit()
            
            # Also log to CloudWatch if enabled
            if self.cloudwatch:
                self._log_to_cloudwatch(event)
            
            return event
            
        except Exception as e:
            # Fallback to regular logging if audit logging fails
            logger.error(
                f"Failed to create audit log: {str(e)}",
                extra={
                    "event_type": event_type.value,
                    "action": action,
                    "user_id": user_id,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                }
            )
            # Re-raise to allow calling code to handle the error
            raise
    
    def _log_to_cloudwatch(self, event: AuditEvent):
        """Log an event to AWS CloudWatch (non-async backup)"""
        try:
            # Ensure log stream exists
            try:
                self.cloudwatch.create_log_stream(
                    logGroupName=self.log_group,
                    logStreamName=self.log_stream
                )
            except self.cloudwatch.exceptions.ResourceAlreadyExistsException:
                pass  # Stream already exists
            
            # Convert event to JSON string
            event_dict = event.dict()
            event_dict["event_type"] = event.event_type.value
            event_json = json.dumps(event_dict)
            
            # Send to CloudWatch
            self.cloudwatch.put_log_events(
                logGroupName=self.log_group,
                logStreamName=self.log_stream,
                logEvents=[
                    {
                        'timestamp': int(event.timestamp.timestamp() * 1000),
                        'message': event_json
                    }
                ]
            )
            
        except Exception as e:
            # Failure to log to CloudWatch should not break the application
            logger.error(f"Failed to log to CloudWatch: {str(e)}")
    
    async def get_audit_logs(
        self,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        event_type: Optional[Union[AuditEventType, str]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[AuditEvent]:
        """
        Query audit logs with filters
        
        Args:
            user_id: Filter by user ID
            resource_type: Filter by resource type
            resource_id: Filter by resource ID
            event_type: Filter by event type
            start_time: Filter by start time
            end_time: Filter by end time
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            List of matching audit events
        """
        query = select(AuditLog)
        
        # Apply filters
        filters = []
        if user_id:
            filters.append(AuditLog.user_id == user_id)
        
        if resource_type:
            filters.append(AuditLog.resource_type == resource_type)
        
        if resource_id:
            filters.append(AuditLog.resource_id == resource_id)
        
        if event_type:
            if isinstance(event_type, AuditEventType):
                filters.append(AuditLog.event_type == event_type.value)
            else:
                filters.append(AuditLog.event_type == event_type)
        
        if start_time:
            filters.append(AuditLog.timestamp >= start_time)
        
        if end_time:
            filters.append(AuditLog.timestamp <= end_time)
        
        # Combine filters and apply pagination
        if filters:
            query = query.where(and_(*filters))
        
        query = query.order_by(AuditLog.timestamp.desc())
        query = query.limit(limit).offset(offset)
        
        # Execute query
        result = await self.db.execute(query)
        audit_logs = result.scalars().all()
        
        # Convert to domain entities
        return [
            AuditEvent(
                id=log.id,
                timestamp=log.timestamp,
                event_type=AuditEventType(log.event_type),
                user_id=log.user_id,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                action=log.action,
                status=log.status,
                metadata=log.metadata or {},
            )
            for log in audit_logs
        ]
```

## 6. Audit Middleware for API Requests

To automatically log all API requests and responses:

```python
# app/infrastructure/middleware/audit_middleware.py
import time
from typing import Callable, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.domain.entities.audit import AuditEventType
from app.infrastructure.services.audit_service import AuditService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware for auditing all API requests"""
    
    def __init__(self, app, audit_service: AuditService):
        super().__init__(app)
        self.audit_service = audit_service
        
        # Paths that should not be audited (to avoid noise)
        self.skip_paths = [
            "/api/healthcheck",
            "/api/docs",
            "/api/redoc",
            "/openapi.json",
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip auditing for excluded paths
        if any(request.url.path.startswith(path) for path in self.skip_paths):
            return await call_next(request)
        
        # Record start time
        start_time = time.time()
        
        # Try to extract user ID from request state
        user_id = None
        if hasattr(request.state, "user") and request.state.user:
            user_id = request.state.user.get("sub")
        
        # Create response and catch exceptions
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception as e:
            logger.error(f"Exception in request: {str(e)}")
            # Let the exception propagate after logging
            raise
        finally:
            # Calculate request duration
            duration_ms = round((time.time() - start_time) * 1000)
            
            # Determine status based on status code
            status = "success" if 200 <= status_code < 400 else "failure"
            
            # Log the request
            try:
                await self.audit_service.log_event(
                    event_type=AuditEventType.API_REQUEST,
                    action=f"{request.method} {request.url.path}",
                    user_id=user_id,
                    status=status,
                    metadata={
                        "status_code": status_code,
                        "duration_ms": duration_ms,
                        "query_params": str(request.query_params),
                        "method": request.method,
                        # Do not log request bodies or headers for HIPAA compliance
                    },
                    request=request
                )
            except Exception as e:
                logger.error(f"Failed to audit request: {str(e)}")
```

## 7. Integrating Audit Logging

### 7.1 Application Startup

```python
# app/main.py
from fastapi import FastAPI, Depends

from app.config.settings import get_settings
from app.domain.entities.audit import AuditEventType
from app.infrastructure.middleware.audit_middleware import AuditMiddleware
from app.infrastructure.services.audit_service import AuditService
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    app = FastAPI(
        title="NOVAMIND API",
        description="HIPAA-compliant concierge psychiatry platform API",
        version="1.0.0",
    )
    
    # Add audit middleware
    @app.on_event("startup")
    async def startup_audit():
        # Get audit service
        audit_service = AuditService()
        
        # Add middleware
        app.add_middleware(
            AuditMiddleware,
            audit_service=audit_service
        )
        
        # Log application startup
        await audit_service.log_event(
            event_type=AuditEventType.SYSTEM_STARTUP,
            action="Application startup",
            status="success",
            metadata={
                "environment": settings.ENVIRONMENT,
                "version": "1.0.0",
            }
        )
    
    # Log application shutdown
    @app.on_event("shutdown")
    async def shutdown_audit():
        audit_service = AuditService()
        await audit_service.log_event(
            event_type=AuditEventType.SYSTEM_SHUTDOWN,
            action="Application shutdown",
            status="success"
        )
    
    # Include API routers
    # ...
    
    return app
```

### 7.2 Examples of Common Audit Logging

#### Patient Record Access

```python
# In patient service or endpoint handler
await audit_service.log_event(
    event_type=AuditEventType.PHI_ACCESS,
    action=f"Viewed patient record",
    user_id=current_user.get("sub"),
    resource_type="patient",
    resource_id=patient_id,
    status="success",
    metadata={
        "view_type": "full_record",
        # Do not include actual PHI in metadata
    },
    request=request
)
```

#### Failed Login Attempt

```python
# In authentication handler
await audit_service.log_event(
    event_type=AuditEventType.LOGIN_FAILURE,
    action="Failed login attempt",
    # User ID may not be available for failed logins
    resource_type="user",
    resource_id=username,  # Just the username, not the password
    status="failure",
    metadata={
        "reason": "Invalid credentials",
        "attempt_number": attempt_count,
    },
    request=request
)
```

## 8. Audit Log Retention and Archiving

For HIPAA compliance, implement a structured retention policy:

```python
# app/infrastructure/tasks/audit_retention.py
import datetime
from typing import List

import boto3
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import get_settings
from app.infrastructure.database.dependencies import get_db
from app.infrastructure.database.models.audit import AuditLog
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def archive_audit_logs(db: AsyncSession = Depends(get_db)):
    """
    Archive audit logs older than the retention period
    
    This moves logs to S3 for long-term HIPAA-compliant storage
    """
    try:
        # Calculate cutoff date (default 90 days for active DB, 6 years total)
        cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(
            days=settings.AUDIT_ACTIVE_RETENTION_DAYS
        )
        
        # Query logs older than cutoff date
        query = select(AuditLog).where(AuditLog.timestamp < cutoff_date)
        result = await db.execute(query)
        old_logs = result.scalars().all()
        
        if not old_logs:
            logger.info("No audit logs to archive")
            return
        
        # Connect to S3
        s3_client = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Process in batches to avoid memory issues
        batch_size = 1000
        for i in range(0, len(old_logs), batch_size):
            batch = old_logs[i:i+batch_size]
            
            # Archive to S3
            archive_date = datetime.datetime.utcnow().strftime('%Y-%m-%d')
            archive_key = f"audit-archives/{archive_date}/batch-{i}.json"
            
            # Convert logs to JSON
            logs_json = json.dumps([
                {
                    "id": log.id,
                    "timestamp": log.timestamp.isoformat(),
                    "event_type": log.event_type,
                    "user_id": log.user_id,
                    "ip_address": log.ip_address,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "action": log.action,
                    "status": log.status,
                    "metadata": log.metadata,
                }
                for log in batch
            ], default=str)
            
            # Upload to S3 with encryption
            s3_client.put_object(
                Bucket=settings.AUDIT_ARCHIVE_BUCKET,
                Key=archive_key,
                Body=logs_json,
                ServerSideEncryption='AES256'
            )
            
            # Delete archived logs
            for log in batch:
                await db.delete(log)
            
            await db.commit()
            
            logger.info(f"Archived {len(batch)} audit logs to S3: {archive_key}")
        
    except Exception as e:
        logger.error(f"Failed to archive audit logs: {str(e)}")
        raise
```

## 9. Audit Log Reporting and Analysis

### 9.1 Audit Report API

```python
# app/presentation/api/v1/endpoints/audit.py
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.domain.entities.rbac import Permission
from app.domain.entities.audit import AuditEvent, AuditEventType
from app.infrastructure.services.audit_service import AuditService
from app.presentation.api.dependencies.auth import requires_permission
from app.presentation.schemas.audit import AuditLogResponse

router = APIRouter()


@router.get(
    "/logs",
    response_model=List[AuditLogResponse],
    status_code=status.HTTP_200_OK,
    description="Get audit logs (requires VIEW_AUDIT_LOG permission)"
)
async def get_audit_logs(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    resource_id: Optional[str] = Query(None, description="Filter by resource ID"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    start_time: Optional[datetime] = Query(None, description="Filter by start time"),
    end_time: Optional[datetime] = Query(None, description="Filter by end time"),
    limit: int = Query(100, description="Maximum number of results"),
    offset: int = Query(0, description="Pagination offset"),
    current_user: dict = Depends(requires_permission(Permission.VIEW_AUDIT_LOG)),
    audit_service: AuditService = Depends(),
):
    """Get audit logs with filters"""
    audit_logs = await audit_service.get_audit_logs(
        user_id=user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        event_type=event_type,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset,
    )
    
    return [AuditLogResponse.from_orm(log) for log in audit_logs]


@router.get(
    "/logs/patient/{patient_id}",
    response_model=List[AuditLogResponse],
    status_code=status.HTTP_200_OK,
    description="Get all access logs for a specific patient"
)
async def get_patient_audit_logs(
    patient_id: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    limit: int = Query(100),
    offset: int = Query(0),
    current_user: dict = Depends(requires_permission(Permission.VIEW_AUDIT_LOG)),
    audit_service: AuditService = Depends(),
):
    """Get all access logs for a specific patient"""
    audit_logs = await audit_service.get_audit_logs(
        resource_type="patient",
        resource_id=patient_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset,
    )
    
    return [AuditLogResponse.from_orm(log) for log in audit_logs]
```

## 10. Best Practices for HIPAA-Compliant Audit Logging

1. **Record Complete Histories**: Log all create, read, update, delete (CRUD) operations on PHI.
2. **Log Failed Access Attempts**: Record failed login attempts and unauthorized access attempts.
3. **Never Log PHI**: Audit logs should reference resource IDs but not include actual PHI.
4. **Immutable Logs**: Ensure logs cannot be modified or deleted by users.
5. **Secure Transmission**: Encrypt logs during transmission to storage.
6. **Secure Storage**: Store logs in encrypted, access-controlled storage.
7. **Regular Reviews**: Establish a process for regular review of audit logs.
8. **Alerts for Suspicious Activity**: Set up alerts for unusual access patterns.
9. **Separation of Duties**: Ensure administrators can't modify their own audit trails.
10. **Automated Reporting**: Create regular compliance reports for review.

## 11. Integration with Other Systems

### 11.1 SIEM Integration

For larger practices or healthcare systems, integrate with Security Information and Event Management (SIEM) systems:

```python
# app/infrastructure/services/siem_service.py
import json
import requests
from typing import Dict, Any

from app.config.settings import get_settings
from app.domain.entities.audit import AuditEvent
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class SIEMService:
    """Service for sending audit events to SIEM"""
    
    def __init__(self):
        self.enabled = settings.SIEM_ENABLED
        self.endpoint = settings.SIEM_ENDPOINT
        self.api_key = settings.SIEM_API_KEY
    
    async def send_event(self, event: AuditEvent) -> bool:
        """
        Send an audit event to SIEM
        
        Args:
            event: Audit event to send
            
        Returns:
            Success status
        """
        if not self.enabled:
            return False
        
        try:
            # Convert event to SIEM format
            siem_event = {
                "event_id": event.id,
                "timestamp": event.timestamp.isoformat(),
                "event_type": event.event_type.value,
                "user_id": event.user_id,
                "action": event.action,
                "status": event.status,
                "ip_address": event.ip_address,
                "resource_type": event.resource_type,
                "resource_id": event.resource_id,
                "metadata": event.metadata,
                "source_application": "novamind",
                "environment": settings.ENVIRONMENT,
            }
            
            # Send to SIEM
            response = requests.post(
                self.endpoint,
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": self.api_key,
                },
                json=siem_event,
                timeout=5,  # Short timeout to avoid blocking
            )
            
            if response.status_code != 200:
                logger.warning(
                    f"Failed to send event to SIEM: {response.status_code} {response.text}"
                )
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending event to SIEM: {str(e)}")
            return False
```

## 12. Conclusion

A comprehensive audit logging system is the foundation of HIPAA compliance for healthcare applications. It provides the necessary transparency, accountability, and security monitoring required by regulations while helping to detect and prevent unauthorized access to patient information.

The NOVAMIND audit logging implementation adheres to HIPAA requirements while maintaining high performance and scalability for a premium concierge psychiatry practice.
