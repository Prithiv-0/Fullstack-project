import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Star, MessageSquare, ArrowLeft, Send } from 'lucide-react'
import './FeedbackForm.css'

function StarRating({ value, onChange, label }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} type="button" onClick={() => onChange(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', transition: 'transform 150ms' }}>
                        <Star size={28} fill={i <= value ? '#f59e0b' : 'transparent'} color={i <= value ? '#f59e0b' : 'var(--text-muted)'} />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function FeedbackForm() {
    const { id } = useParams()
    const nav = useNavigate()
    const [form, setForm] = useState({ rating: 0, responseSatisfaction: 0, resolvedSatisfaction: 0, easeOfUse: 0, comments: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.rating) { setError('Please provide an overall rating'); return }
        setLoading(true); setError('')
        try {
            await api.post('/feedback', { incidentId: id, ...form })
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit feedback')
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="page-container fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Thank you for your feedback!</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Your input helps improve city services.</p>
                <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => nav('/dashboard')}>Back to Dashboard</button>
            </div>
        )
    }

    return (
        <div className="page-container fade-in">
            <button onClick={() => nav(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>

            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <MessageSquare size={36} color="var(--primary-400)" />
                    <h1 className="page-title" style={{ marginTop: '0.5rem' }}>Rate Resolution</h1>
                    <p className="page-subtitle">How was your experience?</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <StarRating label="Overall Rating *" value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
                        <StarRating label="Response Speed" value={form.responseSatisfaction} onChange={v => setForm({ ...form, responseSatisfaction: v })} />
                        <StarRating label="Resolution Quality" value={form.resolvedSatisfaction} onChange={v => setForm({ ...form, resolvedSatisfaction: v })} />
                        <StarRating label="Ease of Use" value={form.easeOfUse} onChange={v => setForm({ ...form, easeOfUse: v })} />

                        <div className="form-group">
                            <label className="form-label">Additional Comments</label>
                            <textarea className="form-textarea" placeholder="Any suggestions or feedback..." value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} rows={4} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Submitting...' : <><Send size={18} /> Submit Feedback</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
