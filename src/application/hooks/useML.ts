/* eslint-disable */
import { useState, useCallback } from 'react';
import { mlApiClient } from '../../infrastructure/api/MLApiClient';

/**
 * useML - React hook for accessing ML capabilities
 *
 * This hook provides access to the ML API client with added React state management
 * for tracking loading states and errors.
 */
export function useML() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle API requests with loading and error state management
   */
  const withLoadingState = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Text analysis methods
  const processText = useCallback(
    (text: string, modelType?: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => mlApiClient.processText(text, modelType, options));
    },
    [withLoadingState]
  );

  const detectDepression = useCallback(
    (text: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => mlApiClient.detectDepression(text, options));
    },
    [withLoadingState]
  );

  const assessRisk = useCallback(
    (text: string, riskType?: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => mlApiClient.assessRisk(text, riskType, options));
    },
    [withLoadingState]
  );

  const analyzeSentiment = useCallback(
    (text: string, options?: Record<string, unknown>) => {
      return withLoadingState(() => mlApiClient.analyzeSentiment(text, options));
    },
    [withLoadingState]
  );

  const analyzeWellnessDimensions = useCallback(
    (text: string, dimensions?: string[], options?: Record<string, unknown>) => {
      return withLoadingState(() =>
        mlApiClient.analyzeWellnessDimensions(text, dimensions, options)
      );
    },
    [withLoadingState]
  );

  // Digital twin methods
  const generateDigitalTwin = useCallback(
    (
      patientId: string,
      patientData: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => {
      return withLoadingState(() =>
        mlApiClient.generateDigitalTwin(patientId, patientData, options)
      );
    },
    [withLoadingState]
  );

  const createDigitalTwinSession = useCallback(
    (
      therapistId: string,
      patientId: string,
      sessionType?: string,
      sessionParams?: Record<string, unknown>
    ) => {
      return withLoadingState(() =>
        mlApiClient.createDigitalTwinSession(therapistId, patientId, sessionType, sessionParams)
      );
    },
    [withLoadingState]
  );

  const getDigitalTwinSession = useCallback(
    (sessionId: string) => {
      return withLoadingState(() => mlApiClient.getDigitalTwinSession(sessionId));
    },
    [withLoadingState]
  );

  const sendMessageToSession = useCallback(
    (
      sessionId: string,
      message: string,
      senderId: string,
      senderType?: string,
      messageParams?: Record<string, unknown>
    ) => {
      return withLoadingState(() =>
        mlApiClient.sendMessageToSession(sessionId, message, senderId, senderType, messageParams)
      );
    },
    [withLoadingState]
  );

  const endDigitalTwinSession = useCallback(
    (sessionId: string, endReason?: string) => {
      return withLoadingState(() => mlApiClient.endDigitalTwinSession(sessionId, endReason));
    },
    [withLoadingState]
  );

  const getSessionInsights = useCallback(
    (sessionId: string, insightType?: string) => {
      return withLoadingState(() => mlApiClient.getSessionInsights(sessionId, insightType));
    },
    [withLoadingState]
  );

  // PHI protection methods
  const detectPHI = useCallback(
    (text: string, detectionLevel?: string) => {
      return withLoadingState(() => mlApiClient.detectPHI(text, detectionLevel));
    },
    [withLoadingState]
  );

  const redactPHI = useCallback(
    (text: string, replacement?: string, detectionLevel?: string) => {
      return withLoadingState(() => mlApiClient.redactPHI(text, replacement, detectionLevel));
    },
    [withLoadingState]
  );

  // Health check methods
  const checkMLHealth = useCallback(() => {
    return withLoadingState(() => mlApiClient.checkMLHealth());
  }, [withLoadingState]);

  const checkPHIHealth = useCallback(() => {
    return withLoadingState(() => mlApiClient.checkPHIHealth());
  }, [withLoadingState]);

  return {
    // State
    loading,
    error,
    resetError,

    // Text analysis methods
    processText,
    detectDepression,
    assessRisk,
    analyzeSentiment,
    analyzeWellnessDimensions,

    // Digital twin methods
    generateDigitalTwin,
    createDigitalTwinSession,
    getDigitalTwinSession,
    sendMessageToSession,
    endDigitalTwinSession,
    getSessionInsights,

    // PHI protection methods
    detectPHI,
    redactPHI,

    // Health check methods
    checkMLHealth,
    checkPHIHealth,
  };
}
