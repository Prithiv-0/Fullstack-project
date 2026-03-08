import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Phone, MapPin, UserPlus, Eye, EyeOff, Shield } from 'lucide-react'
import './Auth.css'

export default function Register() {
    const nav = useNavigate()
    const { register } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', zone: '', role: 'citizen' })
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const passwordStrength = (pw) => {
        let s = 0
        if (pw.length >= 8) s++
        if (/[A-Z]/.test(pw)) s++
        if (/[0-9]/.test(pw)) s++
        if (/[^A-Za-z0-9]/.test(pw)) s++
        return s
    }

    const strength = passwordStrength(form.password)
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.name || !form.email || !form.password) { setError('Name, email, and password are required'); return }
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
        setLoading(true)
        try {
            await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, zone: form.zone, role: form.role })
            nav('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="bg-gradient"></div>
                <div className="bg-grid"></div>
            </div>

            <div className="auth-card fade-in" style={{ maxWidth: '480px' }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <Shield size={36} />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join the Smart City platform</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <div className="input-wrapper">
                            <User size={16} className="input-icon" />
                            <input className="form-input with-icon" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <div className="input-wrapper">
                            <Mail size={16} className="input-icon" />
                            <input className="form-input with-icon" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Zone</label>
                            <select className="form-select" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })}>
                                <option value="">Select zone</option>
                                {['Central', 'North', 'South', 'East', 'West', 'Mahadevapura', 'Bommanahalli', 'Dasarahalli', 'Yelahanka', 'Rajarajeshwari Nagar'].map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password * (min 8 chars)</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input className="form-input with-icon" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {form.password && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--bg-tertiary)', transition: 'background 300ms' }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password *</label>
                        <input className="form-input" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
                        {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    )
}
