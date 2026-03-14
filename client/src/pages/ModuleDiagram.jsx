/**
 * @file ModuleDiagram.jsx - System Module Architecture Diagram
 * @description Renders a visual diagram of the platform's module architecture,
 * illustrating the relationships and structure of system components.
 */

import { useState } from 'react'
import {
    Database,
    Filter,
    Brain,
    TrendingUp,
    GitBranch,
    LayoutDashboard,
    CheckCircle,
    MessageSquare,
    Shield,
    Zap,
    Globe,
    Server,
    Monitor,
    Users,
    Smartphone,
    Cloud,
    Cpu,
    HardDrive,
    Lock,
    ArrowRight,
    ArrowDown,
    AlertTriangle,
    MapPin,
    Bell,
    FileText,
    Settings,
    Wifi,
    Radio
} from 'lucide-react'
import './ModuleDiagram.css'

function ModuleDiagram() {
    const [viewMode, setViewMode] = useState('architecture')

    return (
        <div className="module-diagram-page">
            {/* Header */}
            <div className="diagram-header">
                <div className="header-logo">
                    <Shield size={40} />
                    <div>
                        <h1>Smart City Command Platform</h1>
                        <p>System Architecture & Workflow</p>
                    </div>
                </div>
                <div className="header-badge">
                    <Zap size={16} />
                    <span>Team 12 | 23CSE461</span>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flow-toggle">
                <button
                    className={`toggle-btn ${viewMode === 'architecture' ? 'active' : ''}`}
                    onClick={() => setViewMode('architecture')}
                >
                    Architecture
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'workflow' ? 'active' : ''}`}
                    onClick={() => setViewMode('workflow')}
                >
                    Workflow
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'modules' ? 'active' : ''}`}
                    onClick={() => setViewMode('modules')}
                >
                    Modules
                </button>
            </div>

            {/* Architecture Diagram - PPT Style */}
            {viewMode === 'architecture' && (
                <div className="ppt-architecture">
                    <h2 className="section-heading">System Architecture</h2>

                    <div className="arch-diagram">
                        {/* Top Row - Data Sources */}
                        <div className="arch-tier sources-tier">
                            <div className="tier-label">Data Sources</div>
                            <div className="tier-boxes">
                                <div className="arch-box source-box">
                                    <Users size={28} />
                                    <span>Citizens</span>
                                    <small>Web/Mobile Reports</small>
                                </div>
                                <div className="arch-box source-box">
                                    <Radio size={28} />
                                    <span>Traffic APIs</span>
                                    <small>Real-time Data</small>
                                </div>
                                <div className="arch-box source-box">
                                    <Wifi size={28} />
                                    <span>IoT Sensors</span>
                                    <small>Simulated Feeds</small>
                                </div>
                                <div className="arch-box source-box">
                                    <MessageSquare size={28} />
                                    <span>Social Media</span>
                                    <small>Public Reports</small>
                                </div>
                            </div>
                        </div>

                        <div className="arch-arrow-down">
                            <ArrowDown size={24} />
                            <span>Data Collection</span>
                        </div>

                        {/* Pre-Processing Layer */}
                        <div className="arch-tier process-tier">
                            <div className="tier-label">Pre-Processing</div>
                            <div className="tier-content">
                                <div className="process-flow">
                                    <div className="process-item">
                                        <Filter size={20} />
                                        <span>Validation</span>
                                    </div>
                                    <ArrowRight size={16} className="flow-arrow" />
                                    <div className="process-item">
                                        <Settings size={20} />
                                        <span>Normalization</span>
                                    </div>
                                    <ArrowRight size={16} className="flow-arrow" />
                                    <div className="process-item">
                                        <Lock size={20} />
                                        <span>Anonymization</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="arch-arrow-down">
                            <ArrowDown size={24} />
                            <span>Clean Data</span>
                        </div>

                        {/* AI Analysis Layer */}
                        <div className="arch-tier ai-tier">
                            <div className="tier-label">AI Layer</div>
                            <div className="tier-boxes">
                                <div className="arch-box ai-box">
                                    <Brain size={28} />
                                    <span>NLP Classification</span>
                                    <small>Incident Type Detection</small>
                                </div>
                                <div className="arch-box ai-box">
                                    <AlertTriangle size={28} />
                                    <span>Severity Scoring</span>
                                    <small>Priority Ranking</small>
                                </div>
                                <div className="arch-box ai-box">
                                    <TrendingUp size={28} />
                                    <span>Predictive Analytics</span>
                                    <small>Hotspot Detection</small>
                                </div>
                            </div>
                        </div>

                        <div className="arch-arrow-down">
                            <ArrowDown size={24} />
                            <span>Insights</span>
                        </div>

                        {/* Decision & Routing Layer */}
                        <div className="arch-tier routing-tier">
                            <div className="tier-label">Decision & Routing</div>
                            <div className="tier-content">
                                <div className="routing-center">
                                    <GitBranch size={32} />
                                    <span>Smart Routing Engine</span>
                                    <small>Auto-assign to Departments</small>
                                </div>
                                <div className="departments-list">
                                    <span className="dept">PWD</span>
                                    <span className="dept">Traffic</span>
                                    <span className="dept">BBMP</span>
                                    <span className="dept">Drainage</span>
                                    <span className="dept">Police</span>
                                </div>
                            </div>
                        </div>

                        <div className="arch-arrow-down">
                            <ArrowDown size={24} />
                            <span>Assignments</span>
                        </div>

                        {/* Action & Output Layer */}
                        <div className="arch-tier output-tier">
                            <div className="tier-label">Output</div>
                            <div className="tier-boxes">
                                <div className="arch-box output-box">
                                    <LayoutDashboard size={28} />
                                    <span>Command Dashboard</span>
                                    <small>Real-time Monitoring</small>
                                </div>
                                <div className="arch-box output-box">
                                    <Bell size={28} />
                                    <span>Alerts System</span>
                                    <small>Notifications</small>
                                </div>
                                <div className="arch-box output-box">
                                    <MapPin size={28} />
                                    <span>Live Map</span>
                                    <small>Incident Visualization</small>
                                </div>
                                <div className="arch-box output-box">
                                    <FileText size={28} />
                                    <span>Analytics</span>
                                    <small>Reports & Insights</small>
                                </div>
                            </div>
                        </div>

                        {/* Database - Side */}
                        <div className="database-side">
                            <div className="db-connector"></div>
                            <div className="db-box">
                                <Database size={32} />
                                <span>MongoDB</span>
                                <small>Incidents, Users, Departments</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Workflow Diagram - PPT Style */}
            {viewMode === 'workflow' && (
                <div className="ppt-workflow">
                    <h2 className="section-heading">System Workflow</h2>

                    <div className="workflow-container">
                        {/* Step 1 */}
                        <div className="workflow-step">
                            <div className="step-number">1</div>
                            <div className="step-box input-step">
                                <div className="step-icon"><Database size={32} /></div>
                                <div className="step-content">
                                    <h3>Input</h3>
                                    <p>City data collected from traffic APIs, citizen complaints, sensor feeds, and social media</p>
                                </div>
                            </div>
                        </div>

                        <div className="workflow-arrow"><ArrowDown size={24} /></div>

                        {/* Step 2 */}
                        <div className="workflow-step">
                            <div className="step-number">2</div>
                            <div className="step-box preprocess-step">
                                <div className="step-icon"><Filter size={32} /></div>
                                <div className="step-content">
                                    <h3>Pre-Processing</h3>
                                    <p>Backend services clean, normalize, and validate incoming data for consistency</p>
                                </div>
                            </div>
                        </div>

                        <div className="workflow-arrow"><ArrowDown size={24} /></div>

                        {/* Step 3 */}
                        <div className="workflow-step">
                            <div className="step-number">3</div>
                            <div className="step-box ai-step">
                                <div className="step-icon"><Brain size={32} /></div>
                                <div className="step-content">
                                    <h3>AI Analysis</h3>
                                    <p>AI models classify incidents by type and severity, prioritize by urgency and impact</p>
                                </div>
                            </div>
                        </div>

                        <div className="workflow-arrow"><ArrowDown size={24} /></div>

                        {/* Step 4 */}
                        <div className="workflow-step">
                            <div className="step-number">4</div>
                            <div className="step-box routing-step">
                                <div className="step-icon"><GitBranch size={32} /></div>
                                <div className="step-content">
                                    <h3>Decision & Routing</h3>
                                    <p>System automatically assigns incidents to appropriate departments with smart escalation</p>
                                </div>
                            </div>
                        </div>

                        <div className="workflow-arrow"><ArrowDown size={24} /></div>

                        {/* Step 5 */}
                        <div className="workflow-step">
                            <div className="step-number">5</div>
                            <div className="step-box action-step">
                                <div className="step-icon"><CheckCircle size={32} /></div>
                                <div className="step-content">
                                    <h3>Action</h3>
                                    <p>Field officers receive alerts, take action on-site, and update resolution status</p>
                                </div>
                            </div>
                        </div>

                        <div className="workflow-arrow"><ArrowDown size={24} /></div>

                        {/* Step 6 */}
                        <div className="workflow-step">
                            <div className="step-number">6</div>
                            <div className="step-box result-step">
                                <div className="step-icon"><LayoutDashboard size={32} /></div>
                                <div className="step-content">
                                    <h3>Result</h3>
                                    <p>Officials monitor real-time progress, response times, and analytics through command dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modules Grid */}
            {viewMode === 'modules' && (
                <div className="ppt-modules">
                    <h2 className="section-heading">Functional Modules</h2>

                    <div className="modules-grid-ppt">
                        <div className="module-box" style={{ '--color': '#3b82f6' }}>
                            <div className="module-num">01</div>
                            <Database size={28} />
                            <h3>Multi-Source Data Collection</h3>
                            <p>Citizens, Traffic APIs, Social Media, IoT Sensors</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#8b5cf6' }}>
                            <div className="module-num">02</div>
                            <Filter size={28} />
                            <h3>Data Preprocessing</h3>
                            <p>Cleaning, Validation, Anonymization, Normalization</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#ec4899' }}>
                            <div className="module-num">03</div>
                            <Brain size={28} />
                            <h3>AI Incident Intelligence</h3>
                            <p>NLP Classification, Severity Scoring, Keywords</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#f59e0b' }}>
                            <div className="module-num">04</div>
                            <TrendingUp size={28} />
                            <h3>Predictive Analytics</h3>
                            <p>Trend Analysis, Hotspot Prediction, Risk Scoring</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#10b981' }}>
                            <div className="module-num">05</div>
                            <GitBranch size={28} />
                            <h3>Automated Routing</h3>
                            <p>Department Assignment, Load Balancing, Escalation</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#06b6d4' }}>
                            <div className="module-num">06</div>
                            <LayoutDashboard size={28} />
                            <h3>Command Dashboard</h3>
                            <p>Real-time Maps, Stats, Filters, Alerts</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#22c55e' }}>
                            <div className="module-num">07</div>
                            <CheckCircle size={28} />
                            <h3>Resolution Tracking</h3>
                            <p>Status Updates, Timeline, Metrics, Audit Trail</p>
                        </div>
                        <div className="module-box" style={{ '--color': '#6366f1' }}>
                            <div className="module-num">08</div>
                            <MessageSquare size={28} />
                            <h3>User Feedback</h3>
                            <p>Ratings, Notifications, Progress Updates</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tech Stack Section */}
            <div className="tech-stack-ppt">
                <h2 className="section-heading">Tech Stack</h2>
                <div className="tech-row">
                    <div className="tech-card">
                        <h4>Frontend</h4>
                        <div className="tech-list">
                            <span>React.js</span>
                            <span>Vite</span>
                            <span>CSS3</span>
                            <span>Leaflet Maps</span>
                            <span>Recharts</span>
                        </div>
                    </div>
                    <div className="tech-card">
                        <h4>Backend</h4>
                        <div className="tech-list">
                            <span>Node.js</span>
                            <span>Express.js</span>
                            <span>REST APIs</span>
                            <span>JWT Auth</span>
                        </div>
                    </div>
                    <div className="tech-card">
                        <h4>Database</h4>
                        <div className="tech-list">
                            <span>MongoDB</span>
                            <span>Mongoose ODM</span>
                        </div>
                    </div>
                    <div className="tech-card">
                        <h4>AI Layer</h4>
                        <div className="tech-list">
                            <span>NLP Rules</span>
                            <span>Classification</span>
                            <span>Analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="diagram-footer">
                <p>Full Stack Frameworks (23CSE461) | Team 12</p>
                <p>Balaji • Danvanth • Amal Godwin • Prithiv A</p>
            </div>
        </div>
    )
}

export default ModuleDiagram
