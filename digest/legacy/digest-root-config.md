This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: *.json, *.js, *.cjs, *.sh, .eslint*, .prettier*, .markdown*, .cursorrules, .windsurfrules
- Files matching these patterns are excluded: node_modules/**, digest/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
.cursorrules
.eslintignore
.eslintrc.cjs
.eslintrc.js
.markdownlint.json
.prettierrc
.windsurfrules
components.json
eslint.config.js
fix-test-imports.sh
package.json
```

# Files

## File: .markdownlint.json
````json
{
  "default": true,
  "MD041": false,
  "MD047": true,
  "line-length": false,
  "no-inline-html": false
}
````

## File: .prettierrc
````
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100
}
````

## File: .windsurfrules
````
# Novamind Digital Twin: UI Implementation Rules

## Component Architecture

1. **Atomic Design**
   ```
   atoms/          # Basic UI elements (Button, Input, etc.)
   molecules/      # Simple combinations (SearchBar, Card, etc.)
   organisms/      # Complex components (Header, Sidebar, etc.)
   templates/      # Page layouts (DashboardLayout, etc.)
   pages/          # Full pages (Dashboard, Settings, etc.)
   ```

2. **Component Rules**
   - Single Responsibility Principle
   - Props interface with JSDoc
   - Explicit return type
   - Error boundary wrapper
   - Loading state handling

3. **Performance**
   ```typescript
   // ✅ Memoize expensive components
   export const BrainRegion = memo(({ data }: Props) => {
     // Implementation
   });

   // ✅ Memoize callbacks
   const handleUpdate = useCallback((id: string) => {
     // Implementation
   }, []);

   // ✅ Memoize expensive computations
   const processedData = useMemo(() => {
     return heavyComputation(data);
   }, [data]);
   ```

## Tailwind Implementation

1. **Class Organization**
   ```tsx
   // ✅ Logical grouping
   <div className={clsx(
     // Layout
     'grid grid-cols-12 gap-4',
     // Typography
     'text-base font-medium text-gray-900',
     // Colors & Effects
     'bg-white shadow-lg',
     // Interactivity
     'hover:bg-gray-50 focus:ring-2',
     // Responsive
     'md:grid-cols-6 lg:grid-cols-4'
   )}>
   ```

2. **Custom Classes**
   ```css
   @layer components {
     .neural-card {
       @apply rounded-lg bg-white shadow-xl p-6;
       @apply hover:shadow-2xl transition-shadow;
       @apply dark:bg-gray-800 dark:text-white;
     }
   }
   ```

3. **Theme Extensions**
   ```js
   // tailwind.config.cjs
   module.exports = {
     theme: {
       extend: {
         colors: {
           neural: {
            active: '#FF5E5B',
            inactive: '#373737'
          }
         }
       }
     }
   }
   ```

## State Management

1. **Local State**
   ```typescript
   // ✅ Use for UI state
   const [isOpen, setIsOpen] = useState(false);
   ```

2. **Complex State**
   ```typescript
   // ✅ Use reducers for complex logic
   const [state, dispatch] = useReducer(brainModelReducer, initialState);
   ```

3. **Form State**
   ```typescript
   // ✅ Use React Hook Form
   const { register, handleSubmit } = useForm<PatientData>();
   ```

## Performance Optimization

1. **Virtualization**
   ```typescript
   // ✅ Use for long lists
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={400}
     width={600}
     itemCount={1000}
     itemSize={50}
   >
     {Row}
   </FixedSizeList>
   ```

2. **Code Splitting**
   ```typescript
   // ✅ Lazy load components
   const BrainVisualizer = lazy(() => 
     import('@presentation/organisms/BrainVisualizer')
   );
   ```

3. **Resource Cleanup**
   ```typescript
   // ✅ Always cleanup
   useEffect(() => {
     const subscription = subscribe();
     return () => subscription.unsubscribe();
   }, []);
   ```

## Three.js Integration

1. **Scene Setup**
   ```typescript
   // ✅ Proper scene management
   const BrainScene = () => (
     <Canvas>
       <React.Suspense fallback={<Loader />}>
         <BrainModel />
         <Effects />
         <Controls />
       </React.Suspense>
     </Canvas>
   );
   ```

2. **Performance**
   ```typescript
   // ✅ Use instances for repeated elements
   const Neurons = memo(({ data }) => (
     <InstancedMesh count={data.length}>
       <sphereGeometry args={[0.1, 32, 32]} />
       <neuronMaterial />
     </InstancedMesh>
   ));
   ```

3. **Resource Management**
   ```typescript
   // ✅ Dispose resources
   useEffect(() => {
     return () => {
       geometry.dispose();
       material.dispose();
       texture.dispose();
     };
   }, []);
   ```

## HIPAA Compliance

1. **Data Display**
   ```typescript
   // ✅ Mask sensitive data
   const PatientInfo = ({ data }: Props) => (
     <div>
       <MaskedField value={data.ssn} />
       <RedactedText text={data.notes} />
     </div>
   );
   ```

2. **Form Handling**
   ```typescript
   // ✅ Secure form submission
   const onSubmit = async (data: PatientData) => {
     await secureApiClient.post('/patients', data);
   };
   ```

## Error Handling

1. **Component Errors**
   ```typescript
   // ✅ Use error boundaries
   const VisualizationErrorBoundary = ({
     children
   }: PropsWithChildren) => (
     <ErrorBoundary
       fallback={<ErrorFallback />}
       onError={logError}
     >
       {children}
     </ErrorBoundary>
   );
   ```

2. **Async Errors**
   ```typescript
   // ✅ Handle loading states
   const { data, error, isLoading } = useQuery({
     queryKey: ['brainModel', id],
     queryFn: () => fetchBrainModel(id)
   });
   ```
````

## File: components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.cjs",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
````

## File: .eslintignore
````
# Ignore test files with syntax issues
src/test/**/*.ts
src/test/**/*.tsx
test-puppeteer/**/*.js
scripts/**/*.js
scripts/**/*.cjs
config/**/*.cjs
````

