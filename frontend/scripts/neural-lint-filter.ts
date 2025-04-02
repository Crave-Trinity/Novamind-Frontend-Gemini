/**
 * NOVAMIND Neural Lint Filter
 * 
 * This script runs TypeScript type checking in multiple passes with increasing strictness
 * to catch and report errors in a more organized way, similar to Python's isort -> flake8 -> black pipeline.
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Calculate __dirname equivalent in ES modules with quantum precision
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neural computation paths with quantum precision
const FRONTEND_ROOT = path.resolve(__dirname, '..');

/**
 * Run a command and return its output with quantum precision
 */
function runCommand(command: any, options = {}: any): any {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`🧠 Executing: ${command}`));
    
    exec(command, { ...options, cwd: FRONTEND_ROOT }, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`🧠 Command failed: ${error.message}`));
        console.error(chalk.yellow(stderr));
        reject(error);
        return;
      }
      
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Run TypeScript type checking with permissive settings
 */
async function runPermissiveTypeCheck(): any {
  console.log(chalk.blue('🧠 NOVAMIND Neural Lint Filter: Running permissive type check...'));
  
  try {
    // Run tsc with more permissive flags
    const { stdout, stderr } = await runCommand('npx tsc --noEmit --skipLibCheck --allowJs');
    
    console.log(chalk.green('🧠 Permissive type check passed!'));
    return true;
  } catch (error) {
    console.error(chalk.red('🧠 Permissive type check failed. Fixing basic issues first...'));
    
    // Extract and display the most critical errors
    const errorLines = error.message.split('\n');
    const criticalErrors = errorLines
      .filter(line => line.includes('error TS'))
      .slice(0, 10); // Show only the first 10 errors
    
    console.log(chalk.yellow('🧠 Critical errors to fix first:'));
    criticalErrors.forEach(error => console.log(chalk.yellow(`  ${error}`)));
    
    return false;
  }
}

/**
 * Run TypeScript type checking with strict settings
 */
async function runStrictTypeCheck(): any {
  console.log(chalk.blue('🧠 NOVAMIND Neural Lint Filter: Running strict type check...'));
  
  try {
    // Run tsc with strict flags
    const { stdout, stderr } = await runCommand('npx tsc --noEmit --strict');
    
    console.log(chalk.green('🧠 Strict type check passed!'));
    return true;
  } catch (error) {
    console.error(chalk.red('🧠 Strict type check failed. Fixing remaining issues...'));
    
    // Extract and display the errors
    const errorLines = error.message.split('\n');
    const strictErrors = errorLines
      .filter(line => line.includes('error TS'))
      .slice(0, 20); // Show only the first 20 errors
    
    console.log(chalk.yellow('🧠 Strict errors to fix:'));
    strictErrors.forEach(error => console.log(chalk.yellow(`  ${error}`)));
    
    return false;
  }
}

/**
 * Run ESLint to catch code style issues
 */
async function runESLint(fix = false: any): any {
  console.log(chalk.blue(`🧠 NOVAMIND Neural Lint Filter: Running ESLint${fix ? ' with auto-fix' : ''}...`));
  
  try {
    // Run ESLint, optionally with --fix flag
    const command = `npx eslint "src/**/*.{ts,tsx}" ${fix ? '--fix' : ''}`;
    const { stdout, stderr } = await runCommand(command);
    
    if (stdout.trim()) {
      console.log(chalk.yellow('🧠 ESLint warnings:'));
      console.log(stdout);
    } else {
      console.log(chalk.green('🧠 ESLint check passed!'));
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('🧠 ESLint check failed. Fixing linting issues...'));
    
    // If we haven't tried fixing yet, run again with --fix
    if (!fix) {
      console.log(chalk.blue('🧠 Attempting to auto-fix ESLint issues...'));
      return runESLint(true);
    }
    
    // Extract and display the errors
    console.log(chalk.yellow('🧠 ESLint errors to fix manually:'));
    console.log(error.message);
    
    return false;
  }
}

/**
 * Run Prettier to format code
 */
