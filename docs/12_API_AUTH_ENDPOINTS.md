# NOVAMIND: Authentication API Endpoints

## 1. Overview

This document details the implementation of authentication endpoints for the NOVAMIND concierge psychiatry platform, focusing on HIPAA-compliant user management, secure authentication flows, and token handling.

## 2. Authentication Flow

The NOVAMIND platform implements a multi-stage authentication flow:

1. **Registration**: User provides email and creates password
1. **Confirmation**: Email verification via confirmation code
1. **Login**: Credentials validated, tokens issued
1. **Token Refresh**: Access token refreshed using refresh token
1. **Password Reset**: Secure password recovery flow
1. **MFA**: Multi-factor authentication for enhanced security

## 3. Authentication Endpoints

### 3.1 User Registration

```python
# app/presentation/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.domain.exceptions.auth import UserAlreadyExistsError
from app.infrastructure.services.cognito_service import CognitoService
from app.presentation.schemas.auth import RegisterUserRequest, RegisterUserResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/register",
    response_model=RegisterUserResponse,
    status_code=status.HTTP_201_CREATED,
    description="Register a new user with email and password"
)
async def register_user(
    request: RegisterUserRequest,
    cognito_service: CognitoService = Depends(),
):
    """
    Register a new user in the system

    - Validates email format and password requirements
    - Creates user in Cognito user pool
    - Sends confirmation code to user's email
    - Returns confirmation status and next steps

    HIPAA Compliance:
    - No PHI stored during registration
    - Secured with HTTPS
    - Password policy enforced via Cognito
    """
    try:
        # Register user with Cognito
        result = await cognito_service.register_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name
        )

        # HIPAA-compliant audit logging (omitting sensitive data)
        logger.info(
            "User registration attempt",
            extra={
                "email_domain": request.email.split('@')[1],
                "status": "success"
            }
        )

        # Return success response with next steps
        return RegisterUserResponse(
            message="User registration successful. Please check your email for confirmation code.",
            user_id=result["user_id"],
            requires_confirmation=True
        )

    except UserAlreadyExistsError as e:
        # Log the error (without exposing personal data)
        logger.warning(
            "User registration failed - email already exists",
            extra={
                "email_domain": request.email.split('@')[1],
            }
        )

        # Return user-friendly error
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists."
        )

    except Exception as e:
        # Generic error logging (for debugging, without PHI)
        logger.error(
            f"User registration failed: {str(e)}",
            extra={
                "email_domain": request.email.split('@')[1],
            }
        )

        # Return generic error to avoid information disclosure
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again later."
        )
```python

### 3.2 User Confirmation

```python
@router.post(
    "/confirm",
    status_code=status.HTTP_200_OK,
    description="Confirm user registration with code from email"
)
async def confirm_registration(
    user_id: str,
    confirmation_code: str,
    cognito_service: CognitoService = Depends(),
):
    """
    Confirm user registration with verification code

    - Validates confirmation code sent to user's email
    - Activates user account if code is valid
    - Returns confirmation success message

    HIPAA Compliance:
    - Secured with HTTPS
    - Audit logging of confirmation attempts
    """
    try:
        # Confirm registration with Cognito
        await cognito_service.confirm_registration(
            user_id=user_id,
            confirmation_code=confirmation_code
        )

        # HIPAA-compliant audit logging
        logger.info(
            "User confirmation successful",
            extra={
                "user_id": user_id,
                "status": "success"
            }
        )

        # Return success response
        return {"message": "User confirmed successfully. You can now login."}

    except Exception as e:
        # Log the error
        logger.warning(
            f"User confirmation failed: {str(e)}",
            extra={
                "user_id": user_id,
                "status": "failure"
            }
        )

        # Return user-friendly error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation code. Please try again."
        )
```python

### 3.3 User Login

