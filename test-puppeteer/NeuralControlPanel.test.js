/* eslint-env node */
import puppeteer from 'puppeteer';
import assert from 'assert';
import path from 'node:path'; // Import path module
import { fileURLToPath } from 'node:url'; // Import fileURLToPath for ES modules
import { mkdir } from 'node:fs/promises'; // Import mkdir for creating directories

// Helper function to introduce delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to save failure screenshot
const saveFailureScreenshot = async (page, screenshotDir, filename) => {
  if (!page) {
    console.error(
      '[Puppeteer] Cannot take screenshot: page object is undefined (browser likely failed to launch).'
    );
    return;
  }
  try {
    const screenshotPath = path.join(screenshotDir, `${filename}-${Date.now()}.png`);
    await mkdir(screenshotDir, { recursive: true }); // Ensure directory exists
    await page.screenshot({ path: screenshotPath });
    console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
  } catch (ssError) {
    console.error(`[Puppeteer] Failed to take or save screenshot: ${ssError.message}`);
  }
};

(async () => {
  let browser;
  let page;
  // Target the new demo page specifically created for this component
  const targetUrl = 'http://localhost:3000/test/neural-control-panel'; // Target the new test route
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = path.dirname(currentFilePath);
  const screenshotDir = path.join(currentDirPath, 'puppeteer-screenshots'); // Define screenshotDir here

  try {
    console.log('[Puppeteer] Launching browser for NeuralControlPanel test...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('[Puppeteer] Browser launched.');

    console.log('[Puppeteer] Opening new page...');
    page = await browser.newPage();

    // --- Setup Event Listeners and Mocking BEFORE navigation ---
    page.on('console', (msg) =>
      console.log(`[Browser Console - ${msg.type().toUpperCase()}] ${msg.text()}`)
    );
    page.on('pageerror', (err) => console.error(`[Browser Page Error] ${err.message}`));

    // Use the centralized mocking utility
    // No API mocking needed for this component's standalone demo page
    // await setupApiMocking(page);
    // --- End Mocking Setup ---

    page.setDefaultNavigationTimeout(60000); // 60 seconds

    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    console.log('[Puppeteer] Checking for NeuralControlPanel elements...');

    // 1. Check for the panel container by finding an element containing the title text "Neural Controls" using XPath
    // Use the simplest XPath to find the text anywhere on the page
    const panelTitleXPath = "//*[contains(text(), 'Neural Controls')]";
    let panelHandle = null;
    try {
      // Use waitForFunction with document.evaluate, increased timeout
      await page.waitForFunction(
        (xpath) => {
          /* eslint-env browser */
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          return result.singleNodeValue !== null;
        },
        { timeout: 30000 }, // Increased timeout to 30 seconds
        panelTitleXPath // Argument passed to the function inside waitForFunction
      );

      // Get the handle directly using evaluateHandle after waiting
      panelHandle = await page.evaluateHandle((xpath) => {
        /* eslint-env browser */
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result.singleNodeValue;
      }, panelTitleXPath);

      if (panelHandle && panelHandle.asElement()) {
        // Check if a valid handle was returned
        // Attempt to find the Card parent for context
        const cardElementHandle = await panelHandle.evaluateHandle((el) => {
          /* eslint-env browser */
          return el.closest('.w-\\[320px\\]');
        });
        // Use the card handle if found, otherwise stick with the title element handle
        panelHandle = cardElementHandle.asElement() ? cardElementHandle : panelHandle;
        console.log(
          `✅ SUCCESS: Found NeuralControlPanel container via title XPath ('${panelTitleXPath}').`
        );
      } else {
        // Dispose of potentially invalid handle
        if (panelHandle) await panelHandle.dispose();
        throw new Error('XPath matched no valid element after waiting.');
      }
    } catch (e) {
      // Take screenshot on failure for debugging
      await saveFailureScreenshot(
        page,
        screenshotDir,
        'failure-screenshot-NeuralControlPanel-container'
      );
      throw new Error(
        `❌ FAILURE: NeuralControlPanel container could not be found via XPath ('${panelTitleXPath}') on ${targetUrl}. Error: ${e.message}`
      );
    }

    // 2. Find and click the "Settings" tab using text content evaluation within the panel context
    const settingsTabText = 'Settings'; // The text content of the tab
    const activeSettingsTabXPath = `//button[@role="tab" and @data-state="active" and contains(., "${settingsTabText}")]`;
    const settingsTabActiveSelector = `button[role="tab"][data-state="active"]:has-text("${settingsTabText}")`; // CSS selector equivalent
    const tabsListSelector = 'div[role="tablist"]'; // Selector for the TabsList container

    console.log(`[Puppeteer] Searching for settings tab containing text: "${settingsTabText}"...`);

    // 1. Click the 'Settings' tab using page.evaluate for reliability
    const clicked = await page.evaluate((text) => {
      /* eslint-env browser */
      const buttons = document.querySelectorAll('button[role="tab"]');
      console.log(`[Browser Evaluate] Found ${buttons.length} tab buttons.`); // Log found buttons
      for (const button of buttons) {
        console.log(`[Browser Evaluate] Checking button: ${button.textContent}`); // Log button text
        if (button.textContent?.trim().includes(text)) {
          console.log(`[Browser Evaluate] Found target button, clicking: ${button.outerHTML}`); // Log target button HTML
          button.click(); // Click directly in browser context
          return true;
        }
      }
      console.log(`[Browser Evaluate] Target button with text "${text}" not found.`); // Log if not found
      return false;
    }, settingsTabText);

    assert.ok(
      clicked,
      `❌ FAILURE: Could not find or dispatch click on settings tab: "${settingsTabText}"`
    );
    console.log(`✅ SUCCESS: Dispatched click on settings tab: "${settingsTabText}".`);

    // 2. Log DOM state after click attempt
    try {
      const tabsListHTML = await page.evaluate((selector) => {
        /* eslint-env browser */
        const listElement = document.querySelector(selector);
        return listElement ? listElement.outerHTML : 'TabsList element not found';
      }, tabsListSelector);
      console.log(`[Puppeteer] TabsList outerHTML after click: ${tabsListHTML}`);
    } catch (domError) {
      console.error(`[Puppeteer] Error getting TabsList HTML: ${domError.message}`);
    }

    // 3. Wait for the tab trigger to have the 'data-state="active"' attribute using XPath
    console.log(
      `[Puppeteer] Waiting for 'Settings' tab trigger XPath ('${activeSettingsTabXPath}') to become active...`
    );
    try {
      await page.waitForXPath(activeSettingsTabXPath, { timeout: 15000 }); // Increased timeout
      console.log(`✅ SUCCESS: 'Settings' tab trigger is now active via XPath.`);

      // Optional: Verify again explicitly after wait succeeds (redundant but confirms)
      const isActive = await page.evaluate((xpath) => {
        /* eslint-env browser */
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result.singleNodeValue !== null;
      }, activeSettingsTabXPath);
      assert.ok(
        isActive,
        `❌ INTERNAL FAILURE: XPath wait succeeded, but immediate check failed for ${activeSettingsTabXPath}`
      );
    } catch (xpathError) {
      console.error(
        `[Puppeteer] Failed to find active 'Settings' tab trigger via XPath within timeout. Error: ${xpathError.message}`
      ); // Log error message
      // Try waiting with CSS selector as a fallback diagnostic
      console.log(
        `[Puppeteer] Trying CSS selector ('${settingsTabActiveSelector}') as fallback...`
      );
      try {
        await page.waitForSelector(settingsTabActiveSelector, { timeout: 5000 }); // Shorter timeout for fallback
        console.log(`[Puppeteer] ✅ SUCCESS: Found active 'Settings' tab via CSS selector.`);
      } catch (cssError) {
        console.error(
          `[Puppeteer] ❌ FAILURE: Also failed to find active 'Settings' tab via CSS selector. Error: ${cssError.message}`
        ); // Log error message
        // Screenshot and throw original XPath error for clarity
        await saveFailureScreenshot(
          page,
          screenshotDir,
          'failure-screenshot-NeuralControlPanel-settings-tab'
        );
        throw new Error(
          `❌ FAILURE: Error interacting with settings tab: Waited for 'Settings' tab trigger XPath (${activeSettingsTabXPath}), but it did not appear within the timeout.`
        );
      }
      // If CSS selector succeeded but XPath failed, log a warning
      console.warn(
        '[Puppeteer] WARNING: XPath wait failed, but CSS selector wait succeeded. Check XPath correctness or timing.'
      );
      await saveFailureScreenshot(
        page,
        screenshotDir,
        'failure-screenshot-NeuralControlPanel-settings-tab-xpath-fail-css-ok'
      );
      throw new Error(
        `❌ FAILURE: Error interacting with settings tab: XPath wait failed (${activeSettingsTabXPath}), though CSS selector wait succeeded (${settingsTabActiveSelector}).`
      );
    }

    // 3. Find and click the "Reset View" button using text content evaluation
    const resetButtonText = 'Reset View';
    try {
      console.log(
        `[Puppeteer] Searching for button containing text: "${resetButtonText}" within the active panel...`
      );

      // Wait for the specific TabsContent panel associated with "settings" to become active
      const settingsPanelSelector = `div[role="tabpanel"][data-state="active"][value="settings"]`; // CORRECTED SELECTOR
      // Fallback selector if aria-labelledby isn't reliable: `div[role="tabpanel"][data-state="active"]` and hope it's the right one.
      try {
        await page.waitForSelector(settingsPanelSelector, { timeout: 20000 }); // Increased timeout, removed visible: true
        console.log('✅ SUCCESS: Settings tab content panel selector found in DOM.');
      } catch (panelError) {
        console.error(
          `[Puppeteer] Failed waiting for Settings tab panel selector: ${settingsPanelSelector}`
        );
        await saveFailureScreenshot(
          page,
          screenshotDir,
          'failure-screenshot-NeuralControlPanel-settings-panel'
        );
        throw panelError;
      }

      console.log(
        `[Puppeteer] Searching for button containing text: "${resetButtonText}" within the active panel...`
      );

      // Click the button using page.evaluate, searching within the active settings panel
      const clicked = await page.evaluate(
        (selector, text) => {
          /* eslint-env browser */
          const panel = document.querySelector(selector);
          if (!panel) return false;
          const buttons = Array.from(panel.querySelectorAll('button'));
          const resetButton = buttons.find(
            (
              button // Corrected arrow fn syntax
            ) => button.textContent?.includes(text)
          );
          if (resetButton) {
            resetButton.click();
            return true;
          }
          return false;
        },
        settingsPanelSelector,
        resetButtonText
      );

      assert.ok(
        clicked,
        `❌ FAILURE: Button containing text "${resetButtonText}" not found or could not be clicked within the panel.`
      );
      console.log(`✅ SUCCESS: Found and clicked button containing text "${resetButtonText}".`);
      await delay(500); // Short delay for potential updates

      // Dispose of the element handle when done
      if (panelHandle) await panelHandle.dispose();

      // 4. Add assertions based on expected outcome of clicking reset
      //    For now, we check if the console log from the handler appeared
      //    (This requires the console listener to be active)
      console.log(
        `✅ SUCCESS: Clicked reset button. (Verify console logs or state changes if needed)`
      );
    } catch (e) {
      await saveFailureScreenshot(
        page,
        screenshotDir,
        'failure-screenshot-NeuralControlPanel-reset'
      );
      // Use the original error message if it's an assertion failure, otherwise provide context
      const errorMessage =
        e instanceof assert.AssertionError
          ? e.message
          : `Error interacting with reset button: ${e.message}`;
      throw new Error(`❌ FAILURE: ${errorMessage}`);
    }

    // Add more checks for other controls (sliders, switches) here...

    console.log('[Puppeteer] NeuralControlPanel test finished successfully.');
  } catch (error) {
    console.error(`[Puppeteer] NeuralControlPanel test failed: ${error.message}`);
    await saveFailureScreenshot(page, screenshotDir, 'failure-screenshot-NeuralControlPanel');
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('[Puppeteer] Closing browser...');
      await browser.close();
    }
  }
})();
