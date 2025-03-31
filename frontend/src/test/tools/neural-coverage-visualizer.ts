/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Coverage Visualizer with Quantum Precision
 * 
 * This utility generates a visual representation of test coverage with clinical precision,
 * highlighting areas needing further neural-safe testing with mathematical elegance.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Neural-safe type definitions with quantum precision
interface ComponentCoverage {
  name: string;
  path: string;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  complexity: number;
}

interface CoverageGroup {
  name: string;
  components: ComponentCoverage[];
  averageCoverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

// Neural-safe colors with clinical precision
const NEURAL_COLORS = {
  high: '#4caf50',
  medium: '#ff9800',
  low: '#f44336',
  background: '#1e1e2f',
  text: '#ffffff',
  highlight: '#e91e63'
};

// Neural-safe thresholds with quantum precision
const COVERAGE_THRESHOLDS = {
  high: 85,
  medium: 50
};

/**
 * Generate neural-safe coverage report with clinical precision
 */
export function generateCoverageVisual(coverageData: any, outputDir: string): void {
  console.log(chalk.hex(NEURAL_COLORS.highlight)('🧠 NOVAMIND Neural Coverage Visualizer: Generating visualization with quantum precision'));
  
  // Group components by type for neural-safe visualization
  const atomicGroups: Record<string, ComponentCoverage[]> = {
    atoms: [],
    molecules: [],
    organisms: [],
    templates: [],
    pages: [],
    other: []
  };
  
  // Process coverage data with mathematical elegance
  Object.entries(coverageData).forEach(([filePath, data]: [string, any]) => {
    if (!filePath.includes('src/presentation')) {
      return;
    }
    
    const pathParts = filePath.split('/');
    const componentType = pathParts.includes('atoms') ? 'atoms' :
                          pathParts.includes('molecules') ? 'molecules' :
                          pathParts.includes('organisms') ? 'organisms' :
                          pathParts.includes('templates') ? 'templates' :
                          pathParts.includes('pages') ? 'pages' : 'other';
    
    const componentName = path.basename(filePath).replace('.tsx', '').replace('.ts', '');
    
    // Calculate coverage metrics with clinical precision
    const statements = data.statements.pct || 0;
    const branches = data.branches.pct || 0;
    const functions = data.functions.pct || 0;
    const lines = data.lines.pct || 0;
    
    // Calculate cyclomatic complexity with quantum precision
    const complexity = data.complexity || 0;
    
    atomicGroups[componentType].push({
      name: componentName,
      path: filePath,
      coverage: {
        statements,
        branches,
        functions,
        lines
      },
      complexity
    });
  });
  
  // Calculate group averages with mathematical elegance
  const coverageGroups: CoverageGroup[] = Object.entries(atomicGroups).map(([name, components]) => {
    const componentCount = components.length;
    
    if (componentCount === 0) {
      return {
        name,
        components,
        averageCoverage: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0
        }
      };
    }
    
    const totalStatements = components.reduce((sum, comp) => sum + comp.coverage.statements, 0);
    const totalBranches = components.reduce((sum, comp) => sum + comp.coverage.branches, 0);
    const totalFunctions = components.reduce((sum, comp) => sum + comp.coverage.functions, 0);
    const totalLines = components.reduce((sum, comp) => sum + comp.coverage.lines, 0);
    
    return {
      name,
      components,
      averageCoverage: {
        statements: totalStatements / componentCount,
        branches: totalBranches / componentCount,
        functions: totalFunctions / componentCount,
        lines: totalLines / componentCount
      }
    };
  });
  
  // Generate HTML report with neural precision
  const htmlReport = generateHTMLReport(coverageGroups);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write report to file with clinical precision
  const outputPath = path.join(outputDir, 'neural-coverage-report.html');
  fs.writeFileSync(outputPath, htmlReport);
  
  console.log(chalk.hex(NEURAL_COLORS.high)(`✓ Neural coverage visualization generated with quantum precision at: ${outputPath}`));
}

/**
 * Generate HTML report with neural-safe formatting and clinical precision
 */
