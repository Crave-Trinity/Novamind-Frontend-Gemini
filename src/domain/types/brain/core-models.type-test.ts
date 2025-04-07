/**
 * NOVAMIND Type Testing Framework
 * Brain Core Models Type Tests
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  BrainRegion,
  Vector3,
  Connection,
  BrainModel,
  Coordinate,
} from '@domain/types/brain/core-models';

describe('Brain Core Models type definitions', () => {
  it('Vector3 has correct structure', () => {
    expectTypeOf<Vector3>().toHaveProperty('x').toEqualTypeOf<number>();
    expectTypeOf<Vector3>().toHaveProperty('y').toEqualTypeOf<number>();
    expectTypeOf<Vector3>().toHaveProperty('z').toEqualTypeOf<number>();
  });

  it('Coordinate has correct structure', () => {
    expectTypeOf<Coordinate>().toHaveProperty('x').toEqualTypeOf<number>();
    expectTypeOf<Coordinate>().toHaveProperty('y').toEqualTypeOf<number>();
    expectTypeOf<Coordinate>().toHaveProperty('z').toEqualTypeOf<number>();
    expectTypeOf<Coordinate>().toHaveProperty('label').toEqualTypeOf<string>();
  });

  it('BrainRegion has correct structure', () => {
    expectTypeOf<BrainRegion>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<BrainRegion>().toHaveProperty('name').toEqualTypeOf<string>();
    expectTypeOf<BrainRegion>().toHaveProperty('position').toEqualTypeOf<Vector3>();
    expectTypeOf<BrainRegion>().toHaveProperty('color').toEqualTypeOf<string>();
    expectTypeOf<BrainRegion>().toHaveProperty('connections').toEqualTypeOf<string[]>();
    expectTypeOf<BrainRegion>().toHaveProperty('activityLevel').toEqualTypeOf<number>();
    expectTypeOf<BrainRegion>().toHaveProperty('isActive').toEqualTypeOf<boolean>();
    expectTypeOf<BrainRegion>().toHaveProperty('riskFactor').toBeNullable();
    expectTypeOf<BrainRegion>().toHaveProperty('volumeMl').toBeNullable();
  });

  it('Connection has correct structure', () => {
    expectTypeOf<Connection>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<Connection>().toHaveProperty('sourceId').toEqualTypeOf<string>();
    expectTypeOf<Connection>().toHaveProperty('targetId').toEqualTypeOf<string>();
    expectTypeOf<Connection>().toHaveProperty('strength').toEqualTypeOf<number>();
    expectTypeOf<Connection>().toHaveProperty('type').toEqualTypeOf<string>();
    expectTypeOf<Connection>().toHaveProperty('isActive').toEqualTypeOf<boolean>();
    expectTypeOf<Connection>().toHaveProperty('color').toEqualTypeOf<string | undefined>(); // Corrected to optional
  });

  it('BrainModel has correct structure', () => {
    expectTypeOf<BrainModel>().toHaveProperty('id').toEqualTypeOf<string>();
    expectTypeOf<BrainModel>().toHaveProperty('name').toEqualTypeOf<string>();
    expectTypeOf<BrainModel>().toHaveProperty('regions').toEqualTypeOf<BrainRegion[]>();
    expectTypeOf<BrainModel>().toHaveProperty('connections').toEqualTypeOf<Connection[]>();
    expectTypeOf<BrainModel>().toHaveProperty('patients').toBeNullable();
    expectTypeOf<BrainModel>().toHaveProperty('modelType').toBeNullable();
    expectTypeOf<BrainModel>().toHaveProperty('anatomicalCoordinates').toBeNullable();
  });
});
