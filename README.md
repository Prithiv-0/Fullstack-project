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
