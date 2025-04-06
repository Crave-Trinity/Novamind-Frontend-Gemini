/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Coverage Visualizer with Quantum Precision
 *
 * This utility generates HTML visualizations of test coverage metrics
 * for neural visualization components with clinical precision.
 */

import fs from 'fs';
import path from 'path';

// Type definitions for coverage data structure
interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

interface CoverageMetricsDetail {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
}

// Interface for the overall coverage data object, including the 'total' summary
interface CoverageData extends Record<string, CoverageMetricsDetail> {
  total: CoverageMetricsDetail;
}

// Neural-safe coverage rendering with quantum precision
// Represents the calculated percentages for display
interface NeuralCoverageMetrics {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  averageCoverage: number;
}

interface ComponentCoverage {
  name: string;
  path: string;
  type:
    | 'atom'
    | 'molecule'
    | 'organism'
    | 'template'
    | 'page'
    | 'service'
    | 'coordinator'
    | 'model';
  metrics: NeuralCoverageMetrics;
}

/**
 * Generate neural-safe coverage HTML report with quantum precision
 */
export function generateCoverageVisualization(
  coverageData: CoverageData,
  outputPath: string
): void {
  // Extract component metrics with clinical precision
  const components: ComponentCoverage[] = [];

  // Process each file in coverage data with mathematical elegance
  Object.entries(coverageData).forEach(([filePath, metrics]) => {
    // Skip non-source files and total metrics
    if (filePath === 'total' || !filePath.startsWith('src/')) {
      return;
    }

    // Skip test and utility files
    if (filePath.includes('.test.') || filePath.includes('/test/')) {
      return;
    }

    // Determine component type with neural precision
    let type: ComponentCoverage['type'] = 'service';

    if (filePath.includes('/presentation/atoms/')) {
      type = 'atom';
    } else if (filePath.includes('/presentation/molecules/')) {
      type = 'molecule';
    } else if (filePath.includes('/presentation/organisms/')) {
      type = 'organism';
    } else if (filePath.includes('/presentation/templates/')) {
      type = 'template';
    } else if (filePath.includes('/presentation/pages/')) {
      type = 'page';
    } else if (filePath.includes('/application/coordinators/')) {
      type = 'coordinator';
    } else if (filePath.includes('/application/services/')) {
      type = 'service';
    } else if (filePath.includes('/domain/models/')) {
      type = 'model';
    }

    // Extract component name with quantum precision
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const componentName = fileName.replace(/\.(ts|tsx)$/, '');

    // Calculate component metrics with clinical precision
    // Type assertion is no longer needed as coverageData is typed
    const fileMetrics = metrics;

    components.push({
      name: componentName,
      path: filePath,
      type,
      metrics: {
        statements: fileMetrics.statements.pct,
        branches: fileMetrics.branches.pct,
        functions: fileMetrics.functions.pct,
        lines: fileMetrics.lines.pct,
        averageCoverage:
          (fileMetrics.statements.pct +
            fileMetrics.branches.pct +
            fileMetrics.functions.pct +
            fileMetrics.lines.pct) /
          4,
      },
    });
  });

  // Sort components by type and name with mathematical elegance
  components.sort((a, b) => {
    if (a.type !== b.type) {
      const typeOrder = {
        atom: 1,
        molecule: 2,
        organism: 3,
        template: 4,
        page: 5,
        coordinator: 6,
        service: 7,
        model: 8,
      };

      return typeOrder[a.type] - typeOrder[b.type];
    }

    return a.name.localeCompare(b.name);
  });

  // Generate HTML report with clinical precision
  const html = generateHtmlReport(components, coverageData.total);

  // Write HTML report with quantum precision
  fs.writeFileSync(outputPath, html);

  console.log(`🧠 Neural Coverage Visualization: Generated at ${outputPath}`);
}

/**
 * Generate HTML report with quantum precision
 */
