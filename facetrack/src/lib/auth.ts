interface AuthState {
  token: string;
  user?: any;
  expiresAt?: number;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const authState = localStorage.getItem('authState');
  if (!authState) return null;
  
  try {
    const parsed: AuthState = JSON.parse(authState);
    return parsed.token || null;
  } catch (error) {
    console.error('Failed to parse auth state:', error);
    return null;
  }
};

export const getAuthState = (): AuthState | null => {
  if (typeof window === 'undefined') return null;
  
  const authState = localStorage.getItem('authState');
  if (!authState) return null;
  
  try {
    return JSON.parse(authState) as AuthState;
  } catch (error) {
    console.error('Failed to parse auth state:', error);
    return null;
  }
};

export const setAuthState = (state: AuthState): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authState', JSON.stringify(state));
};

export const clearAuthState = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authState');
};

export const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearAuthState();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! Status: ${response.status}`);
  }

  return response;
};