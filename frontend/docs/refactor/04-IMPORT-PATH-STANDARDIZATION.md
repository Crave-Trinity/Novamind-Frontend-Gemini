# NOVAMIND DIGITAL TWIN: IMPORT PATH STANDARDIZATION

## QUANTUM-LEVEL IMPORT PATH STANDARDIZATION

This document outlines the neural-safe import path standardization protocol required to achieve mathematical consistency across the NOVAMIND Digital Twin frontend.

## IMPORT PATH DISSONANCE ANALYSIS

The current codebase exhibits quantum interference in import patterns:

### 1. Relative Path Imports

```typescript
// Excessive traversal depth creates maintenance burden
import { useTheme } from "../../contexts/ThemeContext";
import { BrainData } from "../../types/brain";
import NeuralConnection from "../atoms/NeuralConnection";
```

### 2. Inconsistent Import Patterns

```typescript
// Inconsistent patterns within the same file
import { OrbitControls } from "@react-three/drei";  // External library import
import { useTheme } from "../../contexts/ThemeContext";  // Relative import
import { RenderMode } from "@domain/models/BrainModel";  // Alias import (rare)
```

### 3. Module Resolution Confusion

```typescript
// TypeScript errors from path resolution conflicts
// Error: Cannot find module '../../types/brain' or its corresponding type declarations
import { BrainData } from "../../types/brain";
```

## NEURAL-SAFE IMPORT PATTERN ARCHITECTURE

The standardized import pattern architecture will implement a neural-safe, alias-based approach:

### 1. Layer-Based Path Aliases

```typescript
// Domain layer imports
import { BrainRegion, BrainConnection } from "@domain/types/brain";
import { RiskLevel } from "@domain/types/clinical/risk";

// Application layer imports
import { useTheme } from "@application/contexts/ThemeContext";
import { useBrainVisualization } from "@application/hooks/useBrainVisualization";

// Infrastructure layer imports
import { apiClient } from "@infrastructure/api/ApiGateway";
import { storageService } from "@infrastructure/storage/StorageService";

// Presentation layer imports
import Button from "@presentation/atoms/Button";
import BrainVisualization from "@presentation/molecules/BrainVisualization";
```

### 2. External Library Import Pattern

```typescript
// React and core libraries first
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

// External libraries next
import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Internal imports by layer
import { BrainData, RenderMode } from "@domain/types/brain";
import { useTheme } from "@application/hooks/useTheme";
import Button from "@presentation/atoms/Button";
```

### 3. Export Pattern Standardization

```typescript
// Barrel exports for logical groups
// domain/types/brain/index.ts
export * from "./models";
export * from "./visualization";
export * from "./connections";

// Named exports for components
// presentation/atoms/Button.tsx
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  // Implementation
};

export default Button;
```

## PATH ALIAS CONFIGURATION

### 1. TypeScript Configuration

