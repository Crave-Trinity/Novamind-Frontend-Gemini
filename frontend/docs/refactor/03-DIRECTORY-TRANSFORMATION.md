# NOVAMIND DIGITAL TWIN: DIRECTORY TRANSFORMATION

## QUANTUM-LEVEL DIRECTORY TRANSFORMATION PROTOCOL

This document outlines the precise directory structure transformation required to achieve architectural singularity for the NOVAMIND Digital Twin frontend.

## NEURAL MIGRATION MATRIX

The following neural migration matrix defines the exact transformation path for all files in the codebase:

```
Legacy Path                → Clean Architecture Path
-----------                → -----------------------
/components/atoms/*        → /presentation/atoms/*
/components/molecules/*    → /presentation/molecules/*
/components/organisms/*    → /presentation/organisms/*
/components/templates/*    → /presentation/templates/*
/components/pages/*        → /presentation/pages/*
/components/utils/*        → /presentation/utils/*
/contexts/*                → /application/contexts/*
/hooks/*                   → /application/hooks/*
/pages/*                   → /presentation/pages/*
/services/*                → /infrastructure/services/*
/api/*                     → /infrastructure/api/*
/types/*                   → /domain/types/*
/interfaces/*              → /domain/types/*
/utils/*                   → /application/utils/*
/shaders/*                 → /presentation/shaders/*
/app/*                     → /application/core/*
```

## TARGET NEURAL ARCHITECTURE

The transformed directory structure will achieve mathematical elegance with the following neural architecture:

```
/src/
  ├── domain/                # Pure business logic
  │   ├── constants/         # Business constants
  │   ├── entities/          # Domain entities
  │   ├── models/            # Domain models
  │   ├── services/          # Domain service interfaces
  │   ├── types/             # Type definitions
  │   │   ├── brain/         # Brain data types
  │   │   ├── clinical/      # Clinical data types
  │   │   ├── common/        # Shared utility types
  │   │   └── theme/         # Theme types
  │   └── validation/        # Validation rules
  │
  ├── application/           # Use case orchestration
  │   ├── contexts/          # React contexts
  │   ├── core/              # Core application logic
  │   ├── hooks/             # Custom hooks
  │   ├── providers/         # Context providers
  │   ├── services/          # Application services
  │   ├── store/             # State management
  │   └── utils/             # Application utilities
  │
  ├── infrastructure/        # External systems
  │   ├── api/               # API clients
  │   │   ├── client/        # API client implementations
  │   │   └── models/        # API request/response models
  │   ├── auth/              # Authentication
  │   ├── config/            # Configuration
  │   ├── services/          # External services
  │   └── storage/           # Storage services
  │
  └── presentation/          # UI components
      ├── assets/            # Static assets
      ├── atoms/             # Atomic components
      ├── molecules/         # Molecular components
      ├── organisms/         # Organism components
      ├── pages/             # Page components
      ├── shaders/           # WebGL shaders
      ├── styles/            # Global styles
      ├── templates/         # Template components
      ├── utils/             # UI utilities
      └── visualizations/    # Visualization components
```

## DETAILED MIGRATION PROTOCOL

### 1. Domain Layer Migration

| Source | Destination | Transformation |
|--------|-------------|----------------|
| `/types/brain.ts` | `/domain/types/brain/models.ts` | Extract interfaces, enums to separate files |
| `/types/RiskLevel.ts` | `/domain/types/clinical/risk.ts` | Consolidate with risk assessment types |
| `/interfaces/BrainVisualizationProps.ts` | `/domain/types/brain/visualization.ts` | Consolidate with other brain visualization types |
| `/domain/models/BrainModel.ts` | `/domain/models/BrainModel.ts` | Preserve existing clean structure |
| `/domain/models/PatientModel.ts` | `/domain/models/PatientModel.ts` | Preserve existing clean structure |

### 2. Application Layer Migration

| Source | Destination | Transformation |
|--------|-------------|----------------|
| `/contexts/ThemeContext.tsx` | `/application/contexts/ThemeContext.tsx` | Enhance with neural-safe typing |
| `/contexts/ThemeProvider.tsx` | `/application/providers/ThemeProvider.tsx` | Implement with type guards |
| `/hooks/useBlockingTransition.ts` | `/application/hooks/useBlockingTransition.ts` | Add explicit typing |
| `/app/initializeApp.ts` | `/application/core/initializeApp.ts` | Refactor for clean architecture |
| `/application/*` | `/application/*` | Preserve existing clean structure |
| `/utils/*` | `/application/utils/*` | Categorize utilities properly |

### 3. Infrastructure Layer Migration

| Source | Destination | Transformation |
|--------|-------------|----------------|
| `/api/ApiClient.ts` | `/infrastructure/api/client/ApiClient.ts` | Enhance with better error handling |
| `/services/RiskAssessmentService.ts` | `/infrastructure/services/RiskAssessmentService.ts` | Implement with Result pattern |
| `/infrastructure/*` | `/infrastructure/*` | Preserve existing clean structure |

### 4. Presentation Layer Migration

