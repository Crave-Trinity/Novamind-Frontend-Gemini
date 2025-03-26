# app/domain/value_objects/contact_info.py
import re
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class ContactInfo:
    """
    Immutable value object representing contact information.
    Frozen to ensure immutability.
    """
    email: str
    phone: str
    preferred_contact_method: Optional[str] = None
    
    def __post_init__(self):
        """Validate contact information after initialization"""
        if not self._is_valid_email(self.email):
            raise ValueError("Invalid email format")
        
        if not self._is_valid_phone(self.phone):
            raise ValueError("Invalid phone format")
        
        if self.preferred_contact_method and self.preferred_contact_method not in ["email", "phone"]:
            raise ValueError("Preferred contact method must be either 'email' or 'phone'")
    
    def _is_valid_email(self, email: str) -> bool:
        """
        Validate email format
        
        Args:
            email: The email to validate
            
        Returns:
            True if valid, False otherwise
        """
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        return bool(email_pattern.match(email))
    
    def _is_valid_phone(self, phone: str) -> bool:
        """
        Validate phone format (basic check)
        
        Args:
            phone: The phone number to validate
            
        Returns:
            True if valid, False otherwise
        """
        # Remove common separators for validation
        clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Basic check for US phone format (10 digits)
        return len(clean_phone) == 10 and clean_phone.isdigit()
    
    @property
    def formatted_phone(self) -> str:
        """Return formatted phone number"""
        clean_phone = re.sub(r'[\s\-\(\)]', '', self.phone)
        if len(clean_phone) == 10:
            return f"({clean_phone[:3]}) {clean_phone[3:6]}-{clean_phone[6:]}"
        return self.phone
