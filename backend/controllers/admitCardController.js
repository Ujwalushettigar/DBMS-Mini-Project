const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllAdmitCards = async (req, res, next) => {
  try {
    if (req.user.role === 'candidate') {
      const candidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!candidate) return errorResponse(res, 'Candidate record not found.', 404);
      const cards = await supabaseService.getAdmitCardsByCandidateId(candidate.candidate_id);
      return successResponse(res, cards, 'Retrieved your admit cards.');
    }

    const cards = await supabaseService.getAllAdmitCards();
    return successResponse(res, cards, 'Retrieved all issued admit cards.');
  } catch (error) {
    next(error);
  }
};

const getMyAdmitCards = async (req, res, next) => {
  try {
    const candidate = await supabaseService.getCandidateByUserId(req.user.id);
    if (!candidate) return errorResponse(res, 'Candidate record not found.', 404);
    const cards = await supabaseService.getAdmitCardsByCandidateId(candidate.candidate_id);
    return successResponse(res, cards, 'Retrieved your admit cards.');
  } catch (error) {
    next(error);
  }
};

const getAdmitCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const card = await supabaseService.getAdmitCardById(id);
    if (!card) {
      return errorResponse(res, 'Admit card record not found.', 404);
    }

    if (req.user.role === 'candidate') {
      const candidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!candidate || card.application?.candidate_id !== candidate.candidate_id) {
        return errorResponse(res, 'Access denied. You cannot view another candidate admit card.', 403);
      }
    }

    return successResponse(res, card, 'Admit card details retrieved.');
  } catch (error) {
    next(error);
  }
};

const generateAdmitCard = async (req, res, next) => {
  try {
    const { application_id, reporting_time, examination_instructions } = req.body;

    if (!application_id) {
      return errorResponse(res, 'application_id is required.', 400);
    }

    const card = await supabaseService.generateAdmitCard({
      application_id,
      reporting_time: reporting_time || '08:30:00',
      examination_instructions
    });

    return successResponse(res, card, `Admit Card generated with Roll Number: ${card.roll_number}`, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdmitCards,
  getMyAdmitCards,
  getAdmitCardById,
  generateAdmitCard
};

