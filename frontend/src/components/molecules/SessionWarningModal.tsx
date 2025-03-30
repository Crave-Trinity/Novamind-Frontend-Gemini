import React, { useEffect, useState } from "react";

/**
 * Props for SessionWarningModal
 */
interface SessionWarningModalProps {
  /**
   * Time remaining in milliseconds before session expiration
   */
  timeRemaining: number;

  /**
   * Callback to continue the session
   */
  onContinue: () => void;

  /**
   * Callback to log out
   */
  onLogout: () => void;

  /**
   * Whether the modal is visible
   */
  isVisible: boolean;
}

/**
 * Session warning modal component
 *
 * Displays a warning when the user's session is about to expire
 * and gives options to continue or logout
 */
const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  timeRemaining,
  onContinue,
  onLogout,
  isVisible,
}) => {
  // Format time remaining as minutes and seconds
  const [formattedTime, setFormattedTime] = useState("");

  // Update formatted time when time remaining changes
  useEffect(() => {
    if (timeRemaining <= 0) {
      setFormattedTime("00:00");
      return;
    }

    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    setFormattedTime(
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    );
  }, [timeRemaining]);

  // If not visible, return null
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Session Expiring Soon
          </h2>

          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Your session will expire in{" "}
            <span className="font-semibold">{formattedTime}</span>. For security
            purposes, you will be automatically logged out unless you choose to
            continue.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={onLogout}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Log Out
            </button>

            <button
              onClick={onContinue}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Continue Session
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This timeout is enforced to comply with HIPAA security
              requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
