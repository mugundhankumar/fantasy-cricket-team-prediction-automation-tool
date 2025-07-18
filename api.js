import axios from 'axios';
import { BASE_URL, API_TIMEOUT, FALLBACKS, API_ENDPOINTS } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const testBackend = async (url) => {
  try {
    const res = await axios.get(`${url}${API_ENDPOINTS.health}`, { 
      timeout: 3000,
      validateStatus: (status) => status === 200 
    });
    return true;
  } catch (error) {
    console.warn(`Backend test failed for ${url}:`, error.message);
    return false;
  }
};

export const getWorkingBackend = async () => {
  if (await testBackend(BASE_URL)) {
    return BASE_URL;
  }
  for (const url of FALLBACKS) {
    if (await testBackend(url)) {
      return url;
    }
  }
  return null;
};

// API error handler
const handleApiError = (error, operation) => {
  const errorDetails = {
    operation,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  };

  console.error('API Error:', errorDetails);

  if (error.response?.status === 404) {
    throw new Error(`${operation} failed: Resource not found`);
  } else if (error.response?.status === 401) {
    throw new Error(`${operation} failed: Unauthorized`);
  } else if (error.response?.status === 403) {
    throw new Error(`${operation} failed: Forbidden`);
  } else if (error.response?.status >= 500) {
    throw new Error(`${operation} failed: Server error`);
  } else if (error.code === 'ECONNABORTED') {
    throw new Error(`${operation} failed: Request timeout`);
  } else {
    throw new Error(`${operation} failed: ${error.message}`);
  }
};

export const teamApi = {
  async generateTeam(matchId, preferences) {
    try {
      const url = await getWorkingBackend();
      if (!url) throw new Error('Backend not reachable');
      const response = await api.post(API_ENDPOINTS.generateTeam(matchId), preferences);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Generate team');
    }
  }
};

export const matchApi = {
  async getMatches() {
    try {
      const url = await getWorkingBackend();
      if (!url) throw new Error('Backend not reachable');
      const response = await api.get(API_ENDPOINTS.matches);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get matches');
    }
  },

  async getMatchSquads(matchId) {
    try {
      const url = await getWorkingBackend();
      if (!url) throw new Error('Backend not reachable');
      const response = await api.get(API_ENDPOINTS.matchSquads(matchId));
      return response.data;
    } catch (error) {
      handleApiError(error, 'Get match squads');
    }
  },

  async updateData() {
    try {
      const url = await getWorkingBackend();
      if (!url) throw new Error('Backend not reachable');
      const response = await api.post(API_ENDPOINTS.updateData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Update data');
    }
  },

  async predictTeam(matchData) {
    try {
      const url = await getWorkingBackend();
      if (!url) throw new Error('Backend not reachable');
      const response = await api.post(API_ENDPOINTS.predictTeam, matchData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Predict team');
    }
  }
};

const apiService = {
  team: teamApi,
  match: matchApi
};

export default apiService;
