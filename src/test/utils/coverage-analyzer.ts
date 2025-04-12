/**
 * Test Coverage Analyzer
 * 
 * This utility analyzes and reports on test coverage across the codebase,
 * helping identify areas that need additional testing to meet production
 * requirements (80% coverage target).
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface CoverageData {
  statements: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  lines: { total: number; covered: number; percentage: number };
}

interface ModuleCoverage {
  path: string;
  relativePath: string;
  coverage: CoverageData;
  priority: 'high' | 'medium' | 'low';
  components: { 
    name: string;
    percentage: number;
  }[];
}

interface CoverageSummary {
  overall: CoverageData;
  modules: ModuleCoverage[];
  untested: string[];
  recommendations: string[];
}

/**
 * Thresholds for determining testing priority
 */
const COVERAGE_THRESHOLDS = {
  critical: 90, // Critical code needs at least 90% coverage
  high: 80,     // High-priority code needs at least 80% coverage
  medium: 60,   // Medium-priority code needs at least 60% coverage
  minimum: 40   // Minimum acceptable coverage
};

/**
 * Critical code paths that require high test coverage
 */
const CRITICAL_PATHS = [
  'src/infrastructure/auth',
  'src/infrastructure/api',
  'src/domain/models',
  'src/application/controllers',
  'src/infrastructure/clients'
];

/**
 * Generate a coverage report from test results
 */
