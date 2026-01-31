import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
    ArrowLeft,
    MapPin,
    Clock,
    User,
    Building2,
    Loader,
    AlertTriangle,
    CheckCircle,
    XCircle,
    MessageSquare,
    Send
} from 'lucide-react'
import './IncidentDetails.css'

function IncidentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [incident, setIncident] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [statusUpdate, setStatusUpdate] = useState({ status: '', comment: '' })
    const [showUpdateForm, setShowUpdateForm] = useState(false)

    useEffect(() => {
        fetchIncident()
    }, [id])

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`)
            setIncident(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (e) => {
        e.preventDefault()
        if (!statusUpdate.status) return

        setUpdating(true)
        try {
            await api.put(`/incidents/${id}`, statusUpdate)
            await fetchIncident()
            setShowUpdateForm(false)
            setStatusUpdate({ status: '', comment: '' })
        } catch (err) {
            console.error(err)
        } finally {
            setUpdating(false)
        }
    }

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <AlertTriangle className="severity-icon critical" />
            case 'high': return <AlertTriangle className="severity-icon high" />
            case 'medium': return <Clock className="severity-icon medium" />
            default: return <CheckCircle className="severity-icon low" />
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="loading-spinner" />
                <p>Loading incident details...</p>
            </div>
        )
    }

    if (!incident) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <XCircle size={48} />
                    <h3>Incident not found</h3>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        )
    }

    const canUpdateStatus = user?.role === 'official' || user?.role === 'admin'

    return (
        <div className="page-container fade-in">
            <button className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Back
            </button>

            <div className="incident-detail-card">
                {/* Header */}
                <div className="detail-header">
                    <div className="detail-badges">
                        <span className={`badge badge-${incident.severity}`}>
                            {getSeverityIcon(incident.severity)}
                            {incident.severity}
                        </span>
                        <span className={`status-pill status-${incident.status}`}>
                            {incident.status}
                        </span>
                        <span className="type-badge">{incident.type}</span>
                    </div>
                    {canUpdateStatus && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowUpdateForm(!showUpdateForm)}
                        >
                            Update Status
                        </button>
                    )}
                </div>

                {/* Title & Description */}
                <h1 className="detail-title">{incident.title}</h1>
                <p className="detail-description">{incident.description}</p>

                {/* Status Update Form */}
                {showUpdateForm && canUpdateStatus && (
                    <form onSubmit={handleStatusUpdate} className="status-update-form">
                        <h4><MessageSquare size={16} /> Update Incident Status</h4>
                        <div className="form-row">
                            <select
                                className="form-select"
                                value={statusUpdate.status}
                                onChange={(e) => setStatusUpdate(s => ({ ...s, status: e.target.value }))}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Add a comment..."
                                value={statusUpdate.comment}
                                onChange={(e) => setStatusUpdate(s => ({ ...s, comment: e.target.value }))}
                            />
                            <button type="submit" className="btn btn-primary" disabled={updating}>
                                {updating ? <Loader size={16} className="spinning" /> : <Send size={16} />}
                                {updating ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Info Grid */}
                <div className="detail-info-grid">
                    <div className="info-item">
                        <MapPin size={18} />
                        <div>
                            <span className="info-label">Location</span>
                            <span className="info-value">{incident.location?.address}</span>
                            {incident.location?.area && (
                                <span className="info-sub">{incident.location.area}, {incident.location.city}</span>
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <Clock size={18} />
                        <div>
                            <span className="info-label">Reported</span>
                            <span className="info-value">{new Date(incident.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <User size={18} />
                        <div>
                            <span className="info-label">Reported By</span>
                            <span className="info-value">{incident.reportedBy?.name || 'Anonymous'}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <Building2 size={18} />
                        <div>
                            <span className="info-label">Assigned Department</span>
                            <span className="info-value">{incident.assignedDepartment?.name || 'Pending Assignment'}</span>
                        </div>
                    </div>
                </div>

                {/* AI Classification */}
                {incident.aiClassification && (
                    <div className="ai-section">
                        <h3>🤖 AI Analysis</h3>
                        <div className="ai-info">
                            <div>
                                <span className="ai-label">Detected Type</span>
                                <span className="ai-value">{incident.aiClassification.detectedType}</span>
                            </div>
                            <div>
                                <span className="ai-label">Confidence</span>
                                <span className="ai-value">{(incident.aiClassification.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span className="ai-label">Priority Score</span>
                                <span className="ai-value">{incident.priority}/10</span>
                            </div>
                        </div>
                        {incident.aiClassification.keywords?.length > 0 && (
                            <div className="ai-keywords">
                                {incident.aiClassification.keywords.map((kw, i) => (
                                    <span key={i} className="keyword-tag">{kw}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Timeline */}
                {incident.timeline && incident.timeline.length > 0 && (
                    <div className="timeline-section">
                        <h3>📋 Timeline</h3>
                        <div className="timeline">
                            {incident.timeline.map((entry, i) => (
                                <div key={i} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className={`timeline-status status-${entry.status}`}>{entry.status}</span>
                                            <span className="timeline-date">{new Date(entry.updatedAt).toLocaleString()}</span>
                                        </div>
                                        {entry.comment && <p className="timeline-comment">{entry.comment}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Response Metrics */}
                {(incident.responseTime || incident.resolutionTime) && (
                    <div className="metrics-section">
                        <h3>⏱️ Response Metrics</h3>
                        <div className="metrics-grid">
                            {incident.responseTime && (
                                <div className="metric">
                                    <span className="metric-value">{incident.responseTime} min</span>
                                    <span className="metric-label">Response Time</span>
                                </div>
                            )}
                            {incident.resolutionTime && (
                                <div className="metric">
                                    <span className="metric-value">{Math.round(incident.resolutionTime / 60)} hrs</span>
                                    <span className="metric-label">Resolution Time</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default IncidentDetails
