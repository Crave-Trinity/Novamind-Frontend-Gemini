/* eslint-disable */
/* eslint-env node */
import puppeteer, { Browser, Page } from 'puppeteer';
import assert from 'assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupApiMocking } from './utils/mockApi.ts';

// Get the directory name equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async (): Promise<void> => {
  let browser: Browser | undefined;
  let page: Page | undefined;
  const targetUrl = `file://${__dirname}/../public/brain-standalone-demo.html`;

  try {
    console.log('[Puppeteer] Launching browser for BrainModelViewer test...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl'],
    });
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    // Enable console logs to be visible in test output
    page.on('console', (msg) => {
      const type = msg.type().toUpperCase();
      const text = msg.text();
      console.log(`[Browser Console - ${type}] ${text}`);
    });
    page.on('pageerror', (err) => {
      console.error('[Browser Page Error]', err.toString());
    });

    // Set up API mocking before navigating to the page
    await setupApiMocking(page);

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    console.log('[Puppeteer] Page loaded.');

    // Wait for the Three.js canvas to be rendered
    // This ensures the WebGL context is initialized and the scene is ready
    await page.waitForSelector('canvas', { visible: true });
    console.log('[Puppeteer] Canvas found and visible.');

    // Test the rendering of the brain model
    const canvasExists = await page.evaluate(() => {
      return !!document.querySelector('canvas');
    });
    assert.strictEqual(canvasExists, true, '❌ FAILURE: Three.js canvas not found');
    console.log('✅ SUCCESS: Three.js canvas is rendered');

    // Test the controls visibility
    const controlsExist = await page.evaluate(() => {
      return !!document.querySelector('.controls');
    });
    assert.strictEqual(controlsExist, true, '❌ FAILURE: Controls not found');
    console.log('✅ SUCCESS: Controls are visible');

    // Test functional view button click
    console.log('[Puppeteer] Testing Functional View button click...');
    const functionalButtonClicked = await page.evaluate(() => {
      const button = document.querySelector('button#functional');
      if (button) {
        (button as HTMLButtonElement).click();
        return true;
      }
      return false;
    });
    assert.strictEqual(functionalButtonClicked, true, '❌ FAILURE: Could not click Functional View button');
    console.log('✅ SUCCESS: Functional View button clicked');

    // Allow some time for the view to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take a screenshot to verify the functional view
    await page.screenshot({ path: 'test-puppeteer/puppeteer-screenshots/brainmodelviewer-functional.png' });
    console.log('✅ SUCCESS: Functional view screenshot captured');

    // Test connectivity view button click
    console.log('[Puppeteer] Testing Activity View button click...');
    const activityButtonClicked = await page.evaluate(() => {
      const button = document.querySelector('button#activity');
      if (button) {
        (button as HTMLButtonElement).click();
        return true;
      }
      return false;
    });
    assert.strictEqual(activityButtonClicked, true, '❌ FAILURE: Could not click Activity View button');
    console.log('✅ SUCCESS: Activity View button clicked');

    // Allow some time for the view to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take a screenshot to verify the connectivity view
    await page.screenshot({ path: 'test-puppeteer/puppeteer-screenshots/brainmodelviewer-activity.png' });
    console.log('✅ SUCCESS: Activity view screenshot captured');

    console.log('[Puppeteer] BrainModelViewer test completed successfully');
  } catch (error) {
    console.error('[Puppeteer] BrainModelViewer test failed:', error);
    if (browser && page) {
      try {
        const screenshotPath = 'test-puppeteer/puppeteer-screenshots/brainmodelviewer-failure.png';
        await page.screenshot({ path: screenshotPath });
        console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
      } catch (ssError) {
        console.error('[Puppeteer] Failed to take screenshot:', ssError);
      }
    }
    process.exitCode = 1;
  } finally {
    if (browser) {
      console.log('[Puppeteer] Closing browser...');
      await browser.close();
    }
  }
})(); 