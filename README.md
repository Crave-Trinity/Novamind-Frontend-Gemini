# Novamind Digital Twin: Concierge Psychiatry Platform

## Overview

Novamind Digital Twin is a groundbreaking HIPAA-compliant platform that combines clinical excellence with top-tier technology for concierge psychiatry practices. The system provides temporal neurotransmitter mapping, treatment simulation, and comprehensive neuropsychiatric analysis through a sophisticated digital twin model.

## Architecture

This project follows **Clean Architecture** principles with strict layer separation:

- **Domain Layer**: Pure business logic with no external dependencies
- **Application Layer**: Orchestration of domain operations and use cases
- **Infrastructure Layer**: External service implementations and data access
- **API Layer**: FastAPI endpoints with proper validation and error handling

## Key Features

- **Temporal Neurotransmitter Mapping**: Track neurotransmitter levels across brain regions over time
- **Digital Twin Modeling**: Patient-specific neural network visualization and modeling
- **XGBoost Integration**: AI-powered treatment response forecasting
- **HIPAA-Compliant Security**: Enterprise-grade authentication and data protection
- **Luxury UX**: Premium user experience with performance optimization

## Project Status

The core architecture for the temporal neurotransmitter mapping system has been successfully built. Current development focuses on completing the full implementation of neurotransmitter mapping functionality and integrating with XGBoost and MentalLLaMA services.

See [TEMPORAL_NEUROTRANSMITTER_IMPLEMENTATION.md](docs/TEMPORAL_NEUROTRANSMITTER_IMPLEMENTATION.md) for detailed implementation status.

## Project Structure

The project follows a canonical organization pattern as documented in [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Node.js 18+ (for frontend)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/novamind-backend.git
   cd novamind-backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For development
   ```

4. Copy the environment variables file and configure it:
   ```
   cp config/env/.env.example config/env/.env
   # Edit .env with your configuration
   ```

5. Run database migrations:
   ```
   alembic upgrade head
   ```

### Running the API

Start the FastAPI server:

```
python main.py
```

Or use uvicorn directly:

```
uvicorn main:app --reload
```

Visit http://localhost:8000/api/docs for the interactive API documentation.

### Running Tests

To run tests with coverage report:

```
pytest --cov=app tests/
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Security & HIPAA Compliance

This system is designed with HIPAA compliance as a primary concern:

- All PHI data is encrypted at rest and in transit
- JWT authentication with proper role-based access control
- Comprehensive audit logging
- No PHI in logs or URLs
- Automatic session timeouts for inactivity

## License

This project is licensed under the terms of the license included in the [LICENSE](LICENSE) file.
