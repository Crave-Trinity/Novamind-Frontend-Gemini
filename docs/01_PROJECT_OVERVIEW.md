# NOVAMIND: Concierge Psychiatry Platform

## 1. Project Overview

NOVAMIND is a premium, HIPAA-compliant concierge psychiatry platform designed for a solo provider practice with potential for future growth. This document provides a high-level overview of the architectural vision.

## 2. Core Architectural Philosophy

### Clean Architecture Implementation

NOVAMIND follows the Clean Architecture (also known as Onion or Hexagonal Architecture) principles:

```python
┌─────────────────────────────────────────────────────────────────────────┐
│                        NOVAMIND ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────────────────┐   │
│  │             │     │             │      │                         │   │
│  │  Frontend   │────▶│    API      │─────▶│      Domain Layer       │   │
│  │  (React)    │     │  (FastAPI)  │◀─────│   (Business Logic)      │   │
│  │             │◀────│             │      │                         │   │
│  └─────────────┘     └─────────────┘      └─────────────────────────┘   │
│        │                    │                          │                 │
│        ▼                    ▼                          ▼                 │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────────────────┐   │
│  │ Auth Layer  │     │  Services   │      │                         │   │
│  │ (Cognito)   │     │  Layer      │─────▶│    Data Access Layer    │   │
│  │             │     │             │◀─────│    (Repositories)       │   │
│  └─────────────┘     └─────────────┘      └─────────────────────────┘   │
│                             │                          │                 │
│                             ▼                          ▼                 │
│                      ┌─────────────┐      ┌─────────────────────────┐   │
│                      │ Integration │      │                         │   │
│                      │   Layer     │      │     Infrastructure       │   │
│                      │             │      │     (Database, AWS)      │   │
│                      └─────────────┘      └─────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```python

- **Domain-Centric Design**: Business logic isolated in domain layer, free from infrastructure dependencies
- **Dependency Rule**: Dependencies always point inward toward domain layer
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Boundary Interfaces**: Clean interfaces between layers via dependency inversion

### SOLID Principles Application

- **Single Responsibility**: Each class has one responsibility (e.g., `PatientRepository` only handles patient data access)
- **Open/Closed**: Extend behavior without modifying code (e.g., adding new appointment types)
- **Liskov Substitution**: Implementations interchangeable with their interfaces
- **Interface Segregation**: Focused interfaces prevent dependency bloat
- **Dependency Inversion**: High-level modules independent of low-level implementations

### Design Patterns Integration

- **Factory Pattern**: For creating complex domain objects (e.g., `PatientFactory`, `AppointmentFactory`)
- **Repository Pattern**: Data access abstraction (e.g., `PatientRepository`, `AppointmentRepository`)
- **Strategy Pattern**: For interchangeable algorithms (e.g., billing strategies, notification methods)
- **Observer Pattern**: For event handling (e.g., appointment created/changed notifications)
- **Command Pattern**: For operations that need audit trail (e.g., patient record changes)

## 3. High-Level Directory Structure

```python
novamind-backend/
├── alembic/                   # Database migration scripts
├── app/
│   ├── domain/                # Domain layer (business logic)
│   ├── application/           # Application layer
│   ├── infrastructure/        # Infrastructure layer
│   ├── presentation/          # Presentation layer (API)
│   ├── config/                # Configuration
│   └── utils/                 # Utility functions
├── tests/                     # Test suite
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
└── [configuration files]      # Various configuration files
```python

## 4. Technology Stack

- **Backend Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: AWS Cognito
- **File Storage**: AWS S3
- **Messaging**: Twilio for SMS, AWS SES for Email
- **Hosting**: AWS ECS Fargate (containers)
- **CI/CD**: AWS CodePipeline & CodeBuild

## 5. Implementation Sequence Documents

1. **Domain Layer** - Core business entities and logic
1. **Data Layer** - Database models and repositories
1. **Application Layer** - Services and use cases
1. **API Layer** - FastAPI routes and schemas
1. **Authentication & Security** - HIPAA compliance implementation
1. **Infrastructure Components** - AWS service integrations
1. **Testing & Quality Assurance** - Testing strategy and implementation

Each document provides detailed implementation guidance for its respective layer.
