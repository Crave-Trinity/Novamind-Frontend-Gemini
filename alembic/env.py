# -*- coding: utf-8 -*-
"""
Alembic environment configuration for NOVAMIND database migrations.

This module configures the alembic environment for database migrations,
ensuring proper integration with SQLAlchemy models and environment variables.
"""
import os
import sys
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

# Add the project root directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
load_dotenv()

# Import SQLAlchemy models to ensure they're registered with the metadata
from app.infrastructure.persistence.sqlalchemy.config.database import Base
from app.infrastructure.persistence.sqlalchemy.models import (
    patient,
    user,
    digital_twin,
    appointment,
    medication,
    clinical_note,
    provider
)

# This is the Alembic Config object, which provides access to the values within the .ini file
config = context.config

# Override the SQLAlchemy URL with the one from environment variables
db_url = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost/novamind"
)
# Ensure the URL is properly formatted for SQLAlchemy 2.0+
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
config.set_main_option("sqlalchemy.url", db_url)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata
target_metadata = Base.metadata

# Other values from the config, defined by the needs of env.py,
# can be acquired:
# ... etc.


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine creation
    we don't even need a DBAPI to be available.
    
    Calls to context.execute() here emit the given string to the script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()