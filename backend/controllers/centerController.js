const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllCenters = async (req, res, next) => {
  try {
    const centers = await supabaseService.getAllCenters();
    return successResponse(res, centers, 'Retrieved examination centers.');
  } catch (error) {
    next(error);
  }
};

const getCenterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const centers = await supabaseService.getAllCenters();
    const center = centers.find(c => c.center_id === id);
    if (!center) {
      return errorResponse(res, 'Exam center not found.', 404);
    }
    return successResponse(res, center, 'Exam center details retrieved.');
  } catch (error) {
    next(error);
  }
};

const createCenter = async (req, res, next) => {
  try {
    const { center_code, center_name, address, city, state, pincode, contact_number, total_capacity } = req.body;

    if (!center_code || !center_name || !address || !city || !state || !pincode || !total_capacity) {
      return errorResponse(res, 'All center details are mandatory.', 400);
    }

    if (Number(total_capacity) <= 0) {
      return errorResponse(res, 'Total capacity must be greater than zero.', 400);
    }

    const center = await supabaseService.createCenter({
      center_code,
      center_name,
      address,
      city,
      state,
      pincode,
      contact_number,
      total_capacity: Number(total_capacity)
    });

    return successResponse(res, center, 'Examination center created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const updateCenter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await supabaseService.updateCenter(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Exam center not found.', 404);
    }
    return successResponse(res, updated, 'Exam center updated successfully.');
  } catch (error) {
    next(error);
  }
};

const deleteCenter = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabaseService.deleteCenter(id);
    return successResponse(res, null, 'Exam center deleted successfully.');
  } catch (error) {
    next(error);
  }
};

const assignCenterToExam = async (req, res, next) => {
  try {
    const { examination_id, center_id, allocated_capacity } = req.body;

    if (!examination_id || !center_id || !allocated_capacity) {
      return errorResponse(res, 'examination_id, center_id, and allocated_capacity are required.', 400);
    }

    if (Number(allocated_capacity) <= 0) {
      return errorResponse(res, 'Allocated capacity must be greater than 0.', 400);
    }

    const assignment = await supabaseService.assignCenterToExam({
      examination_id,
      center_id,
      allocated_capacity: Number(allocated_capacity)
    });

    return successResponse(res, assignment, 'Center allocated to examination successfully.', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
  assignCenterToExam
};

