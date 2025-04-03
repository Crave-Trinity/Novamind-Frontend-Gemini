/**
 * NOVAMIND Test Infrastructure
 * Mock Registration Setup
 * 
 * This file handles the setup of mocks for vitest.
 * It should be imported in setup.ts to register mocks properly.
 */

import { vi } from 'vitest';
import { mockClinicalService } from './clinical-service.mock';

// Register module mocks
export function setupMocks() {
  // Mock clinicalService
  vi.mock('@application/services/clinicalService', () => ({
    clinicalService: mockClinicalService,
  }));

  // Add any additional module mocks here

  console.log("[mock-setup.ts] All mocks registered successfully");
}

// Clean up function to be called in teardown
export function cleanupMocks() {
  vi.resetAllMocks();
  console.log("[mock-setup.ts] All mocks reset");
}