```python
@router.post(
    "/token",
    status_code=status.HTTP_200_OK,
    description="Login with email and password to receive JWT tokens"
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    cognito_service: CognitoService = Depends(),
    jwt_service: JWTService = Depends(),
):
    """
    Authenticate user and issue JWT tokens

    - Validates user credentials against Cognito
    - Issues access and refresh tokens
    - Returns tokens and user information

    HIPAA Compliance:
    - Secured with HTTPS
    - Audit logging of login attempts
    - Short-lived access tokens (15-30 minutes)
    - No PHI in token claims
    """
    try:
        # Authenticate user with Cognito
        auth_result = await cognito_service.login_user(
            username=form_data.username,
            password=form_data.password
        )

        # Extract user info from Cognito response
        user_id = auth_result["user_id"]
        email = auth_result["email"]

        # Get user roles from database
        user_roles = await role_service.get_user_roles(user_id)

        # Create token payload with claims
        token_data = {
            "sub": user_id,
            "email": email,
            "roles": [role.value for role in user_roles]
        }

        # Generate JWT tokens
        access_token = jwt_service.create_access_token(token_data)
        refresh_token = jwt_service.create_refresh_token(token_data)

        # HIPAA-compliant audit logging
        logger.info(
            "User login successful",
            extra={
                "user_id": user_id,
                "roles": [role.value for role in user_roles],
                "status": "success"
            }
        )

        # Return tokens and user info
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "roles": [role.value for role in user_roles]
            }
        }

    except Exception as e:
        # Log the error (without exposing credentials)
        logger.warning(
            f"Login failed: {str(e)}",
            extra={
                "username_domain": form_data.username.split('@')[1] if '@' in form_data.username else None,
                "status": "failure"
            }
        )

        # Return user-friendly error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```python

### 3.4 Token Refresh

```python
@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    description="Refresh access token using refresh token"
)
async def refresh_token(
    refresh_token: str,
    jwt_service: JWTService = Depends(),
    token_blacklist: TokenBlacklistService = Depends(),
):
    """
    Refresh access token using refresh token

    - Validates refresh token
    - Issues new access token
    - Optionally rotates refresh token
    - Returns new tokens

    HIPAA Compliance:
    - Secured with HTTPS
    - Audit logging of token refresh
    - Token blacklisting for revoked tokens
    """
    try:
        # Verify refresh token
        token_data = jwt_service.decode_token(refresh_token)

        # Check if token is blacklisted
        jti = token_data.get("jti")
        if await token_blacklist.is_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify token type
        if token_data.get("token_type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create new token payload
        user_id = token_data.get("sub")
        new_token_data = {
            "sub": user_id,
            "email": token_data.get("email"),
            "roles": token_data.get("roles", []),
            "refresh_jti": jti  # Link to original refresh token
        }

        # Generate new tokens
        new_access_token = jwt_service.create_access_token(new_token_data)

        # Optionally rotate refresh token for enhanced security
        new_refresh_token = jwt_service.create_refresh_token(new_token_data)

        # Blacklist old refresh token (token rotation)
        await token_blacklist.blacklist_token(jti, token_data.get("exp"))

        # HIPAA-compliant audit logging
        logger.info(
            "Token refresh successful",
            extra={
                "user_id": user_id,
                "status": "success"
            }
        )

        # Return new tokens
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    except Exception as e:
        # Log the error
        logger.warning(
            f"Token refresh failed: {str(e)}",
            extra={
                "status": "failure"
            }
        )

        # Return user-friendly error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
```python

### 3.5 Password Reset Request

```python
@router.post(
    "/reset-password-request",
    status_code=status.HTTP_200_OK,
    description="Request password reset via email"
)
async def request_password_reset(
    email: str,
    cognito_service: CognitoService = Depends(),
):
    """
    Request password reset code

    - Sends reset code to user's email
    - Returns success message

    HIPAA Compliance:
    - Secured with HTTPS
    - Audit logging of reset requests
    - No information disclosure on whether email exists
    """
    try:
        # Request password reset from Cognito
        await cognito_service.forgot_password(email)

        # HIPAA-compliant audit logging
        logger.info(
            "Password reset requested",
            extra={
                "email_domain": email.split('@')[1],
                "status": "initiated"
            }
        )

        # Return success message
        # Note: Always return success even if email doesn't exist
        # This prevents user enumeration attacks
        return {
            "message": "If your email exists in our system, you will receive a password reset code."
        }

    except Exception as e:
        # Log the error
        logger.warning(
            f"Password reset request failed: {str(e)}",
            extra={
                "email_domain": email.split('@')[1],
                "status": "failure"
            }
        )

        # Always return the same message to prevent user enumeration
        return {
            "message": "If your email exists in our system, you will receive a password reset code."
        }
```python

