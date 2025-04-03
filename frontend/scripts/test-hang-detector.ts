/**
 * Test Hang Detector
 * 
 * This script runs tests with enhanced debugging to detect hanging tests by:
 * 1. Setting global timeouts for each test suite
 * 2. Adding detailed logging for test lifecycle events
 * 3. Tracking async operations and promises
 * 4. Monitoring React hooks and state changes
 */

// Import the original runner but intercept its behavior
import { defineConfig } from 'vitest/config';
import { configDefaults } from 'vitest/config';
import { resolve } from 'path';

// Store original hooks
const originalBeforeEach = beforeEach;
const originalAfterEach = afterEach;
const originalDescribe = describe;
const originalIt = it;

// Monkey patch global test functions with instrumentation
(global as any).describe = (name: string, fn: () => void) => {
  return originalDescribe(name, () => {
    console.log(`[HANG-DETECTOR] Starting test suite: ${name}`);
    const startTime = Date.now();
    
    // Set a reasonable timeout for the entire suite
    const timeoutId = setTimeout(() => {
      console.error(`[HANG-DETECTOR] TIMEOUT: Test suite "${name}" has been running for more than 10 seconds`);
      console.error(`[HANG-DETECTOR] This may indicate a hang in the test suite.`);
      // You can't actually force-exit in Vitest from inside a test, but the error will show
    }, 10000); // 10 second timeout
    
    fn();
    
    clearTimeout(timeoutId);
    console.log(`[HANG-DETECTOR] Completed test suite: ${name} in ${Date.now() - startTime}ms`);
  });
};

(global as any).it = (name: string, fn: () => void) => {
  return originalIt(name, () => {
    console.log(`[HANG-DETECTOR] Starting test: ${name}`);
    const startTime = Date.now();
    
    // Monitor promises in this test
    const pendingPromises: Promise<any>[] = [];
    const originalPromise = global.Promise;
    (global as any).Promise = class InstrumentedPromise extends originalPromise {
      constructor(executor: any) {
        const wrappedExecutor = (resolve: Function, reject: Function) => {
          return executor(
            (value: any) => {
              console.log(`[HANG-DETECTOR] Promise resolved in test "${name}"`);
              resolve(value);
            },
            (reason: any) => {
              console.log(`[HANG-DETECTOR] Promise rejected in test "${name}": ${reason}`);
              reject(reason);
            }
          );
        };
        super(wrappedExecutor);
        pendingPromises.push(this);
      }
    };
    
    // Execute test with timeout protection
    const timeoutId = setTimeout(() => {
      console.error(`[HANG-DETECTOR] TIMEOUT: Test "${name}" has been running for more than 5 seconds`);
      console.error(`[HANG-DETECTOR] Pending promises: ${pendingPromises.length}`);
      // We can't actually terminate, but the error will show
    }, 5000); // 5 second timeout
    
    try {
      fn();
    } catch (e) {
      console.error(`[HANG-DETECTOR] Error in test "${name}":`, e);
      throw e;
    } finally {
      clearTimeout(timeoutId);
      (global as any).Promise = originalPromise;
      console.log(`[HANG-DETECTOR] Completed test: ${name} in ${Date.now() - startTime}ms`);
    }
  });
};

// Intercept React's useState to detect potential infinite re-renders 
try {
  const originalReactModule = require('react');
  const originalUseState = originalReactModule.useState;
  
  originalReactModule.useState = function instrumentedUseState<T>(initialState: T | (() => T)) {
    const callStack = new Error().stack;
    const [state, setState] = originalUseState(initialState);
    
    return [
      state,
      (newState: T | ((prev: T) => T)) => {
        console.log(`[HANG-DETECTOR] useState update triggered`);
        return setState(newState);
      }
    ];
  };
} catch (e) {
  console.error(`[HANG-DETECTOR] Failed to instrument React hooks:`, e);
}

// Run specific test with enhanced debugging
export const runWithHangDetection = (testPath: string) => {
  console.log(`[HANG-DETECTOR] Running test with hang detection: ${testPath}`);
  process.env.DEBUG_TEST_HANGS = 'true';
  
  const command = `npx vitest run ${testPath} --timeout 15000 --no-threads`;
  require('child_process').execSync(command, { stdio: 'inherit' });
};

// Command-line interface
if (require.main === module) {
  const testPath = process.argv[2];
  if (!testPath) {
    console.error('[HANG-DETECTOR] Please provide a test file path');
    process.exit(1);
  }
  runWithHangDetection(testPath);
}