/**
 * main.jsx - React Application Entry Point
 *
 * Bootstraps the React application by mounting it to the #root DOM element.
 * Sets up the provider hierarchy:
 *  1. StrictMode — enables development-time checks and warnings
 *  2. QueryClientProvider — TanStack React Query for server state caching
 *  3. BrowserRouter — React Router for client-side navigation
 *  4. AuthProvider — global authentication context (user state, login/logout)
 *
 * QueryClient is configured with retry=1 and refetchOnWindowFocus=false
 * to avoid unnecessary network requests during development.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
