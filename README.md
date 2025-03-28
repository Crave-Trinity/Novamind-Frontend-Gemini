# Novamind Backend

A HIPAA-compliant concierge psychiatry platform built with clean architecture principles.

## Project Structure

```
.
├── app/                    # Main application code
│   ├── domain/             # Domain layer (pure business logic)
│   ├── application/        # Application layer (use cases)
│   ├── infrastructure/     # Infrastructure layer (external interfaces)
│   └── presentation/       # Presentation layer (API, UI)
├── scripts/                # Scripts for various operations
│   ├── fixes/              # Fix scripts for specific issues
│   ├── tests/              # Test runners
│   ├── utils/              # Utility scripts
│   ├── security/           # Security-related scripts
│   └── deployment/         # Deployment scripts
├── tools/                  # Development and maintenance tools
│   ├── development/        # Tools for development
│   ├── security/           # Security tools
│   ├── hipaa_compliance/   # HIPAA compliance tools
│   └── maintenance/        # Maintenance tools
├── tests/                  # Test suites
├── docs/                   # Documentation
├── alembic/                # Database migrations
└── venv/                   # Virtual environment
```

## Development

1. Create a virtual environment: `python -m venv venv`
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. For development: `pip install -r requirements-dev.txt`
5. For security testing: `pip install -r requirements-security.txt`

## HIPAA Compliance

This platform is designed to be HIPAA-compliant with comprehensive security measures:

- PHI (Protected Health Information) sanitization in logs
- Secure authentication and authorization
- Encryption of sensitive data
- Audit logging
- Penetration testing

See `docs/HIPAA_COMPLIANCE_INSTRUCTIONS.md` for more details.

## Testing

Run tests with: `pytest`

For coverage report: `pytest --cov=app`

Security tests: `python scripts/security/run_hipaa_security_tests.py`
