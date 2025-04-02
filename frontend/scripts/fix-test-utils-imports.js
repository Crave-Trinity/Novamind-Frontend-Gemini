/**
 * Fix Test Utils Imports Script
 * 
 * This script fixes import issues in test files by:
 * 1. Converting alias imports to relative imports
 * 2. Adding necessary mocks for Three.js and React Three Fiber components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import glob from 'glob';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find all test files
const testFiles = glob.sync('src/**/*.test.{ts,tsx}', { cwd: process.cwd() });

console.log(`Found ${testFiles.length} test files to process`);

let fixedFiles = 0;

testFiles.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Check if file imports from @components or @presentation
    if (content.includes('@components/') || content.includes('@presentation/')) {
      console.log(`Processing ${filePath}...`);

      // Check if file imports BrainVisualization or other Three.js components
      const needsThreeMocks = 
        content.includes('BrainVisualization') || 
        content.includes('@react-three/') || 
        content.includes('three');

      // Add Three.js mocks if needed
      if (needsThreeMocks && !content.includes('vi.mock("@react-three/drei"')) {
        const mockCode = `
// Mock the Three.js and React Three Fiber dependencies
vi.mock("@react-three/drei", () => ({
  OrbitControls: vi.fn(() => null),
  Environment: vi.fn(() => null),
  Loader: vi.fn(() => null),
  Stars: vi.fn(() => null)
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: vi.fn(({ children }) => <div data-testid="canvas-mock">{children}</div>),
  useFrame: vi.fn((callback) => callback({ clock: { getElapsedTime: () => 0 } }))
}));

vi.mock("@react-three/postprocessing", () => ({
  EffectComposer: vi.fn(({ children }) => <div>{children}</div>),
  Bloom: vi.fn(() => null)
}));
`;
        
        // Find the position to insert the mocks (after imports but before tests)
        const importEndIndex = content.lastIndexOf('import');
        if (importEndIndex !== -1) {
          const lineEndIndex = content.indexOf('\n', importEndIndex);
          if (lineEndIndex !== -1) {
            content = content.slice(0, lineEndIndex + 1) + mockCode + content.slice(lineEndIndex + 1);
            modified = true;
          }
        }
      }

      // Convert alias imports to relative imports
      const componentRegex = /@components\/([^'";]+)/g;
      const presentationRegex = /@presentation\/([^'";]+)/g;
      
      // Function to calculate relative path
      const calculateRelativePath = (match, importPath, fileDir) => {
        const basePath = match === '@components' ? 'src/components' : 'src/presentation';
        const targetPath = path.join(basePath, importPath);
        const relativePath = path.relative(fileDir, targetPath);
        return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
      };

      const fileDir = path.dirname(fullPath);
      
      // Replace @components imports
      content = content.replace(componentRegex, (match, importPath) => {
        modified = true;
        return calculateRelativePath('@components', importPath, fileDir);
      });
      
      // Replace @presentation imports
      content = content.replace(presentationRegex, (match, importPath) => {
        modified = true;
        return calculateRelativePath('@presentation', importPath, fileDir);
      });

      // Save changes if modified
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        fixedFiles++;
        console.log(`Fixed imports in ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log(`\nSummary:`);
console.log(`Total test files: ${testFiles.length}`);
console.log(`Files fixed: ${fixedFiles}`);