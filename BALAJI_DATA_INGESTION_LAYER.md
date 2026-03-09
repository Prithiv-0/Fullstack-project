# 📄 Balaji Arunachalam (CB.SC.U4CSE23759) — Data Ingestion Layer

**Course:** 23CSE461 – Full Stack Frameworks  
**Team:** Team 12 | Amrita Vishwa Vidyapeetham  
**Modules Owned:** Module 1 (Multi-Source Data Collection) + Module 2 (Data Preprocessing & Normalization)  
**Stack:** MERN (MongoDB · Express · React · Node.js)

---

## 📋 Table of Contents

1. [Role & Responsibility Overview](#-role--responsibility-overview)
2. [Module 1 — Multi-Source Data Collection](#-module-1--multi-source-data-collection)
3. [Module 2 — Data Preprocessing & Normalization](#-module-2--data-preprocessing--normalization)
4. [Models](#-models)
   - [User.js](#userjs)
   - [Incident.js](#incidentjs)
5. [Pages](#-pages)
   - [Register Page](#register-page)
   - [Citizen Dashboard](#citizen-dashboard)
   - [Report Incident Page](#report-incident-page)
6. [Forms](#-forms)
   - [Citizen Registration Form](#1-citizen-registration-form)
   - [Incident Reporting Form](#2-incident-reporting-form)
7. [Report — Incident Type Distribution](#-report--incident-type-distribution)
8. [API Endpoints](#-api-endpoints)
9. [Architecture Diagram](#-architecture-diagram)
10. [File Map](#-file-map)

---

## 🎯 Role & Responsibility Overview

Balaji is responsible for the **Data Ingestion Layer** — the foundational entry point of the entire Smart City platform. This layer handles:

- **How data enters the system** (citizen app submissions, multi-source data feeds)
- **How data is validated, cleaned, and normalized** before any AI processing or routing occurs
- **User identity management** (registration, authentication, profile)
- **Incident creation** with GPS tagging, media support, and source tracking

> Without the Data Ingestion Layer, no other module (AI classification, routing, resolution, etc.) can function — it is the pipeline that feeds the entire platform.

---

## 📦 Module 1 — Multi-Source Data Collection

### Purpose
Collects civic incident data from multiple heterogeneous sources into a unified format within MongoDB.

### Supported Data Sources

| # | Source | Enum Value | Description |
|---|--------|------------|-------------|
| 1 | **Citizen App** | `citizen_app` | Primary source — citizens report via the web UI (default) |
| 2 | **Social Media** | `social_media` | Data ingested from social media feeds (Twitter, Facebook, etc.) |
| 3 | **IoT Sensors** | `iot_sensor` | Smart city sensor data (flood sensors, traffic counters, etc.) |
| 4 | **Traffic API** | `traffic_api` | External traffic data integrations |
| 5 | **Manual Entry** | `manual` | Government officials manually logging incidents |

### How It Works
- Every `Incident` document carries a `source` field (see `Incident.js` model, line 62–66)
- The citizen app submission flow is the primary implemented path:
  1. Citizen fills out the **Report Incident** form (`ReportIncident.jsx`)
  2. Frontend sends `POST /api/v1/incidents` with title, type, description, location, and optional media
  3. Backend validates, creates the `Incident` document, and triggers async AI processing
- The `source` enum is designed for extensibility — future integrations (IoT, social media) can feed data through the same `Incident` model

### Key Implementation Files
| File | Path | Role |
|------|------|------|
| `Incident.js` | `server/models/Incident.js` | Defines the `source` enum for multi-source tracking |
| `incidentRoutes.js` | `server/routes/incidentRoutes.js` | `POST /api/v1/incidents` — the primary ingestion endpoint |
| `ReportIncident.jsx` | `client/src/pages/ReportIncident.jsx` | The citizen-facing data entry form |

---

## 🔧 Module 2 — Data Preprocessing & Normalization

### Purpose
Ensures all incoming data is validated, cleaned, and normalized before being persisted or processed by downstream modules (AI, routing, dashboards).

### Preprocessing Steps

#### 1. Input Validation
- **Server-side** via `express-validator` in `incidentRoutes.js` (lines 15–24):
  - `title` — Non-empty, minimum 10 characters
  - `type` — Must be one of the 13 valid incident types
  - `location.lat` — Must be numeric
  - `location.lng` — Must be numeric
- **Client-side** in `ReportIncident.jsx` (lines 61–63):
  - Type selection required
  - Title minimum 10 characters
  - Location coordinates required
- **Registration** via `express-validator` in `authRoutes.js` (lines 10–14):
  - Name non-empty
  - Valid email format
  - Password minimum 8 characters
  - Role must be a valid enum value

#### 2. Data Normalization
- **Location normalization** — Location is stored as a structured sub-document:
  ```json
  {
    "lat": 12.9716,
    "lng": 77.5946,
    "address": "MG Road near Brigade Road junction",
    "area": "MG Road",
    "zone": "Central"
  }
  ```
- **Email normalization** — Emails are lowercased automatically (`lowercase: true` in User schema)
- **String sanitization** — Names and titles are trimmed via `trim: true` in schemas
- **ID generation** — Both `User` and `Incident` have auto-generated UUIDs via `crypto.randomUUID()`

#### 3. PII Protection
- **Passwords** are hashed with `bcrypt` using 12 salt rounds (never stored in plaintext)
- **Password field excluded** from queries by default (`select: false` on the password field)

#### 4. Mongoose Schema Constraints
- Maximum lengths enforced: Name (50), Title (100), Description (2000), Phone (15)
- Enum validation on: `role`, `type`, `severity`, `status`, `source`
- Required field enforcement with custom error messages

#### 5. Database Indexing (Performance Normalization)
Six indexes defined on the Incident collection for query optimization:
```javascript
IncidentSchema.index({ 'location.zone': 1 });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ type: 1 });
IncidentSchema.index({ severity: 1 });
IncidentSchema.index({ reportedBy: 1 });
IncidentSchema.index({ createdAt: -1 });
```

---

## 🗃️ Models

### User.js

**Path:** `server/models/User.js` (101 lines)  
**Collection:** `users`

#### Schema Definition

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | String | Unique, auto-generated UUID | Public-facing user identifier |
| `name` | String | Required, trim, max 50 chars | Full name |
| `email` | String | Required, unique, lowercase, regex validated | Login email |
| `phone` | String | Max 15 chars | Contact number |
| `password` | String | Required, min 6 chars, `select: false` | bcrypt-hashed password |
| `role` | String | Enum: `citizen`, `field_officer`, `government_official`, `admin` | RBAC role (default: `citizen`) |
| `zone` | String | Optional | User's geographic zone |
| `isVerified` | Boolean | Default: `false` | Email verification status |
| `isActive` | Boolean | Default: `true` | Account active status |
| `profilePhoto` | String | Optional | Profile image URL |
| `department` | ObjectId → `Department` | Optional | Linked department (for officers) |
| `createdAt` | Date | Default: `Date.now` | Account creation timestamp |
| `updatedAt` | Date | Auto-updated on save | Last update timestamp |

#### Instance Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getSignedJwtToken()` | JWT string | Creates access token (15m expiry) with `{ id, role }` payload |
| `getRefreshToken()` | JWT string | Creates refresh token (7d expiry) with `{ id }` payload |
| `matchPassword(enteredPassword)` | Boolean | Compares entered password against bcrypt hash |

#### Pre-save Middleware
- Auto-updates `updatedAt` timestamp on every save
- Hashes password with bcrypt (12 salt rounds) only when the password field is modified

---

### Incident.js

**Path:** `server/models/Incident.js` (110 lines)  
**Collection:** `incidents`

#### Supported Incident Types (13 total)

| # | Type | Enum Value |
|---|------|------------|
| 1 | Pothole | `pothole` |
| 2 | Traffic | `traffic` |
| 3 | Flooding | `flooding` |
| 4 | Streetlight | `streetlight` |
| 5 | Garbage | `garbage` |
| 6 | Accident | `accident` |
| 7 | Water Leak | `water_leak` |
| 8 | Road Damage | `road_damage` |
| 9 | Safety Issue | `safety_issue` |
| 10 | Noise | `noise` |
| 11 | Illegal Parking | `illegal_parking` |
| 12 | Sewage | `sewage` |
| 13 | Other | `other` |

#### Schema Definition

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `incidentId` | String | Unique, auto-generated UUID | Public-facing incident identifier |
| `type` | String | Required, enum (13 types) | Category of incident |
| `title` | String | Required, trim, max 100 chars | Brief incident description |
| `description` | String | Max 2000 chars | Detailed description |
| `location` | Object | `lat` (required), `lng` (required), `address`, `area`, `zone` | GPS + address data |
| `severity` | String | Enum: `critical`, `high`, `medium`, `low` (default: `medium`) | Incident severity level |
| `status` | String | Enum: `reported`, `acknowledged`, `assigned`, `in_progress`, `resolved`, `closed`, `rejected` (default: `reported`) | Lifecycle status |
| `reportedBy` | ObjectId → `User` | Required | Citizen who reported |
| `mediaUrls` | [String] | Optional | Uploaded photo/video URLs |
| `isVerified` | Boolean | Default: `false` | Admin verification flag |
| `isFalse` | Boolean | Default: `false` | False report flag |
| `source` | String | Enum: `citizen_app`, `social_media`, `iot_sensor`, `traffic_api`, `manual` (default: `citizen_app`) | Data source |
| `aiProcessed` | Boolean | Default: `false` | Whether AI classification has run |
| `timeline` | Array | Status history entries with `status`, `comment`, `updatedBy`, `updatedAt` | Full audit trail |
| `createdAt` | Date | Default: `Date.now` | Report timestamp |
| `updatedAt` | Date | Auto-updated on save | Last update timestamp |

#### Status Lifecycle

```
Reported → Acknowledged → Assigned → In Progress → Resolved → Closed
                                                                 ↑
                                          (Rejected at any stage)
```

---

## 📄 Pages

### Register Page

**Path:** `client/src/pages/Register.jsx` (131 lines)  
**Route:** `/register`  
**Access:** Public (unauthenticated)

#### Features
- **Form fields:** Name*, Email*, Password*, Confirm Password*, Phone, Zone (dropdown with 10 Bangalore zones), Role
- **Password strength meter:** Visual 4-bar indicator with labels (Weak → Fair → Good → Strong)
  - Checks: length ≥ 8, uppercase letter, number, special character
- **Client-side validation:**
  - Name, email, password required
  - Password minimum 8 characters
  - Password confirmation match
- **UI components:** Lucide icons (`User`, `Mail`, `Lock`, `Phone`, `MapPin`, `UserPlus`, `Eye/EyeOff`, `Shield`)
- **Post-registration:** Auto-redirects to `/dashboard`
- **Navigation:** Link to login page for existing users

#### Zone Options
Central, North, South, East, West, Mahadevapura, Bommanahalli, Dasarahalli, Yelahanka, Rajarajeshwari Nagar

---

### Citizen Dashboard

**Path:** `client/src/pages/Dashboard.jsx` (210 lines)  
**Route:** `/dashboard`  
**Access:** Authenticated (role-based rendering)

#### Role-Based Routing
The `Dashboard.jsx` component renders different dashboards based on user role:
- **Citizen** → `CitizenDash` component
- **Admin** → `AdminDash` component (renders `OfficialDash`)
- **Government Official / Field Officer** → `OfficialDash` component

#### Citizen Dashboard Features
- **Stats row:** Total Reports | Active | Resolved
- **Quick action cards:** Report Issue, Emergency SOS, Contact Department, My Profile
- **Recent reports list:** Shows last 5 incidents with:
  - Title, location area, date
  - Color-coded status badge
  - Clickable link to incident detail
- **Data fetching:** `GET /api/v1/incidents/my?limit=5`

#### Status Color Coding
| Status | Color |
|--------|-------|
| Reported | 🔵 Blue `#3b82f6` |
| Acknowledged | 🟣 Purple `#8b5cf6` |
| Assigned | 🟣 Indigo `#6366f1` |
| In Progress | 🟡 Amber `#f59e0b` |
| Resolved | 🟢 Green `#10b981` |
| Closed | ⚪ Gray `#6b7280` |
| Rejected | 🔴 Red `#ef4444` |

---

### Report Incident Page

**Path:** `client/src/pages/ReportIncident.jsx` (185 lines)  
**Route:** `/report`  
**Access:** Authenticated Citizens

#### Three-Step Form Flow

**Step 1 — Select Issue Type:**
- Grid of 12 clickable type cards with icon + color
- Visual selection feedback (colored border + background tint)

**Step 2 — Incident Details:**
- Title input (min 10 characters)
- Description textarea (detailed description)

**Step 3 — Location:**
- **GPS auto-detect button** — uses browser `navigator.geolocation` API with high accuracy
- Manual lat/lng entry fields
- Address / Landmark text input
- Area and Zone text inputs

#### Submission Flow
1. Client-side validation runs
2. Payload sent to `POST /api/v1/incidents`
3. On success → shows "✅ Incident Reported Successfully!" confirmation
4. Auto-redirects to `/dashboard` after 2 seconds
5. Backend asynchronously triggers AI classification + department routing

---

## 📝 Forms

### 1. Citizen Registration Form

**Page:** `/register` (`Register.jsx`)  
**API Endpoint:** `POST /api/v1/auth/register`

| Field | Type | Required | Validation |
|-------|------|:--------:|------------|
| Full Name | Text | ✅ | Non-empty, max 50 chars |
| Email | Email | ✅ | Valid email regex pattern |
| Password | Password | ✅ | Min 8 chars, strength meter |
| Confirm Password | Password | ✅ | Must match password |
| Phone | Text | ❌ | Max 15 chars |
| Zone | Dropdown | ❌ | Select from 10 predefined zones |
| Role | Hidden | ❌ | Default: `citizen` |

**Backend Validation (express-validator):**
- Name: `notEmpty()`
- Email: `isEmail()`
- Password: `isLength({ min: 8 })`
- Role: `isIn(['citizen', 'field_officer', 'government_official', 'admin'])`

**Response:** JWT access token (15m) + refresh token (7d) + user object

---

### 2. Incident Reporting Form

**Page:** `/report` (`ReportIncident.jsx`)  
**API Endpoint:** `POST /api/v1/incidents`

| Field | Type | Required | Validation |
|-------|------|:--------:|------------|
| Incident Type | Card selector | ✅ | One of 13 valid types |
| Title | Text | ✅ | Min 10 chars, max 100 chars |
| Description | Textarea | ❌ | Max 2000 chars |
| Latitude | Number | ✅ | Valid numeric, auto-fill via GPS |
| Longitude | Number | ✅ | Valid numeric, auto-fill via GPS |
| Address | Text | ❌ | Free-form landmark/address |
| Area | Text | ❌ | Locality name |
| Zone | Text | ❌ | Urban zone |

**Backend Validation (express-validator):**
- Title: `notEmpty().isLength({ min: 10 })`
- Type: `isIn([...13 types])`
- Location.lat: `isNumeric()`
- Location.lng: `isNumeric()`

**Post-Submit Async Pipeline:**
1. Incident document created in MongoDB
2. AI classification triggered (via `aiService.classifyIncident()`)
3. Intelligence record stored in `IncidentIntelligence` collection
4. Severity updated from AI results
5. Auto-routed to appropriate department (via `routingService.assignDepartment()`)

---

## 📊 Report — Incident Type Distribution

**Endpoint (GET):** `GET /api/v1/reports/incident-type-distribution`  
**Endpoint (POST):** `POST /api/v1/reports/generate` with `reportType: 'incident-type-distribution'`  
**Access:** Admin, Government Official

### What It Shows
A frequency breakdown of incidents by category — e.g., how many potholes vs. flooding vs. traffic incidents exist.

### MongoDB Aggregation Pipeline
```javascript
Incident.aggregate([
  { $match: match },              // Optional: date range, zone, type filters
  { $group: { _id: '$type', count: { $sum: 1 } } },
  { $sort: { count: -1 } }        // Sorted by highest count first
]);
```

### Sample Output
```json
{
  "success": true,
  "data": [
    { "_id": "pothole",    "count": 42 },
    { "_id": "garbage",    "count": 35 },
    { "_id": "traffic",    "count": 28 },
    { "_id": "flooding",   "count": 15 },
    { "_id": "streetlight", "count": 12 }
  ]
}
```

### Supported Filters (via POST)
| Filter | Description |
|--------|-------------|
| `dateFrom` | Start date for time range |
| `dateTo` | End date for time range |
| `zone` | Filter by city zone |
| `type` | Filter by incident type |

### Visualization
Rendered as a **bar chart** on the Admin Dashboard using **Recharts** library, showing incident count per type sorted in descending order.

---

## 🔌 API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public (rate-limited: 5/min) | Login & receive JWT tokens |
| `POST` | `/logout` | JWT | Logout session |
| `POST` | `/refresh` | Refresh token | Get new access token |
| `GET` | `/profile` | JWT | Get current user profile |
| `GET` | `/me` | JWT | Alias for profile |
| `PUT` | `/profile` | JWT | Update profile (name, phone, zone, photo) |
| `POST` | `/forgot-password` | Public | Request password reset |
| `POST` | `/reset-password` | Public | Reset password with token |

### Incident Routes (`/api/v1/incidents`)

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| `POST` | `/` | JWT | Citizen, Field Officer, Admin | Submit new incident |
| `GET` | `/` | JWT | All (role-filtered) | List incidents with filters & pagination |
| `GET` | `/my` | JWT | All | Get my reported incidents |
| `GET` | `/nearby` | JWT | All | Find incidents near lat/lng (radius in km) |
| `GET` | `/:id` | JWT | All | Get single incident with assignment info |

### Report Route

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| `GET` | `/api/v1/reports/incident-type-distribution` | JWT | Admin, Official | Incident type distribution data |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│                                                                 │
│  ┌──────────┐  ┌─────────────────┐  ┌──────────────────────┐   │
│  │ Register │  │ Report Incident │  │  Citizen Dashboard   │   │
│  │  Page    │  │     Page        │  │                      │   │
│  │          │  │  ┌───────────┐  │  │  Stats Cards         │   │
│  │  Name    │  │  │ Type Grid │  │  │  Quick Actions       │   │
│  │  Email   │  │  │ Details   │  │  │  Recent Reports      │   │
│  │  Pass    │  │  │ GPS Loc   │  │  │                      │   │
│  │  Zone    │  │  └───────────┘  │  │                      │   │
│  └────┬─────┘  └───────┬────────┘  └──────────┬───────────┘   │
│       │                │                       │               │
└───────┼────────────────┼───────────────────────┼───────────────┘
        │                │                       │
   POST /auth/      POST /incidents     GET /incidents/my
    register              │
        │                │                       │
┌───────┼────────────────┼───────────────────────┼───────────────┐
│       ▼                ▼                       ▼               │
│                BACKEND (Express.js)                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐   │
│  │ authRoutes   │  │ incidentRoutes   │  │ report.routes  │   │
│  │              │  │                  │  │                │   │
│  │  Validation  │  │  Validation      │  │  Aggregation   │   │
│  │  bcrypt Hash │  │  Create Doc      │  │  Queries       │   │
│  │  JWT Issue   │  │  Async AI Trigger│  │                │   │
│  └──────┬───────┘  └────────┬─────────┘  └───────┬────────┘   │
│         │                   │                     │            │
│         ▼                   ▼                     ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MongoDB (Atlas)                       │   │
│  │                                                         │   │
│  │   users Collection          incidents Collection        │   │
│  │   ┌──────────────┐         ┌───────────────────┐       │   │
│  │   │ userId       │         │ incidentId        │       │   │
│  │   │ name         │◄────────│ reportedBy (ref)  │       │   │
│  │   │ email        │         │ type              │       │   │
│  │   │ password     │         │ title / desc      │       │   │
│  │   │ role         │         │ location{}        │       │   │
│  │   │ zone         │         │ severity / status │       │   │
│  │   └──────────────┘         │ source            │       │   │
│  │                            │ timeline[]        │       │   │
│  │                            └───────────────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              Async Pipeline (post-incident creation)            │
│              ┌──────────┐  ┌────────────┐  ┌───────────┐      │
│              │ AI Svc   │→ │ Intel Store│→ │ Dept Route│      │
│              └──────────┘  └────────────┘  └───────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Map

All files owned/created by Balaji for the Data Ingestion Layer:

### Backend (Server)
| File | Path | Lines | Purpose |
|------|------|------:|---------|
| `User.js` | `server/models/User.js` | 101 | User schema with auth methods |
| `Incident.js` | `server/models/Incident.js` | 110 | Incident schema with indexes |
| `authRoutes.js` | `server/routes/authRoutes.js` | 196 | Registration, login, profile APIs |
| `incidentRoutes.js` | `server/routes/incidentRoutes.js` | 461 | Incident CRUD + async processing |
| `report.routes.js` | `server/routes/report.routes.js` | 175 | Report generation (type distribution) |

### Frontend (Client)
| File | Path | Lines | Purpose |
|------|------|------:|---------|
| `Register.jsx` | `client/src/pages/Register.jsx` | 131 | Registration page with password strength |
| `Dashboard.jsx` | `client/src/pages/Dashboard.jsx` | 210 | Role-based dashboard (Citizen view) |
| `ReportIncident.jsx` | `client/src/pages/ReportIncident.jsx` | 185 | 3-step incident reporting form |
| `ReportIncident.css` | `client/src/pages/ReportIncident.css` | — | Styles for incident form |
| `Auth.css` | `client/src/pages/Auth.css` | — | Styles for register/login pages |
| `Dashboard.css` | `client/src/pages/Dashboard.css` | — | Styles for dashboard |

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| bcrypt with 12 salt rounds | Industry-standard password hashing; 12 rounds balances security vs. performance |
| JWT dual-token (access 15m + refresh 7d) | Short-lived access tokens minimize risk; refresh tokens enable seamless UX |
| UUID for `userId` and `incidentId` | Public-safe identifiers that don't expose MongoDB `_id` |
| `source` enum on Incident | Future-proofs for IoT/social media data without schema changes |
| 6 compound indexes | Optimizes common query patterns (zone filter, status filter, type aggregation, etc.) |
| Timeline array for status history | Complete audit trail without a separate collection |
| Async AI pipeline | Non-blocking incident creation — citizen gets instant confirmation |
| Client-side GPS | Browser Geolocation API with `enableHighAccuracy: true` for precise coordinates |
| express-validator | Server-side validation as a security boundary beyond client-side checks |

---

*Smart City Command & Intelligence Platform — Team 12 | 23CSE461 Full Stack Frameworks | Amrita Vishwa Vidyapeetham*
