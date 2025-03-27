import { useState } from 'react';
import { useNavigate } from 'react-router';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
}

export default function Register() {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  const handleSubmit = async (credentials: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const data = await api.post<RegisterResponse>('/api/auth/register', credentials);
      setIsAuthenticated(true);
      setUser(data.user);

      // Successful registration
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return <RegisterForm onSubmit={handleSubmit} error={error} />;
}