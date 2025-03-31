/**
 * NOVAMIND Neural-Safe Type Verification
 * Quantum-level type verification utilities for ensuring neural type safety
 */

import {
  BrainModel,
  BrainRegion,
  NeuralConnection,
  BrainScan
} from '@domain/types/brain/models';

import {
  RenderMode,
  VisualizationSettings,
  ThemeSettings
} from '@domain/types/brain/visualization';

import {
  Patient,
  Diagnosis,
  Symptom,
  Treatment,
  TreatmentResponse
} from '@domain/types/clinical/patient';

import {
  RiskAssessment,
  RiskLevel,
  DomainRisk,
  BiometricRiskAlert
} from '@domain/types/clinical/risk';

import {
  TreatmentResponsePrediction,
  TreatmentComparisonResult
} from '@domain/types/clinical/treatment';

import { Vector3, SafeArray, Result, NeuralError } from '@domain/types/common';

/**
 * Type Verification Error with clinical precision
 */
export class TypeVerificationError extends NeuralError {
  constructor(
    message: string,
    public expectedType: string,
    public receivedType: string,
    public field?: string
  ) {
    super(`Type Verification Error: ${message} (expected: ${expectedType}, received: ${receivedType}${field ? `, field: ${field}` : ''})`);
    this.name = 'TypeVerificationError';
  }
}

/**
 * Verify that an object conforms to the BrainModel interface
 */
