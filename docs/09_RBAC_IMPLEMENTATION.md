# NOVAMIND: Role-Based Access Control (RBAC)

## 1. Overview

Role-Based Access Control (RBAC) is a critical security feature for our HIPAA-compliant psychiatry platform. It enforces the principle of least privilege by restricting system access to authorized users based on their assigned roles in the organization.

## 2. RBAC System Architecture

### 2.1 Role Hierarchy

Our concierge psychiatry platform implements a granular RBAC system with the following role hierarchy:

```text
SuperAdmin
├── Administrator
│   └── OfficeManager
│       └── Staff
└── Psychiatrist
    └── Therapist
        └── Patient
```python

Each role inherits permissions from roles below it in the hierarchy and grants additional specific permissions.

### 2.2 Domain Models

```python
# app/domain/entities/rbac.py
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Permission(Enum):
    """Enumeration of system permissions"""
    # Patient record permissions
    VIEW_PATIENT = "view_patient"
    CREATE_PATIENT = "create_patient"
    UPDATE_PATIENT = "update_patient"
    DELETE_PATIENT = "delete_patient"

    # Appointment permissions
    VIEW_APPOINTMENT = "view_appointment"
    CREATE_APPOINTMENT = "create_appointment"
    UPDATE_APPOINTMENT = "update_appointment"
    CANCEL_APPOINTMENT = "cancel_appointment"

    # Billing permissions
    VIEW_BILLING = "view_billing"
    CREATE_BILLING = "create_billing"
    UPDATE_BILLING = "update_billing"
    PROCESS_PAYMENT = "process_payment"

    # Prescription permissions
    VIEW_PRESCRIPTION = "view_prescription"
    CREATE_PRESCRIPTION = "create_prescription"
    UPDATE_PRESCRIPTION = "update_prescription"

    # Treatment permissions
    VIEW_TREATMENT = "view_treatment"
    CREATE_TREATMENT = "create_treatment"
    UPDATE_TREATMENT = "update_treatment"

    # Admin permissions
    MANAGE_USERS = "manage_users"
    MANAGE_ROLES = "manage_roles"
    VIEW_AUDIT_LOG = "view_audit_log"
    SYSTEM_CONFIGURATION = "system_configuration"


class Role(Enum):
    """System roles with increasing privilege levels"""
    PATIENT = "patient"
    THERAPIST = "therapist"
    PSYCHIATRIST = "psychiatrist"
    STAFF = "staff"
    OFFICE_MANAGER = "office_manager"
    ADMINISTRATOR = "administrator"
    SUPER_ADMIN = "super_admin"


class RolePermissionMapping(BaseModel):
    """Maps roles to their assigned permissions"""
    role: Role
    permissions: List[Permission]

    class Config:
        from_attributes = True


class UserRole(BaseModel):
    """Represents a role assigned to a user"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    role: Role
    assigned_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```python

## 3. RBAC Service Implementation

The RBAC service manages permission checks and role assignment:

