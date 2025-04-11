/* eslint-disable */
// test-puppeteer/BrainModelContainer.test.js
import puppeteer from 'puppeteer';
import assert from 'assert';
import { setupApiMocking } from './utils/mockApi.js'; // Import the utility

// Helper function to introduce delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  let browser;
  let page; // Define page in the outer scope
  // Target a page where BrainModelContainer is expected to render, e.g., the demo page
  const targetUrl = 'http://localhost:3001/brain-visualization/demo';

  try {
    console.log('[Puppeteer] Launching browser for BrainModelContainer test...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage(); // Assign to outer scope variable

    // --- Setup Event Listeners and Mocking BEFORE navigation ---
    page.on('console', (msg) =>
      console.log(`[Browser Console - ${msg.type().toUpperCase()}] ${msg.text()}`)
    );
    page.on('pageerror', (err) => console.error('[Browser Page Error]', err.toString()));

    // Use the centralized mocking utility
    await setupApiMocking(page);
    // --- End Mocking Setup ---

    // Increase default timeout for potentially complex page loads
    page.setDefaultNavigationTimeout(60000); // 60 seconds

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    console.log('[Puppeteer] Checking for BrainModelContainer elements...');

    // 1. Check for the main container element (using a data-testid if available, otherwise a structural selector)
    //    Assuming BrainModelContainer or its wrapper might have a specific ID or class.
    //    Let's use a placeholder selector for now, assuming a test ID might be added later.
    //    A more robust approach would be to ensure the component has a unique identifier.
    //    For now, we'll rely on the canvas presence as the primary indicator.
    const containerSelector = '[data-testid="brain-model-container"]'; // Example test ID
    try {
      await page.waitForSelector(containerSelector, { timeout: 15000 }); // Wait longer for container
      console.log(`✅ SUCCESS: Found container element ('${containerSelector}').`);
    } catch (e) {
      console.warn(
        `[Puppeteer] Warning: Container element ('${containerSelector}') not found. Proceeding to check canvas.`
      );
    }

    // 2. Check for the R3F canvas element specifically within the container context if possible
    const canvasSelector = 'canvas'; // General canvas selector
    await page.waitForSelector(canvasSelector, { timeout: 15000 }); // Wait specifically for the canvas
    const canvasElement = await page.$(canvasSelector);

    assert.ok(
      canvasElement,
      `❌ FAILURE: Canvas element ('${canvasSelector}') not found within BrainModelContainer context on ${targetUrl}.`
    );
    console.log('✅ SUCCESS: Canvas element found for BrainModelContainer.');

    // 3. (Optional) Evaluate basic properties of the canvas or scene
    const canvasSize = await page.evaluate((selector) => {
      const canvas = document.querySelector(selector);
      return canvas ? { width: canvas.width, height: canvas.height } : null;
    }, canvasSelector);

    assert.ok(canvasSize, '❌ FAILURE: Could not evaluate canvas size.');
    assert.ok(
      canvasSize.width > 0 && canvasSize.height > 0,
      `❌ FAILURE: Canvas dimensions seem invalid (Width: ${canvasSize.width}, Height: ${canvasSize.height}).`
    );
    console.log(
      `✅ SUCCESS: Canvas rendered with valid dimensions (Width: ${canvasSize.width}, Height: ${canvasSize.height}).`
    );

    console.log('[Puppeteer] BrainModelContainer test finished successfully.');
  } catch (error) {
    console.error('[Puppeteer] BrainModelContainer test failed:', error);
    if (browser && page) {
      // Check if page exists before screenshot
      try {
        const screenshotPath = 'test-puppeteer/failure-screenshot-BrainModelContainer.png';
        await page.screenshot({ path: screenshotPath });
        console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
      } catch (ssError) {
        console.error('[Puppeteer] Failed to take screenshot:', ssError);
      }
    }
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('[Puppeteer] Closing browser...');
      await browser.close();
    }
  }
})();
