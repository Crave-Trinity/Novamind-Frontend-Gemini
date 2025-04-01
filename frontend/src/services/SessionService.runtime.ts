/**
 * @fileoverview Runtime validation functions for SessionService options.
 */

import { Result, Ok, Err } from "ts-results";
import { SessionOptions } from "@/services/SessionService"; // Import interface from service file

// --- Type Guards ---

// Type guard for SessionOptions
export function isSessionOptions(obj: unknown): obj is SessionOptions {
  if (typeof obj !== "object" || obj === null) return false;
  const options = obj as Partial<SessionOptions>; // Cast to Partial for checking optional props

  // Check types if properties exist
  if (
    options.timeout !== undefined &&
    (typeof options.timeout !== "number" || options.timeout <= 0)
  )
    return false;
  if (
    options.warningTime !== undefined &&
    (typeof options.warningTime !== "number" || options.warningTime <= 0)
  )
    return false;
  if (
    options.onTimeout !== undefined &&
    typeof options.onTimeout !== "function"
  )
    return false;
  if (
    options.onWarning !== undefined &&
    typeof options.onWarning !== "function"
  )
    return false;
  if (options.enabled !== undefined && typeof options.enabled !== "boolean")
    return false;

  // Check that warningTime is less than timeout if both are provided
  if (
    options.timeout !== undefined &&
    options.warningTime !== undefined &&
    options.warningTime >= options.timeout
  ) {
    console.warn(
      "SessionOptions validation: warningTime should be less than timeout.",
    );
    // Allow this case for flexibility, but log a warning. Could return false for stricter validation.
  }

  return true;
}

// --- Validation Function ---

/**
 * Validates the SessionOptions object.
 * @param options - The options object to validate.
 * @returns Result<SessionOptions, Error>
 */
export function validateSessionOptions(
  options: unknown,
): Result<SessionOptions, Error> {
  if (isSessionOptions(options)) {
    return Ok(options);
  }
  // Attempt to stringify for better error reporting
  let optionsStr = "[unserializable options]";
  try {
    optionsStr = JSON.stringify(options); // Simple stringify might be enough here
  } catch (e) {
    /* ignore */
  }
  return Err(
    new Error(
      `Invalid SessionOptions structure or types. Received: ${optionsStr}`,
    ),
  );
}