```python
# app/infrastructure/services/rbac_service.py
from typing import Dict, List, Optional, Set

from app.domain.entities.rbac import Permission, Role, RolePermissionMapping
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RBACService:
    """Service to manage role-based access control"""

    def __init__(self):
        self._role_permissions: Dict[Role, Set[Permission]] = self._initialize_role_permissions()
        self._role_hierarchy: Dict[Role, List[Role]] = self._initialize_role_hierarchy()

    def _initialize_role_permissions(self) -> Dict[Role, Set[Permission]]:
        """Define base permissions for each role"""
        permissions = {
            # Patient permissions
            Role.PATIENT: {
                Permission.VIEW_APPOINTMENT,
                Permission.CREATE_APPOINTMENT,
                Permission.CANCEL_APPOINTMENT,
                Permission.VIEW_BILLING,
                Permission.PROCESS_PAYMENT,
                Permission.VIEW_PRESCRIPTION,
                Permission.VIEW_TREATMENT,
            },

            # Therapist permissions
            Role.THERAPIST: {
                Permission.VIEW_PATIENT,
                Permission.VIEW_APPOINTMENT,
                Permission.CREATE_APPOINTMENT,
                Permission.UPDATE_APPOINTMENT,
                Permission.CANCEL_APPOINTMENT,
                Permission.VIEW_TREATMENT,
                Permission.CREATE_TREATMENT,
                Permission.UPDATE_TREATMENT,
            },

            # Psychiatrist permissions
            Role.PSYCHIATRIST: {
                Permission.VIEW_PATIENT,
                Permission.UPDATE_PATIENT,
                Permission.VIEW_APPOINTMENT,
                Permission.CREATE_APPOINTMENT,
                Permission.UPDATE_APPOINTMENT,
                Permission.CANCEL_APPOINTMENT,
                Permission.VIEW_PRESCRIPTION,
                Permission.CREATE_PRESCRIPTION,
                Permission.UPDATE_PRESCRIPTION,
                Permission.VIEW_TREATMENT,
                Permission.CREATE_TREATMENT,
                Permission.UPDATE_TREATMENT,
            },

            # Staff permissions
            Role.STAFF: {
                Permission.VIEW_PATIENT,
                Permission.CREATE_PATIENT,
                Permission.VIEW_APPOINTMENT,
                Permission.CREATE_APPOINTMENT,
                Permission.UPDATE_APPOINTMENT,
                Permission.CANCEL_APPOINTMENT,
                Permission.VIEW_BILLING,
                Permission.CREATE_BILLING,
                Permission.UPDATE_BILLING,
            },

            # Office Manager permissions
            Role.OFFICE_MANAGER: {
                Permission.VIEW_PATIENT,
                Permission.CREATE_PATIENT,
                Permission.UPDATE_PATIENT,
                Permission.VIEW_APPOINTMENT,
                Permission.CREATE_APPOINTMENT,
                Permission.UPDATE_APPOINTMENT,
                Permission.CANCEL_APPOINTMENT,
                Permission.VIEW_BILLING,
                Permission.CREATE_BILLING,
                Permission.UPDATE_BILLING,
                Permission.PROCESS_PAYMENT,
                Permission.VIEW_AUDIT_LOG,
            },

            # Administrator permissions
            Role.ADMINISTRATOR: {
                Permission.VIEW_PATIENT,
                Permission.CREATE_PATIENT,
                Permission.UPDATE_PATIENT,
                Permission.DELETE_PATIENT,
                Permission.VIEW_APPOINTMENT,
                Permission.CREATE_APPOINTMENT,
                Permission.UPDATE_APPOINTMENT,
                Permission.CANCEL_APPOINTMENT,
                Permission.VIEW_BILLING,
                Permission.CREATE_BILLING,
                Permission.UPDATE_BILLING,
                Permission.PROCESS_PAYMENT,
                Permission.MANAGE_USERS,
                Permission.MANAGE_ROLES,
                Permission.VIEW_AUDIT_LOG,
            },

            # Super Admin permissions (all permissions)
            Role.SUPER_ADMIN: set(Permission),
        }

        return permissions

    def _initialize_role_hierarchy(self) -> Dict[Role, List[Role]]:
        """Define role hierarchy for permission inheritance"""
        return {
            Role.SUPER_ADMIN: [Role.ADMINISTRATOR],
            Role.ADMINISTRATOR: [Role.OFFICE_MANAGER],
            Role.OFFICE_MANAGER: [Role.STAFF],
            Role.PSYCHIATRIST: [Role.THERAPIST],
            Role.THERAPIST: [Role.PATIENT],
            Role.STAFF: [],
            Role.PATIENT: [],
        }

    def get_role_permissions(self, role: Role) -> Set[Permission]:
        """
        Get all permissions for a role including inherited permissions

        Args:
            role: The role to get permissions for

        Returns:
            Set of all permissions for the role
        """
        # Start with direct permissions
        all_permissions = self._role_permissions.get(role, set()).copy()

        # Add inherited permissions through recursion
        self._add_inherited_permissions(role, all_permissions)

        return all_permissions

    def _add_inherited_permissions(self, role: Role, permissions_set: Set[Permission]):
        """
        Recursively add permissions from child roles

        Args:
            role: Current role
            permissions_set: Set to add permissions to
        """
        for child_role in self._role_hierarchy.get(role, []):
            child_permissions = self._role_permissions.get(child_role, set())
            permissions_set.update(child_permissions)
            self._add_inherited_permissions(child_role, permissions_set)

    def has_permission(self, user_roles: List[Role], permission: Permission) -> bool:
        """
        Check if any of the user's roles grants a specific permission

        Args:
            user_roles: List of roles assigned to the user
            permission: Permission to check

        Returns:
            True if permission is granted
        """
        for role in user_roles:
            role_permissions = self.get_role_permissions(role)
            if permission in role_permissions:
                return True

        return False
```python

