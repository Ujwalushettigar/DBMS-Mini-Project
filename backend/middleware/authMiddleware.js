const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'grems_academic_secure_jwt_secret_key_2026';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return errorResponse(res, 'Access denied. Authentication token missing.', 401);
  }

  // 1. If Supabase is configured, verify with Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return errorResponse(res, 'Invalid or expired session token.', 401);
      }

      // Fetch user profile role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      req.user = {
        id: user.id,
        email: user.email,
        role: profile ? profile.role : 'candidate'
      };
      return next();
    } catch (err) {
      console.warn('[GREMS Auth] Supabase token verification failed, falling back to local JWT:', err.message);
    }
  }

  // 2. Standard JWT token verification (local/offline development mode)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired session token. Please sign in again.', 401);
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

