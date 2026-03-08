# 🏙️ SMART CITY COMMAND & INTELLIGENCE PLATFORM — Features Document

**Course:** 23CSE461 – Full Stack Frameworks  
**Team:** Team 12 | Amrita Vishwa Vidyapeetham  
**Stack:** MERN (MongoDB · Express · React · Node.js) + AI Layer  
**GitHub:** https://github.com/Prithiv-0/Fullstack-project

---

## 📋 Table of Contents

1. [Platform Overview](#-platform-overview)
2. [User Roles & Permissions](#-user-roles--permissions)
3. [Core Features](#-core-features)
4. [Module Breakdown](#-module-breakdown)
5. [AI-Powered Features](#-ai-powered-features)
6. [Dashboard & Analytics](#-dashboard--analytics)
7. [Notification System](#-notification-system)
8. [Maps & Geospatial](#-maps--geospatial)
9. [Reports & Exports](#-reports--exports)
10. [Forms & User Interactions](#-forms--user-interactions)
11. [Security Features](#-security-features)
12. [DevOps & Deployment](#-devops--deployment)
13. [Tech Stack Summary](#-tech-stack-summary)
14. [Team Responsibilities](#-team-responsibilities)

---

## 🎯 Platform Overview

A full-stack **AI-powered Smart City Command & Intelligence Platform** that acts as a centralized **urban governance control room**. Citizens report issues, AI classifies and prioritizes them, the system auto-routes them to the correct government department, and officials manage resolution through a live command dashboard.

### End-to-End Workflow

```
Citizen Reports Issue
        ↓
Data Ingestion & Preprocessing (Module 1 + 2)
        ↓
AI Classification & Priority Scoring (Module 3)
        ↓
Predictive Analytics & Risk Forecasting (Module 4)
        ↓
Auto-Routing to Government Department (Module 5)
        ↓
Live Command Dashboard for Officials (Module 6)
        ↓
Field Officer Resolution + Proof Upload (Module 7)
        ↓
Citizen Notification & Feedback (Module 8)
        ↓
Audit Logs & Reports
```

---

## 👥 User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Citizen** | General public users | Report incidents, track own complaints, receive alerts, submit feedback, trigger SOS |
| **Field Officer** | On-ground resolution staff | View assigned incidents, update resolution status, upload proof of resolution |
| **Government Official** | Department-level officials | View command dashboard, manage department incidents, generate reports |
| **Admin** | Platform administrators | Full access: verify incidents, assign departments, configure alerts, view all analytics |

### Detailed Permission Matrix

| Resource | Citizen | Field Officer | Govt. Official | Admin |
|----------|:-------:|:-------------:|:--------------:|:-----:|
| Submit incident | ✅ | ✅ | ❌ | ✅ |
| View own incidents | ✅ | — | — | ✅ |
| View all incidents | ❌ | Own zone | All | All |
| Verify incident | ❌ | ❌ | ❌ | ✅ |
| Assign incident | ❌ | ❌ | ❌ | ✅ |
| Update resolution | ❌ | ✅ | ❌ | ✅ |
| View dashboard | ❌ | Limited | ✅ | ✅ |
| View analytics | ❌ | ❌ | ✅ | ✅ |
| Generate reports | ❌ | ❌ | ✅ | ✅ |
| Configure alerts | ❌ | ❌ | ❌ | ✅ |
| Submit feedback | ✅ | ❌ | ❌ | ❌ |
| Submit SOS | ✅ | ✅ | ❌ | ✅ |

---

## 🚀 Core Features

### 1. 📝 Incident Reporting
- Citizens can report urban issues via a rich incident reporting form
- **13 incident types** supported: Pothole, Traffic, Flooding, Streetlight, Garbage, Accident, Water Leak, Road Damage, Safety Issue, Noise, Illegal Parking, Sewage, Other
- **GPS-based location** tagging with auto-detect and manual entry
- **Media upload** support (photos/videos, up to 5 files, 10MB each)
- Automatic AI classification triggered on submission
- Automatic department routing post-classification

### 2. 🔍 Incident Tracking & Status Lifecycle
- Citizens can track complaints by ID or phone number
- Full **status lifecycle** with visual timeline:
  ```
  Reported → Acknowledged → Assigned → In Progress → Resolved → Closed
                                                                 ↑
                                            (Rejected at any stage)
  ```
- Real-time status badges with color coding:
  | Status | Color |
  |--------|-------|
  | Reported | 🟠 Orange |
  | Acknowledged | 🔵 Blue |
  | Assigned | 🟣 Purple |
  | In Progress | 🩵 Teal |
  | Resolved | 🟢 Green |
  | Closed | ⚪ Gray |
  | Rejected | 🔴 Red |

### 3. ✅ Incident Verification (Admin)
- Admins verify incoming incidents as: **Valid**, **False Report**, or **Duplicate**
- Severity override capability (Critical / High / Medium / Low)
- Admin notes for audit trail
- Valid incidents trigger AI classification + department routing
- False/duplicate incidents marked as rejected with citizen notification

### 4. 📌 Incident Assignment
- Assign incidents to specific departments and field officers
- Filterable officer list by department
- Priority level assignment (Critical / High / Medium / Low)
- SLA deadline with auto-suggestion based on department SLA hours
- Assignment notes for context
- Multi-channel alerts to assigned department and officer (email + SMS/WhatsApp)

### 5. 🔧 Resolution Management
- Field officers update resolution status with:
  - Action taken description
  - Resolution status (Resolved / Partial / Cannot Resolve)
  - **Proof upload** (required for resolved status — photos/videos)
  - Officer notes
- Creates audit resolution log entries
- Triggers citizen notification on resolution
- Time-to-acknowledge (TTA) and time-to-resolve (TTR) tracking

### 6. 🆘 Emergency SOS System
- One-tap SOS button for emergencies
- Captures emergency type, description, and GPS location
- Immediately creates a **critical severity** incident
- Triggers **instant multi-channel alerts** to City Police and all admins (SMS + Email)
- Active SOS alerts dashboard for admin monitoring

### 7. ⭐ Citizen Feedback System
- Post-resolution feedback form (only accessible after incident is resolved)
- **Multi-dimensional rating** (1–5 stars each):
  - Overall satisfaction
  - Response time satisfaction
  - Resolution quality
  - Ease of use
- Free-text comments
- Aggregated feedback analytics for admin insights

---

## 📦 Module Breakdown

### Module 1 — Multi-Source Data Collection
- Citizen app submissions (primary)
- Social media data feeds
- IoT sensor integration
- Traffic API integration
- Manual government entries
- Data source tracking on every incident

### Module 2 — Data Preprocessing & Normalization
- Input validation (Joi/Zod)
- PII anonymization for citizen data protection
- Location normalization (lat/lng, address, area, zone)
- Media file processing and cloud storage upload

### Module 3 — AI Incident Intelligence
- LLM-based NLP classification (Google Gemini / Gemma)
- Priority scoring (0–100 scale)
- Priority tagging (Critical / High / Medium / Low)
- AI-generated plain-language incident summaries
- Suggested department routing
- Classification confidence scoring (0.0–1.0)
- Sentiment analysis for urgency detection (-1.0 to 1.0)
- Batch classification support

### Module 4 — Predictive Analytics & Risk Forecasting
- Zone-based risk scoring (0–100)
- Risk level classification (Very High / High / Moderate / Low)
- Configurable time horizons (7d, 14d, 30d, 90d)
- Historical data point analysis
- Trend and seasonality detection
- Auto-generated preventive action recommendations
- Multiple forecasting models (Default LSTM / Seasonal / Weather-Correlated)

### Module 5 — Automated Routing & Alerts
- **Rule-based department routing** for 13 incident types:
  | Incident Type | Routed To |
  |--------------|-----------|
  | Pothole, Road Damage | Public Works Department |
  | Traffic, Illegal Parking | Traffic Management Centre |
  | Flooding, Sewage | Stormwater Drainage Department |
  | Water Leak | Bangalore Water Supply Board |
  | Streetlight | BESCOM Electrical Services |
  | Garbage, Other | BBMP / Bruhat Mahanagara Palike |
  | Accident, Safety Issue, Noise | City Police |
- Workload balancing across departments
- SLA enforcement with automatic escalation
- Configurable alert rules with multiple trigger conditions

### Module 6 — Unified Command Dashboard
- Real-time KPI cards: Total Incidents, Active, Resolved Today, Critical Active, Pending Action
- Average response time tracking
- SLA breach counter
- Interactive map with incident pins (color-coded by severity)
- Charts: Incidents by Type (bar), Severity Distribution (donut), Status Distribution (bar)
- Critical incidents live feed sidebar
- Department workload panel

### Module 7 — Resolution Tracking & Audit
- Complete resolution lifecycle management
- Proof-of-resolution upload requirement
- Time-to-acknowledge (TTA) and time-to-resolve (TTR) metrics
- Comprehensive audit logs for every status change
- SLA cron job monitoring (every 5 minutes)
- Auto-escalation on SLA breaches

### Module 8 — User Interaction & Notification
- Multi-channel notification delivery (Email, SMS, WhatsApp, Push, In-App)
- Event-driven notification triggers for every status change
- Notification history with read/unread tracking
- Broadcast capability for zone-wide or city-wide alerts
- Notification bell with unread count badge

---

## 🤖 AI-Powered Features

### LLM Classification (Google Gemini / Gemma)
- **Automatic incident classification** — triggered asynchronously after each submission
- NLP-based sub-categorization beyond the 13 base types
- Priority scoring with confidence levels
- AI-generated summaries in plain English with recommended actions
- Department suggestion with confidence scoring
- Sentiment analysis for urgency tone detection

### Predictive Risk Forecasting
- **Zone-based risk forecasting** using historical incident data
- MVP uses statistical trend analysis; extensible to LSTM / Seasonal / Weather-Correlated models
- Configurable alert thresholds (trigger alerts above a risk score)
- Visual risk score cards per zone with actionable recommendations

### Background AI Jobs
- **Auto-classification** runs after every incident submission
- **SLA monitoring** cron job runs every 5 minutes
- Auto-escalation and notification on SLA breaches
- Automatic severity update from AI classification results

---

## 📊 Dashboard & Analytics

### Citizen Dashboard
- Total reports count
- In-progress incidents count
- Resolved incidents count
- Recent reports list with status badges
- Quick "Report Incident" button
- Notification bell with unread count

### Command Center (Officials)
- Interactive **Leaflet.js map** with severity-colored incident pins
- Filter bar: Status / Severity / Type
- KPI header: Total Incidents | Critical Active | Pending Action
- Map / List toggle view
- Critical incidents feed sidebar

### Admin Dashboard
- **KPI Cards Row:** Total Incidents, Active, Resolved Today, Critical Active
- **Charts Row 1:** Incidents by Type (bar chart) | Severity Distribution (donut chart)
- **Charts Row 2:** Status Distribution (bar chart) | Critical Incidents list
- Department workload panel

### Analytics Endpoints
| Metric | Description |
|--------|-------------|
| Dashboard KPIs | Total, active, resolved today, critical, pending action, avg response time, SLA breaches |
| Incidents by Type | Bar chart data grouped by incident category |
| Severity Distribution | Donut chart data by severity level |
| Status Distribution | Bar chart data by current status |
| Response Times | Average TTA/TTR per department |
| Dept Performance | Department workload statistics |
| Critical Feed | Live list of critical severity incidents |

---

## 🔔 Notification System

### Supported Channels
- ✉️ **Email** — via Nodemailer (Gmail SMTP)
- 📱 **SMS** — via Twilio
- 💬 **WhatsApp** — via Twilio WhatsApp / Meta Cloud API
- 🔔 **Push Notifications**
- 📲 **In-App Notifications** — with unread count badge

### Notification Triggers

| Event | Channels | Recipient |
|-------|----------|-----------|
| Incident Submitted | Email | Citizen |
| Incident Verified | Email | Citizen |
| Incident Assigned | Email, SMS | Department + Officer |
| Incident Acknowledged | Email, In-App | Citizen |
| Incident Resolved | Email, WhatsApp | Citizen |
| SLA Breach | Email, SMS | Admin + Dept Head |
| Critical Incident | Email, SMS, WhatsApp | All Admins |
| SOS Submitted | SMS, Email | Admin + City Police |
| Nearby Alert | In-App, Email | Citizens in Zone |

### Alert Configuration (Admin)
- Configurable trigger conditions: New Critical Incident, SLA Breach, High Volume Spike, etc.
- Severity threshold settings
- Target recipient groups (All Admins, Dept Officials, Field Officers, Nearby Citizens)
- Multi-channel selection (Email, SMS, WhatsApp, In-App Push)
- Zone-based filtering
- Enable/disable toggle per rule

---

## 🗺️ Maps & Geospatial

### Interactive Map (Leaflet.js + OpenStreetMap)
- **Incident pins** color-coded by severity:
  | Severity | Color |
  |----------|-------|
  | Critical | 🔴 Red (`#DC2626`) |
  | High | 🟠 Orange (`#EA580C`) |
  | Medium | 🟡 Amber (`#D97706`) |
  | Low | 🟢 Green (`#16A34A`) |
- Click-to-view incident detail popup
- **Heatmap layer** toggle for hotspot visualization (using `leaflet.heat`)
- Zone boundary overlays (GeoJSON)
- Filter by severity and type
- Pin clustering at low zoom levels
- Nearby incidents search (by lat/lng and radius)

### Hotspot Analysis
- Configurable zone, incident type, and time window filters
- Adjustable cluster radius (0.5–5 km slider)
- Visual heatmap overlay on the map
- Zone-level risk scoring

---

## 📈 Reports & Exports

### Available Report Types

| # | Report | Access | Description |
|---|--------|--------|-------------|
| 1 | Active Incidents | Admin, Official | Currently open incidents summary |
| 2 | Incident Type Distribution | Admin, Official | Frequency breakdown by category |
| 3 | Severity & Priority | Admin | Critical incidents analysis |
| 4 | Department Workload | Admin | Load per department with SLA stats |
| 5 | Response Time | Admin | TTA/TTR analysis across departments |
| 6 | Hotspot | Admin | Geographic concentration of issues |
| 7 | Trend & Pattern | Admin | Historical trends over time |
| 8 | Predictive Risk | Admin | AI risk forecast summary |
| 9 | Complaint Status | Citizen | Personal complaints progress report |
| 10 | Audit & Resolution | Admin | Complete audit log export |

### Report Features
- **Filters:** Date range, zone, incident type, department
- **Export formats:** View on Screen, PDF, CSV
- Charted visualizations and tabular data
- Automated report generation via API

---

## 📝 Forms & User Interactions

| # | Form | Page | User | Purpose |
|---|------|------|------|---------|
| 1 | Incident Reporting | `/citizen/report` | Citizen | Submit urban issues with GPS + media |
| 2 | Citizen Registration | `/register` | Public | Create account with role selection |
| 3 | Complaint Tracking | `/citizen/track` | Citizen | Look up and track complaint status |
| 4 | Incident Verification | `/admin/verify` | Admin | Verify/reject incoming incidents |
| 5 | Incident Assignment | `/admin/assign/:id` | Admin | Assign to department + officer |
| 6 | Resolution Update | Officer incident view | Field Officer | Update status + upload proof |
| 7 | Department Workload | `/admin` | Admin | View/manage department loads |
| 8 | Report Generation | `/admin/reports` | Admin, Official | Generate filtered reports |
| 9 | Hotspot Analysis | `/admin/hotspots` | Admin | Analyze incident hotspots on map |
| 10 | Predictive Risk Config | `/admin/predictive` | Admin | Configure risk forecasting |
| 11 | Alert Configuration | `/admin/alerts` | Admin | Set up notification rules |
| 12 | Feedback & Rating | `/citizen/feedback/:id` | Citizen | Rate resolution experience |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT-based (access token: 15m, refresh token: 7d) |
| **Password Security** | bcrypt hashing with 12 salt rounds |
| **Role-Based Access Control** | Middleware-enforced RBAC on every route |
| **Rate Limiting** | `express-rate-limit` — 5 req/min on login, 100 req/15min globally |
| **Input Validation** | Joi/Zod schema validation on all routes |
| **Security Headers** | Helmet.js for HTTP security headers |
| **CORS** | Configured Cross-Origin Resource Sharing |
| **PII Anonymization** | Citizen data masking for reports/exports |
| **HTTPS** | TLS-only communication in production |
| **Token Invalidation** | Refresh tokens stored in DB/Redis for revocation |

---

## ⚙️ DevOps & Deployment

### CI/CD Pipeline (GitHub Actions)
- Automated testing on push to `main` and `develop`
- Backend: `npm ci` → `npm test` → `npm run lint`
- Frontend: `npm ci` → `npm run build` → `npm test`
- Auto-deploy to production on merge to `main`

### Deployment Targets

| Component | Platform | Tier |
|-----------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render / Railway | Free |
| Database | MongoDB Atlas | M0 Free |
| AI Classification | Google Gemini API | Free quota |
| File Storage | Cloudinary / AWS S3 | Free tier |
| Email | Nodemailer (Gmail SMTP) | Free |
| SMS | Twilio | Trial |

### Docker Support
- Full `docker-compose.yml` for local development
- Services: Client (port 3000), Server (port 5000), MongoDB (port 27017)
- Persistent volume for database data

---

## 🛠️ Tech Stack Summary

### Frontend
| Technology | Purpose |
|-----------|---------|
| React | UI Framework |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| Leaflet.js | Interactive Maps |
| leaflet.heat | Heatmap Overlays |
| Recharts | Charts & Graphs |
| Axios | HTTP Client |
| React Router | Client-side Routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Mongoose | MongoDB ODM |
| JWT (jsonwebtoken) | Authentication |
| bcrypt | Password Hashing |
| Multer | File Uploads |
| node-cron | Background Jobs |
| Nodemailer | Email |
| Twilio | SMS & WhatsApp |
| Helmet.js | Security Headers |
| Joi / Zod | Input Validation |

### AI & Analytics
| Technology | Purpose |
|-----------|---------|
| Google Gemini / Gemma | LLM Classification |
| Statistical Models | Predictive Forecasting |
| TensorFlow (optional) | Advanced ML Models |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Primary Database |
| 10 Collections | Users, Incidents, Intelligence, Forecasts, Departments, Assignments, Resolution Logs, Notifications, Feedback, Analytics Aggregates |

---

## 👨‍💻 Team Responsibilities

### Balaji Arunachalam (CB.SC.U4CSE23759) — Data Ingestion Layer
**Modules:** 1 (Multi-Source Data Collection) + 2 (Data Preprocessing & Normalization)
- Models: `User.js`, `Incident.js`
- Pages: Register, Citizen Dashboard, Report Incident
- Forms: Incident Reporting, Citizen Registration
- Report: Incident Type Distribution

### Danvanth (CB.SC.U4CSE23241) — AI Intelligence Layer
**Modules:** 3 (AI Incident Intelligence) + 4 (Predictive Analytics & Risk Forecasting)
- Models: `IncidentIntelligence.js`, `RiskForecast.js`
- Services: AI classification (LLM), Predictive forecasting, Geospatial processing
- Pages: Verify Incidents, Hotspot Analysis, Predictive Config
- Reports: Severity & Priority, Hotspot, Trend & Pattern, Predictive Risk
- Visualization: Heatmap layer, Hotspot prediction map

### Amal Godwin (CB.SC.U4CSE23407) — Operational Layer
**Modules:** 5 (Automated Routing & Alert) + 6 (Unified Command Dashboard)
- Models: `Department.js`, `Assignment.js`, `AnalyticsAggregate.js`
- Services: Department routing, Notifications, Analytics
- Pages: Command Center, Incident Management, Department View, Reports, Admin Dashboard
- Reports: Active Incidents, Department Workload

### Prithiv A (CB.SC.U4CSE23260) — Governance Layer
**Modules:** 7 (Resolution Tracking & Audit) + 8 (User Interaction & Notification)
- Models: `ResolutionLog.js`, `Notification.js`, `Feedback.js`
- Services: Resolution lifecycle, SLA cron, Audit logs
- Pages: Track Complaint, Feedback, SOS, Profile
- Reports: Response Time, Complaint Status, Audit & Resolution

---

*Smart City Command & Intelligence Platform — Team 12 | 23CSE461 Full Stack Frameworks | Amrita Vishwa Vidyapeetham*
