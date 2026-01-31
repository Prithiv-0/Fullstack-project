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
                const res = await api.get('/auth/me')
                setUser(res.data.data)
            } catch (err) {
                localStorage.removeItem('token')
            }
        }
        setLoading(false)
    }

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return res.data
    }

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData)
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return res.data
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
