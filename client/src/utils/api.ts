// API utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

interface ApiConfig extends RequestInit {
  headers?: Record<string, string>;
}

// Helper to check if any cookies exist
function hasCookies() {
  return document.cookie.length > 0;
}

// Log cookie status
console.log('🍪 Initial cookie status:', {
  hasCookies: hasCookies(),
  cookies: document.cookie || 'No cookies found',
  sameOrigin: window.location.origin === API_BASE_URL
});

async function api<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Always prepend /api if not already there
  const apiPath = normalizedEndpoint.startsWith('/api') ? normalizedEndpoint : `/api${normalizedEndpoint}`;
  
  const url = `${API_BASE_URL}${apiPath}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // Set credentials to include for all requests by default
  const finalConfig: RequestInit = {
    ...config,
    headers,
    credentials: 'include', // Always send cookies with requests
  };

  console.log(`🌐 API Request: ${url}`, { 
    method: finalConfig.method || 'GET',
    credentials: finalConfig.credentials,
    headers: finalConfig.headers
  });

  const response = await fetch(url, finalConfig);

  // Check for Set-Cookie header in response
  const setCookieHeader = response.headers.get('set-cookie');
  
  console.log(`🍪 Cookie status after request:`, {
    setCookieHeader: setCookieHeader ? 'Present' : 'Not present',
    cookies: document.cookie || 'No cookies found'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Error (${response.status}): ${errorText}`);
    throw new Error(response.statusText || errorText);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json();
  console.log(`✅ API Response: ${url}`, data);
  return data;
}

export async function get<T>(endpoint: string, config?: ApiConfig): Promise<T> {
  return api<T>(endpoint, { ...config, method: 'GET' });
}

export async function post<T>(endpoint: string, data: unknown, config?: ApiConfig): Promise<T> {
  return api<T>(endpoint, {
    ...config,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function put<T>(endpoint: string, data: unknown, config?: ApiConfig): Promise<T> {
  return api<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function del<T>(endpoint: string, config?: ApiConfig): Promise<T> {
  return api<T>(endpoint, { ...config, method: 'DELETE' });
}

export default {
  get,
  post,
  put,
  delete: del,
};