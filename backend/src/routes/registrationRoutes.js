const express = require('express');
const router = express.Router();
const registrationService = require('../services/registrationService');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// POST /api/registrations — Student registers for an event
router.post('/', authenticate, authorizeRoles('STUDENT'), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ success: false, message: 'eventId is required' });

    const registration = await registrationService.registerForEvent(req.user.id, parseInt(eventId));
    res.status(201).json({
      success: true,
      message: 'Successfully registered for event. You will be notified 1 hour and 10 minutes before.',
      data: registration,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/registrations/my-gigs — Student views their gigs
router.get('/my-gigs', authenticate, authorizeRoles('STUDENT'), async (req, res) => {
  try {
    const gigs = await registrationService.getStudentGigs(req.user.id);
    res.json({ success: true, count: gigs.length, data: gigs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/registrations/event/:eventId — All registrations for an event (Stakeholder/Admin)
router.get('/event/:eventId', authenticate, authorizeRoles('STAKEHOLDER', 'ADMIN'), async (req, res) => {
  try {
    const registrations = await registrationService.getEventRegistrations(
      parseInt(req.params.eventId),
      req.user.id,
      req.user.role
    );
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/registrations/:id — Single registration detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const registration = await registrationService.getRegistrationById(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// DELETE /api/registrations/:eventId — Student cancels registration
router.delete('/:eventId', authenticate, authorizeRoles('STUDENT'), async (req, res) => {
  try {
    const result = await registrationService.cancelRegistration(
      req.user.id,
      parseInt(req.params.eventId)
    );
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
