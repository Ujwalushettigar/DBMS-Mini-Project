const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, centerController.getAllCenters);
router.get('/:id', authenticateToken, centerController.getCenterById);
router.post('/', authenticateToken, requireAdmin, centerController.createCenter);
router.put('/:id', authenticateToken, requireAdmin, centerController.updateCenter);
router.delete('/:id', authenticateToken, requireAdmin, centerController.deleteCenter);
router.post('/assign', authenticateToken, requireAdmin, centerController.assignCenterToExam);

module.exports = router;

