/**
 * NOVAMIND Neural Architecture
 * Component Export Reconciliation System - Quantum-Level Precision
 * 
 * This script implements neural-safe export pattern corrections for React components
 * to ensure consistent export/import patterns with clinical precision
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Components that are commonly imported incorrectly
const COMPONENT_EXPORT_PATTERNS = [
  {
    // Default export correction pattern
    find: /export\s+const\s+(\w+)\s*=/g,
    check: /export\s+default\s+/,
    replace: (match, componentName) => {
      return `export const ${componentName} =`;
    }
  },
  {
    // Missing default export pattern
    find: /^const\s+(\w+)\s*=.*?\n\nexport\s+default\s+\1;?\s*$/gms,
    check: null,
    replace: (match, componentName) => {
      return `const ${componentName} = (...args) => {\n  // Component implementation\n};\n\nexport default ${componentName};`;
    }
  }
];

// Fix App.tsx default export
function fixAppComponent(): any {
  const appPath = path.join(SRC_DIR, 'App.tsx');
  if (fs.existsSync(appPath)) {
    console.log('🧠 Optimizing App.tsx export pattern...');
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Check if App is exported as default
    if (!content.includes('export default App')) {
      // Add default export if App is defined but not exported as default
      if (content.includes('export function App(': any): any || content.includes('export const App =')){
        content = content.replace(
          /export (function|const) App/,
          '$1 App'
        );
        content += '\n\nexport default App;\n';
        fs.writeFileSync(appPath, content, 'utf8');
        console.log('   ├─ Added default export to App.tsx with quantum precision');
      }
    }
  }
}

// Fix ThemeProvider export
function fixThemeProvider(): any {
  const themeProviderPath = path.join(SRC_DIR, 'contexts', 'ThemeProvider.tsx');
  if (fs.existsSync(themeProviderPath)) {
    console.log('🧠 Optimizing ThemeProvider export pattern...');
    let content = fs.readFileSync(themeProviderPath, 'utf8');
    
    // Check if ThemeProvider is exported as default
    if (!content.includes('export default ThemeProvider')) {
      // Add default export if ThemeProvider is defined but not exported as default
      if (content.includes('export function ThemeProvider(': any): any || content.includes('export const ThemeProvider =')){
        content = content.replace(
          /export (function|const) ThemeProvider/,
          '$1 ThemeProvider'
        );
        content += '\n\nexport default ThemeProvider;\n';
        fs.writeFileSync(themeProviderPath, content, 'utf8');
        console.log('   ├─ Added default export to ThemeProvider with neural precision');
      }
    }
  }
}

// Process component exports
function processComponentExports(): any {
  console.log('🔬 Analyzing component export patterns with neural precision...');
  
  // Fix App component first
  fixAppComponent();
  
  // Fix ThemeProvider component
  fixThemeProvider();
  
  // Fix react query provider imports in tests
  fixReactQueryProviderInTests();
}

// Fix React Query provider in tests
function fixReactQueryProviderInTests(): any {
  console.log('🧠 Optimizing React Query provider usage in tests...');
  
  const testDir = path.join(SRC_DIR, 'test');
  if (fs.existsSync(testDir)) {
    const testUtilsPath = path.join(testDir, 'testUtils.tsx');
    if (fs.existsSync(testUtilsPath)) {
      let content = fs.readFileSync(testUtilsPath, 'utf8');
      
      // Update imports if they're using react-query instead of @tanstack/react-query
      if (content.includes('import { QueryClient, QueryClientProvider } from "react-query"')) {
        content = content.replace(
          'import { QueryClient, QueryClientProvider } from "react-query"',
          'import { QueryClient, QueryClientProvider } from "@tanstack/react-query"'
        );
        fs.writeFileSync(testUtilsPath, content, 'utf8');
        console.log('   ├─ Updated React Query imports with clinical precision');
      }
      
      // Create neural-safe provider wrapper if it doesn't exist
      if (!content.includes('renderWithProviders')) {
        const providerWrapper = `
/**
 * Neural-safe test wrapper with clinical precision
 * Provides all required context providers for component testing
 */
export function renderWithProviders(ui: any, options = {}: any): any {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  function Wrapper({ children }: any): any {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
`;
        content += providerWrapper;
        fs.writeFileSync(testUtilsPath, content, 'utf8');
        console.log('   ├─ Added neural-safe provider wrapper with quantum precision');
      }
    }
  }
}

// Execute script
try {
  processComponentExports();
  console.log('✅ Component export patterns optimized with quantum precision');
  console.log('🧠 Neural-safe implementation complete');
} catch (error) {
  console.error('❌ Error during component export optimization:', error.message);
}
