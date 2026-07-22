// API Client helper for Ganga Guardian AI
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getHeaders() {
    const headers = {};
    const savedUser = localStorage.getItem('ganga_guardian_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.token) {
          headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch { localStorage.removeItem('ganga_guardian_user'); }
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Merge headers
    const headers = {
      ...this.getHeaders(),
      ...options.headers
    };

    // Auto content-type JSON if it's not a FormData object
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    if (!response.ok) {
      const message = typeof data?.error === 'string' ? data.error : data?.error?.message;
      throw new Error(message || `HTTP error! Status: ${response.status}`);
    }
    return data;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
