import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
}

export default function Login() {
  const [error, setError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUser, checkAuth } = useAuth();

  const handleSubmit = async (credentials: { email: string; password: string }) => {
    setError('');
    setStatusMessage('');
    setIsLoggingIn(true);
    
    try {
      setStatusMessage('Authenticating...');
      console.log('🔑 Login: Attempting login with email:', credentials.email);
      
      // Try the login request
      const data = await api.post<LoginResponse>('/auth/login', credentials);
      console.log('✅ Login successful:', data);
      
      // Set status for user feedback
      setStatusMessage('Verifying session...');
      
      // Give the server a moment to set up the session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Explicitly check auth status after login
      const authResult = await checkAuth();
      
      if (!authResult) {
        console.error('❌ Auth verification failed after login');
        setError('Login succeeded but session verification failed. Please try again.');
        setIsLoggingIn(false);
        return;
      }
      
      // Set auth state based on response data
      setIsAuthenticated(true);
      setUser(data.user);
      
      setStatusMessage('Redirecting to dashboard...');
      console.log('🔐 Auth state set, navigating to dashboard');
      
      // Get the redirect path from URL or default to dashboard
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || '/dashboard';
      navigate(from);
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      // Try to extract the error message from the API response
      let errorMessage = 'Login failed';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Set a user-friendly error message
      setError(errorMessage);
      setStatusMessage('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      {statusMessage && (
        <div className="max-w-md mx-auto mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
          {statusMessage}
        </div>
      )}
      <LoginForm onSubmit={handleSubmit} error={error} isLoading={isLoggingIn} />
    </>
  );
}