import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Send, Building2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ContactDepartment.css'

export default function ContactDepartment() {
    const nav = useNavigate()
    const [departments, setDepartments] = useState([])
    const [form, setForm] = useState({ department: '', subject: '', message: '', priority: 'medium' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        api.get('/departments').then(res => setDepartments(res.data.data || [])).catch(console.error)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.department || !form.subject || !form.message) { setError('All fields required'); return }
        setLoading(true); setError('')
        try {
            await api.post(`/departments/${form.department}/contact`, { subject: form.subject, message: form.message, priority: form.priority })
            setSuccess(true)
        } catch (err) { setError(err.response?.data?.error || 'Failed to send') }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="page-container fade-in" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Message Sent!</h1>
                <p style={{ color: 'var(--text-secondary)' }}>The department will respond to your query.</p>
                <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => nav('/dashboard')}>Back to Dashboard</button>
            </div>
        )
    }

    return (
        <div className="page-container fade-in">
            <button onClick={() => nav(-1)} className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }}><ArrowLeft size={16} /> Back</button>

            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Building2 size={36} color="var(--primary-400)" />
                    <h1 className="page-title" style={{ marginTop: '0.5rem' }}>Contact Department</h1>
                    <p className="page-subtitle">Send a message to a city department</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="form-group">
                            <label className="form-label">Department *</label>
                            <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                <option value="">Select department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.shortName})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subject *</label>
                            <input className="form-input" placeholder="Subject of your message" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message *</label>
                            <textarea className="form-textarea" placeholder="Type your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
