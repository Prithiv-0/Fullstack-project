import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Shield, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import './VerifyIncident.css'

export default function VerifyIncident() {
    const { id } = useParams()
    const nav = useNavigate()
    const [incident, setIncident] = useState(null)
    const [verificationStatus, setVerificationStatus] = useState('valid')
    const [severityOverride, setSeverityOverride] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchIncident() }, [id])

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`)
            setIncident(res.data.data)
            setSeverityOverride(res.data.data?.severity || 'medium')
        } catch (err) { setError('Failed to load incident') }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true); setError('')
        try {
            await api.put(`/incidents/${id}/verify`, { verificationStatus, severityOverride, notes })
            nav(`/incidents/${id}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed')
        }
        setSubmitting(false)
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading...</p></div>
    if (!incident) return <div className="page-container"><div className="alert alert-danger">Incident not found</div></div>

    return (
        <div className="page-container fade-in">
            <button onClick={() => nav(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>

            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={36} color="var(--primary-400)" />
                    <h1 className="page-title" style={{ marginTop: '0.5rem' }}>Verify Incident</h1>
                </div>

                {/* Incident Summary */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{incident.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{incident.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${incident.severity}`}>{incident.severity}</span>
                        <span className="badge badge-status">{incident.type?.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {incident.location?.area || incident.location?.address || ''}</span>
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                {/* Verification Form (Form 4) */}
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Verification Decision</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {[
                                    { val: 'valid', label: 'Valid', icon: <CheckCircle size={18} />, color: '#10b981' },
                                    { val: 'false', label: 'False', icon: <XCircle size={18} />, color: '#ef4444' },
                                    { val: 'duplicate', label: 'Duplicate', icon: <AlertTriangle size={18} />, color: '#f59e0b' }
                                ].map(opt => (
                                    <button key={opt.val} type="button"
                                        onClick={() => setVerificationStatus(opt.val)}
                                        className="card"
                                        style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '1rem', borderColor: verificationStatus === opt.val ? opt.color : 'var(--border-color)', background: verificationStatus === opt.val ? `${opt.color}15` : 'transparent' }}>
                                        <div style={{ color: opt.color, marginBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>{opt.icon}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{opt.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {verificationStatus === 'valid' && (
                            <div className="form-group">
                                <label className="form-label">Severity Override</label>
                                <select className="form-select" value={severityOverride} onChange={e => setSeverityOverride(e.target.value)}>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea className="form-textarea" placeholder="Add verification notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                        {submitting ? 'Processing...' : <><Shield size={18} /> Submit Verification</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