export async function analyzeCoverage(coverageJsonPath: string): Promise<CoverageSummary> {
  // Load coverage data from file
  let coverageData: any;
  try {
    const coverageJson = fs.readFileSync(coverageJsonPath, 'utf8');
    coverageData = JSON.parse(coverageJson);
  } catch (error) {
    throw new Error(`Failed to load coverage data: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Extract project root path
  const projectRoot = process.cwd();
  
  // Find all source files
  const sourceFiles = glob.sync('src/**/*.{ts,tsx}', { 
    cwd: projectRoot,
    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'src/**/tests/**', 'src/test/**']
  });
  
  // Find all test files to correlate with source files
  const testFiles = glob.sync('src/**/*.{test,spec}.{ts,tsx}', { cwd: projectRoot });
  
  // Map source files to their corresponding test files
  const sourceToTestMap = new Map<string, string[]>();
  sourceFiles.forEach((sourceFile: string) => {
    const baseName = path.basename(sourceFile, path.extname(sourceFile));
    const dirName = path.dirname(sourceFile);
    const matchingTests = testFiles.filter((testFile: string) => {
      const testBaseName = path.basename(testFile, path.extname(testFile))
        .replace('.test', '')
        .replace('.spec', '');
      const testDirName = path.dirname(testFile);
      return (
        // Same name in same directory
        (testBaseName === baseName && testDirName === dirName) ||
        // Same name in /tests subdirectory
        (testBaseName === baseName && testDirName === `${dirName}/tests`) ||
        // Same name in parent /tests directory
        (testBaseName === baseName && path.dirname(testDirName) === dirName && path.basename(testDirName) === 'tests')
      );
    });
    sourceToTestMap.set(sourceFile, matchingTests);
  });
  
  // Find untested files
  const untestedFiles = sourceFiles.filter((file: string) => {
    const testMatches = sourceToTestMap.get(file) || [];
    return testMatches.length === 0;
  });
  
  // Process coverage data to calculate module-level stats
  const moduleCoverage: ModuleCoverage[] = [];
  const overallStats = {
    statements: { total: 0, covered: 0, percentage: 0 },
    branches: { total: 0, covered: 0, percentage: 0 },
    functions: { total: 0, covered: 0, percentage: 0 },
    lines: { total: 0, covered: 0, percentage: 0 }
  };
  
  // Process file coverage information
  if (coverageData && coverageData.data) {
    // Group files by module
    const moduleFiles = new Map<string, string[]>();
    Object.keys(coverageData.data).forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      if (!relativePath.startsWith('src/')) return;
      
      // Extract module path (up to 3 levels: src/category/module)
      const parts = relativePath.split(path.sep);
      const modulePath = parts.slice(0, Math.min(3, parts.length)).join(path.sep);
      
      if (!moduleFiles.has(modulePath)) {
        moduleFiles.set(modulePath, []);
      }
      moduleFiles.get(modulePath)!.push(file);
    });
    
    // Calculate coverage for each module
    moduleFiles.forEach((files, modulePath) => {
      const moduleStats = {
        statements: { total: 0, covered: 0, percentage: 0 },
        branches: { total: 0, covered: 0, percentage: 0 },
        functions: { total: 0, covered: 0, percentage: 0 },
        lines: { total: 0, covered: 0, percentage: 0 }
      };
      
      const components: { name: string; percentage: number }[] = [];
      
      // Process each file in the module
      files.forEach(file => {
        const fileData = coverageData.data[file];
        if (!fileData) return;
        
        // Add to module stats
        moduleStats.statements.total += fileData.s.total;
        moduleStats.statements.covered += fileData.s.covered;
        moduleStats.branches.total += fileData.b.total;
        moduleStats.branches.covered += fileData.b.covered;
        moduleStats.functions.total += fileData.f.total;
        moduleStats.functions.covered += fileData.f.covered;
        moduleStats.lines.total += fileData.l.total;
        moduleStats.lines.covered += fileData.l.covered;
        
        // Extract component info
        const baseName = path.basename(file, path.extname(file));
        const componentCoverage = (fileData.l.covered / fileData.l.total) * 100 || 0;
        components.push({
          name: baseName,
          percentage: componentCoverage
        });
        
        // Add to overall stats
        overallStats.statements.total += fileData.s.total;
        overallStats.statements.covered += fileData.s.covered;
        overallStats.branches.total += fileData.b.total;
        overallStats.branches.covered += fileData.b.covered;
        overallStats.functions.total += fileData.f.total;
        overallStats.functions.covered += fileData.f.covered;
        overallStats.lines.total += fileData.l.total;
        overallStats.lines.covered += fileData.l.covered;
      });
      
      // Calculate percentages for module
      moduleStats.statements.percentage = (moduleStats.statements.covered / moduleStats.statements.total) * 100 || 0;
      moduleStats.branches.percentage = (moduleStats.branches.covered / moduleStats.branches.total) * 100 || 0;
      moduleStats.functions.percentage = (moduleStats.functions.covered / moduleStats.functions.total) * 100 || 0;
      moduleStats.lines.percentage = (moduleStats.lines.covered / moduleStats.lines.total) * 100 || 0;
      
      // Determine priority based on path and coverage
      let priority: 'high' | 'medium' | 'low' = 'low';
      const isCritical = CRITICAL_PATHS.some(criticalPath => modulePath.startsWith(criticalPath));
      const lineCoverage = moduleStats.lines.percentage;
      
      if (isCritical) {
        if (lineCoverage < COVERAGE_THRESHOLDS.critical) {
          priority = 'high';
        } else if (lineCoverage < COVERAGE_THRESHOLDS.high) {
          priority = 'medium';
        }
      } else {
        if (lineCoverage < COVERAGE_THRESHOLDS.medium) {
          priority = 'high';
        } else if (lineCoverage < COVERAGE_THRESHOLDS.high) {
          priority = 'medium';
        }
      }
      
      moduleCoverage.push({
        path: modulePath,
        relativePath: path.relative(projectRoot, modulePath),
        coverage: moduleStats,
        priority,
        components: components.sort((a, b) => a.percentage - b.percentage) // Sort by coverage (lowest first)
      });
    });
    
    // Calculate overall percentages
    overallStats.statements.percentage = (overallStats.statements.covered / overallStats.statements.total) * 100 || 0;
    overallStats.branches.percentage = (overallStats.branches.covered / overallStats.branches.total) * 100 || 0;
    overallStats.functions.percentage = (overallStats.functions.covered / overallStats.functions.total) * 100 || 0;
    overallStats.lines.percentage = (overallStats.lines.covered / overallStats.lines.total) * 100 || 0;
  }
  
  // Sort modules by priority (high to low) and then by coverage (low to high)
  moduleCoverage.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.coverage.lines.percentage - b.coverage.lines.percentage;
  });
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  // Check if overall coverage is below 80%
  if (overallStats.lines.percentage < 80) {
    recommendations.push(`Overall test coverage is ${overallStats.lines.percentage.toFixed(2)}%, which is below the 80% target for production readiness.`);
  }
  
  // Add recommendations for high-priority modules
  const highPriorityModules = moduleCoverage.filter(m => m.priority === 'high');
  if (highPriorityModules.length > 0) {
    recommendations.push(`Focus testing efforts on ${highPriorityModules.length} high-priority modules with low coverage, particularly on critical infrastructure components.`);
    
    highPriorityModules.slice(0, 3).forEach(module => {
      recommendations.push(`Increase test coverage for ${module.relativePath} (currently at ${module.coverage.lines.percentage.toFixed(2)}%), especially for components: ${module.components.slice(0, 3).map(c => c.name).join(', ')}`);
    });
  }
  
  // Add recommendations for untested files
  if (untestedFiles.length > 0) {
    const criticalUntested = untestedFiles.filter((file: string) =>
      CRITICAL_PATHS.some(criticalPath => file.startsWith(criticalPath))
    );
    
    if (criticalUntested.length > 0) {
      recommendations.push(`Create tests for ${criticalUntested.length} critical untested files, including: ${criticalUntested.slice(0, 3).map((f: string) => path.basename(f)).join(', ')}`);
    }
  }
  
  // Add specific recommendation for low function coverage
  if (overallStats.functions.percentage < 70) {
    recommendations.push(`Improve function coverage (currently at ${overallStats.functions.percentage.toFixed(2)}%) by testing edge cases and error handling paths in existing functions.`);
  }
  
  // Add specific recommendation for low branch coverage
  if (overallStats.branches.percentage < 70) {
    recommendations.push(`Improve branch coverage (currently at ${overallStats.branches.percentage.toFixed(2)}%) by testing conditional logic in modules with complex decision paths.`);
  }
  
  return {
    overall: overallStats,
    modules: moduleCoverage,
    untested: untestedFiles.map((file: string) => path.relative(projectRoot, file)),
    recommendations
  };
}

/**
 * Generate a test coverage report in markdown format
 */
export function generateCoverageReport(coverage: CoverageSummary): string {
  // Format the report as markdown
  const report = [
    '# Test Coverage Analysis',
    '',
    '## Overall Coverage',
    '',
    '| Metric | Coverage | Status |',
    '|--------|----------|--------|',
    `| Lines | ${coverage.overall.lines.percentage.toFixed(2)}% (${coverage.overall.lines.covered}/${coverage.overall.lines.total}) | ${getStatusEmoji(coverage.overall.lines.percentage)} |`,
    `| Functions | ${coverage.overall.functions.percentage.toFixed(2)}% (${coverage.overall.functions.covered}/${coverage.overall.functions.total}) | ${getStatusEmoji(coverage.overall.functions.percentage)} |`,
    `| Branches | ${coverage.overall.branches.percentage.toFixed(2)}% (${coverage.overall.branches.covered}/${coverage.overall.branches.total}) | ${getStatusEmoji(coverage.overall.branches.percentage)} |`,
    `| Statements | ${coverage.overall.statements.percentage.toFixed(2)}% (${coverage.overall.statements.covered}/${coverage.overall.statements.total}) | ${getStatusEmoji(coverage.overall.statements.percentage)} |`,
    '',
    '## Modules with Low Coverage',
    '',
    '| Module | Coverage | Priority | Needs Attention |',
    '|--------|----------|----------|----------------|'
  ];
  
  // Add modules with less than 80% coverage
  const lowCoverageModules = coverage.modules
    .filter(m => m.coverage.lines.percentage < 80)
    .slice(0, 10); // Limit to top 10 to keep the report manageable
  
  if (lowCoverageModules.length > 0) {
    lowCoverageModules.forEach(module => {
      report.push(`| ${module.relativePath} | ${module.coverage.lines.percentage.toFixed(2)}% | ${getPriorityLabel(module.priority)} | ${module.components.slice(0, 3).map(c => c.name).join(', ')} |`);
    });
  } else {
    report.push('| No modules with low coverage found | - | - | - |');
  }
  
  // Add untested files section
  report.push('', '## Untested Files', '');
  if (coverage.untested.length > 0) {
    report.push('The following files have no tests:');
    report.push('');
    const criticalUntested = coverage.untested.filter(file => 
      CRITICAL_PATHS.some(criticalPath => file.startsWith(criticalPath))
    );
    
    if (criticalUntested.length > 0) {
      report.push('### Critical Untested Files:');
      report.push('');
      criticalUntested.slice(0, 10).forEach(file => {
        report.push(`- 🚨 ${file}`);
      });
      report.push('');
    }
    
    report.push('### Other Untested Files:');
    report.push('');
    const otherUntested = coverage.untested.filter(file => 
      !CRITICAL_PATHS.some(criticalPath => file.startsWith(criticalPath))
    );
    otherUntested.slice(0, 10).forEach(file => {
      report.push(`- ${file}`);
    });
    
    if (coverage.untested.length > 20) {
      report.push(`- ... and ${coverage.untested.length - 20} more files`);
    }
  } else {
    report.push('All files have some test coverage. Great job!');
  }
  
  // Add recommendations
  report.push('', '## Recommendations', '');
  if (coverage.recommendations.length > 0) {
    coverage.recommendations.forEach(recommendation => {
      report.push(`- ${recommendation}`);
    });
  } else {
    report.push('- Current test coverage looks good. Keep up the good work!');
  }
  
  // Add final notes
  report.push('', '## Next Steps', '');
  report.push('1. Address high-priority modules first');
  report.push('2. Focus on testing critical component functionality');
  report.push('3. Add tests for error handling and edge cases');
  report.push('4. Implement continuous coverage monitoring');
  report.push('');
  report.push('> Report generated on ' + new Date().toISOString());
  
  return report.join('\n');
}

/**
 * Get emoji indicator for coverage status
 */
function getStatusEmoji(percentage: number): string {
  if (percentage >= 80) return '✅';
  if (percentage >= 60) return '⚠️';
  return '❌';
}

/**
 * Get a formatted label for priority
 */
function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
  if (priority === 'high') return '🔴 High';
  if (priority === 'medium') return '🟠 Medium';
  return '🟢 Low';
}

/**
 * CLI command to generate a coverage report
 */
if (require.main === module) {
  // Default path for coverage JSON
  const defaultCoveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');
  const coveragePath = process.argv[2] || defaultCoveragePath;
  
  analyzeCoverage(coveragePath)
    .then(coverage => {
      const report = generateCoverageReport(coverage);
      
      // Write report to file
      const reportPath = path.join(process.cwd(), 'coverage-report.md');
      fs.writeFileSync(reportPath, report);
      
      console.log(`Coverage report written to ${reportPath}`);
      console.log(`Overall coverage: ${coverage.overall.lines.percentage.toFixed(2)}%`);
      console.log(`Recommendations: ${coverage.recommendations.length}`);
    })
    .catch(error => {
      console.error('Failed to generate coverage report:', error);
      process.exit(1);
    });
}