# Novamind Digital Twin: Production Deployment Guide 🧠

This guide explains how to deploy the Novamind Digital Twin frontend application using our clean architecture approach. The system is designed to work **with or without** a backend connection, thanks to the API abstraction layer.

## Architecture Overview

The application uses a **Hexagonal (Ports & Adapters) Architecture** to completely separate the frontend from backend dependencies:

```
Frontend (Clean Architecture)
├── Domain Layer (Pure Business Logic)
│   └── Models, Interfaces, Types
├── Application Layer (Use Cases)
│   └── Hooks, State Management, Business Rules  
├── Presentation Layer (UI Components)
│   └── React Components (Atomic Design Pattern)
└── Infrastructure Layer
    └── API Gateway (Abstraction Layer)
        ├── IApiClient Interface (Port)
        ├── Real ApiClient (Adapter)
        └── Enhanced MockApiClient (Adapter)
```

This architecture allows for **complete independence** from backend implementation details while maintaining strict typing and interfaces throughout the system.

## Deployment Options

### Option 1: Mock Mode (No Backend Required)

This mode uses our enhanced mock data provider to deliver a full-featured experience with no backend dependency:

```bash
# From the frontend directory
chmod +x deploy.sh
./deploy.sh mock
```

The mock mode:
- Generates realistic simulated data for all API endpoints
- Creates a complete production build with optimal settings
- Simulates network delays for realistic testing
- Logs all "API calls" to the console for debugging
- Will automatically work when deployed to any static hosting

**Use Cases:** Demos, presentations, feature development, UI testing.

### Option 2: Real API Mode (Backend Required)

For production with a real backend:

```bash
# From the frontend directory
chmod +x deploy.sh
./deploy.sh real
```

This mode:
- Connects to your actual backend API
- Fallbacks to mock data if API connection fails 
- Optimizes production settings for real API use
- Enables advanced security features for HIPAA compliance

**Use Cases:** Production environments, staging, integrated testing.

## Deployment Locations

The built application in the `dist/` directory can be deployed to:

1. **Static Hosting Providers:**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

2. **Self-Hosted Options:**
   - Nginx server
   - Apache with static file serving
   - Docker container with static file server

For either deployment option, the application is self-contained and ready to serve without additional configuration.

## Advanced Configuration

### Environment Variables

The build process supports these environment variables:

- `VITE_API_MODE`: Set to "mock" or "real" (default: determined by deploy script)
- `VITE_API_URL`: Base URL for API requests (default: "/api")
- `VITE_USE_MOCK_API`: Override to force mock mode (default: based on mode)

### Manual API Gateway Control

In the browser console, you can dynamically switch between mock and real API modes:

```javascript
// Switch to mock mode - great for demos where backend isn't available
ApiGateway.enableMockMode();

// Switch to real API mode - only use if backend is running
ApiGateway.disableMockMode();
```

## Testing Your Deployment

After building, you can preview the production build locally:

```bash
# Build and preview
./deploy.sh mock --preview
# or
./deploy.sh real --preview
```

This will serve the production build at `http://localhost:4173`.

## Production Optimization

The build includes these optimizations:

- Code splitting by route and vendor
- Three.js-specific optimizations for brain visualization
- Tree-shaking for smaller bundle size
- Preload directives for critical resources
- Image optimization
- Minification and compression

## Important Notes

1. The API Gateway intercepts all `/api/*` requests. If using a proxy server like Nginx, ensure it's configured correctly to forward these requests.

2. For WebGL support, ensure your hosting supports serving .glb files with the correct MIME type.

3. HIPAA Compliance: When using real API mode in production, ensure all PHI data is handled according to HIPAA requirements. The mock mode generates synthetic data with no real PHI.

4. If you encounter CORS issues, configure your backend to accept requests from your frontend domain.

---

With this deployment approach, you can start showcasing and using the frontend right away while the backend team continues developing the API endpoints. When the backend is ready, simply switch to real API mode without any code changes.