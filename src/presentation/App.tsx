import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Example router setup
import Dashboard from '@pages/Dashboard';
import BrainVisualizationPage from '@pages/BrainVisualizationPage'; // Import the visualization page
import NotFound from '@pages/NotFound'; // Import the NotFound page
import NeuralControlPanel from '@organisms/NeuralControlPanel'; // Import the component to test
import ThemeProvider from '@application/contexts/ThemeProvider'; // Import ThemeProvider
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
          {/* Test route for NeuralControlPanel */}
          <Route
            path="/test/neural-control-panel"
            element={
              <ThemeProvider defaultTheme="dark">
                <div className="p-4 bg-background text-foreground min-h-screen">
                  <h1 className="text-xl font-semibold mb-6">Neural Control Panel Test</h1>
                  <NeuralControlPanel
                    patientId="DEMO_PATIENT_001"
                    brainModelId="DEMO_SCAN_001"
                    onSettingsChange={(settings) => console.log('Settings changed:', settings)}
                  />
                </div>
              </ThemeProvider>
            }
          />
          
          {/* Test route for BrainModelContainer */}
          <Route
            path="/brain-model-container/demo"
            element={
              <ThemeProvider defaultTheme="dark">
                <div className="p-4 bg-background text-foreground min-h-screen">
                  <h1 className="text-xl font-semibold mb-6">Brain Model Container Test</h1>
                  <div className="h-[80vh] border border-gray-700 rounded-lg overflow-hidden">
                    {/* Note: Using NeuralControlPanel temporarily until BrainModelContainer is fully implemented */}
                    <NeuralControlPanel
                      patientId="DEMO_PATIENT_001"
                      brainModelId="DEMO_SCAN_001"
                      onSettingsChange={(settings) => console.log('Settings changed:', settings)}
                    />
                  </div>
                </div>
              </ThemeProvider>
            }
          />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App; // Export App as default
