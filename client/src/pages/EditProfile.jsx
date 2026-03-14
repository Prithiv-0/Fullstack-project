/**
 * @file EditProfile.jsx - User Profile Editor
 * @description Provides a form for users to update their profile information
 * including name, phone number, zone, and profile photo.
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { User, Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './EditProfile.css'

export default function EditProfile() {
    const { user, updateUser } = useAuth()
    const nav = useNavigate()
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', zone: user?.zone || '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError(''); setSuccess('')
        try {
            const res = await api.put('/auth/profile', form)
            updateUser(res.data.data)
            setSuccess('Profile updated successfully!')
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed')
        }
        setLoading(false)
    }

    return (
        <div className="page-container fade-in">
            <button onClick={() => nav(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>

            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <User size={28} color="white" />
                    </div>
                    <h1 className="page-title">Edit Profile</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{user?.email} • <span className="badge badge-status">{user?.role?.replace(/_/g, ' ')}</span></p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Zone</label>
                            <select className="form-select" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })}>
                                <option value="">Select zone</option>
                                {['Central', 'North', 'South', 'East', 'West', 'Mahadevapura', 'Bommanahalli', 'Dasarahalli', 'Yelahanka', 'Rajarajeshwari Nagar'].map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
