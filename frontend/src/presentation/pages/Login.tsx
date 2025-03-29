import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../atoms/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login - in production this would validate with backend
      localStorage.setItem('auth_token', 'mock_token_123');
      
      // Navigate to redirect location
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-primary-900 via-primary-800 to-blue-900 p-6">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-background-card rounded-2xl shadow-xl p-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-white">Novamind Digital Twin</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Premium psychiatric digital twin platform
          </p>
        </div>
        
        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-background dark:text-white"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-background dark:text-white"
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
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
              Remember me
            </label>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
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
        <div className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-md">
          <p className="font-medium mb-1">Demo Credentials</p>
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
