# Novamind Digital Twin Frontend: Complete Refactoring Plan

## Current State Analysis

The frontend codebase is currently in a transitional state between legacy organization and Clean Architecture with Atomic Design. This mixed state is causing several issues:

### Directory Structure Issues

```
frontend/src/
├── app/                     # Legacy app code
├── application/             # Clean Architecture layer (target)
│   ├── contexts/            # React contexts (correct location)
│   ├── hooks/               # Application hooks (correct location)
│   └── providers/           # Context providers (correct location)
├── components/              # Legacy component organization
│   ├── atoms/               # Basic UI elements (should be in presentation)
│   ├── molecules/           # Composite components (should be in presentation)
│   └── organisms/           # Complex components (should be in presentation)
├── domain/                  # Clean Architecture layer (target)
│   ├── models/              # Domain models (correct location)
│   └── types/               # Type definitions (correct location)
├── hooks/                   # Legacy hooks (should be in application)
├── infrastructure/          # Clean Architecture layer (target)
│   ├── api/                 # API clients (correct location)
│   └── services/            # External services (correct location)
├── interfaces/              # Legacy interfaces (should be in domain)
├── pages/                   # Legacy pages (should be in presentation)
├── presentation/            # Clean Architecture layer (target)
│   ├── atoms/               # Atomic Design (duplicate with components)
│   ├── molecules/           # Atomic Design (duplicate with components)
│   └── organisms/           # Atomic Design (duplicate with components)
├── services/                # Legacy services (should be in infrastructure)
├── types/                   # Legacy types (should be in domain)
└── utils/                   # Legacy utilities (should be in appropriate layers)
```

### Key Problems

1. **Duplicated Component Locations**: Same component types exist in both `/components/` and `/presentation/`
2. **Inconsistent Import Paths**: Components use a mix of path aliases
3. **Configuration Misalignment**: Path aliases in TypeScript and Vite configurations don't match
4. **Coexistence of Legacy and Target Architectures**: Creating confusion for developers

## Target State Architecture

The target architecture follows Clean Architecture principles combined with Atomic Design for UI components:

```
frontend/src/
├── domain/                  # Business logic, models, and interfaces
│   ├── models/              # Domain models and entities
│   │   ├── brain/           # Brain model definitions
│   │   ├── clinical/        # Clinical models
│   │   └── shared/          # Shared models
│   ├── types/               # Type definitions
│   │   ├── brain/           # Brain visualization types
│   │   ├── clinical/        # Clinical data types
│   │   ├── neural/          # Neural network types
│   │   └── shared/          # Shared types
│   └── utils/               # Domain-specific utilities
│       ├── validation/      # Domain validation logic
│       └── shared/          # Shared utilities
├── application/             # Use cases, state management
│   ├── contexts/            # React contexts
│   ├── hooks/               # Application-level hooks
│   ├── providers/           # Context providers
│   ├── services/            # Application services
│   │   ├── brain/           # Brain model services
│   │   └── temporal/        # Temporal modeling services
│   └── utils/               # Application-level utilities
├── infrastructure/          # External services, API clients
│   ├── api/                 # API client implementations
│   └── services/            # External service integrations
├── presentation/            # UI components (Atomic Design)
│   ├── atoms/               # Basic UI elements
│   ├── molecules/           # Combinations of atoms
│   ├── organisms/           # Complex UI components
│   ├── templates/           # Page layouts
│   └── pages/               # Full pages
└── App.tsx                  # Application entry point
```

### Import Patterns

The target architecture should use consistent path aliases:

```typescript
// Clean Architecture imports
import { Patient } from "@domain/models/Patient";
import { usePatientData } from "@application/hooks/usePatientData";
import { apiClient } from "@api/apiClient"; // Use preferred alias

// Atomic Design imports
import { Button } from "@atoms/Button";
import { PatientForm } from "@molecules/PatientForm";
import { PatientDashboard } from "@organisms/PatientDashboard";
import { DashboardLayout } from "@templates/DashboardLayout";
import { PatientPage } from "@pages/PatientPage";
```

## Implementation Plan

### Phase 1: Configuration Alignment

1. **Fix Path Alias Configuration**
   - Align TypeScript and Vite configurations
   - Ensure all path aliases resolve correctly
   - Support both legacy and target paths during migration

2. **Module System Configuration**
   - Ensure proper ESM configuration in package.json
   - Configure build tools to handle ESM correctly
   - Address any remaining CommonJS dependencies

### Phase 2: Component Migration (File by File)

1. **Create Migration Tracker**
   - Document each component to migrate
   - Track progress and dependencies

2. **Migrate Components in Dependency Order**
   - Start with atoms (lowest-level components)
   - Then molecules, organisms, templates, pages
   - For each component:
     - Move to correct location in target architecture
     - Update imports using new path aliases
     - Update tests to use new paths

3. **Migrate Hooks**
   - Move hooks from `/hooks/` to `/application/hooks/`
   - Update all imports referring to these hooks

4. **Migrate Services**
   - Move services from `/services/` to `/infrastructure/services/`
   - Update all imports referring to these services

5. **Migrate Types**
   - Consolidate types in `/domain/types/`
   - Update all imports referring to these types

### Phase 3: Remove Legacy Structure

1. **Verify All Components Migrated**
   - Ensure all components have been moved to target locations
   - Check for any missed references

2. **Remove Empty Legacy Directories**
   - Remove `/components/` once empty
   - Remove `/hooks/` once empty
   - Remove `/services/` once empty
   - Remove `/types/` once empty
   - Remove `/utils/` once empty

3. **Check for Broken Imports**
   - Run full test suite
   - Address any remaining issues

### Phase 4: Documentation and Standards

1. **Update Documentation**
   - Ensure all architecture docs reflect the final state
   - Add migration notes for any special cases

2. **Create Code Standards**
   - Document import patterns
   - Document component organization rules
   - Create examples for new components

## Current Status and Issues

The project is currently in the middle of Phase 1. Key issues that need immediate attention:

1. **Path Alias Inconsistency**
   - Vite config and TypeScript config have different aliases
   - Import errors occurring due to mismatched paths

2. **Duplicated Components**
   - Some components exist in both legacy and target locations
   - Need to decide on single source of truth

3. **Missing Service Implementations**
   - Some services referenced in code don't exist in either location
   - Need to implement these services in correct target location

## Next Steps (Immediate Actions)

1. **Fix Path Alias Configuration**
   - Update `vite.config.ts` to match TypeScript path configuration
   - Add support for legacy paths during transition

2. **Implement Missing Services**
   - Create missing services in target locations
   - Update imports to use correct paths

3. **Track Component Migration**
   - Create detailed tracking for component migration
   - Prioritize components causing the most import issues

## Dependency Resolution Strategy

1. **Three.js Ecosystem**
   - `@react-three/fiber` (v8) and `@react-three/postprocessing` (v9) have version conflicts
   - Need to either:
     - Downgrade postprocessing to match fiber version
     - Create custom resolution in package.json

2. **ESM-Only Dependencies**
   - Ensure all dependencies work with ESM
   - Replace or add interop for any problematic packages

## Conclusion

This refactoring effort will result in a clean, maintainable architecture that follows industry best practices. The Clean Architecture with Atomic Design approach will provide a solid foundation for future development, making the codebase more maintainable and easier to understand for new developers.