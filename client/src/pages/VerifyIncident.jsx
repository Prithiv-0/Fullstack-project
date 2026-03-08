import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
    ArrowLeft,
    MapPin,
    Clock,
    User,
    Loader,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Send,
    ClipboardCheck,
    Eye,
    DollarSign,
    Calendar,
    Wrench,
    ShieldCheck,
    XCircle,
    Copy,
    Info
} from 'lucide-react'
import './VerifyIncident.css'

const verificationStatuses = [
    { value: 'verified-valid', label: 'Valid — Confirmed', icon: CheckCircle, color: '#10b981', desc: 'Incident is genuine and needs action' },
    { value: 'verified-invalid', label: 'Invalid — Rejected', icon: XCircle, color: '#ef4444', desc: 'False report or misinformation' },
    { value: 'duplicate', label: 'Duplicate', icon: Copy, color: '#f59e0b', desc: 'Already reported by another citizen' },
    { value: 'needs-more-info', label: 'Needs More Info', icon: Info, color: '#3b82f6', desc: 'Requires additional details from reporter' },
]

const actionOptions = [
    { value: 'immediate', label: 'Immediate Action', desc: 'Deploy resources now', color: '#ef4444' },
    { value: 'scheduled', label: 'Scheduled Repair', desc: 'Plan repair within timeline', color: '#f59e0b' },
    { value: 'monitoring', label: 'Monitor Only', desc: 'Keep under observation', color: '#3b82f6' },
    { value: 'no-action', label: 'No Action Needed', desc: 'Self-resolving or minor', color: '#6b7280' },
    { value: 'escalate', label: 'Escalate', desc: 'Needs higher authority', color: '#8b5cf6' },
]

const incidentTypeOptions = [
    { value: 'pothole', label: 'Pothole' },
    { value: 'traffic', label: 'Traffic Issue' },
    { value: 'flooding', label: 'Flooding' },
    { value: 'streetlight', label: 'Street Light' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'accident', label: 'Accident' },
    { value: 'water-leak', label: 'Water Leak' },
    { value: 'road-damage', label: 'Road Damage' },
    { value: 'public-safety', label: 'Safety Issue' },
    { value: 'noise', label: 'Noise' },
    { value: 'illegal-parking', label: 'Illegal Parking' },
    { value: 'sewage', label: 'Sewage' },
    { value: 'other', label: 'Other' },
]

