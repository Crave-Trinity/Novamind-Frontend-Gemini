#!/usr/bin/env tsx
/**
 * Novamind Digital Twin Frontend: Final Refactoring Execution Script
 * 
 * This script completes the frontend refactoring by:
 * 1. Moving remaining files from legacy directories to clean architecture locations
 * 2. Detecting and resolving duplicate files
 * 3. Updating import paths to use proper path aliases
 * 4. Removing empty legacy directories
 * 
 * Run with: npx tsx frontend/scripts/finalize-refactoring.ts
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SRC_DIR = path.resolve(process.cwd(), 'frontend/src');

// Migration mappings: legacy directory → target directory
const MIGRATION_PATHS = {
  'app': null, // Will be completely removed after analysis of dependencies
  'components/atoms': 'presentation/atoms',
  'components/molecules': 'presentation/molecules',
  'components/organisms': 'presentation/organisms',
  'components/utils': 'presentation/common/utils',
  'hooks': 'application/hooks',
  'interfaces': 'domain/types',
  'pages': 'presentation/pages',
  'services': 'infrastructure/services',
  'shaders': 'presentation/shaders',
  'types': 'domain/types',
  'utils/shaders': 'presentation/shaders',
  'utils': null, // Will be analyzed and distributed to appropriate layers
  'presentation/components': null, // Will be distributed to atomic design folders
};

// Detect and log duplicate files
const findDuplicates = () => {
  console.log('🔍 Scanning for duplicate files...');
  
  // Known duplicates based on our file structure analysis
  const potentialDuplicates = [
    { legacy: 'types/theme.ts', target: 'domain/types/theme.ts' },
    { legacy: 'types/three-extensions.d.ts', target: 'domain/types/three-extensions.d.ts' },
    { legacy: 'services/AuditLogService.ts', target: 'infrastructure/services/AuditLogService.ts' },
    { legacy: 'shaders/neuralGlow.ts', target: 'presentation/shaders/neuralGlow.ts' },
    { legacy: 'components/atoms/LoadingIndicator.tsx', target: 'presentation/atoms/LoadingIndicator.tsx' },
  ];
  
  const confirmedDuplicates: { legacy: string, target: string }[] = [];
  
  potentialDuplicates.forEach(pair => {
    const legacyPath = path.join(SRC_DIR, pair.legacy);
    const targetPath = path.join(SRC_DIR, pair.target);
    
    if (fs.existsSync(legacyPath) && fs.existsSync(targetPath)) {
      confirmedDuplicates.push(pair);
      console.log(`⚠️  Duplicate found: ${pair.legacy} and ${pair.target}`);
    }
  });
  
  return confirmedDuplicates;
};

// Migrate files from legacy directories to clean architecture
const migrateFiles = () => {
  console.log('🚚 Migrating files to clean architecture locations...');
  
  Object.entries(MIGRATION_PATHS).forEach(([legacyDir, targetDir]) => {
    const legacyPath = path.join(SRC_DIR, legacyDir);
    
    if (!fs.existsSync(legacyPath)) {
      console.log(`  ⏩ Skipping ${legacyDir} - already migrated`);
      return;
    }
    
    if (targetDir === null) {
      console.log(`  ⚠️  ${legacyDir} requires manual analysis - skipping for now`);
      return;
    }
    
    const targetPath = path.join(SRC_DIR, targetDir);
    
    // Ensure target directory exists
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      console.log(`  📁 Created target directory: ${targetDir}`);
    }
    
    // Get all files in legacy directory
    const files = fs.readdirSync(legacyPath)
      .filter(file => !fs.statSync(path.join(legacyPath, file)).isDirectory());
    
    console.log(`  🔍 Found ${files.length} files in ${legacyDir}`);
    
    // Move each file
    files.forEach(file => {
      const sourceFile = path.join(legacyPath, file);
      const targetFile = path.join(targetPath, file);
      
      // Check if target already exists (duplicate)
      if (fs.existsSync(targetFile)) {
        console.log(`  ⚠️  Target file already exists: ${targetDir}/${file} - needs manual review`);
        return;
      }
      
      // Copy file to new location
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`  ✅ Migrated: ${legacyDir}/${file} → ${targetDir}/${file}`);
      
      // Don't delete original yet - will be done in cleanup phase
    });
  });
};

// Update import paths to use path aliases
const updateImportPaths = () => {
  console.log('🔄 Updating import paths to use path aliases...');
  
  // Example replace patterns - expand based on your specific needs
  const importPatterns = [
    // Matches relative paths that should be domain
    { regex: /from ['"]\.\.\/\.\.\/types\/([^'"]+)['"]/g, replacement: 'from "@domain/types/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/interfaces\/([^'"]+)['"]/g, replacement: 'from "@domain/types/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/domain\/([^'"]+)['"]/g, replacement: 'from "@domain/$1"' },
    
    // Matches relative paths that should be application
    { regex: /from ['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, replacement: 'from "@application/hooks/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/application\/([^'"]+)['"]/g, replacement: 'from "@application/$1"' },
    
    // Matches relative paths that should be infrastructure
    { regex: /from ['"]\.\.\/\.\.\/services\/([^'"]+)['"]/g, replacement: 'from "@infrastructure/services/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/infrastructure\/([^'"]+)['"]/g, replacement: 'from "@infrastructure/$1"' },
    
    // Matches relative paths that should be presentation (components)
    { regex: /from ['"]\.\.\/\.\.\/components\/atoms\/([^'"]+)['"]/g, replacement: 'from "@presentation/atoms/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/components\/molecules\/([^'"]+)['"]/g, replacement: 'from "@presentation/molecules/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/components\/organisms\/([^'"]+)['"]/g, replacement: 'from "@presentation/organisms/$1"' },
    { regex: /from ['"]\.\.\/\.\.\/presentation\/([^'"]+)['"]/g, replacement: 'from "@presentation/$1"' },
  ];
  
  // Get all TypeScript files
  const getAllTsFiles = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results = results.concat(getAllTsFiles(filePath));
      } else if (
        file.endsWith('.ts') || 
        file.endsWith('.tsx') || 
        file.endsWith('.d.ts')
      ) {
        results.push(filePath);
      }
    });
    
    return results;
  };
  
  const tsFiles = getAllTsFiles(SRC_DIR);
  console.log(`  🔍 Found ${tsFiles.length} TypeScript files`);
  
  let updatedCount = 0;
  
  // Update each file
  tsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    importPatterns.forEach(pattern => {
      content = content.replace(pattern.regex, pattern.replacement);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
      console.log(`  ✅ Updated imports in: ${path.relative(SRC_DIR, filePath)}`);
    }
  });
  
  console.log(`  📊 Updated imports in ${updatedCount} files`);
};

// Remove empty legacy directories
const cleanupLegacyDirectories = () => {
  console.log('🧹 Cleaning up legacy directories...');
  
  const legacyDirs = Object.keys(MIGRATION_PATHS)
    .filter(dir => MIGRATION_PATHS[dir] !== null);
  
  legacyDirs.forEach(legacyDir => {
    const legacyPath = path.join(SRC_DIR, legacyDir);
    
    if (!fs.existsSync(legacyPath)) {
      console.log(`  ⏩ Skipping ${legacyDir} - already removed`);
      return;
    }
    
    // Check if empty (no files)
    const files = fs.readdirSync(legacyPath)
      .filter(file => !fs.statSync(path.join(legacyPath, file)).isDirectory());
    
    if (files.length === 0) {
      try {
        fs.rmdirSync(legacyPath);
        console.log(`  🗑️  Removed empty directory: ${legacyDir}`);
      } catch (error) {
        console.log(`  ⚠️  Could not remove directory ${legacyDir}: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️  Directory not empty: ${legacyDir} (${files.length} files)`);
    }
  });
};

// Resolve duplicate files
const resolveDuplicates = (duplicates: { legacy: string, target: string }[]) => {
  console.log('🔄 Resolving duplicate files...');
  
  duplicates.forEach(pair => {
    const legacyPath = path.join(SRC_DIR, pair.legacy);
    const targetPath = path.join(SRC_DIR, pair.target);
    
    if (!fs.existsSync(legacyPath) || !fs.existsSync(targetPath)) {
      console.log(`  ⏩ Skipping ${pair.legacy} - files don't exist`);
      return;
    }
    
    // Compare files to determine which is newer or has more content
    const legacyStat = fs.statSync(legacyPath);
    const targetStat = fs.statSync(targetPath);
    
    const legacyContent = fs.readFileSync(legacyPath, 'utf8');
    const targetContent = fs.readFileSync(targetPath, 'utf8');
    
    // If target is newer, keep target and remove legacy
    if (targetStat.mtimeMs > legacyStat.mtimeMs || targetContent.length >= legacyContent.length) {
      console.log(`  🔄 Keeping target: ${pair.target} (newer/better)`);
      
      // Delete legacy file
      fs.unlinkSync(legacyPath);
      console.log(`  🗑️  Removed legacy duplicate: ${pair.legacy}`);
    } else {
      // If legacy is newer, copy to target and remove legacy
      fs.copyFileSync(legacyPath, targetPath);
      console.log(`  🔄 Updated target with legacy content: ${pair.target}`);
      
      // Delete legacy file
      fs.unlinkSync(legacyPath);
      console.log(`  🗑️  Removed legacy duplicate after merge: ${pair.legacy}`);
    }
  });
};

// Generate refactoring report
const generateReport = () => {
  console.log('📊 Generating refactoring report...');
  
  // Count files in each directory
  const countFiles = (dir: string): number => {
    if (!fs.existsSync(dir)) return 0;
    
    return fs.readdirSync(dir)
      .filter(file => {
        const filePath = path.join(dir, file);
        return fs.statSync(filePath).isFile();
      }).length;
  };
  
  const countDirFiles = (baseDir: string, dirs: string[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    dirs.forEach(dir => {
      const dirPath = path.join(baseDir, dir);
      counts[dir] = countFiles(dirPath);
    });
    
    return counts;
  };
  
  // List all directories
  const cleanDirs = [
    'domain/types',
    'domain/models',
    'domain/utils',
    'application/hooks',
    'application/contexts',
    'application/providers',
    'application/services',
    'infrastructure/services',
    'infrastructure/api',
    'presentation/atoms',
    'presentation/molecules',
    'presentation/organisms',
    'presentation/templates',
    'presentation/pages',
    'presentation/shaders',
    'presentation/common',
  ];
  
  const legacyDirs = [
    'app',
    'components',
    'components/atoms',
    'components/molecules',
    'components/organisms',
    'hooks',
    'interfaces',
    'pages',
    'services',
    'shaders',
    'types',
    'utils',
  ];
  
  const cleanCounts = countDirFiles(SRC_DIR, cleanDirs);
  const legacyCounts = countDirFiles(SRC_DIR, legacyDirs);
  
  // Calculate totals
  const totalClean = Object.values(cleanCounts).reduce((a, b) => a + b, 0);
  const totalLegacy = Object.values(legacyCounts).reduce((a, b) => a + b, 0);
  const totalFiles = totalClean + totalLegacy;
  
  // Generate markdown report
  const reportContent = `# Novamind Digital Twin Frontend: Refactoring Report
Generated: ${new Date().toISOString()}

## Migration Progress

**Overall Progress**: ${Math.round((totalClean / totalFiles) * 100)}% complete

- Clean Architecture Files: ${totalClean}
- Remaining Legacy Files: ${totalLegacy}
- Total Files: ${totalFiles}

## Clean Architecture Files

${Object.entries(cleanCounts)
  .map(([dir, count]) => `- ${dir}: ${count} files`)
  .join('\n')}

## Remaining Legacy Files

${Object.entries(legacyCounts)
  .filter(([_, count]) => count > 0)
  .map(([dir, count]) => `- ${dir}: ${count} files`)
  .join('\n')}

## Next Steps

1. Run the migration script to move remaining files
2. Update import paths in all files
3. Resolve any duplicates
4. Remove empty legacy directories
5. Update the refactoring plan to reflect completion
`;

  const reportPath = path.join(process.cwd(), 'frontend/docs/refactoring-status.md');
  fs.writeFileSync(reportPath, reportContent);
  console.log(`  📝 Refactoring report generated: docs/refactoring-status.md`);
};

// Ensure script is run in the proper directory
const validateEnvironment = () => {
  if (!fs.existsSync(path.join(process.cwd(), 'frontend/src'))) {
