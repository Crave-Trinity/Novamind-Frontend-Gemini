/* eslint-disable */
// test-puppeteer/BrainVisualizationPage.test.ts
import puppeteer, { Browser, Page } from 'puppeteer'; // Use ES Module import
import assert from 'assert'; // Use ES Module import for assert
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupApiMocking } from './utils/mockApi.js'; // Import the utility

// Get the directory name equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Self-executing async function
(async (): Promise<void> => {
  let browser: Browser | undefined;
  try {
    console.log('[Puppeteer] Launching browser for BrainVisualizationPage test...');
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode (no visible browser window)
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Common args for CI environments
    });
    let page: Page = await browser.newPage(); // Use let for potential reassignment if needed, though unlikely here

    // Use the static HTML file instead of requiring a dev server
    const targetUrl = `file://${__dirname}/../public/brain-standalone-demo.html`;

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    // --- Setup Event Listeners and Mocking BEFORE navigation ---
    page.on('console', (msg) =>
      console.log(`[Browser Console - ${msg.type().toUpperCase()}] ${msg.text()}`)
    );
    page.on('pageerror', (err) => console.error('[Browser Page Error]', err.toString()));

    // Use the centralized mocking utility
    await setupApiMocking(page);
    // --- End Mocking Setup ---

    await page.goto(targetUrl, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

    console.log('[Puppeteer] Checking for R3F canvas element on BrainVisualizationPage...');
    const canvasSelector = 'canvas'; // Standard selector for the R3F canvas
    // Wait for the canvas to appear after data is loaded and processed
    await page.waitForSelector(canvasSelector, { timeout: 30000 });
    const canvasElement = await page.$(canvasSelector);

    if (canvasElement) {
      console.log('✅ SUCCESS: Canvas element found on BrainVisualizationPage.');
      // Basic assertion
      assert.ok(canvasElement, 'Canvas element should exist');
      // Future Enhancements:
      // - Check canvas dimensions
      // - Execute script in browser context to interact with Three.js scene (page.evaluate)
      // - Take screenshots (page.screenshot) for visual inspection
    } else {
      // Take screenshot on failure for debugging
      const screenshotPath = 'test-puppeteer/failure-screenshot-BrainVisualizationPage.png';
      await page.screenshot({ path: screenshotPath });
      console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
      throw new Error(
        `❌ FAILURE: Canvas element ('${canvasSelector}') not found on ${targetUrl}.`
      );
    }

    console.log('[Puppeteer] BrainVisualizationPage test finished successfully.');
  } catch (error) {
    console.error('[Puppeteer] BrainVisualizationPage test failed:', error);
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('[Puppeteer] Closing browser...');
      await browser.close();
    }
  }
})();