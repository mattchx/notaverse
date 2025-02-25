import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LoginForm } from '../components/auth/LoginForm';

export default function Login() {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      // Successful login
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return <LoginForm onSubmit={handleSubmit} error={error} />;
}