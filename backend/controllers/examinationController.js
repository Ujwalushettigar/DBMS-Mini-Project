const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllExaminations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const exams = await supabaseService.getAllExaminations({ status });
    return successResponse(res, exams, 'Retrieved examinations list.');
  } catch (error) {
    next(error);
  }
};

const getExaminationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await supabaseService.getExaminationById(id);
    if (!exam) {
      return errorResponse(res, 'Examination notice not found.', 404);
    }
    return successResponse(res, exam, 'Examination details retrieved.');
  } catch (error) {
    next(error);
  }
};

const createExamination = async (req, res, next) => {
  try {
    const {
      examination_code,
      examination_name,
      conducting_authority,
      description,
      eligibility_criteria,
      application_start_date,
      application_end_date,
      examination_date,
      application_fee = 0,
      total_vacancies,
      examination_status = 'draft'
    } = req.body;

    if (!examination_code || !examination_name || !conducting_authority || !application_start_date || !application_end_date || !examination_date || total_vacancies === undefined) {
      return errorResponse(res, 'Please provide all mandatory examination fields.', 400);
    }

    if (new Date(application_end_date) < new Date(application_start_date)) {
      return errorResponse(res, 'Application closing date must be on or after start date.', 400);
    }

    if (new Date(examination_date) < new Date(application_end_date)) {
      return errorResponse(res, 'Examination date must be scheduled on or after application closing date.', 400);
    }

    if (Number(total_vacancies) < 0) {
      return errorResponse(res, 'Total vacancies cannot be negative.', 400);
    }

    const newExam = await supabaseService.createExamination({
      examination_code,
      examination_name,
      conducting_authority,
      description,
      eligibility_criteria,
      application_start_date,
      application_end_date,
      examination_date,
      application_fee: Number(application_fee),
      total_vacancies: Number(total_vacancies),
      examination_status,
      created_by: req.user.id
    });

    return successResponse(res, newExam, 'Examination notification published successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const updateExamination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await supabaseService.updateExamination(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Examination notice not found.', 404);
    }
    return successResponse(res, updated, 'Examination updated successfully.');
  } catch (error) {
    next(error);
  }
};

const deleteExamination = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteExamination(id);
    return successResponse(res, null, 'Examination removed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExaminations,
  getExaminationById,
  createExamination,
  updateExamination,
  deleteExamination
};

