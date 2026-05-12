// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT_MS = 30000;

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = !options.signal && timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), timeoutMs)
    : null;
  const { timeoutMs: _timeoutMs, ...fetchOptions } = options;
  
  const headers = {
    ...options.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal || controller?.signal,
    });

    console.log(`[API Response] ${response.status} ${url}`);

    // Try to parse JSON
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }
    } catch (parseError) {
      console.error(`[API Parse Error] Failed to parse response for ${url}:`, parseError);
      data = { message: 'Failed to parse server response' };
    }

    if (!response.ok) {
      console.error(`[API Error] ${response.status}: ${data.message}`);
      const error = new Error(data.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.details = Array.isArray(data.errors) ? data.errors : [];
      error.response = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('The request took too long. Check that the backend is running and try again.');
      timeoutError.status = 408;
      timeoutError.details = [];
      throw timeoutError;
    }

    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

export default apiCall;
