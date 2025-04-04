import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ThemeProvider } from "@application/providers/ThemeProvider";
import LoadingIndicator from "@components/atoms/LoadingIndicator";
import SessionWarningModal from "@components/molecules/SessionWarningModal";
import ErrorBoundary from "@components/utils/ErrorBoundary";
import { auditLogService, AuditEventType } from "@services/AuditLogService";
import { initializeSessionService } from "@/services/SessionService";

// Lazy-loaded components
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const PatientProfile = React.lazy(() => import("./pages/PatientProfile"));
const Login = React.lazy(() => import("./pages/Login"));
const BrainVisualizationPage = React.lazy(
  () => import("./pages/BrainVisualizationPage"),
);
const NotFound = React.lazy(() => import("./pages/NotFound"));

/**
 * Main App component
 *
 * Handles routing, error boundaries, and global providers
 */
const App: React.FC = () => {
  // Initialize services on app load
  useEffect(() => {
    // Initialize session timeout service
    initializeSessionService({
      timeout: 15 * 60 * 1000, // 15 minutes
      warningTime: 60 * 1000, // 1 minute warning
      onTimeout: () => {
        // Redirect to login on timeout
        window.location.href = "/login?reason=timeout";
      },
      onWarning: () => {
        // Show warning modal (would be triggered via a global state mechanism)
        console.debug("Session timeout warning triggered");
      },
    });

    // Log application init
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      action: "application_init",
      details: "Application initialized",
      result: "success",
    });

    // Cleanup on unmount
    return () => {
      // Any cleanup needed
    };
  }, []);

  /**
   * Global error handler for uncaught errors
   */
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Uncaught error:", error, errorInfo);

    // Log to audit service
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      action: "error",
      errorCode: error.name,
      errorMessage: error.message,
      // Provide a fallback empty string if componentStack is null
      details: errorInfo.componentStack || "",
      result: "failure",
    });
  };

  return (
    <ThemeProvider>
      <ErrorBoundary onError={handleError}>
        <Router>
          <Suspense fallback={<LoadingIndicator fullScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes (would have auth check in real app) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients/:id" element={<PatientProfile />} />
              <Route
                path="/brain-visualization/:id"
                element={<BrainVisualizationPage />}
              />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>

        {/* Global components */}
        <SessionWarningModal
          isVisible={false} // Controlled by global state in a real app
          timeRemaining={60000}
          onContinue={() => console.debug("Session continued")}
          onLogout={() => (window.location.href = "/login?reason=logout")}
        />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
