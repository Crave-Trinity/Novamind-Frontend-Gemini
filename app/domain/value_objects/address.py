# app/domain/value_objects/address.py
# Value object representing a physical address
# Value objects are immutable and equality is based on their attributes

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Address:
    """
    Value object representing a physical address
    Immutable and equality is based on attributes
    """
    street_line_1: str
    city: str
    state: str
    postal_code: str
    street_line_2: Optional[str] = None
    country: str = "USA"
    
    def __post_init__(self):
        """Validate address data"""
        if not self.street_line_1:
            raise ValueError("Street line 1 cannot be empty")
        if not self.city:
            raise ValueError("City cannot be empty")
        if not self.state:
            raise ValueError("State cannot be empty")
        if not self.postal_code:
            raise ValueError("Postal code cannot be empty")
    
    def formatted(self) -> str:
        """
        Return a formatted address string
        
        Returns:
            Formatted address string
        """
        address_parts = [self.street_line_1]
        
        if self.street_line_2:
            address_parts.append(self.street_line_2)
            
        address_parts.append(f"{self.city}, {self.state} {self.postal_code}")
        
        if self.country != "USA":
            address_parts.append(self.country)
            
        return "\n".join(address_parts)