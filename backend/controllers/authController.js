const jwt = require('jsonwebtoken');
const supabaseService = require('../services/supabaseService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'grems_academic_secure_jwt_secret_key_2026';

const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      full_name,
      date_of_birth,
      gender,
      phone_number,
      address,
      city,
      state,
      pincode,
      category = 'General'
    } = req.body;

    if (!email || !password || !full_name || !date_of_birth || !gender || !phone_number || !address || !city || !state || !pincode) {
      return errorResponse(res, 'All candidate registration fields are mandatory.', 400);
    }

    // Security: Check if email already exists
    const existing = await supabaseService.findProfileByEmail(email);
    if (existing) {
      return errorResponse(res, 'An account with this email address already exists.', 409);
    }

    // Register candidate (role is ALWAYS 'candidate' - admin accounts cannot be self-registered)
    const { user, candidate } = await supabaseService.createCandidateWithProfile(
      { email, password, role: 'candidate' },
      {
        full_name,
        date_of_birth,
        gender,
        phone_number,
        address,
        city,
        state,
        pincode,
        category
      }
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        candidate_id: candidate.candidate_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          candidate_id: candidate.candidate_id,
          candidate_number: candidate.candidate_number,
          full_name: candidate.full_name
        }
      },
      'Candidate registration completed successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    // 1. Supabase Auth if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user) {
        return errorResponse(res, error ? error.message : 'Invalid credentials.', 401);
      }

      const profile = await supabaseService.findProfileById(data.user.id);
      let candidate = null;
      if (profile?.role === 'candidate') {
        candidate = await supabaseService.getCandidateByUserId(data.user.id);
      }

      return successResponse(res, {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile ? profile.role : 'candidate',
          candidate_id: candidate ? candidate.candidate_id : null,
          candidate_number: candidate ? candidate.candidate_number : null,
          full_name: candidate ? candidate.full_name : 'Administrator'
        }
      }, 'Authentication successful.');
    }

    // 2. Local fallback evaluation mode
    const profile = await supabaseService.findProfileByEmail(email);
    if (!profile) {
      return errorResponse(res, 'User not found with provided email address.', 401);
    }

    let candidate = null;
    if (profile.role === 'candidate') {
      candidate = await supabaseService.getCandidateByUserId(profile.id);
    }

    const token = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        candidate_id: candidate ? candidate.candidate_id : null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        candidate_id: candidate ? candidate.candidate_id : null,
        candidate_number: candidate ? candidate.candidate_number : null,
        full_name: candidate ? candidate.full_name : 'Government Administrator'
      }
    }, 'Signed in successfully.');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    return successResponse(res, null, 'Signed out successfully.');
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const profile = await supabaseService.findProfileById(req.user.id);
    if (!profile) {
      return errorResponse(res, 'User session not found.', 404);
    }

    let candidate = null;
    if (profile.role === 'candidate') {
      candidate = await supabaseService.getCandidateByUserId(profile.id);
    }

    return successResponse(res, {
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        candidate_id: candidate ? candidate.candidate_id : null,
        candidate_number: candidate ? candidate.candidate_number : null,
        full_name: candidate ? candidate.full_name : 'Administrator'
      },
      candidate
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};

