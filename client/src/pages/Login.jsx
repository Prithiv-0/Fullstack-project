import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, LogIn, Eye, EyeOff, Shield } from 'lucide-react'
import './Auth.css'

export default function Login() {
    const nav = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email || !password) { setError('Please fill in all fields'); return }
        setLoading(true)
        try {
            await login(email, password)
            nav('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="bg-gradient"></div>
                <div className="bg-grid"></div>
            </div>

            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Shield size={36} />
                    </div>
                    <h1 className="auth-title">Smart City Command</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={16} className="input-icon" />
                            <input
                                className="form-input with-icon"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                className="form-input with-icon"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
                        {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                </div>

                <div className="auth-demo">
                    <p className="demo-title">Demo Accounts</p>
                    <div className="demo-accounts">
                        <span>admin@smartcity.gov.in</span>
                        <span>citizen@example.com</span>
                    </div>
                    <p className="demo-password">Password: password123</p>
                </div>
            </div>
        </div>
    )
}
