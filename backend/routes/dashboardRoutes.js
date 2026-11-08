const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireAdmin, requireCandidate } = require('../middleware/authMiddleware');

router.get('/admin', authenticateToken, requireAdmin, dashboardController.getAdminDashboard);
router.get('/candidate', authenticateToken, requireCandidate, dashboardController.getCandidateDashboard);

module.exports = router;