async function runPrettier(fix = false: any): any {
  console.log(chalk.blue(`🧠 NOVAMIND Neural Lint Filter: Running Prettier${fix ? ' with auto-fix' : ''}...`));
  
  try {
    // Run Prettier, optionally with --write flag
    const command = `npx prettier "src/**/*.{ts,tsx}" ${fix ? '--write' : '--check'}`;
    const { stdout, stderr } = await runCommand(command);
    
    console.log(chalk.green('🧠 Prettier check passed!'));
    return true;
  } catch (error) {
    console.error(chalk.red('🧠 Prettier check failed. Fixing formatting issues...'));
    
    // If we haven't tried fixing yet, run again with --write
    if (!fix) {
      console.log(chalk.blue('🧠 Attempting to auto-fix Prettier issues...'));
      return runPrettier(true);
    }
    
    console.log(chalk.yellow('🧠 Prettier errors:'));
    console.log(error.message);
    
    return false;
  }
}

/**
 * Run a specific file through TypeScript type checking
 */
async function checkSpecificFile(filePath: any): any {
  console.log(chalk.blue(`🧠 NOVAMIND Neural Lint Filter: Checking specific file: ${filePath}`));
  
  try {
    // Run tsc on the specific file
    const { stdout, stderr } = await runCommand(`npx tsc --noEmit --skipLibCheck "${filePath}"`);
    
    console.log(chalk.green(`🧠 File check passed: ${filePath}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`🧠 File check failed: ${filePath}`));
    
    // Extract and display the errors
    const errorLines = error.message.split('\n');
    const fileErrors = errorLines
      .filter(line => line.includes('error TS'))
      .slice(0, 20); // Show only the first 20 errors
    
    console.log(chalk.yellow('🧠 Errors in file:'));
    fileErrors.forEach(error => console.log(chalk.yellow(`  ${error}`)));
    
    return false;
  }
}

/**
 * Main function to run the neural lint filter
 */
async function main(): any {
  console.log(chalk.blue('🧠 NOVAMIND Neural Lint Filter: Initializing with quantum precision...'));
  
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    file: null,
    skipTypeCheck: args.includes('--skip-typecheck'),
    skipESLint: args.includes('--skip-eslint'),
    skipPrettier: args.includes('--skip-prettier')
  };
  
  // Check for specific file
  const fileIndex = args.findIndex(arg => arg === '--file');
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    options.file = args[fileIndex + 1];
  }
  
  try {
    // If checking a specific file
    if (options.file) {
      await checkSpecificFile(options.file);
      return;
    }
    
    // Run checks in order of increasing strictness
    let allPassed = true;
    
    if (!options.skipTypeCheck) {
      const permissivePassed = await runPermissiveTypeCheck();
      if (!permissivePassed) {
        console.log(chalk.yellow('🧠 Fix permissive type errors before proceeding to strict checks.'));
        allPassed = false;
        // Continue with other checks regardless
      }
      
      const strictPassed = await runStrictTypeCheck();
      if (!strictPassed) {
        console.log(chalk.yellow('🧠 Fix strict type errors before running tests.'));
        allPassed = false;
      }
    }
    
    if (!options.skipESLint) {
      const eslintPassed = await runESLint(options.fix);
      if (!eslintPassed) {
        console.log(chalk.yellow('🧠 Fix ESLint errors before running tests.'));
        allPassed = false;
      }
    }
    
    if (!options.skipPrettier) {
      const prettierPassed = await runPrettier(options.fix);
      if (!prettierPassed) {
        console.log(chalk.yellow('🧠 Fix Prettier errors before running tests.'));
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log(chalk.green('🧠 NOVAMIND Neural Lint Filter: All checks passed with quantum precision!'));
    } else {
      console.log(chalk.yellow('🧠 NOVAMIND Neural Lint Filter: Some checks failed. Fix errors before running tests.'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`🧠 NOVAMIND Neural Lint Filter Error: ${error.message}`));
    process.exit(1);
  }
}

// Run the main function main(): any;
