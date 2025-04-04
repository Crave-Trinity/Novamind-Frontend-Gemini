# Novamind Digital Twin Frontend

A premium frontend implementation for the Novamind Digital Twin project, providing a comprehensive visualization of patient mental health profiles for clinicians in a HIPAA-compliant environment.

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
