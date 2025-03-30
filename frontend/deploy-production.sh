#!/bin/bash

# NOVAMIND PRODUCTION DEPLOYMENT SCRIPT
# =====================================
# This script handles the complete production build and deployment process
# for the Novamind Digital Twin frontend application.

# Exit on any error
set -e

echo "🧠 NOVAMIND FRONTEND PRODUCTION DEPLOYMENT 🧠"
echo "=============================================="
echo "Starting production deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the frontend directory."
  exit 1
fi

# Enable colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Step 1: Update dependencies and scripts
echo -e "${BLUE}Step 1/7: Updating dependencies and scripts...${NC}"
chmod +x scripts/update-dependencies.js
node scripts/update-dependencies.js

# Step 2: Fix TypeScript errors
echo -e "${BLUE}Step 2/7: Fixing TypeScript errors...${NC}"
chmod +x scripts/fix-theme-context.js
chmod +x scripts/apply-typescript-fixes.js
node scripts/fix-theme-context.js
node scripts/apply-typescript-fixes.js

# Step 3: Run TypeScript type checking
echo -e "${BLUE}Step 3/7: Verifying TypeScript types...${NC}"
npm run type-check || { 
  echo -e "${RED}❌ TypeScript errors found. Please fix them before deployment.${NC}"
  exit 1
}

# Step 4: Run linting
echo -e "${BLUE}Step 4/7: Running ESLint...${NC}"
npm run lint || {
  echo -e "${YELLOW}⚠️ Linting issues found. Consider fixing them for better code quality.${NC}"
  # Don't exit as we want to continue even with linting issues
}

# Step 5: Run tests
echo -e "${BLUE}Step 5/7: Running unit tests...${NC}"
npm test || {
  echo -e "${RED}❌ Unit tests failed. Please fix them before deployment.${NC}"
  exit 1
}

# Step 6: Production build with optimizations
echo -e "${BLUE}Step 6/7: Building for production...${NC}"
# Make sure Node has enough memory for the build
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:prod || {
  echo -e "${RED}❌ Build failed. See above for errors.${NC}"
  exit 1
}

# Step 7: Bundle analysis
echo -e "${BLUE}Step 7/7: Analyzing bundle...${NC}"
npm run analyze:bundle || {
  echo -e "${YELLOW}⚠️ Bundle analysis failed, but continuing deployment.${NC}"
}

# Output success message with metrics
BUNDLE_SIZE=$(du -sh dist | cut -f1)
JS_FILES=$(find dist -name "*.js" | wc -l)
CSS_FILES=$(find dist -name "*.css" | wc -l)

echo -e "${GREEN}✅ PRODUCTION BUILD COMPLETED SUCCESSFULLY${NC}"
echo "=================================================="
echo -e "📊 ${PURPLE}Build Metrics:${NC}"
echo -e "   - Total bundle size: ${PURPLE}${BUNDLE_SIZE}${NC}"
echo -e "   - JavaScript files: ${PURPLE}${JS_FILES}${NC}"
echo -e "   - CSS files: ${PURPLE}${CSS_FILES}${NC}"
echo -e "   - Build location: ${PURPLE}$(pwd)/dist${NC}"
echo ""
echo -e "${GREEN}🚀 Your production build is ready for deployment!${NC}"
echo ""
echo -e "To preview the production build locally:"
echo -e "   ${YELLOW}npm run preview:prod${NC}"
echo ""
echo -e "To deploy to production:"
echo -e "   ${YELLOW}[Deploy commands specific to your environment]${NC}"
echo "=================================================="