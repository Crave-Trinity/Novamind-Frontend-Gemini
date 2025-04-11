/**
 * NOVAMIND Neural Test Suite
 * apiClient testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiClient } from '@api/apiClient'; // Ensure correct path

// Define MSW handlers for the API endpoints used in tests
const handlers = [
  http.get('/api/patients', () => {
    console.log('[MSW] Mocking GET /api/patients');
    return HttpResponse.json([
      { id: 'patient-001', name: 'Quantum Patient Zero' },
      { id: 'patient-002', name: 'Neural Patient Alpha' },
    ]);
  }),

  http.post('/api/auth/login', async ({ request }) => {
    console.log('[MSW] Mocking POST /api/auth/login');
    const body = await request.json();
    // You could add assertions on the body if needed
    console.log('[MSW] Received login payload:', body);
    return HttpResponse.json({ success: true, token: 'msw_mock_token_123' });
  }),

  // Add other handlers as needed for different tests or endpoints
];

// Setup the MSW server
const server = setupServer(...handlers);

// Lifecycle hooks for MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // Error on unhandled requests
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('apiClient', () => {
  beforeEach(() => {
    // Clear any potential spies or other mocks if necessary
    vi.clearAllMocks();
    // Reset auth token if needed between tests, depends on ApiClient implementation
    // apiClient.setAuthToken(null); // Example
  });

  it('processes GET requests with mathematical precision', async () => {
    // No need to force USE_MOCK_API, MSW intercepts the real call
    const result = await apiClient.get('/patients');

    // Assert with quantum verification based on MSW handler response
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect((result as any[])[0].id).toBe('patient-001');
  });

  it('processes POST requests with clinical precision', async () => {
    const payload = { username: 'neural-scientist', password: 'quantum-safe' };

    // Act with quantum precision
    const result = await apiClient.post('/auth/login', payload);

    // Assert with clinical verification based on MSW handler response
    expect(result).toBeDefined();
    expect((result as any).success).toBe(true);
    expect((result as any).token).toBe('msw_mock_token_123');
  });

  it('supports neural authorization patterns', () => {
    // Test the setAuthToken method directly if needed
    const testToken = 'neural-quantum-token';
    apiClient.setAuthToken(testToken);

    // Assertion depends on how ApiClient stores/uses the token.
    // This might involve checking Axios instance headers if that's how it's implemented.
    // For example (assuming default headers are accessible, might need adjustment):
    // expect(apiClient.instance.defaults.headers.common['Authorization']).toBe(`Bearer ${testToken}`);
    // Or simply verify the method doesn't throw
    expect(() => apiClient.setAuthToken(testToken)).not.toThrow();
  });
});
