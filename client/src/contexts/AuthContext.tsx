import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
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
  checkAuth: () => Promise<boolean>;
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    console.log('🔒 Auth Check: Starting authentication check...');
    console.log('🔍 Current cookies:', document.cookie || 'No cookies found');
    
    setIsLoading(true);
    
    try {
      // Add a random query param to prevent caching
      const cacheBuster = `?_=${Date.now()}`;
      const data = await apiGet<{ user: User }>(`/auth/me${cacheBuster}`);
      
      console.log('✅ Auth Check: Successfully authenticated via cookies', data);
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('❌ Auth Check: Authentication failed:', error);
      
      // If we get a network error, don't clear auth - it might be a temporary issue
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn('⚠️ Network error during auth check - keeping current auth state');
        return isAuthenticated; // Return current state
      }
      
      setIsAuthenticated(false);
      setUser(null);
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Include isAuthenticated in dependencies

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {});
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
  }, [checkAuth]);

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