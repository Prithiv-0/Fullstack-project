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
