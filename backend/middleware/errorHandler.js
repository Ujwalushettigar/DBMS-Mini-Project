const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('[GREMS Server Error]:', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = errorHandler;

