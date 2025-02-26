import { useState } from 'react';
import { useNavigate } from 'react-router';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

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
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();
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