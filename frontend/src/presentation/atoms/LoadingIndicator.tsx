import React from "react";

/**
 * Props for LoadingIndicator component
 */
interface LoadingIndicatorProps {
  /**
   * Whether to display as full screen overlay
   */
  fullScreen?: boolean;

  /**
   * Size variant: small, medium, large
   */
  size?: "sm" | "md" | "lg";

  /**
   * Optional text to display
   */
  text?: string;

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Color variant
   */
  color?: "primary" | "secondary" | "white";
}

/**
 * Loading indicator component
 *
 * Displays a consistent loading spinner across the application
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  fullScreen = false,
  size = "md",
  text,
  className = "",
  color = "primary",
}) => {
  // Size mapping
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  // Color mapping
  const colorMap = {
    primary: "border-primary-500 border-t-transparent",
    secondary: "border-gray-300 border-t-transparent",
    white: "border-white border-t-transparent",
  };

  // Text size mapping
  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Base spinner classes
  const spinnerClasses = `inline-block rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`;

  // If fullScreen, render as overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className={spinnerClasses} role="status" aria-label="Loading" />
        {text && (
          <p
            className={`mt-4 font-medium text-gray-700 dark:text-gray-300 ${textSizeMap[size]}`}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  // Otherwise, render inline
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={spinnerClasses} role="status" aria-label="Loading" />
      {text && (
        <p
          className={`mt-2 font-medium text-gray-700 dark:text-gray-300 ${textSizeMap[size]}`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingIndicator;