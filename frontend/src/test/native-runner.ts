/**
 * NOVAMIND Testing Framework
 * Native TypeScript Test Runner
 *
 * This file provides a direct TypeScript test runner that bypasses
 * the problematic transformation pipeline that's causing TextEncoder issues.
 */

import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

// Define TypeScript interfaces for our test runner
interface TestRunnerOptions {
  testPattern: string;
  tsconfig: string;
  verbose: boolean;
}

/**
 * Run TypeScript tests directly using ts-node without transformation
 * that might break the TextEncoder invariant
 */
function runTests(options: TestRunnerOptions): void {
  const { testPattern, tsconfig, verbose } = options;

  console.log("🧠 NOVAMIND Native TypeScript Test Runner");
  console.log("------------------------------------------");
  console.log(`Running tests matching pattern: ${testPattern}`);

  // Find test files
  const testFiles = findTestFiles(testPattern);

  if (testFiles.length === 0) {
    console.error(`No test files found matching pattern: ${testPattern}`);
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test files to run`);

  // Run each test file directly with ts-node
  let passedCount = 0;
  let failedCount = 0;

  for (const testFile of testFiles) {
    console.log(`\nRunning test: ${path.relative(process.cwd(), testFile)}`);

    const result = spawnSync(
      "npx",
      [
        "ts-node",
        "--project",
        tsconfig,
        "--require",
        path.resolve(__dirname, "native-test-setup.ts"),
        testFile,
      ],
      {
        stdio: verbose ? "inherit" : "pipe",
        encoding: "utf-8",
      },
    );

    if (result.status === 0) {
      console.log(`✅ Test passed: ${path.basename(testFile)}`);
      passedCount++;
    } else {
      console.error(`❌ Test failed: ${path.basename(testFile)}`);
      if (!verbose && result.stderr) {
        console.error(result.stderr);
      }
      failedCount++;
    }
  }

  console.log("\n------------------------------------------");
  console.log(`Test Results: ${passedCount} passed, ${failedCount} failed`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

/**
 * Find test files matching the given pattern
 */
function findTestFiles(pattern: string): string[] {
  const files: string[] = [];
  const rootDir = process.cwd();

  // Convert glob pattern to regex
  const regexPattern = new RegExp(
    pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, "."),
  );

  function searchDirectory(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
          searchDirectory(fullPath);
        }
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) &&
        regexPattern.test(fullPath)
      ) {
        files.push(fullPath);
      }
    }
  }

  searchDirectory(rootDir);
  return files;
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const testPattern = args[0] || "src/**/*.test.{ts,tsx}";
  const tsconfig = args[1] || "./tsconfig.json";
  const verbose = args.includes("--verbose");

  runTests({
    testPattern,
    tsconfig,
    verbose,
  });
}

export { runTests };