| Source | Destination | Transformation |
|--------|-------------|----------------|
| `/components/atoms/*` | `/presentation/atoms/*` | Ensure pure presentation logic |
| `/components/molecules/BrainVisualization.tsx` | `/presentation/molecules/BrainVisualization.tsx` | Extract business logic to hooks |
| `/components/organisms/*` | `/presentation/organisms/*` | Apply container/presentation pattern |
| `/components/templates/*` | `/presentation/templates/*` | Ensure consistent props |
| `/pages/*` | `/presentation/pages/*` | Extract data fetching to hooks |
| `/shaders/*` | `/presentation/shaders/*` | Optimize for WebGL performance |
| `/presentation/*` | `/presentation/*` | Preserve existing clean structure |

## NEURAL-SAFE MIGRATION STRATEGY

To ensure zero-downtime and maintain system stability during migration:

### 1. Parallel Implementation Phase

During the initial phase, maintain both structures with soft links:

```typescript
// Temporary compatibility layer
// domain/types/brain/index.ts
import * as LegacyBrainTypes from '../../../types/brain';
export * from './models';
export * from './visualization';
// Re-export legacy types for compatibility
export * from '../../../types/brain';
```

### 2. Component Migration Sequence

Migrate components in this precise sequence to minimize disruption:

1. **Domain Layer Types**
   - Create new type structure
   - Implement compatibility layer
   - Verify type compatibility

2. **Presentation Atoms**
   - Migrate atomic components
   - Update imports to use type aliases
   - Verify rendering consistency

3. **Application Contexts & Hooks**
   - Migrate contexts and providers
   - Implement with neural-safe typing
   - Verify context propagation

4. **Presentation Molecules & Organisms**
   - Migrate composite components
   - Extract business logic to hooks
   - Verify rendering and interactivity

5. **Infrastructure Services**
   - Migrate API clients
   - Implement with Result pattern
   - Verify API functionality

6. **Presentation Pages**
   - Migrate page components
   - Connect to migrated services
   - Verify page functionality

### 3. Progressive Cleanup

After successful migration of each component family:

1. Remove compatibility layers
2. Update import statements to use path aliases
3. Verify TypeScript compilation
4. Remove legacy files

## FILE TRANSFORMATION TEMPLATES

### 1. React Component Migration

```typescript
// BEFORE: /components/atoms/Button.tsx
import React from 'react';

interface ButtonProps {
  // props
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  // implementation
};

export default Button;

// AFTER: /presentation/atoms/Button.tsx
import React from 'react';
import { ButtonProps } from '@domain/types/presentation/atoms';

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  // implementation
};

export default Button;
```

### 2. Hook Migration

```typescript
// BEFORE: /hooks/useBlockingTransition.ts
import { useState, useCallback } from 'react';

export function useBlockingTransition() {
  // implementation
}

// AFTER: /application/hooks/useBlockingTransition.ts
import { useState, useCallback } from 'react';
import { TransitionState } from '@domain/types/common';

export function useBlockingTransition(): TransitionResult {
  // implementation with explicit return type
}
```

### 3. Service Migration

```typescript
// BEFORE: /services/RiskAssessmentService.ts
export class RiskAssessmentService {
  async assessRisk(patientId: string) {
    try {
      // implementation
      return result;
    } catch (error) {
      throw error;
    }
  }
}

// AFTER: /infrastructure/services/RiskAssessmentService.ts
import { Result, success, failure } from '@domain/types/common/result';
import { RiskAssessment, RiskAssessmentError } from '@domain/types/clinical/risk';

export class RiskAssessmentService {
  async assessRisk(patientId: string): Promise<Result<RiskAssessment, RiskAssessmentError>> {
    try {
      // implementation
      return success(result);
    } catch (error) {
      return failure(new RiskAssessmentError('Failed to assess risk', error));
    }
  }
}
```

## NEURAL MIGRATION SCRIPT

A neural migration script can be implemented to automate portions of this transformation:

```javascript
// scripts/neural-migration.js
const fs = require('fs');
const path = require('path');

// Neural migration matrix
const migrationMatrix = {
  'components/atoms': 'presentation/atoms',
  'components/molecules': 'presentation/molecules',
  // ... other mappings
};

// Neural-safe migration process
async function migrateFiles() {
  for (const [source, destination] of Object.entries(migrationMatrix)) {
    const sourcePath = path.join(__dirname, '../src', source);
    const destPath = path.join(__dirname, '../src', destination);
    
    // Create destination directory if needed
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    // Get files in source directory
    const files = fs.readdirSync(sourcePath);
    
    // Migrate each file
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const sourceFilePath = path.join(sourcePath, file);
        const destFilePath = path.join(destPath, file);
        
        // Read source file
        const content = fs.readFileSync(sourceFilePath, 'utf8');
        
        // Transform content (this would need a more sophisticated parser)
        const transformedContent = transformFileContent(content, source, destination);
        
        // Write to destination
        fs.writeFileSync(destFilePath, transformedContent);
        
        console.log(`Migrated: ${sourceFilePath} → ${destFilePath}`);
      }
    }
  }
}

// Main execution
migrateFiles().catch(console.error);
```

## NEXT STEPS

Proceed to [04-IMPORT-PATH-STANDARDIZATION.md](./04-IMPORT-PATH-STANDARDIZATION.md) for the import path standardization protocol.
