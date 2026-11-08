const express = require('express');
const router = express.Router();
const admitCardController = require('../controllers/admitCardController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, admitCardController.getAllAdmitCards);
router.get('/my-cards', authenticateToken, admitCardController.getMyAdmitCards);
router.get('/:id', authenticateToken, admitCardController.getAdmitCardById);
router.post('/generate', authenticateToken, requireAdmin, admitCardController.generateAdmitCard);

module.exports = router;

