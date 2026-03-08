import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Building2, Users, Activity, Mail, ChevronRight } from 'lucide-react'
import './ContactDepartment.css'

export default function Departments() {
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchDepts() }, [])

    const fetchDepts = async () => {
        try {
            const res = await api.get('/departments')
            setDepartments(res.data.data || [])
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading departments...</p></div>

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Building2 size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Departments</h1>
                    <p className="page-subtitle">City departments and their current workload</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {departments.map(dept => (
                    <div key={dept._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{dept.name}</h3>
                                <span className="badge badge-status">{dept.shortName}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: dept.currentLoad > 10 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                <Activity size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Load: {dept.currentLoad || 0}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                            {dept.contactEmail && <div><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {dept.contactEmail}</div>}
                            {dept.contactPhone && <div>📞 {dept.contactPhone}</div>}
                            <div>⏱️ SLA: {dept.slaHours || 24}h</div>
                            {dept.incidentTypes?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    {dept.incidentTypes.map(t => <span key={t} className="badge" style={{ background: 'rgba(3,169,244,0.15)', color: 'var(--primary-400)', fontSize: '0.7rem' }}>{t.replace(/_/g, ' ')}</span>)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