### 3.6 Password Reset Confirmation

```python
@router.post(
    "/reset-password-confirm",
    status_code=status.HTTP_200_OK,
    description="Complete password reset with code and new password"
)
async def confirm_password_reset(
    email: str,
    reset_code: str,
    new_password: str,
    cognito_service: CognitoService = Depends(),
):
    """
    Confirm password reset with verification code

    - Validates reset code
    - Sets new password
    - Returns success message

    HIPAA Compliance:
    - Secured with HTTPS
    - Audit logging of password changes
    - Password complexity requirements enforced
    """
    try:
        # Confirm password reset with Cognito
        await cognito_service.confirm_forgot_password(
            email=email,
            confirmation_code=reset_code,
            new_password=new_password
        )

        # HIPAA-compliant audit logging
        logger.info(
            "Password reset completed",
            extra={
                "email_domain": email.split('@')[1],
                "status": "success"
            }
        )

        # Return success message
        return {"message": "Password has been reset successfully. You can now login with your new password."}

    except Exception as e:
        # Log the error
        logger.warning(
            f"Password reset confirmation failed: {str(e)}",
            extra={
                "email_domain": email.split('@')[1],
                "status": "failure"
            }
        )

        # Return user-friendly error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset code or password. Please try again."
        )
```python

### 3.7 Logout

```python
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Logout user by blacklisting tokens"
)
async def logout(
    token_blacklist: TokenBlacklistService = Depends(),
    current_user: dict = Depends(get_current_user),
    request: Request = None,
):
    """
    Logout user by blacklisting current tokens

    - Blacklists current access token
    - Blacklists associated refresh token if available
    - Returns no content on success

    HIPAA Compliance:
    - Secured with HTTPS
    - Audit logging of logout events
    - Complete session termination
    """
    try:
        # Get token from authorization header
        auth_header = request.headers.get("Authorization")
        token = auth_header.split()[1] if auth_header else None

        if token:
            # Get token data
            token_data = jwt_service.decode_token(token)
            jti = token_data.get("jti")
            exp = token_data.get("exp")

            # Blacklist the current token
            await token_blacklist.blacklist_token(jti, exp)

            # Also blacklist the refresh token if linked
            refresh_jti = token_data.get("refresh_jti")
            if refresh_jti:
                await token_blacklist.blacklist_token(refresh_jti)

        # HIPAA-compliant audit logging
        logger.info(
            "User logout",
            extra={
                "user_id": current_user.get("sub"),
                "status": "success"
            }
        )

        # Return no content for successful logout
        return None

    except Exception as e:
        # Log the error
        logger.warning(
            f"Logout failed: {str(e)}",
            extra={
                "user_id": current_user.get("sub") if current_user else None,
                "status": "failure"
            }
        )

        # Still return success to client
        # This is to ensure session appears terminated to user
        return None
```python

## 4. Request/Response Schemas

```python
# app/presentation/schemas/auth.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, SecretStr, validator


class RegisterUserRequest(BaseModel):
    """Schema for user registration request"""
    email: EmailStr = Field(..., description="User's email address")
    password: SecretStr = Field(..., description="User's password")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")

    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        password = v.get_secret_value()
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in password):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in password):
            raise ValueError("Password must contain at least one digit")
        if not any(c in "!@#$%^&*()-_=+[]{}|;:'\",.<>/?`~" for c in password):
            raise ValueError("Password must contain at least one special character")
        return v


class RegisterUserResponse(BaseModel):
    """Schema for user registration response"""
    message: str
    user_id: str
    requires_confirmation: bool


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str
    user: dict
