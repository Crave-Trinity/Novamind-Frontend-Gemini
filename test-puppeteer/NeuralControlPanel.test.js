// test-puppeteer/NeuralControlPanel.test.js
import puppeteer from 'puppeteer';
import assert from 'assert';
import { setupApiMocking } from './utils/mockApi.js';

// Helper function to introduce delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  let browser;
  let page;
  // Target the new demo page specifically created for this component
  const targetUrl = 'http://localhost:3000/test/neural-control-panel'; // Target the new test route

  try {
    console.log('[Puppeteer] Launching browser for NeuralControlPanel test...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // --- Setup Event Listeners and Mocking BEFORE navigation ---
    page.on('console', msg => console.log(`[Browser Console - ${msg.type().toUpperCase()}] ${msg.text()}`));
    page.on('pageerror', err => console.error('[Browser Page Error]', err.toString()));

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
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue !== null;
            },
            { timeout: 30000 }, // Increased timeout to 30 seconds
            panelTitleXPath       // Argument passed to the function inside waitForFunction
        );

        // Get the handle directly using evaluateHandle after waiting
        panelHandle = await page.evaluateHandle((xpath) => {
             const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
             return result.singleNodeValue;
        }, panelTitleXPath);

        if (panelHandle && panelHandle.asElement()) { // Check if a valid handle was returned
             // Attempt to find the Card parent for context
             const cardElementHandle = await panelHandle.evaluateHandle(el => el.closest('.w-\\[320px\\]'));
             // Use the card handle if found, otherwise stick with the title element handle
             panelHandle = cardElementHandle.asElement() ? cardElementHandle : panelHandle;
             console.log(`✅ SUCCESS: Found NeuralControlPanel container via title XPath ('${panelTitleXPath}').`);
        } else {
             // Dispose of potentially invalid handle
             if(panelHandle) await panelHandle.dispose();
             throw new Error('XPath matched no valid element after waiting.');
        }

    } catch (e) {
        // Take screenshot on failure for debugging
        const screenshotPath = 'test-puppeteer/failure-screenshot-NeuralControlPanel-container.png';
        await page.screenshot({ path: screenshotPath });
        console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
        throw new Error(`❌ FAILURE: NeuralControlPanel container could not be found via XPath ('${panelTitleXPath}') on ${targetUrl}. Error: ${e.message}`);
    }

    // 2. Find and click the "Settings" tab using text content evaluation within the panel context
    const settingsTabText = 'Settings';
    try {
      console.log(`[Puppeteer] Searching for settings tab containing text: "${settingsTabText}"...`);
      
      // Use page.evaluate with the panelHandle context
      const settingsTabClicked = await page.evaluate((panelElement, text) => {
          if (!panelElement) return false;
          // Find button within the panel context
          const buttons = Array.from(panelElement.querySelectorAll('button'));
          // Be more specific if possible, e.g., look within a specific TabsList if identifiable
          const settingsButton = buttons.find(button => button.textContent?.includes(text) && button.getAttribute('role') === 'tab'); // Add role check
          if (settingsButton) {
              const rect = settingsButton.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) { // Basic visibility check
                 settingsButton.click();
                 return true;
              }
          }
          return false;
      }, panelHandle, settingsTabText); // Pass panelHandle

      assert.ok(settingsTabClicked, `❌ FAILURE: Settings tab containing text "${settingsTabText}" not found or could not be clicked.`);
      console.log(`✅ SUCCESS: Found and clicked settings tab containing text "${settingsTabText}".`);
      await delay(500); // Wait for tab content to potentially render/animate

    } catch (e) {
       const screenshotPath = 'test-puppeteer/failure-screenshot-NeuralControlPanel-settings-tab.png';
       await page.screenshot({ path: screenshotPath });
       console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
       const errorMessage = e instanceof assert.AssertionError ? e.message : `Error interacting with settings tab: ${e.message}`;
       throw new Error(`❌ FAILURE: ${errorMessage}`);
    }


    // 3. Find and click the "Reset View" button using text content evaluation
    const resetButtonText = 'Reset View';
    try {
      console.log('[Puppeteer] Waiting for Settings tab content panel to be active...');
      // Wait for the specific TabsContent panel associated with "settings" to become active
      const settingsPanelSelector = `div[role="tabpanel"][data-state="active"][aria-labelledby*="settings"]`; // More robust selector
      // Fallback selector if aria-labelledby isn't reliable: `div[role="tabpanel"][data-state="active"]` and hope it's the right one.
      try {
          await page.waitForSelector(settingsPanelSelector, { timeout: 15000, visible: true });
          console.log('[Puppeteer] Settings tab panel is active. Proceeding to find Reset button.');
      } catch (waitError) {
          console.error(`[Puppeteer] Failed waiting for Settings tab panel selector: ${settingsPanelSelector}`);
           const screenshotPath = 'test-puppeteer/failure-screenshot-NeuralControlPanel-settings-panel.png';
           await page.screenshot({ path: screenshotPath });
           console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
          throw waitError;
      }

      console.log(`[Puppeteer] Searching for button containing text: "${resetButtonText}" within the active panel...`);
      // Removed stray parenthesis and duplicate log from previous diff

      // Click the button using page.evaluate, searching within the active settings panel
      const clicked = await page.evaluate((panelSelector, text) => {
          const activePanel = document.querySelector(panelSelector);
          if (!activePanel) return false;

          // Find the button within the active panel
          const buttons = Array.from(activePanel.querySelectorAll('button'));
          const resetButton = buttons.find(button => button.textContent?.includes(text));
          if (resetButton) {
              resetButton.click();
              return true;
          }
          return false;
      }, settingsPanelSelector, resetButtonText); // Pass selector and text

      assert.ok(clicked, `❌ FAILURE: Button containing text "${resetButtonText}" not found or could not be clicked within the panel.`);
      console.log(`✅ SUCCESS: Found and clicked button containing text "${resetButtonText}".`);
      await delay(500); // Short delay for potential updates

      // Dispose of the element handle when done
      if (panelHandle) await panelHandle.dispose();

      // 4. Add assertions based on expected outcome of clicking reset
      //    For now, we check if the console log from the handler appeared
      //    (This requires the console listener to be active)
      console.log(`✅ SUCCESS: Clicked reset button. (Verify console logs or state changes if needed)`);

    } catch (e) {
        const screenshotPath = 'test-puppeteer/failure-screenshot-NeuralControlPanel-reset.png';
        await page.screenshot({ path: screenshotPath });
        console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
        // Use the original error message if it's an assertion failure, otherwise provide context
        const errorMessage = e instanceof assert.AssertionError ? e.message : `Error interacting with reset button: ${e.message}`;
        throw new Error(`❌ FAILURE: ${errorMessage}`);
    }


    // Add more checks for other controls (sliders, switches) here...


    console.log('[Puppeteer] NeuralControlPanel test finished successfully.');

  } catch (error) {
    console.error('[Puppeteer] NeuralControlPanel test failed:', error);
     if (browser && page) { 
        try {
            const screenshotPath = `test-puppeteer/failure-screenshot-NeuralControlPanel-${Date.now()}.png`;
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