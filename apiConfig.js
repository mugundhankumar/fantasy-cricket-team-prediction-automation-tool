import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY;

const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }
});

// Add a request interceptor for handling request errors
api.interceptors.request.use(
    (config) => {
        // Log request for debugging in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
            });
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Log response for debugging in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', {
                url: error.config.url,
                status: error.response.status,
                data: error.response.data,
            });
            
            // Handle specific error cases
            switch (error.response.status) {
                case 401:
                    // Unauthorized - API key issue
                    throw new Error('Invalid API key. Please check your configuration.');
                case 429:
                    // Rate limit exceeded
                    throw new Error('Rate limit exceeded. Please try again later.');
                case 404:
                    // Not found
                    throw new Error('Resource not found.');
                default:
                    throw new Error(error.response.data.detail || 'An error occurred');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
            throw new Error('Network error - no response received');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request Setup Error:', error.message);
            throw new Error('Error setting up the request');
        }
    }
);
