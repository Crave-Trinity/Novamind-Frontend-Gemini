import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * NotFound Page Component
 * 
 * 404 page displayed when a user tries to access a non-existent route.
 * Provides navigation back to valid parts of the application.
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };
  
  // Navigate back to login
  const handleBackToLogin = () => {
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-600 dark:text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h1>
        
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={handleBackToLogin}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to Login
          </button>
        </div>
        
        <div className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          Novamind Digital Twin Platform | Error Code: 404
        </div>
      </div>
    </div>
  );
};

export default NotFound;