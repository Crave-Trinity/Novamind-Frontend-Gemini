# NOVAMIND: AWS Cognito Authentication

## 1. Overview

AWS Cognito provides a secure, scalable user directory that can be integrated with HIPAA-compliant applications. This document details the implementation of AWS Cognito for authentication in the NOVAMIND platform.

## 2. AWS Cognito Setup

### 2.1 User Pool Configuration

Required configurations for HIPAA compliance:

- **MFA**: Required for all users
- **Password Policy**:
  - Minimum length: 12 characters
  - Require uppercase, lowercase, numbers, and special characters
  - Password expiration: 90 days
  - No password reuse (remember last 5 passwords)
- **Advanced Security**: Enable to detect compromised credentials
- **Account Recovery**: Email only, no phone recovery
- **Sign-in Options**: Email (no username option to prevent PHI in usernames)

### 2.2 App Client Settings

- **OAuth 2.0**: Authorization code grant flow
- **Callback URL**: HTTPS only endpoints
- **Sign out URL**: Configured for proper session termination
- **Identity Providers**: Email/password only initially

## 3. Cognito Service Implementation

```python
# app/infrastructure/services/cognito_service.py
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Optional

from app.config.settings import get_settings


class CognitoService:
    """Service for AWS Cognito operations"""

    def __init__(
        self,
        user_pool_id: str = None,
        client_id: str = None,
        region: str = None
    ):
        settings = get_settings()
        self.user_pool_id = user_pool_id or settings.AWS_COGNITO_USER_POOL_ID
        self.client_id = client_id or settings.AWS_COGNITO_CLIENT_ID
        self.region = region or settings.AWS_REGION

        # Initialize Cognito Identity Provider client
        self.client = boto3.client(
            'cognito-idp',
            region_name=self.region
        )

    async def register_user(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        user_attributes: Optional[Dict] = None
    ) -> Dict:
        """Register a new user in Cognito"""
        attributes = [
            {'Name': 'email', 'Value': email},
            {'Name': 'given_name', 'Value': first_name},
            {'Name': 'family_name', 'Value': last_name},
            {'Name': 'email_verified', 'Value': 'true'},  # Auto-verify for testing only
        ]

        # Add any additional attributes
        if user_attributes:
            for name, value in user_attributes.items():
                attributes.append({'Name': name, 'Value': value})

        try:
            response = self.client.sign_up(
                ClientId=self.client_id,
                Username=email,
                Password=password,
                UserAttributes=attributes
            )
            return {
                'user_id': response['UserSub'],
                'username': email,
                'status': 'CONFIRMATION_PENDING'
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Cognito Error: {error_code} - {error_message}")

    async def confirm_registration(self, email: str, confirmation_code: str) -> Dict:
        """Confirm user registration with the confirmation code"""
        try:
            self.client.confirm_sign_up(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=confirmation_code
            )
            return {'status': 'CONFIRMED', 'username': email}
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Cognito Error: {error_code} - {error_message}")

    async def authenticate_user(self, email: str, password: str) -> Dict:
        """Authenticate a user and return tokens"""
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )

            # Check if MFA is required
            if response.get('ChallengeName') == 'SOFTWARE_TOKEN_MFA':
                return {
                    'status': 'MFA_REQUIRED',
                    'session': response.get('Session')
                }

            # Return authentication tokens
            auth_result = response['AuthenticationResult']
            return {
                'status': 'AUTHENTICATED',
                'access_token': auth_result['AccessToken'],
                'id_token': auth_result['IdToken'],
                'refresh_token': auth_result['RefreshToken'],
                'expires_in': auth_result['ExpiresIn']
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Cognito Error: {error_code} - {error_message}")

    async def verify_mfa(self, session: str, email: str, mfa_code: str) -> Dict:
        """Verify MFA code to complete authentication"""
        try:
            response = self.client.respond_to_auth_challenge(
                ClientId=self.client_id,
                ChallengeName='SOFTWARE_TOKEN_MFA',
                Session=session,
                ChallengeResponses={
                    'USERNAME': email,
                    'SOFTWARE_TOKEN_MFA_CODE': mfa_code
                }
            )

            # Return authentication tokens
            auth_result = response['AuthenticationResult']
            return {
                'status': 'AUTHENTICATED',
                'access_token': auth_result['AccessToken'],
                'id_token': auth_result['IdToken'],
                'refresh_token': auth_result['RefreshToken'],
                'expires_in': auth_result['ExpiresIn']
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Cognito Error: {error_code} - {error_message}")

    async def refresh_tokens(self, refresh_token: str) -> Dict:
        """Refresh access token using refresh token"""
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token
                }
            )

            auth_result = response['AuthenticationResult']
            return {
                'status': 'REFRESHED',
                'access_token': auth_result['AccessToken'],
                'id_token': auth_result['IdToken'],
                'expires_in': auth_result['ExpiresIn']
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Cognito Error: {error_code} - {error_message}")

    async def get_user_info(self, access_token: str) -> Dict:
        """Get user information using access token"""
        try:
            response = self.client.get_user(
                AccessToken=access_token
            )

            # Parse user attributes
            user_attrs = {}
            for attr in response['UserAttributes']:
                user_attrs[attr['Name']] = attr['Value']

            return {
                'username': response['Username'],
                'user_attributes': user_attrs
            }
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            raise Exception(f"Cognito Error: {error_code} - {error_message}")
```python

