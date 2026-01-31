import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Building2, Users, Loader } from 'lucide-react'

function Departments() {
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments')
            setDepartments(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading-container"><Loader className="loading-spinner" /></div>
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Departments</h1>
                    <p className="page-subtitle">Manage city departments and their assignments</p>
                </div>
            </div>

            <div className="grid-3">
                {departments.map(dept => (
                    <div key={dept._id} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Building2 size={24} style={{ color: 'var(--primary-400)' }} />
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{dept.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dept.code}</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {dept.description || 'No description'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {dept.handlesIncidentTypes?.map(type => (
                                <span key={type} style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.5rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '4px',
                                    textTransform: 'capitalize'
                                }}>
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Departments
