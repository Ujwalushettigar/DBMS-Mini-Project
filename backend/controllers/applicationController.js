const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllApplications = async (req, res, next) => {
  try {
    const { examination_id, status } = req.query;

    if (req.user.role === 'candidate') {
      const candidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!candidate) return errorResponse(res, 'Candidate record not found.', 404);
      const applications = await supabaseService.getApplicationsByCandidateId(candidate.candidate_id);
      return successResponse(res, applications, 'Retrieved your applications.');
    }

    // Admin access
    const applications = await supabaseService.getAllApplications({ examination_id, status });
    return successResponse(res, applications, 'Retrieved all applications.');
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const candidate = await supabaseService.getCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, 'Candidate profile not found.', 404);
    }
    const applications = await supabaseService.getApplicationsByCandidateId(candidate.candidate_id);
    return successResponse(res, applications, 'Retrieved your examination applications.');
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await supabaseService.getApplicationById(id);
    if (!application) {
      return errorResponse(res, 'Application not found.', 404);
    }

    // Security check: Candidate can view only own application
    if (req.user.role === 'candidate') {
      const candidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!candidate || candidate.candidate_id !== application.candidate_id) {
        return errorResponse(res, 'Access denied. You cannot view another candidate application.', 403);
      }
    }

    return successResponse(res, application, 'Application details retrieved.');
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { examination_id, center_id } = req.body;

    if (!examination_id) {
      return errorResponse(res, 'examination_id is required.', 400);
    }

    // Candidate lookup
    const candidate = await supabaseService.getCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, 'You must register your candidate profile before submitting applications.', 400);
    }

    const application = await supabaseService.createApplication({
      candidate_id: candidate.candidate_id,
      examination_id,
      center_id
    });

    return successResponse(res, application, 'Application submitted successfully! Your application number has been registered.', 201);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { application_status, center_id, remarks } = req.body;

    const validStatuses = ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'];
    if (application_status && !validStatuses.includes(application_status)) {
      return errorResponse(res, `Invalid status. Allowed: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await supabaseService.updateApplicationStatus(id, {
      application_status,
      center_id,
      remarks
    });

    if (!updated) {
      return errorResponse(res, 'Application not found.', 404);
    }

    return successResponse(res, updated, `Application status updated to "${application_status}".`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApplications,
  getMyApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus
};

