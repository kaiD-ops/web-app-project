/**
 * Seed script - creates test users for all 3 roles
 * Run: node prisma/seed.js
 * 
 * Test Accounts Created:
 * Admin:       admin@crowdcoin.iba.edu.pk  / admin123
 * Stakeholder: organizer@iba.edu.pk        / password123
 * Student:     student@iba.edu.pk          / password123  (ERP: 12345)
 */

require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hash = async (pw) => bcrypt.hash(pw, 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crowdcoin.iba.edu.pk' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@crowdcoin.iba.edu.pk',
      password: await hash('admin123'),
      role: 'ADMIN',
    },
  });

  // Stakeholder
  const stakeholder = await prisma.user.upsert({
    where: { email: 'organizer@iba.edu.pk' },
    update: {},
    create: {
      name: 'IBA Events Office',
      email: 'organizer@iba.edu.pk',
      password: await hash('password123'),
      role: 'STAKEHOLDER',
    },
  });

  // Student
  const student = await prisma.user.upsert({
    where: { email: 'student@iba.edu.pk' },
    update: {},
    create: {
      name: 'Ali Khan',
      email: 'student@iba.edu.pk',
      password: await hash('password123'),
      role: 'STUDENT',
      erpId: '12345',
      accountNumber: 'PK36SCBL0000001123456702',
    },
  });

  // Sample event
  const event = await prisma.event.create({
    data: {
      title: 'Tech Talk: AI in Healthcare',
      description: 'Join us for an insightful session on how AI is transforming the healthcare industry.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: 120,
      venue: 'IBA Main Auditorium',
      requiredStudents: 50,
      totalBudget: 5000,
      platformFee: 500,
      payoutPerStudent: 90,
      status: 'OPEN',
      stakeholderId: stakeholder.id,
      subEvents: {
        create: [
          {
            title: 'Opening Remarks',
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
            speaker: 'Dr. Amina Siddiqui',
          },
          {
            title: 'Keynote: AI Diagnostics',
            description: 'How machine learning is revolutionizing disease detection',
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 80 * 60 * 1000),
            speaker: 'Mr. Bilal Chaudhry, CTO MedTech PK',
          },
        ],
      },
    },
  });

  console.log('✅ Seeded successfully:');
  console.log(`   Admin:       ${admin.email}`);
  console.log(`   Stakeholder: ${stakeholder.email}`);
  console.log(`   Student:     ${student.email}`);
  console.log(`   Sample Event: "${event.title}" (ID: ${event.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