## 4. Applying RBAC in FastAPI Endpoints

### 4.1 Dependency for Permission Checks

```python
# app/presentation/api/dependencies/auth.py

from fastapi import Depends, HTTPException, Request, status
from typing import List, Optional

from app.domain.entities.rbac import Permission, Role
from app.infrastructure.services.jwt_service import JWTService
from app.infrastructure.services.rbac_service import RBACService
from app.utils.logger import get_logger

logger = get_logger(__name__)
jwt_service = JWTService()
rbac_service = RBACService()


def get_current_user(request: Request) -> dict:
    """Dependency to extract current user from request state"""
    if not hasattr(request.state, "user"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return request.state.user


def requires_permission(permission: Permission):
    """
    Dependency factory to check for a specific permission

    Args:
        permission: Required permission

    Returns:
        Dependency function that checks the permission
    """
    def dependency(current_user: dict = Depends(get_current_user)) -> dict:
        # Extract roles from user info
        user_roles = current_user.get("roles", [])

        # Convert string roles to Role enum
        roles = [Role(role) for role in user_roles if role in [r.value for r in Role]]

        # Check if user has the required permission
        if not rbac_service.has_permission(roles, permission):
            # HIPAA-compliant audit logging
            logger.warning(
                "Permission denied",
                extra={
                    "user_id": current_user.get("sub"),
                    "permission": permission.value,
                    "roles": user_roles,
                }
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission.value}"
            )

        return current_user

    return dependency


def requires_role(role: Role):
    """
    Dependency factory to check for a specific role

    Args:
        role: Required role

    Returns:
        Dependency function that checks the role
    """
    def dependency(current_user: dict = Depends(get_current_user)) -> dict:
        # Extract roles from user info
        user_roles = current_user.get("roles", [])

        # Check if user has the required role
        if role.value not in user_roles:
            # HIPAA-compliant audit logging
            logger.warning(
                "Role access denied",
                extra={
                    "user_id": current_user.get("sub"),
                    "required_role": role.value,
                    "user_roles": user_roles,
                }
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role required: {role.value}"
            )

        return current_user

    return dependency
```python

### 4.2 Usage in API Endpoints

