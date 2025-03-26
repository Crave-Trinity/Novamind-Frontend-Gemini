"""
NOVAMIND HIPAA-Compliant Logging Utility
========================================
Provides secure, compliant logging with PHI redaction for the NOVAMIND platform.
Maintains audit trails and ensures no sensitive information is exposed in logs.
"""

import logging
import re
import time
import uuid
import os
import json
import functools
from datetime import datetime
from typing import Any, Dict, Optional, Callable, List, Union, TypeVar, cast

from ..config import settings

# Type variables for generic function decorators
F = TypeVar('F', bound=Callable[..., Any])

# PHI pattern detection regexes
PHI_PATTERNS = {
    'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    'ssn': r'\b\d{3}[-]?\d{2}[-]?\d{4}\b',
    'phone': r'\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b',
    'address': r'\b\d+\s+[A-Za-z0-9\s,]+\b(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\b',
    'dob': r'\b(0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])[-/](19|20)\d{2}\b',
    'mrn': r'\b(MRN|mrn)[:# ]\s*\d{5,10}\b',
    'patient_id': r'\b(patient|pt)[:# ]\s*\d{5,10}\b'
}


class PHIRedactor:
    """Handles redaction of PHI from log messages."""
    
    def __init__(self, patterns: Optional[Dict[str, str]] = None):
        """Initialize with PHI detection patterns."""
        self.patterns = patterns or PHI_PATTERNS
        self.compiled_patterns = {
            name: re.compile(pattern, re.IGNORECASE) 
            for name, pattern in self.patterns.items()
        }
    
    def redact(self, message: str) -> str:
        """
        Redact all PHI from the given message.
        
        Args:
            message: The log message to redact
            
        Returns:
            Redacted message with PHI replaced by [REDACTED:{type}]
        """
        if not settings.security.ENABLE_PHI_REDACTION:
            return message
            
        redacted = message
        for name, pattern in self.compiled_patterns.items():
            redacted = pattern.sub(f"[REDACTED:{name}]", redacted)
        
        return redacted


