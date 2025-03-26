#!/usr/bin/env python3
# create_base_structure.py - Creates the base directory structure for NOVAMIND
# HIPAA-compliant psychiatric digital twin platform

import os
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("project_creation.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Project root directory
PROJECT_ROOT = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Base directories
BASE_DIRS = [
    "alembic",
    "app",
    "app/domain",
    "app/application",
    "app/infrastructure",
    "app/presentation",
    "tests",
    "scripts",
    "docs"
]

# Root files
ROOT_FILES = {
    "pyproject.toml": """[build-system]
requires = ["setuptools>=42", "wheel"]
build-backend = "setuptools.build_meta"

[tool.black]
line-length = 88
target-version = ["py38", "py39", "py310"]
include = '\.pyi?$'

[tool.isort]
profile = "black"
multi_line_output = 3

[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
""",
    "requirements.txt": """# Core Framework
fastapi==0.104.0
uvicorn[standard]==0.23.2
pydantic==2.4.2
python-multipart==0.0.6
python-dotenv==1.0.0

# Database
sqlalchemy==2.0.23
alembic==1.12.0
asyncpg==0.28.0
psycopg2-binary==2.9.9

# Security & Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
boto3==1.28.65
cryptography==41.0.4

# Background Tasks & Event Handling
celery==5.3.4
redis==5.0.1
aioredis==2.0.1

# Machine Learning & AI
numpy==1.26.0
pandas==2.1.1
scikit-learn==1.3.1
tensorflow==2.14.0
torch==2.1.0

# Testing is in requirements-dev.txt
""",
    "requirements-dev.txt": """# Development Dependencies
-r requirements.txt

# Testing
pytest==7.4.2
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pytest-mock==3.12.0
hypothesis==6.88.1

# Development Tools
black==23.9.1
flake8==6.1.0
mypy==1.6.1
pre-commit==3.5.0
bandit==1.7.5
safety==2.3.5

# Documentation
sphinx==7.2.6
sphinx-rtd-theme==1.3.0
""",
    "README.md": """# NOVAMIND Digital Twin Platform

NOVAMIND is a premium, HIPAA-compliant concierge psychiatry platform designed for a solo provider practice with potential for future growth. This platform integrates cutting-edge Digital Twin technology to deliver personalized psychiatric care.

## Features

- **Digital Twin Technology**: Computational representation of a patient's psychiatric state
- **Symptom Trajectory Forecasting**: Predict symptom progression and detect early warning signs
- **Biometric-Mental Correlation**: Link physiological markers to mental states
- **Precision Medication Modeling**: Personalize medication selection based on genetics and history
- **HIPAA Compliance**: End-to-end security and privacy controls

## Architecture

This project follows Clean Architecture principles with a strict separation of:
- Domain Layer: Pure business logic
- Application Layer: Use cases and application services
- Infrastructure Layer: External frameworks and tools
- Presentation Layer: API endpoints

## Getting Started

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: 
   - Windows: `venv\\Scripts\\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt -r requirements-dev.txt`
5. Set up environment variables: Copy `.env.example` to `.env` and update values
6. Run migrations: `alembic upgrade head`
7. Start the server: `uvicorn app.presentation.api.main:app --reload`

## License

Proprietary software.
""",
    ".env.example": """# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/novamind
TEST_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/novamind_test

# Security
SECRET_KEY=your-secret-key-at-least-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Cognito Configuration
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_APP_CLIENT_ID=your-app-client-id

# S3 Configuration
S3_BUCKET_NAME=your-bucket-name
""",
    ".gitignore": """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
ENV/
env/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Environment variables
.env

# Logs
*.log
logs/

# Test coverage
.coverage
htmlcov/
.pytest_cache/

# OS
.DS_Store
Thumbs.db
""",
    "Dockerfile": """FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the application
CMD ["uvicorn", "app.presentation.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
""",
    "docker-compose.yml": """version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/novamind
    depends_on:
      - db
      - redis
    networks:
      - novamind-network
    command: uvicorn app.presentation.api.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=novamind
    ports:
      - "5432:5432"
    networks:
      - novamind-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    networks:
      - novamind-network
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

networks:
  novamind-network:

volumes:
  postgres_data:
  redis_data:
"""
}

def create_base_directories():
    """Create the base directory structure"""
    for directory in BASE_DIRS:
        dir_path = os.path.join(PROJECT_ROOT, directory)
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
        
        # Create __init__.py in each Python package directory
        if directory.startswith("app") or directory == "tests":
            init_file = os.path.join(dir_path, "__init__.py")
            with open(init_file, "w") as f:
                package_name = directory.replace("/", ".")
                f.write(f"# {package_name}\n")
            logger.info(f"Created: {init_file}")

def create_root_files():
    """Create root configuration files"""
    for filename, content in ROOT_FILES.items():
        file_path = os.path.join(PROJECT_ROOT, filename)
        with open(file_path, "w") as f:
            f.write(content)
        logger.info(f"Created file: {file_path}")

def main():
    """Main function to create base structure"""
    logger.info("Creating base directory structure...")
    create_base_directories()
    
    logger.info("Creating root configuration files...")
    create_root_files()
    
    logger.info("Base structure creation completed successfully!")

if __name__ == "__main__":
    main()