```python
# app/presentation/api/v1/endpoints/patients.py

from fastapi import APIRouter, Depends, status

from app.domain.entities.rbac import Permission, Role
from app.presentation.api.dependencies.auth import requires_permission, requires_role
from app.presentation.schemas.patient import (
    PatientCreate,
    PatientResponse,
    PatientUpdate
)
from app.infrastructure.services.patient_service import PatientService

router = APIRouter()


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
)
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(requires_permission(Permission.VIEW_PATIENT)),
    patient_service: PatientService = Depends(),
):
    """Get patient details by ID (requires VIEW_PATIENT permission)"""
    return await patient_service.get_patient(patient_id, current_user)


@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_patient(
    patient: PatientCreate,
    current_user: dict = Depends(requires_permission(Permission.CREATE_PATIENT)),
    patient_service: PatientService = Depends(),
):
    """Create a new patient (requires CREATE_PATIENT permission)"""
    return await patient_service.create_patient(patient, current_user)


@router.put(
    "/{patient_id}",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
)
async def update_patient(
    patient_id: str,
    patient: PatientUpdate,
    current_user: dict = Depends(requires_permission(Permission.UPDATE_PATIENT)),
    patient_service: PatientService = Depends(),
):
    """Update patient details (requires UPDATE_PATIENT permission)"""
    return await patient_service.update_patient(patient_id, patient, current_user)


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_patient(
    patient_id: str,
    current_user: dict = Depends(requires_permission(Permission.DELETE_PATIENT)),
    patient_service: PatientService = Depends(),
):
    """Delete a patient (requires DELETE_PATIENT permission)"""
    await patient_service.delete_patient(patient_id, current_user)
    return None


# Administrator-only endpoint
@router.get(
    "/audit/activity",
    status_code=status.HTTP_200_OK,
)
async def get_patient_audit_log(
    patient_id: str,
    current_user: dict = Depends(requires_role(Role.ADMINISTRATOR)),
    audit_service: AuditService = Depends(),
):
    """Get patient audit log (requires ADMINISTRATOR role)"""
    return await audit_service.get_patient_audit_log(patient_id)
```python

## 5. Role Assignment

### 5.1 Role Repository

```python
# app/infrastructure/repositories/role_repository.py

from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.rbac import Role, UserRole
from app.infrastructure.database.models.rbac import UserRoleModel
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RoleRepository:
    """Repository for managing user roles"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def assign_role(
        self, user_id: str, role: Role, assigned_by: Optional[str] = None
    ) -> UserRole:
        """
        Assign a role to a user

        Args:
            user_id: User ID
            role: Role to assign
            assigned_by: ID of user making the assignment

        Returns:
            Created user role
        """
        user_role = UserRoleModel(
            user_id=user_id,
            role=role.value,
            assigned_by=assigned_by,
            created_at=datetime.utcnow()
        )

        self.session.add(user_role)
        await self.session.commit()
        await self.session.refresh(user_role)

        # Convert to domain entity
        return UserRole.from_orm(user_role)

    async def get_user_roles(self, user_id: str) -> List[UserRole]:
        """
        Get all roles assigned to a user

        Args:
            user_id: User ID

        Returns:
            List of user roles
        """
        query = select(UserRoleModel).where(UserRoleModel.user_id == user_id)
        result = await self.session.execute(query)
        user_roles = result.scalars().all()

        # Convert to domain entities
        return [UserRole.from_orm(ur) for ur in user_roles]

    async def remove_role(self, user_id: str, role: Role) -> bool:
        """
        Remove a role from a user

        Args:
            user_id: User ID
            role: Role to remove

        Returns:
            True if role was removed
        """
        query = select(UserRoleModel).where(
            UserRoleModel.user_id == user_id,
            UserRoleModel.role == role.value
        )
        result = await self.session.execute(query)
        user_role = result.scalar_one_or_none()

        if not user_role:
            return False

        await self.session.delete(user_role)
        await self.session.commit()

        return True
```python

### 5.2 Role Management Endpoints

