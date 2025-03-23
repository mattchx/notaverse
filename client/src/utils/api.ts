// API utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiConfig extends RequestInit {
  headers?: Record<string, string>;
}

async function api<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  const response = await fetch(url, {
    ...config,
    headers,
    credentials: 'include', // Add this to send cookies with requests
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
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