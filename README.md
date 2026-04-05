# CrowdCoin — Audience Gathering Platform

A web platform that connects **Event Stakeholders** with **Students**. Stakeholders post events and allocate budgets; students attend and get paid. The **Admin** manages approvals, attendance verification, and payment disbursement.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

---

## Local Setup

### 1. Prerequisites
- Node.js v18+
- A PostgreSQL database (we use [Supabase](https://supabase.com) — free tier works)

### 2. Clone & Install

```bash
git clone https://github.com/kaiD-ops/web-app-project.git
cd web-app-project/backend
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
JWT_SECRET="your_secret_key_here"
PORT=3000
PLATFORM_FEE_PERCENT=10
```

### 4. Database Setup

**Run the SQL migration in Supabase:**

1. Go to your Supabase project → **SQL Editor**
2. Open `backend/prisma/migrations/001_init/migration.sql`
3. Paste the entire file contents and click **Run**
4. This creates all tables + a default admin account

**Optional — generate Prisma client locally:**
```bash
cd backend
npm run db:generate
npm run db:push
```

### 5. Start the Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## Default Test Accounts

After running the SQL migration:

| Role        | Email                          | Password    |
|-------------|-------------------------------|-------------|
| Admin       | admin@crowdcoin.iba.edu.pk    | admin123    |

Register additional Stakeholder and Student accounts via `POST /api/auth/register`.

---

## API Reference

All endpoints return JSON:
```json
{ "success": true, "message": "...", "data": {} }
```

Protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/me` | All roles | Get current user |

**POST `/api/auth/register` — Request Body:**
```json
{
  "name": "Ali Khan",
  "email": "ali@iba.edu.pk",
  "password": "password123",
  "role": "STUDENT",
  "erpId": "12345",
  "accountNumber": "PK36SCBL0000001123456702"
}
```
- `role`: `STUDENT` | `STAKEHOLDER` | `ADMIN`
- `erpId`: Required for STUDENT only (must be unique)

**POST `/api/auth/login` — Request Body:**
```json
{ "email": "ali@iba.edu.pk", "password": "password123" }
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": 1, "name": "Ali Khan", "role": "STUDENT" }
  }
}
```

---

### Events — `/api/events`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/events` | All roles | List all OPEN events |
| GET | `/api/events/all` | Admin | List all events (any status) |
| GET | `/api/events/my` | Stakeholder | List my events |
| GET | `/api/events/:id` | All roles | Get single event |
| POST | `/api/events` | Stakeholder | Create event |
| PUT | `/api/events/:id` | Stakeholder | Update event |
| DELETE | `/api/events/:id` | Stakeholder | Delete event |
| PATCH | `/api/events/:id/approve` | Admin | Approve event (PENDING→OPEN) |
| PATCH | `/api/events/:id/close` | Admin | Close for verification |
| POST | `/api/events/:id/sub-events` | Stakeholder | Add sub-event/session |
| PUT | `/api/events/sub-events/:subId` | Stakeholder | Update sub-event |
| DELETE | `/api/events/sub-events/:subId` | Stakeholder | Delete sub-event |

**POST `/api/events` — Request Body:**
```json
{
  "title": "Leadership Summit 2025",
  "description": "Annual leadership conference",
  "date": "2025-03-15T09:00:00Z",
  "duration": 180,
  "venue": "IBA Main Auditorium",
  "requiredStudents": 100,
  "totalBudget": 10000,
  "subEvents": [
    {
      "title": "Opening Keynote",
      "startTime": "2025-03-15T09:00:00Z",
      "endTime": "2025-03-15T10:00:00Z",
      "speaker": "Dr. Farrukh Iqbal",
      "description": "Welcome address"
    }
  ]
}
```
*`payoutPerStudent` is auto-calculated: `(totalBudget - platformFee) / requiredStudents`*

**Example Response:**
```json
{
  "success": true,
  "message": "Event created and pending approval",
  "data": {
    "id": 1,
    "title": "Leadership Summit 2025",
    "payoutPerStudent": 90,
    "platformFee": 1000,
    "status": "PENDING",
    "subEvents": [...]
  }
}
```

---

### Registrations — `/api/registrations`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/registrations` | Student | Register for an event |
| GET | `/api/registrations/my-gigs` | Student | My gigs dashboard |
| GET | `/api/registrations/event/:eventId` | Stakeholder/Admin | All registrations for event |
| GET | `/api/registrations/:id` | All roles | Single registration |
| DELETE | `/api/registrations/:eventId` | Student | Cancel registration |

**POST `/api/registrations` — Request Body:**
```json
{ "eventId": 1 }
```
**Response:**
```json
{
  "success": true,
  "message": "Successfully registered. You will be notified 1 hour and 10 minutes before.",
  "data": {
    "id": 5,
    "status": "REGISTERED",
    "event": { "title": "Leadership Summit 2025", "payoutPerStudent": 90, "venue": "IBA Main Auditorium" }
  }
}
```

**GET `/api/registrations/my-gigs` — Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 5,
      "status": "PAID",
      "event": { "title": "Tech Talk", "date": "...", "payoutPerStudent": 90, "status": "COMPLETED" }
    }
  ]
}
```

---

### Attendance & Payout — `/api/attendance`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/attendance/:eventId` | Admin | Get attendance sheet |
| PATCH | `/api/attendance/:eventId/mark` | Admin | Mark one student present/absent |
| POST | `/api/attendance/:eventId/bulk-mark` | Admin | Mark multiple students at once |
| POST | `/api/attendance/:eventId/finalize` | Admin | Finalize & disburse payments |
| GET | `/api/attendance/:eventId/payout-summary` | Admin/Stakeholder | Financial summary |

