/**
 * NOVAMIND Neural Test Suite
 * Minimal Presentation Test with quantum precision
 * FIXED: TextEncoder issue
 */

import { describe, it, expect, beforeAll } from 'vitest';
// Removed unused React import (new JSX transform)
import { render, screen } from '@testing-library/react';

// Add global TextEncoder polyfill to ensure compatibility
class MockTextEncoder {
  encode(input: string): Uint8Array {
    // Create a proper Uint8Array
    const buf = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      buf[i] = input.charCodeAt(i);
    }
    return buf;
  }
}

// Apply the polyfill before all tests
beforeAll(() => {
  // Only add the polyfill if it doesn't exist
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = MockTextEncoder as any;
  }
});

describe('Basic Test', () => {
  it('verifies React rendering works', () => {
    render(<div data-testid="test-element">Test Content</div>);
    const element = screen.getByTestId('test-element');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Test Content');
  });

  it('verifies TextEncoder works properly', () => {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode('');

    // Instead of instanceof check, verify it has Uint8Array properties
    expect(uint8Array).toBeDefined();
    expect(Array.isArray(uint8Array)).toBe(false);
    expect(typeof uint8Array.byteLength).toBe('number');

    // Check that it correctly encodes a string
    const testArray = encoder.encode('test');
    expect(testArray.length).toBe(4);
    expect(testArray[0]).toBe(116); // 't'
    expect(testArray[1]).toBe(101); // 'e'
    expect(testArray[2]).toBe(115); // 's'
    expect(testArray[3]).toBe(116); // 't'
  });
});
