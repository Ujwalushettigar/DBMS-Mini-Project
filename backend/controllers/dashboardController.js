const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAdminDashboard = async (req, res, next) => {
  try {
    const metrics = await supabaseService.getAdminMetrics();
    return successResponse(res, metrics, 'Admin dashboard KPI statistics loaded.');
  } catch (error) {
    next(error);
  }
};

const getCandidateDashboard = async (req, res, next) => {
  try {
    const candidate = await supabaseService.getCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, 'Candidate profile not found.', 404);
    }
    const metrics = await supabaseService.getCandidateMetrics(candidate.candidate_id);
    return successResponse(res, {
      ...metrics,
      candidate
    }, 'Candidate dashboard statistics loaded.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getCandidateDashboard
};

