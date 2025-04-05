# Clean Architecture Plan

## Directory Structure

```
src/
├── domain/           # Core business logic
│   ├── models/       # Domain entities and value objects
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Pure domain utility functions
│   └── services/     # Domain service interfaces
│
├── application/      # Use cases and application logic
│   ├── hooks/        # React hooks for business logic
│   ├── services/     # Implementation of domain services
│   ├── stores/       # State management
│   └── utils/        # Application-specific utilities
│
├── infrastructure/   # External systems and tools
│   ├── api/          # API clients
│   ├── storage/      # Local storage, session storage, etc.
│   ├── auth/         # Authentication services
│   └── analytics/    # Usage tracking and analytics
│
├── presentation/     # UI layer (Atomic Design)
│   ├── providers/    # Context providers
│   ├── atoms/        # Basic UI components
│   ├── molecules/    # Combined atoms
│   ├── organisms/    # Complex UI components
│   ├── templates/    # Page layouts
│   ├── pages/        # Full pages/routes
│   └── utils/        # UI utility functions
│
└── app/              # Application bootstrap and configuration
    ├── config/       # Environment configuration
    ├── routes/       # Routing configuration
    └── main.tsx      # Entry point
```

## Files to Delete or Move

1. `/src/providers` - Move to `/src/presentation/providers`
2. `/src/types` - Consolidate into `/src/domain/types`

## Import Rules

1. Domain → No external dependencies
2. Application → Can import from Domain
3. Infrastructure → Can import from Domain and Application
4. Presentation → Can import from all layers
5. App → Can import from all layers

## Migration Strategy

1. First, set up the core directory structure
2. Move files to their appropriate locations
3. Update imports and fix any broken references
4. Clean up duplicate or obsolete files
5. Update tests to match the new structure 