/**
 * NOVAMIND Testing Framework
 * TextEncoder Compatibility Fix for TypeScript Tests
 *
 * This file provides a proper TypeScript implementation to fix the
 * TextEncoder instanceof Uint8Array issue with esbuild.
 */

import { TextEncoder as NodeTextEncoder } from 'util';

/**
 * Fixed TextEncoder implementation that ensures encode() returns
 * a proper Uint8Array that passes the instanceof check.
 */
class FixedTextEncoder extends NodeTextEncoder {
  override encode(input?: string): Uint8Array {
    const result = super.encode(input);
    // Ensure the result passes instanceof Uint8Array checks
    Object.setPrototypeOf(result, Uint8Array.prototype);
    return result;
  }
}

// Apply the fix globally
if (
  typeof globalThis.TextEncoder === 'undefined' ||
  !(new globalThis.TextEncoder().encode('') instanceof Uint8Array)
) {
  globalThis.TextEncoder = FixedTextEncoder as any;
}
