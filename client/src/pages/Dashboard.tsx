import ResourceLibrary from '../components/resource/ResourceLibrary';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [refreshTested, setRefreshTested] = useState(false);

  // Handle the refresh test
  const handleTestRefresh = () => {
    // Store a flag in sessionStorage to detect page reload
    sessionStorage.setItem('testing_refresh', 'true');
    console.log('🔄 Starting refresh test...');
    window.location.reload();
  };

  // Force a direct authentication check (not relying on initial load)
  const handleDirectCheck = async () => {
    const result = await checkAuth();
    console.log('🔍 Direct auth check result:', result);
    alert(`Auth check result: ${result ? 'Authenticated' : 'Not authenticated'}`);
  };

  // Check server auth status via the status endpoint
  const handleCheckAuthStatus = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/status', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('🔍 Auth status check:', data);
      alert(`Auth Status:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Failed to check auth status:', error);
      alert('Error checking auth status');
    }
  };

  // Display cookie information
  const handleShowCookies = () => {
    const cookieInfo = {
      hasCookies: document.cookie.length > 0,
      cookies: document.cookie || 'No cookies found',
      localStorage: {
        hasUser: !!localStorage.getItem('user')
      }
    };
    console.log('🍪 Cookie info:', cookieInfo);
    alert(`Cookie info:\n${JSON.stringify(cookieInfo, null, 2)}`);
  };

  // Check if this is a reload from our test
  const isRefreshTest = sessionStorage.getItem('testing_refresh') === 'true';
  
  // When we detect this is a refresh test and auth check is complete
  useEffect(() => {
    if (isRefreshTest && !isLoading && !refreshTested) {
      console.log('📊 Refresh Test Results:', { 
        isAuthenticated, 
        user,
        isLoading
      });
      setRefreshTested(true);
      sessionStorage.removeItem('testing_refresh');
    }
  }, [isRefreshTest, isLoading, isAuthenticated, user, refreshTested]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ResourceLibrary />
      <div className="mt-8 p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        
        {refreshTested && (
          <div className={`border px-4 py-3 rounded mb-4 ${isAuthenticated ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
            {isAuthenticated ? (
              <>
                <p className="font-bold">✅ Authentication persisted through page refresh!</p>
                <p>User is authenticated</p>
                <p>User data: {JSON.stringify(user)}</p>
              </>
            ) : (
              <>
                <p className="font-bold">❌ Authentication was lost during page refresh</p>
                <p>User is not authenticated</p>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={handleTestRefresh}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Auth via Refresh
          </button>

          <button 
            onClick={handleDirectCheck}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Auth Directly
          </button>
          
          <button 
            onClick={handleCheckAuthStatus}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Check Server Status
          </button>
          
          <button 
            onClick={handleShowCookies}
            className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
          >
            Show Cookies
          </button>
        </div>

        {isAuthenticated ? (
          <div>
            <h2 className="text-lg font-semibold mb-2">Welcome to your dashboard</h2>
            <p className="mb-4">You are logged in as: {user?.email}</p>
          </div>
        ) : (
          <p className="text-amber-600">Authentication status: {isLoading ? 'Loading...' : 'Not logged in'}</p>
        )}
      </div>
    </div>
  );
}