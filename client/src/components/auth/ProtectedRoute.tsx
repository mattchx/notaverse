import { Navigate, LoaderFunction, LoaderFunctionArgs } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

// Loader function to check auth before route renders
export const createProtectedLoader = (getAuth: () => { isAuthenticated: boolean }): LoaderFunction =>
  async ({ request }: LoaderFunctionArgs) => {
    const { isAuthenticated } = getAuth();

    if (!isAuthenticated) {
      // Save attempted URL to redirect back after login
      const params = new URLSearchParams();
      params.set('from', new URL(request.url).pathname);
      
      return Navigate({
        to: `/login?${params.toString()}`,
        replace: true
      });
    }
    
    return null; // Allow route to render
  }

// Helper hook to create protected loader with current auth context
export const useProtectedLoader = (): LoaderFunction => {
  const auth = useAuth();
  return createProtectedLoader(() => auth);
}