#!/bin/bash

# Script to fix eslint-disable inline comments in TypeScript files
# This replaces inline eslint comments with properly formatted ones

echo "Fixing eslint comments in MLApiClientEnhanced.ts..."

# Replace all any types with proper eslint disable comments
sed -i '' -e 's/\(.*\): any \/\/ eslint-disable-line @typescript-eslint\/no-explicit-any/\1: any \/\* eslint-disable-next-line @typescript-eslint\/no-explicit-any \*\//g' src/infrastructure/api/MLApiClientEnhanced.ts

# Move all eslint-disable-line comments to separate lines above
sed -i '' -E 's/([^\/]*)(\/\/ eslint-disable-line[^\n]*)/\/\/ eslint-disable-next-line\n\1/g' src/infrastructure/api/MLApiClientEnhanced.ts

echo "ESLint comment fixes completed."