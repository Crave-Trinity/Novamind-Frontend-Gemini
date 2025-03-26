"""
NOVAMIND Data Validation Utility
===============================
Comprehensive data validation for patient information in the NOVAMIND platform.
Implements HIPAA-compliant validation with proper error handling.
"""

import re
import json
from typing import Any, Dict, List, Optional, Union, Callable, TypeVar, Generic, cast
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator, ValidationError

# Type variables for generic validation
T = TypeVar('T')


class ValidationResult(Generic[T]):
    """Result of a validation operation."""
    
    def __init__(self, is_valid: bool, value: Optional[T] = None, errors: Optional[List[str]] = None):
        """
        Initialize validation result.
        
        Args:
            is_valid: Whether validation passed
            value: Validated value (if validation passed)
            errors: List of validation error messages (if validation failed)
        """
        self.is_valid = is_valid
        self.value = value
        self.errors = errors or []
    
    def __bool__(self) -> bool:
        """Allow using validation result in boolean context."""
        return self.is_valid
    
    def __str__(self) -> str:
        """String representation of validation result."""
        if self.is_valid:
            return f"Valid: {self.value}"
        else:
            return f"Invalid: {', '.join(self.errors)}"


class PatientIdentifierType(str, Enum):
    """Types of patient identifiers."""
    MRN = "mrn"
    SSN = "ssn"
    INSURANCE_ID = "insurance_id"
    EXTERNAL_ID = "external_id"


class ValidationPatterns:
    """Regular expression patterns for validating common data types."""
    
    # Contact information
    EMAIL = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    PHONE_US = r'^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$'
    ZIP_CODE_US = r'^\d{5}(?:-\d{4})?$'
    
    # Personal identifiers
    SSN = r'^\d{3}-\d{2}-\d{4}$'
    MRN = r'^[A-Z0-9]{6,10}$'
    INSURANCE_ID = r'^[A-Z0-9]{8,15}$'
    
    # Name components
    NAME = r'^[A-Za-z\'\-\s]{2,50}$'
    
    # Dates
    DATE_ISO = r'^\d{4}-\d{2}-\d{2}$'
    DATE_US = r'^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/\d{4}$'
    
    # Medical
    ICD10_CODE = r'^[A-Z]\d{2}(?:\.\d{1,2})?$'
    MEDICATION_CODE = r'^[A-Z0-9]{5,10}$'
    
    # Security
    PASSWORD = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'


class DataValidator:
    """
    Validates data according to HIPAA-compliant rules.
    Provides methods for validating common data types.
    """
    
    @staticmethod
    def validate_pattern(value: str, pattern: str, error_message: Optional[str] = None) -> ValidationResult[str]:
        """
        Validate a string against a regex pattern.
        
        Args:
            value: String to validate
            pattern: Regex pattern to validate against
            error_message: Custom error message
            
        Returns:
            ValidationResult with validation status
        """
        if not value:
            return ValidationResult(False, None, ["Value cannot be empty"])
        
        if re.match(pattern, value):
            return ValidationResult(True, value)
        else:
            return ValidationResult(False, None, [error_message or "Invalid format"])
    
    @staticmethod
    def validate_email(email: str) -> ValidationResult[str]:
        """Validate email address format."""
        return DataValidator.validate_pattern(
            email, 
            ValidationPatterns.EMAIL,
            "Invalid email address format"
        )
    
    @staticmethod
    def validate_phone(phone: str) -> ValidationResult[str]:
        """Validate US phone number format."""
        return DataValidator.validate_pattern(
            phone, 
            ValidationPatterns.PHONE_US,
            "Invalid phone number format"
        )
    
    @staticmethod
    def validate_ssn(ssn: str) -> ValidationResult[str]:
        """Validate US Social Security Number format."""
        return DataValidator.validate_pattern(
            ssn, 
            ValidationPatterns.SSN,
            "Invalid SSN format (must be XXX-XX-XXXX)"
        )
    
    @staticmethod
    def validate_mrn(mrn: str) -> ValidationResult[str]:
        """Validate Medical Record Number format."""
        return DataValidator.validate_pattern(
            mrn, 
            ValidationPatterns.MRN,
            "Invalid MRN format"
        )
    
    @staticmethod
    def validate_name(name: str) -> ValidationResult[str]:
        """Validate person name format."""
        return DataValidator.validate_pattern(
            name, 
            ValidationPatterns.NAME,
            "Invalid name format (2-50 characters, letters, spaces, hyphens, and apostrophes only)"
        )
    
    @staticmethod
    def validate_date(date_str: str, format_str: str = "%Y-%m-%d") -> ValidationResult[datetime]:
        """
        Validate date string and convert to datetime.
        
        Args:
            date_str: Date string to validate
            format_str: Expected date format
            
        Returns:
            ValidationResult with parsed datetime if valid
        """
        if not date_str:
            return ValidationResult(False, None, ["Date cannot be empty"])
        
        try:
            date_obj = datetime.strptime(date_str, format_str)
            return ValidationResult(True, date_obj)
        except ValueError:
            return ValidationResult(False, None, [f"Invalid date format (expected {format_str})"])
    
    @staticmethod
    def validate_age(age: Union[int, str]) -> ValidationResult[int]:
        """
        Validate age is a reasonable value.
        
        Args:
            age: Age value to validate
            
        Returns:
            ValidationResult with age as int if valid
        """
        try:
            age_int = int(age)
            if 0 <= age_int <= 120:
                return ValidationResult(True, age_int)
            else:
                return ValidationResult(False, None, ["Age must be between 0 and 120"])
        except (ValueError, TypeError):
            return ValidationResult(False, None, ["Age must be a number"])
    
    @staticmethod
    def validate_password(password: str) -> ValidationResult[str]:
        """
        Validate password strength.
        
        Args:
            password: Password to validate
            
        Returns:
            ValidationResult with password if valid
        """
        if not password:
            return ValidationResult(False, None, ["Password cannot be empty"])
        
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one digit")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        if errors:
            return ValidationResult(False, None, errors)
        else:
            return ValidationResult(True, password)
    
    @staticmethod
    def sanitize_input(input_str: str) -> str:
        """
        Sanitize input string to prevent injection attacks.
        
        Args:
            input_str: String to sanitize
            
        Returns:
            Sanitized string
        """
        if not input_str:
            return ""
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\';]', '', input_str)
        
        # Escape HTML entities
        sanitized = (
            sanitized
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#x27;')
        )
        
        return sanitized
    
    @staticmethod
    def validate_json(json_str: str) -> ValidationResult[Dict[str, Any]]:
        """
        Validate JSON string and parse to dictionary.
        
        Args:
            json_str: JSON string to validate
            
        Returns:
            ValidationResult with parsed JSON if valid
        """
        if not json_str:
            return ValidationResult(False, None, ["JSON string cannot be empty"])
        
        try:
            parsed = json.loads(json_str)
            if not isinstance(parsed, dict):
                return ValidationResult(False, None, ["JSON must represent an object"])
            return ValidationResult(True, parsed)
        except json.JSONDecodeError as e:
            return ValidationResult(False, None, [f"Invalid JSON: {str(e)}"])
    
    @staticmethod
    def validate_enum(value: str, enum_class: Any) -> ValidationResult[Any]:
        """
        Validate value against an Enum class.
        
        Args:
            value: Value to validate
            enum_class: Enum class to validate against
            
        Returns:
            ValidationResult with enum value if valid
        """
        try:
            enum_value = enum_class(value)
            return ValidationResult(True, enum_value)
        except ValueError:
            valid_values = [e.value for e in enum_class]
            return ValidationResult(
                False, 
                None, 
                [f"Invalid value. Must be one of: {', '.join(str(v) for v in valid_values)}"]
            )


