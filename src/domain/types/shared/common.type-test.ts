/**
 * NOVAMIND Type Testing Framework
 * Common Shared Types Test
 *
 * This file implements static type checking without runtime assertions.
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  ID,
  TimestampedEntity,
  UserGeneratedContent,
  Auditable,
  VersionedEntity,
  SortOrder,
  Range,
  Point2D,
  ColorRGB,
  ColorRGBA,
  Dimensions,
} from '@domain/types/shared/common';

describe('Common shared type definitions', () => {
  it('ID is a string type', () => {
    expectTypeOf<ID>().toEqualTypeOf<string>();
  });

  it('TimestampedEntity has correct structure', () => {
    expectTypeOf<TimestampedEntity>().toHaveProperty('createdAt').toEqualTypeOf<Date>();
    expectTypeOf<TimestampedEntity>().toHaveProperty('updatedAt').toEqualTypeOf<Date>();
  });

  it('UserGeneratedContent has correct structure', () => {
    expectTypeOf<UserGeneratedContent>().toHaveProperty('createdBy').toEqualTypeOf<string>();
    expectTypeOf<UserGeneratedContent>()
      .toHaveProperty('lastModifiedBy')
      .toEqualTypeOf<string | null>();
  });

  it('Auditable combines TimestampedEntity and UserGeneratedContent', () => {
    expectTypeOf<Auditable>().toMatchTypeOf<TimestampedEntity & UserGeneratedContent>();
    expectTypeOf<Auditable>().toHaveProperty('createdAt').toEqualTypeOf<Date>();
    expectTypeOf<Auditable>().toHaveProperty('updatedAt').toEqualTypeOf<Date>();
    expectTypeOf<Auditable>().toHaveProperty('createdBy').toEqualTypeOf<string>();
    expectTypeOf<Auditable>().toHaveProperty('lastModifiedBy').toEqualTypeOf<string | null>();
  });

  it('VersionedEntity has correct structure', () => {
    expectTypeOf<VersionedEntity>().toHaveProperty('version').toEqualTypeOf<number>();
  });

  it('SortOrder has correct literal union type', () => {
    expectTypeOf<SortOrder>().toEqualTypeOf<'asc' | 'desc'>();
  });

  it('Range has correct structure', () => {
    expectTypeOf<Range>().toHaveProperty('min').toEqualTypeOf<number>();
    expectTypeOf<Range>().toHaveProperty('max').toEqualTypeOf<number>();
  });

  it('Point2D has correct structure', () => {
    expectTypeOf<Point2D>().toHaveProperty('x').toEqualTypeOf<number>();
    expectTypeOf<Point2D>().toHaveProperty('y').toEqualTypeOf<number>();
  });

  it('ColorRGB has correct structure', () => {
    expectTypeOf<ColorRGB>().toHaveProperty('r').toEqualTypeOf<number>();
    expectTypeOf<ColorRGB>().toHaveProperty('g').toEqualTypeOf<number>();
    expectTypeOf<ColorRGB>().toHaveProperty('b').toEqualTypeOf<number>();
  });

  it('ColorRGBA extends ColorRGB with alpha', () => {
    expectTypeOf<ColorRGBA>().toMatchTypeOf<ColorRGB & { a: number }>();
    expectTypeOf<ColorRGBA>().toHaveProperty('r').toEqualTypeOf<number>();
    expectTypeOf<ColorRGBA>().toHaveProperty('g').toEqualTypeOf<number>();
    expectTypeOf<ColorRGBA>().toHaveProperty('b').toEqualTypeOf<number>();
    expectTypeOf<ColorRGBA>().toHaveProperty('a').toEqualTypeOf<number>();
  });

  it('Dimensions has correct structure', () => {
    expectTypeOf<Dimensions>().toHaveProperty('width').toEqualTypeOf<number>();
    expectTypeOf<Dimensions>().toHaveProperty('height').toEqualTypeOf<number>();
  });
});
