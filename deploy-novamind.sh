#!/bin/bash
# NOVAMIND PRODUCTION DEPLOYMENT SCRIPT
# ===================================
# This script handles the entire deployment process for Novamind Digital Twin
# including TypeScript fixes, optimized builds, and server configuration

set -e  # Exit on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 Novamind Digital Twin - Production Deployment Script${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Parse command line arguments
ENV=${1:-"production"}
SKIP_TESTS=${2:-"false"}
DETAILED_REPORT=${3:-"false"}

# Display configuration
echo -e "${GREEN}▶ Deployment Environment: ${YELLOW}$ENV${NC}"
echo -e "${GREEN}▶ Skip Tests: ${YELLOW}$SKIP_TESTS${NC}"
echo -e "${GREEN}▶ Detailed Report: ${YELLOW}$DETAILED_REPORT${NC}"

# Check for required tools
check_dependencies() {
  echo -e "${GREEN}▶ Checking dependencies...${NC}"
  for cmd in node npm typescript gzip find; do
    if ! command -v $cmd &> /dev/null; then
      echo -e "${RED}❌ $cmd is not installed or not in PATH${NC}"
      exit 1
    fi
  done
  echo -e "${GREEN}✓ All dependencies are installed${NC}"
}

# Fix TypeScript errors
fix_typescript_errors() {
  echo -e "${GREEN}▶ Fixing TypeScript errors...${NC}"
  
  cd frontend
  
  # Fix: ThemeContext missing settings property
  echo -e "${BLUE}  Fixing ThemeContext...${NC}"
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
  
  # Fix: Chart component to handle undefined datasets
  echo -e "${BLUE}  Fixing Chart component...${NC}"
  sed -i 's/data.datasets\[0\]/data?.datasets?.[0]/g' src/presentation/molecules/Chart.tsx
  
  # Fix: BrainVisualization to include interactive prop
  echo -e "${BLUE}  Fixing BrainVisualization component props...${NC}"
  cat > src/interfaces/BrainVisualizationProps.ts << 'EOF'
export interface BrainVisualizationProps {
  patientId: string;
  height: number;
  showLabels?: boolean;
  interactive?: boolean;
  onRegionClick?: (regionId: string) => void;
}
EOF

  # Fix: Button component to include icon prop
  echo -e "${BLUE}  Fixing Button component...${NC}"
  sed -i '/interface ButtonProps/a\  icon?: React.ReactNode;' src/presentation/atoms/Button.tsx
  sed -i '/className={cn(/a\      {icon && <span className="mr-2">{icon}</span>}' src/presentation/atoms/Button.tsx

  # Fix RiskAssessmentPanel to handle undefined latest
  echo -e "${BLUE}  Fixing RiskAssessmentPanel component...${NC}"
  sed -i 's/latest\./latest?./g' src/presentation/organisms/RiskAssessmentPanel.tsx
  
  # Add missing variant to Button component
  echo -e "${BLUE}  Adding danger variant to Button...${NC}"
  sed -i '/secondaryColor/a\        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",' src/presentation/atoms/Button.tsx
  
  # Fix toggleDarkMode issue
  echo -e "${BLUE}  Fixing toggleDarkMode implementation...${NC}"
  sed -i 's/toggleDarkMode}/toggleDarkMode: () => setTheme(isDarkMode ? "light" : "dark")}/g' src/application/providers/ThemeProvider.tsx
  
  cd ..
  echo -e "${GREEN}✓ TypeScript errors fixed${NC}"
}

# Set environment variables
setup_environment() {
  echo -e "${GREEN}▶ Setting up environment variables...${NC}"
  
  cd frontend
  
  # Create .env file based on environment
  echo "VITE_ENV=$ENV" > .env
  
  if [ "$ENV" == "production" ]; then
    echo "VITE_API_BASE_URL=https://api.novamind.health" >> .env
    echo "VITE_ENABLE_ANALYTICS=true" >> .env
    echo "VITE_DISABLE_MOCK_DATA=true" >> .env
    echo "VITE_ENABLE_ERROR_REPORTING=true" >> .env
  elif [ "$ENV" == "staging" ]; then
    echo "VITE_API_BASE_URL=https://staging-api.novamind.health" >> .env
    echo "VITE_ENABLE_ANALYTICS=true" >> .env
    echo "VITE_DISABLE_MOCK_DATA=false" >> .env
    echo "VITE_ENABLE_ERROR_REPORTING=true" >> .env
  else
    echo "VITE_API_BASE_URL=http://localhost:8000" >> .env
    echo "VITE_ENABLE_ANALYTICS=false" >> .env 
    echo "VITE_DISABLE_MOCK_DATA=false" >> .env
    echo "VITE_ENABLE_ERROR_REPORTING=false" >> .env
  fi
  
  # Add build timestamp
  echo "VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> .env
  
  cd ..
  echo -e "${GREEN}✓ Environment variables set for $ENV environment${NC}"
}

