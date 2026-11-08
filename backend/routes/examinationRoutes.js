const express = require('express');
const router = express.Router();
const examinationController = require('../controllers/examinationController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', examinationController.getAllExaminations);
router.get('/:id', examinationController.getExaminationById);
router.post('/', authenticateToken, requireAdmin, examinationController.createExamination);
router.put('/:id', authenticateToken, requireAdmin, examinationController.updateExamination);
router.delete('/:id', authenticateToken, requireAdmin, examinationController.deleteExamination);

module.exports = router;

