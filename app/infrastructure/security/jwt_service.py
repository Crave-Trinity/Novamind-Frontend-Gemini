# -*- coding: utf-8 -*-
"""JWT token service for authentication."""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

import jwt
from pydantic import ValidationError

from app.core.config import settings, Settings
from app.core.utils.logging import HIPAACompliantLogger

logger = HIPAACompliantLogger(__name__)

class JWTService:
    """
    JWT token service for authentication and authorization.
    
    Implements secure token creation and validation following HIPAA best practices.
    """
    
    def __init__(
        self, 
        settings_instance: Optional[Settings] = None,
        secret_key: Optional[str] = None,
        algorithm: Optional[str] = None,
        access_token_expire_minutes: Optional[int] = None,
        refresh_token_expire_days: Optional[int] = None,
        audience: Optional[str] = None,
        issuer: Optional[str] = None
    ) -> None:
        """
        Initialize JWT service with configuration.
        
        Args:
            settings_instance: Settings object containing JWT configuration
            secret_key: Secret key for JWT signing
            algorithm: JWT algorithm (default: HS256)
            access_token_expire_minutes: Access token expiration time in minutes
            refresh_token_expire_days: Refresh token expiration time in days
            audience: Token audience claim
            issuer: Token issuer claim
        """
        if settings_instance:
            settings_obj = settings_instance
        else:
            settings_obj = settings
            
        self.secret_key = secret_key or settings_obj.security.JWT_SECRET_KEY
        self.algorithm = algorithm or settings_obj.security.JWT_ALGORITHM
        self.access_token_expire_minutes = access_token_expire_minutes or settings_obj.security.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = refresh_token_expire_days or settings_obj.security.JWT_REFRESH_TOKEN_EXPIRE_DAYS
        self.audience = audience or settings_obj.security.JWT_AUDIENCE
        self.issuer = issuer or settings_obj.security.JWT_ISSUER
    
    def _create_token(
        self,
        data: Dict[str, Any],
        token_type: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT token with common logic for access and refresh tokens.
        
        Args:
            data: Data to include in the token
            token_type: Token type (access or refresh)
            expires_delta: Custom expiration time
            
        Returns:
            JWT token as a string
            
        Raises:
            Exception: If token creation fails
        """
        # Set up token data
        now = datetime.utcnow()
        
        # Create copy of data to prevent mutating the original
        payload = data.copy()
        
        # Add standard claims
        payload.update({
            "iat": now,
            "aud": self.audience,
            "iss": self.issuer,
            "type": token_type
        })
        
        # Add expiration
        if expires_delta:
            expire = now + expires_delta
        elif token_type == "refresh":
            expire = now + timedelta(days=self.refresh_token_expire_days)
        else:  # access token
            expire = now + timedelta(minutes=self.access_token_expire_minutes)
            
        payload["exp"] = expire
        
        # Encode and return the token
        try:
            encoded_jwt = jwt.encode(
                payload,
                self.secret_key,
                algorithm=self.algorithm
            )
            
            # Don't log user-specific data
            logger.debug(f"{token_type.capitalize()} token created")
            return encoded_jwt
            
        except Exception as e:
            logger.error(
                f"Failed to create {token_type} token",
                {"error": str(e)}
            )
            raise
    
    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: Token claims (must include 'sub')
            expires_delta: Custom expiration time
            
        Returns:
            JWT token as a string
        """
        return self._create_token(data, "access", expires_delta)
    
    def create_refresh_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT refresh token with longer expiration.
        
        Args:
            data: Token claims (must include 'sub')
            expires_delta: Custom expiration time
            
        Returns:
            JWT refresh token as a string
        """
        return self._create_token(data, "refresh", expires_delta)
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token to verify
            
        Returns:
            Decoded token payload
            
        Raises:
            jwt.ExpiredSignatureError: If token is expired
            jwt.InvalidAudienceError: If audience claim is invalid
            jwt.InvalidIssuerError: If issuer claim is invalid
            jwt.InvalidSignatureError: If token signature is invalid
            jwt.DecodeError: If token is malformed
            ValueError: For other token validation errors
        """
        try:
            # Decode the token with validation of audience and issuer
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                audience=self.audience,
                issuer=self.issuer
            )
            
            logger.debug("JWT token verified")
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            raise
            
        except jwt.InvalidAudienceError:
            logger.warning("JWT token has invalid audience")
            raise
            
        except jwt.InvalidIssuerError:
            logger.warning("JWT token has invalid issuer")
            raise
            
        except jwt.InvalidSignatureError:
            logger.warning("JWT token has invalid signature")
            raise
            
        except jwt.DecodeError:
            logger.warning("JWT token is malformed")
            raise
            
        except (jwt.PyJWTError, ValidationError) as e:
            logger.error(f"JWT validation error: {str(e)}")
            raise ValueError(f"Token validation error: {str(e)}")
    
    def refresh_access_token(self, refresh_token: str) -> str:
        """
        Generate a new access token using a valid refresh token.
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            New access token
            
        Raises:
            ValueError: If token is not a refresh token or is invalid
        """
        # Verify the refresh token
        payload = self.verify_token(refresh_token)
        
        # Check if it's a refresh token
        if not payload.get("refresh", False) and payload.get("type") != "refresh":
            logger.warning("Attempted to use non-refresh token for refresh")
            raise ValueError("Not a refresh token")
        
        # Create new access token with the same subject and role
        data = {k: v for k, v in payload.items() if k not in ["exp", "iat", "refresh", "type"]}
        
        return self.create_access_token(data)
    
    def get_token_identity(self, token: str) -> str:
        """
        Extract user identity (sub claim) from token.
        
        Args:
            token: JWT token
            
        Returns:
            Token subject (user identity)
            
        Raises:
            ValueError: If token doesn't have a subject claim
        """
        payload = self.verify_token(token)
        if "sub" not in payload:
            raise ValueError("Token missing 'sub' claim")
        return payload["sub"]
