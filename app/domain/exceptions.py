"""
NOVAMIND Domain Exceptions
=========================
Centralized exception definitions for the NOVAMIND platform.
Follows Clean Architecture principles with domain-specific exceptions.
"""

from typing import Dict, Any, Optional, List, Union


class NovaBaseException(Exception):
    """Base exception for all NOVAMIND custom exceptions."""
    
    status_code: int = 500
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        """
        Initialize with an error message and optional details.
        
        Args:
            message: Human-readable error description
            details: Additional structured information about the error
        """
        self.message = message
        self.details = details
        super().__init__(message)


class EntityNotFoundException(NovaBaseException):
    """Exception raised when an entity cannot be found."""
    
    status_code: int = 404
    
    def __init__(
        self, 
        message: str, 
        entity_type: Optional[str] = None, 
        entity_id: Optional[Union[str, int]] = None
    ):
        """
        Initialize with entity information.
        
        Args:
            message: Human-readable error description
            entity_type: Type of entity that wasn't found
            entity_id: ID of entity that wasn't found
        """
        self.entity_type = entity_type
        self.entity_id = entity_id
        details = {"entity_type": entity_type, "entity_id": entity_id} if entity_type else None
        super().__init__(message, details)


class ValidationException(NovaBaseException):
    """Exception raised when input validation fails."""
    
    status_code: int = 422
    
    def __init__(
        self, 
        message: str, 
        field_errors: Optional[Dict[str, List[str]]] = None
    ):
        """
        Initialize with validation details.
        
        Args:
            message: Human-readable error description
            field_errors: Mapping of field names to error messages
        """
        self.field_errors = field_errors
        details = {"field_errors": field_errors} if field_errors else None
        super().__init__(message, details)


class AuthenticationException(NovaBaseException):
    """Exception raised when authentication fails."""
    
    status_code: int = 401
    
    def __init__(self, message: str = "Authentication failed"):
        """
        Initialize with authentication error message.
        
        Args:
            message: Human-readable error description
        """
        super().__init__(message)


class AuthorizationException(NovaBaseException):
    """Exception raised when user is not authorized for an action."""
    
    status_code: int = 403
    
    def __init__(
        self, 
        message: str = "Not authorized", 
        required_role: Optional[str] = None,
        required_permission: Optional[str] = None
    ):
        """
        Initialize with authorization details.
        
        Args:
            message: Human-readable error description
            required_role: Role that would be required for access
            required_permission: Permission that would be required for access
        """
        details = {}
        if required_role:
            details["required_role"] = required_role
        if required_permission:
            details["required_permission"] = required_permission
            
        self.required_role = required_role
        self.required_permission = required_permission
        super().__init__(message, details)


class BusinessRuleException(NovaBaseException):
    """Exception raised when a business rule is violated."""
    
    status_code: int = 400
    
    def __init__(
        self, 
        message: str, 
        rule_name: Optional[str] = None,
        error_code: Optional[str] = None
    ):
        """
        Initialize with business rule details.
        
        Args:
            message: Human-readable error description
            rule_name: Name of the business rule that was violated
            error_code: Optional error code for the specific rule
        """
        details = {}
        if rule_name:
            details["rule_name"] = rule_name
        if error_code:
            details["error_code"] = error_code
            
        self.rule_name = rule_name
        self.error_code = error_code
        super().__init__(message, details)


class DataIntegrityException(NovaBaseException):
    """Exception raised when data integrity is compromised."""
    
    status_code: int = 409
    
    def __init__(
        self, 
        message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[Union[str, int]] = None,
        conflict_reason: Optional[str] = None
    ):
        """
        Initialize with data integrity details.
        
        Args:
            message: Human-readable error description
            entity_type: Type of entity with integrity issues
            entity_id: ID of entity with integrity issues
            conflict_reason: Description of the integrity conflict
        """
        details = {}
        if entity_type:
            details["entity_type"] = entity_type
        if entity_id:
            details["entity_id"] = entity_id
        if conflict_reason:
            details["conflict_reason"] = conflict_reason
            
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.conflict_reason = conflict_reason
        super().__init__(message, details)


class ExternalServiceException(NovaBaseException):
    """Exception raised when an external service fails."""
    
    status_code: int = 502
    
    def __init__(
        self, 
        message: str,
        service_name: Optional[str] = None,
        error_details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize with external service details.
        
        Args:
            message: Human-readable error description
            service_name: Name of the external service
            error_details: Detailed error information from the service
        """
        details = {}
        if service_name:
            details["service_name"] = service_name
        if error_details:
            details["error_details"] = error_details
            
        self.service_name = service_name
        self.error_details = error_details
        super().__init__(message, details)


class ConfigurationException(NovaBaseException):
    """Exception raised when system configuration is invalid."""
    
    status_code: int = 500
    
    def __init__(
        self, 
        message: str,
        config_key: Optional[str] = None
    ):
        """
        Initialize with configuration details.
        
        Args:
            message: Human-readable error description
            config_key: The configuration key that caused the issue
        """
        details = {"config_key": config_key} if config_key else None
        self.config_key = config_key
        super().__init__(message, details)


class MLModelException(NovaBaseException):
    """Exception raised when an ML model operation fails."""
    
    status_code: int = 500
    
    def __init__(
        self, 
        message: str,
        model_name: Optional[str] = None,
        operation: Optional[str] = None,
        error_details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize with ML model details.
        
        Args:
            message: Human-readable error description
            model_name: Name of the ML model
            operation: Operation that was being performed
            error_details: Detailed error information
        """
        details = {}
        if model_name:
            details["model_name"] = model_name
        if operation:
            details["operation"] = operation
        if error_details:
            details["error_details"] = error_details
            
        self.model_name = model_name
        self.operation = operation
        self.error_details = error_details
        super().__init__(message, details)


class PHISecurityException(NovaBaseException):
    """
    Exception raised for PHI (Protected Health Information) security violations.
    This is specifically for HIPAA compliance issues.
    """
    
    status_code: int = 403
    
    def __init__(
        self, 
        message: str,
        phi_type: Optional[str] = None,
        security_violation: Optional[str] = None
    ):
        """
        Initialize with PHI security violation details.
        
        Args:
            message: Human-readable error description
            phi_type: Type of PHI involved (e.g., 'medical_record', 'prescription')
            security_violation: Description of security violation
        """
        # NEVER include actual PHI in error details or messages
        details = {}
        if phi_type:
            details["phi_type"] = phi_type
        if security_violation:
            details["security_violation"] = security_violation
            
        self.phi_type = phi_type
        self.security_violation = security_violation
        super().__init__(message, details)