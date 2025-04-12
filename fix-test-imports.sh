#!/bin/bash

# Script to fix import paths in test files - correcting @test/ imports to use relative paths
# This ensures a single source of truth for path resolution

# Process test files that use @test/test-utils.unified
find src/presentation -name "*.test.tsx" | xargs grep -l "@test/test-utils.unified" | while read file; do
  # Calculate the relative path based on file depth
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  rel_path=""
  for ((i=0; i<depth-1; i++)); do
    rel_path="../$rel_path"
  done
  
  # Replace the import paths
  sed -i "" "s|@test/test-utils.unified|${rel_path}test/test-utils.unified|g" "$file"
  echo "Fixed imports in $file"
done

# Process test files that use @test/webgl
find src/presentation -name "*.test.tsx" | xargs grep -l "@test/webgl" | while read file; do
  # Calculate the relative path based on file depth
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  rel_path=""
  for ((i=0; i<depth-1; i++)); do
    rel_path="../$rel_path"
  done
  
  # Replace the import paths
  sed -i "" "s|@test/webgl|${rel_path}test/webgl|g" "$file"
  echo "Fixed imports in $file"
done

echo "All test import paths fixed!"
