/**
 * @file TrackComplaint.jsx - Complaint Tracking Page
 * @description Enables citizens to track their reported incidents with a status timeline,
 * showing the progression of each complaint from submission to resolution.
 */

import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Search, Clock, MapPin, CheckCircle, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Building } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_COLORS = { reported: '#3b82f6', acknowledged: '#8b5cf6', assigned: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#6b7280', rejected: '#ef4444' }

export default function TrackComplaint() {
    const [incidents, setIncidents] = useState([])
    const [searchId, setSearchId] = useState('')
    const [loading, setLoading] = useState(true)
    const [searched, setSearched] = useState(null)
    const [searchError, setSearchError] = useState('')
    const [expandedIds, setExpandedIds] = useState(new Set())
    const [incidentDetails, setIncidentDetails] = useState({})

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

    const toggleExpand = async (id, e) => {
        e.preventDefault()
        e.stopPropagation()
        const newExpanded = new Set(expandedIds)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
            if (!incidentDetails[id]) {
                try {
                    const res = await api.get(`/incidents/${id}`)
                    setIncidentDetails(prev => ({ ...prev, [id]: res.data.data }))
                } catch (err) {
                    console.error("Failed to load details", err)
                }
            }
        }
        setExpandedIds(newExpanded)
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
                        {searched.assignment?.departmentId && (
                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <Building size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>
                                Assigned to: <strong>{searched.assignment.departmentId.name}</strong>
                                {searched.assignment.slaDueBy && ` (SLA: ${new Date(searched.assignment.slaDueBy).toLocaleString()})`}
                            </div>
                        )}
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
                            {incidents.map(inc => {
                                const isExpanded = expandedIds.has(inc._id);
                                const details = incidentDetails[inc._id] || inc;
                                return (
                                <div key={inc._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.2s' }} onClick={(e) => toggleExpand(inc._id, e)} className="hover-bg-light">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{inc.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} /> {inc.location?.area || '-'}</span>
                                                <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} /> {new Date(inc.createdAt).toLocaleDateString()}</span>
                                                <span className="badge" style={{ background: `${STATUS_COLORS[inc.status]}22`, color: STATUS_COLORS[inc.status], padding: '2px 6px', fontSize: '0.7rem' }}>
                                                    {inc.status?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress Details</h4>
                                                <Link to={`/incidents/${inc._id}`} className="btn btn-sm btn-secondary" onClick={e => e.stopPropagation()}>Full Details <ArrowRight size={14} style={{ marginLeft: 4 }} /></Link>
                                            </div>
                                            
                                            {details.assignment?.departmentId && (
                                                <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                        <Building size={16} color="var(--primary-400)" />
                                                        <strong>Assigned Department:</strong> {details.assignment.departmentId.name || details.assignment.departmentId}
                                                    </div>
                                                    {details.assignment.slaDueBy && (
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1.5rem' }}>
                                                            SLA Deadline: {new Date(details.assignment.slaDueBy).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                                <StatusTimeline timeline={details.timeline} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
