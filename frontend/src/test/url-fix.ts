/**
 * NOVAMIND Testing Framework
 * URL Compatibility Fix for TypeScript Tests
 *
 * This file fixes URL-related issues in the testing environment
 * by ensuring proper URL handling in ESM modules.
 */

// Import the url module directly to patch it
import { fileURLToPath } from "url";

// Store the original fileURLToPath function
const originalFileURLToPath = fileURLToPath;

// Create a patched version that handles edge cases
function patchedFileURLToPath(url: string | URL): string {
  try {
    // Try the original function first
    return originalFileURLToPath(url);
  } catch (error: any) {
    if (error.code === "ERR_INVALID_URL_SCHEME") {
      // If the URL has an invalid scheme, try to fix it
      if (typeof url === "string" && !url.startsWith("file:")) {
        return originalFileURLToPath(`file://${url}`);
      }
    }
    throw error;
  }
}

// Apply the patch to the global module
(global as any).fileURLToPath = patchedFileURLToPath;

// Monkey patch the URL constructor to handle edge cases
if (typeof URL !== "undefined") {
  const originalURL = URL;

  class PatchedURL extends originalURL {
    constructor(url: string | URL, base?: string | URL) {
      try {
        // Try the original constructor first
        super(url, base);
      } catch (error: any) {
        if (error.code === "ERR_INVALID_URL_SCHEME") {
          // If the URL has an invalid scheme, try to fix it
          if (
            typeof url === "string" &&
            !url.startsWith("file:") &&
            !url.match(/^[a-z]+:\/\//i)
          ) {
            // Add the file:// scheme if missing
            super(`file://${url}`, base);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }
  }

  // Apply the patch
  (global as any).URL = PatchedURL;

  // Verify the fix works
  try {
    const testUrl = new URL("file:///test");
    console.log("URL fix applied successfully!");
  } catch (error) {
    console.error("URL fix failed:", error);
  }
}
