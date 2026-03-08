import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Search, Clock, MapPin, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_COLORS = { reported: '#3b82f6', acknowledged: '#8b5cf6', assigned: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#6b7280', rejected: '#ef4444' }

export default function TrackComplaint() {
    const [incidents, setIncidents] = useState([])
    const [searchId, setSearchId] = useState('')
    const [loading, setLoading] = useState(true)
    const [searched, setSearched] = useState(null)
    const [searchError, setSearchError] = useState('')

    useEffect(() => {
        api.get('/incidents/my?limit=20')
            .then(res => setIncidents(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchId.trim()) return
        setSearchError('')
        try {
            const res = await api.get(`/incidents/${searchId.trim()}`)
            setSearched(res.data.data)
        } catch (err) {
            setSearchError('Incident not found. Check the ID and try again.')
            setSearched(null)
        }
    }

    const StatusTimeline = ({ timeline }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {(timeline || []).map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[entry.status] || '#6b7280', marginTop: 6, flexShrink: 0 }} />
                    <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: STATUS_COLORS[entry.status] }}>{entry.status?.replace(/_/g, ' ')}</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.comment}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(entry.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Track Complaints</h1>
                    <p className="page-subtitle">Monitor the status of your reported incidents</p>
                </div>
            </div>

            {/* Search By ID */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}><Search size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Lookup by Incident ID</h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input className="form-input" placeholder="Paste incident ID" value={searchId} onChange={e => setSearchId(e.target.value)} style={{ flex: 1 }} />
                    <button type="submit" className="btn btn-primary"><Search size={16} /> Search</button>
                </form>
                {searchError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{searchError}</p>}
                {searched && (
                    <div className="card" style={{ marginTop: '1rem', borderLeft: `3px solid ${STATUS_COLORS[searched.status]}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ fontWeight: 700 }}>{searched.title}</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <span className={`badge badge-${searched.severity}`}>{searched.severity}</span>
                                    <span className="badge" style={{ background: `${STATUS_COLORS[searched.status]}22`, color: STATUS_COLORS[searched.status] }}>{searched.status?.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                            <Link to={`/incidents/${searched._id}`} className="btn btn-sm btn-secondary"><ArrowRight size={14} /></Link>
                        </div>
                        <StatusTimeline timeline={searched.timeline} />
                    </div>
                )}
            </div>

            {/* My Reports */}
            <div className="card">
                <h3 className="card-title" style={{ marginBottom: '1rem' }}>My Reports</h3>
                {loading ? <div className="loading-container" style={{ minHeight: 100 }}><div className="loading-spinner" /></div> : (
                    incidents.length === 0 ? (
                        <div className="empty-state"><p>No complaints submitted yet.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {incidents.map(inc => (
                                <Link key={inc._id} to={`/incidents/${inc._id}`} style={{ textDecoration: 'none' }}>
                                    <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{inc.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '1rem' }}>
                                                <span><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {inc.location?.area || '-'}</span>
                                                <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {new Date(inc.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <span className="badge" style={{ background: `${STATUS_COLORS[inc.status]}22`, color: STATUS_COLORS[inc.status] }}>
                                            {inc.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
