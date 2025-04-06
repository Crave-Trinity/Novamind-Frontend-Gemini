/**
 * NOVAMIND Neural-Safe Common Component
 * VisualizationErrorBoundary - Quantum-level error handling
 * with clinical precision error recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// Domain types
import { Result, success, failure } from '@domain/types/common';

/**
 * Error state with neural-safe typing
 */
interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  componentStack: string | null;
  recoveryAttempted: boolean;
}

/**
 * Props with neural-safe typing
 */
interface VisualizationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo, componentStack: string) => void;
  onRecoveryAttempt?: () => Result<boolean>;
  logErrors?: boolean;
  maxErrorDepth?: number;
}

/**
 * VisualizationErrorBoundary - Common component for visualization error handling
 * Implements clinical precision error recovery for neural visualization components
 */
export class VisualizationErrorBoundary extends Component<
  VisualizationErrorBoundaryProps,
  ErrorState
> {
  // Default props
  static defaultProps: Partial<VisualizationErrorBoundaryProps> = {
    logErrors: true,
    maxErrorDepth: 3,
  };

  // Error recovery tracking
  private recoveryAttempts = 0;

  // Constructor
  constructor(props: VisualizationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      componentStack: null,
      recoveryAttempted: false,
    };
  }

  // Error catching
  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return {
      hasError: true,
      error,
    };
  }

  // Error handling with detailed information capture
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Extract component stack
    const componentStack = errorInfo.componentStack || '';

    // Update state with error details
    this.setState({
      errorInfo,
      componentStack,
    });

    // Log error if enabled
    if (this.props.logErrors) {
      console.error('NOVAMIND Visualization Error:', {
        error,
        componentStack,
        message: error.message,
        stack: error.stack,
      });
    }

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, componentStack);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // This would integrate with an error tracking service like Sentry
      // Example: Sentry.captureException(error);
    }
  }

  /**
   * Attempt recovery from error state
   */
  attemptRecovery = (): void => {
    // Track recovery attempts
    this.recoveryAttempts++;

    // Check if we've exceeded maximum recovery depth
    if (this.recoveryAttempts > (this.props.maxErrorDepth || 3)) {
      console.warn('NOVAMIND Visualization: Maximum recovery attempts exceeded');
      return;
    }

    // Set recovery attempted flag
    this.setState({ recoveryAttempted: true });

    // Call custom recovery handler if provided
    if (this.props.onRecoveryAttempt) {
      const result = this.props.onRecoveryAttempt();

      if (result.success && result.data) {
        // Reset error state on successful recovery
        this.resetErrorState();
      }
    } else {
      // Default recovery strategy - reset error state
      this.resetErrorState();
    }
  };

  /**
   * Reset error state
   */
  resetErrorState = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      componentStack: null,
      recoveryAttempted: false,
    });

    // Reset recovery attempts counter
    this.recoveryAttempts = 0;
  };

  /**
   * Get error details as formatted string
   */
  getFormattedErrorDetails = (): string => {
    const { error, componentStack } = this.state;

    let details = 'Visualization Error\n\n';

    if (error) {
      details += `${error.name}: ${error.message}\n\n`;

      if (error.stack) {
        details += `Stack trace:\n${error.stack}\n\n`;
      }
    }

    if (componentStack) {
      details += `Component stack:\n${componentStack}`;
    }

    return details;
  };

  /**
   * Get error type classification
   */
  getErrorType = (): 'rendering' | 'resource' | 'webgl' | 'unknown' => {
    const { error } = this.state;

    if (!error) return 'unknown';

    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // WebGL errors
    if (
      errorMessage.includes('webgl') ||
      errorMessage.includes('context') ||
      errorMessage.includes('gpu') ||
      errorMessage.includes('shader') ||
      errorMessage.includes('three')
    ) {
      return 'webgl';
    }

    // Resource errors
    if (
      errorMessage.includes('load') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('resource') ||
      errorMessage.includes('network')
    ) {
      return 'resource';
    }

    // Rendering errors
    if (
      errorName.includes('render') ||
      errorMessage.includes('render') ||
      errorMessage.includes('element') ||
      errorMessage.includes('component')
    ) {
      return 'rendering';
    }

    return 'unknown';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    // If no error, render children normally
    if (!hasError) {
      return children;
    }

    // Otherwise, render fallback UI
    if (error && errorInfo) {
      // If fallback is a function, call it with error details and reset function
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo, this.resetErrorState);
      }

      // If custom fallback is provided, render it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h3 style={{ margin: '0 0 1rem 0', color: '#ef4444' }}>Visualization Error</h3>

          <p style={{ margin: '0 0 1rem 0', maxWidth: '400px' }}>
            {this.getErrorType() === 'webgl'
              ? 'There was an error with the WebGL visualization. This may be due to GPU limitations or compatibility issues.'
              : this.getErrorType() === 'resource'
                ? 'Failed to load required resources for the visualization.'
                : 'An error occurred while rendering the visualization.'}
          </p>

          <details
            style={{
              marginBottom: '1rem',
              textAlign: 'left',
              fontSize: '0.8rem',
            }}
          >
            <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>Technical Details</summary>
            <pre
              style={{
                margin: '0.5rem 0 0 0',
                padding: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '0.25rem',
                overflow: 'auto',
                maxHeight: '200px',
                whiteSpace: 'pre-wrap',
                fontSize: '0.7rem',
                color: '#cbd5e1',
              }}
            >
              {error.toString()}
              {this.state.componentStack}
            </pre>
          </details>

          <div>
            <button
              onClick={this.resetErrorState}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                marginRight: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => {
                // Reload visualization with fallback mode
                this.resetErrorState();
                // This would be implemented with a context or state to enable fallback mode
                window.location.search += '&fallbackMode=true';
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #94a3b8',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Use Simple Visualization
            </button>
          </div>
        </div>
      );
    }

    // Fallback for unknown error state
    return children;
  }
}

export default VisualizationErrorBoundary;
