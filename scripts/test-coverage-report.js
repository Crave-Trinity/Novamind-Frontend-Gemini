#!/usr/bin/env node

/**
 * Test Coverage Assessment Script
 *
 * This script analyzes test coverage in the Novamind-Frontend project
 * and generates a report to help reach 80% coverage targets.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const projectRoot = path.resolve(path.dirname(__dirname)); // Get project root from script location
const sourceDir = path.join(projectRoot, 'src');
const testDir = path.join(projectRoot, 'src/test');
const ignoreDirs = ['node_modules', 'build', 'dist', 'coverage'];
const coverageThreshold = 80; // Target percentage

// Color formatting for terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Returns all source files with .ts, .tsx, .js extensions recursively
 * @param {string} dir - Directory to search
 * @param {string[]} fileList - Accumulator for files
 * @returns {string[]} List of source files
 */
function getSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !ignoreDirs.includes(file)) {
      fileList = getSourceFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) &&
      !file.endsWith('.d.ts') &&
      !file.endsWith('.test.ts') && 
      !file.endsWith('.test.tsx') && 
      !file.endsWith('.spec.ts') && 
      !file.endsWith('.spec.tsx')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Returns all test files with .test.ts, .test.tsx, .spec.ts extensions
 * @param {string} dir - Directory to search
 * @param {string[]} fileList - Accumulator for files
 * @returns {string[]} List of test files
 */
function getTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !ignoreDirs.includes(file)) {
      fileList = getTestFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.test.ts') || 
       file.endsWith('.test.tsx') || 
       file.endsWith('.spec.ts') || 
       file.endsWith('.spec.tsx') ||
       file.endsWith('.test.js') ||
       file.endsWith('.spec.js'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Maps source files to their corresponding test files
 * @param {string[]} sourceFiles - List of source files
 * @param {string[]} testFiles - List of test files
 * @returns {Map<string, string[]>} Map of source files to their test files
 */
function mapSourceToTests(sourceFiles, testFiles) {
  const mapping = new Map();
  
  sourceFiles.forEach(sourceFile => {
    const sourceBaseName = path.basename(sourceFile, path.extname(sourceFile));
    const sourceDir = path.dirname(sourceFile);
    const relativePath = path.relative(process.cwd(), sourceDir);
    
    const matchingTests = testFiles.filter(testFile => {
      const testBaseName = path.basename(testFile);
      return (
        testBaseName.includes(sourceBaseName) || 
        testFile.includes(relativePath)
      );
    });
    
    mapping.set(sourceFile, matchingTests);
  });
  
  return mapping;
}

/**
 * Calculate the test coverage percentage
 * @param {Map<string, string[]>} sourceToTestsMap - Map of source files to test files
 * @returns {number} Coverage percentage
 */
function calculateCoverage(sourceToTestsMap) {
  let filesWithTests = 0;
  
  sourceToTestsMap.forEach((tests) => {
    if (tests.length > 0) {
      filesWithTests++;
    }
  });
  
  return (filesWithTests / sourceToTestsMap.size) * 100;
}

/**
 * Generate a coverage report
 * @param {Map<string, string[]>} sourceToTestsMap - Map of source files to test files
 * @param {number} coverage - Overall coverage percentage
 */
function generateReport(sourceToTestsMap, coverage) {
  console.log(`\n${colors.cyan}=== Novamind Frontend Test Coverage Report ===${colors.reset}\n`);
  console.log(`${colors.blue}Total source files:${colors.reset} ${sourceToTestsMap.size}`);
  
  const filesWithTests = Array.from(sourceToTestsMap.entries())
    .filter(([_, tests]) => tests.length > 0);
  
  console.log(`${colors.blue}Files with tests:${colors.reset} ${filesWithTests.length}`);
  console.log(`${colors.blue}Files without tests:${colors.reset} ${sourceToTestsMap.size - filesWithTests.length}`);
  
  const coverageColor = coverage >= coverageThreshold ? colors.green : colors.red;
  console.log(`${colors.blue}Current coverage:${colors.reset} ${coverageColor}${coverage.toFixed(2)}%${colors.reset}`);
  console.log(`${colors.blue}Target coverage:${colors.reset} ${colors.green}${coverageThreshold}%${colors.reset}`);
  
  if (coverage < coverageThreshold) {
    const gap = coverageThreshold - coverage;
    const filesToAdd = Math.ceil((gap * sourceToTestsMap.size) / 100);
    
    console.log(`\n${colors.yellow}You need tests for approximately ${filesToAdd} more files to reach ${coverageThreshold}% coverage.${colors.reset}`);
    
    // Prioritize which files to test first (more complex files, core components, etc.)
    const untested = Array.from(sourceToTestsMap.entries())
      .filter(([_, tests]) => tests.length === 0)
      .map(([sourceFile, _]) => sourceFile);
    
    const prioritized = prioritizeFiles(untested);
    
    console.log(`\n${colors.cyan}Recommended files to test (in priority order):${colors.reset}`);
    prioritized.slice(0, Math.min(filesToAdd, 20)).forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`${index + 1}. ${colors.yellow}${relativePath}${colors.reset}`);
    });
  }
  
  // Directory coverage
  console.log(`\n${colors.cyan}Coverage by directory:${colors.reset}`);
  const directoryCoverage = calculateDirectoryCoverage(sourceToTestsMap);
  
  Object.entries(directoryCoverage)
    .sort(([, a], [, b]) => a.coverage - b.coverage)
    .forEach(([directory, stats]) => {
      const dirCoverageColor = stats.coverage >= coverageThreshold ? colors.green : colors.red;
      console.log(`${colors.blue}${directory}:${colors.reset} ${dirCoverageColor}${stats.coverage.toFixed(2)}%${colors.reset} (${stats.tested}/${stats.total} files)`);
    });
}

