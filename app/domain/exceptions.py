"""
Domain exceptions module for the NOVAMIND backend.

This module contains custom exception classes for domain-specific errors.
These exceptions represent business rule violations and domain constraints.
"""


class DomainException(Exception):
    """Base class for all domain-specific exceptions"""
    pass


class EntityNotFoundError(DomainException):
    """Exception raised when an entity cannot be found"""
    pass


class ValidationError(DomainException):
    """Exception raised when entity validation fails"""
    pass


class BusinessRuleViolationError(DomainException):
    """Exception raised when a business rule is violated"""
    pass


class AuthorizationError(DomainException):
    """Exception raised when an operation is not authorized"""
    pass


class ConcurrencyError(DomainException):
    """Exception raised when there is a concurrency conflict"""
    pass


class RepositoryError(DomainException):
    """Exception raised when there is an error in a repository operation"""
    pass


class AppointmentConflictError(BusinessRuleViolationError):
    """Exception raised when there is a scheduling conflict with appointments"""
    pass


class MedicationInteractionError(BusinessRuleViolationError):
    """Exception raised when there is a potential medication interaction"""
    pass


class PatientLimitExceededError(BusinessRuleViolationError):
    """Exception raised when a provider's patient limit is exceeded"""
    pass


class DocumentationRequiredError(BusinessRuleViolationError):
    """Exception raised when required documentation is missing"""
    pass


class CredentialExpiredError(BusinessRuleViolationError):
    """Exception raised when a provider's credential is expired"""
    pass
