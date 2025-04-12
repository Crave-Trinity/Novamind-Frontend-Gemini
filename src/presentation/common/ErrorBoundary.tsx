/* eslint-disable */
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient';

interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Optional custom fallback component
   */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  /**
   * Whether an error has been caught
   */
  hasError: boolean;

  /**
   * Error message to display
   */
  errorMessage: string;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree, logs them,
 * and displays a fallback UI instead of crashing the whole app.
 * Implements HIPAA-compliant error logging without exposing PHI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  /**
   * Update state when an error occurs - the render phase
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Sanitize error message to avoid exposing PHI
    const sanitizedMessage = ErrorBoundary.sanitizeErrorMessage(error.message);

    return {
      hasError: true,
      errorMessage: sanitizedMessage,
    };
  }

  /**
   * Handle side-effects of an error - the commit phase
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Sanitize error information for HIPAA compliance
    const sanitizedStack = ErrorBoundary.sanitizeErrorMessage(errorInfo.componentStack || '');

    // Log error in a HIPAA-compliant way
    auditLogClient.log(AuditEventType.SYSTEM_ERROR, {
      action: 'client_error',
      errorMessage: ErrorBoundary.sanitizeErrorMessage(error.message),
      details: `Component Stack: ${sanitizedStack.substring(0, 200)}...`,
      result: 'failure',
    });

    // In production, we might also send to an error monitoring service
    // that is configured to redact PHI
    if (process.env.NODE_ENV === 'production') {
      // Example: errorMonitoringService.captureException(error, { extra: { componentStack: sanitizedStack } });
      console.error('A HIPAA-compliant error report has been submitted');
    } else {
      // In development, log to console for debugging
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  /**
   * Reset error state when the user clicks "Try Again"
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      errorMessage: '',
    });
  };

  /**
   * Sanitize error messages to avoid exposing PHI
   * Removes potential PHI like patient identifiers, paths with usernames, etc.
   */
  private static sanitizeErrorMessage(message: string): string {
    if (!message) return 'An unknown error occurred';

    // Replace potential PII/PHI patterns with generic placeholders
    return (
      message
        // Remove file paths that might contain username
        .replace(/\/Users\/[^\/]+/g, '[USER_PATH]')
        // Remove potential patient IDs (various formats)
        .replace(
          /\b(patient|patientId|patient_id|mrn)[:=]\s*["']?([^"'\s]+)["']?/gi,
          '$1: [REDACTED]'
        )
        // Remove potential URLs with query parameters
        .replace(/(https?:\/\/[^\s?]+\?)([^\s]+)/gi, '$1[REDACTED]')
        // Remove email addresses
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
        // Remove IP addresses
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_ADDRESS]')
    );
  }

  override render(): ReactNode {
    const { hasError, errorMessage } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-10 h-10 text-red-600 dark:text-red-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-center text-gray-900 dark:text-white">
                Something went wrong
              </h2>

              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                The error has been logged and our team has been notified.
              </p>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // When no error occurred, render children normally
    return children;
  }
}

export default ErrorBoundary;
