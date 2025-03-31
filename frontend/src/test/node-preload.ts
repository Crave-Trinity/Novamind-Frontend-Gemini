/**
 * NOVAMIND Testing Framework
 * Node.js Preload Fix (Pure TypeScript and ESM)
 *
 * This file is loaded via Node.js --import flag before any code runs,
 * including Vitest's bootstrapping process.
 */

// Import from Node.js util module
import { TextEncoder as NodeTextEncoder } from "util";

// Fix TextEncoder to ensure it passes instanceof Uint8Array checks
class FixedTextEncoder extends NodeTextEncoder {
  override encode(input?: string): Uint8Array {
    const result = super.encode(input);
    // Ensure result passes instanceof Uint8Array checks
    Object.setPrototypeOf(result, Uint8Array.prototype);
    return result;
  }
}

// Apply TextEncoder fix globally
globalThis.TextEncoder = FixedTextEncoder as any;

// Fix URL constructor to handle edge cases
if (typeof URL !== "undefined") {
  const OriginalURL = URL;

  // Create patched URL class
  class PatchedURL extends OriginalURL {
    constructor(url: string | URL, base?: string | URL) {
      try {
        // Try original constructor first
        super(url, base);
      } catch (error: any) {
        if (error.code === "ERR_INVALID_URL_SCHEME") {
          // If URL has invalid scheme, fix it
          if (
            typeof url === "string" &&
            !url.startsWith("file:") &&
            !url.match(/^[a-z]+:\/\//i)
          ) {
            // Add file:// scheme if missing
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

  // Apply URL patch globally
  globalThis.URL = PatchedURL as any;
}

// Verify fixes were successful
const textEncoderResult = new TextEncoder().encode("") instanceof Uint8Array;
console.log("[node-preload] TextEncoder verification:", textEncoderResult);

export {};