Update `tsconfig.json` to define the neural-safe path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@/*": ["src/*"]
    }
  }
}
```

### 2. Vite Configuration

Update `vite.config.ts` to support the path aliases:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@presentation": path.resolve(__dirname, "./src/presentation"),
      "@": path.resolve(__dirname, "./src")
    }
  }
});
```

### 3. ESLint Import Rules

Update `eslint.config.js` to enforce the neural-safe import pattern:

```javascript
module.exports = [
  // Existing configuration...
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Import sorting and grouping
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
            "type"
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before"
            },
            {
              pattern: "@domain/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "@application/**",
              group: "internal",
              position: "after"
            },
            {
              pattern: "@infrastructure/**",
              group: "internal",
              position: "after"
            },
            {
              pattern: "@presentation/**",
              group: "internal",
              position: "after"
            }
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],
      // Prevent relative imports when alias is available
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../**/domain/*", "../../domain/*", "../../../domain/*"],
              message: "Use @domain/* import instead of relative path"
            },
            {
              group: ["../**/application/*", "../../application/*", "../../../application/*"],
              message: "Use @application/* import instead of relative path"
            },
            {
              group: ["../**/infrastructure/*", "../../infrastructure/*", "../../../infrastructure/*"],
              message: "Use @infrastructure/* import instead of relative path"
            },
            {
              group: ["../**/presentation/*", "../../presentation/*", "../../../presentation/*"],
              message: "Use @presentation/* import instead of relative path"
            }
          ]
        }
      ]
    }
  }
];
```

## IMPORT PATH TRANSFORMATION PROTOCOL

### 1. Systematic Transformation

The import transformation follows this neural-precision protocol:

1. **Identify Import Type**
   - React and core library imports
   - External library imports
   - Internal module imports

2. **Apply Path Alias Pattern**
   - Convert relative paths to aliases
   - Group imports by category
   - Sort imports alphabetically

3. **Optimize Import Scope**
   - Import only needed items
   - Use destructured imports
   - Remove unused imports

### 2. Example Transformations

#### Component Import Transformation

```typescript
// BEFORE
import React, { useState, useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "../../contexts/ThemeContext";
import { BrainData, BrainVisualizationProps } from "../../types/brain";
import { transformBrainData } from "../../utils/brainDataTransformer";
import NeuralConnection from "../atoms/NeuralConnection";
import RegionMesh from "../atoms/RegionMesh";

// AFTER
import React, { useState, useEffect, useRef } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import { BrainData, BrainVisualizationProps } from "@domain/types/brain";
import { transformBrainData } from "@application/utils/brainDataTransformer";
import { useTheme } from "@application/contexts/ThemeContext";
import NeuralConnection from "@presentation/atoms/NeuralConnection";
import RegionMesh from "@presentation/atoms/RegionMesh";
```

#### Hook Import Transformation

```typescript
// BEFORE
import { useState, useCallback, useEffect } from "react";
import { BrainData } from "../../types/brain";
import { apiClient } from "../../api/ApiClient";

// AFTER
import { useState, useCallback, useEffect } from "react";

import { BrainData } from "@domain/types/brain";
import { apiClient } from "@infrastructure/api/ApiClient";
```

#### Service Import Transformation

```typescript
// BEFORE
import { PatientModel } from "../domain/models/PatientModel";
import { RiskLevel } from "../types/RiskLevel";
import { ApiClient } from "./ApiClient";

// AFTER
import { PatientModel } from "@domain/models/PatientModel";
import { RiskLevel } from "@domain/types/clinical/risk";
import { ApiClient } from "@infrastructure/api/ApiClient";
```

### 3. Automated Transformation Script

A neural-precise transformation script can automate this process:

```javascript
// scripts/neural-import-transformer.js
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Import path mapping
const pathMap = {
  'types/': '@domain/types/',
  'domain/': '@domain/',
  'services/': '@infrastructure/services/',
  'api/': '@infrastructure/api/',
  'hooks/': '@application/hooks/',
  'contexts/': '@application/contexts/',
  'utils/': '@application/utils/',
  'components/atoms/': '@presentation/atoms/',
  'components/molecules/': '@presentation/molecules/',
  'components/organisms/': '@presentation/organisms/',
  'components/templates/': '@presentation/templates/',
  'pages/': '@presentation/pages/',
  'shaders/': '@presentation/shaders/'
};

// Neural transformation of imports
function transformImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  // Find import declarations
  const importNodes = [];
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      importNodes.push(node);
    }
    ts.forEachChild(node, visit);
  }
  ts.forEachChild(sourceFile, visit);

  // Transform relative imports to aliases
  let newContent = content;
  for (const importNode of importNodes) {
    if (importNode.moduleSpecifier && ts.isStringLiteral(importNode.moduleSpecifier)) {
      const importPath = importNode.moduleSpecifier.text;
      
      // Only transform relative imports
      if (importPath.startsWith('.')) {
        const start = importNode.moduleSpecifier.getStart(sourceFile);
        const end = importNode.moduleSpecifier.getEnd();
        const importString = content.substring(start + 1, end - 1); // Remove quotes
        
        // Apply path mapping
        let newImportPath = importString;
        for (const [oldPath, newPath] of Object.entries(pathMap)) {
          if (importString.includes(oldPath)) {
            newImportPath = importString.replace(oldPath, newPath);
            break;
          }
        }
        
        // Update content
        if (newImportPath !== importString) {
          newContent = newContent.substring(0, start + 1) + 
                       newImportPath + 
                       newContent.substring(end - 1);
        }
      }
    }
  }
  
  return newContent;
}

// Process a directory of files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const newContent = transformImports(filePath);
      fs.writeFileSync(filePath, newContent);
      console.log(`Transformed imports in: ${filePath}`);
    }
  }
}

// Start processing
const srcDir = path.join(__dirname, '../src');
processDirectory(srcDir);
```

## IMPORT PATH VERIFICATION

To verify the neural-safe import path transformation:

1. **Compilation Check**
   ```bash
   yarn tsc --noEmit
   ```

2. **ESLint Import Validation**
   ```bash
   yarn eslint --fix-dry-run "src/**/*.{ts,tsx}"
   ```

3. **Runtime Verification**
   ```bash
   yarn dev
   ```

## NEXT STEPS

Proceed to [05-CLEAN-ARCHITECTURE-IMPLEMENTATION.md](./05-CLEAN-ARCHITECTURE-IMPLEMENTATION.md) for the clean architecture implementation protocol.
