// test-puppeteer/BrainVisualizationPage.test.js
import puppeteer from 'puppeteer'; // Use ES Module import
import assert from 'assert'; // Use ES Module import for assert

// Self-executing async function
(async () => {
  let browser;
  try {
    console.log('[Puppeteer] Launching browser for BrainVisualizationPage test...');
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode (no visible browser window)
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for CI environments
    });
    const page = await browser.newPage();

    // Ensure the dev server is running (npm run dev)
    const targetUrl = 'http://localhost:3000/brain-visualization/demo'; // Target specific page

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

    console.log('[Puppeteer] Checking for R3F canvas element on BrainVisualizationPage...');
    const canvasSelector = 'canvas'; // Standard selector for the R3F canvas
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
      throw new Error(`❌ FAILURE: Canvas element ('${canvasSelector}') not found on ${targetUrl}.`);
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