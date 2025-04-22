This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

- Pay special attention to the Repository Instruction. These contain important context and guidelines specific to this project.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: README.md
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
README.md
```

# Files

## File: README.md
````markdown
# Novamind Digital Twin Frontend

A premium frontend implementation for the Novamind Digital Twin project, providing a comprehensive visualization of patient mental health profiles for clinicians in a HIPAA-compliant environment.

## Architecture

This project follows a clean architecture approach with a clear separation of concerns:

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

### Import Rules

To maintain architectural boundaries and ensure a clean separation of concerns:

1. **Domain** - Contains pure business logic with no external dependencies
2. **Application** - Can import from Domain only
3. **Infrastructure** - Can import from Domain and Application
4. **Presentation** - Can import from all layers
5. **App** - Can import from all layers

## Architecture Overview

This frontend follows Clean Architecture principles with the Atomic Design pattern:

```
frontend/
├── src/
│   ├── domain/              # Business logic, interfaces, models
│   │   ├── models/          # TypeScript interfaces/types
│   │   ├── entities/        # Domain entities
│   │   └── services/        # Service interfaces
│   │
│   ├── application/         # Use cases, state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React Context providers
│   │   └── services/        # Application services
│   │
│   ├── infrastructure/      # External integrations
│   │   ├── api/             # API clients
│   │   ├── storage/         # Local storage
│   │   └── services/        # External service implementations
│   │
│   ├── presentation/        # UI components (React + Tailwind)
│   │   ├── atoms/           # Basic UI building blocks
│   │   ├── molecules/       # Combinations of atoms
│   │   ├── organisms/       # Complex UI sections
│   │   ├── templates/       # Page layouts
│   │   └── pages/           # Route components
```

## Core Visualization Components

### Brain Visualization

The 3D brain model visualization is a centerpiece of the frontend, allowing clinicians to:

- View brain regions with activity highlighting
- Identify neural pathways and connections
- Toggle between different visualization modes (anatomical, functional, connectivity)
- Interact with specific regions to view detailed information

### Clinical Metrics Dashboard

Comprehensive visualization of patient metrics including:

- Assessment scores with temporal trends
- Biomarker data with reference ranges
- Treatment effectiveness and adherence
- Risk assessment visualization

### XGBoost Integration

Seamless integration with the backend XGBoost service for:

- Risk prediction (relapse, suicide)
- Treatment response prediction
- Outcome forecasting
- Digital twin integration

## Design System

The UI follows a premium, concierge psychiatry experience with:

- Sleek dark theme as the default (with light mode toggle)
- Clinical precision in data presentation
- Clear confidence intervals for all predictions
- HIPAA-compliant data presentation

## Temporal Visualizations

The system provides multi-scale temporal visualizations:

- Daily/weekly/monthly views of patient data
- State transition visualization between mental health conditions
- Treatment response trajectories
- Early warning signals and critical transition points

## Biometric Integrations

Real-time visualization of biometric data:

- Physiological metrics (heart rate, sleep patterns, cortisol levels)
- Behavioral tracking (activity levels, social interactions)
- Self-reported data (mood ratings, symptom severity)
- Environmental context (weather, light exposure)

## Key Features

1. **Digital Twin Dashboard**: Central view of patient's mental health model
2. **Brain Model Viewer**: Interactive 3D brain visualization
3. **Treatment Response Predictor**: AI-powered treatment outcome simulation
4. **Risk Assessment Panel**: Visualization of risk factors and predictions
5. **Clinical Metrics Tracking**: Temporal visualization of assessment scores
6. **Biometric Correlation**: Integration of physiological and behavioral data

## Development

### Requirements

- Node.js 16+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Technologies

- React 18
- TypeScript
- Tailwind CSS
- Three.js for 3D visualization
- React Query for data fetching
- D3.js for data visualization

## HIPAA Compliance

All visualizations follow HIPAA guidelines:

- No PHI exposure in UI or logs
- Secure data transmission
- Role-based access controls
- Audit trails for all interactions

## Project Status

This frontend implementation is ready to connect with the Novamind Digital Twin backend services for a comprehensive psychiatric digital twin platform.

## Configuration Management

All configuration files are centralized in the `/config` directory. This includes:

- Build tools (Vite)
- Testing (Vitest)
- TypeScript
- ESLint
- PostCSS/Tailwind
- Build scripts

For detailed configuration guidelines and structure, see [Configuration Documentation](./config/README.md).

Key principles:
1. All configs live in `/config` directory
2. No nested config directories beyond one level
3. Clear naming conventions for all config files
4. Environment variables in root `.env` files
5. Configuration changes must be documented

## Root Directory Structure

The root directory contains only essential files and directories:

```
/
├── config/                # All configuration files
├── src/                  # Source code
├── public/               # Static assets
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
├── dist/                 # Build output
├── test-reports/         # Test results
├── build-analysis/       # Build analytics
├── .github/              # GitHub workflows and templates
├── .vscode/             # VS Code settings
├── node_modules/        # Dependencies (gitignored)
├── .vite/               # Vite cache (gitignored)
│
├── package.json         # Project manifest
├── package-lock.json    # Dependency lock file
├── index.html          # Entry point
├── tsconfig.json       # TypeScript config (symlink)
├── .gitignore         # Git ignore rules
├── .markdownlint.json # Markdown linting rules
├── LICENSE            # Project license
└── README.md         # Project documentation
```

Key principles:
1. No configuration files in root (except symlinks if required)
2. Only essential project files at root level
3. Build artifacts and caches are gitignored
4. Documentation and assets in dedicated directories
````


# Instruction
# Novamind Digital Twin - AI Analysis Instructions

## Project Context
This is a cutting-edge psychiatry and mental health digital twin platform that leverages AI/ML analytics to revolutionize clinical practice. The codebase follows clean architecture principles with strict layering:

- Domain (core business logic)
- Application (use cases, state)
- Infrastructure (external services)
- Presentation (UI using Atomic Design)

## Technical Stack
- TypeScript (strict mode)
- React
- Three.js for 3D visualizations
- TailwindCSS for styling
- React Query for data fetching

## Analysis Focus Areas
1. Code quality and adherence to architecture patterns
2. TypeScript type safety
3. Performance optimizations in React components
4. HIPAA compliance measures
5. 3D visualization best practices

## Coding Guidelines
- PURE TypeScript only (no JavaScript)
- Strict layering and dependency flow
- Atomic design pattern for UI components
- Error handling with explicit types
- Performant React with proper memoization

## Data Security Requirements
- Data masking for PHI
- Role-based access control
- Secure API communications
- Audit logging for all sensitive operations

When analyzing this codebase, please identify:
1. Areas where architecture patterns could be improved
2. Potential performance bottlenecks
3. HIPAA compliance risks
4. Opportunities for better TypeScript typing
5. Possible enhancements to the 3D brain visualization components
