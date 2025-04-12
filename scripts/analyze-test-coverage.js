#!/usr/bin/env node

/**
 * Test Coverage Analysis Script
 * 
 * This script runs tests with coverage and analyzes the results to help
 * achieve the 80% test coverage goal for production readiness.
 * 
 * Usage:
 *   node scripts/analyze-test-coverage.js [--focus-areas] [--ci]
 * 
 * Options:
 *   --focus-areas: Only show high-priority areas needing tests
 *   --ci: Format output for CI environments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COVERAGE_TARGET = 80; // 80% coverage target for production readiness
const COVERAGE_JSON_PATH = path.join(process.cwd(), 'coverage', 'coverage-final.json');
const REPORT_OUTPUT_PATH = path.join(process.cwd(), 'coverage-report.md');

// Process command line arguments
const args = process.argv.slice(2);
const showFocusAreasOnly = args.includes('--focus-areas');
const ciMode = args.includes('--ci');

/**
 * Main function to run tests and analyze coverage
 */
async function main() {
  try {
    console.log('🧪 Running tests with coverage...');
    
    // Run tests with coverage
    try {
      execSync('npm test -- --coverage', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Tests failed, but continuing with coverage analysis...');
    }
    
    // Check if coverage file exists
    if (!fs.existsSync(COVERAGE_JSON_PATH)) {
      console.error('❌ Coverage file not found. Make sure tests were run with --coverage flag.');
      process.exit(1);
    }
    
    console.log('📊 Analyzing test coverage...');
    
    // Import the coverage analyzer (dynamically to support ESM)
    const { analyzeCoverage, generateCoverageReport } = require('../src/test/utils/coverage-analyzer');
    
    // Analyze coverage
    const coverage = await analyzeCoverage(COVERAGE_JSON_PATH);
    
    // Generate and save report
    const report = generateCoverageReport(coverage);
    fs.writeFileSync(REPORT_OUTPUT_PATH, report);
    
    // Display results
    const overallCoverage = coverage.overall.lines.percentage.toFixed(2);
    const coverageGap = COVERAGE_TARGET - coverage.overall.lines.percentage;
    
    console.log('\n📝 Test Coverage Summary:');
    console.log(`------------------------`);
    console.log(`Overall line coverage: ${overallCoverage}%`);
    console.log(`Function coverage: ${coverage.overall.functions.percentage.toFixed(2)}%`);
    console.log(`Branch coverage: ${coverage.overall.branches.percentage.toFixed(2)}%`);
    console.log(`Statement coverage: ${coverage.overall.statements.percentage.toFixed(2)}%`);
    
    if (coverageGap > 0) {
      console.log(`\n⚠️ Coverage gap: ${coverageGap.toFixed(2)}% below the ${COVERAGE_TARGET}% target`);
    } else {
      console.log(`\n✅ Coverage target of ${COVERAGE_TARGET}% achieved!`);
    }
    
    // Show priority areas
    const highPriorityModules = coverage.modules
      .filter(m => m.priority === 'high')
      .sort((a, b) => a.coverage.lines.percentage - b.coverage.lines.percentage);
    
    if (highPriorityModules.length > 0) {
      console.log('\n🔍 High Priority Areas:');
      console.log(`---------------------`);
      
      highPriorityModules.slice(0, 5).forEach(module => {
        console.log(`- ${module.relativePath}: ${module.coverage.lines.percentage.toFixed(2)}% coverage`);
        const lowCoverageComponents = module.components
          .filter(c => c.percentage < 50)
          .slice(0, 3);
        
        if (lowCoverageComponents.length > 0) {
          console.log(`  Components needing tests: ${lowCoverageComponents.map(c => c.name).join(', ')}`);
        }
      });
    }
    
    // Show recommendations if not in focus areas mode
    if (!showFocusAreasOnly) {
      console.log('\n🛠️ Recommendations:');
      console.log(`----------------`);
      coverage.recommendations.forEach(rec => {
        console.log(`- ${rec}`);
      });
    }
    
    // Show critical untested files
    const criticalUntested = coverage.untested.filter(file => 
      file.startsWith('src/infrastructure/auth') || 
      file.startsWith('src/infrastructure/api') ||
      file.startsWith('src/domain/models')
    );
    
    if (criticalUntested.length > 0) {
      console.log('\n⚠️ Critical Untested Files:');
      console.log(`-----------------------`);
      criticalUntested.slice(0, 5).forEach(file => {
        console.log(`- ${file}`);
      });
      if (criticalUntested.length > 5) {
        console.log(`  ... and ${criticalUntested.length - 5} more`);
      }
    }
    
    console.log(`\n📊 Full report saved to: ${REPORT_OUTPUT_PATH}`);
    
    // Exit with code based on coverage target
    if (coverageGap > 0) {
      if (ciMode) {
        console.log('\n⚠️ Coverage target not met. Exiting with error code.');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('❌ Error analyzing coverage:', error);
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});