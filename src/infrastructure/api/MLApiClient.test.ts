/* eslint-disable */
/**
 * Tests for MLApiClient
 * 
 * This verifies that our ML client correctly maps to backend endpoints.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MLApiClient } from './MLApiClient';
import { ApiClient } from './apiClient';

// Mock the ApiClient
vi.mock('./apiClient', () => {
  return {
    ApiClient: vi.fn().mockImplementation(() => ({
      post: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
    })),
    apiClient: {
      post: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
    }
  };
});

describe('MLApiClient', () => {
  let mlClient: MLApiClient;
  let mockApiClient: ApiClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiClient = {
      post: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
    } as unknown as ApiClient;
    
    mlClient = new MLApiClient(mockApiClient);
  });
  
  it('should call the correct endpoint for processText', async () => {
    const mockResponse = { result: 'success', classification: 'positive' };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.processText('test text', 'general', { priority: 'high' });
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/mentalllama/process', {
      text: 'test text',
      model_type: 'general',
      options: { priority: 'high' }
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for detectDepression', async () => {
    const mockResponse = { result: 'success', depression_risk: 'low' };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.detectDepression('test text', { detailed: true });
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/mentalllama/depression', {
      text: 'test text',
      options: { detailed: true }
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for assessRisk', async () => {
    const mockResponse = { result: 'success', risk_level: 'medium' };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.assessRisk('test text', 'suicide', { detailed: true });
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/mentalllama/risk', {
      text: 'test text',
      risk_type: 'suicide',
      options: { detailed: true }
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for createDigitalTwinSession', async () => {
    const mockResponse = { session_id: '12345', status: 'active' };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.createDigitalTwinSession('t-123', 'p-456', 'therapy', { context: 'initial session' });
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/mentalllama/sessions', {
      therapist_id: 't-123',
      patient_id: 'p-456',
      session_type: 'therapy',
      session_params: { context: 'initial session' }
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for sendMessageToSession', async () => {
    const mockResponse = { message_id: '12345', status: 'sent' };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.sendMessageToSession('session-123', 'Hello', 'user-456', 'user', { priority: 'high' });
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/mentalllama/sessions/session-123/messages', {
      session_id: 'session-123',
      message: 'Hello',
      sender_id: 'user-456',
      sender_type: 'user',
      message_params: { priority: 'high' }
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for detectPHI', async () => {
    const mockResponse = { has_phi: true, detected: [{ type: 'name', value: 'John Doe' }] };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.detectPHI('Patient John Doe has arrived', 'strict');
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/phi/detect', {
      text: 'Patient John Doe has arrived',
      detection_level: 'strict'
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for redactPHI', async () => {
    const mockResponse = { redacted: 'Patient [NAME] has arrived', count: 1 };
    (mockApiClient.post as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.redactPHI('Patient John Doe has arrived', '[REDACTED]', 'strict');
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/ml/phi/redact', {
      text: 'Patient John Doe has arrived',
      replacement: '[REDACTED]',
      detection_level: 'strict'
    });
    expect(result).toEqual(mockResponse);
  });
  
  it('should call the correct endpoint for checkMLHealth', async () => {
    const mockResponse = { status: 'healthy', timestamp: '2024-04-12T15:47:00Z' };
    (mockApiClient.get as any).mockResolvedValueOnce(mockResponse);
    
    const result = await mlClient.checkMLHealth();
    
    expect(mockApiClient.get).toHaveBeenCalledWith('/ml/mentalllama/health');
    expect(result).toEqual(mockResponse);
  });
});