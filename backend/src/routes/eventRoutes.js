const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /api/events — All open events (Students browse)
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await eventService.getAllOpenEvents();
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/all — All events regardless of status (Admin only)
router.get('/all', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/my — Events created by the logged-in stakeholder
router.get('/my', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const events = await eventService.getStakeholderEvents(req.user.id);
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/:id — Single event details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await eventService.getEventById(parseInt(req.params.id));
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/events — Create event (Stakeholder only)
router.post('/', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const event = await eventService.createEvent(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Event created and pending approval', data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/events/:id — Update event (Stakeholder only)
router.put('/:id', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const event = await eventService.updateEvent(parseInt(req.params.id), req.user.id, req.body);
    res.json({ success: true, message: 'Event updated successfully', data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/:id — Delete event (Stakeholder only)
router.delete('/:id', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const result = await eventService.deleteEvent(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/events/:id/approve — Admin approves event
router.patch('/:id/approve', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const event = await eventService.approveEvent(parseInt(req.params.id));
    res.json({ success: true, message: 'Event approved and now open for registration', data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/events/:id/close — Admin marks event for verification
router.patch('/:id/close', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const event = await eventService.markEventForVerification(parseInt(req.params.id));
    res.json({ success: true, message: 'Event closed. Ready for attendance verification.', data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/events/:id/sub-events — Add sub-event (Stakeholder)
router.post('/:id/sub-events', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const subEvent = await eventService.addSubEvent(parseInt(req.params.id), req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Sub-event added', data: subEvent });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/events/sub-events/:subId — Update sub-event
router.put('/sub-events/:subId', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const subEvent = await eventService.updateSubEvent(parseInt(req.params.subId), req.user.id, req.body);
    res.json({ success: true, message: 'Sub-event updated', data: subEvent });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/sub-events/:subId — Delete sub-event
router.delete('/sub-events/:subId', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const result = await eventService.deleteSubEvent(parseInt(req.params.subId), req.user.id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
