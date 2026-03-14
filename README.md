# Smart City Command & Intelligence Platform

An AI-powered full-stack platform for real-time urban incident monitoring, classification, and management. Built for **23CSE461 - Full Stack Frameworks** by Team 12.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![Node](https://img.shields.io/badge/Node.js-18+-339933)
![React](https://img.shields.io/badge/React-19-61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248)
![License](https://img.shields.io/badge/License-MIT-blue)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
- [Test Accounts](#test-accounts)
- [API Reference](#api-reference)
- [User Roles & Permissions](#user-roles--permissions)
- [AI Classification System](#ai-classification-system)
- [SLA & Escalation Engine](#sla--escalation-engine)
- [Frontend Pages](#frontend-pages)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Team](#team)
- [License](#license)

## Overview

The Smart City Command & Intelligence Platform is a comprehensive urban management system that enables citizens to report city infrastructure issues (potholes, flooding, streetlight failures, garbage, etc.) and government departments to efficiently triage, assign, and resolve them.

The platform leverages AI-powered classification (Google Gemini API with rule-based fallback) to automatically categorize incidents, determine severity, and route them to the appropriate department. Real-time analytics, interactive maps, and SLA tracking ensure transparent and accountable governance.

## Features

### Citizen Features
- **Incident Reporting** — Multi-step form with type selection, description, map-based location picker, severity indicator, and media upload (photos/videos)
- **Real-Time Tracking** — Track reported incidents through the full lifecycle (reported -> acknowledged -> assigned -> in_progress -> resolved -> closed)
- **Emergency SOS** — One-tap emergency alert with automatic geolocation detection
- **Feedback System** — Multi-dimensional satisfaction ratings after incident resolution
- **Department Contact** — Direct messaging to government departments with priority and callback options

### Officer & Official Features
- **Command Center** — Real-time operational dashboard with incident list, map view, and bulk actions
- **Incident Verification** — Verify or reject reported incidents, override severity levels
- **Incident Assignment** — Assign incidents to departments and officers with SLA deadline configuration
- **Resolution Workflow** — Submit resolution details with proof uploads, action descriptions, and time tracking

### Admin Features
- **Analytics Dashboard** — Recharts-powered visualizations: trends, type/severity distributions, department performance, response times
- **Department Management** — CRUD operations for departments, officer assignments, workload monitoring
- **Audit Reports** — Comprehensive audit data with SLA compliance metrics and downloadable reports
- **Predictive Analytics** — Risk forecasting by zone, hotspot identification, and trend analysis

### Platform-Wide
- **AI Classification** — Dual-strategy system: Google Gemini API (primary) with rule-based NLP fallback
- **Auto-Routing** — Incidents automatically assigned to the appropriate department based on type
- **SLA Engine** — Cron-based SLA breach detection with automatic escalation and admin notifications
- **Role-Based Access** — Four roles (citizen, field_officer, government_official, admin) with granular permissions
- **Interactive Maps** — Leaflet.js with dark theme, severity-coded markers, and heatmap layer

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React (JSX, Hooks) | 19.2 |
| **Build Tool** | Vite | 7.2 |
| **Styling** | Tailwind CSS + Custom CSS | 4.2 |
| **Routing** | React Router DOM | 7.13 |
| **State Management** | React Context API | - |
| **Data Fetching** | Axios + TanStack React Query | 1.13 / 5.90 |
| **Maps** | Leaflet + React-Leaflet + leaflet.heat | 1.9 / 5.0 |
| **Charts** | Recharts | 3.7 |
| **Icons** | Lucide React | 0.563 |
| **Backend** | Node.js + Express | 4.18 |
| **Database** | MongoDB via Mongoose | 8.0 |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | 9.0 |
| **AI/ML** | Google Gemini API + Rule-based NLP | - |
| **File Upload** | Multer + Cloudinary | 2.1 / 2.9 |
| **Email** | Nodemailer | 8.0 |
| **Scheduling** | node-cron | 4.2 |
| **Security** | Helmet, CORS, express-rate-limit, express-validator | - |
| **Logging** | Morgan | 1.10 |
| **Dev Tools** | Nodemon, ESLint, Concurrently | - |

## Architecture

```
                    +-------------------+
                    |   React Client    |
                    |  (Vite + Router)  |
                    +--------+----------+
                             |
                     Axios + JWT Token
                             |
                    +--------v----------+
                    |   Express API     |
                    |   /api/v1/...     |
                    +--------+----------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +----v--------+
     | Mongoose   |  | AI Service  |  | SLA Ticker  |
     | Models(11) |  | Gemini/NLP  |  | Cron (5min) |
     +--------+---+  +------+------+  +----+--------+
              |              |              |
              +--------------+--------------+
                             |
                    +--------v----------+
                    |     MongoDB       |
                    +-------------------+
```

**Data Flow:**
1. Citizen submits incident via React form
2. Express API validates input and creates Incident document
3. AI Service classifies the incident (Gemini or rule-based)
4. Routing Service auto-assigns to appropriate department
5. SLA Ticker monitors deadlines and escalates breaches
6. Officers resolve incidents and submit proof
7. Citizens provide feedback on resolution quality

## Project Structure

```
smart-city-command/
|-- client/                          # React Frontend (Vite)
|   |-- src/
|   |   |-- main.jsx                 # App entry point with providers
|   |   |-- App.jsx                  # Route configuration
|   |   |-- context/
|   |   |   |-- AuthContext.jsx      # Authentication state management
|   |   |-- components/
|   |   |   |-- Navbar.jsx           # Responsive sidebar navigation
|   |   |   |-- MapView.jsx          # Leaflet map with heatmap
|   |   |-- pages/
|   |   |   |-- Login.jsx            # User login
|   |   |   |-- Register.jsx         # User registration
|   |   |   |-- Dashboard.jsx        # Role-specific dashboard
|   |   |   |-- CommandCenter.jsx    # Incident management (officials)
|   |   |   |-- ReportIncident.jsx   # Incident reporting form
|   |   |   |-- IncidentDetails.jsx  # Single incident view
|   |   |   |-- Analytics.jsx        # Analytics charts
|   |   |   |-- Departments.jsx      # Department management
|   |   |   |-- EditProfile.jsx      # Profile editor
|   |   |   |-- FeedbackForm.jsx     # Resolution feedback
|   |   |   |-- FeedbackHub.jsx      # Feedback history
|   |   |   |-- EmergencySOS.jsx     # Emergency alerts
|   |   |   |-- ContactDepartment.jsx # Department messaging
|   |   |   |-- VerifyIncident.jsx   # Incident verification
|   |   |   |-- TrackComplaint.jsx   # Complaint tracking
|   |   |   |-- AssignIncident.jsx   # Assignment management
|   |   |   |-- ResolveIncident.jsx  # Resolution submission
|   |   |   |-- AuditReport.jsx      # Audit dashboard
|   |   |-- utils/
|   |       |-- api.js               # Axios client with interceptors
|   |-- vite.config.js               # Vite + React config
|   |-- package.json
|
|-- server/                          # Express Backend
|   |-- server.js                    # App entry point
|   |-- config/
|   |   |-- db.js                    # MongoDB connection
|   |-- middleware/
|   |   |-- authMiddleware.js        # JWT auth + role authorization
|   |   |-- errorHandler.js          # Centralized error handling
|   |   |-- rateLimit.js             # Rate limiting (configurable)
|   |   |-- upload.js                # Multer file upload config
|   |-- models/                      # 11 Mongoose schemas
|   |   |-- User.js                  # User (bcrypt, JWT, roles)
|   |   |-- Incident.js              # Core incident entity
|   |   |-- Department.js            # Government departments
|   |   |-- Assignment.js            # Incident-department links
|   |   |-- Feedback.js              # Citizen feedback
|   |   |-- Notification.js          # Multi-channel notifications
|   |   |-- ContactMessage.js        # Department contact messages
|   |   |-- AnalyticsAggregate.js    # Pre-computed analytics
|   |   |-- IncidentIntelligence.js  # AI classification results
|   |   |-- ResolutionLog.js         # Resolution tracking
|   |   |-- RiskForecast.js          # Predictive risk data
|   |-- routes/                      # 10 API route modules
|   |   |-- authRoutes.js            # Authentication endpoints
|   |   |-- incidentRoutes.js        # Incident CRUD + lifecycle
|   |   |-- analyticsRoutes.js       # Analytics & reporting
|   |   |-- departmentRoutes.js      # Department management
|   |   |-- ai.routes.js             # AI classification
|   |   |-- predictive.routes.js     # Predictive analytics
|   |   |-- notification.routes.js   # Notification system
|   |   |-- report.routes.js         # Report generation
|   |   |-- feedback.routes.js       # Feedback management
|   |   |-- sos.routes.js            # Emergency SOS
|   |-- services/
|   |   |-- aiService.js             # Gemini API + rule-based NLP
|   |   |-- routingService.js        # Auto-department assignment
|   |-- utils/
|   |   |-- slaTicker.js             # SLA breach cron job
|   |-- seeds/                       # Database seeders
|   |-- package.json
|
|-- .env.example                     # Environment template
|-- package.json                     # Root (concurrently)
|-- start.sh                         # Shell start script
```

## API Reference

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Create new user account | Public |
| POST | `/login` | Authenticate and get tokens | Public |
| POST | `/logout` | Invalidate session | Authenticated |
| POST | `/refresh` | Exchange refresh token | Public |
| GET | `/profile` | Get current user profile | Authenticated |
| GET | `/me` | Alias for /profile | Authenticated |
| PUT | `/profile` | Update user profile | Authenticated |
| POST | `/forgot-password` | Initiate password reset | Public |
| POST | `/reset-password` | Complete password reset | Public |

### Incidents (`/api/v1/incidents`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Report new incident | citizen, officer, admin |
| GET | `/` | List incidents (filtered) | Authenticated |
| GET | `/my` | Get user's own incidents | Authenticated |
| GET | `/nearby` | Find nearby incidents | Authenticated |
| GET | `/:id` | Get incident details | Authenticated |
| PUT | `/:id/verify` | Verify/reject incident | official, admin |
| PUT | `/:id/assign` | Assign to department | official, admin |
| PUT | `/:id/acknowledge` | Mark as in-progress | officer, official |
| PUT | `/:id/resolve` | Submit resolution | officer, admin |
| PUT | `/:id/close` | Close incident | admin |
| DELETE | `/:id` | Soft-delete incident | admin |

### Analytics (`/api/v1/analytics`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard-stats` | Overview statistics | official, admin |
| GET | `/incidents-by-type` | Type distribution | official, admin |
| GET | `/incidents-by-severity` | Severity distribution | official, admin |
| GET | `/incidents-by-status` | Status distribution | official, admin |
| GET | `/response-times` | Avg TTA & TTR metrics | official, admin |
| GET | `/department-performance` | Department stats | official, admin |

### Departments (`/api/v1/departments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all departments | Authenticated |
| GET | `/:id` | Get department details | Authenticated |
| POST | `/` | Create department | admin |
| PUT | `/:id` | Update department | admin |
| GET | `/:id/workload` | Department workload | official, admin |

### AI & Predictive (`/api/v1/ai`, `/api/v1/predictive`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/ai/classify` | Classify single incident | official, admin |
| GET | `/ai/classification/:id` | Get classification | Authenticated |
| POST | `/predictive/forecast/:zone` | Generate risk forecast | official, admin |
| GET | `/predictive/forecast/:zone` | Get zone forecast | Authenticated |
| GET | `/predictive/hotspots` | Geographic hotspots | official, admin |

### Other Endpoints

| Module | Base Path | Key Endpoints |
|--------|-----------|--------------|
| Notifications | `/api/v1/notifications` | Send, history, mark read, unread count |
| Reports | `/api/v1/reports` | Dynamic report generator, 11 report types |
| Feedback | `/api/v1/feedback` | Submit, view own, per-incident, analytics |
| Emergency SOS | `/api/v1/sos` | Submit SOS alert, view active alerts |

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** 6.0+ (local installation or MongoDB Atlas cloud)
- **npm** 9+ (comes with Node.js)
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/Prithiv-0/smart-city-command.git
cd smart-city-command

# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to root
cd ..
```

## Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Configure the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smart-city-command` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your-refresh-secret` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | - |
| `CLOUDINARY_URL` | Cloudinary connection (optional) | - |
| `NODE_ENV` | Environment mode | `development` |

## Database Seeding

Populate the database with sample data for testing:

```bash
cd server

# Full seed — creates users, departments, incidents, assignments,
# feedback, analytics aggregates, and resolution logs
npm run seed
```

This creates test accounts for all four roles with sample incidents across different types and statuses.

## Running the Application

```bash
# From project root — runs both servers concurrently
npm run dev

# Or run separately:
npm run server:dev    # Backend  → http://localhost:5000
npm run client        # Frontend → http://localhost:5173
```

The API health check is available at: `GET http://localhost:5000/api/health`

## Test Accounts

After seeding, the following accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartcity.gov.in` | `password123` |
| Government Official | `official@smartcity.gov.in` | `password123` |
| Field Officer | `ravi.officer@smartcity.gov.in` | `password123` |
| Citizen | `citizen@example.com` | `password123` |

## User Roles & Permissions

| Permission | Citizen | Field Officer | Official | Admin |
|-----------|---------|---------------|----------|-------|
| Report incidents | Yes | Yes | No | Yes |
| View own incidents | Yes | Yes | Yes | Yes |
| View all incidents | No | Yes | Yes | Yes |
| Command Center | No | Yes | Yes | Yes |
| Verify incidents | No | No | Yes | Yes |
| Assign incidents | No | No | Yes | Yes |
| Acknowledge incidents | No | Yes | Yes | Yes |
| Resolve incidents | No | Yes | No | Yes |
| Close incidents | No | No | No | Yes |
| View analytics | No | No | Yes | Yes |
| Manage departments | No | No | No | Yes |
| Audit reports | No | No | No | Yes |
| Submit feedback | Yes | No | No | No |
| Emergency SOS | Yes | Yes | Yes | Yes |

## AI Classification System

The platform uses a dual-strategy AI classification pipeline:

### Primary: Google Gemini API
When a `GEMINI_API_KEY` is configured, incidents are sent to Google's Gemini Pro model for:
- **NLP Category** detection
- **Priority scoring** (0-100 scale)
- **Severity tag** (critical/high/medium/low)
- **Sentiment analysis** (-1.0 to 1.0)
- **Department suggestion**
- **Classification confidence** (0.0-1.0)

### Fallback: Rule-Based NLP
When the API is unavailable, a keyword-matching engine:
1. Scans incident title and description against keyword dictionaries
2. Matches against 12 incident type categories
3. Determines severity from urgency keywords
4. Routes to the appropriate department via ROUTING_RULES map
5. Calculates confidence based on keyword match count

### Department Routing Rules

| Incident Type | Department |
|--------------|------------|
| Pothole, Road Damage | Public Works Department (PWD) |
| Traffic, Illegal Parking | Traffic Management Centre |
| Flooding, Sewage | Stormwater Drainage Department |
| Water Leak | Bangalore Water Supply Board (BWSSB) |
| Streetlight | BESCOM Electrical Services |
| Garbage | Bruhat Bengaluru Mahanagara Palike (BBMP) |
| Accident, Safety Issue, Noise | City Police |

## SLA & Escalation Engine

The SLA (Service Level Agreement) engine runs as a cron job every 5 minutes:

1. **Scans** all active assignments for SLA deadline breaches
2. **Escalates** breached assignments (status -> 'escalated', counter incremented)
3. **Notifies** all admin users via in-app notifications
4. **Tracks** escalation history with timestamps

Each department has a configurable `slaHours` field (default: 24 hours) used to calculate the deadline when an incident is assigned.

## Frontend Pages

| Page | Route | Description | Roles |
|------|-------|-------------|-------|
| Login | `/login` | Email/password authentication | Public |
| Register | `/register` | New user account creation | Public |
| Dashboard | `/dashboard` | Role-specific overview with stats | All |
| Report Incident | `/report` | Multi-step incident form with map | Citizen, Officer, Admin |
| Track Complaint | `/track` | Incident tracking with timeline | All |
| Incident Details | `/incidents/:id` | Full incident view with actions | All |
| Command Center | `/command-center` | Operational management dashboard | Officer, Official, Admin |
| Analytics | `/analytics` | Charts and performance metrics | Official, Admin |
| Departments | `/departments` | Department CRUD and management | Admin |
| Edit Profile | `/profile` | User profile update form | All |
| Feedback Form | `/incidents/:id/feedback` | Resolution feedback submission | Citizen |
| Feedback Hub | `/feedback` | Feedback history listing | Citizen |
| Emergency SOS | `/emergency` | One-tap emergency alert | All |
| Contact Department | `/contact` | Direct department messaging | All |
| Verify Incident | `/incidents/:id/verify` | Incident verification/rejection | Official, Admin |
| Assign Incident | `/incidents/:id/assign` | Department/officer assignment | Official, Admin |
| Resolve Incident | `/incidents/:id/resolve` | Resolution with proof upload | Officer, Admin |
| Audit Report | `/audit-report` | Comprehensive audit dashboard | Admin |

## Design System

The platform features a premium dark theme with:

- **Glassmorphism Effects** — Semi-transparent card backgrounds with backdrop blur
- **Gradient Accents** — Cyan-to-purple gradient highlights on active elements
- **Severity Color Coding** — Red (critical), Orange (high), Yellow (medium), Green (low)
- **Micro-Animations** — Smooth transitions, hover effects, and loading states
- **Responsive Layout** — Mobile-first design with collapsible sidebar navigation
- **Dark Map Theme** — CartoDB dark tiles matching the overall UI aesthetic
- **Consistent Typography** — Inter/system font stack with clear hierarchy

## Deployment

### Production Build

```bash
# Build the React client
cd client && npm run build

# The build output is in client/dist/
# Serve with any static file server or configure Express to serve it
```

### Environment Setup for Production

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smart-city-command
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<another-strong-secret>
CLIENT_URL=https://your-domain.com
GEMINI_API_KEY=<your-gemini-key>
```

### Deployment Platforms

The application can be deployed to:
- **Backend**: Railway, Render, AWS EC2, DigitalOcean, or any Node.js hosting
- **Frontend**: Vercel, Netlify, or served via Express static middleware
- **Database**: MongoDB Atlas (recommended for production)

## Data Models

The platform uses 11 Mongoose models:

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Platform users | name, email, password, role, zone, department |
| **Incident** | Urban issues | type, title, location, severity, status, timeline |
| **Department** | Govt departments | name, shortName, incidentTypes, slaHours, officers |
| **Assignment** | Incident-dept links | incidentId, departmentId, officerId, slaDueBy, status |
| **Feedback** | Citizen ratings | rating, responseSatisfaction, communicationClarity |
| **Notification** | Alert messages | recipientId, channel, message, status |
| **ContactMessage** | Dept messaging | from, department, subject, priority, status |
| **AnalyticsAggregate** | Pre-computed stats | period, incidentCounts, avgTTA, avgTTR |
| **IncidentIntelligence** | AI results | nlpCategory, priorityScore, sentimentScore |
| **ResolutionLog** | Resolution records | action, proofUrls, timeSpentHours, tta, ttr |
| **RiskForecast** | Predictive data | zone, riskScore, riskLevel, recommendations |

## Team 12

| Name | Roll No | GitHub |
|------|---------|--------|
| Balaji Arunachalam | CB.SC.U4CSE23759 | [arnchlmcodes](https://github.com/arnchlmcodes) |
| Danvanth | CB.SC.U4CSE23241 | [realdanvanth](https://github.com/realdanvanth) |
| Amal Godwin | CB.SC.U4CSE23407 | [AJgodwin](https://github.com/AJgodwin) |
| Prithiv A | CB.SC.U4CSE23260 | [Prithiv-0](https://github.com/Prithiv-0) |

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with care for Smart Cities | 23CSE461 - Full Stack Frameworks
