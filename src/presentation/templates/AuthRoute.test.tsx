/**
 * NOVAMIND Neural Test Suite
 * AuthRoute testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'; // Removed unused afterEach
// Removed unused React import
import { screen } from '@testing-library/react'; // Removed unused render
import { renderWithProviders } from '../../test/test-utils.unified';

// Mock react-router-dom components needed by AuthRoute
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual, // Keep actual exports like useLocation
    Navigate: ({ to }: { to: string }) => <div data-testid="mock-navigate">Navigate to {to}</div>,
    Outlet: () => <div data-testid="mock-outlet">Protected Content</div>,
  };
});

// Mock the checkAuthStatus utility function from the NEW utility path
vi.mock('@application/utils/authUtils', () => ({
  checkAuthStatus: vi.fn(), // Mock the specific utility function
}));

// Import the REAL AuthRoute component
import AuthRoute from './AuthRoute';
// Import the MOCKED checkAuthStatus from its NEW path
import { checkAuthStatus } from '@application/utils/authUtils';

describe('AuthRoute', () => {
  // Cast the mocked function for type safety in tests
  const mockedCheckAuthStatus = checkAuthStatus as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    mockedCheckAuthStatus.mockClear();
  });

  it('renders Outlet when authenticated', () => {
    // Arrange: Simulate authenticated state
    mockedCheckAuthStatus.mockReturnValue(true);

    // Act: Use renderWithProviders
    renderWithProviders(<AuthRoute />);

    // Assert: Should render the protected content (Outlet)
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-navigate')).not.toBeInTheDocument();
    expect(mockedCheckAuthStatus).toHaveBeenCalledTimes(1);
  });

  it('renders Navigate to /login when not authenticated', () => {
    // Arrange: Simulate unauthenticated state
    mockedCheckAuthStatus.mockReturnValue(false);

    // Act: Use renderWithProviders
    renderWithProviders(<AuthRoute />);

    // Assert: Should render the Navigate component pointing to /login
    expect(screen.getByTestId('mock-navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-outlet')).not.toBeInTheDocument();
    expect(mockedCheckAuthStatus).toHaveBeenCalledTimes(1);
  });
});
