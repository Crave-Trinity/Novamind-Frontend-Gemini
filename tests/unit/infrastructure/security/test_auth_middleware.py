# -*- coding: utf-8 -*-
"""Unit tests for Authentication Middleware functionality.

This module tests the authentication middleware which enforces secure
access to protected resources and routes in our HIPAA-compliant system.
"""

import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import Headers
from starlette.responses import JSONResponse

from app.infrastructure.security.auth_middleware import (
    AuthMiddleware,
    AuthConfig,
    ProtectedRouteHandler,
    AuthorizationScopes,
    RoleBasedAccessControl,
    JWTAuthBackend,
    CognitoAuthBackend,
    AuthenticationError,
    AuthorizationError,
    TokenExpiredError,
    MissingTokenError,
    InvalidTokenError
)


@pytest.fixture
def auth_config():
    """Create an authentication middleware configuration for testing."""
    return AuthConfig(
        enabled=True,
        secret_key="test-auth-secret-key-must-be-at-least-32-chars-long",
        token_algorithm="HS256",
        auth_backend="jwt",
        exempt_paths=["/health", "/docs", "/openapi.json", "/auth/login"],
        required_scopes={
            "/api/patients": ["read:patients"],
            "/api/clinical-notes": ["read:clinical_notes", "write:clinical_notes"],
            "/api/medications": ["read:medications", "prescribe:medications"]
        },
        role_permissions={
            "admin": ["*"],
            "psychiatrist": ["read:patients", "write:patients", "read:clinical_notes", 
                            "write:clinical_notes", "read:medications", "prescribe:medications"],
            "nurse": ["read:patients", "read:clinical_notes", "read:medications"],
            "patient": ["read:own_records"]
        },
        token_issuer="novamind-auth",
        token_audience="novamind-api",
        auth_header_name="Authorization",
        auth_scheme="Bearer",
        enable_role_based_access=True,
        audit_authentication_attempts=True,
        strict_scope_validation=True
    )


@pytest.fixture
def app():
    """Create a FastAPI app for testing."""
    return FastAPI()


@pytest.fixture
def mock_jwt_service():
    """Create a mock JWT service for testing."""
    mock_service = MagicMock()
    
    # Configure mock validate_token method
    mock_service.validate_token.return_value = MagicMock(
        is_valid=True,
        status="VALID",
        claims={
            "sub": "user123",
            "name": "Dr. Jane Smith",
            "roles": ["psychiatrist"],
            "scopes": ["read:patients", "write:clinical_notes", "prescribe:medications"]
        },
        token_type="access",
        error=None
    )
    
    return mock_service


@pytest.fixture
def auth_middleware(app, auth_config, mock_jwt_service):
    """Create an authentication middleware for testing."""
    middleware = AuthMiddleware(
        app=app,
        config=auth_config
    )
    middleware.jwt_service = mock_jwt_service
    middleware.audit_logger = MagicMock()
    return middleware


@pytest.fixture
def authenticated_request():
    """Create a mock request with a valid authentication token."""
    mock_request = MagicMock(spec=Request)
    
    # Setup request properties
    mock_request.method = "GET"
    mock_request.url.path = "/api/patients"
    mock_request.headers = Headers({"Authorization": "Bearer valid.jwt.token"})
    
    return mock_request


@pytest.fixture
def unauthenticated_request():
    """Create a mock request without an authentication token."""
    mock_request = MagicMock(spec=Request)
    
    # Setup request properties
    mock_request.method = "GET"
    mock_request.url.path = "/api/patients"
    mock_request.headers = Headers({})
    
    return mock_request