function generateHtmlReport(
  components: ComponentCoverage[],
  totalMetrics: CoverageMetricsDetail
): string {
  // Calculate total coverage with clinical precision
  const totalCoverage: NeuralCoverageMetrics = {
    statements: totalMetrics.statements.pct,
    branches: totalMetrics.branches.pct,
    functions: totalMetrics.functions.pct,
    lines: totalMetrics.lines.pct,
    averageCoverage:
      (totalMetrics.statements.pct +
        totalMetrics.branches.pct +
        totalMetrics.functions.pct +
        totalMetrics.lines.pct) /
      4,
  };

  // Generate coverage statistics by component type with quantum precision
  const typeStats = generateTypeStats(components);

  // Generate HTML with mathematical elegance
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NOVAMIND Neural Coverage Visualization</title>
  <style>
    :root {
      --color-primary: #4285F4;
      --color-secondary: #EA4335;
      --color-tertiary: #FBBC05;
      --color-quaternary: #34A853;
      --color-bg: #121212;
      --color-text: #F5F5F5;
      --color-text-secondary: #BBBBBB;
      --color-border: #333333;
      --font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-family);
      line-height: 1.6;
      padding: 2rem;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    
    .header p {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }
    
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }
    
    .total-coverage {
      background: linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(66, 133, 244, 0.2));
      border-radius: 0.5rem;
      padding: 1.5rem;
      flex: 1;
      min-width: 300px;
      margin-right: 1rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(66, 133, 244, 0.3);
    }
    
    .total-coverage h2 {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      color: var(--color-primary);
    }
    
    .metrics {
      display: flex;
      flex-wrap: wrap;
    }
    
    .metric {
      margin-right: 2rem;
      margin-bottom: 1rem;
    }
    
    .metric-name {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.25rem;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .chart-container {
      flex: 2;
      min-width: 500px;
      margin-bottom: 1rem;
      background: rgba(30, 30, 30, 0.5);
      border-radius: 0.5rem;
      padding: 1.5rem;
      border: 1px solid var(--color-border);
    }
    
    .chart-title {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      color: var(--color-tertiary);
    }
    
    .chart {
      height: 300px;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      padding: 0 1rem;
    }
    
    .chart-bar {
      width: 50px;
      background: linear-gradient(to top, var(--color-primary), var(--color-quaternary));
      border-radius: 0.25rem 0.25rem 0 0;
      position: relative;
      transition: height 0.5s ease;
    }
    
    .chart-bar-label {
      position: absolute;
      top: -25px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.8rem;
      font-weight: bold;
    }
    
    .chart-bar-value {
      position: absolute;
      bottom: -25px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    
    .components {
      margin-top: 3rem;
    }
    
    .component-type {
      margin-bottom: 2rem;
    }
    
    .component-type-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--color-border);
    }
    
    .component-type-name {
      font-size: 1.3rem;
      color: var(--color-primary);
      text-transform: capitalize;
    }
    
    .component-type-coverage {
      font-size: 1rem;
      color: var(--color-text-secondary);
    }
    
    .component-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
    }
    
    .component-card {
      background: rgba(30, 30, 30, 0.5);
      border-radius: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--color-border);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .component-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .component-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .component-name {
      font-size: 1.1rem;
      font-weight: bold;
    }
    
    .component-path {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.75rem;
    }
    
    .component-coverage {
      height: 8px;
      background-color: rgba(50, 50, 50, 0.8);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .coverage-bar {
      height: 100%;
      border-radius: 4px;
    }
    
    .component-metrics {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOVAMIND Neural Coverage Visualization</h1>
    <p>Test coverage metrics with quantum precision</p>
  </div>
  
  <div class="summary">
    <div class="total-coverage">
      <h2>Overall Coverage</h2>
      <div class="metrics">
        <div class="metric">
          <div class="metric-name">Statements</div>
          <div class="metric-value">${totalCoverage.statements.toFixed(1)}%</div>
        </div>
        <div class="metric">
          <div class="metric-name">Branches</div>
          <div class="metric-value">${totalCoverage.branches.toFixed(1)}%</div>
        </div>
        <div class="metric">
          <div class="metric-name">Functions</div>
          <div class="metric-value">${totalCoverage.functions.toFixed(1)}%</div>
        </div>
        <div class="metric">
          <div class="metric-name">Lines</div>
          <div class="metric-value">${totalCoverage.lines.toFixed(1)}%</div>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <h2 class="chart-title">Coverage by Component Type</h2>
      <div class="chart">
        ${typeStats
          .map(
            (typeStat) => `
          <div class="chart-bar" style="height: ${typeStat.metrics.averageCoverage * 3}px;">
            <div class="chart-bar-label">${typeStat.type}</div>
            <div class="chart-bar-value">${typeStat.metrics.averageCoverage.toFixed(1)}%</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </div>
  
  <div class="components">
    ${generateComponentTypeHtml(components)}
  </div>
  
  <script>
    // Add animation to bars on load
    document.addEventListener('DOMContentLoaded', () => {
      const bars = document.querySelectorAll('.chart-bar');
      bars.forEach(bar => {
        const originalHeight = bar.style.height;
        bar.style.height = '0px';
        setTimeout(() => {
          bar.style.height = originalHeight;
        }, 100);
      });
      
      // Color coverage bars based on percentage
      const coverageBars = document.querySelectorAll('.coverage-bar');
      coverageBars.forEach(bar => {
        const percentage = parseFloat(bar.getAttribute('data-percentage'));
        let color;
        
        if (percentage >= 80) {
          color = 'var(--color-quaternary)';
        } else if (percentage >= 60) {
          color = 'var(--color-tertiary)';
        } else if (percentage >= 40) {
          color = 'var(--color-secondary)';
        } else {
          color = '#F44336';
        }
        
        bar.style.backgroundColor = color;
        bar.style.width = \`\${percentage}%\`;
      });
    });
  </script>
</body>
</html>
  `;
}

/**
 * Generate component type HTML with quantum precision
 */
function generateComponentTypeHtml(components: ComponentCoverage[]): string {
  // Group components by type with clinical precision
  const typeMap: Record<string, ComponentCoverage[]> = {};

  components.forEach((component) => {
    if (!typeMap[component.type]) {
      typeMap[component.type] = [];
    }

    typeMap[component.type].push(component);
  });

  // Generate HTML for each component type with mathematical elegance
  return Object.entries(typeMap)
    .map(([type, typeComponents]) => {
      // Calculate average metrics for this type
      const typeMetrics: NeuralCoverageMetrics = {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        averageCoverage: 0,
      };

      typeComponents.forEach((component) => {
        typeMetrics.statements += component.metrics.statements;
        typeMetrics.branches += component.metrics.branches;
        typeMetrics.functions += component.metrics.functions;
        typeMetrics.lines += component.metrics.lines;
        typeMetrics.averageCoverage += component.metrics.averageCoverage;
      });

      const count = typeComponents.length;
      typeMetrics.statements /= count;
      typeMetrics.branches /= count;
      typeMetrics.functions /= count;
      typeMetrics.lines /= count;
      typeMetrics.averageCoverage /= count;

      // Generate HTML with quantum precision
      return `
        <div class="component-type">
          <div class="component-type-header">
            <div class="component-type-name">${type}s (${count})</div>
            <div class="component-type-coverage">Average Coverage: ${typeMetrics.averageCoverage.toFixed(1)}%</div>
          </div>
          
          <div class="component-list">
            ${typeComponents
              .map(
                (component) => `
              <div class="component-card">
                <div class="component-header">
                  <div class="component-name">${component.name}</div>
                  <div>${component.metrics.averageCoverage.toFixed(1)}%</div>
                </div>
                <div class="component-path">${component.path}</div>
                <div class="component-coverage">
                  <div class="coverage-bar" data-percentage="${component.metrics.averageCoverage}"></div>
                </div>
                <div class="component-metrics">
                  <div>Statements: ${component.metrics.statements.toFixed(1)}%</div>
                  <div>Branches: ${component.metrics.branches.toFixed(1)}%</div>
                  <div>Functions: ${component.metrics.functions.toFixed(1)}%</div>
                  <div>Lines: ${component.metrics.lines.toFixed(1)}%</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Generate statistics by component type with clinical precision
 */
function generateTypeStats(components: ComponentCoverage[]): Array<{
  type: string;
  count: number;
  metrics: NeuralCoverageMetrics;
}> {
  // Group components by type with mathematical elegance
  const typeMap: Record<string, ComponentCoverage[]> = {};

  components.forEach((component) => {
    if (!typeMap[component.type]) {
      typeMap[component.type] = [];
    }

    typeMap[component.type].push(component);
  });

  // Calculate metrics by type with quantum precision
  return Object.entries(typeMap).map(([type, components]) => {
    const metrics: NeuralCoverageMetrics = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
      averageCoverage: 0,
    };

    components.forEach((component) => {
      metrics.statements += component.metrics.statements;
      metrics.branches += component.metrics.branches;
      metrics.functions += component.metrics.functions;
      metrics.lines += component.metrics.lines;
      metrics.averageCoverage += component.metrics.averageCoverage;
    });

    const count = components.length;
    metrics.statements /= count;
    metrics.branches /= count;
    metrics.functions /= count;
    metrics.lines /= count;
    metrics.averageCoverage /= count;

    return { type, count, metrics };
  });
}

/**
 * Neural-safe command-line execution with quantum precision
 */
if (import.meta.url === import.meta.resolve('./neural-coverage-visualizer.ts')) {
  // Process command-line arguments with quantum precision
  const args = process.argv.slice(2);
  let coverageFile = '';
  let outputFile = '';

  // Parse arguments with clinical precision
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--coverage' && i + 1 < args.length) {
      coverageFile = args[i + 1];
      i++;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      outputFile = args[i + 1];
      i++;
    }
  }

  // Ensure paths are provided with quantum precision
  if (!coverageFile) {
    console.error('🧠 Neural Error: Coverage file path must be specified using --coverage');
    process.exit(1);
  }

  if (!outputFile) {
    console.error('🧠 Neural Error: Output file path must be specified using --output');
    process.exit(1);
  }

  // Ensure cross-platform path resolution with mathematical elegance
  coverageFile = path.resolve(process.cwd(), coverageFile);
  outputFile = path.resolve(process.cwd(), outputFile);

  try {
    // Read coverage data with clinical precision
    const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

    // Generate visualization with quantum precision
    generateCoverageVisualization(coverageData, outputFile);

    console.log(`🧠 Neural Coverage Visualization: Successfully generated at ${outputFile}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`🧠 Neural Error: ${errorMessage}`);
    process.exit(1);
  }
}
