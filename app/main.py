# -*- coding: utf-8 -*-
"""
NOVAMIND FastAPI Application

This is the main application entry point for the NOVAMIND backend API.
It configures the FastAPI application, registers routes, middleware, and
event handlers.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_app_settings
from app.infrastructure.database.init_db import init_db
from app.infrastructure.persistence.repository_factory import init_repositories
from app.presentation.api.routes import api_router
from app.presentation.api.routes.analytics_endpoints import router as analytics_router
from app.presentation.middleware.rate_limiting_middleware import setup_rate_limiting


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    
    This handles application startup and shutdown events, including database initialization
    and connection cleanup.
    
    Args:
        app: FastAPI application instance
    """
    # Startup events
    logger.info("Starting NOVAMIND application")
    
    # Initialize database
    await init_db()
    
    # Initialize repositories
    init_repositories()
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown events
    logger.info("Shutting down NOVAMIND application")
    
    # Any cleanup code goes here
    
    logger.info("Application shutdown complete")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application
    """
    settings = get_app_settings()
    
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )
    
    # Set up CORS middleware
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Set up rate limiting middleware
    setup_rate_limiting(app)
    
    # Include API router
    app.include_router(api_router, prefix=settings.API_PREFIX)
    
    # Include analytics router if analytics are enabled
    # This condition depends on configuration, if not present in settings, default to False
    if getattr(settings, "ENABLE_ANALYTICS", False):
        app.include_router(analytics_router, prefix=settings.API_PREFIX)
    
    # Mount static files if STATIC_DIR is defined in settings
    static_dir = getattr(settings, "STATIC_DIR", None)
    if static_dir:
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    return app


app = create_application()