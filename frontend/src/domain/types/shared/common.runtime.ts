/**
 * NOVAMIND Neural-Safe Shared Type Runtime Validators
 *
 * Runtime validators for common shared data types with quantum-level precision.
 * This module provides runtime validation for shared interfaces used across domains.
 */

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
} from "./common";

/**
 * Runtime validation for ID
 */
export const IDValidator = {
  /**
   * Validates if a value is a valid ID
   */
  isValid: (value: unknown): value is ID => {
    return typeof value === "string" && value.trim().length > 0;
  },
};

/**
 * Runtime validation for TimestampedEntity
 */
export const TimestampedEntityValidator = {
  /**
   * Validates if an object is a valid TimestampedEntity
   */
  isValid: (obj: unknown): obj is TimestampedEntity => {
    if (!obj || typeof obj !== "object") return false;

    const entity = obj as Partial<TimestampedEntity>;

    return entity.createdAt instanceof Date && entity.updatedAt instanceof Date;
  },
};

/**
 * Runtime validation for UserGeneratedContent
 */
export const UserGeneratedContentValidator = {
  /**
   * Validates if an object is a valid UserGeneratedContent
   */
  isValid: (obj: unknown): obj is UserGeneratedContent => {
    if (!obj || typeof obj !== "object") return false;

    const content = obj as Partial<UserGeneratedContent>;

    return (
      typeof content.createdBy === "string" &&
      (content.lastModifiedBy === null ||
        typeof content.lastModifiedBy === "string")
    );
  },
};

/**
 * Runtime validation for Auditable
 */
export const AuditableValidator = {
  /**
   * Validates if an object is a valid Auditable
   */
  isValid: (obj: unknown): obj is Auditable => {
    if (!obj || typeof obj !== "object") return false;

    return (
      TimestampedEntityValidator.isValid(obj) &&
      UserGeneratedContentValidator.isValid(obj)
    );
  },
};

/**
 * Runtime validation for VersionedEntity
 */
export const VersionedEntityValidator = {
  /**
   * Validates if an object is a valid VersionedEntity
   */
  isValid: (obj: unknown): obj is VersionedEntity => {
    if (!obj || typeof obj !== "object") return false;

    const entity = obj as Partial<VersionedEntity>;

    return (
      typeof entity.version === "number" &&
      Number.isInteger(entity.version) &&
      entity.version >= 0
    );
  },
};

/**
 * Runtime validation for SortOrder
 */
export const SortOrderValidator = {
  /**
   * Validates if a value is a valid SortOrder
   */
  isValid: (value: unknown): value is SortOrder => {
    return value === "asc" || value === "desc";
  },
};

/**
 * Runtime validation for Range
 */
export const RangeValidator = {
  /**
   * Validates if an object is a valid Range
   */
  isValid: (obj: unknown): obj is Range => {
    if (!obj || typeof obj !== "object") return false;

    const range = obj as Partial<Range>;

    return (
      typeof range.min === "number" &&
      typeof range.max === "number" &&
      range.min <= range.max
    );
  },
};

/**
 * Runtime validation for Point2D
 */
export const Point2DValidator = {
  /**
   * Validates if an object is a valid Point2D
   */
  isValid: (obj: unknown): obj is Point2D => {
    if (!obj || typeof obj !== "object") return false;

    const point = obj as Partial<Point2D>;

    return typeof point.x === "number" && typeof point.y === "number";
  },
};

/**
 * Runtime validation for ColorRGB
 */
export const ColorRGBValidator = {
  /**
   * Validates if an object is a valid ColorRGB
   */
  isValid: (obj: unknown): obj is ColorRGB => {
    if (!obj || typeof obj !== "object") return false;

    const color = obj as Partial<ColorRGB>;

    return (
      typeof color.r === "number" &&
      color.r >= 0 &&
      color.r <= 255 &&
      typeof color.g === "number" &&
      color.g >= 0 &&
      color.g <= 255 &&
      typeof color.b === "number" &&
      color.b >= 0 &&
      color.b <= 255
    );
  },
};

/**
 * Runtime validation for ColorRGBA
 */
export const ColorRGBAValidator = {
  /**
   * Validates if an object is a valid ColorRGBA
   */
  isValid: (obj: unknown): obj is ColorRGBA => {
    if (!obj || typeof obj !== "object") return false;

    const color = obj as Partial<ColorRGBA>;

    return (
      ColorRGBValidator.isValid(obj) &&
      typeof color.a === "number" &&
      color.a >= 0 &&
      color.a <= 1
    );
  },
};

/**
 * Runtime validation for Dimensions
 */
export const DimensionsValidator = {
  /**
   * Validates if an object is a valid Dimensions
   */
  isValid: (obj: unknown): obj is Dimensions => {
    if (!obj || typeof obj !== "object") return false;

    const dimensions = obj as Partial<Dimensions>;

    return (
      typeof dimensions.width === "number" &&
      dimensions.width >= 0 &&
      typeof dimensions.height === "number" &&
      dimensions.height >= 0
    );
  },
};
