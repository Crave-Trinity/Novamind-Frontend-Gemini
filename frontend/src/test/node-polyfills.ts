/**
 * NOVAMIND Testing Framework
 * Node.js Polyfills for Browser APIs
 *
 * This file provides polyfills for browser APIs that are not available in Node.js
 * but are required for testing browser-based components.
 */

import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from "util";

// Create proper TextEncoder implementation that passes instanceof checks
class FixedTextEncoder extends NodeTextEncoder {
  constructor() {
    super();
  }

  override encode(input?: string): Uint8Array {
    const result = super.encode(input);
    // Ensure the result passes instanceof Uint8Array checks
    Object.setPrototypeOf(result, Uint8Array.prototype);
    return result;
  }
}

// Create proper TextDecoder implementation
class FixedTextDecoder extends NodeTextDecoder {
  constructor(encoding?: string, options?: TextDecoderOptions) {
    super(encoding, options);
  }

  override decode(
    input?: ArrayBuffer | NodeJS.ArrayBufferView | null,
    options?: { stream?: boolean },
  ): string {
    return super.decode(input, options);
  }
}

// Replace global TextEncoder and TextDecoder with our fixed versions
if (
  typeof global.TextEncoder === "undefined" ||
  !(new global.TextEncoder().encode("") instanceof Uint8Array)
) {
  (global as any).TextEncoder = FixedTextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  (global as any).TextDecoder = FixedTextDecoder;
}

// Verify that our TextEncoder implementation works correctly
const testEncoder = new TextEncoder();
const testResult = testEncoder.encode("");
if (!(testResult instanceof Uint8Array)) {
  console.error(
    "TextEncoder polyfill failed: encode() result is not instanceof Uint8Array",
  );
  console.error("Result type:", Object.prototype.toString.call(testResult));
  console.error("Result prototype chain:", Object.getPrototypeOf(testResult));
  throw new Error("TextEncoder polyfill failed");
}

// Mock browser-specific APIs that might be missing
if (typeof global.fetch === "undefined") {
  global.fetch = (() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob([])),
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Map(),
    })) as any;
}

// Mock requestAnimationFrame and cancelAnimationFrame
// if (typeof global.requestAnimationFrame === "undefined") {
//   global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
//     // Using setTimeout(..., 0) can sometimes cause issues in test environments
//     return setTimeout(() => callback(Date.now()), 0) as unknown as number;
//   };
// }
//
// if (typeof global.cancelAnimationFrame === "undefined") {
//   global.cancelAnimationFrame = (handle: number): void => {
//     clearTimeout(handle);
//   };
// }

// Export a dummy function to make TypeScript happy
export const setupNodePolyfills = (): void => {
  // This function is intentionally empty
  // The polyfills are applied when this module is imported

  // Additional verification
  console.log("Node polyfills initialized");
  console.log(
    "TextEncoder available:",
    typeof global.TextEncoder !== "undefined",
  );
  console.log(
    "TextEncoder.encode() instanceof Uint8Array:",
    new TextEncoder().encode("") instanceof Uint8Array,
  );
};
