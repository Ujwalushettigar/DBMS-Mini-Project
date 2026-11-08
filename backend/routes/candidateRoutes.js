const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, candidateController.getMyCandidateProfile);
router.get('/', authenticateToken, requireAdmin, candidateController.getAllCandidates);
router.get('/:id', authenticateToken, candidateController.getCandidateById);
router.put('/:id', authenticateToken, candidateController.updateCandidate);
router.delete('/:id', authenticateToken, requireAdmin, candidateController.deleteCandidate);

module.exports = router;

