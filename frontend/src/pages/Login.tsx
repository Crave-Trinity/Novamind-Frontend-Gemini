import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import SecureInput from "../components/atoms/SecureInput";
import { auditLogService, AuditEventType } from "../services/AuditLogService";

/**
 * Login page component
 * Provides secure authentication with HIPAA-compliant logging
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // MFA state
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaValid, setMfaValid] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!emailValid || !passwordValid) {
        setError("Please enter valid credentials");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real implementation, this would call the auth API
        if (email === "demo@novamind.com" && password === "demo123") {
          // Log successful login attempt
          auditLogService.log(AuditEventType.LOGIN, {
            result: "success",
            details: "Login successful, MFA required",
          });

          // Show MFA verification
          setShowMFA(true);
        } else {
          // Log failed login attempt (no sensitive info in logs)
          auditLogService.log(AuditEventType.LOGIN_FAILURE, {
            result: "failure",
            details: "Invalid credentials",
          });

          throw new Error("Invalid email or password");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, emailValid, passwordValid],
  );

  /**
   * Handle MFA verification
   */
  const handleVerifyMFA = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!mfaValid) {
        setError("Please enter a valid verification code");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real implementation, this would verify the MFA code
        if (mfaCode === "123456") {
          // Log successful MFA verification
          auditLogService.log(AuditEventType.MFA_CHALLENGE, {
            result: "success",
            details: "MFA verification successful",
          });

          // Redirect to dashboard
          navigate("/");
        } else {
          // Log failed MFA attempt
          auditLogService.log(AuditEventType.MFA_CHALLENGE, {
            result: "failure",
            details: "Invalid MFA code",
          });

          throw new Error("Invalid verification code");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [mfaCode, mfaValid, navigate],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Novamind Digital Twin
          </h1>
          <h2 className="mt-2 text-center text-xl text-gray-600 dark:text-gray-400">
            Secure Provider Login
          </h2>
        </div>

        {/* Login form */}
        {!showMFA ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <SecureInput
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(value, _, isValid) => {
                  setEmail(value);
                  setEmailValid(isValid);
                }}
                label="Email address"
                required
                placeholder="provider@example.com"
                pattern="[^@]+@[^@]+\.[^@]+"
              />

              <SecureInput
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(value, _, isValid) => {
                  setPassword(value);
                  setPasswordValid(isValid);
                }}
                label="Password"
                required
                minLength={6}
                isSensitive
              />
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                  isLoading
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        ) : (
          /* MFA form */
          <form className="mt-8 space-y-6" onSubmit={handleVerifyMFA}>
            <div>
              <h3 className="text-center text-lg font-medium">
                Two-factor Authentication
              </h3>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Enter the verification code from your authenticator app
              </p>
            </div>

            <div className="rounded-md shadow-sm">
              <SecureInput
                id="mfa-code"
                name="mfa-code"
                type="text"
                value={mfaCode}
                onChange={(value, _, isValid) => {
                  setMfaCode(value);
                  setMfaValid(isValid);
                }}
                pattern="^[0-9]{6}$"
                required
                placeholder="123456"
                isSensitive
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                  isLoading
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>

            {/* Back button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowMFA(false)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* Security badges */}
        <div className="mt-6">
          <div className="flex justify-center space-x-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              HIPAA Compliant
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Secure Connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
