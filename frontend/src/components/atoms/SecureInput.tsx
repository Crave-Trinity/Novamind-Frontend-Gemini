import React, { useState, useEffect, useCallback } from "react";

/**
 * Props for SecureInput component
 */
export interface SecureInputProps {
  /**
   * Input ID (required for accessibility)
   */
  id: string;

  /**
   * Input name
   */
  name: string;

  /**
   * Input type (text, email, password, etc)
   */
  type?: string;

  /**
   * Input value
   */
  value: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether the input is required
   */
  required?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Regex pattern for validation
   */
  pattern?: string;

  /**
   * Minimum length for validation
   */
  minLength?: number;

  /**
   * Maximum length for validation
   */
  maxLength?: number;

  /**
   * Whether this input contains sensitive information (for logging)
   */
  isSensitive?: boolean;

  /**
   * CSS class for the container
   */
  className?: string;

  /**
   * Change handler
   * Provides: value, name, isValid
   */
  onChange: (value: string, name: string, isValid: boolean) => void;

  /**
   * Blur handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * SecureInput component
 *
 * HIPAA-compliant input with validation and sanitization
 * Features:
 * - Input validation with error messages
 * - XSS prevention with input sanitization
 * - Accessibility support
 * - Sensitive data handling
 */
const SecureInput: React.FC<SecureInputProps> = ({
  id,
  name,
  type = "text",
  value,
  label,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  pattern,
  minLength,
  maxLength,
  isSensitive = false,
  className = "",
  onChange,
  onBlur,
}) => {
  // State for validation
  const [isValid, setIsValid] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Validate input value
  const validateInput = useCallback(
    (inputValue: string): boolean => {
      // Required validation
      if (required && !inputValue) {
        setInternalError("This field is required");
        return false;
      }

      // Pattern validation
      if (pattern && inputValue) {
        const regex = new RegExp(pattern);
        if (!regex.test(inputValue)) {
          setInternalError("Please enter a valid format");
          return false;
        }
      }

      // Length validation
      if (minLength && inputValue.length < minLength) {
        setInternalError(`Must be at least ${minLength} characters`);
        return false;
      }

      if (maxLength && inputValue.length > maxLength) {
        setInternalError(`Must be no more than ${maxLength} characters`);
        return false;
      }

      // Clear error if valid
      setInternalError(null);
      return true;
    },
    [required, pattern, minLength, maxLength],
  );

  // Sanitize input to prevent XSS
  const sanitizeInput = useCallback((inputValue: string): string => {
    // Basic sanitization to prevent HTML injection
    return inputValue
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Don't log sensitive data
      if (!isSensitive) {
        console.debug(`Input ${name} changed:`, newValue);
      }

      // Sanitize input
      const sanitizedValue = sanitizeInput(newValue);

      // Validate input
      const valid = validateInput(sanitizedValue);
      setIsValid(valid);

      // Call parent onChange with sanitized value
      onChange(sanitizedValue, name, valid);
    },
    [name, onChange, validateInput, sanitizeInput, isSensitive],
  );

  // Handle input blur
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true);

      // Validate on blur
      const valid = validateInput(value);
      setIsValid(valid);

      // Call parent onBlur if provided
      if (onBlur) {
        onBlur(event);
      }
    },
    [value, validateInput, onBlur],
  );

  // Validate input on mount and when validation dependencies change
  useEffect(() => {
    if (isTouched) {
      const valid = validateInput(value);
      setIsValid(valid);
    }
  }, [value, validateInput, isTouched]);

  // Determine error message to display
  const errorMessage = error || (isTouched ? internalError : null);

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={!isValid}
          aria-describedby={`${id}-error ${id}-helper`}
          className={`w-full border px-4 py-2 ${
            !isValid || errorMessage
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
          } rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-900 dark:text-white ${
            disabled ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""
          }`}
          data-testid={`input-${name}`}
          autoComplete={isSensitive ? "off" : "on"}
        />
      </div>

      {/* Error message */}
      {errorMessage && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      )}

      {/* Helper text */}
      {helperText && !errorMessage && (
        <p
          id={`${id}-helper`}
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default SecureInput;
