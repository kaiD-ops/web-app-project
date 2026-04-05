const express = require('express');
const router = express.Router();
const attendanceService = require('../services/attendanceService');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /api/attendance/:eventId — Get attendance sheet for an event (Admin)
router.get('/:eventId', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const result = await attendanceService.getAttendanceSheet(parseInt(req.params.eventId));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/attendance/:eventId/mark — Mark single student attendance (Admin)
router.patch('/:eventId/mark', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { studentId, isPresent } = req.body;
    if (studentId === undefined || isPresent === undefined) {
      return res.status(400).json({ success: false, message: 'studentId and isPresent are required' });
    }

    const registration = await attendanceService.markAttendance(
      parseInt(req.params.eventId),
      parseInt(studentId),
      Boolean(isPresent)
    );

    res.json({
      success: true,
      message: `Student marked as ${isPresent ? 'ATTENDED' : 'ABSENT'}`,
      data: registration,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/:eventId/bulk-mark — Bulk mark attendance (Admin)
router.post('/:eventId/bulk-mark', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { attendanceList } = req.body;
    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({ success: false, message: 'attendanceList array is required' });
    }

    const result = await attendanceService.bulkMarkAttendance(
      parseInt(req.params.eventId),
      attendanceList
    );

    res.json({ success: true, message: result.message, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/:eventId/finalize — Finalize attendance and disburse payments (Admin)
router.post('/:eventId/finalize', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const result = await attendanceService.finalizeAndDisburse(parseInt(req.params.eventId));
    res.json({ success: true, message: result.message, data: result.summary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/:eventId/payout-summary — Payout summary (Stakeholder/Admin)
router.get('/:eventId/payout-summary', authenticate, authorizeRoles('ADMIN', 'STAKEHOLDER'), async (req, res) => {
  try {
    const summary = await attendanceService.getPayoutSummary(
      parseInt(req.params.eventId),
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
