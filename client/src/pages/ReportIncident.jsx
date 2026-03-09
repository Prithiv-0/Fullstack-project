import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { MapPin, Camera, Send, AlertTriangle, Loader, Droplets, Car, Lightbulb, Trash2, Wrench, Shield, Volume2, ParkingCircle, Construction, Zap, Bug } from 'lucide-react'
import './ReportIncident.css'

const INCIDENT_TYPES = [
    { value: 'pothole', label: 'Pothole', icon: <Construction size={24} />, color: '#f59e0b' },
    { value: 'traffic', label: 'Traffic', icon: <Car size={24} />, color: '#ef4444' },
    { value: 'flooding', label: 'Flooding', icon: <Droplets size={24} />, color: '#3b82f6' },
    { value: 'streetlight', label: 'Streetlight', icon: <Lightbulb size={24} />, color: '#eab308' },
    { value: 'garbage', label: 'Garbage', icon: <Trash2 size={24} />, color: '#22c55e' },
    { value: 'accident', label: 'Accident', icon: <AlertTriangle size={24} />, color: '#dc2626' },
    { value: 'water_leak', label: 'Water Leak', icon: <Droplets size={24} />, color: '#06b6d4' },
    { value: 'road_damage', label: 'Road Damage', icon: <Wrench size={24} />, color: '#f97316' },
    { value: 'safety_issue', label: 'Safety', icon: <Shield size={24} />, color: '#8b5cf6' },
    { value: 'noise', label: 'Noise', icon: <Volume2 size={24} />, color: '#a855f7' },
    { value: 'illegal_parking', label: 'Parking', icon: <ParkingCircle size={24} />, color: '#64748b' },
    { value: 'sewage', label: 'Sewage', icon: <Bug size={24} />, color: '#854d0e' },
]

export default function ReportIncident() {
    const nav = useNavigate()
    const [form, setForm] = useState({
        type: '', title: '', description: '',
        location: { lat: '', lng: '', address: '', area: '', zone: '' },
        severity: 'medium', isEmergency: false
    })
    const [loading, setLoading] = useState(false)
    const [gpsLoading, setGpsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleTypeSelect = (type) => {
        setForm({ ...form, type })
        setError('')
    }

    const getGPSLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            return
        }
        setGpsLoading(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm({
                    ...form,
                    location: { ...form.location, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }
                })
                setGpsLoading(false)
            },
            (err) => { setError('Failed to get GPS location: ' + err.message); setGpsLoading(false) },
            { enableHighAccuracy: true }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!form.type) { setError('Please select an incident type'); return }
        if (!form.title || form.title.length < 10) { setError('Title must be at least 10 characters'); return }
        if (!form.location.lat || !form.location.lng) { setError('Location coordinates are required'); return }

        setLoading(true)
        try {
            const payload = {
                type: form.type,
                title: form.title,
                description: form.description,
                severity: form.severity,
                isEmergency: form.isEmergency,
                location: {
                    lat: parseFloat(form.location.lat),
                    lng: parseFloat(form.location.lng),
                    address: form.location.address,
                    area: form.location.area,
                    zone: form.location.zone
                }
            }
            await api.post('/incidents', payload)
            setSuccess(true)
            setTimeout(() => nav('/dashboard'), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to report incident')
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="page-container fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Incident Reported Successfully!</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Your report is being processed by our AI system and will be routed to the appropriate department.</p>
            </div>
        )
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Report an Incident</h1>
                    <p className="page-subtitle">Help improve your city by reporting civic issues</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Step 1: Type Selection */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>1. Select Issue Type *</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                        {INCIDENT_TYPES.map(t => (
                            <button
                                key={t.value} type="button"
                                onClick={() => handleTypeSelect(t.value)}
                                className="card"
                                style={{
                                    textAlign: 'center', cursor: 'pointer', padding: '1rem',
                                    borderColor: form.type === t.value ? t.color : 'var(--border-color)',
                                    background: form.type === t.value ? `${t.color}15` : 'transparent'
                                }}
                            >
                                <div style={{ color: t.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{t.icon}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Details */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>2. Incident Details *</h3>
                    <div className="form-group">
                        <label className="form-label">Title (min 10 characters)</label>
                        <input className="form-input" placeholder="Brief description of the issue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Severity Level</label>
                            <select className="form-input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                                <option value="low">Low - Minor nuisance</option>
                                <option value="medium">Medium - Needs attention</option>
                                <option value="high">High - Significant disruption</option>
                                <option value="critical">Critical - Immediate danger</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', color: 'var(--danger)' }}>
                                <input type="checkbox" checked={form.isEmergency} onChange={e => setForm({ ...form, isEmergency: e.target.checked })} />
                                Is this an emergency?
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Detailed Description</label>
                        <textarea className="form-textarea" placeholder="Provide more details about the issue..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
                    </div>
                </div>

                {/* Step 3: Location */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>3. Location *</h3>
                    <button type="button" className="btn btn-secondary" onClick={getGPSLocation} disabled={gpsLoading} style={{ marginBottom: '1rem' }}>
                        {gpsLoading ? <Loader size={16} className="animate-spin" /> : <MapPin size={16} />}
                        {gpsLoading ? 'Getting GPS...' : 'Use My GPS Location'}
                    </button>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Latitude</label>
                            <input className="form-input" type="number" step="any" placeholder="12.9716" value={form.location.lat} onChange={e => setForm({ ...form, location: { ...form.location, lat: e.target.value } })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Longitude</label>
                            <input className="form-input" type="number" step="any" placeholder="77.5946" value={form.location.lng} onChange={e => setForm({ ...form, location: { ...form.location, lng: e.target.value } })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address / Landmark</label>
                        <input className="form-input" placeholder="e.g. MG Road near Brigade Road junction" value={form.location.address} onChange={e => setForm({ ...form, location: { ...form.location, address: e.target.value } })} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Area</label>
                            <input className="form-input" placeholder="e.g. MG Road" value={form.location.area} onChange={e => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Zone</label>
                            <input className="form-input" placeholder="e.g. Central" value={form.location.zone} onChange={e => setForm({ ...form, location: { ...form.location, zone: e.target.value } })} />
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                    {loading ? <><Loader size={18} className="animate-spin" /> Submitting...</> : <><Send size={18} /> Submit Report</>}
                </button>
            </form>
        </div>
    )
}
