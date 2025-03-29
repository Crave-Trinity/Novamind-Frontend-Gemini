"""
API routes initialization.

This module initializes and configures all API routes for the application.
"""

from fastapi import APIRouter

from app.api.routes import (
    actigraphy,
    auth,
    health,
    patients,
    practitioners,
    scheduling,
    messaging,
    ml,
)

# Create main router
api_router = APIRouter()

# Include all route modules
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(patients.router)
api_router.include_router(practitioners.router)
api_router.include_router(scheduling.router)
api_router.include_router(messaging.router)
api_router.include_router(ml.router)
api_router.include_router(actigraphy.router)