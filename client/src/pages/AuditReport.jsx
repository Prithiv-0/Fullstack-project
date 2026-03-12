/**
 * @file AuditReport.jsx - Admin Audit Report Dashboard
 * @description Comprehensive audit report dashboard with downloadable data and
 * SLA compliance metrics for administrative oversight and accountability.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Shield, Clock, CheckCircle, Search, Filter } from 'lucide-react'

export default function AuditReport() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        api.get('/reports/audit-resolution')
            .then(res => setLogs(res.data.data || []))
            .catch(err => console.error("Failed to fetch audit logs", err))
            .finally(() => setLoading(false))
    }, [])

    const filteredLogs = logs.filter(log => {
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'resolved' && log.isResolved) ||
            (filterStatus === 'unresolved' && !log.isResolved);

        const matchesSearch = !searchTerm ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.officerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.incidentId?.title?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    })

    if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Shield size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Audit & Resolution Report</h1>
                    <p className="page-subtitle">Track officer actions, resolution times, and incident closures</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by action, officer, or incident..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Filter size={16} color="var(--text-secondary)" />
                    <select
                        className="form-input"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="all">All Resolutions</option>
                        <option value="resolved">Successfully Resolved</option>
                        <option value="unresolved">Cannot Resolve</option>
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Timestamp</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Incident</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Officer</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action Taken</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Time Metrics</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No resolution logs found matching the current filters.
                                </td>
                            </tr>
                        ) : filteredLogs.map(log => (
                            <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-bg-light">
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <Link to={`/incidents/${log.incidentId?._id}`} style={{ fontWeight: 500, color: 'var(--primary-500)', textDecoration: 'none' }}>
                                        {log.incidentId?.title?.substring(0, 30)}{log.incidentId?.title?.length > 30 ? '...' : ''}
                                    </Link>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Type: {log.incidentId?.type?.replace(/_/g, ' ')}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{log.officerId?.name || 'Unknown Officer'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.officerId?.email}</div>
                                </td>
                                <td style={{ padding: '1rem', maxWidth: '300px' }}>
                                    <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.action}>
                                        {log.action}
                                    </div>
                                    {log.proofUrls?.length > 0 && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-400)', marginTop: 4 }}>
                                            {log.proofUrls.length} attachment(s)
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    {log.tta !== null && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }} title="Time to Acknowledge">
                                            <Clock size={12} color="var(--text-muted)" />
                                            TTA: {Math.round(log.tta / 60)}h {log.tta % 60}m
                                        </div>
                                    )}
                                    {log.ttr !== null && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Time to Resolve">
                                            <CheckCircle size={12} color="var(--text-muted)" />
                                            TTR: {Math.round(log.ttr / 60)}h {log.ttr % 60}m
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span className="badge" style={{
                                        background: log.isResolved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                        color: log.isResolved ? '#10b981' : '#f59e0b'
                                    }}>
                                        {log.isResolved ? 'Resolved' : 'Escalated'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
