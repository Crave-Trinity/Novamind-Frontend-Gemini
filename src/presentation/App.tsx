import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Example router setup
import Dashboard from '@pages/Dashboard';
import BrainVisualizationPage from '@pages/BrainVisualizationPage'; // Import the visualization page
import NotFound from '@pages/NotFound'; // Import the NotFound page
import '@styles/index.css'; // Correct alias

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Define the main App component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* Basic Router Setup - Adjust routes as needed */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Specific demo route */}
          <Route path="/brain-visualization/demo" element={<BrainVisualizationPage />} />
          {/* Parameterized route for specific patient IDs */}
          <Route path="/brain-visualization/:patientId" element={<BrainVisualizationPage />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App; // Export App as default
