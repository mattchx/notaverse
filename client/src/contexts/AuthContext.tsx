import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { get as apiGet, post as apiPost } from '../utils/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ user: User }>('/auth/me', {
        credentials: 'include',
      });
      setIsAuthenticated(true);
      setUser(data.user);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {}, {
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error; // Re-throw error to handle in UI
    }
  };

  // Check auth status when the app loads
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
    checkAuth,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}