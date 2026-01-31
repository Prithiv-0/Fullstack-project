import { useState, useEffect } from 'react'
import api from '../utils/api'
import {
    BarChart3,
    TrendingUp,
    MapPin,
    Loader,
    AlertTriangle,
    CheckCircle,
    Clock,
    Building2,
    PieChart
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPie,
    Pie,
    Cell,
    Legend
} from 'recharts'
import './Analytics.css'

const COLORS = ['#03a9f4', '#00bcd4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
const SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
}

function Analytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/analytics/overview')
            setData(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <Loader className="loading-spinner" />
                <p>Loading analytics...</p>
            </div>
        )
    }

    // Transform data for charts
    const typeData = data?.byType?.map(item => ({
        name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1).replace('-', ' ') || 'Unknown',
        value: item.count
    })) || []

    const severityData = data?.bySeverity?.map(item => ({
        name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1) || 'Unknown',
        value: item.count,
        color: SEVERITY_COLORS[item._id] || '#6b7280'
    })) || []

    const statusData = data?.byStatus?.map(item => ({
        name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1).replace('-', ' ') || 'Unknown',
        value: item.count
    })) || []

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics Dashboard</h1>
                    <p className="page-subtitle">City-wide incident analysis and insights</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="analytics-stats">
                <div className="analytics-stat">
                    <div className="stat-icon-wrapper blue">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <span className="stat-number">{data?.totalIncidents || 0}</span>
                        <span className="stat-label">Total Incidents</span>
                    </div>
                </div>
                <div className="analytics-stat">
                    <div className="stat-icon-wrapper orange">
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className="stat-number">{data?.activeIncidents || 0}</span>
                        <span className="stat-label">Active Incidents</span>
                    </div>
                </div>
                <div className="analytics-stat">
                    <div className="stat-icon-wrapper green">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <span className="stat-number">{data?.resolvedToday || 0}</span>
                        <span className="stat-label">Resolved Today</span>
                    </div>
                </div>
                <div className="analytics-stat">
                    <div className="stat-icon-wrapper red">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <span className="stat-number">{data?.criticalIncidents?.length || 0}</span>
                        <span className="stat-label">Critical Active</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Incidents by Type - Bar Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <BarChart3 size={18} />
                        Incidents by Type
                    </h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={typeData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" stroke="#6b7280" />
                                <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#03a9f4" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Incidents by Severity - Pie Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <PieChart size={18} />
                        Severity Distribution
                    </h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <TrendingUp size={18} />
                        Status Distribution
                    </h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(17, 24, 39, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Critical Incidents List */}
                <div className="chart-card">
                    <h3 className="chart-title">
                        <AlertTriangle size={18} />
                        Critical Incidents
                    </h3>
                    <div className="critical-list">
                        {data?.criticalIncidents?.length > 0 ? (
                            data.criticalIncidents.map((incident, i) => (
                                <div key={i} className="critical-item">
                                    <div className="critical-info">
                                        <span className="critical-title">{incident.title}</span>
                                        <span className="critical-dept">{incident.assignedDepartment?.name || 'Unassigned'}</span>
                                    </div>
                                    <span className="critical-status">{incident.status}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-critical">
                                <CheckCircle size={32} />
                                <p>No critical incidents</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
