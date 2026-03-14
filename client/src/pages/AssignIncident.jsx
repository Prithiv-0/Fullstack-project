/**
 * @file AssignIncident.jsx - Incident Assignment Page
 * @description Provides an interface to assign incidents to departments and officers,
 * including SLA deadline configuration for tracking resolution timelines.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { Building, Shield, ArrowLeft, Users, Clock } from 'lucide-react'

export default function AssignIncident() {
    const { id } = useParams()
    const nav = useNavigate()

    const [incident, setIncident] = useState(null)
    const [departments, setDepartments] = useState([])
    const [officers, setOfficers] = useState([])

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [departmentId, setDepartmentId] = useState('')
    const [officerId, setOfficerId] = useState('')
    const [priority, setPriority] = useState('')
    const [slaDeadline, setSlaDeadline] = useState('')
    const [notes, setNotes] = useState('')
    const [assignmentType, setAssignmentType] = useState('manual')
    const [notifyReporter, setNotifyReporter] = useState(true)
    const [referenceNumber, setReferenceNumber] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [incRes, deptRes] = await Promise.all([
                    api.get(`/incidents/${id}`),
                    api.get('/departments')
                ])
                setIncident(incRes.data.data)
                setPriority(incRes.data.data.severity || 'medium')
                setDepartments(deptRes.data.data || [])
            } catch (err) {
                setError('Failed to load required data.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    // Fetch officers when department changes
    useEffect(() => {
        if (!departmentId) {
            setOfficers([])
            setOfficerId('')
            return
        }

        // Find default SLA for department to auto-fill deadline
        const dept = departments.find(d => d._id === departmentId)
        if (dept && dept.slaHours && !slaDeadline) {
            const date = new Date()
            date.setHours(date.getHours() + dept.slaHours)
            // format as YYYY-MM-DDThh:mm for datetime-local
            setSlaDeadline(date.toISOString().slice(0, 16))
        }

        api.get(`/departments/${departmentId}/officers`)
            .then(res => setOfficers(res.data.data || []))
            .catch(err => console.error('Failed to load officers', err))
    }, [departmentId, departments])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!departmentId) {
            setError('Please select a department.')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            await api.put(`/incidents/${id}/assign`, {
                departmentId,
                officerId: officerId || undefined,
                priority,
                slaDeadline: slaDeadline ? new Date(slaDeadline).toISOString() : undefined,
                assignmentType,
                notifyReporter,
                referenceNumber,
                notes
            })
            nav(`/incidents/${id}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign incident.')
            setSubmitting(false)
        }
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>
    if (error && !incident) return <div className="page-container"><div className="alert alert-danger">{error}</div></div>

    return (
        <div className="page-container fade-in">
            <button onClick={() => nav(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                <h2 className="card-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={24} color="var(--primary-500)" />
                    Assign Incident
                </h2>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--primary-500)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{incident.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type: {incident.type?.replace(/_/g, ' ')}</p>
                        </div>
                        <span className={`badge badge-${incident.severity}`}>{incident.severity}</span>
                    </div>
                </div>

                {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label><Building size={14} style={{ display: 'inline', marginRight: 4 }} /> Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <select
                                className="form-input"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                required
                            >
                                <option value="">Select a department...</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name} ({dept.shortName})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Specific Officer (Optional)</label>
                            <select
                                className="form-input"
                                value={officerId}
                                onChange={(e) => setOfficerId(e.target.value)}
                                disabled={!departmentId}
                            >
                                <option value="">Auto-assign or leave unassigned</option>
                                {officers.map(off => (
                                    <option key={off._id} value={off._id}>{off.name} - {off.zone || 'Any Zone'}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Priority Override</label>
                            <select
                                className="form-input"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <small style={{ color: 'var(--text-muted)' }}>Changes the incident's current priority severity.</small>
                        </div>

                        <div className="form-group">
                            <label><Clock size={14} style={{ display: 'inline', marginRight: 4 }} /> SLA Deadline</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={slaDeadline}
                                onChange={(e) => setSlaDeadline(e.target.value)}
                            />
                            <small style={{ color: 'var(--text-muted)' }}>Defaults to the department's standard SLA.</small>
                        </div>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Assignment Type</label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal' }}>
                                    <input type="radio" name="assignmentType" value="manual" checked={assignmentType === 'manual'} onChange={() => setAssignmentType('manual')} /> Manual
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal' }}>
                                    <input type="radio" name="assignmentType" value="auto" checked={assignmentType === 'auto'} onChange={() => setAssignmentType('auto')} /> Auto-Routed
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>External Reference Number</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ref ID or ticket number..."
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                            <input
                                type="checkbox"
                                checked={notifyReporter}
                                onChange={(e) => setNotifyReporter(e.target.checked)}
                            /> Notify reporter about assignment
                        </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Assignment Notes / Instructions</label>
                        <textarea
                            className="form-input"
                            rows="3"
                            placeholder="Provide any specific instructions for the resolution team..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <Link to={`/incidents/${id}`} className="btn btn-secondary">Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Assigning...' : 'Assign Incident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
