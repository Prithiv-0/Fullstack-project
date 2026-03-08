import { useState, useEffect } from 'react'
import api from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { TrendingUp, BarChart3, Activity, RefreshCcw } from 'lucide-react'
import './Analytics.css'

const COLORS = ['#03a9f4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#a855f7', '#64748b', '#eab308', '#22c55e', '#dc2626']
const SEV_COLORS = { critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#22c55e' }

export default function Analytics() {
    const [dashboard, setDashboard] = useState(null)
    const [byType, setByType] = useState([])
    const [bySeverity, setBySeverity] = useState([])
    const [byStatus, setByStatus] = useState([])
    const [trends, setTrends] = useState([])
    const [deptPerf, setDeptPerf] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [dashRes, typeRes, sevRes, statRes, trendRes, deptRes] = await Promise.all([
                api.get('/analytics/dashboard').catch(() => ({ data: { data: {} } })),
                api.get('/analytics/incidents-by-type').catch(() => ({ data: { data: [] } })),
                api.get('/analytics/severity-distribution').catch(() => ({ data: { data: [] } })),
                api.get('/analytics/status-distribution').catch(() => ({ data: { data: [] } })),
                api.get('/analytics/trends').catch(() => ({ data: { data: { daily: [] } } })),
                api.get('/analytics/dept-performance').catch(() => ({ data: { data: [] } }))
            ])
            setDashboard(dashRes.data.data)
            setByType((typeRes.data.data || []).map(d => ({ name: d._id?.replace(/_/g, ' '), value: d.count })))
            setBySeverity((sevRes.data.data || []).map(d => ({ name: d._id, value: d.count })))
            setByStatus((statRes.data.data || []).map(d => ({ name: d._id?.replace(/_/g, ' '), value: d.count })))
            setTrends((trendRes.data.data?.daily || trendRes.data.data || []).map(d => ({ date: d._id, count: d.count, resolved: d.resolved || 0 })))
            setDeptPerf(deptRes.data.data || [])
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading analytics...</p></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><TrendingUp size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Analytics Dashboard</h1>
                    <p className="page-subtitle">City intelligence insights and performance metrics</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchAll}><RefreshCcw size={16} /> Refresh</button>
            </div>

            {/* KPI Row */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card"><div className="stat-value">{dashboard?.totalIncidents || 0}</div><div className="stat-label">Total Incidents</div></div>
                <div className="stat-card"><div className="stat-value">{dashboard?.activeIncidents || 0}</div><div className="stat-label">Active</div></div>
                <div className="stat-card"><div className="stat-value">{dashboard?.resolvedToday || 0}</div><div className="stat-label">Resolved Today</div></div>
                <div className="stat-card"><div className="stat-value">{dashboard?.avgResponseTimeHours || 0}h</div><div className="stat-label">Avg Response</div></div>
            </div>

            {/* Charts Grid */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* Trends */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}><Activity size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Daily Trends (30 days)</h3>
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v?.slice(5)} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Line type="monotone" dataKey="count" stroke="#03a9f4" strokeWidth={2} name="Reported" />
                                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                                <Legend />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <div className="empty-state"><p>No trend data</p></div>}
                </div>

                {/* By Type */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}><BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Incidents by Type</h3>
                    {byType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={byType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Bar dataKey="value" fill="#03a9f4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div className="empty-state"><p>No data</p></div>}
                </div>

                {/* By Severity */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}>Severity Distribution</h3>
                    {bySeverity.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={bySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                                    {bySeverity.map((entry, i) => <Cell key={i} fill={SEV_COLORS[entry.name] || COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <div className="empty-state"><p>No data</p></div>}
                </div>

                {/* By Status */}
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '1rem' }}>Status Distribution</h3>
                    {byStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <div className="empty-state"><p>No data</p></div>}
                </div>
            </div>

            {/* Department Performance */}
            <div className="card">
                <h3 className="card-title" style={{ marginBottom: '1rem' }}>Department Performance</h3>
                {deptPerf.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Department</th><th>Total</th><th>Completed</th><th>Escalated</th><th>Resolution Rate</th></tr></thead>
                            <tbody>
                                {deptPerf.map((d, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                                        <td>{d.total}</td>
                                        <td>{d.completed}</td>
                                        <td style={{ color: d.escalated > 0 ? 'var(--danger)' : 'inherit' }}>{d.escalated || 0}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                                    <div style={{ width: `${d.resolutionRate || 0}%`, height: '100%', background: d.resolutionRate > 70 ? '#10b981' : d.resolutionRate > 40 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', minWidth: '40px' }}>{(d.resolutionRate || 0).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <div className="empty-state"><p>No department data</p></div>}
            </div>
        </div>
    )
}
