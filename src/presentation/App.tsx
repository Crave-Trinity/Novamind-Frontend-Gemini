import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Example router setup
import Dashboard from '@pages/Dashboard'; // Example page import
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
          {/* Add other routes here */}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App; // Export App as default
