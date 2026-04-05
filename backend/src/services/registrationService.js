const prisma = require('../prismaClient');

// Student registers for an event
const registerForEvent = async (studentId, eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) throw new Error('Event not found');
  if (event.status !== 'OPEN') throw new Error('Event is not open for registration');

  // Check if already registered
  const existing = await prisma.registration.findUnique({
    where: { studentId_eventId: { studentId, eventId } },
  });
  if (existing) throw new Error('You are already registered for this event');

  // Check capacity
  if (event._count.registrations >= event.requiredStudents) {
    throw new Error('Event is full. No more slots available.');
  }

  const registration = await prisma.registration.create({
    data: { studentId, eventId },
    include: {
      event: {
        select: {
          id: true, title: true, date: true, venue: true, payoutPerStudent: true,
        },
      },
    },
  });

  return registration;
};

// Student cancels registration
const cancelRegistration = async (studentId, eventId) => {
  const registration = await prisma.registration.findUnique({
    where: { studentId_eventId: { studentId, eventId } },
    include: { event: true },
  });

  if (!registration) throw new Error('Registration not found');
  if (registration.status !== 'REGISTERED') {
    throw new Error('Cannot cancel a registration that has already been processed');
  }
  if (!['OPEN', 'PENDING'].includes(registration.event.status)) {
    throw new Error('Cannot cancel registration for an event that has already started');
  }

  await prisma.registration.delete({
    where: { studentId_eventId: { studentId, eventId } },
  });

  return { message: 'Registration cancelled successfully' };
};

// Get all gigs for a student (My Gigs dashboard)
const getStudentGigs = async (studentId) => {
  return prisma.registration.findMany({
    where: { studentId },
    include: {
      event: {
        select: {
          id: true, title: true, date: true, venue: true,
          duration: true, payoutPerStudent: true, status: true,
          stakeholder: { select: { id: true, name: true } },
          subEvents: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Get all registrations for a specific event (Stakeholder/Admin view)
const getEventRegistrations = async (eventId, requesterId, requesterRole) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  // Stakeholder can only see their own events
  if (requesterRole === 'STAKEHOLDER' && event.stakeholderId !== requesterId) {
    throw new Error('Not authorized to view registrations for this event');
  }

  return prisma.registration.findMany({
    where: { eventId },
    include: {
      student: { select: { id: true, name: true, erpId: true, email: true, accountNumber: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
};

// Get single registration
const getRegistrationById = async (registrationId, userId, userRole) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      event: true,
      student: { select: { id: true, name: true, erpId: true } },
    },
  });

  if (!registration) throw new Error('Registration not found');

  // Students can only see their own registrations
  if (userRole === 'STUDENT' && registration.studentId !== userId) {
    throw new Error('Not authorized');
  }

  return registration;
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getStudentGigs,
  getEventRegistrations,
  getRegistrationById,
};
