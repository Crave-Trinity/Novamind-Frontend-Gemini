import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider } from './application/contexts/ThemeContext';
import ErrorBoundary from './presentation/templates/ErrorBoundary';

// Lazy-loaded components for better performance and code-splitting
const Login = React.lazy(() => import('./presentation/pages/Login'));
const Dashboard = React.lazy(() => import('./presentation/pages/Dashboard'));
const PatientsList = React.lazy(() => import('./presentation/pages/PatientsList'));
const PatientProfile = React.lazy(() => import('./presentation/pages/PatientProfile'));
const BrainModelViewer = React.lazy(() => import('./presentation/pages/BrainModelViewer'));
const PredictionAnalytics = React.lazy(() => import('./presentation/pages/PredictionAnalytics'));
const Settings = React.lazy(() => import('./presentation/pages/Settings'));

// Auth route for protected pages
import AuthRoute from './presentation/templates/AuthRoute';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  // Track if the application is ready
  const [isReady, setIsReady] = useState(false);
  
  // Simulate initialization process
  useEffect(() => {
    const initApp = async () => {
      // Add artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsReady(true);
    };
    
    initApp();
  }, []);
  
  if (!isReady) {
    return <LoadingFallback />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route element={<AuthRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<PatientsList />} />
                  <Route path="/patients/:patientId" element={<PatientProfile />} />
                  <Route path="/brain-model" element={<BrainModelViewer />} />
                  <Route path="/brain-model/:patientId" element={<BrainModelViewer />} />
                  <Route path="/predictions" element={<PredictionAnalytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
      
      {/* React Query DevTools - Only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
        Loading
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400">
        Please wait while we prepare your experience...
      </p>
    </div>
  </div>
);

export default App;
