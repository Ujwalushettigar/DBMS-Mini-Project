const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getQualifications = async (req, res, next) => {
  try {
    let candidateId = req.query.candidate_id;

    if (req.user.role === 'candidate') {
      const selfCandidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!selfCandidate) {
        return errorResponse(res, 'Candidate record not found.', 404);
      }
      candidateId = selfCandidate.candidate_id;
    }

    if (!candidateId) {
      return errorResponse(res, 'candidate_id parameter is required.', 400);
    }

    const qualifications = await supabaseService.getQualificationsByCandidateId(candidateId);
    return successResponse(res, qualifications, 'Retrieved educational qualifications.');
  } catch (error) {
    next(error);
  }
};

const addQualification = async (req, res, next) => {
  try {
    let { candidate_id, qualification_level, institution_name, board_or_university, passing_year, percentage } = req.body;

    if (req.user.role === 'candidate') {
      const selfCandidate = await supabaseService.getCandidateByUserId(req.user.id);
      if (!selfCandidate) return errorResponse(res, 'Candidate profile not found.', 404);
      candidate_id = selfCandidate.candidate_id;
    }

    if (!candidate_id || !qualification_level || !institution_name || !board_or_university || !passing_year || percentage === undefined) {
      return errorResponse(res, 'All qualification fields are mandatory.', 400);
    }

    const validLevels = ['SSLC', 'PUC', 'Diploma', 'Undergraduate', 'Postgraduate', 'Other'];
    if (!validLevels.includes(qualification_level)) {
      return errorResponse(res, `Invalid qualification level. Allowed: ${validLevels.join(', ')}`, 400);
    }

    const pct = Number(percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return errorResponse(res, 'Percentage must be between 0.00 and 100.00.', 400);
    }

    const year = Number(passing_year);
    if (isNaN(year) || year < 1960 || year > 2035) {
      return errorResponse(res, 'Passing year must be between 1960 and 2035.', 400);
    }

    const qualification = await supabaseService.addQualification({
      candidate_id,
      qualification_level,
      institution_name,
      board_or_university,
      passing_year: year,
      percentage: pct
    });

    return successResponse(res, qualification, 'Educational qualification added successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const updateQualification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await supabaseService.updateQualification(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Qualification record not found.', 404);
    }
    return successResponse(res, updated, 'Educational qualification updated successfully.');
  } catch (error) {
    next(error);
  }
};

const deleteQualification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteQualification(id);
    return successResponse(res, null, 'Educational qualification deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQualifications,
  addQualification,
  updateQualification,
  deleteQualification
};

