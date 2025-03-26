# NOVAMIND: JWT Token Management

## 1. Overview

JSON Web Tokens (JWT) provide a secure method for transmitting claims between parties. In NOVAMIND, we use JWTs for maintaining authentication state while adhering to HIPAA security requirements.

## 2. JWT Configuration for HIPAA Compliance

JWTs must be configured with specific security parameters for healthcare applications:

- **Short Expiration Times**: 15-30 minutes for access tokens (HIPAA requirement)
- **Refresh Token Rotation**: New refresh token with each use
- **Token Encryption**: JWE (JSON Web Encryption) for sensitive claims
- **Signature Algorithm**: RS256 (RSA Signature with SHA-256)
- **Required Claims**: `iss` (issuer), `sub` (subject), `exp` (expiration time), `jti` (JWT ID)

## 3. JWT Service Implementation

```python
# app/infrastructure/services/jwt_service.py
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Union

import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from app.config.settings import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class JWTService:
    """Service for JWT token operations with HIPAA-compliant settings"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.SECURITY_ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def create_access_token(
        self, subject: Union[str, Dict], scopes: Optional[list] = None
    ) -> str:
        """
        Create a HIPAA-compliant access token with short expiry time
        
        Args:
            subject: User identity (typically user_id or email)
            scopes: Optional permission scopes
            
        Returns:
            JWT access token
        """
        # Calculate token lifetime
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        # Create payload with HIPAA-required claims
        payload = {
            # Standard claims
            "sub": str(subject) if not isinstance(subject, dict) else subject.get("sub"),
            "exp": expire.timestamp(),
            "iat": datetime.utcnow().timestamp(),
            "iss": "novamind-api",  # Token issuer
            "jti": f"{int(time.time() * 1000)}-{subject}",  # Unique token ID
        }
        
        # Add custom claims
        if isinstance(subject, dict):
            # Add all fields except 'sub' which is already added
            for key, value in subject.items():
                if key != "sub":
                    payload[key] = value
        
        # Add scopes if provided
        if scopes:
            payload["scopes"] = scopes
        
        # Create the token
        encoded_jwt = jwt.encode(
            payload, 
            self.secret_key, 
            algorithm=self.algorithm
        )
        
        return encoded_jwt
    
    def create_refresh_token(self, subject: Union[str, Dict]) -> str:
        """
        Create a long-lived refresh token
        
        Args:
            subject: User identity (typically user_id or email)
            
        Returns:
            JWT refresh token
        """
        # Calculate token lifetime (much longer than access token)
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        # Create refresh token payload
        payload = {
            # Only include necessary claims
            "sub": str(subject) if not isinstance(subject, dict) else subject.get("sub"),
            "exp": expire.timestamp(),
            "iat": datetime.utcnow().timestamp(),
            "iss": "novamind-api",
            "jti": f"refresh-{int(time.time() * 1000)}-{subject}",
            "token_type": "refresh"
        }
        
        # Add username if dict is provided
        if isinstance(subject, dict) and "username" in subject:
            payload["username"] = subject["username"]
        
        # Create the token
        encoded_jwt = jwt.encode(
            payload, 
            self.secret_key, 
            algorithm=self.algorithm
        )
        
        return encoded_jwt
    
    def decode_token(self, token: str) -> Dict:
        """
        Decode and verify a JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload
            
        Raises:
            InvalidTokenError: If token is invalid
            ExpiredSignatureError: If token has expired
        """
        try:
            # Decode and verify the token
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_signature": True}
            )
            
            # Explicitly verify token didn't expire
            if datetime.fromtimestamp(payload["exp"]) < datetime.utcnow():
                raise ExpiredSignatureError("Token has expired")
                
            return payload
            
        except ExpiredSignatureError as e:
            logger.warning(f"Expired token: {e}")
            raise
            
        except InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            raise
    
    def decode_expired_token(self, token: str) -> Dict:
        """
        Decode a token without checking expiration (useful for token refresh)
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload even if expired
            
        Raises:
            InvalidTokenError: If token is invalid for other reasons
        """
        try:
            # Decode without verifying expiration
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_signature": True, "verify_exp": False}
            )
            return payload
            
        except InvalidTokenError as e:
            logger.warning(f"Invalid token (non-expiry reason): {e}")
            raise
```

## 4. Using JWT in FastAPI Endpoints

### 4.1 Authentication Middleware

```python
# app/infrastructure/middleware/auth_middleware.py
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware

from app.infrastructure.services.jwt_service import JWTService
from app.utils.logger import get_logger

logger = get_logger(__name__)
jwt_service = JWTService()
security = HTTPBearer()


class JWTMiddleware(BaseHTTPMiddleware):
    """Middleware for JWT token verification"""
    
    async def dispatch(self, request: Request, call_next):
        # Paths that don't require authentication
        open_paths = [
            "/api/v1/auth/token", 
            "/api/v1/auth/register",
            "/api/v1/auth/confirm",
            "/api/v1/auth/refresh",
            "/api/docs",
            "/api/redoc",
            "/openapi.json",
        ]
        
        # Skip authentication for open paths
        if request.url.path in open_paths:
            return await call_next(request)
        
        # Extract token from authorization header
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify token
            payload = jwt_service.decode_token(token)
            
            # Add payload to request state for use in endpoint handlers
            request.state.user = payload
            
            # Audit logging for HIPAA compliance (omit sensitive data)
            logger.info(
                "Authenticated access",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "user_id": payload.get("sub"),
                    # Do not log IP addresses or full tokens for HIPAA compliance
                }
            )
            
            return await call_next(request)
            
        except Exception as e:
            logger.warning(
                f"Authentication failed: {str(e)}",
                extra={"path": request.url.path, "method": request.method}
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
```

