/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * initializeApp testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeApp } from './initializeApp';
import { auditLogClient } from '@infrastructure/clients/auditLogClient';
import { initializeSessionClient } from '@infrastructure/clients/sessionClient';

// Mock the dependencies
vi.mock('@infrastructure/clients/auditLogClient', () => ({
  auditLogClient: {
    log: vi.fn(),
  },
  AuditEventType: {
    SYSTEM_ERROR: 'SYSTEM_ERROR',
  },
}));

vi.mock('@infrastructure/clients/sessionClient', () => ({
  initializeSessionClient: vi.fn(),
}));

describe('initializeApp', () => {
  let windowSpy: any;
  const originalWindow = { ...window };

  beforeEach(() => {
    // Save original window.location
    windowSpy = vi.spyOn(window, 'location', 'get');

    // Mock createElement and appendChild
    global.document = {
      ...global.document,
      createElement: vi.fn(() => ({
        httpEquiv: '',
        content: '',
      })),
      head: {
        appendChild: vi.fn(),
      },
    } as unknown as Document;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks
    windowSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('should initialize the session client with proper configuration', () => {
    // Act
    initializeApp();

    // Assert
    expect(initializeSessionClient).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 15 * 60 * 1000, // 15 minutes
        warningTime: 60 * 1000, // 1 minute warning
        onTimeout: expect.any(Function),
        onWarning: expect.any(Function),
      })
    );
  });

  it('should set up global error handlers', () => {
    // Act
    initializeApp();

    // Get the error handler function
    const errorHandler = window.onerror;

    // Assert that we have an error handler
    expect(errorHandler).toBeDefined();

    if (errorHandler) {
      // Trigger the error handler
      errorHandler('Test error', 'test.js', 1, 1, new Error('Test error'));

      // Verify audit log was called
      expect(auditLogClient.log).toHaveBeenCalledWith(
        'SYSTEM_ERROR',
        expect.objectContaining({
          action: 'global_error',
          errorCode: 'Error',
          result: 'failure',
        })
      );
    }
  });

  it('should set up unhandled promise rejection handler', () => {
    // Act
    initializeApp();

    // Get the promise rejection handler
    const promiseHandler = window.onunhandledrejection;

    // Assert that we have a handler
    expect(promiseHandler).toBeDefined();

    if (promiseHandler) {
      // Create mock rejection event
      const mockEvent = {
        reason: new Error('Promise rejection'),
        preventDefault: () => {},
      } as unknown as PromiseRejectionEvent;

      // Trigger the handler manually instead of direct function call
      const boundHandler = promiseHandler.bind(window);
      boundHandler(mockEvent);

      // Verify audit log was called
      expect(auditLogClient.log).toHaveBeenCalledWith(
        'SYSTEM_ERROR',
        expect.objectContaining({
          action: 'unhandled_rejection',
          errorCode: 'Promise Rejection',
          result: 'failure',
        })
      );
    }
  });

  it('should set up security headers via meta tags', () => {
    // Act
    initializeApp();

    // Assert
    expect(document.createElement).toHaveBeenCalledTimes(2);
    expect(document.head.appendChild).toHaveBeenCalledTimes(2);
  });

  it('should log application initialization', () => {
    // Act
    initializeApp();

    // Assert
    expect(auditLogClient.log).toHaveBeenCalledWith(
      'SYSTEM_ERROR',
      expect.objectContaining({
        action: 'application_init',
        result: 'success',
      })
    );
  });
});
