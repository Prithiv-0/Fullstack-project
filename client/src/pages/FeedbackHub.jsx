import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Star, Clock, ArrowRight } from 'lucide-react'
import api from '../utils/api'

export default function FeedbackHub() {
    const [pendingIncidents, setPendingIncidents] = useState([])
    const [submittedFeedback, setSubmittedFeedback] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadFeedbackData = async () => {
            try {
                const [incidentsRes, feedbackRes] = await Promise.all([
                    api.get('/incidents/my?limit=100'),
                    api.get('/feedback/my')
                ])

                const incidents = incidentsRes.data.data || []
                const feedbackEntries = feedbackRes.data.data || []
                const submittedIncidentIds = new Set(feedbackEntries.map(entry => entry.incidentId?._id || entry.incidentId))

                setPendingIncidents(
                    incidents.filter(incident => ['resolved', 'closed'].includes(incident.status) && !submittedIncidentIds.has(incident._id))
                )
                setSubmittedFeedback(feedbackEntries)
            } catch (err) {
                console.error('Failed to load feedback dashboard', err)
            } finally {
                setLoading(false)
            }
        }

        loadFeedbackData()
    }, [])

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading feedback options...</p></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><MessageSquare size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Feedback Center</h1>
                    <p className="page-subtitle">Review completed incidents and submit service feedback.</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card"><div className="stat-value">{pendingIncidents.length}</div><div className="stat-label">Pending Reviews</div></div>
                <div className="stat-card"><div className="stat-value">{submittedFeedback.length}</div><div className="stat-label">Submitted Reviews</div></div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}>Ready for Feedback</h3>
                    {pendingIncidents.length === 0 ? (
                        <div className="empty-state"><p>No resolved incidents are waiting for feedback.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {pendingIncidents.map(incident => (
                                <div key={incident._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{incident.title}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                {incident.type?.replace(/_/g, ' ')} • {incident.location?.area || 'Location pending'}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Clock size={14} /> Updated {new Date(incident.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Link to={`/incidents/${incident._id}/feedback`} className="btn btn-primary btn-sm">
                                            Rate Now <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}>Recent Feedback</h3>
                    {submittedFeedback.length === 0 ? (
                        <div className="empty-state"><p>You have not submitted any feedback yet.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {submittedFeedback.slice(0, 8).map(entry => (
                                <div key={entry._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontWeight: 600 }}>{entry.incidentId?.title || 'Incident feedback'}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', marginTop: '0.35rem' }}>
                                        <Star size={16} fill="#f59e0b" /> {entry.rating}/5
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                        {entry.resolutionSatisfaction?.replace(/_/g, ' ') || 'Service feedback submitted'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                                        Submitted {new Date(entry.submittedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}