### 4.2 Token Blacklisting for HIPAA Compliance

For enhanced security, implement a token blacklist to invalidate tokens after logout:

```python
# app/infrastructure/services/token_blacklist_service.py
import time
from datetime import datetime
from typing import Optional

import redis

from app.config.settings import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class TokenBlacklistService:
    """Service for JWT token blacklisting (revocation)"""
    
    def __init__(self):
        # Connect to Redis
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            ssl=settings.REDIS_SSL,
            decode_responses=True,
        )
        self.key_prefix = "token:blacklist:"
    
    async def blacklist_token(self, jti: str, expires_at: Optional[int] = None) -> bool:
        """
        Add a token to the blacklist
        
        Args:
            jti: JWT ID to blacklist
            expires_at: Token expiration timestamp
            
        Returns:
            Success status
        """
        try:
            # Calculate time to live (TTL) for Redis key
            ttl = None
            if expires_at:
                now = int(time.time())
                ttl = max(0, expires_at - now)  # Ensure positive TTL
            
            # Add token to blacklist
            key = f"{self.key_prefix}{jti}"
            if ttl:
                self.redis_client.setex(key, ttl, "1")
            else:
                # Default to 24 hours if no expiration provided
                self.redis_client.setex(key, 86400, "1")
                
            logger.info(f"Token blacklisted: {jti}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to blacklist token: {str(e)}")
            return False
    
    async def is_blacklisted(self, jti: str) -> bool:
        """
        Check if a token is blacklisted
        
        Args:
            jti: JWT ID to check
            
        Returns:
            True if token is blacklisted
        """
        try:
            key = f"{self.key_prefix}{jti}"
            return bool(self.redis_client.exists(key))
            
        except Exception as e:
            logger.error(f"Failed to check blacklisted token: {str(e)}")
            # Default to allowing the token if Redis is down
            # This is a security risk, but prevents complete system failure
            return False
    
    async def clear_expired_tokens(self) -> int:
        """
        Remove expired tokens from the blacklist (maintenance task)
        
        Returns:
            Number of tokens removed
        """
        # Redis automatically handles expiration with TTL
        # This method is mostly a placeholder for future extension
        return 0
```

## 5. Token Lifecycle Management

### 5.1 Complete Token Flow

1. **Login**: User authenticates via Cognito, receives JWT tokens
2. **Token Usage**: Access token for API calls (short-lived)
3. **Token Refresh**: Refresh token used to get new access token
4. **Token Invalidation**: Blacklist tokens on logout for security

### 5.2 Implementing Token Refresh

```python
# app/presentation/api/v1/endpoints/auth.py (extension from previous guide)

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    token_blacklist: TokenBlacklistService = Depends(get_token_blacklist_service),
    current_user: dict = Depends(get_current_user),
):
    """Logout user by blacklisting current token"""
    # Get token from request header
    token = request.headers.get("Authorization").split()[1]
    
    # Decode to get the JTI and expiration
    token_data = jwt_service.decode_token(token)
    jti = token_data.get("jti")
    exp = token_data.get("exp")
    
    # Blacklist the token
    await token_blacklist.blacklist_token(jti, exp)
    
    # Also blacklist refresh token if stored in session
    refresh_jti = token_data.get("refresh_jti")
    if refresh_jti:
        await token_blacklist.blacklist_token(refresh_jti)
    
    return None
```

## 6. HIPAA Security Considerations

1. **Token Lifetime**: Keep access tokens short-lived (15-30 minutes max)
2. **Sensitive Claims**: Never store PHI/PII in JWT claims
3. **Token Storage**: Store tokens securely with appropriate HTTP-only cookies and secure flags
4. **Audit Trail**: Log all token operations for HIPAA compliance (issuance, refresh, invalidation)
5. **Automatic Session Timeout**: Implement inactive session timeout after 15 minutes

## 7. JWT Security Best Practices

1. **Signature Algorithm**: Use RS256 (asymmetric) over HS256 (symmetric) for production
2. **Critical Claims**: Include `nbf` (not before) and `aud` (audience) claims
3. **JWK Rotation**: Implement key rotation for production environments
4. **Token Size**: Keep token size small by minimizing custom claims
5. **Refresh Token Encryption**: Store refresh tokens with additional encryption
6. **Key Security**: Use AWS KMS for managing JWT signing keys in production

JWT management provides the critical foundation for maintaining authentication in a HIPAA-compliant manner. This implementation balances security with usability while prioritizing patient data protection.
