"""
Domain-specific exceptions package for the Novamind concierge psychiatry platform.

This package provides direct access to the exception classes needed by other modules.
"""


# Define exception classes directly in the __init__.py file to avoid circular imports
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
