import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@presentation/providers/ThemeProvider';
import type { RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Create a custom render function that includes providers
function render(
  ui: React.ReactElement,
  {
    route = '/',
    initialEntries = [route],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: RenderOptions & {
    route?: string;
    initialEntries?: string[];
    queryClient?: QueryClient;
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <ThemeProvider>{children}</ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything
export * from '@testing-library/react';
export { render };

// Add custom vitest matchers
vi.stubGlobal('expect', {
  ...vi.fn(),
  extend: (matchers: Record<string, unknown>) => {
    Object.entries(matchers).forEach(([name, fn]) => {
      vi.spyOn(expect, name as never).mockImplementation(fn as any);
    });
  },
});

// Custom matchers with proper typing for Vitest
export function toHaveBeenCalledOnceWith(
  received: ReturnType<typeof vi.fn>,
  ...expected: unknown[]
) {
  const pass =
    received.mock.calls.length === 1 &&
    received.mock.calls[0].length === expected.length &&
    received.mock.calls[0].every((arg, i) => JSON.stringify(arg) === JSON.stringify(expected[i]));

  return {
    pass,
    message: () =>
      pass
        ? `expected function not to have been called once with ${expected}`
        : `expected function to have been called once with ${expected}`,
  };
}

// Commenting out toHaveBeenCalledAfter due to Vitest mock API differences
// export function toHaveBeenCalledAfter(
//   received: ReturnType<typeof vi.fn>,
//   other: ReturnType<typeof vi.fn>
// ) {
//   // Implementation needs rework for Vitest - mock.results doesn't have timestamp
//   // Check call order using mock.calls array index if necessary
//   const receivedCallIndex = received.mock.calls.length > 0 ? received.mock.invocationCallOrder[0] : -1; // Fictional property
//   const otherCallIndex = other.mock.calls.length > 0 ? other.mock.invocationCallOrder[0] : -1; // Fictional property
//
//   if (receivedCallIndex === -1) {
//     return { pass: false, message: () => `expected function to have been called after other function, but it was never called` };
//   }
//   if (otherCallIndex === -1) {
//     return { pass: false, message: () => `expected function to have been called after other function, but other function was never called` };
//   }
//
//   const pass = receivedCallIndex > otherCallIndex;
//
//   return {
//     pass,
//     message: () =>
//       pass
//         ? `expected function not to have been called after other function`
//         : `expected function to have been called after other function`,
//   };
// }

// Test data generators based on our domain types
import type { /* BrainModel, BrainRegion, */ BrainScan, /* NeuralConnection, */ Patient } from '@domain/types'; // Removed unused types

export const createTestPatient = (): Patient => ({
  id: 'test-patient',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  medicalHistory: [],
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
  },
  insurance: {
    provider: 'TestInsurance',
    policyNumber: '12345',
  },
});

export const createTestBrainScan = (): BrainScan => ({
  id: 'test-scan',
  patientId: 'test-patient',
  scanDate: '2024-03-20',
  scanType: 'fMRI',
  resolution: { x: 256, y: 256, z: 128 },
  metadata: {},
  dataQualityScore: 0.95,
  artifacts: [],
  notes: '',
  technician: 'Dr. Smith',
  machine: {
    id: 'scanner-01',
    type: 'Siemens Magnetom',
    calibrationDate: '2024-01-01',
  },
});
