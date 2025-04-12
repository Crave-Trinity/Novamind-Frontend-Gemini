#!/bin/bash

# Script to fix eslint-disable inline comments in TypeScript files
# This replaces inline eslint comments with properly formatted ones

echo "Fixing eslint comments in API client files..."

# Files to fix
FILES=(
  "src/infrastructure/api/MLApiClientEnhanced.ts"
  "src/infrastructure/api/MLApiClient.ts"
  "src/infrastructure/api/ApiClient.ts"
  "src/infrastructure/api/ApiProxyService.ts"
  "src/infrastructure/api/ApiProxyService.enhanced.ts"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Processing $FILE..."
    
    # First, convert any inline eslint-disable-line comments to block comments
    # to avoid syntax errors during processing
    sed -i '' -e 's/\(.*\): any \/\/ eslint-disable-line @typescript-eslint\/no-explicit-any/\1: any \/\* eslint-disable-next-line @typescript-eslint\/no-explicit-any \*\//g' "$FILE"
    
    # Replace all eslint-disable-line comments with eslint-disable-next-line on the previous line
    sed -i '' -E 's/([^\/]*)(\/\/ eslint-disable-line[^\n]*)/\/\/ eslint-disable-next-line\
\1/g' "$FILE"
    
    # Check if there are still problematic patterns after replacement
    if grep -q "eslint-disable-line" "$FILE"; then
      echo "  Additional fixes needed for $FILE"
      
      # Get all lines with eslint-disable-line comments and manually fix them
      LINE_NUMBERS=$(grep -n "eslint-disable-line" "$FILE" | cut -d':' -f1)
      
      for LINE_NUM in $LINE_NUMBERS; do
        LINE=$(sed "${LINE_NUM}q;d" "$FILE")
        
        # Extract the content before the comment
        CONTENT=$(echo "$LINE" | sed 's/\/\/ eslint-disable-line.*//')
        
        # Extract the eslint rule
        RULE=$(echo "$LINE" | grep -o "@typescript-eslint/[a-zA-Z0-9-]*")
        
        # Create the new line format
        NEW_LINE="// eslint-disable-next-line $RULE\n$CONTENT"
        
        # Replace the line
        sed -i '' "${LINE_NUM}s/.*/$NEW_LINE/" "$FILE"
      done
    fi
  else
    echo "File $FILE not found, skipping."
  fi
done

echo "ESLint comment fixes completed."