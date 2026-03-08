import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { MapPin, Clock, AlertTriangle, CheckCircle, User, ArrowLeft, Shield, Building, MessageSquare } from 'lucide-react'
import './IncidentDetails.css'

const SEVERITY_COLORS = { critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#22c55e' }
const STATUS_COLORS = { reported: '#3b82f6', acknowledged: '#8b5cf6', assigned: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#6b7280', rejected: '#ef4444' }

export default function IncidentDetails() {
    const { id } = useParams()
    const { user } = useAuth()
    const nav = useNavigate()
    const [incident, setIncident] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchIncident() }, [id])

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`)
            setIncident(res.data.data)
        } catch (err) {
            setError('Failed to load incident')
        }
        setLoading(false)
    }

    const handleAction = async (action, body = {}) => {
        setActionLoading(true)
        try {
            await api.put(`/incidents/${id}/${action}`, body)
            await fetchIncident()
        } catch (err) {
            setError(err.response?.data?.error || 'Action failed')
        }
        setActionLoading(false)
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading incident...</p></div>
    if (error && !incident) return <div className="page-container"><div className="alert alert-danger">{error}</div><Link to="/dashboard" className="btn btn-secondary"><ArrowLeft size={16} /> Back</Link></div>
    if (!incident) return null

    const isAdmin = user?.role === 'admin'
    const isOfficer = ['field_officer', 'government_official'].includes(user?.role)

    return (
        <div className="page-container fade-in">
            <button onClick={() => nav(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Header */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{incident.title}</h1>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span className={`badge badge-${incident.severity}`}>{incident.severity}</span>
                            <span className="badge" style={{ background: `${STATUS_COLORS[incident.status]}22`, color: STATUS_COLORS[incident.status] }}>
                                {incident.status?.replace(/_/g, ' ')}
                            </span>
                            <span className="badge badge-status">{incident.type?.replace(/_/g, ' ')}</span>
                            {incident.isVerified && <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><CheckCircle size={12} /> Verified</span>}
                            {incident.isFalse && <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>False Report</span>}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>ID: {incident.incidentId?.slice(0, 8) || incident._id?.slice(-8)}</div>
                        <div><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(incident.createdAt).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {/* Description */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Description</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{incident.description || 'No description provided'}</p>
                </div>

                {/* Location */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '0.75rem' }}><MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Location</h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <p><strong>Address:</strong> {incident.location?.address || '-'}</p>
                        <p><strong>Area:</strong> {incident.location?.area || '-'}</p>
                        <p><strong>Zone:</strong> {incident.location?.zone || '-'}</p>
                        <p><strong>Coordinates:</strong> {incident.location?.lat}, {incident.location?.lng}</p>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {/* Reporter */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '0.75rem' }}><User size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reporter</h3>
                    <p>{incident.reportedBy?.name || 'Unknown'}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{incident.reportedBy?.email}</p>
                </div>

                {/* Assignment */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '0.75rem' }}><Building size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Assignment</h3>
                    {incident.assignment ? (
                        <div style={{ fontSize: '0.9rem' }}>
                            <p><strong>Department:</strong> {incident.assignment.departmentId?.name || '-'}</p>
                            <p><strong>Officer:</strong> {incident.assignment.officerId?.name || 'Unassigned'}</p>
                            <p><strong>Status:</strong> {incident.assignment.status?.replace(/_/g, ' ')}</p>
                            <p><strong>SLA Due:</strong> {incident.assignment.slaDueBy ? new Date(incident.assignment.slaDueBy).toLocaleString() : '-'}</p>
                        </div>
                    ) : <p style={{ color: 'var(--text-secondary)' }}>Not yet assigned</p>}
                </div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 className="card-title" style={{ marginBottom: '1rem' }}>Timeline</h3>
                {incident.timeline?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {incident.timeline.map((entry, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', paddingLeft: '1rem', borderLeft: `2px solid ${STATUS_COLORS[entry.status] || '#6b7280'}` }}>
                                <div>
                                    <span className="badge" style={{ background: `${STATUS_COLORS[entry.status]}22`, color: STATUS_COLORS[entry.status], marginBottom: '0.25rem' }}>{entry.status?.replace(/_/g, ' ')}</span>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.comment}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(entry.updatedAt).toLocaleString()} {entry.updatedBy?.name ? `by ${entry.updatedBy.name}` : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p style={{ color: 'var(--text-secondary)' }}>No timeline entries</p>}
            </div>

            {/* Actions */}
            {(isAdmin || isOfficer) && (
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}>Actions</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {isAdmin && incident.status === 'reported' && (
                            <>
                                <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleAction('verify', { verificationStatus: 'valid' })}><CheckCircle size={16} /> Verify</button>
                                <button className="btn btn-danger" disabled={actionLoading} onClick={() => handleAction('verify', { verificationStatus: 'false' })}><AlertTriangle size={16} /> Mark False</button>
                            </>
                        )}
                        {isAdmin && ['acknowledged', 'reported'].includes(incident.status) && (
                            <Link to={`/incidents/${id}/verify`} className="btn btn-secondary"><Shield size={16} /> Full Verification</Link>
                        )}
                        {(isOfficer || isAdmin) && ['assigned', 'acknowledged'].includes(incident.status) && (
                            <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleAction('acknowledge')}><CheckCircle size={16} /> Start Work</button>
                        )}
                        {(isOfficer || isAdmin) && incident.status === 'in_progress' && (
                            <button className="btn btn-primary" disabled={actionLoading} onClick={() => handleAction('resolve', { action: 'Issue resolved', resolutionStatus: 'resolved' })}><CheckCircle size={16} /> Mark Resolved</button>
                        )}
                        {isAdmin && incident.status === 'resolved' && (
                            <button className="btn btn-secondary" disabled={actionLoading} onClick={() => handleAction('close')}><CheckCircle size={16} /> Close</button>
                        )}
                        {incident.status === 'resolved' && incident.reportedBy?._id === user?.id && (
                            <Link to={`/incidents/${id}/feedback`} className="btn btn-secondary"><MessageSquare size={16} /> Give Feedback</Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
