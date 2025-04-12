/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { EnhancedApiProxyService } from './ApiProxyService.enhanced';

describe('EnhancedApiProxyService', () => {
  // Spy on console methods to verify logging
  const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapPath', () => {
    it('should handle digital twin paths correctly', () => {
      expect(EnhancedApiProxyService.mapPath('ml/digital-twin/conversation')).toBe('ml/mentalllama/conversation');
      expect(EnhancedApiProxyService.mapPath('/ml/digital-twin/sessions')).toBe('ml/mentalllama/sessions');
      expect(EnhancedApiProxyService.mapPath('v1/ml/digital-twin/insights')).toBe('ml/mentalllama/insights');
    });

    it('should handle PHI paths correctly', () => {
      expect(EnhancedApiProxyService.mapPath('ml/phi/detect')).toBe('ml/phi/detect');
      expect(EnhancedApiProxyService.mapPath('/ml/phi/redact')).toBe('ml/phi/redact');
    });

    it('should handle general ML paths correctly', () => {
      expect(EnhancedApiProxyService.mapPath('ml/process')).toBe('ml/process');
      expect(EnhancedApiProxyService.mapPath('/ml/depression-detection')).toBe('ml/depression-detection');
    });

    it('should handle brain model paths correctly', () => {
      expect(EnhancedApiProxyService.mapPath('brain-models/123')).toBe('ml/brain/brain-models/123');
      expect(EnhancedApiProxyService.mapPath('/brain-models/123/regions')).toBe('ml/brain/brain-models/123/regions');
    });

    it('should handle patient paths correctly', () => {
      expect(EnhancedApiProxyService.mapPath('patients/123')).toBe('ml/patients/123');
      expect(EnhancedApiProxyService.mapPath('patients/456/risk-assessment')).toBe('xgboost/predict-risk/456');
      expect(EnhancedApiProxyService.mapPath('patients/789/predict-treatment')).toBe('xgboost/predict-treatment-response');
    });

    it('should handle auth paths correctly', () => {
      expect(EnhancedApiProxyService.mapPath('auth/login')).toBe('auth/login');
      expect(EnhancedApiProxyService.mapPath('/auth/refresh')).toBe('auth/refresh');
    });

    it('should log path mapping when requested', () => {
      EnhancedApiProxyService.mapPath('ml/digital-twin/conversation', true);
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mapped path: ml/digital-twin/conversation → ml/mentalllama/conversation')
      );
    });
  });

  describe('validateRequest', () => {
    it('should validate treatment prediction requests', () => {
      // Valid request
      const validRequest = { patientId: '123', treatmentType: 'cbt' };
      expect(EnhancedApiProxyService.validateRequest('patients/123/predict-treatment', validRequest).isValid).toBe(true);

      // Invalid - missing patientId
      const missingPatient = { treatmentType: 'cbt' };
      const result1 = EnhancedApiProxyService.validateRequest('patients/123/predict-treatment', missingPatient);
      expect(result1.isValid).toBe(false);
      expect(result1.errors[0].field).toBe('patientId');

      // Invalid - missing treatmentType
      const missingTreatment = { patientId: '123' };
      const result2 = EnhancedApiProxyService.validateRequest('patients/123/predict-treatment', missingTreatment);
      expect(result2.isValid).toBe(false);
      expect(result2.errors[0].field).toBe('treatmentType');
    });

    it('should validate digital twin conversation requests', () => {
      // Valid request
      const validRequest = { sessionId: '123', message: 'Hello', senderId: '456' };
      expect(EnhancedApiProxyService.validateRequest('ml/digital-twin/conversation', validRequest).isValid).toBe(true);

      // Invalid - missing sessionId
      const missingSession = { message: 'Hello', senderId: '456' };
      const result = EnhancedApiProxyService.validateRequest('ml/digital-twin/conversation', missingSession);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('sessionId');
    });

    it('should validate login requests', () => {
      // Valid request
      const validRequest = { email: 'user@example.com', password: 'secret' };
      expect(EnhancedApiProxyService.validateRequest('auth/login', validRequest).isValid).toBe(true);

      // Invalid - missing email
      const missingEmail = { password: 'secret' };
      const result = EnhancedApiProxyService.validateRequest('auth/login', missingEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('email');
    });

    it('should skip validation for null/undefined data', () => {
      expect(EnhancedApiProxyService.validateRequest('any/path', null).isValid).toBe(true);
      expect(EnhancedApiProxyService.validateRequest('any/path', undefined).isValid).toBe(true);
    });
  });

  describe('mapRequestData', () => {
    it('should transform treatment prediction data correctly', () => {
      const input = { 
        patientId: '123', 
        treatmentType: 'cbt', 
        details: { duration: '6 weeks' }, 
        factors: { age: 35 } 
      };
      
      const expected = {
        patient_id: '123',
        treatment_type: 'cbt',
        treatment_details: { duration: '6 weeks' },
        contextual_factors: { age: 35 }
      };
      
      expect(EnhancedApiProxyService.mapRequestData('patients/123/predict-treatment', input)).toEqual(expected);
    });

    it('should transform digital twin conversation data correctly', () => {
      const input = { 
        sessionId: '123', 
        message: 'Hello', 
        senderId: '456' 
      };
      
      const expected = {
        session_id: '123',
        message: 'Hello',
        sender_id: '456',
        sender_type: 'user'
      };
      
      expect(EnhancedApiProxyService.mapRequestData('ml/digital-twin/conversation', input)).toEqual(expected);
    });

    it('should respect default sender_type but allow override', () => {
      const input = { 
        sessionId: '123', 
        message: 'Hello', 
        senderId: '456',
        senderType: 'therapist'
      };
      
      const expected = {
        session_id: '123',
        message: 'Hello',
        sender_id: '456',
        sender_type: 'therapist'
      };
      
      expect(EnhancedApiProxyService.mapRequestData('ml/digital-twin/conversation', input)).toEqual(expected);
    });

    it('should transform login data correctly', () => {
      const input = { 
        email: 'user@example.com', 
        password: 'secret' 
      };
      
      const expected = {
        email_address: 'user@example.com',
        password: 'secret'
      };
      
      expect(EnhancedApiProxyService.mapRequestData('auth/login', input)).toEqual(expected);
    });

    it('should transform PHI detection data correctly', () => {
      const input = { 
        text: 'Sample text with PHI content',
        detectionLevel: 'moderate'
      };
      
      const expected = {
        text_content: 'Sample text with PHI content',
        detection_level: 'moderate'
      };
      
      expect(EnhancedApiProxyService.mapRequestData('ml/phi/detect', input)).toEqual(expected);
    });

    it('should use default detection_level if not provided', () => {
      const input = { 
        text: 'Sample text with PHI content'
      };
      
      const expected = {
        text_content: 'Sample text with PHI content',
        detection_level: 'strict'
      };
      
      expect(EnhancedApiProxyService.mapRequestData('ml/phi/detect', input)).toEqual(expected);
    });

    it('should convert camelCase to snake_case for other endpoints', () => {
      const input = { 
        userId: '123', 
        firstName: 'John', 
        lastName: 'Doe',
        addressInfo: {
          streetAddress: '123 Main St',
          zipCode: '12345'
        }
      };
      
      const output = EnhancedApiProxyService.mapRequestData('custom/endpoint', input);
      
      expect(output.user_id).toBe('123');
      expect(output.first_name).toBe('John');
      expect(output.last_name).toBe('Doe');
      expect(output.address_info.street_address).toBe('123 Main St');
      expect(output.address_info.zip_code).toBe('12345');
    });

    it('should log validation warnings but proceed with transformation', () => {
      const invalidInput = { treatmentType: 'cbt' }; // Missing patientId
      
      EnhancedApiProxyService.mapRequestData('patients/123/predict-treatment', invalidInput);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request validation failed'),
        expect.arrayContaining([expect.objectContaining({ field: 'patientId' })])
      );
    });

    it('should handle transformation errors gracefully', () => {
      // Create a scenario that would cause an error in transformation
      const problematicInput = Object.create(null);
      Object.defineProperty(problematicInput, 'patientId', { 
        get: () => { throw new Error('Simulated error'); }
      });
      
      // Should log error but return original data
      const result = EnhancedApiProxyService.mapRequestData('patients/123/predict-treatment', problematicInput);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error transforming request data'),
        expect.any(Error)
      );
      expect(result).toBe(problematicInput);
    });
  });

  describe('mapResponseData', () => {
    it('should transform risk assessment response correctly', () => {
      const input = { 
        risk_level: 'medium', 
        risk_factors: ['factor1', 'factor2'],
        confidence_score: 0.85
      };
      
      const output = EnhancedApiProxyService.mapResponseData('patients/123/risk-assessment', input);
      
      expect(output.riskLevel).toBe('medium');
      expect(output.riskFactors).toEqual(['factor1', 'factor2']);
      expect(output.confidenceScore).toBe(0.85);
      expect(output.timestamp).toBeDefined(); // Should add timestamp
    });

    it('should handle missing fields in risk assessment', () => {
      const input = { 
        risk_level: 'low'
        // Missing risk_factors and confidence_score
      };
      
      const output = EnhancedApiProxyService.mapResponseData('patients/123/risk-assessment', input);
      
      expect(output.riskLevel).toBe('low');
      expect(output.riskFactors).toEqual([]);
      expect(output.confidenceScore).toBe(0.0);
    });

    it('should transform session data correctly', () => {
      const input = { 
        session_id: '123',
        messages: [
          { message_id: 'm1', content: 'Hello', sender_type: 'user', timestamp: '2023-01-01T12:00:00Z' }
        ],
        status: 'active',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T12:05:00Z'
      };
      
      const output = EnhancedApiProxyService.mapResponseData('ml/mentalllama/sessions/123', input);
      
      expect(output.id).toBe('123');
      expect(output.messages[0].id).toBe('m1');
      expect(output.messages[0].sender).toBe('user');
      expect(output.status).toBe('active');
      expect(output.createdAt).toBe('2023-01-01T10:00:00Z');
    });

    it('should handle empty messages array in session data', () => {
      const input = { 
        session_id: '123',
        status: 'new',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z'
        // Missing messages
      };
      
      const output = EnhancedApiProxyService.mapResponseData('ml/mentalllama/sessions/123', input);
      
      expect(output.id).toBe('123');
      expect(output.messages).toEqual([]);
    });

    it('should transform user data correctly', () => {
      const input = { 
        user_id: '123',
        username: 'johndoe',
        email_address: 'john@example.com',
        role: 'clinician',
        permissions: ['read:patients', 'write:notes']
      };
      
      const output = EnhancedApiProxyService.mapResponseData('auth/me', input);
      
      expect(output.id).toBe('123');
      expect(output.username).toBe('johndoe');
      expect(output.email).toBe('john@example.com');
      expect(output.role).toBe('clinician');
      expect(output.permissions).toEqual(['read:patients', 'write:notes']);
    });

    it('should handle both email_address and email fields in user data', () => {
      const input = { 
        user_id: '123',
        username: 'janedoe',
        email: 'jane@example.com', // Using email instead of email_address
        role: 'researcher'
      };
      
      const output = EnhancedApiProxyService.mapResponseData('auth/me', input);
      
      expect(output.id).toBe('123');
      expect(output.email).toBe('jane@example.com');
    });

    it('should convert snake_case to camelCase for brain models', () => {
      const input = { 
        model_id: 'model123',
        patient_id: 'patient456',
        model_type: 'functional',
        created_at: '2023-01-01T10:00:00Z',
        brain_regions: [
          { region_id: 'r1', region_name: 'prefrontal cortex' }
        ]
      };
      
      const output = EnhancedApiProxyService.mapResponseData('brain-models/model123', input);
      
      expect(output.modelId).toBe('model123');
      expect(output.patientId).toBe('patient456');
      expect(output.modelType).toBe('functional');
      expect(output.brainRegions[0].regionId).toBe('r1');
      expect(output.brainRegions[0].regionName).toBe('prefrontal cortex');
    });

    it('should convert general snake_case to camelCase for unknown endpoints', () => {
      const input = { 
        some_id: '123',
        nested_object: {
          sub_property: 'value',
          another_property: 42
        },
        array_items: [
          { item_id: 1, item_name: 'First' },
          { item_id: 2, item_name: 'Second' }
        ]
      };
      
      const output = EnhancedApiProxyService.mapResponseData('custom/endpoint', input);
      
      expect(output.someId).toBe('123');
      expect(output.nestedObject.subProperty).toBe('value');
      expect(output.nestedObject.anotherProperty).toBe(42);
      expect(output.arrayItems[0].itemId).toBe(1);
      expect(output.arrayItems[1].itemName).toBe('Second');
    });

    it('should handle transformation errors gracefully', () => {
      // Create a scenario that would cause an error in transformation
      const problematicInput = Object.create(null);
      Object.defineProperty(problematicInput, 'risk_level', { 
        get: () => { throw new Error('Simulated error'); }
      });
      
      // Should log error but return original data
      const result = EnhancedApiProxyService.mapResponseData('patients/123/risk-assessment', problematicInput);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error transforming response data'),
        expect.any(Error)
      );
      expect(result).toBe(problematicInput);
    });
  });

  describe('standardizeResponse', () => {
    it('should wrap data in ApiResponse format if not already', () => {
      const data = { id: '123', name: 'Test' };
      const response = EnhancedApiProxyService.standardizeResponse(data);
      
      expect(response).toEqual({ data });
    });

    it('should not modify existing ApiResponse format', () => {
      const existingResponse = { 
        data: { id: '123', name: 'Test' },
        meta: { total: 1 }
      };
      const response = EnhancedApiProxyService.standardizeResponse(existingResponse);
      
      expect(response).toEqual(existingResponse);
    });

    it('should normalize error responses', () => {
      const errorData = { 
        errorCode: 'VALIDATION_ERROR', 
        message: 'Invalid input' 
      };
      const response = EnhancedApiProxyService.standardizeResponse(errorData);
      
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(response.error?.message).toBe('Invalid input');
    });

    it('should handle transformation errors', () => {
      // Create an object that will throw when accessed
      const problematicData = Object.create(null);
      Object.defineProperty(problematicData, 'data', { 
        get: () => { throw new Error('Simulated error'); }
      });
      
      const response = EnhancedApiProxyService.standardizeResponse(problematicData);
      
      expect(response.error?.code).toBe('TRANSFORMATION_ERROR');
      expect(response.error?.message).toBe('Error processing API response');
      expect(response.error?.details).toHaveProperty('errorMessage');
    });
  });

  describe('convertToCamelOrSnakeCase', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = { 
        userId: '123', 
        firstName: 'John',
        userProfile: {
          emailAddress: 'john@example.com',
          phoneNumber: '555-1234'
        }
      };
      
      const output = EnhancedApiProxyService.convertToCamelOrSnakeCase(input, 'snake_case');
      
      expect(output.user_id).toBe('123');
      expect(output.first_name).toBe('John');
      expect(output.user_profile.email_address).toBe('john@example.com');
      expect(output.user_profile.phone_number).toBe('555-1234');
    });

    it('should convert object keys from snake_case to camelCase', () => {
      const input = { 
        user_id: '123', 
        first_name: 'John',
        user_profile: {
          email_address: 'john@example.com',
          phone_number: '555-1234'
        }
      };
      
      const output = EnhancedApiProxyService.convertToCamelOrSnakeCase(input, 'camelCase');
      
      expect(output.userId).toBe('123');
      expect(output.firstName).toBe('John');
      expect(output.userProfile.emailAddress).toBe('john@example.com');
      expect(output.userProfile.phoneNumber).toBe('555-1234');
    });

    it('should handle arrays of objects correctly', () => {
      const input = {
        items: [
          { item_id: 1, item_name: 'First' },
          { item_id: 2, item_name: 'Second' }
        ]
      };
      
      const output = EnhancedApiProxyService.convertToCamelOrSnakeCase(input, 'camelCase');
      
      expect(output.items[0].itemId).toBe(1);
      expect(output.items[0].itemName).toBe('First');
      expect(output.items[1].itemId).toBe(2);
      expect(output.items[1].itemName).toBe('Second');
    });

    it('should handle primitive values correctly', () => {
      expect(EnhancedApiProxyService.convertToCamelOrSnakeCase(123, 'camelCase')).toBe(123);
      expect(EnhancedApiProxyService.convertToCamelOrSnakeCase('test', 'snake_case')).toBe('test');
      expect(EnhancedApiProxyService.convertToCamelOrSnakeCase(true, 'camelCase')).toBe(true);
      expect(EnhancedApiProxyService.convertToCamelOrSnakeCase(null, 'snake_case')).toBe(null);
      expect(EnhancedApiProxyService.convertToCamelOrSnakeCase(undefined, 'camelCase')).toBe(undefined);
    });
  });
});