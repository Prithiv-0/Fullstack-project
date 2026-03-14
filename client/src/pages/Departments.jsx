/**
 * @file Departments.jsx - Department Management Page
 * @description Provides an interface to view and manage departments, officer assignments,
 * workload distribution, and SLA configurations. Restricted to admin users only.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Building2, Activity, Mail, Phone, Users, CheckCircle, X, Shield, Clock, MapPin, AlertTriangle } from 'lucide-react'
import './ContactDepartment.css'

const STATUS_COLORS = { reported: '#3b82f6', acknowledged: '#8b5cf6', assigned: '#6366f1', in_progress: '#f59e0b', resolved: '#10b981', closed: '#6b7280', rejected: '#ef4444' }

export default function Departments() {
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal state
    const [selectedDept, setSelectedDept] = useState(null)
    const [deptDetails, setDeptDetails] = useState(null)
    const [deptIncidents, setDeptIncidents] = useState([])
    const [detailsLoading, setDetailsLoading] = useState(false)

    useEffect(() => {
        fetchDepts()
    }, [])

    const fetchDepts = async () => {
        try {
            const res = await api.get('/departments')
            setDepartments(res.data.data || [])
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    const handleDeptClick = async (dept) => {
        setSelectedDept(dept)
        setDetailsLoading(true)
        try {
            const [detailsRes, incidentsRes] = await Promise.all([
                api.get(`/departments/${dept._id}`),
                api.get(`/departments/${dept._id}/incidents?limit=5`)
            ])
            setDeptDetails(detailsRes.data.data)
            setDeptIncidents(incidentsRes.data.data)
        } catch (err) {
            console.error("Failed to load department details", err)
        }
        setDetailsLoading(false)
    }

    const closeDetails = () => {
        setSelectedDept(null)
        setDeptDetails(null)
        setDeptIncidents([])
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading departments...</p></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Building2 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Departments & Workload</h1>
                    <p className="page-subtitle">City departments and their current assignment load</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {departments.map(dept => (
                    <div
                        key={dept._id}
                        className="card hover-bg-light"
                        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onClick={() => handleDeptClick(dept)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{dept.name}</h3>
                                <span className="badge badge-status">{dept.shortName}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: dept.currentLoad > 10 ? 'var(--danger)' : 'var(--primary-600)', background: 'var(--primary-100)', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Activity size={14} /> {dept.currentLoad || 0} active
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                            {dept.incidentTypes?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    {dept.incidentTypes.slice(0, 3).map(t => <span key={t} className="badge" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{t.replace(/_/g, ' ')}</span>)}
                                    {dept.incidentTypes.length > 3 && <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>+{dept.incidentTypes.length - 3} more</span>}
                                </div>
                            )}
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                                <span><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> SLA: {dept.slaHours || 24}h</span>
                                <span style={{ color: 'var(--primary-500)', fontWeight: 500, fontSize: '0.8rem' }}>View workload &rarr;</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Department Details Modal/Sidebar */}
            {selectedDept && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '500px',
                    background: 'var(--bg-primary)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out'
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--bg-secondary)' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selectedDept.name} ({selectedDept.shortName})</h2>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {selectedDept.contactEmail && <span><Mail size={12} style={{ display: 'inline' }} /> {selectedDept.contactEmail}</span>}
                                {selectedDept.contactPhone && <span><Phone size={12} style={{ display: 'inline' }} /> {selectedDept.contactPhone}</span>}
                            </div>
                        </div>
                        <button onClick={closeDetails} className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        {detailsLoading ? (
                            <div className="loading-container" style={{ minHeight: 200 }}><div className="loading-spinner" /></div>
                        ) : deptDetails ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Workload Stats */}
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Workload Overview</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-600)' }}>{deptDetails.workload?.active || 0}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active</div>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{deptDetails.workload?.completed || 0}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Resolved</div>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{deptDetails.workload?.resolutionRate || 0}%</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Res. Rate</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Queue */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Latest Assignments</h3>
                                        {deptIncidents.length > 0 && <span className="badge" style={{ fontSize: '0.7rem' }}>Showing top 5</span>}
                                    </div>

                                    {deptIncidents.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            No active assignments right now.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {deptIncidents.map(inc => (
                                                <div key={inc._id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <Link to={`/incidents/${inc._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem' }} className="hover-primary">
                                                            {inc.title}
                                                        </Link>
                                                        <span className={`badge badge-${inc.severity}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{inc.severity}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Assigned: {new Date(inc.assignedAt).toLocaleDateString()}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: STATUS_COLORS[inc.status] || 'inherit' }}><Activity size={12} /> {inc.status?.replace(/_/g, ' ')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Officers */}
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Users size={16} /> Department Roster
                                    </h3>
                                    {deptDetails.officers?.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No officers assigned to this department yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {deptDetails.officers?.map(off => (
                                                <div key={off._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{off.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{off.role?.replace(/_/g, ' ')}</div>
                                                    </div>
                                                    {off.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📞 {off.phone}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <div className="alert alert-danger">Failed to load department data</div>
                        )}
                    </div>
                </div>
            )}

            {/* Overlay for clicking out of modal */}
            {selectedDept && (
                <div
                    onClick={closeDetails}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, animation: 'fadeIn 0.2s' }}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .hover-primary:hover { color: var(--primary-500) !important; }
            `}} />
        </div>
    )
}
