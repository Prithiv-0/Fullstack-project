import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CommandCenter from './pages/CommandCenter'
import ReportIncident from './pages/ReportIncident'
import IncidentDetails from './pages/IncidentDetails'
import Analytics from './pages/Analytics'
import Departments from './pages/Departments'
import EditProfile from './pages/EditProfile'
import FeedbackForm from './pages/FeedbackForm'
import FeedbackHub from './pages/FeedbackHub'
import EmergencySOS from './pages/EmergencySOS'
import ContactDepartment from './pages/ContactDepartment'
import VerifyIncident from './pages/VerifyIncident'
import TrackComplaint from './pages/TrackComplaint'
import AssignIncident from './pages/AssignIncident'
import ResolveIncident from './pages/ResolveIncident'
import AuditReport from './pages/AuditReport'

// Protected Route Component
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { user } = useAuth()

  return (
    <div className="app">
      {user && <Navbar />}
      <main className={user ? 'main-with-nav' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes — All Roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/report" element={
            <ProtectedRoute roles={['citizen', 'field_officer', 'admin']}>
              <ReportIncident />
            </ProtectedRoute>
          } />

          <Route path="/track" element={
            <ProtectedRoute>
              <TrackComplaint />
            </ProtectedRoute>
          } />

          <Route path="/incidents/:id" element={
            <ProtectedRoute>
              <IncidentDetails />
            </ProtectedRoute>
          } />

          {/* Official/Admin Routes */}
          <Route path="/command-center" element={
            <ProtectedRoute roles={['field_officer', 'government_official', 'admin']}>
              <CommandCenter />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute roles={['government_official', 'admin']}>
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute roles={['admin']}>
              <Departments />
            </ProtectedRoute>
          } />

          {/* Profile & Forms */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />

          <Route path="/incidents/:id/feedback" element={
            <ProtectedRoute roles={['citizen']}>
              <FeedbackForm />
            </ProtectedRoute>
          } />

          <Route path="/feedback" element={
            <ProtectedRoute roles={['citizen']}>
              <FeedbackHub />
            </ProtectedRoute>
          } />

          <Route path="/emergency" element={
            <ProtectedRoute>
              <EmergencySOS />
            </ProtectedRoute>
          } />

          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactDepartment />
            </ProtectedRoute>
          } />

          <Route path="/incidents/:id/verify" element={
            <ProtectedRoute roles={['government_official', 'admin']}>
              <VerifyIncident />
            </ProtectedRoute>
          } />

          <Route path="/incidents/:id/assign" element={
            <ProtectedRoute roles={['admin', 'government_official']}>
              <AssignIncident />
            </ProtectedRoute>
          } />

          <Route path="/incidents/:id/resolve" element={
            <ProtectedRoute roles={['admin', 'field_officer']}>
              <ResolveIncident />
            </ProtectedRoute>
          } />

          <Route path="/audit-report" element={
            <ProtectedRoute roles={['admin']}>
              <AuditReport />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