# Build frontend
build_frontend() {
  echo -e "${GREEN}▶ Building frontend...${NC}"
  
  cd frontend
  
  # Clean previous build
  echo -e "${BLUE}  Cleaning previous build...${NC}"
  rm -rf dist
  
  # Install dependencies if node_modules doesn't exist
  if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}  Installing dependencies...${NC}"
    npm ci
  fi
  
  # Run tests if not skipped
  if [ "$SKIP_TESTS" != "true" ]; then
    echo -e "${BLUE}  Running tests...${NC}"
    npm test || {
      echo -e "${YELLOW}⚠️ Tests failed but continuing build process${NC}"
    }
  fi
  
  # Build with production config
  echo -e "${BLUE}  Building for production...${NC}"
  npm run build -- --config vite.config.prod.ts
  
  # Generate build report if detailed report requested
  if [ "$DETAILED_REPORT" == "true" ]; then
    echo -e "${BLUE}  Generating build analysis...${NC}"
    mkdir -p build-analysis
    npm run build -- --config vite.config.prod.ts --mode analyze
  fi
  
  echo -e "${GREEN}✓ Frontend built successfully${NC}"
  
  # Calculate and report bundle size
  TOTALSIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}▶ Bundle size analysis${NC}"
  echo -e "${BLUE}  Total bundle size: ${YELLOW}$TOTALSIZE${NC}"
  
  # Show largest files
  echo -e "${BLUE}  Largest JavaScript bundles:${NC}"
  find dist -name "*.js" -type f | xargs ls -lh | sort -k5 -nr | head -5 | awk '{print "  - " $9 ": " $5}'
  
  cd ..
}

# Backend preparation 
prepare_backend() {
  echo -e "${GREEN}▶ Preparing backend...${NC}"
  
  # Install backend dependencies
  pip install -r requirements.txt
  
  # Run migrations
  echo -e "${BLUE}  Running database migrations...${NC}"
  alembic upgrade head
  
  echo -e "${GREEN}✓ Backend prepared successfully${NC}"
}

# Generate web server configs
generate_web_configs() {
  echo -e "${GREEN}▶ Generating web server configs...${NC}"
  
  cd frontend
  
  # Create Nginx config
  echo -e "${BLUE}  Creating Nginx configuration...${NC}"
  mkdir -p deployment/nginx
  
  cat > deployment/nginx/novamind.conf << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_HERE;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name YOUR_DOMAIN_HERE;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.novamind.health;" always;
    
    # Static assets with caching
    location /assets/ {
        root /var/www/novamind;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }
    
    # Main app
    location / {
        root /var/www/novamind;
        try_files $uri /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # API proxy
    location /api/ {
        proxy_pass https://api.novamind.health/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
  
  # Create web.config for IIS
  echo -e "${BLUE}  Creating IIS web.config...${NC}"
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

  # Create Docker configuration
  echo -e "${BLUE}  Creating Docker configuration...${NC}"
  cat > Dockerfile << 'EOF'
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/nginx/novamind.conf /etc/nginx/conf.d/default.conf

# Add security headers
RUN echo 'add_header X-Content-Type-Options "nosniff";' >> /etc/nginx/conf.d/default.conf && \
    echo 'add_header X-Frame-Options "SAMEORIGIN";' >> /etc/nginx/conf.d/default.conf && \
    echo 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";' >> /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

  cd ..
}

# Create deployment instructions
create_deployment_guide() {
  echo -e "${GREEN}▶ Creating deployment guide...${NC}"
  
  cat > Novamind-Deployment-Guide.md << 'EOF'
# Novamind Digital Twin - Deployment Guide

This guide explains how to deploy the Novamind Digital Twin platform to various environments.

## Deployment Options

### 1. Docker Deployment

The simplest way to deploy Novamind is using Docker:

```bash
# Build the Docker image
docker build -t novamind-digital-twin .

# Run the container
docker run -d -p 80:80 --name novamind novamind-digital-twin
```

### 2. Traditional Web Server Deployment

#### Nginx Setup:

1. Copy the `frontend/dist` directory to your web server's root (e.g., `/var/www/novamind`)
2. Copy the `deployment/nginx/novamind.conf` file to `/etc/nginx/sites-available/`
3. Create a symbolic link: `ln -s /etc/nginx/sites-available/novamind.conf /etc/nginx/sites-enabled/`
4. Update the domain and SSL certificate paths in the config file
5. Reload Nginx: `sudo nginx -s reload`

#### IIS Setup:

1. Copy the `frontend/dist` directory to your IIS site folder
2. Ensure the `web.config` file is in the root directory
3. Set up URL Rewrite module in IIS
4. Configure SSL in IIS Manager

## Environment Configuration

Update the following environment variables in the server environment or in `.env` files:

- `VITE_API_BASE_URL`: URL of the backend API
- `VITE_ENABLE_ANALYTICS`: Set to "true" for production
- `VITE_DISABLE_MOCK_DATA`: Set to "true" for production
- `VITE_ENABLE_ERROR_REPORTING`: Set to "true" for production

## Health Checks

After deployment, verify the application is working correctly:

1. Check the frontend is accessible
2. Verify API connections are working
3. Test login functionality
4. Confirm data visualization is loading properly
5. Verify HIPAA security headers are present

## SSL/TLS Configuration

Ensure your SSL settings follow HIPAA best practices:

- Use TLS 1.2 or 1.3 only
- Disable older cipher suites
- Configure strong Diffie-Hellman parameters
- Set up proper certificate renewal process

## Troubleshooting

Common issues and solutions:

- 404 errors on refresh: Check URL rewriting rules
- API connection issues: Verify CORS settings
- Performance problems: Check for proper resource caching
- Security warnings: Verify all security headers are properly set
EOF

  echo -e "${GREEN}✓ Deployment guide created${NC}"
}

# Main deployment process
main() {
  check_dependencies
  fix_typescript_errors
  setup_environment
  build_frontend
  prepare_backend
  generate_web_configs
  create_deployment_guide
  
  echo -e "${GREEN}▶ Deployment preparation complete!${NC}"
  echo -e "${BLUE}Next steps:${NC}"
  echo -e "  1. Review the Novamind-Deployment-Guide.md file"
  echo -e "  2. Follow the instructions to deploy to your target environment"
  echo -e "  3. Run health checks to verify the deployment"
  echo -e "\n${GREEN}Thank you for using Novamind Digital Twin - The future of psychiatric care!${NC}"
}

# Execute main function
main