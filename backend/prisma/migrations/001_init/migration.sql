-- CrowdCoin Database Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Create ENUMs
CREATE TYPE "Role" AS ENUM ('STUDENT', 'STAKEHOLDER', 'ADMIN');
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'OPEN', 'ONGOING', 'AWAITING_VERIFICATION', 'COMPLETED', 'CANCELLED');
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'ABSENT', 'PAID');

-- Users table
CREATE TABLE "User" (
  "id"            SERIAL PRIMARY KEY,
  "name"          TEXT NOT NULL,
  "email"         TEXT NOT NULL UNIQUE,
  "password"      TEXT NOT NULL,
  "role"          "Role" NOT NULL,
  "erpId"         TEXT UNIQUE,
  "accountNumber" TEXT,
  "walletBalance" FLOAT NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE "Event" (
  "id"               SERIAL PRIMARY KEY,
  "title"            TEXT NOT NULL,
  "description"      TEXT NOT NULL,
  "date"             TIMESTAMP(3) NOT NULL,
  "duration"         INTEGER NOT NULL,
  "venue"            TEXT NOT NULL,
  "requiredStudents" INTEGER NOT NULL,
  "totalBudget"      FLOAT NOT NULL,
  "payoutPerStudent" FLOAT NOT NULL,
  "platformFee"      FLOAT NOT NULL DEFAULT 0,
  "status"           "EventStatus" NOT NULL DEFAULT 'PENDING',
  "stakeholderId"    INTEGER NOT NULL REFERENCES "User"("id"),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SubEvents table
CREATE TABLE "SubEvent" (
  "id"          SERIAL PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "startTime"   TIMESTAMP(3) NOT NULL,
  "endTime"     TIMESTAMP(3) NOT NULL,
  "speaker"     TEXT,
  "eventId"     INTEGER NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE "Registration" (
  "id"        SERIAL PRIMARY KEY,
  "status"    "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
  "studentId" INTEGER NOT NULL REFERENCES "User"("id"),
  "eventId"   INTEGER NOT NULL REFERENCES "Event"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("studentId", "eventId")
);

-- Indexes for performance
CREATE INDEX "Event_stakeholderId_idx" ON "Event"("stakeholderId");
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Registration_studentId_idx" ON "Registration"("studentId");
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

-- Seed: Default Admin account (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO "User" ("name", "email", "password", "role")
VALUES (
  'System Admin',
  'admin@crowdcoin.iba.edu.pk',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'ADMIN'
);
