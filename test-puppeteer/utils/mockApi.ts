/* eslint-disable */
/* eslint-env node */
// test-puppeteer/utils/mockApi.ts
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Page } from 'puppeteer';

/**
 * Sets up Puppeteer request interception to mock API responses.
 * Currently mocks the DEMO_SCAN_001 brain model endpoint.
 *
 * @param page - The Puppeteer page object.
 * @param mockDataPath - Relative path to the mock data JSON file.
 */
export async function setupApiMocking(
  page: Page,
  mockDataPath = '../../src/test/mocks/api/brainModelDemo.json'
): Promise<void> {
  console.log('[Puppeteer Mock Util] Setting up API request interception...');

  // Resolve the absolute path to the mock data file relative to this utility file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const absoluteMockPath = path.resolve(__dirname, mockDataPath);
  let mockBrainModel: any;

  try {
    const mockDataContent = await fs.readFile(absoluteMockPath, 'utf-8');
    mockBrainModel = JSON.parse(mockDataContent);
    console.log(`[Puppeteer Mock Util] Successfully loaded mock data from: ${absoluteMockPath}`);
  } catch (error) {
    console.error(
      `[Puppeteer Mock Util] Failed to load or parse mock data from ${absoluteMockPath}:`,
      error
    );
    throw new Error(`Could not load mock data for API mocking: ${(error as Error).message}`);
  }

  await page.setRequestInterception(true);

  page.on('request', (interceptedRequest) => {
    const url = interceptedRequest.url();

    // Mock specific API endpoints
    if (url.endsWith('/api/brain-models/DEMO_SCAN_001')) {
      console.log(`[Puppeteer Mock Util] Intercepting and mocking: ${url}`);
      if (mockBrainModel) {
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockBrainModel),
        });
      } else {
        console.error(
          `[Puppeteer Mock Util] Mock data not loaded for ${url}. Responding with error.`
        );
        interceptedRequest.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Mock data unavailable' }),
        });
      }
    }
    // Add other endpoints to mock here using else if blocks
    // else if (url.endsWith('/api/some-other-endpoint')) { ... }
    else {
      // Allow all other requests to pass through
      interceptedRequest.continue();
    }
  });

  console.log('[Puppeteer Mock Util] API request interception setup complete.');
}

// Optional: Add functions to mock other specific endpoints if needed
// export async function mockAnotherEndpoint(page: Page, ...): Promise<void> { ... }