const express = require('express');
const router = express.Router();
const statsService = require('../services/statsService');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /api/stats/admin — Admin platform-wide stats
router.get('/admin', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const stats = await statsService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/stats/stakeholder — Stakeholder stats for their events
router.get('/stakeholder', authenticate, authorizeRoles('STAKEHOLDER'), async (req, res) => {
  try {
    const stats = await statsService.getStakeholderStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/stats/student — Student earnings and gig stats
router.get('/student', authenticate, authorizeRoles('STUDENT'), async (req, res) => {
  try {
    const stats = await statsService.getStudentStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
