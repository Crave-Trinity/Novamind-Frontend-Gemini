# CORE_ARCHITECTURE

## Overview

The NOVAMIND platform follows Clean Architecture principles to ensure separation of concerns, maintainability, and testability. This document outlines the architectural approach, design patterns, and implementation guidelines.

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

### Application Layer

- Implements use cases and orchestrates workflows
- Transforms domain objects to/from DTOs
- Handles validation and business rules
- Depends only on the Domain Layer

### Data Layer

- Implements repository interfaces from Domain Layer
- Handles persistence and external service integration
- Manages database transactions and caching
- Depends on the Domain Layer but not on Application Layer

### Presentation Layer

- Handles HTTP requests and responses
- Implements authentication and authorization
- Manages user interfaces and API endpoints
- Depends on the Application Layer

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

## HIPAA Compliance Requirements

1. **Authentication and Authorization**: Role-based access control
2. **Encryption**: All PHI encrypted at rest and in transit
3. **Audit Logging**: Comprehensive audit trails for all PHI access
4. **Data Validation**: Strict validation for all input data
5. **Error Handling**: Secure error handling without exposing PHI
6. **Session Management**: Secure session handling with timeouts
7. **Backup and Recovery**: Regular backups with secure storage

## Technology Stack

1. **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy
2. **Authentication**: JWT, AWS Cognito
3. **Storage**: AWS S3 (encrypted)
4. **Deployment**: Docker, AWS ECS/Fargate
5. **Monitoring**: AWS CloudWatch, Prometheus