// test-puppeteer/ThemeProvider.system.test.js
import puppeteer from 'puppeteer';
import assert from 'assert';

(async () => {
  let browser;
  let page; // Define page in the outer scope
  const targetUrl = 'http://localhost:3000'; // Base URL where ThemeProvider is used

  try {
    console.log('[Puppeteer] Launching browser for ThemeProvider system preference test...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage(); // Assign page here
    page.setDefaultNavigationTimeout(60000); // Increase timeout

    // Capture browser console logs and print them to the Node console
    page.on('console', msg => {
        const type = msg.type().toUpperCase();
        const text = msg.text();
        // Filter out less relevant logs if needed
        // if (text.includes('some noise')) return;
        console.log(`[Browser Console - ${type}] ${text}`);
    });
    page.on('pageerror', err => {
        console.error('[Browser Page Error]', err.toString());
    });


    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    console.log('[Puppeteer] Page loaded.');

    // --- Test 1: Reacting to dark mode preference change ---
    console.log('[Puppeteer] Emulating dark mode preference...');
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

    // Verify emulation worked in browser context
    const prefersDark = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
    console.log(`[Puppeteer] Verified prefers-color-scheme: dark in browser context: ${prefersDark}`);
    assert.strictEqual(prefersDark, true, '❌ FAILURE: Emulation of dark mode failed in browser context.');


    console.log('[Puppeteer] Waiting for dark class on HTML element...');
    // Use waitForFunction with increased timeout
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'), { timeout: 15000 });

    console.log('[Puppeteer] Asserting dark mode class is applied...');
    const isDarkModeApplied = await page.$eval('html', el => el.classList.contains('dark'));
    assert.strictEqual(isDarkModeApplied, true, '❌ FAILURE (Test 1): HTML element should have "dark" class after emulating dark preference.');
    console.log('✅ SUCCESS (Test 1): Dark mode class correctly applied after emulation.');

    // --- Test 2: Reacting to light mode preference change ---
    console.log('[Puppeteer] Emulating light mode preference...');
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

     // Verify emulation worked in browser context
    const prefersLight = await page.evaluate(() => !window.matchMedia('(prefers-color-scheme: dark)').matches);
    console.log(`[Puppeteer] Verified prefers-color-scheme: light in browser context: ${prefersLight}`);
    assert.strictEqual(prefersLight, true, '❌ FAILURE: Emulation of light mode failed in browser context.');


    console.log('[Puppeteer] Waiting for dark class removal from HTML element...');
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'), { timeout: 15000 });

    console.log('[Puppeteer] Asserting dark mode class is removed...');
    const isDarkModeStillApplied = await page.$eval('html', el => el.classList.contains('dark'));
    assert.strictEqual(isDarkModeStillApplied, false, '❌ FAILURE (Test 2): HTML element should NOT have "dark" class after emulating light preference.');
    console.log('✅ SUCCESS (Test 2): Dark mode class correctly removed after emulation.');

    console.log('[Puppeteer] ThemeProvider system preference reaction test finished successfully.');

  } catch (error) {
    console.error('[Puppeteer] ThemeProvider system preference test failed:', error);
    if (browser && page) { // Check if page exists before screenshot
        try {
            const screenshotPath = 'test-puppeteer/failure-screenshot-ThemeProvider.system.png';
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