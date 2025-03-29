# -*- coding: utf-8 -*-
"""
NOVAMIND Digital Twin main application entry point.

This module sets up the FastAPI application, configures middleware,
and includes all the API routes. It's the main entry point for the application.
"""

import logging
from typing import Dict

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import actigraphy, auth, patients, appointments, digital_twin
from app.core.config import settings
from app.core.exceptions import (
    InvalidConfigurationError,
    InvalidRequestError,
    ResourceNotFoundError,
    ServiceUnavailableError,
)
from app.core.middleware.phi_audit_middleware import PHIAuditMiddleware
from app.core.middleware.request_logging_middleware import RequestLoggingMiddleware


# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format=settings.log_format
)

logger = logging.getLogger(__name__)


# Create FastAPI application
app = FastAPI(
    title="NOVAMIND Digital Twin Platform",
    description="A comprehensive digital twin platform for concierge psychiatry",
    version="1.0.0",
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url="/api/redoc" if settings.environment != "production" else None,
)


# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(PHIAuditMiddleware)


# Exception handlers
@app.exception_handler(InvalidRequestError)
async def invalid_request_exception_handler(request: Request, exc: InvalidRequestError) -> JSONResponse:
    """Handle InvalidRequestError exceptions."""
    return JSONResponse(
        status_code=400,
        content={"error": {"code": "INVALID_REQUEST", "message": str(exc)}},
    )


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_exception_handler(request: Request, exc: ResourceNotFoundError) -> JSONResponse:
    """Handle ResourceNotFoundError exceptions."""
    return JSONResponse(
        status_code=404,
        content={"error": {"code": "RESOURCE_NOT_FOUND", "message": str(exc)}},
    )


@app.exception_handler(InvalidConfigurationError)
async def invalid_configuration_exception_handler(request: Request, exc: InvalidConfigurationError) -> JSONResponse:
    """Handle InvalidConfigurationError exceptions."""
    logger.error(f"Configuration error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "CONFIGURATION_ERROR", "message": "Server configuration error"}},
    )


@app.exception_handler(ServiceUnavailableError)
async def service_unavailable_exception_handler(request: Request, exc: ServiceUnavailableError) -> JSONResponse:
    """Handle ServiceUnavailableError exceptions."""
    logger.error(f"Service unavailable: {str(exc)}")
    return JSONResponse(
        status_code=503,
        content={"error": {"code": "SERVICE_UNAVAILABLE", "message": str(exc)}},
    )


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(digital_twin.router, prefix="/api")
app.include_router(actigraphy.router, prefix="/api")  # Add actigraphy routes


@app.get("/api/health", tags=["health"])
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    This endpoint returns a simple status check to verify that the API is running.
    It doesn't interact with any services or databases, making it suitable for
    basic health monitoring.
    
    Returns:
        Dictionary with status message
    """
    return {"status": "healthy"}


@app.get("/api/version", tags=["version"])
async def version() -> Dict[str, str]:
    """
    Version information endpoint.
    
    This endpoint returns the current version of the API.
    
    Returns:
        Dictionary with version information
    """
    return {
        "version": app.version,
        "environment": settings.environment
    }