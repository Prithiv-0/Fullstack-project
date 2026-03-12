/**
 * Navbar.jsx - Responsive Navigation Sidebar Component
 *
 * Renders a vertical sidebar navigation with role-based menu items.
 * Uses Lucide React icons and highlights the active route. Menu items
 * are dynamically filtered based on the user's role (citizen, field_officer,
 * government_official, admin). Includes a collapsible mobile-responsive
 * hamburger toggle and a logout button at the bottom.
 */

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard,
    MapPin,
    BarChart3,
    Building2,
    LogOut,
    Plus,
    Command,
    Shield,
    User,
    Siren,
    Mail,
    UserCog,
    MessageSquare
} from 'lucide-react'
import './Navbar.css'

function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['citizen', 'field_officer', 'government_official', 'admin'] },
        { path: '/report', icon: Plus, label: 'Report', roles: ['citizen', 'field_officer', 'admin'] },
        { path: '/emergency', icon: Siren, label: 'SOS', roles: ['citizen', 'field_officer', 'admin'], className: 'nav-sos' },
        { path: '/contact', icon: Mail, label: 'Contact', roles: ['citizen', 'field_officer', 'government_official', 'admin'] },
        { path: '/feedback', icon: MessageSquare, label: 'Feedback', roles: ['citizen'] },
        { path: '/command-center', icon: Command, label: 'Command Center', roles: ['field_officer', 'government_official', 'admin'] },
        { path: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['government_official', 'admin'] },
        { path: '/departments', icon: Building2, label: 'Departments', roles: ['admin'] },
        { path: '/audit-report', icon: Shield, label: 'Audit Logs', roles: ['admin'] },
        { path: '/profile', icon: UserCog, label: 'Profile', roles: ['citizen', 'field_officer', 'government_official', 'admin'] },
    ]

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <Shield className="brand-icon" />
                    <span className="brand-text">
                        <span className="brand-smart">Smart</span>City
                    </span>
                </Link>

                <div className="navbar-menu">
                    {navItems
                        .filter(item => item.roles.includes(user?.role))
                        .map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.className || ''}`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <User size={16} />
                        <span className="user-name">{user?.name}</span>
                        <span className={`user-role role-${user?.role}`}>{user?.role}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
