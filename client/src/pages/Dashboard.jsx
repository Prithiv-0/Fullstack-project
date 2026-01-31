import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
    Plus,
    AlertTriangle,
    CheckCircle,
    Clock,
    MapPin,
    TrendingUp,
    Bell,
    ChevronRight,
    Loader
} from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
    const { user } = useAuth()
    const [incidents, setIncidents] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [incidentsRes] = await Promise.all([
                api.get('/incidents?limit=10'),
            ])
            setIncidents(incidentsRes.data.data)

            // Calculate local stats
            const data = incidentsRes.data.data
            setStats({
                total: incidentsRes.data.total || data.length,
                reported: data.filter(i => i.status === 'reported').length,
                inProgress: data.filter(i => i.status === 'in-progress').length,
                resolved: data.filter(i => i.status === 'resolved').length
            })
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityClass = (severity) => `badge badge-${severity}`
    const getStatusClass = (status) => {
        const map = {
            'reported': 'status-reported',
            'acknowledged': 'status-acknowledged',
            'in-progress': 'status-progress',
            'resolved': 'status-resolved'
        }
        return map[status] || 'status-default'
    }

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="loading-spinner" />
                <p>Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="page-container fade-in">
            {/* Welcome Section */}
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="page-subtitle">
                        {user?.role === 'citizen'
                            ? 'Track your reported incidents and report new issues'
                            : 'Monitor city incidents and manage operations'}
                    </p>
                </div>
                <Link to="/report" className="btn btn-primary">
                    <Plus size={18} />
                    Report Incident
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <Bell size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.total || 0}</span>
                        <span className="stat-label">Total Incidents</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon reported">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.reported || 0}</span>
                        <span className="stat-label">Reported</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon progress">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.inProgress || 0}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon resolved">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats?.resolved || 0}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                </div>
            </div>

            {/* Recent Incidents */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        {user?.role === 'citizen' ? 'Your Recent Reports' : 'Recent Incidents'}
                    </h2>
                    <Link to="/command-center" className="view-all-link">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>

                {incidents.length === 0 ? (
                    <div className="empty-state">
                        <MapPin size={48} className="empty-state-icon" />
                        <h3>No incidents yet</h3>
                        <p>Report your first incident to get started</p>
                        <Link to="/report" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            <Plus size={18} />
                            Report Incident
                        </Link>
                    </div>
                ) : (
                    <div className="incidents-list">
                        {incidents.map((incident) => (
                            <Link to={`/incidents/${incident._id}`} key={incident._id} className="incident-item">
                                <div className="incident-main">
                                    <div className="incident-type-badge">{incident.type}</div>
                                    <h3 className="incident-title">{incident.title}</h3>
                                    <p className="incident-location">
                                        <MapPin size={14} />
                                        {incident.location?.address || 'Location not specified'}
                                    </p>
                                </div>
                                <div className="incident-meta">
                                    <span className={getSeverityClass(incident.severity)}>
                                        {incident.severity}
                                    </span>
                                    <span className={`status-badge ${getStatusClass(incident.status)}`}>
                                        {incident.status}
                                    </span>
                                    <span className="incident-date">
                                        {new Date(incident.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions for Citizens */}
            {user?.role === 'citizen' && (
                <div className="quick-actions">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/report?type=pothole" className="action-card">
                            <span className="action-icon">🕳️</span>
                            <span>Report Pothole</span>
                        </Link>
                        <Link to="/report?type=traffic" className="action-card">
                            <span className="action-icon">🚗</span>
                            <span>Traffic Issue</span>
                        </Link>
                        <Link to="/report?type=garbage" className="action-card">
                            <span className="action-icon">🗑️</span>
                            <span>Garbage Dump</span>
                        </Link>
                        <Link to="/report?type=streetlight" className="action-card">
                            <span className="action-icon">💡</span>
                            <span>Street Light</span>
                        </Link>
                        <Link to="/report?type=flooding" className="action-card">
                            <span className="action-icon">🌊</span>
                            <span>Flooding</span>
                        </Link>
                        <Link to="/report?type=other" className="action-card">
                            <span className="action-icon">📝</span>
                            <span>Other Issue</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
