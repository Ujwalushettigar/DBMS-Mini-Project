const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, applicationController.getAllApplications);
router.get('/my-applications', authenticateToken, applicationController.getMyApplications);
router.get('/:id', authenticateToken, applicationController.getApplicationById);
router.post('/', authenticateToken, applicationController.createApplication);
router.put('/:id/status', authenticateToken, requireAdmin, applicationController.updateApplicationStatus);

module.exports = router;

