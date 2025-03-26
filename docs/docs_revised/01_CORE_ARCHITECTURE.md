# CORE_ARCHITECTURE

## Overview

The NOVAMIND platform follows Clean Architecture principles to ensure separation of concerns, maintainability, and testability. This document outlines the architectural approach, design patterns, and implementation guidelines for this HIPAA-compliant concierge psychiatry platform.

The platform is designed as an end-to-end stack using best-in-class services and libraries for each component, ensuring full HIPAA compliance while meeting the needs of a high-end concierge psychiatric practice. The backend is built in Python (FastAPI), with the AWS ecosystem as the primary infrastructure provider for compliance and integration.

## Architectural Layers

```text
┌───────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                             │
│  (API Controllers, Web UI, CLI, GraphQL Resolvers)                │
├───────────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                              │
│  (Use Cases, Services, DTOs, Validators)                          │
├───────────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                                 │
│  (Entities, Value Objects, Repository Interfaces, Domain Services)│
├───────────────────────────────────────────────────────────────────┤
│                       DATA LAYER                                  │
│  (Repository Implementations, ORM, External Services)             │
└───────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Domain Layer

- Contains business entities and logic
- Defines repository interfaces
- Implements domain services and value objects
- Has no dependencies on other layers
- Represents psychiatry-relevant concepts: Patients, Appointments, Billing, Outcomes, Notes, etc.
- Contains all logic regarding patient flow, scheduling rules, and therapy features

### Application Layer

- Implements use cases and orchestrates workflows
- Transforms domain objects to/from DTOs
- Handles validation and business rules
- Depends only on the Domain Layer
- Coordinates complex operations across multiple domain entities

### Data Layer

- Implements repository interfaces from Domain Layer
- Handles persistence and external service integration
- Manages database transactions and caching
- Depends on the Domain Layer but not on Application Layer
- Implements ORM (SQLAlchemy) but keeps it separate from the Domain layer

### Presentation Layer

- Handles HTTP requests and responses
- Implements authentication and authorization
- Manages user interfaces and API endpoints
- Depends on the Application Layer
- Uses Pydantic v2 schemas for input/output validation
- Leverages FastAPI's `Depends()` for dependency injection

## Directory Structure

```text
novamind/
├── app/
│   ├── core/                    # Core utilities and configuration
│   │   ├── config.py            # Application configuration
│   │   └── utils/               # Shared utilities
│   │       ├── logging.py       # Logging utilities
│   │       ├── encryption.py    # Encryption utilities
│   │       └── validation.py    # Validation utilities
│   ├── domain/                  # Domain Layer
│   │   ├── entities/            # Domain entities
│   │   ├── repositories/        # Repository interfaces
│   │   ├── services/            # Domain services
│   │   └── value_objects/       # Value objects
│   ├── application/             # Application Layer
│   │   ├── services/            # Application services
│   │   ├── dtos/                # Data Transfer Objects
│   │   └── validators/          # Input validators
│   ├── infrastructure/          # Data Layer
│   │   ├── persistence/         # Database implementations
│   │   │   ├── models/          # ORM models
│   │   │   └── repositories/    # Repository implementations
│   │   └── services/            # External service integrations
│   └── presentation/            # Presentation Layer
│       ├── api/                 # API endpoints
│       │   ├── routes/          # Route handlers
│       │   └── docs/            # API documentation
│       └── web/                 # Web interface
│           ├── templates/       # HTML templates
│           └── static/          # Static assets
├── tests/                       # Test suite
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
└── alembic/                     # Database migrations
```

## Design Patterns

1. **Repository Pattern**: Abstracts data access logic
2. **Dependency Injection**: Manages dependencies between components
3. **Factory Pattern**: Creates complex objects
4. **Strategy Pattern**: Implements different algorithms
5. **Observer Pattern**: Implements event handling
6. **Adapter Pattern**: Connects incompatible interfaces
7. **Command Pattern**: Encapsulates requests as objects

## Design Patterns Integration

NOVAMIND implements several design patterns to ensure clean, maintainable code:

- **Factory Pattern**: For creating complex domain objects (e.g., `PatientFactory`, `AppointmentFactory`)
- **Repository Pattern**: Data access abstraction (e.g., `PatientRepository`, `AppointmentRepository`)
- **Strategy Pattern**: For interchangeable algorithms (e.g., billing strategies, notification methods, AI-based modules like risk scoring or summarization)
- **Observer Pattern**: For event handling (e.g., appointment created/changed notifications, triggering analytics when patient records change)
- **Command Pattern**: For operations that need audit trail (e.g., patient record changes)
- **Factory/Abstract Factory**: For creating complex domain aggregates (e.g., building a patient record with multiple sub-objects, handling default settings)

## Cloud Infrastructure

- **Frontend Hosting**: AWS Amplify (S3 & CloudFront) - Provides simple CI/CD from a git repo and hosts static sites in a HIPAA-eligible environment
- **Backend Hosting & Orchestration**: AWS ECS Fargate - Containerizes the FastAPI app with container orchestration (scaling, self-healing) without managing servers
- **CI/CD Pipeline**: AWS CodePipeline & CodeBuild - Automates deployments from code commits and runs tests/builds Docker images

## Technology Stack

### Core Technology Components

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| API Framework | FastAPI | 0.104.0+ | High-performance REST API with automatic documentation |
| Data Validation | Pydantic V2 | 2.0.0+ | Data validation, serialization, and schema definition |
| ORM | SQLAlchemy | 2.0.0+ | Database operations via repository pattern |
| Database | PostgreSQL | 14.0+ | HIPAA-compliant primary data store |
| Authentication | AWS Cognito | via boto3 | User management with MFA support |
| File Storage | AWS S3 | via boto3 | Encrypted file storage |
| Task Queue | Celery | 5.3.0+ | Background task processing |
| Message Broker | Redis | 7.0.0+ | Support for event-driven architecture |
| Testing | pytest | 7.0.0+ | Comprehensive test suite |
| Migrations | Alembic | 1.12.0+ | Database schema versioning |
| Messaging | Twilio for SMS | HIPAA-compliant | Patient notifications and reminders |
| Email | AWS SES | via boto3 | Email communications |
| Form System | JotForm HIPAA-Enforced Plan | - | Clinical questionnaires and intake forms |
| Analytics | Amazon QuickSight | - | Interactive dashboards and data visualization |
| Hosting | AWS ECS Fargate | - | Containerized deployment |
| CI/CD | AWS CodePipeline & CodeBuild | - | Automated testing and deployment |
| Payments | Stripe | - | Patient payments, subscriptions, and invoices |

### Package Dependency Management

```
# requirements.txt

# Core Framework
fastapi==0.104.0
uvicorn[standard]==0.23.2
pydantic==2.4.2
python-multipart==0.0.6
python-dotenv==1.0.0

# Database
sqlalchemy==2.0.23
alembic==1.12.0
asyncpg==0.28.0  # Async PostgreSQL driver
psycopg2-binary==2.9.9  # Sync PostgreSQL driver

# Security & Authentication
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4  # Password hashing
boto3==1.28.65  # AWS SDK for Cognito, S3, etc.
cryptography==41.0.4  # General cryptographic operations

# Background Tasks & Event Handling
celery==5.3.4
redis==5.0.1
aioredis==2.0.1  # Async Redis client

# Testing
pytest==7.4.2
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pytest-mock==3.12.0
hypothesis==6.88.1  # Property-based testing

# Development Tools
black==23.9.1
flake8==6.1.0
mypy==1.6.1
pre-commit==3.5.0
bandit==1.7.5  # Security linting
safety==2.3.5  # Dependency vulnerability checking

# Logging & Monitoring
structlog==23.2.0
opentelemetry-api==1.20.0
opentelemetry-sdk==1.20.0

# AWS Specific
boto3-stubs[cognito,s3,ses]==1.28.65  # Type hints for boto3
```

### HIPAA Compliance Matrix

| Component | HIPAA Requirement | Implementation |
|-----------|-------------------|----------------|
| Authentication | Access Controls (§164.312(a)(1)) | AWS Cognito with MFA |
| Data Storage | Encryption (§164.312(a)(2)(iv)) | PostgreSQL with TDE, S3 with SSE |
| API Access | Transmission Security (§164.312(e)(1)) | HTTPS, JWT with short expiry |
| Auditing | Audit Controls (§164.312(b)) | Structured logging with PHI filtering |
| Backup | Contingency Plan (§164.308(a)(7)) | Automated PostgreSQL backups |

## AI Layer

- **AI and NLP**: Azure OpenAI (GPT-4) with PHI Anonymization
- **PHI Detection**: AWS Comprehend Medical (to detect and mask PHI identifiers)
- **Use Cases**:
  - Clinical note summarization
  - Diagnostic insight generation
  - Risk assessment
  - Treatment recommendation support

## Security & HIPAA Compliance

### HIPAA Compliance Requirements

1. **Authentication and Authorization**: Role-based access control with AWS Cognito
2. **Encryption**: All PHI encrypted at rest (via AWS KMS) and in transit (TLS 1.2/1.3)
3. **Audit Logging**: Comprehensive audit trails for all PHI access via CloudTrail and application-level logging
4. **Data Validation**: Strict validation for all input data using Pydantic schemas
5. **Error Handling**: Secure error handling without exposing PHI
6. **Session Management**: Secure session handling with timeouts
7. **Backup and Recovery**: Regular backups with secure storage

### Security Implementation

- **Encryption Everywhere**: All data at rest is encrypted using AWS KMS managed keys
- **Identity & Access Management**: AWS IAM roles and policies to enforce least privilege access
- **Web Application Firewall (WAF)**: AWS WAF to filter malicious traffic
- **Monitoring & Logging**: Amazon CloudWatch for monitoring server logs and setting alarms
- **Key Management & Secrets**: AWS Secrets Manager for storing sensitive secrets
- **Audit Trail & Activity Logs**: Detailed audit logs for all user actions

## Third-Party Integrations

- **EMR Features**: Custom FastAPI implementation with rich text editor for notes
- **Lab/Imaging Integration**: Redox API platform for connecting to lab systems and imaging centers
- **E-Prescribing**: Integration with pharmacy networks via Redox or specialized eRx services
- **Prior Authorization**: Integration with services like CoverMyMeds

## Scalability & Performance

- The architecture is designed to scale from a single provider to multiple providers or clinics
- AWS services provide on-demand scaling capabilities
- Database can scale vertically or migrate to Amazon Aurora as volume increases
- Containerized deployment allows for easy horizontal scaling