```python
# app/presentation/api/v1/endpoints/admin.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.domain.entities.rbac import Role
from app.presentation.api.dependencies.auth import requires_permission
from app.domain.entities.rbac import Permission
from app.presentation.schemas.rbac import (
    RoleAssignment,
    UserRoleResponse
)
from app.infrastructure.repositories.role_repository import RoleRepository
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/users/{user_id}/roles",
    response_model=UserRoleResponse,
    status_code=status.HTTP_201_CREATED
)
async def assign_role(
    user_id: str,
    role_assignment: RoleAssignment,
    current_user: dict = Depends(requires_permission(Permission.MANAGE_ROLES)),
    role_repository: RoleRepository = Depends(),
):
    """Assign a role to a user (requires MANAGE_ROLES permission)"""
    try:
        # Convert string role to enum
        role = Role(role_assignment.role)

        # Assign role to user
        user_role = await role_repository.assign_role(
            user_id=user_id,
            role=role,
            assigned_by=current_user.get("sub")
        )

        # HIPAA-compliant audit logging
        logger.info(
            "Role assigned",
            extra={
                "admin_id": current_user.get("sub"),
                "user_id": user_id,
                "role": role.value,
            }
        )

        return UserRoleResponse.from_orm(user_role)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role_assignment.role}"
        )


@router.get(
    "/users/{user_id}/roles",
    response_model=List[UserRoleResponse],
    status_code=status.HTTP_200_OK
)
async def get_user_roles(
    user_id: str,
    current_user: dict = Depends(requires_permission(Permission.MANAGE_ROLES)),
    role_repository: RoleRepository = Depends(),
):
    """Get all roles assigned to a user (requires MANAGE_ROLES permission)"""
    user_roles = await role_repository.get_user_roles(user_id)
    return [UserRoleResponse.from_orm(ur) for ur in user_roles]


@router.delete(
    "/users/{user_id}/roles/{role}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def remove_role(
    user_id: str,
    role: str,
    current_user: dict = Depends(requires_permission(Permission.MANAGE_ROLES)),
    role_repository: RoleRepository = Depends(),
):
    """Remove a role from a user (requires MANAGE_ROLES permission)"""
    try:
        # Convert string role to enum
        role_enum = Role(role)

        # Remove role from user
        success = await role_repository.remove_role(user_id, role_enum)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role not found: {role}"
            )

        # HIPAA-compliant audit logging
        logger.info(
            "Role removed",
            extra={
                "admin_id": current_user.get("sub"),
                "user_id": user_id,
                "role": role,
            }
        )

        return None

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role}"
        )
```python

## 6. Client-Side RBAC Implementation

To complement the backend RBAC system, implement UI controls on the frontend:

```typescript
// frontend/src/services/rbacService.ts

import { useAuth } from '../contexts/AuthContext';

// Permission enum (must match backend)
export enum Permission {
  VIEW_PATIENT = 'view_patient',
  CREATE_PATIENT = 'create_patient',
  UPDATE_PATIENT = 'update_patient',
  DELETE_PATIENT = 'delete_patient',
  // ... other permissions
}

// Role enum (must match backend)
export enum Role {
  PATIENT = 'patient',
  THERAPIST = 'therapist',
  PSYCHIATRIST = 'psychiatrist',
  STAFF = 'staff',
  OFFICE_MANAGER = 'office_manager',
  ADMINISTRATOR = 'administrator',
  SUPER_ADMIN = 'super_admin',
}

// Role hierarchy definition
const roleHierarchy: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [Role.ADMINISTRATOR],
  [Role.ADMINISTRATOR]: [Role.OFFICE_MANAGER],
  [Role.OFFICE_MANAGER]: [Role.STAFF],
  [Role.PSYCHIATRIST]: [Role.THERAPIST],
  [Role.THERAPIST]: [Role.PATIENT],
  [Role.STAFF]: [],
  [Role.PATIENT]: [],
};

// Role permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.PATIENT]: [
    Permission.VIEW_APPOINTMENT,
    Permission.CREATE_APPOINTMENT,
    // ... other permissions
  ],
  // ... other role permissions
};

// Helper to get all permissions for a role
const getRolePermissions = (role: Role): Set<Permission> => {
  const permissions = new Set<Permission>(rolePermissions[role] || []);

  // Add inherited permissions
  const addInheritedPermissions = (currentRole: Role) => {
    const childRoles = roleHierarchy[currentRole] || [];
    for (const childRole of childRoles) {
      const childPermissions = rolePermissions[childRole] || [];
      childPermissions.forEach(p => permissions.add(p));
      addInheritedPermissions(childRole);
    }
  };

  addInheritedPermissions(role);
  return permissions;
};

// React hook for permission checks
export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.roles) return false;

    // Check each user role
    for (const roleStr of user.roles) {
      try {
        const role = roleStr as Role;
        const permissions = getRolePermissions(role);
        if (permissions.has(permission)) return true;
      } catch (e) {
        console.error(`Invalid role: ${roleStr}`);
      }
    }

    return false;
  };

  const hasRole = (role: Role): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  return { hasPermission, hasRole };
};

// Permission-based rendering component
export const PermissionGate: React.FC<{
  permission: Permission;
  children: React.ReactNode;
}> = ({ permission, children }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) return null;
  return <>{children}</>;
};

// Role-based rendering component
export const RoleGate: React.FC<{
  role: Role;
  children: React.ReactNode;
}> = ({ role, children }) => {
  const { hasRole } = usePermission();

  if (!hasRole(role)) return null;
  return <>{children}</>;
};
```python

