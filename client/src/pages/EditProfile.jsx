import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Save,
    Loader,
    CheckCircle,
    AlertCircle,
    Shield
} from 'lucide-react'
import './EditProfile.css'

function EditProfile() {
    const { user, updateUser } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
        setSuccess(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            setError('Name is required')
            return
        }

        if (!formData.email.trim()) {
            setError('Email is required')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await api.put('/auth/updateprofile', formData)
            updateUser(res.data.data)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container fade-in">
            <button className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="profile-page">
                <div className="profile-header-section">
                    <div className="profile-avatar">
                        <User size={48} />
                    </div>
                    <div>
                        <h1 className="page-title">Edit Profile</h1>
                        <p className="page-subtitle">Update your personal information</p>
                    </div>
                </div>

                <div className="profile-info-bar">
                    <div className="info-chip">
                        <Shield size={14} />
                        <span>Role: <strong>{user?.role}</strong></span>
                    </div>
                    <div className="info-chip">
                        <Mail size={14} />
                        <span>{user?.email}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    {error && (
                        <div className="alert alert-danger">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={18} />
                            Profile updated successfully!
                        </div>
                    )}

                    <div className="form-section">
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input with-icon"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address *</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input with-icon"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div className="input-wrapper">
                                <Phone className="input-icon" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input with-icon"
                                    placeholder="Your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? (
                                <><Loader size={18} className="spinning" /> Saving...</>
                            ) : (
                                <><Save size={18} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfile
