/**
 * NOVAMIND Neural Architecture
 * React Three A11y Mock Implementation with Quantum Precision
 *
 * This implementation creates a neural-safe mock for @react-three/a11y
 * with clinical precision for testing visualization components.
 */

import React from "react";
import { vi } from "vitest";

// A11yAnnouncer mock with neural precision
export const A11yAnnouncer = vi.fn().mockImplementation(({ children }) => {
  return children || null;
});

// A11ySection mock with neural precision
export const A11ySection = vi
  .fn()
  .mockImplementation(({ children, ...props }) => {
    return children || null;
  });

// A11yUserPreferences mock with clinical accuracy
export const A11yUserPreferences = {
  usePreferences: vi.fn().mockReturnValue({
    prefersReducedMotion: false,
    preferredContrast: "normal",
    setPrefersReducedMotion: vi.fn(),
    setPreferredContrast: vi.fn(),
  }),
};

// Provider mock for accessibility context
export const A11yProvider = vi.fn().mockImplementation(({ children }) => {
  return children || null;
});

// A11y hooks with quantum precision
export const useA11y = vi.fn().mockReturnValue({
  focus: vi.fn(),
  announcePolite: vi.fn(),
  announceAssertive: vi.fn(),
  isPressed: false,
  isFocused: false,
});

export const useA11yContext = vi.fn().mockReturnValue({
  debug: false,
  announce: vi.fn(),
  focus: vi.fn(),
});

// Default export for comprehensive mocking
export default {
  A11yAnnouncer,
  A11ySection,
  A11yUserPreferences,
  A11yProvider,
  useA11y,
  useA11yContext,
};
