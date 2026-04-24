# CrowdCoin — Audience Gathering Platform

A full-stack web platform that connects **Event Stakeholders** with **Students** at IBA Karachi. Stakeholders post events with budgets; students attend and get paid. The **Admin** manages approvals, attendance verification, and payment disbursement.

---

## Project Overview

CrowdCoin solves a real problem: event organizers struggle to fill auditoriums, while students need flexible ways to earn money. The platform creates a transparent marketplace where:
- **Stakeholders** create events and allocate budgets
- **Students** browse events, confirm availability, and earn money for attending
- **Admins** approve events, verify attendance, and disburse payments

---

## Features

### Student
- Register with ERP ID and account details
- Browse open events with payout info and fill rates
- Register/cancel for events
- My Gigs dashboard (upcoming & history)
- Wallet with earnings summary

### Stakeholder
- Create events with sub-sessions and budget calculator
- Auto-calculated payout per student (after 10% platform fee)
- View registrations and payout summaries per event
- Edit/delete pending events

### Admin
- Platform-wide stats dashboard
- Approve/reject pending events
- Attendance Manager — tick individual students present/absent
- Bulk mark and finalize attendance with one-click payment disbursement
- View all events with status filtering

---

## Frameworks & Libraries

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Backend | Express.js (Node.js) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | JWT + bcryptjs |

---

## Setup Steps

### Prerequisites
- Node.js v18+
- A Supabase account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/kaiD-ops/web-app-project.git
cd web-app-project
```

### 2. Set up the Backend
```bash
cd backend
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET in .env
npm install
npx prisma generate
```

### 3. Set up the Database
1. Go to Supabase → SQL Editor → New Query
2. Paste the contents of `backend/prisma/migrations/001_init/migration.sql`
3. Click Run — this creates all tables and a default admin account

### 4. Start the Backend
```bash
npm run dev
# Backend runs at http://localhost:3000
```

### 5. Set up the Frontend
```bash
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000 (already set)
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

### Default Admin Account
| Email | Password |
|-------|----------|
| admin@crowdcoin.iba.edu.pk | admin123 |

---

## Team Contributions

| Member | Role | Contributions |
|--------|------|--------------|
| Muhammad Ali Khan | Backend Lead | Attendance & payout service, admin routes, stats endpoints, database migration SQL, project setup and integration |
| Ammar Danish | Stakeholder Flow | Event creation workflow, stakeholder dashboard, event management routes and service |
| Nayab Dhanani | Student Flow | Student registration workflow, browse events page, my gigs dashboard, auth routes |
