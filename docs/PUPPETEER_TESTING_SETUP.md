# Puppeteer Testing Setup for WebGL/R3F Components

## 1. Rationale

Testing components heavily reliant on WebGL, Three.js, and React Three Fiber (R3F) within a JSDOM environment (used by Vitest by default) presents significant challenges:

*   **JSDOM Limitations:** JSDOM does not implement WebGL or accurately simulate browser rendering loops and GPU interactions. This leads to errors like `TypeError: Cannot read properties of undefined...` within React/R3F internals or inaccurate test results.
*   **Mocking Complexity:** Mocking the entire Three.js/R3F ecosystem is complex, brittle, and often incomplete, failing to capture real-world rendering behavior.

**Puppeteer provides a solution** by running tests within a real headless Chrome/Chromium browser instance. This offers:

*   **Full WebGL Support:** Accurate testing of rendering logic.
*   **Realistic Environment:** Tests run in an environment nearly identical to the user's browser.
*   **Integration Testing:** Suitable for testing the integration of components, including visual aspects (though specific visual regression requires additional tools).

**Trade-offs:**

*   **Slower Execution:** Browser startup and rendering add overhead compared to JSDOM.
*   **Setup Complexity:** Requires installing Puppeteer and potentially configuring CI environments.

**Strategy:** Use Puppeteer **selectively** for integration or end-to-end tests focusing on WebGL/R3F components where JSDOM fails. Continue using Vitest with JSDOM for unit/integration tests of non-WebGL components and logic for speed.

## 2. Installation

Add Puppeteer as a dev dependency:

```bash
npm install --save-dev puppeteer
# Or using yarn: yarn add --dev puppeteer
# Or using pnpm: pnpm add --save-dev puppeteer
```
This command downloads Puppeteer and a compatible version of Chromium.

## 3. Basic Test Structure

We will create a dedicated directory for Puppeteer tests, for example, `test-puppeteer/`. Tests can be written as simple Node.js scripts initially or integrated with a test runner like Jest later if needed.

**Example Test (`test-puppeteer/r3f-basic.test.js`):**

```javascript
// test-puppeteer/r3f-basic.test.js
const puppeteer = require('puppeteer');

// Self-executing async function
(async () => {
  let browser;
  try {
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode (no visible browser window)
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for CI environments
    });
    const page = await browser.newPage();

    // Ensure the dev server is running (npm run dev)
    const targetUrl = 'http://localhost:3000'; // Adjust if your dev port is different

    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

    console.log('Checking for canvas element...');
    // Check if a canvas element associated with R3F exists
    const canvasSelector = 'canvas'; // Adjust if a more specific selector is needed
    const canvasElement = await page.$(canvasSelector);

    if (canvasElement) {
      console.log('✅ SUCCESS: Canvas element found.');
      // Add more sophisticated checks here if needed:
      // - Check canvas dimensions
      // - Execute script in browser context to interact with Three.js scene (page.evaluate)
      // - Take screenshots (page.screenshot) for visual inspection
    } else {
      throw new Error(`❌ FAILURE: Canvas element ('${canvasSelector}') not found.`);
    }

    console.log('Test finished successfully.');

  } catch (error) {
    console.error('Puppeteer test failed:', error);
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('Closing Puppeteer...');
      await browser.close();
    }
  }
})();

```

## 4. Running Puppeteer Tests

Add a script to `package.json` to execute the test:

```json
// package.json (scripts section)
"scripts": {
  // ... other scripts
  "test:puppeteer": "node test-puppeteer/r3f-basic.test.js"
}
```

**To run:**

1.  Ensure the development server is running: `npm run dev`
2.  In a separate terminal, run the Puppeteer test: `npm run test:puppeteer`

## 5. Next Steps & Considerations

*   **Test Runner Integration:** For more complex scenarios, integrate Puppeteer with Jest (`jest-puppeteer`) or Vitest (using custom environment or browser mode if available/stable).
*   **CI Setup:** Ensure Chromium is available in the CI environment (e.g., using Docker images with Chrome pre-installed or specific GitHub Actions).
*   **Targeted Tests:** Create specific Puppeteer tests for components/pages known to fail in JSDOM due to WebGL/R3F issues.
*   **Page Object Model:** For larger test suites, consider implementing the Page Object Model pattern for better organization and maintainability.
*   **Visual Regression:** Integrate tools like Percy or Chromatic for automated visual testing if needed.