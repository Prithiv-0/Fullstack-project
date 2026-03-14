import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { CheckCircle, AlertTriangle, ArrowLeft, Upload, FileText } from 'lucide-react'

export default function ResolveIncident() {
    const { id } = useParams()
    const nav = useNavigate()
    const [incident, setIncident] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [action, setAction] = useState('')
    const [resolutionStatus, setResolutionStatus] = useState('resolved')
    const [category, setCategory] = useState('repair')
    const [timeSpentHours, setTimeSpentHours] = useState(1)
    const [requiresFollowUp, setRequiresFollowUp] = useState(false)
    const [materialsUsed, setMaterialsUsed] = useState('')
    const [notes, setNotes] = useState('')

    // For proof URLs (simulated file upload)
    const [proofUrls, setProofUrls] = useState([''])

    useEffect(() => {
        api.get(`/incidents/${id}`)
            .then(res => setIncident(res.data.data))
            .catch(() => setError('Failed to load incident details'))
            .finally(() => setLoading(false))
    }, [id])

    const handleProofUrlChange = (index, value) => {
        const newUrls = [...proofUrls]
        newUrls[index] = value
        setProofUrls(newUrls)
    }

    const addProofUrlField = () => {
        setProofUrls([...proofUrls, ''])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!action.trim()) {
            setError('Please describe the action taken.')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const validProofUrls = proofUrls.filter(url => url.trim() !== '')

            await api.put(`/incidents/${id}/resolve`, {
                action,
                resolutionStatus,
                category,
                timeSpentHours,
                requiresFollowUp,
                materialsUsed,
                notes,
                proofUrls: validProofUrls
            })

            nav(`/incidents/${id}`)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit resolution.')
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
                    <CheckCircle size={24} color="var(--primary-500)" />
                    Resolve Incident
                </h2>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', borderLeft: '3px solid var(--primary-500)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{incident.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {incident.incidentId || incident._id}</p>
                </div>

                {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Resolution Status</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="resolutionStatus"
                                    value="resolved"
                                    checked={resolutionStatus === 'resolved'}
                                    onChange={(e) => setResolutionStatus(e.target.value)}
                                />
                                <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Successfully Resolved</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="resolutionStatus"
                                    value="cannot_resolve"
                                    checked={resolutionStatus === 'cannot_resolve'}
                                    onChange={(e) => setResolutionStatus(e.target.value)}
                                />
                                <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Cannot Resolve (Need Help)</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Resolution Category</label>
                            <select
                                className="form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="repair">Repair</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="replacement">Replacement</option>
                                <option value="cleaning">Cleaning / Clearing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Time Spent (Hours)</label>
                            <input
                                type="number"
                                className="form-input"
                                min="0.5" step="0.5"
                                value={timeSpentHours}
                                onChange={(e) => setTimeSpentHours(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Action Taken <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <textarea
                            className="form-input"
                            rows="4"
                            placeholder="Describe exactly what work was done..."
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            required
                        ></textarea>
                        <small style={{ color: 'var(--text-muted)' }}>This will be visible to the citizen who reported the issue.</small>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Materials / Resources Used</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., 2 bags of concrete, 1 lightbulb..."
                            value={materialsUsed}
                            onChange={(e) => setMaterialsUsed(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                            <input
                                type="checkbox"
                                checked={requiresFollowUp}
                                onChange={(e) => setRequiresFollowUp(e.target.checked)}
                            /> Requires Follow-up Visit
                        </label>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Internal Notes / Remarks</label>
                        <textarea
                            className="form-input"
                            rows="2"
                            placeholder="Any internal notes for your department..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Proof of Resolution (Images/Files)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {proofUrls.map((url, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Upload size={16} color="var(--text-muted)" />
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="Enter image URL..."
                                        value={url}
                                        onChange={(e) => handleProofUrlChange(index, e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addProofUrlField}
                                className="btn btn-sm btn-secondary"
                                style={{ alignSelf: 'flex-start' }}
                            >
                                + Add another link
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <Link to={`/incidents/${id}`} className="btn btn-secondary">Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Resolution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