**GET `/api/attendance/:eventId` — Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "title": "Tech Talk",
      "registrations": [
        { "student": { "name": "Ali Khan", "erpId": "12345" }, "status": "REGISTERED" }
      ]
    },
    "summary": { "totalRegistered": 45, "totalAttended": 0, "totalAbsent": 0, "totalPaid": 0 }
  }
}
```

**PATCH `/api/attendance/:eventId/mark` — Request Body:**
```json
{ "studentId": 3, "isPresent": true }
```

**POST `/api/attendance/:eventId/bulk-mark` — Request Body:**
```json
{
  "attendanceList": [
    { "studentId": 3, "isPresent": true },
    { "studentId": 4, "isPresent": false },
    { "studentId": 5, "isPresent": true }
  ]
}
```

**POST `/api/attendance/:eventId/finalize` — Response:**
```json
{
  "success": true,
  "message": "Attendance finalized and payments disbursed successfully",
  "data": {
    "eventTitle": "Tech Talk: AI in Healthcare",
    "totalAttended": 38,
    "payoutPerStudent": 90,
    "totalDisbursed": 3420,
    "currency": "PKR"
  }
}
```

**GET `/api/attendance/:eventId/payout-summary` — Response:**
```json
{
  "success": true,
  "data": {
    "totalBudget": 5000,
    "platformFee": 500,
    "payoutPerStudent": 90,
    "totalRegistered": 45,
    "totalAttended": 38,
    "totalPaid": 38,
    "totalDisbursed": 3420,
    "budgetUtilized": 3920,
    "budgetRemaining": 1080,
    "status": "COMPLETED"
  }
}
```

---

### Stats / Dashboard — `/api/stats`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/stats/admin` | Admin | Platform-wide statistics |
| GET | `/api/stats/stakeholder` | Stakeholder | My events stats |
| GET | `/api/stats/student` | Student | My earnings & gig stats |

**GET `/api/stats/admin` — Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 120,
      "totalEvents": 15,
      "totalRegistrations": 430,
      "totalAmountDisbursed": 38700
    },
    "userBreakdown": { "STUDENT": 110, "STAKEHOLDER": 8, "ADMIN": 2 },
    "eventBreakdown": { "OPEN": 3, "COMPLETED": 10, "PENDING": 2 },
    "recentEvents": [...]
  }
}
```

---

## Workflow Summary

### Workflow 1: Event Creation (Stakeholder)
1. Stakeholder logs in → `POST /api/auth/login`
2. Creates event with budget & headcount → `POST /api/events`
3. Adds sub-events/sessions → `POST /api/events/:id/sub-events`
4. Admin approves → `PATCH /api/events/:id/approve`
5. Event goes live for students

### Workflow 2: Student Registration
1. Student registers account → `POST /api/auth/register`
2. Browses open events → `GET /api/events`
3. Confirms availability → `POST /api/registrations`
4. Views upcoming gigs → `GET /api/registrations/my-gigs`
5. Cancels if needed → `DELETE /api/registrations/:eventId`

### Workflow 3: Attendance Verification & Payout
1. Admin closes event → `PATCH /api/events/:id/close`
2. Admin views attendance sheet → `GET /api/attendance/:eventId`
3. Admin marks attendance → `POST /api/attendance/:eventId/bulk-mark`
4. Admin finalizes & disburses → `POST /api/attendance/:eventId/finalize`
5. Students' wallets credited, event marked COMPLETED

---

## Project Structure

```
backend/
├── server.js                        # App entry point
├── .env.example                     # Environment variables template
├── package.json
├── prisma/
│   ├── schema.prisma                # Database schema (all models)
│   ├── seed.js                      # Seed script for test data
│   └── migrations/
│       └── 001_init/
│           └── migration.sql        # Run this in Supabase SQL Editor
└── src/
    ├── prismaClient.js              # Prisma singleton instance
    ├── middleware/
    │   └── auth.js                  # JWT verification + role authorization
    ├── routes/
    │   ├── authRoutes.js            # /api/auth
    │   ├── eventRoutes.js           # /api/events
    │   ├── registrationRoutes.js    # /api/registrations
    │   ├── attendanceRoutes.js      # /api/attendance
    │   └── statsRoutes.js           # /api/stats
    └── services/
        ├── authService.js           # Register, login logic
        ├── eventService.js          # Event + sub-event CRUD
        ├── registrationService.js   # Student gig registration CRUD
        ├── attendanceService.js     # Attendance marking + payout
        └── statsService.js          # Dashboard statistics
```

---

## Grade Breakdown Coverage

| Criterion | Implementation |
|-----------|---------------|
| Version Control | Feature branches per flow, meaningful commits, PRs merged to main |
| Backend Implementation | Modular services + routes, 3 full CRUD flows |
| API Design & Routes | RESTful URL patterns, correct HTTP verbs, consistent JSON |
| Database Integration | PostgreSQL via Prisma ORM, relational schema with enums |
| Documentation | This README — all routes, request/response formats, setup guide |
