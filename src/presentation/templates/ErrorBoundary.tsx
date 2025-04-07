import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react'; // Removed unused React import

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-gray-900">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                Something went wrong
              </h2>
              <div className="text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  An error occurred while rendering the application.
                </p>
                <div className="mb-4">
                  <p className="overflow-x-auto rounded bg-gray-100 p-2 font-mono text-sm text-red-600 dark:bg-gray-700 dark:text-red-300">
                    {this.state.error && this.state.error.toString()}
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Reload Application
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
