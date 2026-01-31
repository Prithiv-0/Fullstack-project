import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import {
    MapPin,
    AlertTriangle,
    Camera,
    Send,
    ArrowLeft,
    Loader,
    CheckCircle
} from 'lucide-react'
import './ReportIncident.css'

const incidentTypes = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'traffic', label: 'Traffic Issue', icon: '🚗' },
    { value: 'flooding', label: 'Flooding', icon: '🌊' },
    { value: 'streetlight', label: 'Street Light', icon: '💡' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'accident', label: 'Accident', icon: '🚨' },
    { value: 'water-leak', label: 'Water Leak', icon: '💧' },
    { value: 'road-damage', label: 'Road Damage', icon: '🛣️' },
    { value: 'public-safety', label: 'Safety Issue', icon: '🛡️' },
    { value: 'noise', label: 'Noise', icon: '🔊' },
    { value: 'illegal-parking', label: 'Illegal Parking', icon: '🅿️' },
    { value: 'sewage', label: 'Sewage', icon: '🚽' },
    { value: 'other', label: 'Other', icon: '📝' }
]

function ReportIncident() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: searchParams.get('type') || '',
        location: {
            coordinates: [77.5946, 12.9716], // Default: Bengaluru
            address: '',
            area: ''
        }
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [gettingLocation, setGettingLocation] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('location.')) {
            const field = name.split('.')[1]
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [field]: value }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
        setError('')
    }

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, type }))
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            return
        }

        setGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    }
                }))
                setGettingLocation(false)
            },
            (err) => {
                setError('Unable to get your location. Please enter the address manually.')
                setGettingLocation(false)
            }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.type) {
            setError('Please select an incident type')
            return
        }

        if (!formData.title || !formData.description) {
            setError('Please fill in all required fields')
            return
        }

        if (!formData.location.address) {
            setError('Please provide the incident location')
            return
        }

        setLoading(true)
        setError('')

        try {
            await api.post('/incidents', formData)
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card fade-in">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Report Submitted Successfully!</h2>
                    <p>Your incident has been logged and assigned to the appropriate department.</p>
                    <p className="redirect-text">Redirecting to dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container fade-in">
            <button className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="report-header">
                <h1 className="page-title">Report an Incident</h1>
                <p className="page-subtitle">Help us keep the city safe and well-maintained</p>
            </div>

            <form onSubmit={handleSubmit} className="report-form">
                {error && (
                    <div className="alert alert-danger">
                        <AlertTriangle size={18} />
                        {error}
                    </div>
                )}

                {/* Incident Type Selection */}
                <div className="form-section">
                    <h3 className="section-label">What type of incident is this? *</h3>
                    <div className="type-grid">
                        {incidentTypes.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                className={`type-card ${formData.type === type.value ? 'selected' : ''}`}
                                onClick={() => handleTypeSelect(type.value)}
                            >
                                <span className="type-icon">{type.icon}</span>
                                <span className="type-label">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title & Description */}
                <div className="form-section">
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="Brief title describing the issue"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                            name="description"
                            className="form-textarea"
                            placeholder="Provide more details about the incident. Include any relevant information that might help resolve the issue faster."
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="form-section">
                    <h3 className="section-label">
                        <MapPin size={18} />
                        Location *
                    </h3>

                    <button
                        type="button"
                        className="btn btn-secondary location-btn"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                    >
                        {gettingLocation ? (
                            <><Loader size={16} className="spinning" /> Getting location...</>
                        ) : (
                            <><MapPin size={16} /> Use Current Location</>
                        )}
                    </button>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Address *</label>
                            <input
                                type="text"
                                name="location.address"
                                className="form-input"
                                placeholder="Street address or landmark"
                                value={formData.location.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Area / Locality</label>
                            <input
                                type="text"
                                name="location.area"
                                className="form-input"
                                placeholder="e.g., Koramangala, Indiranagar"
                                value={formData.location.area}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="coordinates-display">
                        <span>Coordinates: {formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)}</span>
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? (
                            <><Loader size={18} className="spinning" /> Submitting...</>
                        ) : (
                            <><Send size={18} /> Submit Report</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ReportIncident
