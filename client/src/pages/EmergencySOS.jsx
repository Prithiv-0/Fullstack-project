import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import {
    AlertTriangle,
    MapPin,
    Send,
    Loader,
    CheckCircle,
    AlertCircle,
    Siren,
    Phone,
    Flame,
    Zap,
    HeartPulse,
    ShieldAlert
} from 'lucide-react'
import './EmergencySOS.css'

const emergencyTypes = [
    { value: 'fire', label: 'Fire', icon: Flame, color: '#ef4444' },
    { value: 'medical', label: 'Medical', icon: HeartPulse, color: '#f59e0b' },
    { value: 'crime', label: 'Crime', icon: ShieldAlert, color: '#8b5cf6' },
    { value: 'accident', label: 'Accident', icon: Zap, color: '#f97316' },
    { value: 'natural-disaster', label: 'Disaster', icon: AlertTriangle, color: '#06b6d4' },
    { value: 'other', label: 'Other', icon: Siren, color: '#6b7280' },
]

function EmergencySOS() {
    const navigate = useNavigate()

    const [emergencyType, setEmergencyType] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState({
        coordinates: [77.5946, 12.9716],
        address: '',
        area: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [gettingLocation, setGettingLocation] = useState(true)
    const [locationAcquired, setLocationAcquired] = useState(false)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation(prev => ({
                        ...prev,
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    }))
                    setLocationAcquired(true)
                    setGettingLocation(false)
                },
                () => {
                    setGettingLocation(false)
                }
            )
        } else {
            setGettingLocation(false)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!emergencyType) {
            setError('Please select an emergency type')
            return
        }

        if (!description.trim()) {
            setError('Please briefly describe the emergency')
            return
        }

        setLoading(true)
        setError('')

        const typeMap = {
            'fire': 'public-safety',
            'medical': 'accident',
            'crime': 'public-safety',
            'accident': 'accident',
            'natural-disaster': 'flooding',
            'other': 'other'
        }

        try {
            await api.post('/incidents', {
                title: `🚨 EMERGENCY: ${emergencyTypes.find(t => t.value === emergencyType)?.label || 'SOS'}`,
                description: `[EMERGENCY SOS] ${description}`,
                type: typeMap[emergencyType] || 'public-safety',
                location: {
                    coordinates: location.coordinates,
                    address: location.address || 'Auto-detected location',
                    area: location.area || ''
                }
            })
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send SOS. Please call emergency services directly.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="page-container">
                <div className="sos-success-card fade-in">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Emergency Reported!</h2>
                    <p>Your SOS has been sent with <strong>CRITICAL</strong> priority.</p>
                    <p>Authorities have been notified immediately.</p>
                    <div className="emergency-contact-info">
                        <Phone size={18} />
                        <span>If in immediate danger, also call <strong>112</strong></span>
                    </div>
                    <p className="redirect-text">Redirecting to dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="sos-container fade-in">
            <div className="sos-page">
                <div className="sos-header">
                    <div className="sos-icon-wrapper">
                        <Siren size={48} />
                    </div>
                    <h1 className="sos-title">Emergency SOS</h1>
                    <p className="sos-subtitle">Report a critical emergency — help is on the way</p>
                </div>

                <div className="sos-emergency-banner">
                    <Phone size={16} />
                    <span>For life-threatening emergencies, also call <strong>112</strong> or <strong>100</strong></span>
                </div>

                <form onSubmit={handleSubmit} className="sos-form">
                    {error && (
                        <div className="alert alert-danger">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Emergency Type */}
                    <div className="form-section sos-section">
                        <h3 className="section-label">Type of Emergency *</h3>
                        <div className="emergency-type-grid">
                            {emergencyTypes.map(type => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        className={`emergency-type-card ${emergencyType === type.value ? 'selected' : ''}`}
                                        onClick={() => setEmergencyType(type.value)}
                                        style={{ '--card-color': type.color }}
                                    >
                                        <Icon size={28} />
                                        <span>{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-section sos-section">
                        <div className="form-group">
                            <label className="form-label">What's happening? *</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Briefly describe the emergency situation..."
                                value={description}
                                onChange={(e) => { setDescription(e.target.value); setError('') }}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-section sos-section">
                        <h3 className="section-label">
                            <MapPin size={18} />
                            Location
                        </h3>

                        <div className="location-status">
                            {gettingLocation ? (
                                <span className="location-detecting">
                                    <Loader size={14} className="spinning" /> Detecting your location...
                                </span>
                            ) : locationAcquired ? (
                                <span className="location-acquired">
                                    <CheckCircle size={14} /> Location acquired
                                </span>
                            ) : (
                                <span className="location-failed">
                                    <AlertTriangle size={14} /> Could not detect location — enter manually
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address / Landmark</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Nearest landmark or address"
                                value={location.address}
                                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="sos-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader size={22} className="spinning" /> Sending SOS...</>
                        ) : (
                            <><Siren size={22} /> Send Emergency SOS</>
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary sos-cancel"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EmergencySOS
