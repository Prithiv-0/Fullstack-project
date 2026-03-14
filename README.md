# 🏙️ Smart City Command & Intelligence Platform

An AI-powered full-stack platform for real-time urban incident monitoring, classification, and management. Built for **23CSE461 - Full Stack Frameworks** by Team 12.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **🚨 Incident Reporting** - Citizens can report urban issues (potholes, flooding, garbage, etc.)
- **🤖 AI Classification** - Automatic incident classification and priority scoring
- **🗺️ Live Map View** - Real-time incident visualization on dark-themed interactive map
- **📊 Analytics Dashboard** - Charts and insights for city-wide incident analysis
- **🏢 Department Routing** - Auto-assign incidents to appropriate government departments
- **📱 Role-Based Access** - Citizen, Official, and Admin roles with different permissions
- **⏱️ Status Tracking** - Complete incident lifecycle from report to resolution

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | CSS3 (Custom Dark Theme) |
| Maps | Leaflet.js |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Auth | JWT (JSON Web Tokens) |
| AI | Rule-based NLP classification |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
cd /path/to/project

# Install all dependencies
npm run install:all
# OR manually:
npm install
cd server && npm install
cd ../client && npm install
```

### Configure Environment

Copy the example env file and update values:
```bash
cp .env.example .env
```

Default `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-command
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### Seed Database

```bash
cd server
npm run seed                 # Full seed: users, incidents, assignments, feedback, analytics, reports
```

### Run Development Servers

```bash
# From project root - run both servers
npm run dev

# OR run separately:
npm run server:dev  # Backend on http://localhost:5000
npm run client      # Frontend on http://localhost:5173
```

## 👤 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartcity.gov.in` | `password123` |
| Official | `official@smartcity.gov.in` | `password123` |
| Officer | `ravi.officer@smartcity.gov.in` | `password123` |
| Citizen | `citizen@example.com` | `password123` |

## 📁 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, MapView)
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   └── utils/          # API utilities
│   └── package.json
│
├── server/                 # Express Backend
│   ├── config/             # Database config
│   ├── middleware/         # Auth & error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── services/           # AI & routing services
│   ├── seeds/              # Database seeders
│   └── server.js
│
├── .env                    # Environment variables
└── package.json            # Root package
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Incidents
- `GET /api/incidents` - List incidents (with filters)
- `GET /api/incidents/:id` - Get incident details
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident status

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/:id/workload` - Department workload stats

### Analytics
- `GET /api/analytics/overview` - City-wide stats
- `GET /api/analytics/trends` - Incident trends
- `GET /api/analytics/hotspots` - Location hotspots

## 🎨 Screenshots

The platform features a premium dark theme with:
- Glassmorphism card effects
- Gradient accents
- Smooth micro-animations
- Severity-coded badges
- Responsive mobile design

## 👥 Team 12

| Name | Roll No | GitHub |
|------|---------|--------|
| Balaji Arunachalam | CB.SC.U4CSE23759 | [arnchlmcodes](https://github.com/arnchlmcodes) |
| Danvanth | CB.SC.U4CSE23241 | [realdanvanth](https://github.com/realdanvanth) |
| Amal Godwin | CB.SC.U4CSE23407 | [AJgodwin](https://github.com/AJgodwin) |
| Prithiv A | CB.SC.U4CSE23260 | [Prithiv-0](https://github.com/Prithiv-0) |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for Smart Cities
