const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllCandidates = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const candidates = await supabaseService.getAllCandidates({ category, search });
    return successResponse(res, candidates, 'Retrieved all candidate records.');
  } catch (error) {
    next(error);
  }
};

const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Security: Candidate can view only their own record, admin can view all
    if (req.user.role === 'candidate') {
      const selfCandidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!selfCandidate || selfCandidate.candidate_id !== id) {
        return errorResponse(res, 'Access denied. You can only view your own candidate record.', 403);
      }
    }

    const candidate = await supabaseService.getCandidateById(id);
    if (!candidate) {
      return errorResponse(res, 'Candidate record not found.', 404);
    }
    return successResponse(res, candidate, 'Candidate details retrieved.');
  } catch (error) {
    next(error);
  }
};

const getMyCandidateProfile = async (req, res, next) => {
  try {
    const candidate = await supabaseService.getCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, 'No candidate profile linked to this user account.', 404);
    }
    return successResponse(res, candidate, 'Candidate profile retrieved.');
  } catch (error) {
    next(error);
  }
};

const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Security check
    if (req.user.role === 'candidate') {
      const selfCandidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!selfCandidate || selfCandidate.candidate_id !== id) {
        return errorResponse(res, 'Unauthorized to update another candidate profile.', 403);
      }
    }

    const updated = await supabaseService.updateCandidate(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Candidate record not found.', 404);
    }
    return successResponse(res, updated, 'Candidate profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteCandidate(id);
    return successResponse(res, null, 'Candidate profile deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  getMyCandidateProfile,
  updateCandidate,
  deleteCandidate
};

