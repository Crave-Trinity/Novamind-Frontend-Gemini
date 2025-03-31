/**
 * NOVAMIND Testing Framework
 * ESM-compatible TypeScript Test Runner
 *
 * This file provides a direct TypeScript test runner that works with
 * ESM modules and bypasses the problematic transformation pipeline.
 */

import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

// Get proper ESM-compatible directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

// Define TypeScript interfaces for our test runner
interface TestRunnerOptions {
  testPattern: string;
  tsconfig: string;
  verbose: boolean;
}

/**
 * Run TypeScript tests directly using Node.js with ESM support
 * to avoid the TextEncoder invariant issue
 */
export async function runTests(options: TestRunnerOptions): Promise<void> {
  const { testPattern, tsconfig, verbose } = options;

  console.log("🧠 NOVAMIND ESM TypeScript Test Runner");
  console.log("------------------------------------------");
  console.log(`Running tests matching pattern: ${testPattern}`);

  // Find test files
  const testFiles = await findTestFiles(testPattern);

  if (testFiles.length === 0) {
    console.error(`No test files found matching pattern: ${testPattern}`);
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test files to run`);

  // Run each test file directly with Node.js ESM
  let passedCount = 0;
  let failedCount = 0;

  for (const testFile of testFiles) {
    console.log(`\nRunning test: ${path.relative(process.cwd(), testFile)}`);

    // Create a temporary ESM wrapper for the test file
    const wrapperFile = await createEsmWrapper(testFile);

    try {
      const result = spawn(
        "node",
        [
          "--experimental-specifier-resolution=node",
          "--loader",
          "ts-node/esm",
          wrapperFile,
        ],
        {
          stdio: verbose ? "inherit" : "pipe",
          env: {
            ...process.env,
            TS_NODE_PROJECT: tsconfig,
          },
        },
      );

      await new Promise<void>((resolve) => {
        result.on("close", (code) => {
          if (code === 0) {
            console.log(`✅ Test passed: ${path.basename(testFile)}`);
            passedCount++;
          } else {
            console.error(`❌ Test failed: ${path.basename(testFile)}`);
            failedCount++;
          }
          resolve();
        });
      });
    } finally {
      // Clean up the temporary wrapper file
      if (fs.existsSync(wrapperFile)) {
        fs.unlinkSync(wrapperFile);
      }
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
async function findTestFiles(pattern: string): Promise<string[]> {
  const files: string[] = [];

  // Convert glob pattern to regex
  const regexPattern = new RegExp(
    pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, "."),
  );

  async function searchDirectory(dir: string): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
          await searchDirectory(fullPath);
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

  await searchDirectory(projectRoot);
  return files;
}

/**
 * Create a temporary ESM wrapper for the test file
 */
async function createEsmWrapper(testFile: string): Promise<string> {
  const wrapperContent = `
import './esm-test-setup.js';
import '${testFile.replace(/\\/g, "/")}';
`;

  const wrapperFile = path.join(
    path.dirname(testFile),
    `__wrapper_${path.basename(testFile)}.mjs`,
  );

  fs.writeFileSync(wrapperFile, wrapperContent);
  return wrapperFile;
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const testPattern = args[0] || "src/**/*.test.{ts,tsx}";
  const tsconfig = args[1] || "./tsconfig.json";
  const verbose = args.includes("--verbose");

  runTests({
    testPattern,
    tsconfig,
    verbose,
  }).catch((error) => {
    console.error("Error running tests:", error);
    process.exit(1);
  });
}
