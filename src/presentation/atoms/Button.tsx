import React, { ButtonHTMLAttributes, forwardRef } from "react";
import cn from "classnames";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "warning"
  | "ghost";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   */
  size?: ButtonSize;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Shows a loading spinner
   */
  isLoading?: boolean;

  /**
   * Icon element to display before button text
   */
  icon?: React.ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Button component
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      icon,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Generate variant classes
    const variantClasses = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600",
      secondary:
        "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-500 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600",
      outline:
        "border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100 focus:ring-neutral-500 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600",
      warning:
        "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-500",
      ghost:
        "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800",
    };

    // Generate size classes
    const sizeClasses = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
      xl: "px-6 py-3 text-lg",
    };

    // Combine all classes
    const buttonClasses = cn(
      // Base styles
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900",

      // Variant
      variantClasses[variant],

      // Size
      sizeClasses[size],

      // Full width
      fullWidth && "w-full",

      // Disabled state
      (disabled || isLoading) && "opacity-60 cursor-not-allowed",

      // Custom classes
      className,
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {icon && !isLoading && <span className="mr-2">{icon}</span>}

        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
