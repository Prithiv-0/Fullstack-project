# SMART CITY COMMAND & INTELLIGENCE PLATFORM
## Complete Technical Build Specification for AI Agent

**Course:** 23CSE461 – Full Stack Frameworks  
**GitHub:** https://github.com/Prithiv-0/Fullstack-project  
**Stack:** MERN (MongoDB · Express · React · Node.js) + AI Layer

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema (MongoDB Collections)](#4-database-schema-mongodb-collections)
5. [Backend – API Specification](#5-backend--api-specification)
6. [Frontend – Pages & Components](#6-frontend--pages--components)
7. [Forms Specification](#7-forms-specification)
8. [AI Layer](#8-ai-layer)
9. [Notification System](#9-notification-system)
10. [Authentication & RBAC](#10-authentication--rbac)
11. [DevOps & Deployment](#11-devops--deployment)
12. [Module-to-Developer Assignment](#12-module-to-developer-assignment)
13. [Environment Variables](#13-environment-variables)
14. [Build Order & Implementation Checklist](#14-build-order--implementation-checklist)

---

## 1. PROJECT OVERVIEW

### What It Is
A full-stack AI-powered Smart City Command & Intelligence Platform that acts as a centralized urban governance control room. Citizens report issues, AI classifies and prioritizes them, the system auto-routes them to the correct government department, and officials manage resolution through a live command dashboard.

### Core Workflow
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

### User Roles
| Role | Permissions |
|------|-------------|
| `citizen` | Report incidents, track own complaints, receive alerts, submit feedback, SOS |
| `field_officer` | View assigned incidents, update resolution status, upload proof |
| `government_official` | View dashboard, manage department incidents, generate reports |
| `admin` | Full access: verify incidents, assign departments, configure alerts, view all analytics |

---

## 2. ARCHITECTURE OVERVIEW

### Layer Stack (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                           │
│         Citizens │ City Admins │ Field Officers              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                     FRONTEND LAYER                          │
│   React + Vite │ Leaflet.js │ Tailwind CSS                  │
│   ┌──────────────────┐  ┌───────────────────────────────┐  │
│   │ Citizen Web App  │  │  Official / Admin Portal       │  │
│   │ - Incident Form  │  │  - Command Center Dashboard    │  │
│   │ - Status Tracker │  │  - Analytics & Reports         │  │
│   │ - SOS Button     │  │  - Incident Mgmt Console       │  │
│   └──────────────────┘  └───────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼─────────────────────────────────┐
│              API GATEWAY / BACKEND LAYER                     │
│            Node.js + Express.js REST API                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│   │  Auth +  │ │ Incident │ │  Dept    │ │  Analytics   │  │
│   │  JWT     │ │  Mgmt    │ │ Routing  │ │  & Reports   │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│  ┌─────────────────────┐    ┌───────────────────────────┐   │
│  │   AI CLASSIFICATION  │    │   GEOSPATIAL PROCESSING   │   │
│  │  - Priority Scoring  │    │  - Location Validation    │   │
│  │  - NLP Categorization│    │  - Hotspot Detection      │   │
│  └─────────────────────┘    └───────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              DEPT ASSIGNMENT ENGINE                  │    │
│  │        Rule Routing │ Workload Balancing             │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    AI & ANALYTICS LAYER                      │
│   LLM APIs (Gemma/Gemini) │ Predictive Models │ TensorFlow  │
│   - NLP Classification    │ - Hotspot Forecast              │
│   - Summarization         │ - Time-series Analysis          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DATA LAYER                             │
│          MongoDB Atlas │ Cloud Object Storage                │
│   incidents │ users │ departments │ assignments              │
│   resolutionLogs │ notifications │ feedback │ analytics      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   INTEGRATION LAYER                          │
│  Email (Nodemailer) │ SMS (Twilio) │ WhatsApp Business API   │
│  Mapping (Leaflet/OSM) │ Image Upload │ Push Notifications   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYER                            │
│  JWT Auth │ API Rate Limiting │ RBAC │ Input Validation      │
│  Helmet.js │ CORS │ PII Anonymization │ HTTPS Only           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  CLOUD & DEVOPS LAYER                        │
│  Vercel (FE) │ Render/Railway (BE) │ MongoDB Atlas (DB)      │
│  AWS Lambda (AI) │ CloudFront CDN │ Docker │ GitHub Actions  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. FOLDER STRUCTURE

```
smart-city-platform/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              # Shared UI: Button, Modal, Badge, Spinner
│   │   │   ├── layout/              # Navbar, Sidebar, Header, Footer
│   │   │   ├── map/                 # MapView, IncidentPin, HeatmapLayer
│   │   │   ├── dashboard/           # KPICard, ChartPanel, AlertFeed
│   │   │   ├── incidents/           # IncidentCard, IncidentList, IncidentDetail
│   │   │   └── forms/               # All form components (see Section 7)
│   │   ├── pages/
│   │   │   ├── citizen/
│   │   │   │   ├── CitizenDashboard.jsx
│   │   │   │   ├── ReportIncident.jsx
│   │   │   │   ├── TrackComplaint.jsx
│   │   │   │   ├── SOSPage.jsx
│   │   │   │   └── FeedbackPage.jsx
│   │   │   ├── official/
│   │   │   │   ├── CommandCenter.jsx
│   │   │   │   ├── IncidentManagement.jsx
│   │   │   │   ├── DepartmentView.jsx
│   │   │   │   └── ReportsPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── VerifyIncidents.jsx
│   │   │   │   ├── AlertConfig.jsx
│   │   │   │   ├── HotspotAnalysis.jsx
│   │   │   │   └── PredictiveConfig.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # AuthContext, IncidentContext
│   │   ├── services/                # Axios API calls per module
│   │   ├── utils/                   # Helpers, formatters, constants
│   │   ├── routes/                  # Protected route wrappers by role
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB Atlas connection
│   │   │   ├── cloudStorage.js      # S3/cloud file upload config
│   │   │   └── env.js               # Environment variable loader
│   │   ├── models/                  # Mongoose schemas (see Section 4)
│   │   │   ├── User.js
│   │   │   ├── Incident.js
│   │   │   ├── IncidentIntelligence.js
│   │   │   ├── RiskForecast.js
│   │   │   ├── Department.js
│   │   │   ├── Assignment.js
│   │   │   ├── ResolutionLog.js
│   │   │   ├── Notification.js
│   │   │   ├── Feedback.js
│   │   │   └── AnalyticsAggregate.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── incident.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── department.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── feedback.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── sos.routes.js
│   │   ├── controllers/             # Request handlers per route
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── rbac.middleware.js   # Role-based access control
│   │   │   ├── validate.middleware.js # Joi/Zod input validation
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── upload.middleware.js # Multer file upload
│   │   ├── services/
│   │   │   ├── ai.service.js        # LLM API calls
│   │   │   ├── predictive.service.js # Forecast model calls
│   │   │   ├── routing.service.js   # Dept assignment rules
│   │   │   ├── notification.service.js # Email/SMS/WhatsApp
│   │   │   ├── geospatial.service.js
│   │   │   └── analytics.service.js
│   │   ├── utils/
│   │   │   ├── responseHelper.js
│   │   │   ├── anonymize.js         # PII masking
│   │   │   └── slaTicker.js         # SLA escalation cron
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point
│   └── package.json
│
├── ai-service/                      # Separate AI microservice (optional Lambda)
│   ├── classify.py                  # LLM classification handler
│   ├── forecast.py                  # Predictive model handler
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # GitHub Actions pipeline
├── .env.example
└── README.md
```

---

## 4. DATABASE SCHEMA (MongoDB Collections)

### Collection 1: `users`
```js
{
  _id: ObjectId,
  userId: String,          // UUID
  name: String,            // required
  email: String,           // unique, required
  phone: String,
  passwordHash: String,    // bcrypt
  role: {                  // enum: 'citizen' | 'field_officer' | 'government_official' | 'admin'
    type: String,
    default: 'citizen'
  },
  zone: String,            // e.g. "North Zone", "Electronic City"
  isVerified: Boolean,
  isActive: { type: Boolean, default: true },
  profilePhoto: String,    // URL
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 2: `incidents`
```js
{
  _id: ObjectId,
  incidentId: String,      // UUID
  type: {
    type: String,
    enum: [
      'pothole', 'traffic', 'flooding', 'streetlight',
      'garbage', 'accident', 'water_leak', 'road_damage',
      'safety_issue', 'noise', 'illegal_parking', 'sewage', 'other'
    ],
    required: true
  },
  title: String,           // required
  description: String,
  location: {
    lat: Number,           // required
    lng: Number,           // required
    address: String,
    area: String,          // locality / neighbourhood
    zone: String
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'reported'
  },
  reportedBy: { type: ObjectId, ref: 'User' },    // required
  mediaUrls: [String],     // uploaded photo/video URLs
  isVerified: { type: Boolean, default: false },
  isFalse: { type: Boolean, default: false },
  source: {
    type: String,
    enum: ['citizen_app', 'social_media', 'iot_sensor', 'traffic_api', 'manual'],
    default: 'citizen_app'
  },
  aiProcessed: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `location.zone`, `status`, `type`, `severity`, `reportedBy`, `createdAt`

### Collection 3: `incident_intelligence`
```js
{
  _id: ObjectId,
  incidentId: { type: ObjectId, ref: 'Incident', unique: true },
  nlpCategory: String,           // AI-determined category
  priorityScore: Number,         // 0–100
  priorityTag: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low']
  },
  aiSummary: String,             // LLM-generated plain-language summary
  suggestedDepartment: String,   // AI-suggested dept name
  classificationConfidence: Number,  // 0.0–1.0
  sentimentScore: Number,        // -1.0 to 1.0 (urgency tone)
  llmModel: String,              // e.g. "gemma-7b", "gemini-pro"
  rawResponse: Object,           // full LLM response JSON
  processedAt: Date,
  createdAt: Date
}
```

### Collection 4: `risk_forecasts`
```js
{
  _id: ObjectId,
  forecastId: String,
  zone: String,                  // required
  incidentType: String,          // 'all' or specific type
  riskScore: Number,             // 0–100
  riskLevel: {
    type: String,
    enum: ['very_high', 'high', 'moderate', 'low']
  },
  forecastDate: Date,            // target date for forecast
  timeHorizon: String,           // e.g. "7d", "30d"
  model: String,                 // model name used
  confidence: Number,            // 0.0–1.0
  historicalDataPoints: [
    {
      date: Date,
      incidentCount: Number,
      avgSeverity: Number
    }
  ],
  recommendations: [String],     // suggested preventive actions
  generatedAt: Date
}
```

### Collection 5: `departments`
```js
{
  _id: ObjectId,
  deptId: String,
  name: String,                  // e.g. "Public Works Department"
  shortName: String,             // e.g. "PWD"
  contactEmail: String,
  contactPhone: String,
  incidentTypes: [String],       // types this dept handles
  zone: String,                  // jurisdiction zone
  officers: [{ type: ObjectId, ref: 'User' }],
  currentLoad: { type: Number, default: 0 },  // active incident count
  slaHours: { type: Number, default: 24 },    // SLA in hours
  isActive: { type: Boolean, default: true },
  createdAt: Date
}
```

### Collection 6: `assignments`
```js
{
  _id: ObjectId,
  assignmentId: String,
  incidentId: { type: ObjectId, ref: 'Incident', required: true },
  departmentId: { type: ObjectId, ref: 'Department', required: true },
  officerId: { type: ObjectId, ref: 'User' },
  assignedBy: { type: ObjectId, ref: 'User' },  // admin who assigned
  assignedAt: Date,
  slaDueBy: Date,
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in_progress', 'completed', 'escalated'],
    default: 'pending'
  },
  escalationCount: { type: Number, default: 0 },
  escalatedAt: Date,
  notes: String
}
```

### Collection 7: `resolution_logs`
```js
{
  _id: ObjectId,
  logId: String,
  incidentId: { type: ObjectId, ref: 'Incident', required: true },
  officerId: { type: ObjectId, ref: 'User', required: true },
  action: String,                // description of action taken
  proofUrls: [String],           // uploaded proof photo/video URLs
  statusBefore: String,
  statusAfter: String,
  timestamp: Date,
  notes: String,
  tta: Number,                   // time-to-acknowledge in minutes
  ttr: Number,                   // time-to-resolve in minutes
  isResolved: { type: Boolean, default: false }
}
```

### Collection 8: `notifications`
```js
{
  _id: ObjectId,
  notifId: String,
  recipientId: { type: ObjectId, ref: 'User', required: true },
  incidentId: { type: ObjectId, ref: 'Incident' },
  channel: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'push', 'in_app']
  },
  subject: String,
  message: String,               // required
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  deliveredAt: Date,
  failureReason: String
}
```

### Collection 9: `feedback`
```js
{
  _id: ObjectId,
  feedbackId: String,
  incidentId: { type: ObjectId, ref: 'Incident', required: true },
  citizenId: { type: ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: String,
  responseSatisfaction: { type: Number, min: 1, max: 5 },
  resolvedSatisfaction: { type: Number, min: 1, max: 5 },
  easeOfUse: { type: Number, min: 1, max: 5 },
  submittedAt: Date
}
```

### Collection 10: `analytics_aggregates`
```js
{
  _id: ObjectId,
  aggId: String,
  period: String,                // e.g. "2025-01", "2025-W04"
  periodType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  zone: String,                  // 'all' or specific zone
  incidentCounts: {
    total: Number,
    byType: Object,              // { pothole: 12, traffic: 8, ... }
    bySeverity: Object,          // { critical: 2, high: 5, ... }
    byStatus: Object
  },
  avgTTA: Number,                // average time-to-acknowledge (minutes)
  avgTTR: Number,                // average time-to-resolve (minutes)
  deptPerformance: [
    {
      deptId: ObjectId,
      name: String,
      assigned: Number,
      resolved: Number,
      avgTTR: Number,
      slaBreaches: Number
    }
  ],
  citizenSatisfactionAvg: Number,
  generatedAt: Date
}
```

---

## 5. BACKEND – API SPECIFICATION

**Base URL:** `/api/v1`  
**Auth Header:** `Authorization: Bearer <jwt_token>`  
**Content-Type:** `application/json`

### 5.1 Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/register` | Public | `{ name, email, phone, password, role, zone }` | `{ user, token }` |
| `POST` | `/login` | Public | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| `POST` | `/logout` | JWT | `{}` | `{ message }` |
| `POST` | `/refresh` | Public | `{ refreshToken }` | `{ accessToken }` |
| `GET` | `/profile` | JWT | — | `{ user }` |
| `PUT` | `/profile` | JWT | `{ name, phone, zone, profilePhoto }` | `{ user }` |
| `POST` | `/forgot-password` | Public | `{ email }` | `{ message }` |
| `POST` | `/reset-password` | Public | `{ token, newPassword }` | `{ message }` |

**Implementation Notes:**
- Use `bcrypt` (salt rounds: 12) for password hashing
- JWT access token expires in `15m`, refresh token in `7d`
- Store refresh tokens in DB or Redis for invalidation
- Apply rate limiting: 5 requests/minute on `/login`

---

### 5.2 Incident Routes (`/api/v1/incidents`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/` | JWT | citizen | Submit new incident |
| `GET` | `/` | JWT | admin, official | List all incidents with filters |
| `GET` | `/my` | JWT | citizen | Get my reported incidents |
| `GET` | `/:id` | JWT | all | Get incident by ID with full details |
| `PUT` | `/:id/verify` | JWT | admin | Verify / reject incident, override severity |
| `PUT` | `/:id/assign` | JWT | admin | Assign to department and officer |
| `PUT` | `/:id/resolve` | JWT | field_officer | Update status, upload proof |
| `PUT` | `/:id/acknowledge` | JWT | field_officer, official | Acknowledge receipt |
| `PUT` | `/:id/close` | JWT | admin | Close resolved incident |
| `DELETE` | `/:id` | JWT | admin | Soft-delete false/duplicate |
| `GET` | `/nearby` | JWT | citizen | Get incidents near lat/lng (query params: `lat`, `lng`, `radius`) |

**POST `/` Request Body:**
```json
{
  "type": "pothole",
  "title": "Large pothole on MG Road",
  "description": "Deep pothole causing vehicle damage, near Metro Station Exit 2",
  "location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "address": "MG Road, Near Metro Station Exit 2",
    "area": "MG Road",
    "zone": "Central"
  },
  "mediaUrls": ["https://storage.url/photo1.jpg"]
}
```

**GET `/` Query Params:**
- `type`, `severity`, `status`, `zone`, `deptId`, `dateFrom`, `dateTo`
- `page` (default: 1), `limit` (default: 20), `sortBy` (default: `createdAt`), `sortOrder` (`asc`/`desc`)

**Incident Status Lifecycle:**
```
reported → acknowledged → assigned → in_progress → resolved → closed
                                                            ↑
                                               (rejected at any stage)
```

---

### 5.3 AI Routes (`/api/v1/ai`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/classify/:incidentId` | JWT | admin | Trigger LLM classification for incident |
| `GET` | `/classify/:incidentId` | JWT | admin, official | Get classification result |
| `POST` | `/classify/batch` | JWT | admin | Classify multiple incidents at once |

**POST `/classify/:incidentId` Response:**
```json
{
  "incidentId": "...",
  "nlpCategory": "road_infrastructure",
  "priorityTag": "high",
  "priorityScore": 78,
  "aiSummary": "Large pothole on a major arterial road near a metro station exit causing traffic disruption and vehicle damage risk. Requires Public Works Department intervention within 24 hours.",
  "suggestedDepartment": "Public Works Department",
  "classificationConfidence": 0.91,
  "sentimentScore": -0.6
}
```

---

### 5.4 Predictive Analytics Routes (`/api/v1/predictive`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/forecast` | JWT | admin | Trigger risk forecast for zone |
| `GET` | `/forecast/:zone` | JWT | admin, official | Get latest forecast for zone |
| `GET` | `/forecast` | JWT | admin | Get all zone forecasts |
| `GET` | `/hotspots` | JWT | admin, official | Get heatmap data points |
| `GET` | `/trends` | JWT | admin, official | Time-series trend data for charts |

**POST `/forecast` Request Body:**
```json
{
  "zone": "Central",
  "incidentType": "all",
  "timeHorizon": "7d"
}
```

---

### 5.5 Analytics / Dashboard Routes (`/api/v1/analytics`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/dashboard` | JWT | admin, official | KPI summary cards |
| `GET` | `/incidents-by-type` | JWT | admin, official | Bar chart data |
| `GET` | `/severity-distribution` | JWT | admin, official | Donut chart data |
| `GET` | `/status-distribution` | JWT | admin, official | Status bar chart data |
| `GET` | `/response-times` | JWT | admin | Avg TTA/TTR per dept |
| `GET` | `/dept-performance` | JWT | admin | Department workload stats |
| `GET` | `/critical-feed` | JWT | admin, official | Live critical incidents list |

**GET `/dashboard` Response:**
```json
{
  "totalIncidents": 16,
  "activeIncidents": 13,
  "resolvedToday": 0,
  "criticalActive": 4,
  "pendingAction": 9,
  "avgResponseTimeHours": 3.2,
  "slaBreachCount": 2
}
```

---

### 5.6 Department Routes (`/api/v1/departments`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/` | JWT | admin, official | List all departments |
| `GET` | `/:id` | JWT | admin, official | Get department details |
| `GET` | `/:id/workload` | JWT | admin | Dept workload and incident stats |
| `POST` | `/` | JWT | admin | Create department |
| `PUT` | `/:id` | JWT | admin | Update department info |
| `GET` | `/:id/officers` | JWT | admin | List officers in department |
| `POST` | `/:id/officers` | JWT | admin | Add officer to department |

**Department Routing Rules (server/services/routing.service.js):**
```js
const ROUTING_RULES = {
  pothole:        "Public Works Department",
  road_damage:    "Public Works Department",
  traffic:        "Traffic Management Centre",
  illegal_parking:"Traffic Management Centre",
  flooding:       "Stormwater Drainage Department",
  sewage:         "Stormwater Drainage Department",
  water_leak:     "Bangalore Water Supply Board",
  streetlight:    "BESCOM Electrical Services",
  garbage:        "BBMP / Bruhat Mahanagara Palike",
  accident:       "City Police",
  safety_issue:   "City Police",
  noise:          "City Police",
  other:          "BBMP / Bruhat Mahanagara Palike"
};
```

---

### 5.7 Notification Routes (`/api/v1/notifications`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/send` | JWT | admin | Send alert to user(s) |
| `GET` | `/history` | JWT | all | Get my notification history |
| `PUT` | `/:id/read` | JWT | all | Mark notification as read |
| `GET` | `/unread-count` | JWT | all | Count of unread notifications |
| `POST` | `/broadcast` | JWT | admin | Broadcast to zone/all citizens |

**POST `/send` Request Body:**
```json
{
  "recipientId": "userId or list",
  "incidentId": "...",
  "channel": "email",
  "subject": "Incident Update: Pothole on MG Road",
  "message": "Your reported issue has been assigned to Public Works Department. Expected resolution within 24 hours."
}
```

---

### 5.8 Report Routes (`/api/v1/reports`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/generate` | JWT | admin, official | Generate filtered report |
| `GET` | `/active-incidents` | JWT | admin, official | Active incidents report |
| `GET` | `/incident-type-distribution` | JWT | admin, official | Type frequency report |
| `GET` | `/severity-priority` | JWT | admin | Critical incidents report |
| `GET` | `/dept-workload` | JWT | admin | Department load report |
| `GET` | `/response-time` | JWT | admin | TTA/TTR analysis |
| `GET` | `/hotspot` | JWT | admin | Geographic hotspot report |
| `GET` | `/trend-pattern` | JWT | admin | Historical trends |
| `GET` | `/predictive-risk` | JWT | admin | AI risk forecast summary |
| `GET` | `/complaint-status` | JWT | citizen | My complaints status |
| `GET` | `/audit-resolution` | JWT | admin | Full audit log export |

**POST `/generate` Request Body:**
```json
{
  "reportType": "dept-workload",
  "filters": {
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-31",
    "zone": "Central",
    "type": "all",
    "deptId": null
  },
  "exportFormat": "pdf"
}
```

---

### 5.9 Feedback Routes (`/api/v1/feedback`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/` | JWT | citizen | Submit post-resolution feedback |
| `GET` | `/incident/:id` | JWT | admin, official | Get feedback for incident |
| `GET` | `/summary` | JWT | admin | Aggregate feedback analytics |

---

### 5.10 SOS Routes (`/api/v1/sos`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/` | JWT | citizen | Submit emergency SOS (immediate escalation) |
| `GET` | `/active` | JWT | admin | View all active SOS alerts |

**POST `/` Request Body:**
```json
{
  "emergencyType": "accident",
  "description": "Multi-vehicle crash on Outer Ring Road near Marathahalli",
  "location": {
    "lat": 12.9591,
    "lng": 77.6974,
    "address": "Outer Ring Road, Near Marathahalli Bridge"
  }
}
```
**SOS triggers:** Immediate creation of `critical` severity incident + instant multi-channel alert to City Police and admins.

---

## 6. FRONTEND – PAGES & COMPONENTS

### 6.1 Routing Structure (`client/src/routes/`)

```jsx
// App.jsx route structure
<Routes>
  {/* Public */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Citizen - requires role: citizen */}
  <Route path="/citizen" element={<ProtectedRoute role="citizen" />}>
    <Route index element={<CitizenDashboard />} />
    <Route path="report" element={<ReportIncident />} />
    <Route path="track" element={<TrackComplaint />} />
    <Route path="sos" element={<SOSPage />} />
    <Route path="feedback/:incidentId" element={<FeedbackPage />} />
  </Route>

  {/* Official / Field Officer */}
  <Route path="/official" element={<ProtectedRoute role="government_official|field_officer" />}>
    <Route index element={<CommandCenter />} />
    <Route path="incidents" element={<IncidentManagement />} />
    <Route path="incidents/:id" element={<IncidentDetail />} />
    <Route path="departments" element={<DepartmentView />} />
    <Route path="reports" element={<ReportsPage />} />
  </Route>

  {/* Admin - full access */}
  <Route path="/admin" element={<ProtectedRoute role="admin" />}>
    <Route index element={<AdminDashboard />} />
    <Route path="verify" element={<VerifyIncidents />} />
    <Route path="assign/:id" element={<AssignIncident />} />
    <Route path="alerts" element={<AlertConfig />} />
    <Route path="hotspots" element={<HotspotAnalysis />} />
    <Route path="predictive" element={<PredictiveConfig />} />
    <Route path="reports" element={<ReportsPage />} />
  </Route>
</Routes>
```

### 6.2 Key Pages

#### CitizenDashboard
- Shows: Total Reports, In-Progress count, Resolved count
- Recent reports list with status badges
- Quick "Report Incident" button
- Notification bell with unread count

#### CommandCenter (Officials)
- Interactive Leaflet.js map with incident pins (color by severity)
- Filter bar: All Status / All Severity / All Types
- KPI header: Total Incidents | Critical Active | Pending Action
- Map / List toggle view
- Sidebar: Critical incidents feed

#### AdminDashboard
- KPI Cards row: Total Incidents, Active, Resolved Today, Critical Active
- Charts row: Incidents by Type (bar) | Severity Distribution (donut)
- Charts row: Status Distribution (bar) | Critical Incidents list
- Department workload panel

#### AnalyticsDashboard
```
┌─────────────────────────────────────────────────────────┐
│  Analytics Dashboard  │  City-wide incident analysis    │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│    16    │    13    │    0     │    4     │    ...     │
│  Total   │  Active  │ Resolved │ Critical │            │
│Incidents │Incidents │  Today   │  Active  │            │
├──────────┴──────────┴──────────┴──────────┴────────────┤
│ Incidents by Type (bar)  │  Severity Distribution(donut)│
│  Streetlight ████████    │        Medium: 5             │
│  Public Safety ██████    │  High: 6       Low: 1        │
│  Traffic ████            │       Critical: 4            │
├──────────────────────────┴──────────────────────────────┤
│ Status Distribution (bar)│  Critical Incidents feed     │
│ Acknowledged ████        │  Open manhole - Acknowledged │
│ In progress ████         │  Sewage overflow - Reported  │
│ Reported ██████          │  Waterlogging - In Progress  │
│ Resolved ████            │                              │
└──────────────────────────┴──────────────────────────────┘
```

### 6.3 Map Component (`components/map/MapView.jsx`)
```jsx
// Dependencies: react-leaflet, leaflet, leaflet.heat
// Map tiles: OpenStreetMap (free) or Google Maps API

const SEVERITY_COLORS = {
  critical: '#FF0000',  // Red
  high:     '#FF8C00',  // Orange
  medium:   '#FFD700',  // Yellow
  low:      '#32CD32'   // Green
};

// Features:
// - Incident pins with severity color
// - Click pin → incident detail popup
// - Heatmap layer toggle for hotspot view
// - Zone boundaries overlay (GeoJSON)
// - Filter by severity / type
// - Cluster pins at zoom-out
```

---

## 7. FORMS SPECIFICATION

### Form 1: Incident Reporting Form
**Page:** `/citizen/report`  
**Type:** Transaction (citizen only)

```
Fields:
├── Incident Type [required] - Grid of icon buttons:
│   Pothole | Traffic Issue | Flooding | Street Light | Garbage
│   Accident | Water Leak | Road Damage | Safety Issue | Noise
│   Illegal Parking | Sewage | Other
├── Title [required] - Text input, max 100 chars
├── Description [required] - Textarea, max 1000 chars
├── Location [required]
│   ├── [Use Current Location] button → navigator.geolocation
│   ├── Address - Text input
│   ├── Area / Locality - Text input
│   └── Coordinates display (lat, lng) - auto-filled
└── Media Upload - Multiple image/video, max 5 files, 10MB each

Validation:
- Type: required
- Title: required, min 10 chars
- Location lat/lng: required (must be set via GPS or manual entry)

On Submit:
- POST /api/v1/incidents
- Trigger AI classification (async, background)
- Trigger department routing
- Send confirmation notification to citizen
```

### Form 2: Citizen Registration Form
**Page:** `/register`  
**Type:** Master

```
Fields:
├── Full Name [required] - Text input
├── Email Address [required] - Email input, unique validation
├── Phone Number - Text input, 10 digits
├── Password [required] - min 8 chars, strength meter
├── Confirm Password [required]
├── Role [required] - Select: Citizen / Government Official
└── Zone - Select dropdown (city zones list)

On Submit:
- POST /api/v1/auth/register
- Redirect to login on success
```

### Form 3: Complaint Status Tracking Form
**Page:** `/citizen/track`  
**Type:** Transaction (citizen)

```
Fields:
└── Complaint ID or Phone Number - Text input (lookup)

Display (read-only) after lookup:
├── Incident Title & Type badge
├── Current Status - colored badge
├── Assigned Department
├── Field Officer Name (if assigned)
├── Submitted Date / Last Updated
├── Resolution ETA
└── Timeline: [ Reported → Acknowledged → Assigned → In Progress → Resolved ]
```

### Form 4: Incident Verification Form
**Page:** `/admin/verify`  
**Type:** Transaction (admin only)

```
Fields (per incident card):
├── Verification Status [required] - Radio: Valid | False Report | Duplicate
├── Severity Override - Select: Critical | High | Medium | Low (optional)
└── Admin Notes - Textarea

On Submit:
- PUT /api/v1/incidents/:id/verify
- If valid: triggers AI classification + department routing
- If false/duplicate: incident marked rejected, citizen notified
```

### Form 5: Incident Assignment Form
**Page:** `/admin/assign/:id`  
**Type:** Transaction (admin)

```
Fields:
├── Target Department [required] - Select from departments list
├── Field Officer - Select from dept officers (filtered by deptId)
├── Priority Level [required] - Select: Critical | High | Medium | Low
├── SLA Deadline [required] - Date-time picker (auto-suggest: now + deptSLAHours)
└── Assignment Notes - Textarea

On Submit:
- PUT /api/v1/incidents/:id/assign
- Triggers alert to assigned department and officer (email + WhatsApp/SMS)
```

### Form 6: Resolution Update Form
**Page:** Officer view of incident detail  
**Type:** Master (field_officer)

```
Fields:
├── Action Taken [required] - Textarea (what was done)
├── Resolution Status [required] - Select: Resolved | Partial | Cannot Resolve
├── Proof Upload [required for Resolved] - Image/video, max 5 files
└── Officer Notes - Textarea

On Submit:
- PUT /api/v1/incidents/:id/resolve
- Incident status → resolved
- Triggers notification to reporting citizen
- Creates resolution_log entry
```

### Form 7: Department Workload Form
**Page:** `/admin` or `/official/departments`  
**Type:** Transaction (admin)

```
Display (read-only):
├── Department Name
├── Current Load (active incidents)
├── Officer Count / Available Officers
├── Avg Response Time (TTR)
└── SLA Breach Count

Actions:
├── Reassign Incident - modal with incident list
└── Add/Remove Officer - quick action buttons
```

### Form 8: Report Generation Form
**Page:** `/admin/reports` and `/official/reports`  
**Type:** Transaction (admin, official)

```
Fields:
├── Report Type [required] - Select:
│   Active Incidents | Type Distribution | Severity & Priority |
│   Department Workload | Response Time | Hotspot | Trend & Pattern |
│   Predictive Risk | Complaint Status | Audit & Resolution
├── Date Range - Date range picker (From / To)
├── Zone Filter - Select: All Zones | [zone list]
├── Incident Type Filter - Select: All | [type list]
├── Department Filter - Select: All | [dept list]
└── Export Format - Select: View on Screen | PDF | CSV

On Submit:
- POST /api/v1/reports/generate
- Render table/chart or trigger file download
```

### Form 9: Hotspot Analysis Form
**Page:** `/admin/hotspots`  
**Type:** Transaction (admin)

```
Fields:
├── City Zone - Select: All | [zone list]
├── Incident Type Filter - Select: All | [type list]
├── Time Window - Select: Last 7 days | 30 days | 90 days | Custom
└── Cluster Radius (km) - Number slider (0.5 – 5)

On Submit:
- GET /api/v1/predictive/hotspots?zone=...&type=...&window=...
- Renders heatmap overlay on Leaflet map
```

### Form 10: Predictive Risk Configuration Form
**Page:** `/admin/predictive`  
**Type:** Master (admin)

```
Fields:
├── Zone Selection [required] - Multi-select zones
├── Incident Type - Select: All | specific type
├── Time Horizon [required] - Select: 7 days | 14 days | 30 days | 90 days
├── Risk Alert Threshold - Slider 0–100 (trigger alerts above this score)
└── Model Selection - Select: Default LSTM | Seasonal | Weather-Correlated

On Submit:
- POST /api/v1/predictive/forecast
- Displays risk score cards per zone with recommendations
```

### Form 11: Alert Configuration Form
**Page:** `/admin/alerts`  
**Type:** Transaction (admin)

```
Fields:
├── Trigger Condition [required] - Select:
│   New Critical Incident | SLA Breach | High Volume Spike |
│   New High-Priority Incident | Incident Status Change
├── Severity Threshold - Select: Any | High & Above | Critical Only
├── Target Recipients [required] - Multi-select:
│   All Admins | Dept Officials | Field Officers | Nearby Citizens
├── Alert Channels [required] - Checkboxes: Email | SMS | WhatsApp | In-App Push
├── Zone Filter - Select: All | specific zone
└── Active - Toggle

On Submit:
- POST/PUT /api/v1/notifications/config (alert rule storage)
```

### Form 12: Feedback & Rating Form
**Page:** `/citizen/feedback/:incidentId`  
**Type:** Transaction (citizen)

```
Fields:
├── Overall Rating [required] - 1–5 star picker
├── Response Time Satisfaction - 1–5 star picker
├── Resolution Quality - 1–5 star picker
├── Ease of Use - 1–5 star picker
└── Comments - Textarea, max 500 chars

On Submit:
- POST /api/v1/feedback
- Accessible only after incident.status === 'resolved'
```

---

## 8. AI LAYER

### 8.1 LLM Classification Service (`server/services/ai.service.js`)

```js
// Called after each incident is submitted (async background job)
async function classifyIncident(incident) {
  const prompt = `
You are a smart city incident classification AI.

Incident Details:
- Type: ${incident.type}
- Title: ${incident.title}
- Description: ${incident.description}
- Location: ${incident.location.area}, ${incident.location.zone}

Please analyze and return ONLY a JSON object with these fields:
{
  "nlpCategory": string,           // detailed sub-category
  "priorityTag": "critical|high|medium|low",
  "priorityScore": number (0-100), // higher = more urgent
  "aiSummary": string,             // 2-3 sentence plain English summary with recommended action
  "suggestedDepartment": string,   // exact department name
  "classificationConfidence": number (0.0-1.0),
  "sentimentScore": number (-1.0 to 1.0)
}
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
    })
  });

  const data = await response.json();
  const raw = data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
  return parsed;
}
```

### 8.2 Predictive Risk Model (`server/services/predictive.service.js`)

```js
// Options:
// Option A: Call Python AI microservice via HTTP
// Option B: AWS Lambda with trained model
// Option C: Simple statistical model in Node.js for MVP

// MVP Statistical Approach:
async function generateForecast(zone, incidentType, timeHorizonDays) {
  // 1. Fetch historical data for zone + type
  const historicalData = await Incident.aggregate([
    { $match: { 'location.zone': zone, type: incidentType !== 'all' ? incidentType : { $exists: true } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // 2. Calculate trend + seasonality
  const avgDaily = historicalData.reduce((s, d) => s + d.count, 0) / historicalData.length;
  const recentTrend = /* last 7 days avg vs overall avg */ ...;
  const riskScore = Math.min(100, Math.round(avgDaily * 10 * recentTrend));

  return {
    zone, incidentType, riskScore,
    riskLevel: riskScore > 75 ? 'very_high' : riskScore > 50 ? 'high' : riskScore > 25 ? 'moderate' : 'low',
    recommendations: generateRecommendations(riskScore, incidentType),
    forecastDate: new Date(Date.now() + timeHorizonDays * 86400000)
  };
}
```

### 8.3 Background Job Queue (SLA + Auto-classify)

```js
// Use node-cron or bull queue
// Every 5 minutes: check for SLA breaches
cron.schedule('*/5 * * * *', async () => {
  const breached = await Assignment.find({
    status: { $in: ['pending', 'acknowledged', 'in_progress'] },
    slaDueBy: { $lt: new Date() }
  });
  for (const a of breached) {
    a.escalationCount += 1;
    a.status = 'escalated';
    await a.save();
    // notify admin + increment incident severity if needed
    await notificationService.sendAlert(a.incidentId, 'SLA_BREACH');
  }
});

// Auto-classify new incidents: run after POST /incidents
async function postIncidentCreation(incidentId) {
  const incident = await Incident.findById(incidentId);
  const classification = await aiService.classifyIncident(incident);
  await IncidentIntelligence.create({ incidentId, ...classification });
  // update incident severity from AI result
  await Incident.findByIdAndUpdate(incidentId, {
    severity: classification.priorityTag,
    aiProcessed: true
  });
  // auto-route
  const dept = await Department.findOne({ name: classification.suggestedDepartment });
  if (dept) await routingService.createAssignment(incidentId, dept._id);
}
```

---

## 9. NOTIFICATION SYSTEM

### 9.1 Channels & Triggers

```js
// server/services/notification.service.js

const NOTIFICATION_TRIGGERS = {
  INCIDENT_SUBMITTED:    ['email'],            // to citizen
  INCIDENT_VERIFIED:     ['email'],            // to citizen
  INCIDENT_ASSIGNED:     ['email', 'sms'],     // to dept + officer
  INCIDENT_ACKNOWLEDGED: ['email', 'in_app'],  // to citizen
  INCIDENT_RESOLVED:     ['email', 'whatsapp'],// to citizen
  SLA_BREACH:            ['email', 'sms'],     // to admin + dept head
  CRITICAL_INCIDENT:     ['email', 'sms', 'whatsapp'], // to admins
  SOS_SUBMITTED:         ['sms', 'email'],     // to admin + city police
  NEARBY_ALERT:          ['in_app', 'email']   // to citizens in zone
};
```

### 9.2 Email (Nodemailer)
```js
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // e.g. smtp.gmail.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### 9.3 SMS (Twilio)
```js
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
await client.messages.create({
  body: message,
  from: process.env.TWILIO_PHONE,
  to: recipient.phone
});
```

### 9.4 WhatsApp (Twilio WhatsApp / Meta Cloud API)
```js
await client.messages.create({
  body: message,
  from: 'whatsapp:+14155238886',   // Twilio sandbox or approved number
  to: `whatsapp:${recipient.phone}`
});
```

---

## 10. AUTHENTICATION & RBAC

### 10.1 JWT Middleware
```js
// server/middleware/auth.middleware.js
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 10.2 RBAC Middleware
```js
// server/middleware/rbac.middleware.js
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Usage in routes:
router.put('/:id/verify', authenticate, authorize('admin'), verifyIncident);
router.post('/', authenticate, authorize('citizen'), submitIncident);
```

### 10.3 Route Protection Matrix

| Resource | citizen | field_officer | government_official | admin |
|----------|---------|--------------|---------------------|-------|
| Submit incident | ✅ | ✅ | ❌ | ✅ |
| View own incidents | ✅ | — | — | ✅ |
| View all incidents | ❌ | own zone | all | all |
| Verify incident | ❌ | ❌ | ❌ | ✅ |
| Assign incident | ❌ | ❌ | ❌ | ✅ |
| Update resolution | ❌ | ✅ | ❌ | ✅ |
| View dashboard | ❌ | limited | ✅ | ✅ |
| View analytics | ❌ | ❌ | ✅ | ✅ |
| Generate reports | ❌ | ❌ | ✅ | ✅ |
| Configure alerts | ❌ | ❌ | ❌ | ✅ |
| Submit feedback | ✅ | ❌ | ❌ | ❌ |
| Submit SOS | ✅ | ✅ | ❌ | ✅ |

---

## 11. DEVOPS & DEPLOYMENT

### 11.1 GitHub Actions CI/CD (`.github/workflows/ci-cd.yml`)
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: cd server && npm ci
      - run: cd server && npm test
      - run: cd server && npm run lint

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: cd client && npm ci
      - run: cd client && npm run build
      - run: cd client && npm test

  deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Backend to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### 11.2 Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'
services:
  client:
    build: ./client
    ports: ['3000:3000']
    environment:
      - VITE_API_URL=http://localhost:5000

  server:
    build: ./server
    ports: ['5000:5000']
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on: [mongo]

  mongo:
    image: mongo:7
    ports: ['27017:27017']
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 11.3 Deployment Targets

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel (free tier) | Auto-deploys from GitHub main branch |
| Backend | Render / Railway (free tier) | Node.js with auto-scaling |
| Database | MongoDB Atlas (M0 free) | Enable IP whitelist for backend |
| AI Classification | Google Gemini API (free quota) | Via direct API call from backend |
| File Storage | Cloudinary (free tier) or AWS S3 | Incident photos, proof uploads |
| Notifications | Nodemailer (Gmail SMTP) + Twilio (trial) | Email + SMS |

---

## 12. MODULE-TO-DEVELOPER ASSIGNMENT

### Balaji Arunachalam (CB.SC.U4CSE23759) — Data Ingestion Layer

**Build:** Module 1 (Multi-Source Data Collection) + Module 2 (Data Preprocessing & Normalization)

| Item | Specifics |
|------|-----------|
| Models | `User.js`, `Incident.js` |
| Routes | `auth.routes.js`, `incident.routes.js` (POST + GET) |
| Services | Data ingestion pipeline, input validation, PII anonymization |
| Forms | Incident Reporting Form, Citizen Registration Form |
| Pages | `Register.jsx`, `CitizenDashboard.jsx`, `ReportIncident.jsx` |
| API | Traffic Data Integration API, Citizen Registration API |
| Report | Incident Type Distribution Report |
| Testing | Data ingestion pipeline: verify multi-source collection and storage |
| Reference | FixMyStreet — civic issue routing and map-based submission UX |

### Danvanth (CB.SC.U4CSE23241) — AI Intelligence Layer

**Build:** Module 3 (AI Incident Intelligence) + Module 4 (Predictive Analytics & Risk Forecasting)

| Item | Specifics |
|------|-----------|
| Models | `IncidentIntelligence.js`, `RiskForecast.js` |
| Routes | `ai.routes.js`, predictive portion of `analytics.routes.js` |
| Services | `ai.service.js` (LLM calls), `predictive.service.js` (forecast), `geospatial.service.js` |
| Forms | Incident Verification Form, Hotspot Analysis Form, Predictive Risk Configuration Form |
| Pages | `VerifyIncidents.jsx`, `HotspotAnalysis.jsx`, `PredictiveConfig.jsx` |
| API | LLM/Gemma Integration API, Hotspot Analytics API, Predictive Forecast API |
| Reports | Severity & Priority Report, Incident Hotspot Report, Trend & Pattern Analysis, Predictive Risk Forecast |
| Visualization | Map Incident Heatmap (`HeatmapLayer.jsx`), Future Hotspot Prediction Map |
| Reference | Quantela — AI-based urban analytics and priority scoring |

### Amal Godwin (CB.SC.U4CSE23407) — Operational Layer

**Build:** Module 5 (Automated Routing & Alert) + Module 6 (Unified Command Dashboard)

| Item | Specifics |
|------|-----------|
| Models | `Department.js`, `Assignment.js`, `AnalyticsAggregate.js` |
| Routes | `department.routes.js`, `notification.routes.js`, `report.routes.js`, `analytics.routes.js` |
| Services | `routing.service.js` (rule-based dept assignment), `notification.service.js`, `analytics.service.js` |
| Forms | Incident Assignment Form, Department Workload Form, Report Generation Form, Alert Configuration Form |
| Pages | `CommandCenter.jsx`, `IncidentManagement.jsx`, `DepartmentView.jsx`, `ReportsPage.jsx`, `AdminDashboard.jsx` |
| API | Notification/WhatsApp API, Dept Routing API, Report Generation API, Dashboard Analytics API |
| Reports | Active Incidents Report, Department Workload Report |
| Testing | Notification Delivery Testing — email, SMS, WhatsApp delivery confirmation |
| Reference | Namma Kovai — citizen-govt coordination and transparent tracking |

### Prithiv A (CB.SC.U4CSE23260) — Governance Layer

**Build:** Module 7 (Resolution Tracking & Audit) + Module 8 (User Interaction & Notification)

| Item | Specifics |
|------|-----------|
| Models | `ResolutionLog.js`, `Notification.js`, `Feedback.js` |
| Routes | `feedback.routes.js`, `sos.routes.js`, resolution portion of `incident.routes.js` |
| Services | Resolution lifecycle management, SLA cron job, audit log generation |
| Forms | Complaint Status Tracking Form, Resolution Update Form, Feedback & Rating Form, Predictive Risk Config Form, Alert Config Form |
| Pages | `TrackComplaint.jsx`, `FeedbackPage.jsx`, `SOSPage.jsx`, profile pages |
| API | Resolution Update API, Feedback API, SOS API, Google Cloud/Deep Learning integration |
| Reports | Response Time Analysis Report, Citizen Complaint Status Report, Audit & Resolution Report |
| Visualization | Future Hotspot Prediction Map overlay, Risk Zone layer |
| Testing | Prediction Accuracy Testing — validate AI forecasts against ground truth |
| Reference | SafeGraph — geospatial urban data and location-based analysis |

---

## 13. ENVIRONMENT VARIABLES

### Server (`.env`)
```bash
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smartcity

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# AI - Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer / Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=smartcity@yourplatform.com

# SMS / WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Client (`.env`)
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_maps_key_optional
VITE_APP_NAME=Smart City Command Platform
```

---

## 14. BUILD ORDER & IMPLEMENTATION CHECKLIST

### Phase 1 — Foundation (Week 1–2)
```
Backend:
  [ ] Initialize Node.js + Express project with folder structure
  [ ] Connect MongoDB Atlas, set up Mongoose
  [ ] Create all 10 Mongoose models/schemas
  [ ] Implement auth routes: register, login, JWT middleware
  [ ] RBAC middleware setup

Frontend:
  [ ] Initialize React + Vite project
  [ ] Set up Tailwind CSS
  [ ] Create Auth context
  [ ] Build Login and Register pages with forms
  [ ] Axios service base with JWT interceptor
  [ ] Protected route wrapper with role check
```

### Phase 2 — Core Incident Module (Week 2–3)
```
Backend:
  [ ] POST /incidents — full submission with file upload
  [ ] GET /incidents — with full filter support + pagination
  [ ] GET /incidents/:id
  [ ] PUT /incidents/:id/verify
  [ ] PUT /incidents/:id/assign
  [ ] PUT /incidents/:id/resolve
  [ ] Incident status lifecycle enforcement

Frontend:
  [ ] Incident Reporting Form (Form 1) — all 12 types, GPS location
  [ ] Citizen Dashboard with recent reports list
  [ ] Incident Detail page
  [ ] Status tracking page (Form 3)
```

### Phase 3 — AI Layer (Week 3–4)
```
Backend:
  [ ] ai.service.js — Gemini API integration for classification
  [ ] POST /ai/classify/:id
  [ ] IncidentIntelligence model storage
  [ ] Auto-classification trigger post incident submission (async)
  [ ] routing.service.js — rule-based dept routing
  [ ] Assignment creation on classification complete

Frontend:
  [ ] Incident Verification Form (Form 4) — admin view
  [ ] AI summary display in incident detail card
  [ ] Priority badge display (Critical/High/Medium/Low)
```

### Phase 4 — Dashboard & Analytics (Week 4–5)
```
Backend:
  [ ] GET /analytics/dashboard — KPI aggregation
  [ ] GET /analytics/incidents-by-type
  [ ] GET /analytics/severity-distribution
  [ ] GET /analytics/status-distribution
  [ ] GET /analytics/dept-performance
  [ ] GET /analytics/critical-feed

Frontend:
  [ ] MapView component with Leaflet.js and incident pins
  [ ] Command Center dashboard layout
  [ ] KPI cards with live data
  [ ] Charts: bar chart (recharts), donut chart (recharts)
  [ ] Critical incidents feed sidebar
  [ ] Map filter controls
```

### Phase 5 — Notifications & Governance (Week 5–6)
```
Backend:
  [ ] notification.service.js — email (Nodemailer)
  [ ] notification.service.js — SMS (Twilio, optional)
  [ ] Notification triggers on all status changes
  [ ] resolution_log creation on each update
  [ ] SLA cron job (node-cron, every 5 mins)
  [ ] POST /feedback
  [ ] POST /sos

Frontend:
  [ ] Resolution Update Form (Form 6)
  [ ] Feedback & Rating Form (Form 12)
  [ ] SOS page (Form SOS)
  [ ] Notification bell + history dropdown
  [ ] Alert Configuration Form (Form 11)
```

### Phase 6 — Predictive & Reports (Week 6–7)
```
Backend:
  [ ] predictive.service.js — MVP statistical forecast
  [ ] POST /predictive/forecast
  [ ] GET /predictive/hotspots
  [ ] GET /predictive/trends
  [ ] All 11 report endpoints
  [ ] PDF/CSV export (use pdfmake or json2csv)

Frontend:
  [ ] Hotspot Analysis page with heatmap (leaflet.heat)
  [ ] Predictive Risk Configuration Form (Form 10)
  [ ] Report Generation Form (Form 8) + render results
  [ ] Department Workload Form (Form 7)
  [ ] Trend charts
```

### Phase 7 — Polish & Deployment (Week 7–8)
```
  [ ] Input validation (Joi or Zod) on all routes
  [ ] Rate limiting (express-rate-limit)
  [ ] Helmet.js security headers
  [ ] CORS configuration
  [ ] Error handling middleware (global)
  [ ] Docker Compose setup
  [ ] GitHub Actions CI/CD pipeline
  [ ] Deploy: Vercel (frontend) + Render (backend) + MongoDB Atlas
  [ ] Cloudinary file upload integration
  [ ] End-to-end testing of full incident workflow
```

---

## QUICK REFERENCE: INCIDENT TYPES → DEPARTMENTS

| Incident Type | Routed To |
|--------------|-----------|
| `pothole`, `road_damage` | Public Works Department |
| `traffic`, `illegal_parking` | Traffic Management Centre |
| `flooding`, `sewage` | Stormwater Drainage Department |
| `water_leak` | Bangalore Water Supply Board |
| `streetlight` | BESCOM Electrical Services |
| `garbage` | BBMP / Bruhat Mahanagara Palike |
| `accident`, `safety_issue`, `noise` | City Police |
| `other` | BBMP / Bruhat Mahanagara Palike |

## QUICK REFERENCE: STATUS COLORS (Frontend)

| Status | Color | Badge Class |
|--------|-------|-------------|
| `reported` | Orange | `bg-orange-100 text-orange-800` |
| `acknowledged` | Blue | `bg-blue-100 text-blue-800` |
| `assigned` | Purple | `bg-purple-100 text-purple-800` |
| `in_progress` | Teal | `bg-teal-100 text-teal-800` |
| `resolved` | Green | `bg-green-100 text-green-800` |
| `closed` | Gray | `bg-gray-100 text-gray-800` |
| `rejected` | Red | `bg-red-100 text-red-800` |

## QUICK REFERENCE: SEVERITY COLORS (Map Pins)

| Severity | Hex Color | Tailwind |
|----------|-----------|----------|
| `critical` | `#DC2626` | `text-red-600` |
| `high` | `#EA580C` | `text-orange-600` |
| `medium` | `#D97706` | `text-amber-600` |
| `low` | `#16A34A` | `text-green-600` |

---

*End of Build Specification — Smart City Command & Intelligence Platform*  
*Team 12 | 23CSE461 Full Stack Frameworks | Amrita Vishwa Vidyapeetham*