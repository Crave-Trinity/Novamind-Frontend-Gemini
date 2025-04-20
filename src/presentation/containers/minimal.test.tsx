/* eslint-disable */
/**
 * NOVAMIND Testing Framework
 * Ultra-minimal test to verify testing infrastructure
 */

import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('confirms test infrastructure is working', () => {
    expect(1 + 1).toBe(2);
  });
});