## File: .eslintrc.js
````javascript
/* eslint-env node */
⋮----
node: true, // Include node for config file and scripts
⋮----
project: ['./tsconfig.json', './tsconfig.node.json'], // Point to both tsconfigs
⋮----
'eslint:recommended', // Base ESLint rules
'plugin:@typescript-eslint/recommended', // Base TS rules
'plugin:@typescript-eslint/recommended-requiring-type-checking', // Rules requiring type info
'plugin:react/recommended', // Base React rules
'plugin:react/jsx-runtime', // For new JSX transform (React 17+)
'plugin:react-hooks/recommended', // React Hooks rules
'plugin:jsx-a11y/recommended', // Accessibility rules
'plugin:import/recommended', // Import plugin rules
'plugin:import/typescript', // Import plugin TS integration
'plugin:vitest/recommended', // Vitest plugin recommended rules
⋮----
version: 'detect', // Automatically detect React version
⋮----
alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory
⋮----
'.eslintrc.cjs', // Ignore this file itself from linting
⋮----
// === Turn off rules handled by TypeScript ===
⋮----
// === TypeScript Specific ===
⋮----
], // More strict, but allow explicit void
⋮----
'@typescript-eslint/no-unsafe-assignment': 'warn', // Downgrade from error for now
⋮----
'@typescript-eslint/restrict-template-expressions': 'warn', // Often noisy, review later
⋮----
// === React & Hooks ===
'react/jsx-uses-react': 'off', // Covered by jsx-runtime
'react/react-in-jsx-scope': 'off', // Covered by jsx-runtime
⋮----
// === Import Sorting/Ordering ===
⋮----
'import/no-named-as-default-member': 'off', // Can be buggy with some setups
⋮----
// === Accessibility ===
'jsx-a11y/anchor-is-valid': 'warn', // Allow valid Next/Router links
⋮----
// === General Quality/Style ===
⋮----
], // Allow info for now
⋮----
// === Vitest (Covered by 'extends', add specifics if needed) ===
// 'vitest/expect-expect': 'error',
// 'vitest/no-disabled-tests': 'warn',
⋮----
// Override rules for test files
⋮----
'vitest/globals': true, // Ensure Vitest globals are recognized
⋮----
// Allow console logs in setupTests.ts
````

