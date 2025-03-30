import React, { Component, ErrorInfo, ReactNode } from "react";

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /**
   * Children to render
   */
  children: ReactNode;

  /**
   * Optional fallback component to render on error
   */
  fallback?: ReactNode;

  /**
   * Whether this is a top-level boundary
   */
  isRoot?: boolean;

  /**
   * Error handler callback
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching and handling runtime errors
 *
 * Prevents the entire app from crashing when an error occurs in a component
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when error occurs
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Handle component error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Call onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error state
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, isRoot } = this.props;

    // If no error, render children
    if (!hasError) {
      return children;
    }

    // If custom fallback is provided, render it
    if (fallback) {
      return fallback;
    }

    // Otherwise, render default error UI
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {isRoot ? "Application Error" : "Component Error"}
          </h2>

          <div className="mb-4 max-h-64 overflow-auto rounded bg-gray-100 p-4 text-left dark:bg-gray-800">
            <p className="font-mono text-sm text-red-600 dark:text-red-400">
              {error && error.toString()}
            </p>
          </div>

          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {isRoot
              ? "A critical error has occurred in the application. Please try refreshing the page."
              : "Something went wrong in this component. You can try again or navigate to another page."}
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={this.resetErrorBoundary}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Try Again
            </button>

            {isRoot && (
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Refresh Page
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
