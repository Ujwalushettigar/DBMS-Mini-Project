const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'grems_academic_secure_jwt_secret_key_2026';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return errorResponse(
      res,
      'Authentication token missing.',
      401
    );
  }

  if (isSupabaseConfigured()) {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return errorResponse(
          res,
          'Invalid or expired Supabase session.',
          401
        );
      }

      const {
        data: profile,
        error: profileError
      } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          '[GREMS] Profile verification failed:',
          profileError.message
        );

        return errorResponse(
          res,
          'Unable to verify user permissions.',
          503
        );
      }

      if (!profile) {
        return errorResponse(
          res,
          'User profile not found.',
          403
        );
      }

      if (!['admin', 'candidate'].includes(profile.role)) {
        return errorResponse(
          res,
          'Invalid user role.',
          403
        );
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: profile.role
      };

      return next();

    } catch (error) {
      console.error(
        '[GREMS] Supabase authentication error:',
        error.message
      );

      return errorResponse(
        res,
        'Authentication service unavailable.',
        503
      );
    }
  }

  // Local JWT is permitted only in explicit local mode.
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return errorResponse(
      res,
      'Invalid or expired local session.',
      401
    );
  }
};

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden. Access requires [${allowedRoles.join(' / ')}] role privileges.`,
        403
      );
    }
    next();
  };
};

const requireAdmin = requireRole(['admin']);
const requireCandidate = requireRole(['candidate']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireCandidate
};
