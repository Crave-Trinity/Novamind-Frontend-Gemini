import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { auditLogService, AuditEventType } from "../services/AuditLogService";

/**
 * 404 Not Found page
 *
 * Displays when a user attempts to access a route that doesn't exist.
 * Includes automatic redirection after a delay and logs the failed navigation.
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Log the 404 event
  useEffect(() => {
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      action: "not_found",
      details: `Attempted to navigate to ${location.pathname}`,
      result: "failure",
    });

    // Set up automatic redirect after delay
    const redirectTimer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 10000); // 10 seconds

    // Clean up timer
    return () => clearTimeout(redirectTimer);
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="mb-6">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg
              className="h-10 w-10 text-blue-600 dark:text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>

          <div className="mx-auto my-4 h-1 w-16 bg-blue-600"></div>

          <p className="mb-6 text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or you don't have
            permission to access it.
          </p>

          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            You will be automatically redirected to the dashboard in 10 seconds.
          </p>

          <div className="flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              to="/dashboard"
              className="w-full rounded-md bg-blue-600 px-6 py-2 text-white transition-colors duration-300 hover:bg-blue-700 sm:w-auto"
            >
              Go to Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors duration-300 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Error details (only shown in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 rounded bg-gray-100 p-4 text-left dark:bg-gray-900">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Debug Information
            </h3>
            <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
              Attempted path: {location.pathname}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
