/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Test Runner with Quantum Precision
 * 
 * This script executes comprehensive tests across all neural visualization
 * components, analyzing coverage and generating reports with clinical precision.
 */

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Calculate __dirname equivalent in ES modules with quantum precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neural computation paths with quantum precision
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const TEST_DIRS = [
  path.join(FRONTEND_ROOT, 'src/presentation/atoms'),
  path.join(FRONTEND_ROOT, 'src/presentation/molecules'),
  path.join(FRONTEND_ROOT, 'src/presentation/organisms'),
  path.join(FRONTEND_ROOT, 'src/presentation/templates'),
  path.join(FRONTEND_ROOT, 'src/application/coordinators'),
  path.join(FRONTEND_ROOT, 'src/application/services'),
  path.join(FRONTEND_ROOT, 'src/domain/models'),
];

// Neural test configuration with clinical precision
const VITEST_CONFIG = path.join(FRONTEND_ROOT, 'vitest.minimal.config.js');
const COVERAGE_DIR = path.join(FRONTEND_ROOT, 'coverage');
const REPORT_DIR = path.join(FRONTEND_ROOT, 'test-reports');

// Neural-safe test execution with quantum precision
async function runNeuralTests(options = {}: any): any {
  const {
    coverage = false, // Disable coverage by default to reduce complexity
    verbose = true,
    component = null,
    reportFile = 'neural-test-report.json',
    debugMode = false,
    timeoutSeconds = 120,
  } = options;

  console.log(chalk.blue('🧠 NOVAMIND Neural Test Suite: Initializing with quantum precision...'));
  
  // Ensure report directory exists with clinical precision
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // For Windows/WSL compatibility, use a more direct approach with quantum precision
  const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME;
  const isWindows = process.platform === 'win32';
  
  console.log(chalk.blue('🧠 Environment: ' + (isWSL ? 'WSL' : isWindows ? 'Windows' : 'Other')));

  // Neural-safe environment variables to enhance cross-platform compatibility
  const envVars = {
    // Ensure proper module resolution in WSL environment
    NODE_PATH: path.join(FRONTEND_ROOT, 'node_modules').replace(/\\/g, '/'),
    // Force consistent path separator for cross-environment compatibility
    FORCE_CONSISTENT_PATH_SEP: 'true',
    // Ensure proper source map support
    NODE_OPTIONS: '--enable-source-maps --max-old-space-size=4096',
    // Add debug flag for enhanced diagnostics with quantum precision
    VITEST_DEBUG: debugMode ? 'true' : 'false',
    // Disable automatic test parallelization to prevent hanging
    VITEST_POOL: 'threads',
    // Set a timeout for individual tests with clinical precision
    VITEST_TIMEOUT: (timeoutSeconds * 1000).toString(),
    // Force exit after tests complete to prevent hanging
    VITEST_FORCE_EXIT: 'true'
  };

  if (debugMode) {
    console.log(chalk.yellow('🧠 Debug Mode: Enabled with quantum precision'));
    console.log(chalk.yellow('🧠 Environment Variables:'));
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(chalk.yellow(`  ${key}: ${value}`));
    });
  }

  // Build test command arguments with mathematical elegance
  const testArgs = [
    '--config', VITEST_CONFIG.replace(/\\/g, '/'),
    '--run',
    '--no-watch',
    '--reporter', 'verbose',
  ];
  
  if (coverage) {
    testArgs.push('--coverage');
  }
  
  if (component) {
    testArgs.push(component);
  }
  
  // Use a direct Node.js execution approach with quantum precision
  // This avoids issues with the CLI and provides better error reporting
  return new Promise((resolve, reject) => {
    console.log(chalk.cyan(`🧠 Executing neural test command: npx vitest ${testArgs.join(' ')}`));
    
    // Use exec for a more direct approach with clinical precision
    const command = `cd "${FRONTEND_ROOT}" && npx vitest ${testArgs.join(' ')}`;
    
    // Set environment variables with quantum precision
    const env = { ...process.env, ...envVars };
    
    const child = exec(command, { env });
    
    let output = '';
    let errorOutput = '';
    let lastOutputTime = Date.now();
    
    // Capture output with clinical precision
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk);
      lastOutputTime = Date.now();
    });
    
    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.error(chalk.yellow('🧠 Neural Test Warning:'));
      process.stderr.write(chunk);
      lastOutputTime = Date.now();
    });
    
    // Set a timeout to prevent indefinite hanging with quantum precision
    const timeout = setTimeout(() => {
      console.error(chalk.red(`🧠 Neural Test Error: Test execution timed out after ${timeoutSeconds} seconds`));
      console.log(chalk.cyan('🧠 Diagnostic Information:'));
      console.log(chalk.cyan('- Current output:'));
      console.log(output.slice(-2000) || 'No output captured');
      console.log(chalk.cyan('- Current error output:'));
      console.log(errorOutput.slice(-2000) || 'No error output captured');
      console.log(chalk.cyan('- Time since last output: ' + (Date.now() - lastOutputTime) / 1000 + ' seconds'));
      
      // Force kill the process with clinical precision
      try {
        child.kill('SIGKILL');
        console.log(chalk.red('🧠 Process terminated with SIGKILL'));
      } catch (error) {
        console.error(chalk.red('🧠 Error killing process:', error.message));
      }
      
      reject(new Error('Neural test execution timed out after ' + timeoutSeconds + ' seconds'));
    }, timeoutSeconds * 1000);
    
    // Check for stalled execution with clinical precision
    const stallCheck = setInterval(() => {
      const timeSinceLastOutput = Date.now() - lastOutputTime;
      if (timeSinceLastOutput > 30000) { // 30 seconds of no output
        console.log(chalk.yellow(`🧠 Warning: No output received for ${timeSinceLastOutput / 1000} seconds`));
        
        if (debugMode) {
          // In debug mode, dump process info for diagnostic purposes
          console.log(chalk.yellow('🧠 Process Info:'));
          console.log(chalk.yellow(`  Command: ${command}`));
        }
      }
    }, 10000);
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      clearInterval(stallCheck);
      console.error(chalk.red(`🧠 Neural Test Error: ${error.message}`));
      reject(error);
    });
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      clearInterval(stallCheck);
      
      if (code !== 0) {
        console.error(chalk.red(`🧠 Neural Test Error: Process exited with code ${code}`));
        reject(new Error(`Process exited with code ${code}\n${errorOutput}`));
        return;
      }
      
      console.log(chalk.green('🧠 NOVAMIND Neural Test Suite: Completed with quantum precision'));
      resolve(output);
    });
  });
}

// Command-line interface with clinical precision
async function main(): any {
  // Parse command-line arguments with quantum precision
  const args = process.argv.slice(2);
  
  // Extract options with clinical precision
  const options = {
    coverage: args.includes('--coverage'),
    verbose: !args.includes('--quiet'),
    component: null,
    debugMode: args.includes('--debug')
  };
  
  // Check for specific component with neural precision
  const componentIndex = args.findIndex(arg => arg === '--component');
  if (componentIndex !== -1 && args[componentIndex + 1]) {
    options.component = args[componentIndex + 1];
  }
  
  try {
    // Run tests with quantum precision
    await runNeuralTests(options);
  } catch (error) {
    console.error(chalk.red('🧠 NOVAMIND Neural Test Runner Error:'), error.message);
    process.exit(1);
  }
}

// Execute main function with clinical precision
main();

// Export neural testing functions with clinical precision
export {
  runNeuralTests
};