## 4. FastAPI Integration

```python
# app/presentation/api/dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.infrastructure.services.cognito_service import CognitoService
from app.infrastructure.services.jwt_service import JWTService
from app.config.settings import get_settings

settings = get_settings()

# OAuth2 scheme for Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Services
cognito_service = CognitoService()
jwt_service = JWTService()


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency for getting the current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Verify the JWT token
        payload = jwt_service.decode_token(token)
        username: str = payload.get("username")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    # Get user info from Cognito
    try:
        user_info = await cognito_service.get_user_info(token)
        return user_info
    except Exception:
        raise credentials_exception


async def get_current_active_user(current_user = Depends(get_current_user)):
    """Dependency for getting the current active user"""
    if current_user.get("user_attributes", {}).get("status") != "CONFIRMED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active",
        )
    return current_user


async def get_admin_user(current_user = Depends(get_current_active_user)):
    """Dependency for admin users only"""
    # Check if user has admin role
    user_groups = current_user.get("user_attributes", {}).get("cognito:groups", "")
    if "admin" not in user_groups.split(","):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
```python

## 5. Authentication Routes

```python
# app/presentation/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.infrastructure.services.cognito_service import CognitoService
from app.presentation.schemas.auth import (
    RegisterUserRequest,
    ConfirmRegistrationRequest,
    AuthResponse,
    MFARequest,
    RefreshTokenRequest,
)

router = APIRouter()
cognito_service = CognitoService()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(request: RegisterUserRequest):
    """Register a new user"""
    try:
        result = await cognito_service.register_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/confirm", response_model=dict)
async def confirm_registration(request: ConfirmRegistrationRequest):
    """Confirm user registration with confirmation code"""
    try:
        result = await cognito_service.confirm_registration(
            email=request.email,
            confirmation_code=request.confirmation_code,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/token", response_model=AuthResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 compatible token login, get an access token for future requests"""
    try:
        result = await cognito_service.authenticate_user(
            email=form_data.username,  # OAuth2 uses username field for email
            password=form_data.password,
        )

        # Check if MFA is required
        if result.get("status") == "MFA_REQUIRED":
            return {
                "status": "MFA_REQUIRED",
                "session": result.get("session"),
            }

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/verify-mfa", response_model=AuthResponse)
async def verify_mfa(request: MFARequest):
    """Verify MFA code to complete authentication"""
    try:
        result = await cognito_service.verify_mfa(
            session=request.session,
            email=request.email,
            mfa_code=request.mfa_code,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        result = await cognito_service.refresh_tokens(
            refresh_token=request.refresh_token,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
```python

## 6. Authentication Schemas

```python
# app/presentation/schemas/auth.py
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterUserRequest(BaseModel):
    """Schema for user registration request"""
    email: EmailStr
    password: str = Field(..., min_length=12)
    first_name: str
    last_name: str


class ConfirmRegistrationRequest(BaseModel):
    """Schema for confirming user registration"""
    email: EmailStr
    confirmation_code: str = Field(..., min_length=6, max_length=6)


class MFARequest(BaseModel):
    """Schema for MFA verification request"""
    email: EmailStr
    session: str
    mfa_code: str = Field(..., min_length=6, max_length=6)


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    status: str
    access_token: Optional[str] = None
    id_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    session: Optional[str] = None
```python

## 7. HIPAA Compliance Considerations

- **Automatic Session Timeouts**: Set Cognito session timeouts to 15 minutes of inactivity
- **Audit Logging**: Log all auth-related events (login, logout, token refresh) in a HIPAA-compliant manner
- **Failed Login Attempts**: Lock accounts after 5 failed login attempts
- **Password Rotation**: Enforce 90-day password rotation policy
- **MFA Enforcement**: Require MFA for all user types (patients, providers, admins)

## 8. Testing the Authentication Flow

1. Register a new user
1. Confirm registration with the verification code
1. Login to receive MFA challenge
1. Complete MFA verification to get tokens
1. Use access token for authenticated API calls
1. Refresh token when expired

The authentication flow uses AWS Cognito best practices and is designed to meet all HIPAA requirements for healthcare applications.
