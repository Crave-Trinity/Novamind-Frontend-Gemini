/**
 * NOVAMIND Neural Architecture
 * Quantum Test Execution
 * 
 * This script implements neural-safe testing with ES Module compatibility
 * and quantum precision for critical visualization components.
 */

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { promisify } from 'util';

// ES Module compatible directory resolution with quantum precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

// Promisified exec with neural safety
const execAsync = promisify(exec);

console.log('🧠 NOVAMIND QUANTUM TEST EXECUTION');
console.log('Implementing neural-safe ES Module testing with clinical precision...\n');

// Component name from CLI args with clinical precision
const componentName = process.argv[2] || 'NeuralActivityVisualizer';

// Critical visualization components with quantum precision
const CRITICAL_COMPONENTS = [
  'NeuralActivityVisualizer',
  'BiometricAlertVisualizer', 
  'BrainModelViewer',
  'TemporalDynamicsVisualizer',
  'TreatmentResponseVisualizer'
];

/**
 * Execute component test with neural precision
 */
async function executeComponentTest(component: any): any {
  console.log(`\n🔬 Testing component: ${component} with quantum precision`);
  
  try {
    // Run with clinical-grade precision - direct npx command
    console.log(`⚡ Executing focused test for ${component}...\n`);
    
    const { stdout, stderr } = await execAsync(
      `npx vitest run -t "${component}" --config vitest.unified.js`, 
      {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          FORCE_COLOR: 'false',
          VITEST_LOG_LEVEL: 'error', // Clinical precision: show only errors
          CI: 'true'
        },
        timeout: 30000 // Neural-safe timeout
      }
    );
    
    // Process output with quantum precision - filtering noise
    const cleanOutput = stdout
      .replace(/Module "tty" has been externalized[^\n]+/g, '')
      .replace(/Cannot access "tty\.isatty"[^\n]+/g, '')
      .replace(/vitest-browser[^\n]+/g, '')
      .replace(/deps\.inline[^\n]+/g, '')
      .replace(/browser-external[^\n]+/g, '')
      .trim();
    
    if (cleanOutput) {
      console.log('✅ TEST OUTPUT WITH CLINICAL PRECISION:');
      console.log(cleanOutput);
    } else {
      console.log('✅ TEST EXECUTED SUCCESSFULLY - NO OUTPUT');
    }
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error testing ${component}:`);
    
    // Clean error output with neural precision
    if (error.stdout || error.stderr) {
      const errorOutput = error.stdout || error.stderr;
      const cleanError = errorOutput
        .replace(/Module "tty" has been externalized[^\n]+/g, '')
        .replace(/Cannot access "tty\.isatty"[^\n]+/g, '')
        .replace(/vitest-browser[^\n]+/g, '')
        .replace(/deps\.inline[^\n]+/g, '')
        .replace(/browser-external[^\n]+/g, '')
        .trim();
      
      console.log(cleanError || error.message);
    } else {
      console.error(error.message);
    }
    
    return false;
  }
}

/**
 * Execute neural component tests with quantum precision
 */
async function executeNeuralTests(): any {
  if (componentName === 'all') {
    console.log('🧠 Testing all critical visualization components...\n');
    
    for (const component of CRITICAL_COMPONENTS) {
      await executeComponentTest(component);
    }
  } else if (componentName === 'help') {
    console.log('🧠 NOVAMIND QUANTUM TEST HELP');
    console.log('\nUsage: node quantum-test.js [component|command]');
    console.log('\nComponents:');
    CRITICAL_COMPONENTS.forEach(component => {
      console.log(`  ${component}`);
    });
    console.log('\nCommands:');
    console.log('  all    Test all critical visualization components');
    console.log('  help   Display this help information');
    
    console.log('\nExamples:');
    console.log('  node quantum-test.js NeuralActivityVisualizer');
    console.log('  node quantum-test.js all');
  } else {
    await executeComponentTest(componentName);
  }
  
  console.log('\n📊 NOVAMIND QUANTUM TESTING COMPLETE');
  console.log('Neural-safe testing executed with clinical precision');
}

// Execute with quantum precision
executeNeuralTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
