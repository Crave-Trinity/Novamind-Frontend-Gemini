# NOVAMIND Digital Twin: Concierge Psychiatry Platform

A cutting-edge psychiatric platform with Digital Twin technology for personalized treatment planning and visualization.

## Project Structure

This project follows a monorepo architecture with clear separation between frontend, backend, and shared resources:

```
novamind-digitaltwin/
├── backend/             # All backend code and configuration
│   ├── app/             # FastAPI application
│   │   ├── api/         # API endpoints
│   │   ├── application/ # Application services and use cases
│   │   ├── core/        # Core utilities and configuration
│   │   ├── domain/      # Domain models and business logic
│   │   └── infrastructure/ # External services integration
│   ├── alembic/         # Database migration scripts
│   ├── main.py          # FastAPI application entry point
│   └── requirements.txt # Python dependencies
│
├── frontend/            # All frontend code and configuration
│   ├── src/             # React application source code
│   │   ├── domain/      # Domain models and interfaces
│   │   ├── application/ # Application services and state management
│   │   ├── infrastructure/ # API clients and external services
│   │   └── presentation/ # React components following atomic design
│   ├── public/          # Static assets
│   ├── package.json     # Node.js dependencies
│   └── tsconfig.json    # TypeScript configuration
│
├── shared/              # Shared resources used by both frontend and backend
│   ├── deployment/      # Deployment scripts and configurations
│   ├── logs/            # Application logs
│   ├── reports/         # Generated reports
│   ├── security-reports/ # Security audit reports
│   └── tools/           # Shared tools and utilities
│
├── docs/                # Documentation for the entire project
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI application
uvicorn main:app --reload
```

The backend API will be available at http://localhost:8000.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend application will be available at http://localhost:3000.


## Development Guidelines

### Backend

- Follow clean architecture principles
- Keep domain logic pure and framework-agnostic
- Use type hints and docstrings
- Write tests for all new features

### Frontend

- Follow atomic design pattern for components
- Use TypeScript for all new code
- Follow the React and Tailwind guidelines in `.windsurfrules`
- Implement proper error handling and loading states

## HIPAA Compliance

This application handles sensitive patient data and must comply with HIPAA regulations:

- No PHI in URLs or localStorage
- Implement proper authentication and authorization
- Log all data access
- Encrypt all data in transit and at rest

## License

See the [LICENSE](LICENSE) file for details.
