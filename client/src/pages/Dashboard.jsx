/**
 * Dashboard.jsx - Main Dashboard Page Component
 *
 * The primary landing page after login. Shows role-specific content:
 *  - Citizens: Recent incidents, quick actions (report, track, feedback)
 *  - Officers: Assigned incidents, workload overview
 *  - Officials/Admin: City-wide stats, severity distribution, department load
 *
 * Fetches incident data and analytics stats from the API and renders
 * stat cards, recent incident lists, and quick-action navigation links.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { AlertTriangle, MapPin, Clock, CheckCircle, Plus, Bell, FileText, Shield, TrendingUp, Activity } from 'lucide-react'

export default function Dashboard() {
    const { user } = useAuth()

    // Route to role-specific dashboard content
    if (user?.role === 'admin') return <AdminDash />
    if (user?.role === 'government_official' || user?.role === 'field_officer') return <OfficialDash />
    return <CitizenDash />
}

function CitizenDash() {
    const { user } = useAuth()
    const [incidents, setIncidents] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMyIncidents()
    }, [])

    const fetchMyIncidents = async () => {
        try {
            const res = await api.get('/incidents/my?limit=5')
            const data = res.data.data || []
            setIncidents(data)

            const total = res.data.total || data.length
            const active = data.filter(i => !['resolved', 'closed', 'rejected'].includes(i.status)).length
            const resolved = data.filter(i => i.status === 'resolved' || i.status === 'closed').length

            setStats({ total, active, resolved })
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    const getStatusColor = (status) => {
        const colors = { reported: '#3b82f6', acknowledged: '#8b5cf6', assigned: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#6b7280', rejected: '#ef4444' }
        return colors[status] || '#6b7280'
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading dashboard...</p></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome, {user?.name}</h1>
                    <p className="page-subtitle">Your civic reporting dashboard</p>
                </div>
                <Link to="/report" className="btn btn-primary"><Plus size={18} /> Report Incident</Link>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Reports</div>
                </div>
                <div className="stat-card" style={{ '--gradient-primary': 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <div className="stat-value">{stats.active}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card" style={{ '--gradient-primary': 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <div className="stat-value">{stats.resolved}</div>
                    <div className="stat-label">Resolved</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Link to="/report" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.5rem' }}>
                    <AlertTriangle size={28} color="#f59e0b" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Report Issue</p>
                </Link>
                <Link to="/emergency" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.5rem' }}>
                    <Shield size={28} color="#ef4444" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Emergency SOS</p>
                </Link>
                <Link to="/contact" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.5rem' }}>
                    <FileText size={28} color="#3b82f6" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Contact Dept</p>
                </Link>
                <Link to="/profile" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.5rem' }}>
                    <Bell size={28} color="#8b5cf6" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>My Profile</p>
                </Link>
            </div>

            {/* Recent Reports */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Reports</h2>
                    <Link to="/report" className="btn btn-sm btn-secondary">View All</Link>
                </div>
                {incidents.length === 0 ? (
                    <div className="empty-state"><p>No reports yet. Submit your first incident report!</p></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {incidents.map(inc => (
                            <Link key={inc._id} to={`/incidents/${inc._id}`} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{inc.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                            <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {inc.location?.area || 'Unknown'}</span>
                                            <span><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(inc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="badge" style={{ background: `${getStatusColor(inc.status)}22`, color: getStatusColor(inc.status) }}>
                                        {inc.status?.replace(/_/g, ' ')}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function OfficialDash() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [criticalFeed, setCriticalFeed] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const [dashRes, critRes] = await Promise.all([
                api.get('/analytics/dashboard').catch(() => ({ data: { data: {} } })),
                api.get('/analytics/critical-feed').catch(() => ({ data: { data: [] } }))
            ])
            setStats(dashRes.data.data)
            setCriticalFeed(critRes.data.data || [])
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading command center...</p></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Command Center</h1>
                    <p className="page-subtitle">Real-time city intelligence for {user?.name}</p>
                </div>
                <Link to="/command-center" className="btn btn-primary"><Activity size={18} /> Live Map</Link>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card"><div className="stat-value">{stats?.totalIncidents || 0}</div><div className="stat-label">Total Incidents</div></div>
                <div className="stat-card"><div className="stat-value">{stats?.activeIncidents || 0}</div><div className="stat-label">Active</div></div>
                <div className="stat-card"><div className="stat-value">{stats?.resolvedToday || 0}</div><div className="stat-label">Resolved Today</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: stats?.criticalActive > 0 ? 'var(--danger)' : 'inherit' }}>{stats?.criticalActive || 0}</div><div className="stat-label">Critical Active</div></div>
                <div className="stat-card"><div className="stat-value">{stats?.pendingAction || 0}</div><div className="stat-label">Pending Action</div></div>
                <div className="stat-card"><div className="stat-value">{stats?.avgResponseTimeHours || 0}h</div><div className="stat-label">Avg Response</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: stats?.slaBreachCount > 0 ? 'var(--danger)' : 'inherit' }}>{stats?.slaBreachCount || 0}</div><div className="stat-label">SLA Breaches</div></div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Link to="/command-center" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.25rem' }}>
                    <MapPin size={24} color="#3b82f6" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Command Center</p>
                </Link>
                <Link to="/analytics" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.25rem' }}>
                    <TrendingUp size={24} color="#10b981" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Analytics</p>
                </Link>
                <Link to="/departments" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '1.25rem' }}>
                    <FileText size={24} color="#f59e0b" /><p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Departments</p>
                </Link>
            </div>

            {/* Critical Feed */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ color: 'var(--danger)' }}>⚠️ Critical & High Priority</h2>
                </div>
                {criticalFeed.length === 0 ? (
                    <div className="empty-state"><CheckCircle size={32} color="var(--success)" /><p>No critical incidents. All clear!</p></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {criticalFeed.map(inc => (
                            <Link key={inc._id} to={`/incidents/${inc._id}`} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ padding: '1rem', borderLeft: `3px solid ${inc.severity === 'critical' ? 'var(--danger)' : 'var(--severity-high)'}` }}>
                                    <div style={{ fontWeight: 600 }}>{inc.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {inc.type?.replace(/_/g, ' ')} • {inc.location?.area || 'Unknown'} • {new Date(inc.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function AdminDash() {
    return <OfficialDash />
}