## 7. HIPAA-Compliant RBAC Audit Logging

For HIPAA compliance, all RBAC actions must be audited:

```python
# app/utils/audit_logger.py

import json
from datetime import datetime
from typing import Any, Dict, Optional
import uuid

from app.config.settings import get_settings
from app.infrastructure.database.models.audit import AuditLogModel
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def log_rbac_action(
    session,
    action: str,
    user_id: str,
    target_user_id: Optional[str] = None,
    role: Optional[str] = None,
    permission: Optional[str] = None,
    success: bool = True,
    additional_data: Optional[Dict[str, Any]] = None,
):
    """
    Log RBAC-related actions for HIPAA compliance

    Args:
        session: Database session
        action: Action performed (e.g., 'assign_role', 'check_permission')
        user_id: ID of user performing the action
        target_user_id: ID of user affected by the action (if applicable)
        role: Role involved (if applicable)
        permission: Permission involved (if applicable)
        success: Whether the action succeeded
        additional_data: Any additional data to log
    """
    try:
        # Create sanitized metadata
        metadata = {
            "action": action,
            "success": success,
        }

        if role:
            metadata["role"] = role

        if permission:
            metadata["permission"] = permission

        if additional_data:
            # Ensure no PHI is included in additional data
            safe_additional_data = {
                k: v for k, v in additional_data.items()
                if k not in settings.PHI_FIELDS
            }
            metadata.update(safe_additional_data)

        # Create audit log entry
        audit_log = AuditLogModel(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            user_id=user_id,
            target_user_id=target_user_id,
            action=action,
            metadata=json.dumps(metadata),
        )

        session.add(audit_log)
        await session.commit()

    except Exception as e:
        # Fallback to regular logging if database logging fails
        logger.error(
            f"Failed to create RBAC audit log: {str(e)}",
            extra={
                "action": action,
                "user_id": user_id,
                "target_user_id": target_user_id,
            }
        )
```python

## 8. Best Practices for HIPAA-Compliant RBAC

1. **Principle of Least Privilege**: Assign the minimum permissions necessary for each role.
1. **Separation of Duties**: Critical operations should require multiple roles.
1. **Regular Access Reviews**: Audit role assignments periodically.
1. **Context-Aware Permissions**: Consider implementing additional checks based on patient relationships.
1. **Attribute-Based Access Control (ABAC)**: Extend RBAC with attributes like time, location, and patient relationship.
1. **Role Rotation**: Change administrative roles periodically.
1. **Monitor and Alert**: Set up alerts for suspicious permission usage patterns.
1. **User Interface Protection**: Hide UI elements for unauthorized actions, but always enforce permissions on the server.

## 9. Conclusion

A properly implemented RBAC system is foundational for HIPAA compliance in a psychiatry platform. It ensures protected health information (PHI) is only accessible to authorized personnel with a legitimate need to know, while providing a clear audit trail for all access and actions.

By using a combination of roles, permissions, and hierarchical inheritance, NOVAMIND provides a flexible and secure access control system that meets the demands of a high-end concierge psychiatry practice while maintaining strict compliance with healthcare regulations.
