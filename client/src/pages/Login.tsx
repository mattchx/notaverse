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
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUser } = useAuth();

  const handleSubmit = async (credentials: { email: string; password: string }) => {
    try {
      const data = await api.post<LoginResponse>('/api/auth/login', credentials);
      setIsAuthenticated(true);
      setUser(data.user);

      // Get the redirect path from URL or default to dashboard
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || '/dashboard';
      navigate(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return <LoginForm onSubmit={handleSubmit} error={error} />;
}