class TestAuthMiddleware:
    """Test suite for the authentication middleware."""
    
    @pytest.mark.asyncio
    async def test_valid_authentication(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test successful authentication with a valid token."""
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            # The request state should include authentication information
            assert request.state.user is not None
            assert request.state.user["sub"] == "user123"
            assert request.state.user["roles"] == ["psychiatrist"]
            assert request.state.authenticated is True
            
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify the response
        assert response.status_code == 200
        
        # Verify JWT service was called to validate token
        token = authenticated_request.headers.get("Authorization").split(" ")[1]
        mock_jwt_service.validate_token.assert_called_once_with(token)
        
        # Verify successful authentication was logged
        auth_middleware.audit_logger.log_authentication.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_missing_token(self, auth_middleware, unauthenticated_request):
        """Test handling of a request without an authentication token."""
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            # This should not be called for unauthenticated requests
            assert False, "Middleware should have blocked the request"
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware (should throw exception)
        with pytest.raises(MissingTokenError):
            await auth_middleware.dispatch(unauthenticated_request, mock_call_next)
        
        # Verify failed authentication was logged
        auth_middleware.audit_logger.log_authentication_failure.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_invalid_token(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test handling of a request with an invalid token."""
        # Configure JWT service to report token as invalid
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=False,
            status="INVALID",
            claims=None,
            token_type=None,
            error=InvalidTokenError("Token signature is invalid")
        )
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            # This should not be called for invalid tokens
            assert False, "Middleware should have blocked the request"
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware (should throw exception)
        with pytest.raises(InvalidTokenError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify failed authentication was logged
        auth_middleware.audit_logger.log_authentication_failure.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_expired_token(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test handling of a request with an expired token."""
        # Configure JWT service to report token as expired
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=False,
            status="EXPIRED",
            claims=None,
            token_type=None,
            error=TokenExpiredError("Token has expired")
        )
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            # This should not be called for expired tokens
            assert False, "Middleware should have blocked the request"
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware (should throw exception)
        with pytest.raises(TokenExpiredError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify failed authentication was logged
        auth_middleware.audit_logger.log_authentication_failure.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_exempt_path(self, auth_middleware, authenticated_request):
        """Test that exempt paths bypass authentication."""
        # Modify the request to use an exempt path
        authenticated_request.url.path = "/health"
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            # For exempt paths, the authentication state should still be set, but marked as exempt
            assert hasattr(request.state, "auth_exempt")
            assert request.state.auth_exempt is True
            
            return JSONResponse(content={"status": "healthy"})
        
        # Process the request through middleware
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify the response was allowed through
        assert response.status_code == 200
        assert json.loads(response.body) == {"status": "healthy"}
    
    @pytest.mark.asyncio
    async def test_disabled_middleware(self, auth_config, app, authenticated_request):
        """Test behavior when middleware is disabled."""
        # Create disabled middleware
        disabled_config = auth_config
        disabled_config.enabled = False
        
        disabled_middleware = AuthMiddleware(
            app=app,
            config=disabled_config
        )
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            # For disabled middleware, no authentication checks should happen
            # But the state should indicate auth is disabled
            assert hasattr(request.state, "auth_disabled")
            assert request.state.auth_disabled is True
            
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware
        response = await disabled_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify the response was allowed through
        assert response.status_code == 200
        assert json.loads(response.body) == {"status": "success"}
    
    @pytest.mark.asyncio
    async def test_scope_validation(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test validation of token scopes against required scopes for routes."""
        # Configure JWT service to return specific scopes
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=True,
            status="VALID",
            claims={
                "sub": "user123",
                "name": "Dr. Jane Smith",
                "roles": ["psychiatrist"],
                "scopes": ["read:patients"]  # Only has read:patients scope
            },
            token_type="access",
            error=None
        )
        
        # Test with an endpoint requiring only read:patients (should succeed)
        authenticated_request.url.path = "/api/patients"
        authenticated_request.method = "GET"
        
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        assert response.status_code == 200
        
        # Test with an endpoint requiring write:clinical_notes (should fail)
        authenticated_request.url.path = "/api/clinical-notes"
        authenticated_request.method = "POST"
        
        with pytest.raises(AuthorizationError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
    
    @pytest.mark.asyncio
    async def test_role_based_access(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test role-based access control."""
        # Configure JWT service to return specific roles
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=True,
            status="VALID",
            claims={
                "sub": "user123",
                "name": "Nurse Johnson",
                "roles": ["nurse"],  # Nurse role has limited permissions
                "scopes": []  # No explicit scopes, relying on role
            },
            token_type="access",
            error=None
        )
        
        # Test with an endpoint where nurse has read access (should succeed)
        authenticated_request.url.path = "/api/patients"
        authenticated_request.method = "GET"
        
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        assert response.status_code == 200
        
        # Test with an endpoint where nurse doesn't have write access (should fail)
        authenticated_request.url.path = "/api/patients"
        authenticated_request.method = "POST"
        
        with pytest.raises(AuthorizationError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
    
    @pytest.mark.asyncio
    async def test_admin_access_override(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test that admin role overrides specific permission requirements."""
        # Configure JWT service to return admin role
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=True,
            status="VALID",
            claims={
                "sub": "admin123",
                "name": "Admin User",
                "roles": ["admin"],  # Admin role should have access to everything
                "scopes": []  # No explicit scopes, relying on role
            },
            token_type="access",
            error=None
        )
        
        # Test with various protected endpoints (all should succeed for admin)
        for endpoint in ["/api/patients", "/api/clinical-notes", "/api/medications"]:
            for method in ["GET", "POST", "PUT", "DELETE"]:
                authenticated_request.url.path = endpoint
                authenticated_request.method = method
                
                async def mock_call_next(request):
                    return JSONResponse(content={"status": "success"})
                
                response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
                assert response.status_code == 200, f"Admin should have access to {method} {endpoint}"
    
    @pytest.mark.asyncio
    async def test_patient_self_access(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test that patients can only access their own records."""
        # Configure JWT service to return patient role
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=True,
            status="VALID",
            claims={
                "sub": "patient123",
                "name": "John Smith",
                "roles": ["patient"],
                "patient_id": "PT12345",  # The patient's ID
                "scopes": ["read:own_records"]
            },
            token_type="access",
            error=None
        )
        
        # Test with patient accessing their own record (should succeed)
        authenticated_request.url.path = "/api/patients/PT12345"
        authenticated_request.method = "GET"
        
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        assert response.status_code == 200
        
        # Test with patient trying to access another patient's record (should fail)
        authenticated_request.url.path = "/api/patients/PT67890"  # Different patient ID
        
        with pytest.raises(AuthorizationError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
    
    @pytest.mark.asyncio
    async def test_audit_logging(self, auth_middleware, authenticated_request):
        """Test that authentication attempts are properly logged."""
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        # Process a successful authentication
        await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify successful authentication was logged
        auth_middleware.audit_logger.log_authentication.assert_called_once()
        log_call = auth_middleware.audit_logger.log_authentication.call_args[1]
        assert log_call["user_id"] == "user123"
        assert log_call["status"] == "success"
        
        # Reset mock
        auth_middleware.audit_logger.reset_mock()
        
        # Make JWT service return invalid token
        auth_middleware.jwt_service.validate_token.return_value = MagicMock(
            is_valid=False,
            status="INVALID",
            claims=None,
            token_type=None,
            error=InvalidTokenError("Invalid token")
        )
        
        # Process an authentication failure
        with pytest.raises(InvalidTokenError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify failed authentication was logged
        auth_middleware.audit_logger.log_authentication_failure.assert_called_once()
        log_call = auth_middleware.audit_logger.log_authentication_failure.call_args[1]
        assert log_call["status"] == "failure"
        assert "reason" in log_call
    
    @pytest.mark.asyncio
    async def test_custom_auth_header(self, auth_config, app, mock_jwt_service):
        """Test using a custom authentication header."""
        # Create middleware with custom auth header
        custom_header_config = auth_config
        custom_header_config.auth_header_name = "X-Api-Key"
        custom_header_config.auth_scheme = ""  # No scheme, just the token
        
        custom_middleware = AuthMiddleware(
            app=app,
            config=custom_header_config
        )
        custom_middleware.jwt_service = mock_jwt_service
        custom_middleware.audit_logger = MagicMock()
        
        # Create request with custom auth header
        mock_request = MagicMock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/patients"
        mock_request.headers = Headers({"X-Api-Key": "valid.jwt.token"})  # No Bearer scheme
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            assert request.state.authenticated is True
            return JSONResponse(content={"status": "success"})
        
        # Process the request
        response = await custom_middleware.dispatch(mock_request, mock_call_next)
        
        # Verify authentication succeeded
        assert response.status_code == 200
        
        # Verify JWT service was called with the correct token
        mock_jwt_service.validate_token.assert_called_once_with("valid.jwt.token")
    
    @pytest.mark.asyncio
    async def test_method_based_permission(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test that HTTP methods map correctly to permissions."""
        # Configure JWT service to return specific permissions
        mock_jwt_service.validate_token.return_value = MagicMock(
            is_valid=True,
            status="VALID",
            claims={
                "sub": "user123",
                "name": "Limited User",
                "roles": ["limited_role"],
                "scopes": ["read:patients"]  # Only read permission
            },
            token_type="access",
            error=None
        )
        
        # Setup endpoint
        authenticated_request.url.path = "/api/patients"
        
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        # Test GET request (should succeed with read permission)
        authenticated_request.method = "GET"
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        assert response.status_code == 200
        
        # Test POST request (should fail without write permission)
        authenticated_request.method = "POST"
        with pytest.raises(AuthorizationError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Test PUT request (should fail without write permission)
        authenticated_request.method = "PUT"
        with pytest.raises(AuthorizationError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Test DELETE request (should fail without delete permission)
        authenticated_request.method = "DELETE"
        with pytest.raises(AuthorizationError):
            await auth_middleware.dispatch(authenticated_request, mock_call_next)
    
    @pytest.mark.asyncio
    async def test_cognito_auth_backend(self, auth_config, app):
        """Test the AWS Cognito authentication backend."""
        # Create middleware with Cognito backend
        cognito_config = auth_config
        cognito_config.auth_backend = "cognito"
        
        # Mock Cognito service
        mock_cognito = MagicMock()
        mock_cognito.verify_token.return_value = {
            "sub": "cognito_user_123",
            "name": "Cognito User",
            "roles": ["psychiatrist"],
            "scopes": ["read:patients", "write:clinical_notes"]
        }
        
        cognito_middleware = AuthMiddleware(
            app=app,
            config=cognito_config
        )
        cognito_middleware.cognito_service = mock_cognito
        cognito_middleware.audit_logger = MagicMock()
        
        # Create authenticated request
        mock_request = MagicMock(spec=Request)
        mock_request.method = "GET"
        mock_request.url.path = "/api/patients"
        mock_request.headers = Headers({"Authorization": "Bearer cognito.jwt.token"})
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            assert request.state.authenticated is True
            assert request.state.user["sub"] == "cognito_user_123"
            assert request.state.user["roles"] == ["psychiatrist"]
            return JSONResponse(content={"status": "success"})
        
        # Process the request
        response = await cognito_middleware.dispatch(mock_request, mock_call_next)
        
        # Verify authentication succeeded
        assert response.status_code == 200
        
        # Verify Cognito service was called with the correct token
        mock_cognito.verify_token.assert_called_once_with("cognito.jwt.token")
    
    @pytest.mark.asyncio
    async def test_response_headers(self, auth_middleware, authenticated_request):
        """Test that security headers are added to responses."""
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify security headers were added
        assert "X-Content-Type-Options" in response.headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert "X-Frame-Options" in response.headers
        assert "Content-Security-Policy" in response.headers
    
    @pytest.mark.asyncio
    async def test_refresh_token_handling(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test handling of token refresh when token is near expiration."""
        # Configure JWT service to indicate token needs refresh
        mock_jwt_service.should_refresh_token.return_value = True
        mock_jwt_service.create_access_token.return_value = "new.access.token"
        
        # Setup the next middleware in the chain
        async def mock_call_next(request):
            return JSONResponse(content={"status": "success"})
        
        # Process the request through middleware
        response = await auth_middleware.dispatch(authenticated_request, mock_call_next)
        
        # Verify refresh token was included in response
        assert "X-New-Access-Token" in response.headers
        assert response.headers["X-New-Access-Token"] == "new.access.token"
    
    @pytest.mark.asyncio
    async def test_protected_route_handler(self, auth_middleware):
        """Test the protected route handler decorator."""
        # Create a protected route handler
        protected_handler = ProtectedRouteHandler(
            required_scopes=["read:patients", "write:patients"],
            auth_middleware=auth_middleware
        )
        
        # Create a test endpoint function
        endpoint_executed = False
        
        @protected_handler
        async def test_endpoint(request):
            nonlocal endpoint_executed
            endpoint_executed = True
            return JSONResponse(content={"status": "success"})
        
        # Create an authenticated request
        mock_request = MagicMock(spec=Request)
        mock_request.state.authenticated = True
        mock_request.state.user = {
            "sub": "user123",
            "roles": ["psychiatrist"],
            "scopes": ["read:patients", "write:patients"]
        }
        
        # Call the protected endpoint with sufficient permissions
        response = await test_endpoint(mock_request)
        
        # Verify endpoint was executed
        assert endpoint_executed is True
        assert response.status_code == 200
        
        # Reset execution flag
        endpoint_executed = False
        
        # Modify request to have insufficient permissions
        mock_request.state.user["scopes"] = ["read:patients"]  # Missing write:patients
        
        # Call the protected endpoint with insufficient permissions
        with pytest.raises(AuthorizationError):
            await test_endpoint(mock_request)
        
        # Verify endpoint was not executed
        assert endpoint_executed is False
    
    @pytest.mark.asyncio
    async def test_error_responses(self, auth_middleware, authenticated_request, mock_jwt_service):
        """Test that authentication errors return appropriate HTTP responses."""
        # Configure JWT service to return various errors
        error_cases = [
            (InvalidTokenError("Invalid token signature"), 401),
            (TokenExpiredError("Token has expired"), 401),
            (MissingTokenError("No authorization token provided"), 401),
            (AuthorizationError("Insufficient permissions"), 403)
        ]
        
        for error, expected_status in error_cases:
            # Reset mock
            mock_jwt_service.reset_mock()
            
            # Configure JWT service to raise the error
            mock_jwt_service.validate_token.return_value = MagicMock(
                is_valid=False,
                status="INVALID",
                claims=None,
                token_type=None,
                error=error
            )
            
            # Setup middleware error handler
            original_handle_error = auth_middleware.handle_error
            
            async def mock_handle_error(request, exc):
                response = await original_handle_error(request, exc)
                # Verify the status code matches expectations
                assert response.status_code == expected_status
                return response
            
            auth_middleware.handle_error = mock_handle_error
            
            # Process the request (should raise and be handled by middleware)
            async def mock_call_next(request):
                # Should not reach here
                assert False, "Middleware should have blocked the request"
                return JSONResponse(content={"status": "success"})
            
            # Suppress expected exceptions
            try:
                await auth_middleware.dispatch(authenticated_request, mock_call_next)
            except:
                pass