class HIPAACompliantLogger:
    """
    HIPAA-compliant logger that ensures PHI is properly redacted.
    Provides audit trail capabilities and secure logging practices.
    """
    
    def __init__(
        self, 
        name: str, 
        log_level: Optional[str] = None,
        enable_console: Optional[bool] = None,
        enable_file: Optional[bool] = None,
        log_file: Optional[str] = None,
        enable_audit: Optional[bool] = None,
        audit_file: Optional[str] = None
    ):
        """
        Initialize the HIPAA-compliant logger.
        
        Args:
            name: Logger name (typically module name)
            log_level: Logging level (DEBUG, INFO, etc.)
            enable_console: Whether to log to console
            enable_file: Whether to log to file
            log_file: Path to log file
            enable_audit: Whether to enable audit logging
            audit_file: Path to audit log file
        """
        self.name = name
        self.log_level = log_level or settings.logging.LOG_LEVEL
        self.enable_console = enable_console if enable_console is not None else settings.logging.LOG_TO_CONSOLE
        self.enable_file = enable_file if enable_file is not None else settings.logging.LOG_TO_FILE
        self.log_file = log_file or settings.logging.LOG_FILE
        self.enable_audit = enable_audit if enable_audit is not None else settings.logging.ENABLE_AUDIT_LOGGING
        self.audit_file = audit_file or settings.logging.AUDIT_LOG_FILE
        
        # Create the logger
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, self.log_level))
        
        # Clear existing handlers to avoid duplicates
        if self.logger.hasHandlers():
            self.logger.handlers.clear()
        
        # Configure handlers
        if self.enable_console:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(settings.logging.LOG_FORMAT))
            self.logger.addHandler(console_handler)
        
        if self.enable_file and self.log_file:
            # Ensure directory exists
            os.makedirs(os.path.dirname(os.path.abspath(self.log_file)), exist_ok=True)
            
            file_handler = logging.FileHandler(self.log_file)
            file_handler.setFormatter(logging.Formatter(settings.logging.LOG_FORMAT))
            self.logger.addHandler(file_handler)
        
        # Set up audit logger if enabled
        self.audit_logger = None
        if self.enable_audit and self.audit_file:
            # Ensure directory exists
            os.makedirs(os.path.dirname(os.path.abspath(self.audit_file)), exist_ok=True)
            
            self.audit_logger = logging.getLogger(f"{name}.audit")
            self.audit_logger.setLevel(logging.INFO)
            
            # Clear existing handlers to avoid duplicates
            if self.audit_logger.hasHandlers():
                self.audit_logger.handlers.clear()
            
            audit_handler = logging.FileHandler(self.audit_file)
            audit_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
            self.audit_logger.addHandler(audit_handler)
        
        # Create PHI redactor
        self.redactor = PHIRedactor()
    
    def _log(self, level: int, msg: str, *args, **kwargs) -> None:
        """
        Internal logging method with PHI redaction.
        
        Args:
            level: Logging level
            msg: Message to log
            *args: Additional positional arguments
            **kwargs: Additional keyword arguments
        """
        # Redact PHI from message and any string args
        redacted_msg = self.redactor.redact(str(msg))
        
        # Redact PHI from args if they are strings
        redacted_args = []
        for arg in args:
            if isinstance(arg, str):
                redacted_args.append(self.redactor.redact(arg))
            else:
                redacted_args.append(arg)
        
        # Redact PHI from kwargs if they are strings
        redacted_kwargs = {}
        for key, value in kwargs.items():
            if isinstance(value, str):
                redacted_kwargs[key] = self.redactor.redact(value)
            else:
                redacted_kwargs[key] = value
        
        # Log the redacted message
        self.logger.log(level, redacted_msg, *redacted_args, **redacted_kwargs)
    
    def debug(self, msg: str, *args, **kwargs) -> None:
        """Log a debug message with PHI redaction."""
        self._log(logging.DEBUG, msg, *args, **kwargs)
    
    def info(self, msg: str, *args, **kwargs) -> None:
        """Log an info message with PHI redaction."""
        self._log(logging.INFO, msg, *args, **kwargs)
    
    def warning(self, msg: str, *args, **kwargs) -> None:
        """Log a warning message with PHI redaction."""
        self._log(logging.WARNING, msg, *args, **kwargs)
    
    def error(self, msg: str, *args, **kwargs) -> None:
        """Log an error message with PHI redaction."""
        self._log(logging.ERROR, msg, *args, **kwargs)
    
    def critical(self, msg: str, *args, **kwargs) -> None:
        """Log a critical message with PHI redaction."""
        self._log(logging.CRITICAL, msg, *args, **kwargs)
    
    def audit(
        self, 
        action: str, 
        user_id: str, 
        resource_type: str, 
        resource_id: str, 
        details: Optional[Dict[str, Any]] = None,
        status: str = "success"
    ) -> None:
        """
        Log an audit event for HIPAA compliance.
        
        Args:
            action: The action being performed (e.g., "view", "edit", "delete")
            user_id: ID of the user performing the action
            resource_type: Type of resource being accessed (e.g., "patient", "record")
            resource_id: ID of the resource being accessed
            details: Additional details about the action
            status: Outcome status ("success", "failure", "error")
        """
        if not self.enable_audit or not self.audit_logger:
            return
        
        # Create audit record
        audit_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_id": str(uuid.uuid4()),
            "action": action,
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "status": status,
            "details": details or {}
        }
        
        # Log audit record as JSON
        self.audit_logger.info(json.dumps(audit_record))


def log_function_call(logger: Optional[HIPAACompliantLogger] = None) -> Callable[[F], F]:
    """
    Decorator to log function calls with timing information.
    
    Args:
        logger: Logger to use. If None, creates a new logger.
        
    Returns:
        Decorated function
    """
    def decorator(func: F) -> F:
        # Get function module and name for logger
        module_name = func.__module__
        func_name = func.__qualname__
        
        # Create logger if not provided
        nonlocal logger
        if logger is None:
            logger = HIPAACompliantLogger(module_name)
        
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Log function call
            logger.debug(f"Calling {func_name}")
            
            # Time the function execution
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.debug(f"{func_name} completed in {execution_time:.4f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"{func_name} failed after {execution_time:.4f}s: {str(e)}")
                raise
        
        return cast(F, wrapper)
    
    return decorator


# Create a default logger for the module
default_logger = HIPAACompliantLogger(__name__)