function VerifyIncident() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [incident, setIncident] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        verificationStatus: '',
        onSiteInspection: false,
        inspectionNotes: '',
        confirmedSeverity: '',
        confirmedType: '',
        estimatedCost: '',
        estimatedResolutionDays: '',
        resourcesRequired: '',
        actionRecommended: '',
        comment: ''
    })

    useEffect(() => {
        fetchIncident()
    }, [id])

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`)
            const inc = res.data.data
            setIncident(inc)

            // Pre-fill with existing values
            setFormData(prev => ({
                ...prev,
                confirmedSeverity: inc.severity || '',
                confirmedType: inc.type || '',
                verificationStatus: inc.verification?.verificationStatus || '',
                onSiteInspection: inc.verification?.onSiteInspection || false,
                inspectionNotes: inc.verification?.inspectionNotes || '',
                estimatedCost: inc.verification?.estimatedCost || '',
                estimatedResolutionDays: inc.verification?.estimatedResolutionDays || '',
                resourcesRequired: inc.verification?.resourcesRequired || '',
                actionRecommended: inc.verification?.actionRecommended || '',
            }))
        } catch (err) {
            setError('Failed to load incident')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.verificationStatus) {
            setError('Please select a verification status')
            return
        }

        if (!formData.confirmedSeverity) {
            setError('Please confirm the severity level')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            await api.put(`/incidents/${id}`, {
                verification: {
                    verificationStatus: formData.verificationStatus,
                    onSiteInspection: formData.onSiteInspection,
                    inspectionNotes: formData.inspectionNotes,
                    confirmedSeverity: formData.confirmedSeverity,
                    confirmedType: formData.confirmedType,
                    estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
                    estimatedResolutionDays: formData.estimatedResolutionDays ? Number(formData.estimatedResolutionDays) : undefined,
                    resourcesRequired: formData.resourcesRequired,
                    actionRecommended: formData.actionRecommended,
                },
                comment: formData.comment || `Incident verification: ${formData.verificationStatus}`
            })
            setSuccess(true)
            setTimeout(() => navigate(`/incidents/${id}`), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit verification')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="loading-spinner" />
                <p>Loading incident...</p>
            </div>
        )
    }

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card fade-in">
                    <ShieldCheck size={64} className="success-icon" />
                    <h2>Verification Submitted!</h2>
                    <p>The incident has been verified and updated successfully.</p>
                    <p className="redirect-text">Redirecting to incident details...</p>
                </div>
            </div>
        )
    }

    const alreadyVerified = incident?.verification?.isVerified

    return (
        <div className="page-container fade-in">
            <button className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="verify-page">
                <div className="verify-header">
                    <div className="verify-header-icon">
                        <ClipboardCheck size={36} />
                    </div>
                    <h1 className="page-title">Incident Verification</h1>
                    <p className="page-subtitle">Review and verify reported incident details</p>
                </div>

                {alreadyVerified && (
                    <div className="alert alert-info verify-already-badge">
                        <ShieldCheck size={18} />
                        This incident was previously verified on {new Date(incident.verification.verifiedAt).toLocaleString()}.
                        You can re-verify to update the assessment.
                    </div>
                )}

                {/* Incident Summary Card */}
                {incident && (
                    <div className="verify-incident-summary">
                        <div className="summary-row">
                            <div className="summary-badges">
                                <span className={`badge badge-${incident.severity}`}>{incident.severity}</span>
                                <span className={`status-pill status-${incident.status}`}>{incident.status}</span>
                                <span className="type-badge-v">{incident.type}</span>
                            </div>
                            <span className="summary-date">
                                <Clock size={14} />
                                {new Date(incident.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <h3 className="summary-title">{incident.title}</h3>
                        <p className="summary-desc">{incident.description}</p>
                        <div className="summary-meta">
                            <span><MapPin size={14} /> {incident.location?.address || 'N/A'}{incident.location?.area ? `, ${incident.location.area}` : ''}</span>
                            <span><User size={14} /> {incident.reportedBy?.name || 'Anonymous'}</span>
                        </div>

                        {incident.aiClassification && (
                            <div className="summary-ai">
                                <span>🤖 AI: {incident.aiClassification.detectedType} ({(incident.aiClassification.confidence * 100).toFixed(0)}% confidence)</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Verification Form */}
                <form onSubmit={handleSubmit} className="verify-form">
                    {error && (
                        <div className="alert alert-danger">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Section 1 — Verification Decision */}
                    <div className="verify-section">
                        <h3 className="verify-section-title">
                            <ShieldCheck size={18} />
                            Verification Decision *
                        </h3>
                        <div className="verification-status-grid">
                            {verificationStatuses.map(vs => {
                                const Icon = vs.icon
                                return (
                                    <button
                                        key={vs.value}
                                        type="button"
                                        className={`vs-card ${formData.verificationStatus === vs.value ? 'selected' : ''}`}
                                        style={{ '--vs-color': vs.color }}
                                        onClick={() => setFormData(prev => ({ ...prev, verificationStatus: vs.value }))}
                                    >
                                        <Icon size={22} />
                                        <span className="vs-label">{vs.label}</span>
                                        <span className="vs-desc">{vs.desc}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Section 2 — On-site Inspection */}
                    <div className="verify-section">
                        <h3 className="verify-section-title">
                            <Eye size={18} />
                            On-Site Inspection
                        </h3>

                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="onSiteInspection"
                                checked={formData.onSiteInspection}
                                onChange={handleChange}
                            />
                            <span className="checkbox-custom" />
                            <span className="checkbox-label">On-site inspection was conducted</span>
                        </label>

                        <div className="form-group">
                            <label className="form-label">Inspection Notes</label>
                            <textarea
                                name="inspectionNotes"
                                className="form-textarea"
                                placeholder="Document your observations from the site visit, current conditions, any dangers noted, evidence collected..."
                                value={formData.inspectionNotes}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Section 3 — Severity & Type Confirmation */}
                    <div className="verify-section">
                        <h3 className="verify-section-title">
                            <AlertTriangle size={18} />
                            Confirm Severity & Type *
                        </h3>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">Confirmed Severity *</label>
                                <div className="severity-selector">
                                    {['low', 'medium', 'high', 'critical'].map(sev => (
                                        <button
                                            key={sev}
                                            type="button"
                                            className={`severity-btn severity-${sev} ${formData.confirmedSeverity === sev ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, confirmedSeverity: sev }))}
                                        >
                                            {sev}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirmed Type</label>
                                <select
                                    name="confirmedType"
                                    className="form-select"
                                    value={formData.confirmedType}
                                    onChange={handleChange}
                                >
                                    <option value="">— Keep Original —</option>
                                    {incidentTypeOptions.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 — Resource & Cost Estimation */}
                    <div className="verify-section">
                        <h3 className="verify-section-title">
                            <DollarSign size={18} />
                            Resource & Cost Estimation
                        </h3>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label className="form-label">
                                    <DollarSign size={14} />
                                    Estimated Cost (₹)
                                </label>
                                <input
                                    type="number"
                                    name="estimatedCost"
                                    className="form-input"
                                    placeholder="e.g., 50000"
                                    value={formData.estimatedCost}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Calendar size={14} />
                                    Est. Resolution (Days)
                                </label>
                                <input
                                    type="number"
                                    name="estimatedResolutionDays"
                                    className="form-input"
                                    placeholder="e.g., 7"
                                    value={formData.estimatedResolutionDays}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Wrench size={14} />
                                    Resources Required
                                </label>
                                <input
                                    type="text"
                                    name="resourcesRequired"
                                    className="form-input"
                                    placeholder="e.g., 2 workers, JCB machine"
                                    value={formData.resourcesRequired}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 5 — Recommended Action */}
                    <div className="verify-section">
                        <h3 className="verify-section-title">
                            <Wrench size={18} />
                            Recommended Action
                        </h3>

                        <div className="action-grid">
                            {actionOptions.map(act => (
                                <button
                                    key={act.value}
                                    type="button"
                                    className={`action-card ${formData.actionRecommended === act.value ? 'selected' : ''}`}
                                    style={{ '--action-color': act.color }}
                                    onClick={() => setFormData(prev => ({ ...prev, actionRecommended: act.value }))}
                                >
                                    <span className="action-dot" />
                                    <div>
                                        <span className="action-label">{act.label}</span>
                                        <span className="action-desc">{act.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section 6 — Verification Comment */}
                    <div className="verify-section">
                        <div className="form-group">
                            <label className="form-label">Verification Comment / Notes</label>
                            <textarea
                                name="comment"
                                className="form-textarea"
                                placeholder="Add any additional notes, instructions for the response team, or observations..."
                                value={formData.comment}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="verify-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                            {submitting ? (
                                <><Loader size={18} className="spinning" /> Submitting...</>
                            ) : (
                                <><Send size={18} /> Submit Verification</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VerifyIncident