## File: eslint.config.js
````javascript
export default tseslint.config(
eslint.configs.recommended, // Base ESLint recommended rules
...tseslint.configs.recommended, // TypeScript recommended rules
eslintPluginPrettierRecommended, // Integrates Prettier rules
⋮----
// Custom rules and overrides
⋮----
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Set to error to enable autofixing
⋮----
// Add any other project-specific rules here
⋮----
// Specify files this configuration applies to
⋮----
// Specify files/directories to ignore
⋮----
'*.config.js', // Ignore config files themselves
````

## File: fix-test-imports.sh
````bash
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
````

## File: .cursorrules
````
# Novamind Digital Twin: Development Rules
- PURE TYPESCRIPT TS NO JS 

## Environment
```bash
node >= 18.0.0
npm >= 9.0.0
```

## Required Extensions
- ESLint + Prettier
- TypeScript
- Tailwind CSS IntelliSense
- Error Lens

## Editor Config
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Core Architecture Rules

### Module System
- ESM only (type: "module")
- TypeScript only (.ts/.tsx)
- Path aliases required (@domain/...)
- No CommonJS (except .cjs configs)
- PURE TYPESCRIPT TS NO JS 

### Directory Structure
```
src/
├── domain/           # Core business logic
├── application/      # Use cases, state
├── infrastructure/   # External services
└── presentation/     # UI (Atomic Design)
    ├── atoms/       # Basic components
    ├── molecules/   # Combined atoms
    ├── organisms/   # Complex UI
    ├── templates/   # Layouts
    └── pages/       # Routes
```

### Import Rules
- Domain → No external imports
- Application → Domain only
- Infrastructure → Domain, Application
- Presentation → All layers

### Type Safety
- Strict mode enabled
- No any, use unknown
- Type guards required
- Explicit error types

### Component Rules
- Props interface with JSDoc
- Explicit return type
- Error boundary wrapper
- Memoize when needed
```typescript
// ✅ Performance optimization
const Component = memo(({ data }: Props) => {
  const memoizedCallback = useCallback(() => {}, []);
  const memoizedValue = useMemo(() => compute(data), [data]);
  return <div>{/* Implementation */}</div>;
});
```

### State Management
- Local state for UI
- Context for theme/auth
- Query hooks for server state
- Form state via React Hook Form

### HIPAA Compliance
- Mask sensitive data
- Secure data transmission
- Role-based access
- Audit logging

### Error Handling
```typescript
try {
  await secureOperation();
} catch (error) {
  errorBoundary.capture(error);
  logger.error('Operation failed', { context: error });
}
```

### Documentation
- TSDoc for public APIs
- README per directory
- OpenAPI for HTTP endpoints
- Architecture decisions recorded

## Scripts & Commands

1. **Development**
   ```bash
   # Start dev server
   npm run dev
   
   # Type checking
   npm run typecheck
   
   # Linting
   npm run lint
   
   # Formatting
   npm run format
   ```

2. **Testing**
   ```bash
   # Run all tests
   npm test
   
   # Watch mode
   npm run test:watch
   
   # Coverage
   npm run test:coverage
   
   # Specific tests
   npm test -- path/to/test.test.ts
   ```

3. **Building**
   ```bash
   # Production build
   npm run build
   
   # Preview build
   npm run preview
   ```

## Git Workflow

1. **Branch Naming**
   ```bash
   feature/brain-visualization
   fix/memory-leak
   refactor/api-client
   test/brain-model
   ```

2. **Commit Messages**
   ```bash
   # Format: <type>(<scope>): <description>
   
   feat(visualization): add neural pathway highlighting
   fix(memory): resolve WebGL context leak
   refactor(api): implement clean architecture pattern
   test(model): add brain region tests
   ```

3. **Pre-commit Checks**
   ```bash
   # Runs automatically on commit
   - Type checking
   - Linting
   - Tests
   - Format checking
   ```

## Code Quality

1. **Linting**
   ```bash
   # Check all files
   npm run lint
   
   # Fix automatically
   npm run lint -- --fix
   
   # Check specific files
   npm run lint src/domain/**/*.ts
   ```

2. **Type Checking**
   ```bash
   # Check all files
   npm run typecheck
   
   # Watch mode
   npm run typecheck -- --watch
   ```

3. **Testing**
   ```bash
   # Run specific test suites
   npm test -- --testPathPattern=brain
   
   # Update snapshots
   npm test -- -u
   
   # Run with coverage
   npm run test:coverage
   ```

## Debugging

1. **Development**
   ```bash
   # Start with debugger
   npm run dev -- --inspect
   
   # Debug tests
   npm run test:debug
   ```

2. **Browser Tools**
   - React DevTools
   - Redux DevTools
   - Performance profiler
   - Network inspector

3. **Logging**
   ```typescript
   // Use structured logging
   logger.info('Brain model loaded', {
     modelId,
     regions: regions.length
   });
   ```

## Performance Monitoring

1. **Build Analysis**
   ```bash
   # Analyze bundle size
   npm run analyze
   
   # Check performance
   npm run lighthouse
   ```

2. **Runtime Metrics**
   - FPS monitoring
   - Memory usage
   - Network requests
   - React renders

3. **Error Tracking**
   ```typescript
   // Use error boundaries
   window.onerror = (error) => {
     errorTracker.capture(error);
   };
   ```

## Deployment

1. **Environment Setup**
   ```bash
   # Set environment
   export NODE_ENV=production
   
   # Build for production
   npm run build
   ```

2. **Verification**
   ```bash
   # Preview build
   npm run preview
   
   # Run e2e tests
   npm run test:e2e
   ```

3. **Release**
   ```bash
   # Create release
   npm version patch
   
   # Deploy
   npm run deploy
   ```

## Documentation

1. **Code Comments**
   ```typescript
   /** 
    * Processes neural pathway data
    * @param data - Raw neural data
    * @returns Processed pathway model
    */
   ```

2. **README Updates**
   - Feature documentation
   - API changes
   - Breaking changes
   - Migration guides

3. **Architecture Docs**
   - Design decisions
   - System diagrams
   - Data flow
   - Performance considerations

# Novamind Digital Twin: UI Implementation Rules

## Component Architecture

1. **Atomic Design**
   ```
   atoms/          # Basic UI elements (Button, Input, etc.)
   molecules/      # Simple combinations (SearchBar, Card, etc.)
   organisms/      # Complex components (Header, Sidebar, etc.)
   templates/      # Page layouts (DashboardLayout, etc.)
   pages/          # Full pages (Dashboard, Settings, etc.)
   ```

2. **Component Rules**
   - Single Responsibility Principle
   - Props interface with JSDoc
   - Explicit return type
   - Error boundary wrapper
   - Loading state handling

3. **Performance**
   ```typescript
   // ✅ Memoize expensive components
   export const BrainRegion = memo(({ data }: Props) => {
     // Implementation
   });

   // ✅ Memoize callbacks
   const handleUpdate = useCallback((id: string) => {
     // Implementation
   }, []);

   // ✅ Memoize expensive computations
   const processedData = useMemo(() => {
     return heavyComputation(data);
   }, [data]);
   ```

## Tailwind Implementation

1. **Class Organization**
   ```tsx
   // ✅ Logical grouping
   <div className={clsx(
     // Layout
     'grid grid-cols-12 gap-4',
     // Typography
     'text-base font-medium text-gray-900',
     // Colors & Effects
     'bg-white shadow-lg',
     // Interactivity
     'hover:bg-gray-50 focus:ring-2',
     // Responsive
     'md:grid-cols-6 lg:grid-cols-4'
   )}>
   ```

2. **Custom Classes**
   ```css
   @layer components {
     .neural-card {
       @apply rounded-lg bg-white shadow-xl p-6;
       @apply hover:shadow-2xl transition-shadow;
       @apply dark:bg-gray-800 dark:text-white;
     }
   }
   ```

3. **Theme Extensions**
   ```js
   // tailwind.config.cjs
   module.exports = {
     theme: {
       extend: {
         colors: {
           neural: {
            active: '#FF5E5B',
            inactive: '#373737'
          }
         }
       }
     }
   }
   ```

## State Management

1. **Local State**
   ```typescript
   // ✅ Use for UI state
   const [isOpen, setIsOpen] = useState(false);
   ```

2. **Complex State**
   ```typescript
   // ✅ Use reducers for complex logic
   const [state, dispatch] = useReducer(brainModelReducer, initialState);
   ```

3. **Form State**
   ```typescript
   // ✅ Use React Hook Form
   const { register, handleSubmit } = useForm<PatientData>();
   ```

## Performance Optimization

1. **Virtualization**
   ```typescript
   // ✅ Use for long lists
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={400}
     width={600}
     itemCount={1000}
     itemSize={50}
   >
     {Row}
   </FixedSizeList>
   ```

2. **Code Splitting**
   ```typescript
   // ✅ Lazy load components
   const BrainVisualizer = lazy(() => 
     import('@presentation/organisms/BrainVisualizer')
   );
   ```

3. **Resource Cleanup**
   ```typescript
   // ✅ Always cleanup
   useEffect(() => {
     const subscription = subscribe();
     return () => subscription.unsubscribe();
   }, []);
   ```

## Three.js Integration

1. **Scene Setup**
   ```typescript
   // ✅ Proper scene management
   const BrainScene = () => (
     <Canvas>
       <React.Suspense fallback={<Loader />}>
         <BrainModel />
         <Effects />
         <Controls />
       </React.Suspense>
     </Canvas>
   );
   ```

2. **Performance**
   ```typescript
   // ✅ Use instances for repeated elements
   const Neurons = memo(({ data }) => (
     <InstancedMesh count={data.length}>
       <sphereGeometry args={[0.1, 32, 32]} />
       <neuronMaterial />
     </InstancedMesh>
   ));
   ```

3. **Resource Management**
   ```typescript
   // ✅ Dispose resources
   useEffect(() => {
     return () => {
       geometry.dispose();
       material.dispose();
       texture.dispose();
     };
   }, []);
   ```

## HIPAA Compliance

1. **Data Display**
   ```typescript
   // ✅ Mask sensitive data
   const PatientInfo = ({ data }: Props) => (
     <div>
       <MaskedField value={data.ssn} />
       <RedactedText text={data.notes} />
     </div>
   );
   ```

2. **Form Handling**
   ```typescript
   // ✅ Secure form submission
   const onSubmit = async (data: PatientData) => {
     await secureApiClient.post('/patients', data);
   };
   ```

## Error Handling

1. **Component Errors**
   ```typescript
   // ✅ Use error boundaries
   const VisualizationErrorBoundary = ({
     children
   }: PropsWithChildren) => (
     <ErrorBoundary
       fallback={<ErrorFallback />}
       onError={logError}
     >
       {children}
     </ErrorBoundary>
   );
   ```

2. **Async Errors**
   ```typescript
   // ✅ Handle loading states
   const { data, error, isLoading } = useQuery({
     queryKey: ['brainModel', id],
     queryFn: () => fetchBrainModel(id)
   });
   ```
````

## File: .eslintrc.cjs
````
/* eslint-disable */
⋮----
// CJS files
⋮----
// Puppeteer tests
⋮----
// Scripts
⋮----
// Test files
````

## File: package.json
````json
{
  "name": "novamind-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "Neural visualization platform for psychiatry and mental health",
  "scripts": {
    "dev": "vite --config config/vite.config.ts",
    "build": "tsc && vite build --config config/vite.config.ts",
    "preview": "vite preview --config config/vite.config.ts",
    "test": "vitest run --config config/vitest.config.ts",
    "test:watch": "vitest --watch --config config/vitest.config.ts",
    "test:ui": "vitest --ui --config config/vitest.config.ts",
    "test:coverage": "vitest run --coverage --config config/vitest.config.ts",
    "test:safe": "npx ts-node --esm scripts/run-with-timeout.ts",
    "test:tailwind": "npx ts-node --esm scripts/run-tailwind-tests.ts",
    "test:unified": "vitest run --config config/vitest.config.unified.ts",
    "test:webgl": "npx ts-node --esm scripts/run-all-tests-with-webgl.ts",
    "test:visualization": "npx ts-node --esm scripts/run-3d-visualization-tests.ts --dir=src/presentation --pattern=\"**/*{Visua,Render,Brain,3D,Three}*.test.tsx\"",
    "lint": "eslint src/**/*.ts src/**/*.tsx",
    "format": "prettier --write 'src/**/*.{ts,tsx}'",
    "typecheck": "tsc --noEmit",
    "lint:fix": "eslint src/**/*.ts src/**/*.tsx --fix",
    "prepare": "husky install",
    "deps:check": "npm outdated",
    "deps:update": "npm update",
    "clean": "rm -rf node_modules/.vite dist coverage",
    "test:puppeteer": "npx ts-node --esm test-puppeteer/r3f-basic.test.ts",
    "test:puppeteer:brain-vis": "npx ts-node --esm test-puppeteer/BrainVisualizationPage.test.ts",
    "test:puppeteer:theme": "npx ts-node --esm test-puppeteer/ThemeProvider.system.test.ts",
    "test:puppeteer:container": "npx ts-node --esm test-puppeteer/BrainModelContainer.test.ts",
    "test:puppeteer:controls": "npx ts-node --esm test-puppeteer/NeuralControlPanel.test.ts",
    "test:puppeteer:all": "npm run test:puppeteer:theme && npm run test:puppeteer:container && npm run test:puppeteer:brain-vis && npm run test:puppeteer:controls && npm run test:puppeteer"
  },
  "dependencies": {
    "@alloc/quick-lru": "^5.2.0",
    "@babel/core": "7.26.10",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@react-spring/three": "^9.7.5",
    "@react-three/a11y": "^2.0.0",
    "@react-three/drei": "^9.109.2",
    "@react-three/fiber": "^8.16.8",
    "@react-three/postprocessing": "^2.16.2",
    "@tanstack/react-query": "^5.71.10",
    "axios": "^1.8.4",
    "caniuse-lite": "^1.0.30001712",
    "class-variance-authority": "^0.7.1",
    "classnames": "^2.5.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.6.3",
    "lucide-react": "^0.487.0",
    "nanoid": "5.1.5",
    "next-themes": "^0.4.6",
    "picocolors": "^1.1.1",
    "postcss-import": "^16.1.0",
    "postcss-nesting": "^13.0.1",
    "react-hook-form": "7.55.0",
    "react-router-dom": "^7.5.0",
    "recharts": "^2.15.2",
    "source-map-js": "1.2.1",
    "tailwind-merge": "^3.1.0",
    "tailwindcss": "^3.4.17",
    "three": "^0.175.0",
    "ts-results": "^3.3.0",
    "tslib": "^2.8.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@babel/plugin-transform-react-jsx": "^7.23.4",
    "@babel/plugin-transform-react-jsx-source": "^7.23.3",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.14.0",
    "@types/react": "^18.3.20",
    "@types/react-dom": "^18.3.6",
    "@types/three": "^0.175.0",
    "@typescript-eslint/eslint-plugin": "^8.29.0",
    "@typescript-eslint/parser": "^8.29.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/coverage-v8": "^3.1.1",
    "@vitest/ui": "^3.1.1",
    "autoprefixer": "^10.4.21",
    "cssnano": "^7.0.6",
    "eslint": "^9.24.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "eslint-plugin-sonarjs": "^3.0.2",
    "eslint-plugin-vitest": "^0.5.4",
    "husky": "^9.0.11",
    "jsdom": "^26.0.0",
    "jsdom-global": "^3.0.2",
    "lint-staged": "^15.2.2",
    "make-error": "^1.3.6",
    "msw": "^2.7.3",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "puppeteer": "^24.6.0",
    "react-refresh": "^0.17.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.29.0",
    "vite": "^6.2.5",
    "vite-plugin-node-polyfills": "^0.23.0",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^3.1.1"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md}": "prettier --write"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "overrides": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
````
