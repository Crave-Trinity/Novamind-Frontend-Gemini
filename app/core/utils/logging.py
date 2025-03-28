# -*- coding: utf-8 -*-
"""
HIPAA-compliant logging utilities.

This module provides enhanced logging capabilities with HIPAA-compliant PHI sanitization
to ensure protected health information is never exposed in logs.
"""

import asyncio
import logging
import json
from datetime import datetime
from typing import Any, Dict, Optional, Union, List
from functools import wraps

from app.core.config import Settings
from app.core.utils.phi_sanitizer import PHISanitizer, sanitize_log_message

settings = Settings()

class HIPAACompliantLogger:
    """
    HIPAA-compliant logger that ensures sensitive information is properly masked.
    
    Features:
    - PHI masking
    - Audit trail
    - Configurable outputs (file/console)
    - Structured logging
    """
    
    def __init__(self, name: str) -> None:
        """Initialize logger with name."""
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
        
        # Configure handlers based on settings
        if settings.logging.LOG_TO_CONSOLE:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(self._get_formatter())
            self.logger.addHandler(console_handler)
        
        if settings.logging.LOG_TO_FILE:
            file_handler = logging.FileHandler(settings.logging.LOG_FILE_PATH)
            file_handler.setFormatter(self._get_formatter())
            self.logger.addHandler(file_handler)
    
    def _get_formatter(self) -> logging.Formatter:
        """Get HIPAA-compliant log formatter."""
        return logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def _mask_phi(self, message: str) -> str:
        """
        Mask PHI in log messages using the comprehensive PHI sanitizer.
        
        This method ensures that all Protected Health Information (PHI)
        is properly sanitized before being logged, in accordance with
        HIPAA requirements.
        
        Args:
            message: The message to sanitize
            
        Returns:
            A sanitized version of the message with PHI removed
        """
        if not isinstance(message, str):
            return str(message)
            
        return PHISanitizer.sanitize_text(message)
    
    def _create_audit_log(
        self,
        level: int,
        message: str,
        extra: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create an audit log entry with comprehensive PHI sanitization.
        
        Ensures that all PHI is sanitized not only in the main message
        but also in any structured data or extra fields.
        
        Args:
            level: Log level (DEBUG, INFO, etc.)
            message: The log message to be sanitized
            extra: Additional structured data for the log entry
            
        Returns:
            PHI-sanitized structured audit log entry
        """
        audit_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": logging.getLevelName(level),
            "message": self._mask_phi(message),
            "source": self.logger.name
        }
        
        if extra:
            # Use PHISanitizer for complex structured data
            audit_log["extra"] = PHISanitizer.sanitize_structured_data(extra)
        
        return audit_log
    
    def _log(
        self,
        level: int,
        message: str,
        extra: Optional[Dict[str, Any]] = None,
        *args: Any,
        **kwargs: Any
    ) -> None:
        """Base logging method with PHI masking and audit trail."""
        # Create audit log
        audit_log = self._create_audit_log(level, message, extra)
        
        # Log the message
        self.logger.log(
            level,
            json.dumps(audit_log),
            *args,
            **kwargs
        )
        
        # Store audit log if enabled
        if settings.logging.ENABLE_AUDIT_LOGGING:
            self._store_audit_log(audit_log)
    
    def _store_audit_log(self, audit_log: Dict[str, Any]) -> None:
        """Store audit log entry."""
        import os
        import json
        from datetime import datetime
        
        # Ensure audit log directory exists
        audit_log_dir = os.path.join(
            os.path.dirname(settings.logging.LOG_FILE_PATH),
            'audit_logs'
        )
        os.makedirs(audit_log_dir, exist_ok=True)
        
        # Create filename with timestamp for better organization
        timestamp = datetime.now().strftime('%Y%m%d')
        audit_filename = f'audit_{timestamp}.jsonl'
        audit_path = os.path.join(audit_log_dir, audit_filename)
        
        # Append audit log to file
        with open(audit_path, 'a') as f:
            f.write(json.dumps(audit_log) + '\n')
    
    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None, *args: Any, **kwargs: Any) -> None:
        """Log debug message."""
        self._log(logging.DEBUG, message, extra, *args, **kwargs)
    
    def info(self, message: str, extra: Optional[Dict[str, Any]] = None, *args: Any, **kwargs: Any) -> None:
        """Log info message."""
        self._log(logging.INFO, message, extra, *args, **kwargs)
    
    def warning(self, message: str, extra: Optional[Dict[str, Any]] = None, *args: Any, **kwargs: Any) -> None:
        """Log warning message."""
        self._log(logging.WARNING, message, extra, *args, **kwargs)
    
    def error(self, message: str, extra: Optional[Dict[str, Any]] = None, *args: Any, **kwargs: Any) -> None:
        """Log error message."""
        self._log(logging.ERROR, message, extra, *args, **kwargs)
    
    def critical(self, message: str, extra: Optional[Dict[str, Any]] = None, *args: Any, **kwargs: Any) -> None:
        """Log critical message."""
        self._log(logging.CRITICAL, message, extra, *args, **kwargs)

def audit_log(event_type: str) -> Any:
    """
    Decorator to create audit log entries for function calls.
    
    Args:
        event_type: Type of event being audited
    """
    def decorator(func: Any) -> Any:
        @wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            logger = HIPAACompliantLogger(func.__module__)
            try:
                result = await func(*args, **kwargs)
                logger.info(
                    f"{event_type} completed successfully",
                    {"function": func.__name__}
                )
                return result
            except Exception as e:
                logger.error(
                    f"{event_type} failed",
                    {
                        "function": func.__name__,
                        "error": str(e)
                    }
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            logger = HIPAACompliantLogger(func.__module__)
            try:
                result = func(*args, **kwargs)
                logger.info(
                    f"{event_type} completed successfully",
                    {"function": func.__name__}
                )
                return result
            except Exception as e:
                logger.error(
                    f"{event_type} failed",
                    {
                        "function": func.__name__,
                        "error": str(e)
                    }
                )
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator
