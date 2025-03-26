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

- **Backend Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM on Amazon RDS (with encryption at rest via AWS KMS and SSL/TLS for data in transit)
- **Authentication**: AWS Cognito (user registration, password resets, JWT token issuance, MFA support)
- **File Storage**: AWS S3 (for storing uploaded documents with SSE-KMS encryption)
- **Messaging**: Twilio for SMS (HIPAA-compliant with BAA), AWS SES for Email
- **Form System**: JotForm HIPAA-Enforced Plan (for clinical questionnaires and intake forms)
- **Analytics**: Amazon QuickSight (for interactive dashboards and data visualization)
- **Hosting**: AWS ECS Fargate (containers)
- **CI/CD**: AWS CodePipeline & CodeBuild
- **Deployment**: Docker, AWS ECS/Fargate
- **Payments**: Stripe (for patient payments, subscriptions, and invoices)

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