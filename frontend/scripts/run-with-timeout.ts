/**
 * Run a test command with a global timeout
 * This script addresses hanging test issues by forcing termination after a specified duration
 */

/// <reference types="node" />

import { spawn } from 'child_process';

// Default timeout in milliseconds (3 minutes)
const DEFAULT_TIMEOUT = 3 * 60 * 1000;

// Parse command-line arguments
const args = process.argv.slice(2);
const timeoutFlag = args.findIndex(arg => arg.startsWith('--timeout='));
const timeout = timeoutFlag >= 0
  ? parseInt(args[timeoutFlag].split('=')[1], 10)
  : DEFAULT_TIMEOUT;

// Remove timeout flag from arguments to pass to test command
if (timeoutFlag >= 0) {
  args.splice(timeoutFlag, 1);
}

// Get the test command to run (all remaining arguments)
const command = args.join(' ');

console.log(`Running: ${command}`);
console.log(`With timeout: ${timeout}ms (${timeout / 1000} seconds)`);

// Track if the process completed naturally
let processCompleted = false;

// Function to handle process termination
function terminateProcess(childProcess: ReturnType<typeof spawn>, reason: string): void {
  console.log(`\n\n⚠️ ${reason}`);
  
  try {
    // Kill the process and all its children
    const killSuccess = process.platform === 'win32'
      ? process.kill(childProcess.pid as number, 'SIGTERM')
      : process.kill(-(childProcess.pid as number), 'SIGTERM');
    
    console.log(`Process termination ${killSuccess ? 'successful' : 'failed'}`);
  } catch (error) {
    console.error('Error terminating process:', error);
  }
  
  process.exit(1);
}

// Execute the command
const [cmd, ...cmdArgs] = command.split(' ');
const childProcess = spawn(cmd, cmdArgs, {
  stdio: 'inherit',
  shell: true,
  detached: true // Create a new process group
});

// Set the global timeout
const timeoutId = setTimeout(() => {
  if (!processCompleted) {
    terminateProcess(childProcess, `Test execution timed out after ${timeout / 1000} seconds`);
  }
}, timeout);

// Handle process completion
childProcess.on('close', (code) => {
  processCompleted = true;
  clearTimeout(timeoutId);
  
  if (code !== 0) {
    console.log(`\n❌ Process exited with code ${code}`);
    process.exit(code || 1);
  } else {
    console.log('\n✅ Process completed successfully');
    process.exit(0);
  }
});

// Handle process errors
childProcess.on('error', (err) => {
  processCompleted = true;
  clearTimeout(timeoutId);
  console.error('\n❌ Failed to start test process:', err);
  process.exit(1);
});

// Handle Ctrl+C and other termination signals
process.on('SIGINT', () => {
  processCompleted = true;
  clearTimeout(timeoutId);
  terminateProcess(childProcess, 'Execution interrupted by user');
});

process.on('SIGTERM', () => {
  processCompleted = true;
  clearTimeout(timeoutId);
  terminateProcess(childProcess, 'Execution terminated');
});