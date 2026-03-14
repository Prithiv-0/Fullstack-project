import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { AlertTriangle, MapPin, Loader, Phone } from 'lucide-react'
import './EmergencySOS.css'

export default function EmergencySOS() {
    const nav = useNavigate()
    const { user } = useAuth()
    const [form, setForm] = useState({ emergencyType: 'accident', description: '', location: { lat: '', lng: '', address: '' } })
    const [loading, setLoading] = useState(false)
    const [gpsLoading, setGpsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const getGPS = () => {
        if (!navigator.geolocation) return setError('Geolocation not supported')
        setGpsLoading(true)
        navigator.geolocation.getCurrentPosition(
            pos => { setForm(f => ({ ...f, location: { ...f.location, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) } })); setGpsLoading(false) },
            err => { setError('GPS failed: ' + err.message); setGpsLoading(false) },
            { enableHighAccuracy: true }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.location.lat || !form.location.lng) { setError('Location is required — tap "Get My Location"'); return }
        setLoading(true); setError('')
        try {
            await api.post('/sos', {
                emergencyType: form.emergencyType,
                description: form.description,
                location: { lat: parseFloat(form.location.lat), lng: parseFloat(form.location.lng), address: form.location.address }
            })
            setSuccess(true)
        } catch (err) { setError(err.response?.data?.error || 'Failed to send SOS') }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="page-container fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>🚨</div>
                <h1 style={{ fontSize: '1.75rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>SOS Alert Sent!</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>Emergency services have been notified. Stay safe and wait for assistance.</p>
                <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => nav('/dashboard')}>Back to Dashboard</button>
            </div>
        )
    }

    return (
        <div className="page-container fade-in">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚨</div>
                <h1 className="page-title" style={{ color: 'var(--danger)' }}>Emergency SOS</h1>
                <p className="page-subtitle">Send an immediate emergency alert to city authorities</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <div className="form-group">
                        <label className="form-label"><AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Emergency Type</label>
                        <select className="form-select" value={form.emergencyType} onChange={e => setForm({ ...form, emergencyType: e.target.value })}>
                            <option value="accident">Accident</option>
                            <option value="fire">Fire</option>
                            <option value="medical">Medical Emergency</option>
                            <option value="crime">Crime / Threat</option>
                            <option value="flood">Severe Flooding</option>
                            <option value="other">Other Emergency</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Brief Description (optional)</label>
                        <textarea className="form-textarea" placeholder="Describe the emergency..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                    </div>
                    <div className="form-group">
                        <label className="form-label"><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Your Location *</label>
                        <button type="button" className="btn btn-danger" onClick={getGPS} disabled={gpsLoading} style={{ width: '100%', marginBottom: '0.75rem' }}>
                            {gpsLoading ? <><Loader size={16} className="animate-spin" /> Getting GPS...</> : <><MapPin size={16} /> Get My Location</>}
                        </button>
                        {form.location.lat && <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>📍 Location acquired: {form.location.lat}, {form.location.lng}</p>}
                    </div>
                </div>

                <button type="submit" className="btn btn-danger btn-lg" style={{ width: '100%', fontSize: '1.1rem' }} disabled={loading}>
                    {loading ? 'Sending SOS...' : '🚨 SEND SOS ALERT'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Phone size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> For life-threatening emergencies, also call <strong>112</strong></p>
                </div>
            </form>
        </div>
    )
}
