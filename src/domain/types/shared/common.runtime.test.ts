/**
 * NOVAMIND Neural Test Suite
 * Common Shared Types runtime validators testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import {
  IDValidator,
  TimestampedEntityValidator,
  UserGeneratedContentValidator,
  AuditableValidator,
  VersionedEntityValidator,
  SortOrderValidator,
  RangeValidator,
  Point2DValidator,
  ColorRGBValidator,
  ColorRGBAValidator,
  DimensionsValidator,
} from '@domain/types/shared/common.runtime.ts'; // Add .ts extension

describe('Common Shared Types runtime validators', () => {
  describe('IDValidator', () => {
    it('validates valid IDs', () => {
      expect(IDValidator.isValid('test-id')).toBe(true);
      expect(IDValidator.isValid('12345')).toBe(true);
    });

    it('rejects invalid IDs', () => {
      expect(IDValidator.isValid('')).toBe(false);
      expect(IDValidator.isValid('   ')).toBe(false);
      expect(IDValidator.isValid(null)).toBe(false);
      expect(IDValidator.isValid(undefined)).toBe(false);
      expect(IDValidator.isValid(123)).toBe(false);
    });
  });

  describe('TimestampedEntityValidator', () => {
    it('validates valid TimestampedEntity objects', () => {
      expect(
        TimestampedEntityValidator.isValid({
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toBe(true);
    });

    it('rejects invalid TimestampedEntity objects', () => {
      expect(TimestampedEntityValidator.isValid(null)).toBe(false);
      expect(TimestampedEntityValidator.isValid({})).toBe(false);
      expect(
        TimestampedEntityValidator.isValid({
          createdAt: new Date(),
          updatedAt: 'not a date',
        })
      ).toBe(false);
      expect(
        TimestampedEntityValidator.isValid({
          createdAt: 'not a date',
          updatedAt: new Date(),
        })
      ).toBe(false);
    });
  });

  describe('UserGeneratedContentValidator', () => {
    it('validates valid UserGeneratedContent objects', () => {
      expect(
        UserGeneratedContentValidator.isValid({
          createdBy: 'user1',
          lastModifiedBy: null,
        })
      ).toBe(true);
      expect(
        UserGeneratedContentValidator.isValid({
          createdBy: 'user1',
          lastModifiedBy: 'user2',
        })
      ).toBe(true);
    });

    it('rejects invalid UserGeneratedContent objects', () => {
      expect(UserGeneratedContentValidator.isValid(null)).toBe(false);
      expect(UserGeneratedContentValidator.isValid({})).toBe(false);
      expect(
        UserGeneratedContentValidator.isValid({
          createdBy: 123,
          lastModifiedBy: null,
        })
      ).toBe(false);
      expect(
        UserGeneratedContentValidator.isValid({
          createdBy: 'user1',
          lastModifiedBy: 123,
        })
      ).toBe(false);
    });
  });

  describe('AuditableValidator', () => {
    it('validates valid Auditable objects', () => {
      expect(
        AuditableValidator.isValid({
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          lastModifiedBy: null,
        })
      ).toBe(true);
    });

    it('rejects invalid Auditable objects', () => {
      expect(AuditableValidator.isValid(null)).toBe(false);
      expect(AuditableValidator.isValid({})).toBe(false);
      expect(
        AuditableValidator.isValid({
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toBe(false);
      expect(
        AuditableValidator.isValid({
          createdBy: 'user1',
          lastModifiedBy: null,
        })
      ).toBe(false);
    });
  });

  describe('VersionedEntityValidator', () => {
    it('validates valid VersionedEntity objects', () => {
      expect(VersionedEntityValidator.isValid({ version: 1 })).toBe(true);
      expect(VersionedEntityValidator.isValid({ version: 0 })).toBe(true);
    });

    it('rejects invalid VersionedEntity objects', () => {
      expect(VersionedEntityValidator.isValid(null)).toBe(false);
      expect(VersionedEntityValidator.isValid({})).toBe(false);
      expect(VersionedEntityValidator.isValid({ version: -1 })).toBe(false);
      expect(VersionedEntityValidator.isValid({ version: 1.5 })).toBe(false);
      expect(VersionedEntityValidator.isValid({ version: '1' })).toBe(false);
    });
  });

  describe('SortOrderValidator', () => {
    it('validates valid SortOrder values', () => {
      expect(SortOrderValidator.isValid('asc')).toBe(true);
      expect(SortOrderValidator.isValid('desc')).toBe(true);
    });

    it('rejects invalid SortOrder values', () => {
      expect(SortOrderValidator.isValid(null)).toBe(false);
      expect(SortOrderValidator.isValid(undefined)).toBe(false);
      expect(SortOrderValidator.isValid('ascending')).toBe(false);
      expect(SortOrderValidator.isValid('descending')).toBe(false);
      expect(SortOrderValidator.isValid(1)).toBe(false);
    });
  });

  describe('RangeValidator', () => {
    it('validates valid Range objects', () => {
      expect(RangeValidator.isValid({ min: 0, max: 10 })).toBe(true);
      expect(RangeValidator.isValid({ min: -10, max: 10 })).toBe(true);
      expect(RangeValidator.isValid({ min: 5, max: 5 })).toBe(true);
    });

    it('rejects invalid Range objects', () => {
      expect(RangeValidator.isValid(null)).toBe(false);
      expect(RangeValidator.isValid({})).toBe(false);
      expect(RangeValidator.isValid({ min: 10, max: 0 })).toBe(false);
      expect(RangeValidator.isValid({ min: '0', max: 10 })).toBe(false);
      expect(RangeValidator.isValid({ min: 0, max: '10' })).toBe(false);
    });
  });

  describe('Point2DValidator', () => {
    it('validates valid Point2D objects', () => {
      expect(Point2DValidator.isValid({ x: 0, y: 0 })).toBe(true);
      expect(Point2DValidator.isValid({ x: -10, y: 20 })).toBe(true);
      expect(Point2DValidator.isValid({ x: 5.5, y: 7.2 })).toBe(true);
    });

    it('rejects invalid Point2D objects', () => {
      expect(Point2DValidator.isValid(null)).toBe(false);
      expect(Point2DValidator.isValid({})).toBe(false);
      expect(Point2DValidator.isValid({ x: '0', y: 0 })).toBe(false);
      expect(Point2DValidator.isValid({ x: 0, y: '0' })).toBe(false);
      expect(Point2DValidator.isValid({ x: 0 })).toBe(false);
      expect(Point2DValidator.isValid({ y: 0 })).toBe(false);
    });
  });

  describe('ColorRGBValidator', () => {
    it('validates valid ColorRGB objects', () => {
      expect(ColorRGBValidator.isValid({ r: 255, g: 0, b: 0 })).toBe(true);
      expect(ColorRGBValidator.isValid({ r: 0, g: 255, b: 0 })).toBe(true);
      expect(ColorRGBValidator.isValid({ r: 0, g: 0, b: 255 })).toBe(true);
      expect(ColorRGBValidator.isValid({ r: 128, g: 128, b: 128 })).toBe(true);
    });

    it('rejects invalid ColorRGB objects', () => {
      expect(ColorRGBValidator.isValid(null)).toBe(false);
      expect(ColorRGBValidator.isValid({})).toBe(false);
      expect(ColorRGBValidator.isValid({ r: 256, g: 0, b: 0 })).toBe(false);
      expect(ColorRGBValidator.isValid({ r: -1, g: 0, b: 0 })).toBe(false);
      expect(ColorRGBValidator.isValid({ r: '255', g: 0, b: 0 })).toBe(false);
    });
  });

  describe('ColorRGBAValidator', () => {
    it('validates valid ColorRGBA objects', () => {
      expect(ColorRGBAValidator.isValid({ r: 255, g: 0, b: 0, a: 1 })).toBe(true);
      expect(ColorRGBAValidator.isValid({ r: 0, g: 255, b: 0, a: 0.5 })).toBe(true);
      expect(ColorRGBAValidator.isValid({ r: 0, g: 0, b: 255, a: 0 })).toBe(true);
    });

    it('rejects invalid ColorRGBA objects', () => {
      expect(ColorRGBAValidator.isValid(null)).toBe(false);
      expect(ColorRGBAValidator.isValid({})).toBe(false);
      expect(ColorRGBAValidator.isValid({ r: 255, g: 0, b: 0 })).toBe(false);
      expect(ColorRGBAValidator.isValid({ r: 255, g: 0, b: 0, a: 1.1 })).toBe(false);
      expect(ColorRGBAValidator.isValid({ r: 255, g: 0, b: 0, a: -0.1 })).toBe(false);
      expect(ColorRGBAValidator.isValid({ r: 255, g: 0, b: 0, a: '1' })).toBe(false);
    });
  });

  describe('DimensionsValidator', () => {
    it('validates valid Dimensions objects', () => {
      expect(DimensionsValidator.isValid({ width: 100, height: 200 })).toBe(true);
      expect(DimensionsValidator.isValid({ width: 0, height: 0 })).toBe(true);
      expect(DimensionsValidator.isValid({ width: 10.5, height: 20.5 })).toBe(true);
    });

    it('rejects invalid Dimensions objects', () => {
      expect(DimensionsValidator.isValid(null)).toBe(false);
      expect(DimensionsValidator.isValid({})).toBe(false);
      expect(DimensionsValidator.isValid({ width: -1, height: 200 })).toBe(false);
      expect(DimensionsValidator.isValid({ width: 100, height: -1 })).toBe(false);
      expect(DimensionsValidator.isValid({ width: '100', height: 200 })).toBe(false);
      expect(DimensionsValidator.isValid({ width: 100, height: '200' })).toBe(false);
      expect(DimensionsValidator.isValid({ width: 100 })).toBe(false);
      expect(DimensionsValidator.isValid({ height: 200 })).toBe(false);
    });
  });
});