export function verifyBrainModel(obj: unknown): Result<BrainModel> {
  if (typeof obj !== 'object' || obj === null) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainModel must be an object',
        'object',
        typeof obj
      )
    };
  }
  
  const model = obj as BrainModel;
  
  // Check for required properties
  if (!Array.isArray(model.regions)) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainModel.regions must be an array',
        'BrainRegion[]',
        typeof model.regions,
        'regions'
      )
    };
  }
  
  if (!Array.isArray(model.connections)) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainModel.connections must be an array',
        'NeuralConnection[]',
        typeof model.connections,
        'connections'
      )
    };
  }
  
  if (!model.scan || typeof model.scan !== 'object') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainModel.scan must be a BrainScan object',
        'BrainScan',
        typeof model.scan,
        'scan'
      )
    };
  }
  
  // Verify individual regions
  for (let i = 0; i < model.regions.length; i++) {
    const regionResult = verifyBrainRegion(model.regions[i]);
    if (!regionResult.success) {
      return {
        success: false,
        error: new TypeVerificationError(
          `Invalid region at index ${i}: ${regionResult.error?.message}`,
          'BrainRegion',
          typeof model.regions[i],
          `regions[${i}]`
        )
      };
    }
  }
  
  // Verify individual connections
  for (let i = 0; i < model.connections.length; i++) {
    const connectionResult = verifyNeuralConnection(model.connections[i]);
    if (!connectionResult.success) {
      return {
        success: false,
        error: new TypeVerificationError(
          `Invalid connection at index ${i}: ${connectionResult.error?.message}`,
          'NeuralConnection',
          typeof model.connections[i],
          `connections[${i}]`
        )
      };
    }
  }
  
  // Verify that connection references are valid
  for (const connection of model.connections) {
    const sourceExists = model.regions.some(r => r.id === connection.sourceId);
    if (!sourceExists) {
      return {
        success: false,
        error: new TypeVerificationError(
          `Connection source region not found`,
          'Valid region ID',
          connection.sourceId,
          `connection.sourceId`
        )
      };
    }
    
    const targetExists = model.regions.some(r => r.id === connection.targetId);
    if (!targetExists) {
      return {
        success: false,
        error: new TypeVerificationError(
          `Connection target region not found`,
          'Valid region ID',
          connection.targetId,
          `connection.targetId`
        )
      };
    }
  }
  
  // Verify BrainScan
  const scanResult = verifyBrainScan(model.scan);
  if (!scanResult.success) {
    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid scan: ${scanResult.error?.message}`,
        'BrainScan',
        typeof model.scan,
        'scan'
      )
    };
  }
  
  return { success: true, data: model };
}

/**
 * Verify that an object conforms to the BrainRegion interface
 */
export function verifyBrainRegion(obj: unknown): Result<BrainRegion> {
  if (typeof obj !== 'object' || obj === null) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion must be an object',
        'object',
        typeof obj
      )
    };
  }
  
  const region = obj as BrainRegion;
  
  // Check required properties
  if (typeof region.id !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.id must be a string',
        'string',
        typeof region.id,
        'id'
      )
    };
  }
  
  if (typeof region.name !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.name must be a string',
        'string',
        typeof region.name,
        'name'
      )
    };
  }
  
  // Verify position
  if (!region.position) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.position is required',
        'Vector3 or [number, number, number]',
        'undefined',
        'position'
      )
    };
  }
  
  // Position can be either a Vector3 object or an array [x, y, z]
  if (Array.isArray(region.position)) {
    if (region.position.length !== 3 || 
        typeof region.position[0] !== 'number' ||
        typeof region.position[1] !== 'number' ||
        typeof region.position[2] !== 'number') {
      return {
        success: false,
        error: new TypeVerificationError(
          'BrainRegion.position as array must be [number, number, number]',
          '[number, number, number]',
          JSON.stringify(region.position),
          'position'
        )
      };
    }
  } else if (typeof region.position === 'object') {
    const pos = region.position as Vector3;
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
      return {
        success: false,
        error: new TypeVerificationError(
          'BrainRegion.position as object must have numeric x, y, z properties',
          '{x: number, y: number, z: number}',
          JSON.stringify(region.position),
          'position'
        )
      };
    }
  } else {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.position must be either a Vector3 object or [number, number, number] array',
        'Vector3 or [number, number, number]',
        typeof region.position,
        'position'
      )
    };
  }
  
  if (typeof region.color !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.color must be a string',
        'string',
        typeof region.color,
        'color'
      )
    };
  }
  
  if (!Array.isArray(region.connections)) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.connections must be an array of strings',
        'string[]',
        typeof region.connections,
        'connections'
      )
    };
  }
  
  for (let i = 0; i < region.connections.length; i++) {
    if (typeof region.connections[i] !== 'string') {
      return {
        success: false,
        error: new TypeVerificationError(
          `BrainRegion.connections[${i}] must be a string`,
          'string',
          typeof region.connections[i],
          `connections[${i}]`
        )
      };
    }
  }
  
  if (typeof region.activityLevel !== 'number' || region.activityLevel < 0 || region.activityLevel > 1) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.activityLevel must be a number between 0 and 1',
        'number (0-1)',
        String(region.activityLevel),
        'activityLevel'
      )
    };
  }
  
  if (typeof region.isActive !== 'boolean') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainRegion.isActive must be a boolean',
        'boolean',
        typeof region.isActive,
        'isActive'
      )
    };
  }
  
  return { success: true, data: region };
}

/**
 * Verify that an object conforms to the NeuralConnection interface
 */
export function verifyNeuralConnection(obj: unknown): Result<NeuralConnection> {
  if (typeof obj !== 'object' || obj === null) {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection must be an object',
        'object',
        typeof obj
      )
    };
  }
  
  const connection = obj as NeuralConnection;
  
  // Check required properties
  if (typeof connection.id !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection.id must be a string',
        'string',
        typeof connection.id,
        'id'
      )
    };
  }
  
  if (typeof connection.sourceId !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection.sourceId must be a string',
        'string',
        typeof connection.sourceId,
        'sourceId'
      )
    };
  }
  
  if (typeof connection.targetId !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection.targetId must be a string',
        'string',
        typeof connection.targetId,
        'targetId'
      )
    };
  }
  
  if (typeof connection.strength !== 'number' || connection.strength < 0 || connection.strength > 1) {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection.strength must be a number between 0 and 1',
        'number (0-1)',
        String(connection.strength),
        'strength'
      )
    };
  }
  
  const validTypes = ['excitatory', 'inhibitory', 'bidirectional', 'modulatory'];
  if (typeof connection.type !== 'string' || !validTypes.includes(connection.type)) {
    return {
      success: false,
      error: new TypeVerificationError(
        `NeuralConnection.type must be one of: ${validTypes.join(', ')}`,
        validTypes.join(' | '),
        String(connection.type),
        'type'
      )
    };
  }
  
  // Optional properties
  if (connection.activityLevel !== undefined && 
      (typeof connection.activityLevel !== 'number' || 
       connection.activityLevel < 0 || 
       connection.activityLevel > 1)) {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection.activityLevel must be a number between 0 and 1',
        'number (0-1)',
        String(connection.activityLevel),
        'activityLevel'
      )
    };
  }
  
  if (connection.isActive !== undefined && typeof connection.isActive !== 'boolean') {
    return {
      success: false,
      error: new TypeVerificationError(
        'NeuralConnection.isActive must be a boolean',
        'boolean',
        typeof connection.isActive,
        'isActive'
      )
    };
  }
  
  return { success: true, data: connection };
}

/**
 * Verify that an object conforms to the BrainScan interface
 */
export function verifyBrainScan(obj: unknown): Result<BrainScan> {
  if (typeof obj !== 'object' || obj === null) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainScan must be an object',
        'object',
        typeof obj
      )
    };
  }
  
  const scan = obj as BrainScan;
  
  // Check required properties
  if (typeof scan.id !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainScan.id must be a string',
        'string',
        typeof scan.id,
        'id'
      )
    };
  }
  
  if (typeof scan.patientId !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainScan.patientId must be a string',
        'string',
        typeof scan.patientId,
        'patientId'
      )
    };
  }
  
  if (typeof scan.date !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainScan.date must be a string',
        'string',
        typeof scan.date,
        'date'
      )
    };
  }
  
  if (typeof scan.type !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainScan.type must be a string',
        'string',
        typeof scan.type,
        'type'
      )
    };
  }
  
  if (typeof scan.resolution !== 'number' || scan.resolution <= 0) {
    return {
      success: false,
      error: new TypeVerificationError(
        'BrainScan.resolution must be a positive number',
        'number (> 0)',
        String(scan.resolution),
        'resolution'
      )
    };
  }
  
  return { success: true, data: scan };
}

/**
 * Verify that a value is a valid RenderMode enum value
 */
export function verifyRenderMode(mode: unknown): Result<RenderMode> {
  if (typeof mode !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'RenderMode must be a string',
        'string',
        typeof mode
      )
    };
  }
  
  const validModes = Object.values(RenderMode);
  if (!validModes.includes(mode as RenderMode)) {
    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid RenderMode value: ${mode}`,
        validModes.join(' | '),
        String(mode)
      )
    };
  }
  
  return { success: true, data: mode as RenderMode };
}

