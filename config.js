// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Base API configuration
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10);
export const FALLBACKS = [
    'http://localhost:8000',
    'http://0.0.0.0:8000'
].filter(url => url !== BASE_URL);

// API version prefix
export const API_PREFIX = '/api/v1';

// API endpoints configuration
export const API_ENDPOINTS = {
    // Health check
    health: '/health',
    
    // Match related endpoints
    matches: `${API_PREFIX}/matches`,
    matchSquads: (matchId) => `${API_PREFIX}/matches/${matchId}/squads`,
    
    // Team generation and prediction
    generateTeam: (matchId) => `${API_PREFIX}/teams/generate/${matchId}`,
    updateData: `${API_PREFIX}/data/update`,
    predictTeam: `${API_PREFIX}/teams/predict`
};

// Development helpers
if (isDevelopment) {
    console.log('API Configuration:', {
        BASE_URL,
        API_TIMEOUT,
        FALLBACKS,
        API_ENDPOINTS
    });
}