import { useEffect, useRef, useState, useCallback } from 'react'; // Removed unused React
// Removed unused useNavigate import
import { useAuth } from '@application/hooks/useAuth';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient'; // Corrected import name

interface SessionWarningModalProps {
  /**
   * Time in milliseconds before showing the warning modal
   * Default: 25 minutes (1,500,000ms)
   */
  warningTime?: number;

  /**
   * Time in milliseconds before automatic logout after warning
   * Default: 5 minutes (300,000ms)
   */
  logoutTime?: number;
}

/**
 * Session Warning Modal
 *
 * HIPAA-compliant inactive session management component that warns users
 * about upcoming session expiration and handles automatic logout.
 *
 * Implements session timeout monitoring with activity detection
 * to protect PHI (Protected Health Information).
 */
const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  warningTime = 25 * 60 * 1000, // 25 minutes
  logoutTime = 5 * 60 * 1000, // 5 minutes
}) => {
  // Get authentication state from context
  const { isAuthenticated, logout } = useAuth();
  // Removed unused navigate variable

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Timer references
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);

  // Countdown state (in seconds)
  const [countdown, setCountdown] = useState(Math.floor(logoutTime / 1000));
  const countdownIntervalRef = useRef<number | null>(null);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Reset timers on user activity
  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;

    clearAllTimers();

    // Start warning timer
    warningTimerRef.current = window.setTimeout(() => {
      setShowModal(true);
      setCountdown(Math.floor(logoutTime / 1000));

      // Start countdown
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              window.clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start logout timer
      logoutTimerRef.current = window.setTimeout(() => {
        handleLogout();
      }, logoutTime);
    }, warningTime);
  }, [isAuthenticated, warningTime, logoutTime]);

  // Handle continue session
  const handleContinueSession = useCallback(() => {
    setShowModal(false);
    resetTimers();

    // Log session extension for HIPAA compliance
    auditLogClient.log(AuditEventType.USER_LOGIN, {
      // Corrected usage
      action: 'session_extended',
      details: 'User extended session after inactivity warning',
      result: 'success',
    });
  }, [resetTimers]);

  // Handle logout
  const handleLogout = useCallback(() => {
    clearAllTimers();
    setShowModal(false);

    // Log session timeout for HIPAA compliance
    auditLogClient.log(AuditEventType.USER_TIMEOUT, {
      // Corrected usage
      action: 'session_timeout',
      details: 'User session expired due to inactivity',
      result: 'success',
    });

    // Use auth context logout function
    logout();
  }, [clearAllTimers, logout]);

  // Initialize activity monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];

    // Initialize timers
    resetTimers();

    // Register activity listeners
    const activityHandler = () => {
      if (showModal) return; // Don't reset if warning is showing
      resetTimers();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, activityHandler, { passive: true });
    });

    // Cleanup
    return () => {
      clearAllTimers();

      activityEvents.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [isAuthenticated, resetTimers, showModal, clearAllTimers]);

  // Format remaining time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showModal || !isAuthenticated) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  Session Expiring Soon
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Your session is about to expire due to inactivity.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    You will be automatically logged out in{' '}
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">
                      {formatTime(countdown)}
                    </span>
                    .
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Do you want to continue your session?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleContinueSession}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Continue Session
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
