import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@application/providers/ThemeProvider";
import { AuthProvider } from "@application/providers/AuthProvider";
import { useAuth } from "@application/hooks/useAuth";
import LoadingIndicator from "@presentation/atoms/LoadingIndicator";
import ErrorBoundary from "@presentation/common/ErrorBoundary";
import SessionWarningModal from "@presentation/molecules/SessionWarningModal";

// Lazy-loaded components for code splitting
const Login = React.lazy(() => import("@presentation/pages/Login"));
const Dashboard = React.lazy(() => import("@presentation/pages/Dashboard"));
const PatientProfile = React.lazy(() => import("@presentation/pages/PatientProfile"));
const BrainVisualizationPage = React.lazy(() => import("@presentation/pages/BrainVisualizationPage"));
const NotFound = React.lazy(() => import("@presentation/pages/NotFound"));

/**
 * Protected Route Component
 *
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Public Route Component
 *
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Default Redirect Component
 *
 * Redirects to dashboard if authenticated, login otherwise
 */
const DefaultRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};
/**
 * Application Root Component
 *
 * Provides global providers, routing, and error boundaries.
 * Implements HIPAA-compliant session management and lazy loading.
 */
const App: React.FC = () => {
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingIndicator size="lg" text="Loading..." />
    </div>
  );
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            {/* Session warning modal now gets auth status from context */}
            <SessionWarningModal />
            
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={<PublicRoute><Login /></PublicRoute>}
                />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/patient/:id"
                  element={
                    <ProtectedRoute>
                      <PatientProfile />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/brain-visualization/:id"
                  element={
                    <ProtectedRoute>
                      <BrainVisualizationPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Default redirect */}
                <Route
                  path="/"
                  element={<DefaultRedirect />}
                />
                
                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
