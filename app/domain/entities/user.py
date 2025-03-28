# -*- coding: utf-8 -*-
# app/domain/entities/user.py
from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4


class UserRole(Enum):
    """User roles for role-based access control"""

    ADMIN = "admin"
    PROVIDER = "provider"
    ASSISTANT = "assistant"
    PATIENT = "patient"


class User:
    """
    User entity representing a system user with role-based permissions.
    Core domain entity with no external dependencies.
    """

    def __init__(
        self,
        username: str,
        email: str,
        roles: List[UserRole],
        id: Optional[UUID] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        last_login: Optional[datetime] = None,
    ):
        self.id = id or uuid4()
        self.username = username
        self.email = email
        self.roles = roles
        self.first_name = first_name
        self.last_name = last_name
        self.is_active = is_active
        self.created_at = created_at or datetime.now()
        self.last_login = last_login

    @property
    def full_name(self) -> str:
        """Get user's full name if available, otherwise username"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def has_role(self, role: UserRole) -> bool:
        """Check if user has a specific role"""
        return role in self.roles

    def add_role(self, role: UserRole) -> None:
        """Add a role to user if not already present"""
        if role not in self.roles:
            self.roles.append(role)

    def remove_role(self, role: UserRole) -> None:
        """Remove a role from user"""
        if role in self.roles:
            self.roles.remove(role)

    def deactivate(self) -> None:
        """Deactivate user account"""
        self.is_active = False

    def activate(self) -> None:
        """Activate user account"""
        self.is_active = True

    def update_last_login(self) -> None:
        """Update last login timestamp"""
        self.last_login = datetime.now()