/**
 * Calculate coverage by directory
 * @param {Map<string, string[]>} sourceToTestsMap - Map of source files to test files
 * @returns {Object} Directory coverage statistics
 */
function calculateDirectoryCoverage(sourceToTestsMap) {
  const directoryCoverage = {};
  
  sourceToTestsMap.forEach((tests, sourceFile) => {
    const relativePath = path.relative(projectRoot, sourceFile);
    // Get second-level directory (e.g. src/components)
    const parts = relativePath.split(path.sep);
    const directory = parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
    
    if (!directoryCoverage[directory]) {
      directoryCoverage[directory] = { total: 0, tested: 0, coverage: 0 };
    }
    
    directoryCoverage[directory].total++;
    if (tests.length > 0) {
      directoryCoverage[directory].tested++;
    }
  });
  
  // Calculate coverage percentage for each directory
  Object.values(directoryCoverage).forEach(stats => {
    stats.coverage = (stats.tested / stats.total) * 100;
  });
  
  return directoryCoverage;
}

/**
 * Prioritize files to test based on various heuristics
 * @param {string[]} files - List of files without tests
 * @returns {string[]} Prioritized list of files
 */
function prioritizeFiles(files) {
  // Higher score = higher priority
  const scores = new Map();
  
  files.forEach(file => {
    let score = 0;
    const content = fs.readFileSync(file, 'utf8');
    const linesOfCode = content.split('\n').length;
    
    // 1. Prioritize by file type (components and services are higher priority)
    if (file.includes('/components/')) score += 5;
    if (file.includes('/services/')) score += 4;
    if (file.includes('/controllers/')) score += 4;
    if (file.includes('/hooks/')) score += 3;
    if (file.includes('/utils/')) score += 2;
    if (file.includes('/types/')) score -= 2; // Types are lower priority
    
    // 2. Prioritize by code complexity (simple heuristic: lines of code)
    score += Math.min(10, Math.floor(linesOfCode / 50)); // Max +10 for very large files
    
    // 3. Prioritize by potential impact (export counts as a rough proxy)
    const exportCount = (content.match(/export\s/g) || []).length;
    score += Math.min(5, exportCount);
    
    // 4. Prioritize files used by many other files
    const importCount = getImportFrequency(file);
    score += Math.min(10, importCount * 2);
    
    scores.set(file, score);
  });
  
  // Sort by score (descending)
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([file]) => file);
}

/**
 * Get an approximate count of how many files import this file
 * @param {string} filePath - Path to the file
 * @returns {number} Import frequency
 */
function getImportFrequency(filePath) {
  try {
    const relativePath = path.relative(projectRoot, filePath);
    const baseNameNoExt = path.basename(filePath, path.extname(filePath));
    const searchPattern = `import.*['"].*${baseNameNoExt}['"]`;
    const result = execSync(`grep -r "${searchPattern}" --include="*.ts" --include="*.tsx" . | wc -l`, { cwd: projectRoot }).toString().trim();
    return parseInt(result, 10) || 0;
  } catch (error) {
    console.error(`Error checking import frequency: ${error.message}`);
    return 0;
  }
}
// Main execution
(async () => {
  try {
    const sourceFiles = getSourceFiles(sourceDir);
    const testFiles = getTestFiles(sourceDir);
    const puppeteerTests = getTestFiles(path.join(projectRoot, 'test-puppeteer'));
    
    console.log(`${colors.blue}Found ${sourceFiles.length} source files${colors.reset}`);
    console.log(`${colors.blue}Found ${testFiles.length} unit test files${colors.reset}`);
    console.log(`${colors.blue}Found ${puppeteerTests.length} puppeteer test files${colors.reset}`);
    
    const sourceToTestsMap = mapSourceToTests(sourceFiles, [...testFiles, ...puppeteerTests]);
    const coverage = calculateCoverage(sourceToTestsMap);
    
    generateReport(sourceToTestsMap, coverage);
    
    // Output test coverage gaps to a file for further reference
    const gapsReport = Array.from(sourceToTestsMap.entries())
      .filter(([_, tests]) => tests.length === 0)
      .map(([sourceFile, _]) => path.relative(projectRoot, sourceFile))
      .sort();
    
    fs.writeFileSync(path.join(projectRoot, 'test-coverage-gaps.txt'), gapsReport.join('\n'));
    console.log(`\n${colors.cyan}Full list of files without tests written to:${colors.reset} test-coverage-gaps.txt`);
    
  } catch (error) {
    console.error(`${colors.red}Error analyzing test coverage:${colors.reset}`, error);
    process.exit(1);
  }
})();