const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllResults = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (req.user?.role === 'candidate') {
      const candidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!candidate) return errorResponse(res, 'Candidate record not found.', 404);
      const results = await supabaseService.getResultsByCandidateId(candidate.candidate_id);
      return successResponse(res, results, 'Retrieved your published results.');
    }

    const results = await supabaseService.getAllResults({ status });
    return successResponse(res, results, 'Retrieved results list.');
  } catch (error) {
    next(error);
  }
};

const getMyResults = async (req, res, next) => {
  try {
    const candidate = await supabaseService.getCandidateByUserId(req.user.id);
    if (!candidate) {
      return errorResponse(res, 'Candidate profile not found.', 404);
    }
    const results = await supabaseService.getResultsByCandidateId(candidate.candidate_id);
    return successResponse(res, results, 'Retrieved your examination scorecards.');
  } catch (error) {
    next(error);
  }
};

const getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await supabaseService.getResultById(id);
    if (!result) {
      return errorResponse(res, 'Result record not found.', 404);
    }

    if (req.user?.role === 'candidate') {
      const candidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!candidate || result.application?.candidate_id !== candidate.candidate_id) {
        return errorResponse(res, 'Access denied. You cannot view another candidate result.', 403);
      }
    }

    return successResponse(res, result, 'Scorecard retrieved.');
  } catch (error) {
    next(error);
  }
};

const saveResult = async (req, res, next) => {
  try {
    const { application_id, marks_obtained, maximum_marks = 100, rank, result_status = 'pass', remarks } = req.body;

    if (!application_id || marks_obtained === undefined) {
      return errorResponse(res, 'application_id and marks_obtained are required.', 400);
    }

    const marks = Number(marks_obtained);
    const maxMarks = Number(maximum_marks);

    if (isNaN(marks) || marks < 0) {
      return errorResponse(res, 'Marks obtained must be a positive number.', 400);
    }

    if (isNaN(maxMarks) || maxMarks <= 0) {
      return errorResponse(res, 'Maximum marks must be greater than zero.', 400);
    }

    if (marks > maxMarks) {
      return errorResponse(res, `Marks obtained (${marks}) cannot exceed maximum marks (${maxMarks}).`, 400);
    }

    const validStatuses = ['pass', 'fail', 'withheld'];
    if (!validStatuses.includes(result_status)) {
      return errorResponse(res, `Invalid result status. Allowed: ${validStatuses.join(', ')}`, 400);
    }

    const saved = await supabaseService.saveResult({
      application_id,
      marks_obtained: marks,
      maximum_marks: maxMarks,
      rank: rank ? Number(rank) : null,
      result_status,
      remarks
    });

    return successResponse(res, saved, 'Examination result saved successfully.');
  } catch (error) {
    next(error);
  }
};

const publishResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const published = await supabaseService.publishResult(id);
    if (!published) {
      return errorResponse(res, 'Result not found.', 404);
    }
    return successResponse(res, published, 'Examination result published to candidate.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResults,
  getMyResults,
  getResultById,
  saveResult,
  publishResult
};