# Pydantic models for structured validation

class PatientIdentifier(BaseModel):
    """Patient identifier model."""
    
    id_type: PatientIdentifierType
    id_value: str
    issuer: Optional[str] = None
    
    @validator('id_value')
    def validate_id_value(cls, v, values):
        """Validate ID value based on ID type."""
        id_type = values.get('id_type')
        if id_type == PatientIdentifierType.MRN:
            if not re.match(ValidationPatterns.MRN, v):
                raise ValueError("Invalid MRN format")
        elif id_type == PatientIdentifierType.SSN:
            if not re.match(ValidationPatterns.SSN, v):
                raise ValueError("Invalid SSN format")
        elif id_type == PatientIdentifierType.INSURANCE_ID:
            if not re.match(ValidationPatterns.INSURANCE_ID, v):
                raise ValueError("Invalid insurance ID format")
        return v


class PatientContact(BaseModel):
    """Patient contact information model."""
    
    email: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str = "USA"
    
    @validator('email')
    def validate_email(cls, v):
        """Validate email format."""
        if v and not re.match(ValidationPatterns.EMAIL, v):
            raise ValueError("Invalid email format")
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone format."""
        if v and not re.match(ValidationPatterns.PHONE_US, v):
            raise ValueError("Invalid phone format")
        return v
    
    @validator('zip_code')
    def validate_zip_code(cls, v):
        """Validate ZIP code format."""
        if v and not re.match(ValidationPatterns.ZIP_CODE_US, v):
            raise ValueError("Invalid ZIP code format")
        return v


class PatientDemographics(BaseModel):
    """Patient demographics model."""
    
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    date_of_birth: datetime
    gender: str
    ethnicity: Optional[str] = None
    race: Optional[str] = None
    preferred_language: Optional[str] = None
    
    @validator('first_name', 'last_name', 'middle_name')
    def validate_name(cls, v):
        """Validate name format."""
        if v and not re.match(ValidationPatterns.NAME, v):
            raise ValueError("Invalid name format")
        return v
    
    @validator('gender')
    def validate_gender(cls, v):
        """Validate gender."""
        valid_genders = ["male", "female", "non-binary", "other", "prefer not to say"]
        if v.lower() not in valid_genders:
            raise ValueError(f"Invalid gender. Must be one of: {', '.join(valid_genders)}")
        return v.lower()


def validate_model(model_class: Any, data: Dict[str, Any]) -> ValidationResult[Any]:
    """
    Validate data against a Pydantic model.
    
    Args:
        model_class: Pydantic model class to validate against
        data: Dictionary data to validate
        
    Returns:
        ValidationResult with model instance if valid
    """
    try:
        model_instance = model_class(**data)
        return ValidationResult(True, model_instance)
    except ValidationError as e:
        errors = []
        for error in e.errors():
            location = ".".join(str(loc) for loc in error["loc"])
            errors.append(f"{location}: {error['msg']}")
        return ValidationResult(False, None, errors)
