import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import MapView from '../components/MapView'
import {
    MapPin,
    AlertTriangle,
    Clock,
    Filter,
    RefreshCw,
    Loader,
    List,
    Map,
    ChevronRight,
    Bell,
    CheckCircle,
    XCircle
} from 'lucide-react'
import './CommandCenter.css'

function CommandCenter() {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
    const [filter, setFilter] = useState({ status: '', severity: '', type: '' })
    const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        fetchIncidents()
    }, [filter])

    const fetchIncidents = async () => {
        try {
            const params = new URLSearchParams()
            if (filter.status) params.append('status', filter.status)
            if (filter.severity) params.append('severity', filter.severity)
            if (filter.type) params.append('type', filter.type)
            params.append('limit', '50')

            const res = await api.get(`/incidents?${params.toString()}`)
            const data = res.data.data
            setIncidents(data)

            // Calculate stats
            setStats({
                total: res.data.total || data.length,
                critical: data.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
                pending: data.filter(i => ['reported', 'acknowledged'].includes(i.status)).length
            })
        } catch (err) {
            console.error('Failed to fetch:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleIncidentClick = (incident) => {
        navigate(`/incidents/${incident._id}`)
    }

    const getSeverityClass = (s) => `badge badge-${s}`

    const clearFilters = () => {
        setFilter({ status: '', severity: '', type: '' })
    }

    return (
        <div className="page-container fade-in">
            {/* Header */}
            <div className="command-header">
                <div>
                    <h1 className="page-title">Command Center</h1>
                    <p className="page-subtitle">Real-time city incident monitoring and management</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={fetchIncidents}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="command-stats">
                <div className="command-stat">
                    <Bell size={20} />
                    <div>
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Incidents</span>
                    </div>
                </div>
                <div className="command-stat critical">
                    <AlertTriangle size={20} />
                    <div>
                        <span className="stat-number">{stats.critical}</span>
                        <span className="stat-text">Critical Active</span>
                    </div>
                </div>
                <div className="command-stat pending">
                    <Clock size={20} />
                    <div>
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-text">Pending Action</span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="command-toolbar">
                <div className="filters-section">
                    <Filter size={18} className="filter-icon" />
                    <select
                        className="filter-select"
                        value={filter.status}
                        onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                    >
                        <option value="">All Status</option>
                        <option value="reported">Reported</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <select
                        className="filter-select"
                        value={filter.severity}
                        onChange={(e) => setFilter(f => ({ ...f, severity: e.target.value }))}
                    >
                        <option value="">All Severity</option>
                        <option value="critical">🔴 Critical</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                    <select
                        className="filter-select"
                        value={filter.type}
                        onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
                    >
                        <option value="">All Types</option>
                        <option value="pothole">Pothole</option>
                        <option value="traffic">Traffic</option>
                        <option value="flooding">Flooding</option>
                        <option value="garbage">Garbage</option>
                        <option value="streetlight">Street Light</option>
                        <option value="accident">Accident</option>
                        <option value="water-leak">Water Leak</option>
                        <option value="sewage">Sewage</option>
                        <option value="public-safety">Public Safety</option>
                    </select>
                    {(filter.status || filter.severity || filter.type) && (
                        <button className="clear-filters" onClick={clearFilters}>
                            <XCircle size={14} /> Clear
                        </button>
                    )}
                </div>

                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                        onClick={() => setViewMode('map')}
                    >
                        <Map size={16} /> Map
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={16} /> List
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-container">
                    <Loader className="loading-spinner" />
                    <p>Loading incidents...</p>
                </div>
            ) : (
                <>
                    {viewMode === 'map' ? (
                        <div className="map-section">
                            <MapView
                                incidents={incidents}
                                onIncidentClick={handleIncidentClick}
                            />
                            <div className="map-legend">
                                <span><span className="legend-dot critical"></span> Critical</span>
                                <span><span className="legend-dot high"></span> High</span>
                                <span><span className="legend-dot medium"></span> Medium</span>
                                <span><span className="legend-dot low"></span> Low</span>
                            </div>
                        </div>
                    ) : (
                        <div className="incidents-grid">
                            {incidents.length === 0 ? (
                                <div className="empty-state">
                                    <MapPin size={48} />
                                    <p>No incidents match your filters</p>
                                    <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
                                </div>
                            ) : (
                                incidents.map(incident => (
                                    <Link to={`/incidents/${incident._id}`} key={incident._id} className="incident-card">
                                        <div className="incident-card-header">
                                            <span className={getSeverityClass(incident.severity)}>{incident.severity}</span>
                                            <span className="incident-time">
                                                <Clock size={12} />
                                                {new Date(incident.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="incident-card-title">{incident.title}</h3>
                                        <p className="incident-card-desc">
                                            {incident.description?.slice(0, 80)}...
                                        </p>
                                        <div className="incident-card-footer">
                                            <span className="incident-type">{incident.type}</span>
                                            <span className={`incident-status status-${incident.status}`}>{incident.status}</span>
                                        </div>
                                        <div className="incident-location">
                                            <MapPin size={12} />
                                            {incident.location?.area || incident.location?.address || 'Location pending'}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default CommandCenter