```python

## 5. HIPAA Compliance Measures

The authentication system implements these HIPAA-compliant security measures:

1. **Secure Transmission**: All endpoints require HTTPS
1. **Password Policies**: Enforced complexity and expiration
1. **MFA**: Multi-factor authentication for all clinical users
1. **Audit Logging**: Comprehensive logging of all authentication events
1. **Session Management**: Short-lived access tokens (15-30 min)
1. **Token Blacklisting**: Immediate invalidation of logged-out sessions
1. **Failed Attempt Tracking**: Lockout after multiple failed attempts
1. **Information Disclosure Prevention**: Generic error messages
1. **Account Recovery**: Secure password reset flow

## 6. Authentication Middleware

```python
# app/infrastructure/middleware/auth_middleware.py
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.infrastructure.services.jwt_service import JWTService
from app.infrastructure.services.token_blacklist_service import TokenBlacklistService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware for JWT authentication and verification"""

    def __init__(self, app, jwt_service: JWTService, token_blacklist: TokenBlacklistService):
        super().__init__(app)
        self.jwt_service = jwt_service
        self.token_blacklist = token_blacklist

        # Paths that don't require authentication
        self.public_paths = [
            "/api/v1/auth/token",
            "/api/v1/auth/register",
            "/api/v1/auth/confirm",
            "/api/v1/auth/refresh",
            "/api/v1/auth/reset-password-request",
            "/api/v1/auth/reset-password-confirm",
            "/api/docs",
            "/api/redoc",
            "/openapi.json",
        ]

    async def dispatch(self, request: Request, call_next):
        # Skip authentication for public paths
        if any(request.url.path.startswith(path) for path in self.public_paths):
            return await call_next(request)

        # Get token from authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return self._return_unauthorized("Missing or invalid authorization header")

        token = auth_header.split(" ")[1]

        try:
            # Decode and verify token
            payload = self.jwt_service.decode_token(token)

            # Check token blacklist
            jti = payload.get("jti")
            if await self.token_blacklist.is_blacklisted(jti):
                return self._return_unauthorized("Token has been revoked")

            # Add user data to request state
            request.state.user = payload

            # HIPAA-compliant audit logging
            if request.url.path not in ["/api/healthcheck"]:
                logger.info(
                    "Authenticated request",
                    extra={
                        "user_id": payload.get("sub"),
                        "path": request.url.path,
                        "method": request.method,
                    }
                )

            # Continue processing request
            return await call_next(request)

        except Exception as e:
            # Log authentication failure
            logger.warning(
                f"Authentication failed: {str(e)}",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                }
            )

            return self._return_unauthorized("Invalid authentication token")

    def _return_unauthorized(self, detail: str):
        """Return 401 Unauthorized response"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": detail},
            headers={"WWW-Authenticate": "Bearer"}
        )
```python

## 7. User Management Service

```python
# app/domain/services/user_service.py
from typing import Dict, List, Optional

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.services.cognito_service import CognitoService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class UserService:
    """Service for user management operations"""

    def __init__(
        self,
        user_repository: UserRepository,
        cognito_service: CognitoService,
    ):
        self.user_repository = user_repository
        self.cognito_service = cognito_service

    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return await self.user_repository.get_user_by_id(user_id)

    async def create_user_profile(
        self,
        user_id: str,
        email: str,
        first_name: str,
        last_name: str,
        additional_data: Optional[Dict] = None,
    ) -> User:
        """Create user profile in database after Cognito registration"""
        # Create user entity
        user = User(
            id=user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            additional_data=additional_data or {},
            is_active=True,
        )

        # Save to database
        created_user = await self.user_repository.create_user(user)

        # HIPAA-compliant audit logging
        logger.info(
            "User profile created",
            extra={
                "user_id": user_id,
                "status": "success"
            }
        )

        return created_user

    async def update_user_profile(
        self,
        user_id: str,
        data: Dict,
    ) -> Optional[User]:
        """Update user profile"""
        # Get existing user
        user = await self.get_user(user_id)
        if not user:
            return None

        # Update user fields
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        # Save to database
        updated_user = await self.user_repository.update_user(user)

        # HIPAA-compliant audit logging
        logger.info(
            "User profile updated",
            extra={
                "user_id": user_id,
                "fields_updated": list(data.keys()),
                "status": "success"
            }
        )

        return updated_user

    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        # Deactivate in Cognito
        await self.cognito_service.disable_user(user_id)

        # Update database status
        user = await self.get_user(user_id)
        if user:
            user.is_active = False
            await self.user_repository.update_user(user)

            # HIPAA-compliant audit logging
            logger.info(
                "User deactivated",
                extra={
                    "user_id": user_id,
                    "status": "success"
                }
            )

            return True

        return False
```python

The authentication system forms the foundation of HIPAA compliance by ensuring proper user identification, authorization, and audit logging throughout the application.
