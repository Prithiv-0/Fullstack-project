import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
    ArrowLeft,
    Star,
    Send,
    Loader,
    CheckCircle,
    AlertCircle,
    AlertTriangle
} from 'lucide-react'
import './FeedbackForm.css'

function FeedbackForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [incident, setIncident] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')

    useEffect(() => {
        fetchIncident()
    }, [id])

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`)
            setIncident(res.data.data)

            if (res.data.data.feedback?.rating) {
                setRating(res.data.data.feedback.rating)
                setComment(res.data.data.feedback.comment || '')
            }
        } catch (err) {
            setError('Failed to load incident')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            await api.post(`/incidents/${id}/feedback`, { rating, comment })
            setSuccess(true)
            setTimeout(() => navigate(`/incidents/${id}`), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit feedback')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="loading-spinner" />
                <p>Loading...</p>
            </div>
        )
    }

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card fade-in">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Feedback Submitted!</h2>
                    <p>Thank you for helping us improve our services.</p>
                    <p className="redirect-text">Redirecting...</p>
                </div>
            </div>
        )
    }

    const isResolved = incident?.status === 'resolved' || incident?.status === 'closed'
    const isReporter = incident?.reportedBy?._id === user?.id || incident?.reportedBy === user?.id
    const alreadyFeedback = incident?.feedback?.rating

    return (
        <div className="page-container fade-in">
            <button className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="feedback-page">
                <div className="feedback-header">
                    <h1 className="page-title">Rate Resolution</h1>
                    <p className="page-subtitle">Share your experience about how this incident was handled</p>
                </div>

                {/* Incident Context */}
                {incident && (
                    <div className="feedback-incident-card">
                        <div className="incident-context-header">
                            <span className="type-badge">{incident.type}</span>
                            <span className={`status-pill status-${incident.status}`}>{incident.status}</span>
                        </div>
                        <h3>{incident.title}</h3>
                        <p className="incident-context-desc">{incident.description?.substring(0, 150)}...</p>
                    </div>
                )}

                {!isResolved && (
                    <div className="alert alert-warning">
                        <AlertTriangle size={18} />
                        This incident must be resolved before you can provide feedback.
                    </div>
                )}

                {!isReporter && (
                    <div className="alert alert-warning">
                        <AlertTriangle size={18} />
                        Only the person who reported this incident can provide feedback.
                    </div>
                )}

                {alreadyFeedback && (
                    <div className="alert alert-info">
                        <AlertCircle size={18} />
                        You have already submitted feedback for this incident.
                    </div>
                )}

                {isResolved && isReporter && (
                    <form onSubmit={handleSubmit} className="feedback-form">
                        {error && (
                            <div className="alert alert-danger">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="form-section">
                            <h3 className="section-label">How would you rate the resolution? *</h3>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        <Star
                                            size={40}
                                            fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="rating-text">
                                {rating === 1 && '😞 Poor'}
                                {rating === 2 && '😐 Below Average'}
                                {rating === 3 && '🙂 Average'}
                                {rating === 4 && '😊 Good'}
                                {rating === 5 && '🌟 Excellent'}
                                {rating === 0 && 'Select a rating'}
                            </p>
                        </div>

                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label">Additional Comments</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Tell us more about your experience. Was the issue fully resolved? How was the response time?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || alreadyFeedback}>
                                {submitting ? (
                                    <><Loader size={18} className="spinning" /> Submitting...</>
                                ) : (
                                    <><Send size={18} /> Submit Feedback</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default FeedbackForm
