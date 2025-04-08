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
    let page = await browser.newPage(); // Use let for potential reassignment if needed, though unlikely here

    // Ensure the dev server is running (npm run dev)
    const targetUrl = 'http://localhost:3000/brain-visualization/demo'; // Target specific page

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    // --- Setup Event Listeners and Mocking BEFORE navigation ---
    page.on('console', msg => console.log(`[Browser Console - ${msg.type().toUpperCase()}] ${msg.text()}`));
    page.on('pageerror', err => console.error('[Browser Page Error]', err.toString()));

    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      if (url.endsWith('/api/brain-models/DEMO_SCAN_001')) {
        console.log(`[Puppeteer Mock] Intercepting: ${url}`);
        const nowISO = new Date().toISOString();
        const mockBrainModel = {
          id: 'DEMO_SCAN_001', patientId: 'DEMO_PATIENT', scan: { id: 'SCAN_123', patientId: 'DEMO_PATIENT', scanDate: nowISO, scanType: 'fMRI', resolution: { x: 1, y: 1, z: 1 }, metadata: { acquisitionTime: 300, sequence: 'EPI' }, dataQualityScore: 0.95 }, timestamp: nowISO, processingLevel: 'analyzed', lastUpdated: nowISO, version: '1.0.0',
          regions: [ { id: 'prefrontal', name: 'Prefrontal Cortex', position: { x: 0, y: 2, z: 0 }, color: '#ff0000', connections: ['pfc-amy', 'pfc-hip'], activityLevel: 0.75, isActive: true, hemisphereLocation: 'left', dataConfidence: 0.9, volume: 100, activity: 0.75 }, { id: 'amygdala', name: 'Amygdala', position: { x: -0.5, y: 0, z: 0 }, color: '#00ff00', connections: ['pfc-amy', 'amy-hip'], activityLevel: 0.9, isActive: true, hemisphereLocation: 'left', dataConfidence: 0.9, volume: 50, activity: 0.9 }, { id: 'hippocampus', name: 'Hippocampus', position: { x: 0.5, y: 0, z: 0 }, color: '#0000ff', connections: ['pfc-hip', 'amy-hip'], activityLevel: 0.6, isActive: true, hemisphereLocation: 'right', dataConfidence: 0.9, volume: 75, activity: 0.6 }, ],
          connections: [ { id: 'pfc-amy', sourceId: 'prefrontal', targetId: 'amygdala', strength: 0.8, type: 'excitatory', directionality: 'unidirectional', dataConfidence: 0.85, activityLevel: 0.8 }, { id: 'pfc-hip', sourceId: 'prefrontal', targetId: 'hippocampus', strength: 0.7, type: 'excitatory', directionality: 'unidirectional', dataConfidence: 0.85, activityLevel: 0.7 }, { id: 'amy-hip', sourceId: 'amygdala', targetId: 'hippocampus', strength: 0.9, type: 'inhibitory', directionality: 'bidirectional', dataConfidence: 0.85, activityLevel: 0.75 }, ],
        };
        interceptedRequest.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(mockBrainModel) });
      } else {
        interceptedRequest.continue();
      }
    });
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