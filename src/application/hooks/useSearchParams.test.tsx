/**
 * NOVAMIND Neural Test Suite
 * useSearchParams testing with quantum precision
 */

import React, { type PropsWithChildren } from 'react'; // Already correct
import { describe, it, expect, vi, type Mock } from 'vitest'; // Already correct
import { renderHook } from '@testing-library/react'; // Removed unused render, screen, fireEvent
import {
  MemoryRouter,
  useSearchParams as useReactRouterSearchParams,
} from 'react-router-dom'; // Keep single import
import { useSearchParams } from '@hooks/useSearchParams'; // Import the custom hook

// Mock react-router-dom hooks
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useLocation: vi.fn(), // Keep useLocation mock if needed, though not directly used by useSearchParams hook itself
    useNavigate: vi.fn(() => vi.fn()), // Mock useNavigate
    useSearchParams: vi.fn(), // Mock the original hook we are wrapping
  };
});

// Define mock outside describe block
const mockSetSearchParams = vi.fn(); // Define mock at the top level

// Helper component to render the hook within MemoryRouter
const HookWrapper: React.FC<PropsWithChildren<{ initialEntries?: string[] }>> = ({
  children,
  initialEntries = ['/'],
}) => {
  // Use explicit return and correct JSX syntax
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
};

describe('useSearchParams', () => {
  // Re-enabled suite
  it('processes data with mathematical precision', () => {
    // Arrange test data
    // Removed unused variable: testData

    // Mock the original useSearchParams return value for this test
    // Mock the original useSearchParams return value for this test
    (useReactRouterSearchParams as Mock).mockReturnValue([
      new URLSearchParams('?q=test&page=1'),
      mockSetSearchParams,
    ]);

    // Act: Render the hook using renderHook with the wrapper
    const { result } = renderHook(() => useSearchParams(), { wrapper: HookWrapper });

    // Assert: Use the custom hook's getParam method
    expect(result.current.getParam('q')).toBe('test');
    expect(result.current.getParam('page')).toBe('1');
    expect(result.current.getParam('nonexistent')).toBeNull();
  });

  it('handles edge cases with clinical precision', () => {
    // Test edge cases
    // Removed unused variable: edgeCaseData

    // Mock the original useSearchParams return value for empty search
    (useReactRouterSearchParams as Mock).mockReturnValue([
      new URLSearchParams(''),
      mockSetSearchParams,
    ]);

    // Act
    const { result: resultEmpty } = renderHook(() => useSearchParams(), { wrapper: HookWrapper });

    // Assert
    expect(resultEmpty.current.getParam('q')).toBeNull();

    // Mock the original useSearchParams return value for search without value
    (useReactRouterSearchParams as Mock).mockReturnValue([
      new URLSearchParams('?flag'),
      mockSetSearchParams,
    ]);

    // Act
    const { result: resultFlag } = renderHook(() => useSearchParams(), { wrapper: HookWrapper });

    // Assert
    expect(resultFlag.current.getParam('flag')).toBe(''); // Should return empty string for flags
  });

  // Add more utility-specific tests
});
