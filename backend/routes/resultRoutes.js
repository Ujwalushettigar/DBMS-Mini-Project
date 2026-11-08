const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', resultController.getAllResults);
router.get('/my-results', authenticateToken, resultController.getMyResults);
router.get('/:id', authenticateToken, resultController.getResultById);
router.post('/', authenticateToken, requireAdmin, resultController.saveResult);
router.put('/:id/publish', authenticateToken, requireAdmin, resultController.publishResult);

module.exports = router;

