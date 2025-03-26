# app/domain/value_objects/address.py
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Address:
    """
    Immutable value object representing a physical address.
    Frozen to ensure immutability.
    """
    street1: str
    city: str
    state: str
    postal_code: str
    street2: Optional[str] = None
    country: str = "USA"
    
    def __post_init__(self):
        """Validate address fields after initialization"""
        if not self.street1:
            raise ValueError("Street1 cannot be empty")
        
        if not self.city:
            raise ValueError("City cannot be empty")
        
        if not self.state or len(self.state) != 2:
            raise ValueError("State must be a valid 2-letter code")
        
        if not self.postal_code or not self._is_valid_postal_code(self.postal_code):
            raise ValueError("Invalid postal code format")
    
    def _is_valid_postal_code(self, postal_code: str) -> bool:
        """
        Validate US postal code format (basic check)
        
        Args:
            postal_code: The postal code to validate
            
        Returns:
            True if valid, False otherwise
        """
        # Basic US zip code validation (5 digits or 5+4)
        if self.country == "USA":
            return (len(postal_code) == 5 and postal_code.isdigit()) or                    (len(postal_code) == 10 and postal_code[5] == '-' and 
                    postal_code[:5].isdigit() and postal_code[6:].isdigit())
        return True  # Skip validation for non-US countries
    
    @property
    def formatted(self) -> str:
        """Return formatted address string"""
        street = f"{self.street1}, {self.street2}" if self.street2 else self.street1
        return f"{street}, {self.city}, {self.state} {self.postal_code}, {self.country}"