/**
 * Verify that a value is a valid RiskLevel enum value
 */
export function verifyRiskLevel(level: unknown): Result<RiskLevel> {
  if (typeof level !== 'string') {
    return {
      success: false,
      error: new TypeVerificationError(
        'RiskLevel must be a string',
        'string',
        typeof level
      )
    };
  }
  
  const validLevels = Object.values(RiskLevel);
  if (!validLevels.includes(level as RiskLevel)) {
    return {
      success: false,
      error: new TypeVerificationError(
        `Invalid RiskLevel value: ${level}`,
        validLevels.join(' | '),
        String(level)
      )
    };
  }
  
  return { success: true, data: level as RiskLevel };
}

/**
 * Type-safe conversion functions
 */

/**
 * Safely converts a value to a number
 */
export function safelyParseNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return fallback;
}

/**
 * Safely converts a value to a boolean
 */
export function safelyParseBoolean(value: unknown, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    if (lowercased === 'true') return true;
    if (lowercased === 'false') return false;
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return fallback;
}

/**
 * Safely converts a value to a string
 */
export function safelyParseString(value: unknown, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  return String(value);
}

/**
 * Safely converts a value to a Vector3
 */
export function safelyParseVector3(value: unknown, fallback: Vector3 = { x: 0, y: 0, z: 0 }): Vector3 {
  if (typeof value !== 'object' || value === null) {
    return fallback;
  }
  
  // Handle array format [x, y, z]
  if (Array.isArray(value) && value.length >= 3) {
    return {
      x: safelyParseNumber(value[0], 0),
      y: safelyParseNumber(value[1], 0),
      z: safelyParseNumber(value[2], 0)
    };
  }
  
  // Handle object format {x, y, z}
  const obj = value as any;
  if (typeof obj === 'object') {
    return {
      x: safelyParseNumber(obj.x, fallback.x),
      y: safelyParseNumber(obj.y, fallback.y),
      z: safelyParseNumber(obj.z, fallback.z)
    };
  }
  
  return fallback;
}

/**
 * Safe type assertion functions
 */

/**
 * Assert that an object is a BrainModel
 * @throws TypeVerificationError if the assertion fails
 */
export function assertBrainModel(value: unknown): asserts value is BrainModel {
  const result = verifyBrainModel(value);
  if (!result.success) {
    throw result.error;
  }
}

/**
 * Assert that an object is a BrainRegion
 * @throws TypeVerificationError if the assertion fails
 */
export function assertBrainRegion(value: unknown): asserts value is BrainRegion {
  const result = verifyBrainRegion(value);
  if (!result.success) {
    throw result.error;
  }
}

/**
 * Assert that an object is a NeuralConnection
 * @throws TypeVerificationError if the assertion fails
 */
export function assertNeuralConnection(value: unknown): asserts value is NeuralConnection {
  const result = verifyNeuralConnection(value);
  if (!result.success) {
    throw result.error;
  }
}

/**
 * Assert that a value is a valid RenderMode
 * @throws TypeVerificationError if the assertion fails
 */
export function assertRenderMode(value: unknown): asserts value is RenderMode {
  const result = verifyRenderMode(value);
  if (!result.success) {
    throw result.error;
  }
}
