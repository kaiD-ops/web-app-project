const prisma = require('../prismaClient');

// Get attendance sheet for an event (Admin)
const getAttendanceSheet = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          student: {
            select: { id: true, name: true, erpId: true, email: true, accountNumber: true },
          },
        },
      },
      stakeholder: { select: { id: true, name: true, email: true } },
      subEvents: true,
    },
  });

  if (!event) throw new Error('Event not found');
  if (!['AWAITING_VERIFICATION', 'COMPLETED'].includes(event.status)) {
    throw new Error('Event is not yet ready for attendance verification');
  }

  const summary = {
    totalRegistered: event.registrations.length,
    totalAttended: event.registrations.filter((r) => r.status === 'ATTENDED').length,
    totalAbsent: event.registrations.filter((r) => r.status === 'ABSENT').length,
    totalPaid: event.registrations.filter((r) => r.status === 'PAID').length,
  };

  return { event, summary };
};

// Mark a single student as attended or absent
const markAttendance = async (eventId, studentId, isPresent) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.status !== 'AWAITING_VERIFICATION') {
    throw new Error('Attendance can only be marked for events awaiting verification');
  }

  const registration = await prisma.registration.findUnique({
    where: { studentId_eventId: { studentId, eventId } },
  });
  if (!registration) throw new Error('Student is not registered for this event');
  if (registration.status === 'PAID') throw new Error('Student has already been paid');

  const updated = await prisma.registration.update({
    where: { studentId_eventId: { studentId, eventId } },
    data: { status: isPresent ? 'ATTENDED' : 'ABSENT' },
    include: {
      student: { select: { id: true, name: true, erpId: true } },
    },
  });

  return updated;
};

// Bulk mark attendance — Admin submits full attendance list at once
const bulkMarkAttendance = async (eventId, attendanceList) => {
  // attendanceList: [{ studentId, isPresent }]
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.status !== 'AWAITING_VERIFICATION') {
    throw new Error('Attendance can only be marked for events awaiting verification');
  }

  const updates = await Promise.all(
    attendanceList.map(({ studentId, isPresent }) =>
      prisma.registration.updateMany({
        where: {
          eventId,
          studentId,
          status: { not: 'PAID' },
        },
        data: { status: isPresent ? 'ATTENDED' : 'ABSENT' },
      })
    )
  );

  return {
    message: `Attendance recorded for ${updates.length} students`,
    processed: updates.length,
  };
};

// Finalize attendance and disburse payments
const finalizeAndDisburse = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: { status: 'ATTENDED' },
        include: { student: true },
      },
    },
  });

  if (!event) throw new Error('Event not found');
  if (event.status !== 'AWAITING_VERIFICATION') {
    throw new Error('Event must be in AWAITING_VERIFICATION status to disburse funds');
  }

  const attendedStudents = event.registrations;
  if (attendedStudents.length === 0) {
    throw new Error('No students marked as attended. Cannot disburse.');
  }

  const payoutPerStudent = event.payoutPerStudent;
  const totalDisbursed = payoutPerStudent * attendedStudents.length;

  // Update wallet balance for each attended student and mark as PAID
  await Promise.all(
    attendedStudents.map((reg) =>
      prisma.$transaction([
        prisma.user.update({
          where: { id: reg.studentId },
          data: { walletBalance: { increment: payoutPerStudent } },
        }),
        prisma.registration.update({
          where: { id: reg.id },
          data: { status: 'PAID' },
        }),
      ])
    )
  );

  // Mark absent students
  await prisma.registration.updateMany({
    where: { eventId, status: 'REGISTERED' },
    data: { status: 'ABSENT' },
  });

  // Mark event as completed
  await prisma.event.update({
    where: { id: eventId },
    data: { status: 'COMPLETED' },
  });

  return {
    message: 'Attendance finalized and payments disbursed successfully',
    summary: {
      eventId,
      eventTitle: event.title,
      totalAttended: attendedStudents.length,
      payoutPerStudent,
      totalDisbursed,
      currency: 'PKR',
    },
  };
};

// Get payout summary for an event (Stakeholder/Admin)
const getPayoutSummary = async (eventId, requesterId, requesterRole) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          student: { select: { id: true, name: true, erpId: true } },
        },
      },
    },
  });

  if (!event) throw new Error('Event not found');

  if (requesterRole === 'STAKEHOLDER' && event.stakeholderId !== requesterId) {
    throw new Error('Not authorized to view this event summary');
  }

  const attended = event.registrations.filter((r) => r.status === 'ATTENDED' || r.status === 'PAID');
  const paid = event.registrations.filter((r) => r.status === 'PAID');
  const absent = event.registrations.filter((r) => r.status === 'ABSENT');

  return {
    eventId: event.id,
    eventTitle: event.title,
    date: event.date,
    venue: event.venue,
    totalBudget: event.totalBudget,
    platformFee: event.platformFee,
    payoutPerStudent: event.payoutPerStudent,
    requiredStudents: event.requiredStudents,
    totalRegistered: event.registrations.length,
    totalAttended: attended.length,
    totalPaid: paid.length,
    totalAbsent: absent.length,
    totalDisbursed: paid.length * event.payoutPerStudent,
    budgetUtilized: paid.length * event.payoutPerStudent + event.platformFee,
    budgetRemaining: event.totalBudget - (paid.length * event.payoutPerStudent + event.platformFee),
    status: event.status,
  };
};

module.exports = {
  getAttendanceSheet,
  markAttendance,
  bulkMarkAttendance,
  finalizeAndDisburse,
  getPayoutSummary,
};
