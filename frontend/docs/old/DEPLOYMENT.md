# Novamind Digital Twin - Deployment Guide

## Quick Start

To deploy the application to production:

1. Run the deployment script:
   ```bash
   ./deploy-novamind-simplified.sh production
   ```

2. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```

3. Deploy the built assets (in `frontend/dist`) to your web server

## Brain Visualization Demo

For a quick demonstration of the 3D brain visualization capabilities, open:
```
http://yourserver/basic-brain-demo.html
```

## Environment Variables

- `VITE_API_BASE_URL`: URL of the backend API
- `VITE_ENABLE_ANALYTICS`: Set to "true" for production
- `VITE_DISABLE_MOCK_DATA`: Set to "true" for production

## Security Features

- HIPAA-compliant security headers
- Auto-logout for inactive sessions
- PHI exclusion from logs and error messages
- JWT token validation for all API endpoints

## Performance Optimizations

- Three.js optimizations for brain visualization
- Code splitting for large components
- Tailwind CSS for optimal styling
- useMemo and React.memo for expensive computations
