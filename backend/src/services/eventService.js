const prisma = require('../prismaClient');

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 10;

const calculatePayout = (totalBudget, requiredStudents) => {
  const platformFee = (PLATFORM_FEE_PERCENT / 100) * totalBudget;
  const netBudget = totalBudget - platformFee;
  const payoutPerStudent = netBudget / requiredStudents;
  return { platformFee, payoutPerStudent };
};

// Create a new event (Stakeholder only)
const createEvent = async (stakeholderId, data) => {
  const { title, description, date, duration, venue, requiredStudents, totalBudget, subEvents } = data;

  if (requiredStudents <= 0) throw new Error('Required students must be greater than 0');
  if (totalBudget <= 0) throw new Error('Total budget must be greater than 0');

  const { platformFee, payoutPerStudent } = calculatePayout(totalBudget, requiredStudents);

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      duration,
      venue,
      requiredStudents,
      totalBudget,
      platformFee,
      payoutPerStudent,
      stakeholderId,
      subEvents: subEvents && subEvents.length > 0
        ? {
            create: subEvents.map((se) => ({
              title: se.title,
              description: se.description || null,
              startTime: new Date(se.startTime),
              endTime: new Date(se.endTime),
              speaker: se.speaker || null,
            })),
          }
        : undefined,
    },
    include: {
      subEvents: true,
      stakeholder: { select: { id: true, name: true, email: true } },
    },
  });

  return event;
};

// Get all open events (Students see this)
const getAllOpenEvents = async () => {
  return prisma.event.findMany({
    where: { status: 'OPEN' },
    include: {
      stakeholder: { select: { id: true, name: true } },
      subEvents: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { date: 'asc' },
  });
};

// Get all events (Admin sees all)
const getAllEvents = async () => {
  return prisma.event.findMany({
    include: {
      stakeholder: { select: { id: true, name: true, email: true } },
      subEvents: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { date: 'asc' },
  });
};

// Get events created by a specific stakeholder
const getStakeholderEvents = async (stakeholderId) => {
  return prisma.event.findMany({
    where: { stakeholderId },
    include: {
      subEvents: true,
      registrations: {
        include: { student: { select: { id: true, name: true, erpId: true } } },
      },
      _count: { select: { registrations: true } },
    },
    orderBy: { date: 'desc' },
  });
};

// Get single event by ID
const getEventById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      stakeholder: { select: { id: true, name: true, email: true } },
      subEvents: true,
      _count: { select: { registrations: true } },
    },
  });
  if (!event) throw new Error('Event not found');
  return event;
};

// Update event (Stakeholder only, only if PENDING or OPEN)
const updateEvent = async (eventId, stakeholderId, data) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.stakeholderId !== stakeholderId) throw new Error('Not authorized to update this event');
  if (!['PENDING', 'OPEN'].includes(event.status)) {
    throw new Error('Cannot update an event that is already ongoing or completed');
  }

  const updatedBudget = data.totalBudget || event.totalBudget;
  const updatedStudents = data.requiredStudents || event.requiredStudents;
  const { platformFee, payoutPerStudent } = calculatePayout(updatedBudget, updatedStudents);

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title || event.title,
      description: data.description || event.description,
      date: data.date ? new Date(data.date) : event.date,
      duration: data.duration || event.duration,
      venue: data.venue || event.venue,
      requiredStudents: updatedStudents,
      totalBudget: updatedBudget,
      platformFee,
      payoutPerStudent,
      status: data.status || event.status,
    },
    include: { subEvents: true },
  });

  return updated;
};

// Delete event (Stakeholder only, only if PENDING)
const deleteEvent = async (eventId, stakeholderId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.stakeholderId !== stakeholderId) throw new Error('Not authorized to delete this event');
  if (event.status !== 'PENDING') {
    throw new Error('Only pending events can be deleted');
  }

  await prisma.event.delete({ where: { id: eventId } });
  return { message: 'Event deleted successfully' };
};

// Admin approves event (PENDING -> OPEN)
const approveEvent = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.status !== 'PENDING') throw new Error('Only pending events can be approved');

  return prisma.event.update({
    where: { id: eventId },
    data: { status: 'OPEN' },
  });
};

// Admin marks event as awaiting verification (OPEN -> AWAITING_VERIFICATION)
const markEventForVerification = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (!['OPEN', 'ONGOING'].includes(event.status)) {
    throw new Error('Event must be open or ongoing to mark for verification');
  }

  return prisma.event.update({
    where: { id: eventId },
    data: { status: 'AWAITING_VERIFICATION' },
  });
};

// Sub-event CRUD
const addSubEvent = async (eventId, stakeholderId, data) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.stakeholderId !== stakeholderId) throw new Error('Not authorized');

  return prisma.subEvent.create({
    data: {
      title: data.title,
      description: data.description || null,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      speaker: data.speaker || null,
      eventId,
    },
  });
};

const updateSubEvent = async (subEventId, stakeholderId, data) => {
  const subEvent = await prisma.subEvent.findUnique({
    where: { id: subEventId },
    include: { event: true },
  });
  if (!subEvent) throw new Error('Sub-event not found');
  if (subEvent.event.stakeholderId !== stakeholderId) throw new Error('Not authorized');

  return prisma.subEvent.update({
    where: { id: subEventId },
    data: {
      title: data.title || subEvent.title,
      description: data.description ?? subEvent.description,
      startTime: data.startTime ? new Date(data.startTime) : subEvent.startTime,
      endTime: data.endTime ? new Date(data.endTime) : subEvent.endTime,
      speaker: data.speaker ?? subEvent.speaker,
    },
  });
};

const deleteSubEvent = async (subEventId, stakeholderId) => {
  const subEvent = await prisma.subEvent.findUnique({
    where: { id: subEventId },
    include: { event: true },
  });
  if (!subEvent) throw new Error('Sub-event not found');
  if (subEvent.event.stakeholderId !== stakeholderId) throw new Error('Not authorized');

  await prisma.subEvent.delete({ where: { id: subEventId } });
  return { message: 'Sub-event deleted successfully' };
};

module.exports = {
  createEvent,
  getAllOpenEvents,
  getAllEvents,
  getStakeholderEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  markEventForVerification,
  addSubEvent,
  updateSubEvent,
  deleteSubEvent,
};
