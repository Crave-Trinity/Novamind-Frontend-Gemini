import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../atoms/Button";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // This would be a real API call in production
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login - in production this would validate with backend
      localStorage.setItem("auth_token", "mock_token_123");

      // Navigate to redirect location
      navigate(from, { replace: true });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-primary-900 via-primary-800 to-blue-900 p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-background-card">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">
            Novamind Digital Twin
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Premium psychiatric digital twin platform
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full appearance-none rounded-lg border border-neutral-300 px-3 py-2.5 placeholder-neutral-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background dark:text-white"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full appearance-none rounded-lg border border-neutral-300 px-3 py-2.5 placeholder-neutral-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-background dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300"
            >
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="py-2.5"
          >
            Sign in
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-4 rounded-md bg-neutral-50 p-2 text-center text-xs text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400">
          <p className="mb-1 font-medium">Demo Credentials</p>
          <p>Email: demo@novamind.health</p>
          <p>Password: any value will work</p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <p>© 2025 Novamind Health. All rights reserved.</p>
          <p className="mt-1">HIPAA Compliant | Premium Clinical Platform</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
