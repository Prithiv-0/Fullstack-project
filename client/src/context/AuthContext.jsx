import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const res = await api.get('/auth/profile')
                setUser(res.data.data)
            } catch (err) {
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
            }
        }
        setLoading(false)
    }

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        // Support both old format (token) and new format (accessToken)
        const accessToken = res.data.accessToken || res.data.token
        const refreshToken = res.data.refreshToken
        localStorage.setItem('token', accessToken)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
        setUser(res.data.user)
        return res.data
    }

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData)
        const accessToken = res.data.accessToken || res.data.token
        const refreshToken = res.data.refreshToken
        localStorage.setItem('token', accessToken)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
        setUser(res.data.user)
        return res.data
    }

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }))
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (err) { /* ignore */ }
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
