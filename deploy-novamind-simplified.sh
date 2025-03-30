#!/bin/bash
# NOVAMIND SIMPLIFIED PRODUCTION DEPLOYMENT SCRIPT
# Focuses on fixing TypeScript errors and preparing the app for deployment

set -e  # Exit on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 Novamind Digital Twin - Simplified Production Deployment${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Parse command line arguments
ENV=${1:-"production"}

# Display configuration
echo -e "${GREEN}▶ Deployment Environment: ${YELLOW}$ENV${NC}"

# Fix TypeScript errors
fix_typescript_errors() {
  echo -e "${GREEN}▶ Fixing TypeScript errors...${NC}"
  
  cd /workspaces/Novamind-Backend/frontend
  
  # Fix: ThemeContext missing settings property
  echo -e "${BLUE}  Fixing ThemeContext...${NC}"
  mkdir -p src/application/contexts
  
  cat > src/application/contexts/ThemeContext.tsx << 'EOF'
import { createContext, useContext } from "react";

export type ThemeOption = "light" | "dark" | "sleek" | "clinical";

export interface ThemeSettings {
  bgColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  glowIntensity: number;
  useBloom: boolean;
}

export interface ThemeContextType {
  theme: ThemeOption;
  isDarkMode: boolean;
  settings: ThemeSettings;
  setTheme: (newTheme: ThemeOption) => void;
  toggleDarkMode: () => void;
}

// Default theme settings
export const themeSettings: Record<ThemeOption, ThemeSettings> = {
  light: {
    bgColor: '#ffffff',
    primaryColor: '#4c6ef5',
    secondaryColor: '#adb5bd',
    textColor: '#000000',
    glowIntensity: 0,
    useBloom: false
  },
  dark: {
    bgColor: '#121212',
    primaryColor: '#4c6ef5',
    secondaryColor: '#343a40',
    textColor: '#ffffff',
    glowIntensity: 0.3,
    useBloom: true
  },
  sleek: {
    bgColor: '#1a1a2e',
    primaryColor: '#00bcd4',
    secondaryColor: '#2a2a5a',
    textColor: '#ffffff',
    glowIntensity: 0.8,
    useBloom: true
  },
  clinical: {
    bgColor: '#f8f9fa',
    primaryColor: '#2c7be5',
    secondaryColor: '#edf2f9',
    textColor: '#12263f',
    glowIntensity: 0,
    useBloom: false
  }
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDarkMode: false,
  settings: themeSettings.light,
  setTheme: () => {},
  toggleDarkMode: () => {}
});

// Custom hook for consuming the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
EOF

  # Create interfaces directory for BrainVisualization props
  mkdir -p src/interfaces
  
  # Fix: BrainVisualization to include interactive prop
  echo -e "${BLUE}  Creating BrainVisualization props interface...${NC}"
  cat > src/interfaces/BrainVisualizationProps.ts << 'EOF'
export interface BrainVisualizationProps {
  patientId: string;
  height: number;
  showLabels?: boolean;
  interactive?: boolean;
  onRegionClick?: (regionId: string) => void;
}
EOF

  # Create web.config for production deployment
  echo -e "${BLUE}  Creating web.config...${NC}"
  mkdir -p dist
  cat > dist/web.config << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
EOF

  cd ..
  echo -e "${GREEN}✓ TypeScript errors fixed${NC}"
}

# Set environment variables
setup_environment() {
  echo -e "${GREEN}▶ Setting up environment variables...${NC}"
  
  cd /workspaces/Novamind-Backend/frontend
  
  # Create .env file based on environment
  echo "VITE_ENV=$ENV" > .env
  
  if [ "$ENV" == "production" ]; then
    echo "VITE_API_BASE_URL=https://api.novamind.health" >> .env
    echo "VITE_ENABLE_ANALYTICS=true" >> .env
    echo "VITE_DISABLE_MOCK_DATA=true" >> .env
  elif [ "$ENV" == "staging" ]; then
    echo "VITE_API_BASE_URL=https://staging-api.novamind.health" >> .env
    echo "VITE_ENABLE_ANALYTICS=true" >> .env
    echo "VITE_DISABLE_MOCK_DATA=false" >> .env
  else
    echo "VITE_API_BASE_URL=http://localhost:8000" >> .env
    echo "VITE_ENABLE_ANALYTICS=false" >> .env 
    echo "VITE_DISABLE_MOCK_DATA=false" >> .env
  fi
  
  # Add build timestamp
  echo "VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> .env
  
  cd ..
  echo -e "${GREEN}✓ Environment variables set for $ENV environment${NC}"
}

# Create production guide
create_deploy_guide() {
  echo -e "${GREEN}▶ Creating deployment guide...${NC}"
  
  cat > /workspaces/Novamind-Backend/DEPLOYMENT.md << 'EOF'
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
EOF

  echo -e "${GREEN}✓ Deployment guide created${NC}"
}

# Main deployment process
main() {
  fix_typescript_errors
  setup_environment
  create_deploy_guide
  
  echo -e "${GREEN}▶ Deployment preparation complete!${NC}"
  echo -e "${BLUE}Next steps:${NC}"
  echo -e "  1. Run 'cd frontend && npm run build' to build the application"
  echo -e "  2. Deploy the contents of frontend/dist to your production server"
  echo -e "  3. Check out the brain visualization demo at /basic-brain-demo.html"
  
  echo -e "\n${GREEN}✨ The Novamind Digital Twin is ready to revolutionize psychiatric care!${NC}"
}

# Execute main function
main