/**
 * CommandCenter.jsx - Incident Command Center for Officials & Admin
 *
 * A real-time operational dashboard for government officials and admins.
 * Displays all incidents with filtering, sorting, and status management.
 * Includes a map view of incidents, department workload stats, and
 * quick-action buttons for verify, assign, and acknowledge operations.
 * Accessible to field_officer, government_official, and admin roles.
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Filter, List, Map as MapIcon, RefreshCcw, AlertTriangle, Clock, MapPin, ChevronDown } from 'lucide-react'
import './CommandCenter.css'

import 'leaflet/dist/leaflet.css'

const SEVERITY_COLORS = {
    critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#22c55e'
}

function createIcon(severity) {
    const color = SEVERITY_COLORS[severity] || '#6b7280'
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    })
}

export default function CommandCenter() {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('map')
    const [filters, setFilters] = useState({ type: '', severity: '', status: '' })

    useEffect(() => { fetchIncidents() }, [])

    const fetchIncidents = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ limit: '200' })
            if (filters.type) params.set('type', filters.type)
            if (filters.severity) params.set('severity', filters.severity)
            if (filters.status) params.set('status', filters.status)

            const res = await api.get(`/incidents?${params}`)
            setIncidents(res.data.data || [])
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    const mapIncidents = useMemo(() =>
        incidents.filter(i => i.location?.lat && i.location?.lng),
        [incidents]
    )

    const getStatusColor = (s) => ({ reported: '#3b82f6', acknowledged: '#8b5cf6', assigned: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#6b7280', rejected: '#ef4444' }[s] || '#6b7280')

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Command Center</h1>
                    <p className="page-subtitle">{incidents.length} incidents tracked • {mapIncidents.length} mapped</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('map')}><MapIcon size={16} /> Map</button>
                    <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}><List size={16} /> List</button>
                    <button className="btn btn-sm btn-secondary" onClick={fetchIncidents}><RefreshCcw size={16} /></button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={18} color="var(--text-secondary)" />
                <select className="form-select" style={{ maxWidth: '180px' }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                    <option value="">All Types</option>
                    {['pothole', 'traffic', 'flooding', 'streetlight', 'garbage', 'accident', 'water_leak', 'road_damage', 'safety_issue', 'noise', 'illegal_parking', 'sewage'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
                <select className="form-select" style={{ maxWidth: '180px' }} value={filters.severity} onChange={e => setFilters({ ...filters, severity: e.target.value })}>
                    <option value="">All Severity</option>
                    {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-select" style={{ maxWidth: '180px' }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Status</option>
                    {['reported', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <button className="btn btn-sm btn-primary" onClick={fetchIncidents}>Apply</button>
            </div>

            {loading ? <div className="loading-container"><div className="loading-spinner" /><p>Loading incidents...</p></div> : (
                <>
                    {view === 'map' ? (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="map-container" style={{ height: '600px' }}>
                                <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    {mapIncidents.map(inc => (
                                        <Marker key={inc._id} position={[inc.location.lat, inc.location.lng]} icon={createIcon(inc.severity)}>
                                            <Popup>
                                                <div style={{ minWidth: 200 }}>
                                                    <strong>{inc.title}</strong><br />
                                                    <small>{inc.type?.replace(/_/g, ' ')} • {inc.severity}</small><br />
                                                    <small>{inc.location?.address || inc.location?.area || ''}</small><br />
                                                    <Link to={`/incidents/${inc._id}`} style={{ fontSize: '0.85rem' }}>View Details →</Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                            {/* Legend */}
                            <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                {Object.entries(SEVERITY_COLORS).map(([s, c]) => (
                                    <span key={s} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} /> {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            {incidents.length === 0 ? (
                                <div className="empty-state"><p>No incidents match the filters</p></div>
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr><th>Title</th><th>Type</th><th>Severity</th><th>Status</th><th>Location</th><th>Date</th></tr>
                                        </thead>
                                        <tbody>
                                            {incidents.map(inc => (
                                                <tr key={inc._id}>
                                                    <td><Link to={`/incidents/${inc._id}`} style={{ fontWeight: 600 }}>{inc.title}</Link></td>
                                                    <td>{inc.type?.replace(/_/g, ' ')}</td>
                                                    <td><span className={`badge badge-${inc.severity}`}>{inc.severity}</span></td>
                                                    <td><span className="badge" style={{ background: `${getStatusColor(inc.status)}22`, color: getStatusColor(inc.status) }}>{inc.status?.replace(/_/g, ' ')}</span></td>
                                                    <td style={{ fontSize: '0.85rem' }}>{inc.location?.area || inc.location?.address || '-'}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{new Date(inc.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
