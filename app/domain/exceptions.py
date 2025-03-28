# -*- coding: utf-8 -*-
"""
Domain-specific exceptions for the Novamind concierge psychiatry platform.

This module defines custom exceptions for the domain layer,
ensuring clear error handling and separation of concerns.
"""

from typing import Optional


class DomainException(Exception):
    """Base exception class for all domain-specific exceptions."""

    def __init__(self, message: str = "Domain error occurred"):
        self.message = message
        super().__init__(self.message)


class AuthenticationError(DomainException):
    """
    Raised when authentication fails due to invalid credentials or tokens.

    This exception is typically thrown during JWT validation or login attempts
    with incorrect credentials.
    """

    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(message)


class TokenExpiredError(AuthenticationError):
    """
    Raised when an authentication token has expired.

    This is a specific type of authentication error indicating that
    the user needs to refresh their token or log in again.
    """

    def __init__(self, message: str = "Token has expired"):
        super().__init__(message)


class AuthorizationError(DomainException):
    """
    Raised when a user attempts to access a resource they don't have permission for.

    This exception is used for role-based access control violations.
    """

    def __init__(self, message: str = "Not authorized to access this resource"):
        super().__init__(message)


class ResourceNotFoundError(DomainException):
    """
    Raised when a requested resource cannot be found.

    This exception is used when attempting to retrieve entities that don't exist.
    """

    def __init__(
        self,
        resource_type: str,
        resource_id: Optional[str] = None,
        message: Optional[str] = None,
    ):
        if message is None:
            message = f"{resource_type} not found"
            if resource_id:
                message = f"{resource_type} with ID {resource_id} not found"
        super().__init__(message)
        self.resource_type = resource_type
        self.resource_id = resource_id


class ValidationError(DomainException):
    """
    Raised when domain validation rules are violated.

    This exception is used for business logic validation failures.
    """

    def __init__(
        self, message: str = "Validation error", errors: Optional[dict] = None
    ):
        super().__init__(message)
        self.errors = errors or {}


class AppointmentConflictError(DomainException):
    """
    Raised when there is a scheduling conflict with appointments.

    This exception is used when trying to book an appointment that conflicts
    with an existing one.
    """

    def __init__(
        self,
        message: str = "Appointment scheduling conflict",
        conflicting_appointment_id: Optional[str] = None,
    ):
        super().__init__(message)
        self.conflicting_appointment_id = conflicting_appointment_id


class PatientDataAccessError(DomainException):
    """
    Raised when there is an error accessing patient data.

    This exception is used for HIPAA-related access violations or data integrity issues.
    """

    def __init__(self, message: str = "Error accessing patient data"):
        super().__init__(message)


class BusinessRuleViolationError(DomainException):
    """
    Raised when a business rule is violated.

    This exception is used for enforcing domain-specific rules that aren't
    simple validation errors.
    """

    def __init__(self, rule_name: str, message: Optional[str] = None):
        if message is None:
            message = f"Business rule violation: {rule_name}"
        super().__init__(message)
        self.rule_name = rule_name


class ConcurrencyError(DomainException):
    """
    Raised when concurrent modifications to a resource cause conflicts.

    This exception is used for optimistic concurrency control failures.
    """

    def __init__(
        self,
        message: str = "Resource was modified by another process",
        resource_id: Optional[str] = None,
    ):
        super().__init__(message)
        self.resource_id = resource_id


class ExternalServiceError(DomainException):
    """
    Raised when an external service dependency fails.

    This exception wraps errors from external services while keeping
    domain logic independent.
    """

    def __init__(
        self,
        service_name: str,
        message: Optional[str] = None,
        original_error: Optional[Exception] = None,
    ):
        if message is None:
            message = f"External service error: {service_name}"
        super().__init__(message)
        self.service_name = service_name
        self.original_error = original_error
