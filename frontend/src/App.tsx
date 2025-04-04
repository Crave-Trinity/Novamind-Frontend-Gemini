import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@application/providers/ThemeProvider";
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
 * Application Root Component
 * 
 * Provides global providers, routing, and error boundaries.
 * Implements HIPAA-compliant session management and lazy loading.
 */
const App: React.FC = () => {
  // Authentication state (in a real app, this would be managed by an auth context)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check for authentication on app load
  useEffect(() => {
    // In a real app, this would validate JWT tokens, check sessions, etc.
    const checkAuth = () => {
      const hasSession = localStorage.getItem("demo_session");
      setIsAuthenticated(!!hasSession);
    };
    
    checkAuth();
    
    // Listen for auth events from other components
    const handleAuthEvent = (event: CustomEvent) => {
      if (event.detail.type === "login") {
        localStorage.setItem("demo_session", "active");
        setIsAuthenticated(true);
      } else if (event.detail.type === "logout") {
        localStorage.removeItem("demo_session");
        setIsAuthenticated(false);
      }
    };
    
    window.addEventListener("auth_event" as any, handleAuthEvent);
    
    return () => {
      window.removeEventListener("auth_event" as any, handleAuthEvent);
    };
  }, []);
  
  /**
   * Protected route wrapper component
   */
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };
  
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
          {/* Session warning modal for HIPAA compliance */}
          <SessionWarningModal isAuthenticated={isAuthenticated} />
          
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
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
              
              {/* Default redirect to dashboard if authenticated, otherwise to login */}
              <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
              />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
