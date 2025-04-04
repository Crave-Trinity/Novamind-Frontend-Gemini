#!/usr/bin/env node

/**
 * NOVAMIND Continuous Error Check
 * 
 * This script establishes a neuropsychiatric-grade error monitoring system
 * that continuously verifies TypeScript and ESLint compliance, providing
 * quantum-level clinical precision in error reporting.
 * 
 * The script achieves zero-error state by:
 * 1. Running TypeScript type checking in watch mode
 * 2. Running ESLint in watch mode
 * 3. Displaying errors with neural-precision output formatting
 */

import { spawn } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ASCII banner for quantum error monitoring
console.log(chalk.blue(`
╔═════════════════════════════════════════════════════╗
║                                                     ║
║  ${chalk.white.bold('NOVAMIND NEURAL ERROR MONITORING SYSTEM')}           ║
║  ${chalk.gray('Achieving TypeScript Zero-Error State')}                ║
║                                                     ║
╚═════════════════════════════════════════════════════╝
`));

// Function to format elapsed time with neural precision
const formatTime = (startTime) => {
  const elapsed = Date.now() - startTime;
  return chalk.gray(`[${elapsed}ms]`);
};

// Start TypeScript type checking in watch mode
console.log(chalk.cyan('🧠 Initializing TypeScript Neural Type System...'));
const startTsTime = Date.now();

const tsc = spawn('npx', ['tsc', '--noEmit', '--watch'], { cwd: rootDir, shell: true });
let tscErrors = 0;

// Scan TypeScript output for errors with quantum precision
tsc.stdout.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('error TS')) {
    tscErrors++;
    console.log(chalk.red(`TypeScript Error Detected ${formatTime(startTsTime)}`));
    console.log(output);
  } else if (output.includes('Found 0 errors')) {
    console.log(chalk.green(`✓ TypeScript Neural Verification Complete: Zero Errors ${formatTime(startTsTime)}`));
    tscErrors = 0;
  }
});

// Start ESLint checking in watch mode
console.log(chalk.magenta('🔬 Initializing ESLint Clinical Validation...'));
const startLintTime = Date.now();

const eslint = spawn('npx', ['esw', '--watch', '--ext', '.ts,.tsx,.js', '--color', 'src'], { cwd: rootDir, shell: true });
let lintErrors = 0;

// Process ESLint output with neural-grade precision
eslint.stdout.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('problems')) {
    const errorMatch = output.match(/(\d+) problems/);
    if (errorMatch) {
      lintErrors = parseInt(errorMatch[1], 10);
      if (lintErrors > 0) {
        console.log(chalk.yellow(`ESLint detected ${lintErrors} issues ${formatTime(startLintTime)}`));
        console.log(output);
      } else {
        console.log(chalk.green(`✓ ESLint Clinical Validation Complete: No Issues ${formatTime(startLintTime)}`));
      }
    }
  } else if (output.includes('Clean')) {
    console.log(chalk.green(`✓ ESLint Clinical Validation Complete: Code is Clean ${formatTime(startLintTime)}`));
    lintErrors = 0;
  }
});

// Status reporting for neural monitoring system
setInterval(() => {
  const statusSymbol = tscErrors > 0 || lintErrors > 0 ? '⚠️' : '✓';
  const statusColor = tscErrors > 0 || lintErrors > 0 ? chalk.yellow : chalk.green;
  
  console.log(statusColor(`${statusSymbol} NOVAMIND Neural Monitoring Status: ${tscErrors} TypeScript errors, ${lintErrors} ESLint issues`));
  
  if (tscErrors === 0 && lintErrors === 0) {
    console.log(chalk.cyan('🧠 Neural Type System: Optimal'));
    console.log(chalk.blue('🔬 Code Quality: Clinical Grade'));
  }
}, 30000); // Status update every 30 seconds

// Handle process termination with grace
process.on('SIGINT', () => {
  console.log(chalk.gray('\nTerminating Neural Error Monitoring System...'));
  tsc.kill();
  eslint.kill();
  process.exit(0);
});

console.log(chalk.white.bold('Neural Error Monitoring System Active. Press Ctrl+C to terminate.'));
