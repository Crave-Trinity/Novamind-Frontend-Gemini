import { describe, it, expect } from 'vitest';
import React from 'react'; // Use standard import

describe('Sanity Check', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should confirm imports work', () => {
    // Try importing something simple from React
    expect(typeof React.useState).toBe('function');
  });
});
