/**
 * api.js - Axios HTTP Client Configuration
 *
 * Creates a pre-configured Axios instance pointing to the backend API.
 * Base URL defaults to http://localhost:5000/api/v1 but can be overridden
 * via the VITE_API_URL environment variable.
 *
 * Interceptors:
 *  - Request: Automatically attaches the JWT Bearer token from localStorage
 *    to every outgoing request's Authorization header.
 *  - Response: On 401 Unauthorized, clears the stored token and redirects
 *    the user to the login page for re-authentication.
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
