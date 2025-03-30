#!/bin/bash
# Novamind Digital Twin Deployment Script
# This script builds and deploys the frontend application using the optimal configurations

# Print commands as they're executed
set -ex

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 Novamind Digital Twin - Deployment Script${NC}"
echo -e "${BLUE}=============================================${NC}"

# Environment selection
ENV=${1:-"mock"}
if [ "$ENV" != "mock" ] && [ "$ENV" != "real" ]; then
  echo -e "${RED}Invalid environment: $ENV. Valid options are 'mock' or 'real'${NC}"
  exit 1
fi

echo -e "${GREEN}▶ Selected environment: ${YELLOW}$ENV${NC}"
echo -e "${GREEN}▶ Starting build process...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "$2" == "--fresh" ]; then
  echo -e "${GREEN}▶ Installing dependencies...${NC}"
  npm ci
fi

# Set environment variables based on selected mode
if [ "$ENV" == "mock" ]; then
  echo -e "${GREEN}▶ Setting up MOCK API mode...${NC}"
  export VITE_API_MODE="mock"
  echo "VITE_API_MODE=mock" > .env.production
  echo "VITE_USE_MOCK_API=true" >> .env.production
else
  echo -e "${GREEN}▶ Setting up REAL API mode...${NC}"
  export VITE_API_MODE="real"
  echo "VITE_API_MODE=real" > .env.production
  echo "VITE_USE_MOCK_API=false" >> .env.production
fi

# Add build timestamp
echo "VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> .env.production

# Clean previous build
echo -e "${GREEN}▶ Cleaning previous build...${NC}"
rm -rf dist

# Run production build
echo -e "${GREEN}▶ Building for production...${NC}"
npm run build -- --config vite.config.prod.ts

# Check build status
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build completed successfully!${NC}"
  
  # Display build details
  FILECOUNT=$(find dist -type f | wc -l)
  TOTALSIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}▶ Build contains ${YELLOW}$FILECOUNT${GREEN} files, total size: ${YELLOW}$TOTALSIZE${NC}"
  
  # Create a version file for tracking
  VERSION=$(node -e "console.log(require('./package.json').version)")
  echo "{\"version\":\"$VERSION\",\"environment\":\"$ENV\",\"buildTime\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > dist/version.json
  
  # Option to preview the built version
  if [ "$3" == "--preview" ]; then
    echo -e "${GREEN}▶ Starting preview server...${NC}"
    echo -e "${BLUE}▶ Access the preview at: ${YELLOW}http://localhost:4173${NC}"
    npm run preview -- --config vite.config.prod.ts
  fi
  
  echo -e "${GREEN}▶ Deploy the contents of the ${YELLOW}dist/${GREEN} directory to your server${NC}"
  echo -e "${GREEN}▶ Done!${NC}"
  exit 0
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi