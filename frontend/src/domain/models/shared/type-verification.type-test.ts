/**
 * NOVAMIND Neural-Safe Type Verification
 * Static type tests with quantum-level precision
 *
 * This file uses static TypeScript type analysis to validate the type
 * inference capabilities of our verification utilities
 */

import {
  TypeVerificationError,
  assertDefined,
  assertPresent,
  assertString,
  assertNumber,
  assertBoolean,
  assertArray,
  assertObject,
  assertDate,
  assertType,
  asString,
  asNumber,
  asBoolean,
  asDate,
} from "./type-verification";

// Test that TypeScript properly infers the assertion types
// This file doesn't export any actual tests - it's a compile-time
// validation of type inference

// ========== assertDefined ==========
() => {
  const maybeStr: string | undefined = "test";

  // Before assertion: TypeScript treats as possibly undefined
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeStr: string = maybeStr;

  // After assertion: TypeScript narrows type to non-undefined
  assertDefined(maybeStr);
  const afterStr: string = maybeStr; // No type error
};

// ========== assertPresent ==========
() => {
  const maybeStr: string | null | undefined = "test";

  // Before assertion: TypeScript treats as possibly null or undefined
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeStr: string = maybeStr;

  // After assertion: TypeScript narrows type to non-null and non-undefined
  assertPresent(maybeStr);
  const afterStr: string = maybeStr; // No type error
};

// ========== assertString ==========
() => {
  const value: unknown = "test";

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeStr: string = value;

  // After assertion: TypeScript narrows type to string
  assertString(value);
  const afterStr: string = value; // No type error
};

// ========== assertNumber ==========
() => {
  const value: unknown = 42;

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeNum: number = value;

  // After assertion: TypeScript narrows type to number
  assertNumber(value);
  const afterNum: number = value; // No type error
};

// ========== assertBoolean ==========
() => {
  const value: unknown = true;

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeBool: boolean = value;

  // After assertion: TypeScript narrows type to boolean
  assertBoolean(value);
  const afterBool: boolean = value; // No type error
};

// ========== assertArray ==========
() => {
  const value: unknown = [1, 2, 3];

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeArr: number[] = value;

  // After assertion: TypeScript narrows type to array
  assertArray<number>(value);
  const afterArr: number[] = value; // No type error
};

// ========== assertObject ==========
() => {
  const value: unknown = { name: "test" };

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeObj: Record<string, unknown> = value;

  // After assertion: TypeScript narrows type to object
  assertObject(value);
  const afterObj: Record<string, unknown> = value; // No type error
};

// ========== assertDate ==========
() => {
  const value: unknown = new Date();

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforeDate: Date = value;

  // After assertion: TypeScript narrows type to Date
  assertDate(value);
  const afterDate: Date = value; // No type error
};

// ========== assertType with custom type guard ==========
() => {
  interface Person {
    name: string;
    age: number;
  }
  const isPerson = (v: unknown): v is Person => {
    return (
      typeof v === "object" &&
      v !== null &&
      "name" in v &&
      typeof (v as any).name === "string" &&
      "age" in v &&
      typeof (v as any).age === "number"
    );
  };

  const value: unknown = { name: "Alice", age: 30 };

  // Before assertion: TypeScript treats as unknown
  // @ts-expect-error - This line demonstrates a compile-time error before assertion
  const beforePerson: Person = value;

  // After assertion: TypeScript narrows type to Person
  assertType(value, isPerson, "Person");
  const afterPerson: Person = value; // No type error
};

// ========== Safe type conversion functions ==========
() => {
  const unknownValue: unknown = "hello";

  // Type transformation with safe fallbacks
  const strResult = asString(unknownValue);
  const numResult = asNumber(unknownValue);
  const boolResult = asBoolean(unknownValue);
  const dateResult = asDate(unknownValue);

  // TypeScript correctly infers types with undefined as possible result
  const strType: string | undefined = strResult;
  const numType: number | undefined = numResult;
  const boolType: boolean | undefined = boolResult;
  const dateType: Date | undefined = dateResult;
};
