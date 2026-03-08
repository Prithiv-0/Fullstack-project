import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import {
    ArrowLeft,
    Building2,
    Send,
    Loader,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Mail
} from 'lucide-react'
import './ContactDepartment.css'

const priorityOptions = [
    { value: 'low', label: 'Low', desc: 'General inquiry', color: 'var(--severity-low)' },
    { value: 'medium', label: 'Medium', desc: 'Needs attention', color: 'var(--severity-medium)' },
    { value: 'high', label: 'High', desc: 'Urgent matter', color: 'var(--severity-high)' },
]

function ContactDepartment() {
    const navigate = useNavigate()

    const [departments, setDepartments] = useState([])
    const [formData, setFormData] = useState({
        department: '',
        subject: '',
        message: '',
        priority: 'medium'
    })
    const [loading, setLoading] = useState(false)
    const [fetchingDepts, setFetchingDepts] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments')
            setDepartments(res.data.data)
        } catch (err) {
            console.error('Failed to fetch departments:', err)
        } finally {
            setFetchingDepts(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.department) {
            setError('Please select a department')
            return
        }

        if (!formData.subject.trim()) {
            setError('Please enter a subject')
            return
        }

        if (!formData.message.trim()) {
            setError('Please enter your message')
            return
        }

        setLoading(true)
        setError('')

        try {
            await api.post('/departments/contact', formData)
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 2500)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card fade-in">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Message Sent!</h2>
                    <p>Your message has been delivered to the department. They will respond soon.</p>
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

            <div className="contact-page">
                <div className="contact-header">
                    <div className="contact-header-icon">
                        <Mail size={36} />
                    </div>
                    <h1 className="page-title">Contact Department</h1>
                    <p className="page-subtitle">Send a message or inquiry to a city department</p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">
                    {error && (
                        <div className="alert alert-danger">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Department Selection */}
                    <div className="form-section">
                        <h3 className="section-label">
                            <Building2 size={18} />
                            Select Department *
                        </h3>

                        {fetchingDepts ? (
                            <div className="loading-mini">
                                <Loader size={16} className="spinning" />
                                Loading departments...
                            </div>
                        ) : (
                            <div className="department-grid">
                                {departments.map(dept => (
                                    <button
                                        key={dept._id}
                                        type="button"
                                        className={`dept-card ${formData.department === dept._id ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, department: dept._id })}
                                    >
                                        <Building2 size={22} />
                                        <span className="dept-name">{dept.name}</span>
                                        <span className="dept-code">{dept.code}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Subject & Message */}
                    <div className="form-section">
                        <div className="form-group">
                            <label className="form-label">Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                className="form-input"
                                placeholder="Brief subject of your message"
                                value={formData.subject}
                                onChange={handleChange}
                                maxLength={150}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message *</label>
                            <textarea
                                name="message"
                                className="form-textarea"
                                placeholder="Write your message, query, or suggestion to the department..."
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                maxLength={2000}
                            />
                            <span className="char-count">{formData.message.length}/2000</span>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="form-section">
                        <h3 className="section-label">
                            <MessageSquare size={18} />
                            Priority
                        </h3>
                        <div className="priority-options">
                            {priorityOptions.map(opt => (
                                <label
                                    key={opt.value}
                                    className={`priority-option ${formData.priority === opt.value ? 'selected' : ''}`}
                                    style={{ '--priority-color': opt.color }}
                                >
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={opt.value}
                                        checked={formData.priority === opt.value}
                                        onChange={handleChange}
                                    />
                                    <div className="priority-indicator" />
                                    <div>
                                        <span className="priority-label">{opt.label}</span>
                                        <span className="priority-desc">{opt.desc}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? (
                                <><Loader size={18} className="spinning" /> Sending...</>
                            ) : (
                                <><Send size={18} /> Send Message</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ContactDepartment
