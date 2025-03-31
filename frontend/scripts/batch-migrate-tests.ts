/**
 * NOVAMIND TypeScript Test Migration Tool
 * 
 * This script migrates tests to TypeScript-only format in strategic batches
 * based on domain importance and test complexity.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Define TypeScript interfaces for our migration process
interface TestBatch {
  name: string;
  priority: number;
  directories: string[];
  description: string;
}

interface MigrationOptions {
  dryRun: boolean;
  verbose: boolean;
  targetExtension: string;
}

// Get proper ESM-compatible directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Define the test batches in order of migration priority
const TEST_BATCHES: TestBatch[] = [
  {
    name: 'Domain Models',
    priority: 1,
    directories: [
      path.join(projectRoot, 'src/domain/models')
    ],
    description: 'Core domain model tests that validate fundamental data structures'
  },
  {
    name: 'Domain Types',
    priority: 2,
    directories: [
      path.join(projectRoot, 'src/domain/types')
    ],
    description: 'Type definition tests that ensure type safety across the application'
  },
  {
    name: 'Application Services',
    priority: 3,
    directories: [
      path.join(projectRoot, 'src/application/services')
    ],
    description: 'Service tests that validate core business logic and operations'
  },
  {
    name: 'Application Hooks',
    priority: 4,
    directories: [
      path.join(projectRoot, 'src/application/hooks')
    ],
    description: 'React hook tests that validate state management and side effects'
  },
  {
    name: 'UI Components - Atoms',
    priority: 5,
    directories: [
      path.join(projectRoot, 'src/components/atoms')
    ],
    description: 'Basic UI component tests for atomic elements'
  },
  {
    name: 'UI Components - Molecules',
    priority: 6,
    directories: [
      path.join(projectRoot, 'src/components/molecules')
    ],
    description: 'Composite UI component tests for molecular structures'
  },
  {
    name: 'UI Components - Organisms',
    priority: 7,
    directories: [
      path.join(projectRoot, 'src/components/organisms')
    ],
    description: 'Complex UI component tests for organism-level structures'
  },
  {
    name: 'Presentation Containers',
    priority: 8,
    directories: [
      path.join(projectRoot, 'src/presentation/containers')
    ],
    description: 'Container component tests that integrate multiple components'
  }
];

// Find all test files in a directory
function findTestFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    console.warn(`Directory does not exist: ${directory}`);
    return [];
  }

  try {
    return fs.readdirSync(directory)
      .filter(file => file.match(/\.test\.(ts|tsx|js|jsx)$/))
      .map(file => path.join(directory, file));
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

// Convert a test file to TypeScript format
function migrateTestFile(
  sourceFile: string, 
  options: MigrationOptions = { dryRun: false, verbose: true, targetExtension: '.test.ts' }
): void {
  try {
    const fileContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Determine if this is a React component test
    const isReactTest = fileContent.includes('render(') || 
                        fileContent.includes('screen.') || 
                        fileContent.includes('fireEvent.') ||
                        fileContent.includes('import React');
    
    // Set the correct extension based on content
    const extension = isReactTest ? '.test.tsx' : options.targetExtension;
    
    // Create the target file path with TypeScript extension
    const targetFile = sourceFile.replace(/\.test\.(js|jsx|ts|tsx)$/, extension);
    
    if (options.verbose) {
      console.log(`Migrating: ${path.basename(sourceFile)} → ${path.basename(targetFile)}`);
    }
    
    if (!options.dryRun) {
      // If the source file is already a TypeScript file, just ensure it has the right extension
      if (sourceFile.endsWith('.ts') || sourceFile.endsWith('.tsx')) {
        if (sourceFile !== targetFile) {
          fs.renameSync(sourceFile, targetFile);
        }
      } else {
        // Write the content to the new TypeScript file
        fs.writeFileSync(targetFile, fileContent);
        
        // Remove the original JavaScript file
        if (sourceFile !== targetFile) {
          fs.unlinkSync(sourceFile);
        }
      }
    }
  } catch (error) {
    console.error(`Error migrating file ${sourceFile}:`, error);
  }
}

// Process a batch of tests
function processBatch(batch: TestBatch, options: MigrationOptions): void {
  console.log(`\n=== Processing Batch: ${batch.name} (Priority ${batch.priority}) ===`);
  console.log(batch.description);
  
  let totalFiles = 0;
  
  for (const directory of batch.directories) {
    const testFiles = findTestFiles(directory);
    totalFiles += testFiles.length;
    
    console.log(`\nFound ${testFiles.length} test files in ${path.basename(directory)}`);
    
    for (const testFile of testFiles) {
      migrateTestFile(testFile, options);
    }
  }
  
  console.log(`\nCompleted batch: ${batch.name} - Processed ${totalFiles} files`);
}

// Main function to run the migration
async function main(): Promise<void> {
  console.log('🧠 NOVAMIND TypeScript Test Migration Tool');
  console.log('------------------------------------------');
  
  const options: MigrationOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: !process.argv.includes('--quiet'),
    targetExtension: '.test.ts'
  };
  
  if (options.dryRun) {
    console.log('Running in DRY RUN mode - no files will be modified');
  }
  
  // Sort batches by priority
  const sortedBatches = [...TEST_BATCHES].sort((a, b) => a.priority - b.priority);
  
  // Process each batch
  for (const batch of sortedBatches) {
    processBatch(batch, options);
  }
  
  console.log('\n✅ Migration completed successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Error in migration process:', error);
  process.exit(1);
});
