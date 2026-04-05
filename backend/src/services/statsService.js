const prisma = require('../prismaClient');

// Admin dashboard stats
const getAdminStats = async () => {
  const [totalUsers, totalEvents, totalRegistrations, totalDisbursed] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.registration.aggregate({
      where: { status: 'PAID' },
      _count: true,
    }),
  ]);

  const userBreakdown = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  });

  const eventBreakdown = await prisma.event.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const completedEvents = await prisma.event.findMany({
    where: { status: 'COMPLETED' },
    select: { payoutPerStudent: true, registrations: { where: { status: 'PAID' } } },
  });

  const totalAmountDisbursed = completedEvents.reduce((sum, event) => {
    return sum + event.registrations.length * event.payoutPerStudent;
  }, 0);

  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      stakeholder: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
  });

  return {
    overview: {
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalPaidRegistrations: totalDisbursed._count,
      totalAmountDisbursed,
    },
    userBreakdown: userBreakdown.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {}),
    eventBreakdown: eventBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
    recentEvents,
  };
};

// Stakeholder dashboard stats
const getStakeholderStats = async (stakeholderId) => {
  const events = await prisma.event.findMany({
    where: { stakeholderId },
    include: {
      registrations: true,
      _count: { select: { registrations: true } },
    },
  });

  const totalBudgetAllocated = events.reduce((s, e) => s + e.totalBudget, 0);
  const totalDisbursed = events.reduce((s, e) => {
    const paidCount = e.registrations.filter((r) => r.status === 'PAID').length;
    return s + paidCount * e.payoutPerStudent;
  }, 0);

  const statusBreakdown = events.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    totalBudgetAllocated,
    totalDisbursed,
    statusBreakdown,
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      status: e.status,
      registered: e._count.registrations,
      required: e.requiredStudents,
      fillRate: `${Math.round((e._count.registrations / e.requiredStudents) * 100)}%`,
    })),
  };
};

// Student dashboard stats
const getStudentStats = async (studentId) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { walletBalance: true, name: true, erpId: true },
  });

  const registrations = await prisma.registration.findMany({
    where: { studentId },
    include: {
      event: { select: { id: true, title: true, date: true, payoutPerStudent: true, status: true } },
    },
  });

  const totalEarned = registrations
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + r.event.payoutPerStudent, 0);

  const statusBreakdown = registrations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const upcoming = registrations.filter(
    (r) => r.status === 'REGISTERED' && new Date(r.event.date) > new Date()
  );

  return {
    student,
    overview: {
      totalGigs: registrations.length,
      totalEarned,
      walletBalance: student.walletBalance,
      upcomingGigs: upcoming.length,
    },
    statusBreakdown,
    upcomingGigs: upcoming.map((r) => ({
      eventId: r.event.id,
      title: r.event.title,
      date: r.event.date,
      payout: r.event.payoutPerStudent,
    })),
  };
};

module.exports = { getAdminStats, getStakeholderStats, getStudentStats };