function generateHTMLReport(coverageGroups: CoverageGroup[]): string {
  // Calculate overall coverage with mathematical elegance
  const componentCount = coverageGroups.reduce((sum, group) => sum + group.components.length, 0);
  
  let totalStatements = 0;
  let totalBranches = 0;
  let totalFunctions = 0;
  let totalLines = 0;
  
  coverageGroups.forEach(group => {
    group.components.forEach(comp => {
      totalStatements += comp.coverage.statements;
      totalBranches += comp.coverage.branches;
      totalFunctions += comp.coverage.functions;
      totalLines += comp.coverage.lines;
    });
  });
  
  const overallCoverage = {
    statements: componentCount ? totalStatements / componentCount : 0,
    branches: componentCount ? totalBranches / componentCount : 0,
    functions: componentCount ? totalFunctions / componentCount : 0,
    lines: componentCount ? totalLines / componentCount : 0
  };
  
  // Generate gauge charts with neural precision
  const gaugeCharts = `
    <div class="gauge-container">
      <div class="gauge">
        <h3>Statements</h3>
        <div class="gauge-value" style="--percentage: ${overallCoverage.statements}%;">
          <span>${Math.round(overallCoverage.statements)}%</span>
        </div>
      </div>
      <div class="gauge">
        <h3>Branches</h3>
        <div class="gauge-value" style="--percentage: ${overallCoverage.branches}%;">
          <span>${Math.round(overallCoverage.branches)}%</span>
        </div>
      </div>
      <div class="gauge">
        <h3>Functions</h3>
        <div class="gauge-value" style="--percentage: ${overallCoverage.functions}%;">
          <span>${Math.round(overallCoverage.functions)}%</span>
        </div>
      </div>
      <div class="gauge">
        <h3>Lines</h3>
        <div class="gauge-value" style="--percentage: ${overallCoverage.lines}%;">
          <span>${Math.round(overallCoverage.lines)}%</span>
        </div>
      </div>
    </div>
  `;
  
  // Generate component groups with clinical precision
  const groupsHTML = coverageGroups.map(group => {
    if (group.components.length === 0) {
      return '';
    }
    
    const componentsHTML = group.components
      .sort((a, b) => b.coverage.lines - a.coverage.lines)
      .map(comp => {
        const linesCoverageClass = 
          comp.coverage.lines >= COVERAGE_THRESHOLDS.high ? 'high' :
          comp.coverage.lines >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low';
        
        return `
          <tr>
            <td>${comp.name}</td>
            <td>${comp.path}</td>
            <td class="${comp.coverage.statements >= COVERAGE_THRESHOLDS.high ? 'high' : comp.coverage.statements >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(comp.coverage.statements)}%</td>
            <td class="${comp.coverage.branches >= COVERAGE_THRESHOLDS.high ? 'high' : comp.coverage.branches >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(comp.coverage.branches)}%</td>
            <td class="${comp.coverage.functions >= COVERAGE_THRESHOLDS.high ? 'high' : comp.coverage.functions >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(comp.coverage.functions)}%</td>
            <td class="${linesCoverageClass}">${Math.round(comp.coverage.lines)}%</td>
            <td>${comp.complexity}</td>
          </tr>
        `;
      })
      .join('');
    
    return `
      <div class="coverage-group">
        <h2>${group.name.charAt(0).toUpperCase() + group.name.slice(1)}</h2>
        <div class="group-average">
          <div class="average-item">
            <span>Statements: </span>
            <span class="${group.averageCoverage.statements >= COVERAGE_THRESHOLDS.high ? 'high' : group.averageCoverage.statements >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(group.averageCoverage.statements)}%</span>
          </div>
          <div class="average-item">
            <span>Branches: </span>
            <span class="${group.averageCoverage.branches >= COVERAGE_THRESHOLDS.high ? 'high' : group.averageCoverage.branches >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(group.averageCoverage.branches)}%</span>
          </div>
          <div class="average-item">
            <span>Functions: </span>
            <span class="${group.averageCoverage.functions >= COVERAGE_THRESHOLDS.high ? 'high' : group.averageCoverage.functions >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(group.averageCoverage.functions)}%</span>
          </div>
          <div class="average-item">
            <span>Lines: </span>
            <span class="${group.averageCoverage.lines >= COVERAGE_THRESHOLDS.high ? 'high' : group.averageCoverage.lines >= COVERAGE_THRESHOLDS.medium ? 'medium' : 'low'}">${Math.round(group.averageCoverage.lines)}%</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Path</th>
              <th>Statements</th>
              <th>Branches</th>
              <th>Functions</th>
              <th>Lines</th>
              <th>Complexity</th>
            </tr>
          </thead>
          <tbody>
            ${componentsHTML}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
  
  // Generate neural-safe HTML with clinical precision
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NOVAMIND Neural Coverage Report</title>
      <style>
        :root {
          --color-high: ${NEURAL_COLORS.high};
          --color-medium: ${NEURAL_COLORS.medium};
          --color-low: ${NEURAL_COLORS.low};
          --color-bg: ${NEURAL_COLORS.background};
          --color-text: ${NEURAL_COLORS.text};
          --color-highlight: ${NEURAL_COLORS.highlight};
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: var(--color-bg);
          color: var(--color-text);
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        header {
          text-align: center;
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1rem;
        }
        
        h1 {
          color: var(--color-highlight);
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          font-size: 1.2rem;
          opacity: 0.8;
        }
        
        .gauge-container {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          margin: 2rem 0;
        }
        
        .gauge {
          text-align: center;
          width: 200px;
          margin: 1rem;
        }
        
        .gauge h3 {
          margin-bottom: 1rem;
        }
        
        .gauge-value {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: conic-gradient(
            var(--color-high) 0% var(--percentage),
            rgba(255, 255, 255, 0.1) var(--percentage) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .gauge-value::before {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: var(--color-bg);
        }
        
        .gauge-value span {
          position: relative;
          z-index: 2;
        }
        
        .coverage-group {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .group-average {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        
        .average-item {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        th {
          background-color: rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 0;
        }
        
        tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .high {
          color: var(--color-high);
        }
        
        .medium {
          color: var(--color-medium);
        }
        
        .low {
          color: var(--color-low);
        }
        
        footer {
          text-align: center;
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          .gauge {
            width: 150px;
          }
          
          .gauge-value {
            width: 120px;
            height: 120px;
          }
          
          .gauge-value::before {
            width: 90px;
            height: 90px;
          }
          
          table {
            font-size: 0.9rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>🧠 NOVAMIND Neural Coverage Report</h1>
          <p class="subtitle">Quantum-precision test coverage analysis with clinical accuracy</p>
        </header>
        
        <section class="overall-coverage">
          <h2>Overall Coverage</h2>
          ${gaugeCharts}
        </section>
        
        <section class="component-coverage">
          ${groupsHTML}
        </section>
        
        <footer>
          Generated with NOVAMIND Neural Coverage Visualizer
          <br>
          ${new Date().toISOString().split('T')[0]}
        </footer>
      </div>
    </body>
    </html>
  `;
}

/**
 * Parse coverage data with quantum precision
 */
export function parseCoverageData(coveragePath: string): any {
  try {
    const coverageJson = fs.readFileSync(coveragePath, 'utf8');
    return JSON.parse(coverageJson);
  } catch (error) {
    console.error(chalk.hex(NEURAL_COLORS.low)(`❌ Error parsing coverage data: ${error}`));
    return {};
  }
}
