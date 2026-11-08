const { supabase, isSupabaseConfigured } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const {
  generateCandidateNumber,
  generateApplicationNumber,
  generateAdmitCardNumber,
  generateRollNumber
} = require('../utils/generators');

// Initial seed data reflecting the 9-table schema
const mockDatabase = {
  profiles: [
    {
      id: 'a1000000-0000-0000-0000-000000000001',
      email: 'admin.recruitment@gov.in',
      role: 'admin',
      created_at: '2026-01-01T09:00:00Z',
      updated_at: '2026-01-01T09:00:00Z'
    },
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      email: 'rohan.sharma@example.com',
      role: 'candidate',
      created_at: '2026-01-05T10:00:00Z',
      updated_at: '2026-01-05T10:00:00Z'
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      email: 'priya.patel@example.com',
      role: 'candidate',
      created_at: '2026-01-06T11:30:00Z',
      updated_at: '2026-01-06T11:30:00Z'
    },
    {
      id: 'c1000000-0000-0000-0000-000000000003',
      email: 'amit.verma@example.com',
      role: 'candidate',
      created_at: '2026-01-07T14:15:00Z',
      updated_at: '2026-01-07T14:15:00Z'
    }
  ],
  candidates: [
    {
      candidate_id: 'd1000000-0000-0000-0000-000000000001',
      user_id: 'c1000000-0000-0000-0000-000000000001',
      candidate_number: 'CND-2026-1001',
      full_name: 'Rohan Sharma',
      date_of_birth: '1998-04-12',
      gender: 'Male',
      phone_number: '9811223344',
      address: 'Flat 402, Shanti Vihar, Sector 15',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      category: 'General',
      created_at: '2026-01-05T10:05:00Z',
      updated_at: '2026-01-05T10:05:00Z'
    },
    {
      candidate_id: 'd1000000-0000-0000-0000-000000000002',
      user_id: 'c1000000-0000-0000-0000-000000000002',
      candidate_number: 'CND-2026-1002',
      full_name: 'Priya Patel',
      date_of_birth: '1999-07-25',
      gender: 'Female',
      phone_number: '9822334455',
      address: '34, 4th Cross, Malleshwaram',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560003',
      category: 'OBC',
      created_at: '2026-01-06T11:35:00Z',
      updated_at: '2026-01-06T11:35:00Z'
    },
    {
      candidate_id: 'd1000000-0000-0000-0000-000000000003',
      user_id: 'c1000000-0000-0000-0000-000000000003',
      candidate_number: 'CND-2026-1003',
      full_name: 'Amit Verma',
      date_of_birth: '1997-11-19',
      gender: 'Male',
      phone_number: '9833445566',
      address: 'Flat 102, Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      category: 'SC',
      created_at: '2026-01-07T14:20:00Z',
      updated_at: '2026-01-07T14:20:00Z'
    }
  ],
  educational_qualifications: [
    {
      qualification_id: 'q1000000-0000-0000-0000-000000000001',
      candidate_id: 'd1000000-0000-0000-0000-000000000001',
      qualification_level: 'SSLC',
      institution_name: 'Delhi Public School, RK Puram',
      board_or_university: 'CBSE',
      passing_year: 2014,
      percentage: 91.50,
      created_at: '2026-01-05T10:10:00Z'
    },
    {
      qualification_id: 'q1000000-0000-0000-0000-000000000002',
      candidate_id: 'd1000000-0000-0000-0000-000000000001',
      qualification_level: 'Undergraduate',
      institution_name: 'Delhi Technological University',
      board_or_university: 'DTU',
      passing_year: 2020,
      percentage: 84.20,
      created_at: '2026-01-05T10:12:00Z'
    },
    {
      qualification_id: 'q1000000-0000-0000-0000-000000000003',
      candidate_id: 'd1000000-0000-0000-0000-000000000002',
      qualification_level: 'Undergraduate',
      institution_name: 'Indian Statistical Institute',
      board_or_university: 'ISI Kolkata',
      passing_year: 2021,
      percentage: 88.00,
      created_at: '2026-01-06T11:40:00Z'
    }
  ],
  examinations: [
    {
      examination_id: 'e1000000-0000-0000-0000-000000000001',
      examination_code: 'SSC-CGL-2026',
      examination_name: 'Combined Graduate Level Examination 2026',
      conducting_authority: 'Staff Selection Commission',
      description: 'Nationwide recruitment for Group B and Group C non-technical posts across Ministries of India.',
      eligibility_criteria: 'Graduation from any recognized university. Age between 18 and 32 years.',
      application_start_date: '2026-01-15',
      application_end_date: '2026-04-15',
      examination_date: '2026-06-20',
      application_fee: 100.00,
      total_vacancies: 8400,
      examination_status: 'published',
      created_by: 'a1000000-0000-0000-0000-000000000001',
      created_at: '2026-01-10T09:00:00Z',
      updated_at: '2026-01-10T09:00:00Z'
    },
    {
      examination_id: 'e1000000-0000-0000-0000-000000000002',
      examination_code: 'UPSC-CSE-2026',
      examination_name: 'Civil Services (Preliminary) Examination 2026',
      conducting_authority: 'Union Public Service Commission',
      description: 'Premier national competitive examination for IAS, IPS, and IFS cadres.',
      eligibility_criteria: 'Bachelors Degree in any discipline. Age limit 21 to 32 years.',
      application_start_date: '2026-02-01',
      application_end_date: '2026-03-31',
      examination_date: '2026-05-24',
      application_fee: 100.00,
      total_vacancies: 1056,
      examination_status: 'published',
      created_by: 'a1000000-0000-0000-0000-000000000001',
      created_at: '2026-01-12T10:00:00Z',
      updated_at: '2026-01-12T10:00:00Z'
    },
    {
      examination_id: 'e1000000-0000-0000-0000-000000000003',
      examination_code: 'RRB-NTPC-2026',
      examination_name: 'Non-Technical Popular Categories (NTPC)',
      conducting_authority: 'Railway Recruitment Control Board',
      description: 'Recruitment of Station Master, Commercial Clerk, and Goods Guard across 21 railway divisions.',
      eligibility_criteria: '12th Standard or Bachelor Degree depending on category.',
      application_start_date: '2026-01-10',
      application_end_date: '2026-03-20',
      examination_date: '2026-05-15',
      application_fee: 250.00,
      total_vacancies: 11558,
      examination_status: 'completed',
      created_by: 'a1000000-0000-0000-0000-000000000001',
      created_at: '2026-01-05T08:30:00Z',
      updated_at: '2026-01-05T08:30:00Z'
    }
  ],
  exam_centers: [
    {
      center_id: 'f1000000-0000-0000-0000-000000000001',
      center_code: 'DEL-KV-101',
      center_name: 'Kendriya Vidyalaya No. 1 Delhi Cantt',
      address: 'Sadhu Vaswani Marg, Delhi Cantt, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110010',
      contact_number: '011-25691234',
      total_capacity: 600,
      created_at: '2026-01-02T10:00:00Z'
    },
    {
      center_id: 'f1000000-0000-0000-0000-000000000002',
      center_code: 'BLR-GAC-201',
      center_name: 'Government Arts and Science College',
      address: 'Post Office Road, K.R. Circle, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      contact_number: '080-22214567',
      total_capacity: 500,
      created_at: '2026-01-02T10:30:00Z'
    },
    {
      center_id: 'f1000000-0000-0000-0000-000000000003',
      center_code: 'LKO-NP-301',
      center_name: 'National Post Graduate College',
      address: '2 Rana Pratap Marg, Hazratganj, Lucknow',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      contact_number: '0522-2612345',
      total_capacity: 450,
      created_at: '2026-01-02T11:00:00Z'
    }
  ],
  examination_centers: [
    {
      examination_id: 'e1000000-0000-0000-0000-000000000001',
      center_id: 'f1000000-0000-0000-0000-000000000001',
      allocated_capacity: 400,
      created_at: '2026-01-10T10:00:00Z'
    },
    {
      examination_id: 'e1000000-0000-0000-0000-000000000001',
      center_id: 'f1000000-0000-0000-0000-000000000002',
      allocated_capacity: 350,
      created_at: '2026-01-10T10:00:00Z'
    },
    {
      examination_id: 'e1000000-0000-0000-0000-000000000002',
      center_id: 'f1000000-0000-0000-0000-000000000001',
      allocated_capacity: 500,
      created_at: '2026-01-12T10:30:00Z'
    },
    {
      examination_id: 'e1000000-0000-0000-0000-000000000003',
      center_id: 'f1000000-0000-0000-0000-000000000003',
      allocated_capacity: 450,
      created_at: '2026-01-05T09:00:00Z'
    }
  ],
  applications: [
    {
      application_id: 'b1000000-0000-0000-0000-000000000001',
      application_number: 'APP-2026-0001',
      candidate_id: 'd1000000-0000-0000-0000-000000000001',
      examination_id: 'e1000000-0000-0000-0000-000000000001',
      center_id: 'f1000000-0000-0000-0000-000000000001',
      applied_at: '2026-01-20T10:15:00Z',
      application_status: 'accepted',
      payment_status: 'paid',
      remarks: 'Application documents and identity verified.',
      updated_at: '2026-01-22T14:00:00Z'
    },
    {
      application_id: 'b1000000-0000-0000-0000-000000000002',
      application_number: 'APP-2026-0002',
      candidate_id: 'd1000000-0000-0000-0000-000000000002',
      examination_id: 'e1000000-0000-0000-0000-000000000001',
      center_id: 'f1000000-0000-0000-0000-000000000002',
      applied_at: '2026-01-22T11:20:00Z',
      application_status: 'accepted',
      payment_status: 'paid',
      remarks: 'Eligibility confirmed.',
      updated_at: '2026-01-23T16:00:00Z'
    },
    {
      application_id: 'b1000000-0000-0000-0000-000000000003',
      application_number: 'APP-2026-0003',
      candidate_id: 'd1000000-0000-0000-0000-000000000003',
      examination_id: 'e1000000-0000-0000-0000-000000000003',
      center_id: 'f1000000-0000-0000-0000-000000000003',
      applied_at: '2026-01-25T14:00:00Z',
      application_status: 'accepted',
      payment_status: 'paid',
      remarks: 'Approved for RRB examination.',
      updated_at: '2026-01-26T10:00:00Z'
    }
  ],
  admit_cards: [
    {
      admit_card_id: 'ac000000-0000-0000-0000-000000000001',
      application_id: 'b1000000-0000-0000-0000-000000000001',
      admit_card_number: 'AC-2026-0001',
      roll_number: 'ROLL-SSCCGL-10001',
      issue_date: '2026-05-15',
      reporting_time: '08:30:00',
      examination_instructions: '1. Bring original Government Photo ID.\n2. Carry printed Admit Card.\n3. Electronic items are strictly prohibited.',
      admit_card_file_url: null,
      created_at: '2026-05-15T09:00:00Z'
    },
    {
      admit_card_id: 'ac000000-0000-0000-0000-000000000002',
      application_id: 'b1000000-0000-0000-0000-000000000002',
      admit_card_number: 'AC-2026-0002',
      roll_number: 'ROLL-SSCCGL-10002',
      issue_date: '2026-05-15',
      reporting_time: '08:30:00',
      examination_instructions: '1. Bring original Government Photo ID.\n2. Carry printed Admit Card.',
      admit_card_file_url: null,
      created_at: '2026-05-15T09:00:00Z'
    }
  ],
  results: [
    {
      result_id: 'r1000000-0000-0000-0000-000000000001',
      application_id: 'b1000000-0000-0000-0000-000000000003',
      marks_obtained: 88.50,
      maximum_marks: 100.00,
      rank: 2,
      result_status: 'pass',
      published_at: '2026-06-01T10:00:00Z',
      remarks: 'Selected in top merit list for Station Master.',
      created_at: '2026-06-01T09:30:00Z'
    }
  ]
};

// In-memory working database state
let db = JSON.parse(JSON.stringify(mockDatabase));

// Helper: Denormalize / Join Candidate details
const enrichCandidate = (candidate) => {
  if (!candidate) return null;
  const profile = db.profiles.find(p => p.id === candidate.user_id) || {};
  const qualifications = db.educational_qualifications.filter(q => q.candidate_id === candidate.candidate_id);
  return {
    ...candidate,
    email: profile.email,
    role: profile.role,
    qualifications
  };
};

// Helper: Denormalize / Join Application details
const enrichApplication = (app) => {
  if (!app) return null;
  const candidate = db.candidates.find(c => c.candidate_id === app.candidate_id);
  const exam = db.examinations.find(e => e.examination_id === app.examination_id);
  const center = db.exam_centers.find(c => c.center_id === app.center_id);
  const admitCard = db.admit_cards.find(a => a.application_id === app.application_id);
  const result = db.results.find(r => r.application_id === app.application_id);

  return {
    ...app,
    candidate: candidate ? {
      candidate_id: candidate.candidate_id,
      candidate_number: candidate.candidate_number,
      full_name: candidate.full_name,
      category: candidate.category,
      gender: candidate.gender,
      phone_number: candidate.phone_number,
      city: candidate.city,
      state: candidate.state
    } : null,
    examination: exam || null,
    exam_center: center || null,
    admit_card: admitCard || null,
    result: result || null
  };
};

// Helper: Denormalize / Join Admit Card details
const enrichAdmitCard = (card) => {
  if (!card) return null;
  const app = db.applications.find(a => a.application_id === card.application_id);
  const enrichedApp = app ? enrichApplication(app) : null;

  return {
    ...card,
    application: enrichedApp,
    candidate_name: enrichedApp?.candidate?.full_name,
    candidate_number: enrichedApp?.candidate?.candidate_number,
    category: enrichedApp?.candidate?.category,
    gender: enrichedApp?.candidate?.gender,
    examination_name: enrichedApp?.examination?.examination_name,
    examination_code: enrichedApp?.examination?.examination_code,
    examination_date: enrichedApp?.examination?.examination_date,
    center_name: enrichedApp?.exam_center?.center_name,
    center_code: enrichedApp?.exam_center?.center_code,
    center_address: enrichedApp?.exam_center?.address,
    city: enrichedApp?.exam_center?.city,
    state: enrichedApp?.exam_center?.state
  };
};

// Helper: Denormalize / Join Result details
const enrichResult = (res) => {
  if (!res) return null;
  const app = db.applications.find(a => a.application_id === res.application_id);
  const enrichedApp = app ? enrichApplication(app) : null;
  const percentage = Number(((Number(res.marks_obtained) / Number(res.maximum_marks)) * 100).toFixed(2));

  return {
    ...res,
    percentage,
    application: enrichedApp,
    candidate_name: enrichedApp?.candidate?.full_name,
    candidate_number: enrichedApp?.candidate?.candidate_number,
    category: enrichedApp?.candidate?.category,
    examination_name: enrichedApp?.examination?.examination_name,
    examination_code: enrichedApp?.examination?.examination_code
  };
};

const supabaseService = {
  // --------------------------------------------------------------------------
  // 1. PROFILES & AUTH
  // --------------------------------------------------------------------------
  findProfileByEmail: async (email) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle();
      if (error) throw error;
      return data;
    }
    return db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findProfileById: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }
    return db.profiles.find(p => p.id === id) || null;
  },

  createCandidateWithProfile: async (profileData, candidateData) => {
    if (isSupabaseConfigured()) {
      // Create user via Supabase Admin Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: profileData.email,
        password: profileData.password,
        email_confirm: true
      });
      if (authError) throw authError;

      const userId = authData.user.id;

      // Upsert into profiles (trigger also handles this, but explicit upsert ensures role)
      await supabase.from('profiles').upsert({
        id: userId,
        email: profileData.email,
        role: 'candidate'
      });

      // Insert into candidates
      const candidate_number = generateCandidateNumber();
      const { data: candidate, error: candError } = await supabase
        .from('candidates')
        .insert([{
          user_id: userId,
          candidate_number,
          ...candidateData
        }])
        .select()
        .single();

      if (candError) throw candError;

      return {
        user: { id: userId, email: profileData.email, role: 'candidate' },
        candidate
      };
    }

    // Local in-memory simulation
    const userId = `c1000000-0000-0000-0000-${String(db.profiles.length + 1).padStart(12, '0')}`;
    const newProfile = {
      id: userId,
      email: profileData.email,
      role: 'candidate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.profiles.push(newProfile);

    const candidateId = `d1000000-0000-0000-0000-${String(db.candidates.length + 1).padStart(12, '0')}`;
    const newCandidate = {
      candidate_id: candidateId,
      user_id: userId,
      candidate_number: generateCandidateNumber(),
      ...candidateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.candidates.push(newCandidate);

    return {
      user: newProfile,
      candidate: newCandidate
    };
  },

  // --------------------------------------------------------------------------
  // 2. CANDIDATES
  // --------------------------------------------------------------------------
  getAllCandidates: async (filters = {}) => {
    if (isSupabaseConfigured()) {
      let query = supabase.from('candidates').select('*, profiles(email, role), educational_qualifications(*)');
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,candidate_number.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    let list = db.candidates.map(c => enrichCandidate(c));
    if (filters.category) {
      list = list.filter(c => c.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.full_name.toLowerCase().includes(q) ||
        c.candidate_number.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getCandidateById: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('candidates')
        .select('*, profiles(email, role), educational_qualifications(*)')
        .eq('candidate_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const c = db.candidates.find(item => item.candidate_id === id);
    return enrichCandidate(c);
  },

  getCandidateByUserId: async (userId) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('candidates')
        .select('*, profiles(email, role), educational_qualifications(*)')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const c = db.candidates.find(item => item.user_id === userId);
    return enrichCandidate(c);
  },

  updateCandidate: async (id, data) => {
    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabase
        .from('candidates')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('candidate_id', id)
        .select('*, profiles(email, role)')
        .single();
      if (error) throw error;
      return updated;
    }
    const idx = db.candidates.findIndex(c => c.candidate_id === id);
    if (idx === -1) return null;
    db.candidates[idx] = { ...db.candidates[idx], ...data, updated_at: new Date().toISOString() };
    return enrichCandidate(db.candidates[idx]);
  },

  deleteCandidate: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('candidates').delete().eq('candidate_id', id).select();
      if (error) throw error;
      return data;
    }
    const hasApps = db.applications.some(a => a.candidate_id === id);
    if (hasApps) {
      const err = new Error('Cannot delete candidate: Candidate has active examination applications (RESTRICT).');
      err.status = 400;
      throw err;
    }
    const candidate = db.candidates.find(c => c.candidate_id === id);
    db.candidates = db.candidates.filter(c => c.candidate_id !== id);
    db.educational_qualifications = db.educational_qualifications.filter(q => q.candidate_id !== id);
    if (candidate) {
      db.profiles = db.profiles.filter(p => p.id !== candidate.user_id);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // 3. EDUCATIONAL QUALIFICATIONS
  // --------------------------------------------------------------------------
  getQualificationsByCandidateId: async (candidateId) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('educational_qualifications')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('passing_year', { ascending: false });
      if (error) throw error;
      return data;
    }
    return db.educational_qualifications
      .filter(q => q.candidate_id === candidateId)
      .sort((a, b) => b.passing_year - a.passing_year);
  },

  addQualification: async (qualData) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('educational_qualifications')
        .insert([qualData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const qualification_id = `q1000000-0000-0000-0000-${String(db.educational_qualifications.length + 1).padStart(12, '0')}`;
    const newQual = {
      qualification_id,
      ...qualData,
      passing_year: Number(qualData.passing_year),
      percentage: Number(qualData.percentage),
      created_at: new Date().toISOString()
    };
    db.educational_qualifications.push(newQual);
    return newQual;
  },

  updateQualification: async (id, data) => {
    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabase
        .from('educational_qualifications')
        .update(data)
        .eq('qualification_id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }
    const idx = db.educational_qualifications.findIndex(q => q.qualification_id === id);
    if (idx === -1) return null;
    db.educational_qualifications[idx] = { ...db.educational_qualifications[idx], ...data };
    return db.educational_qualifications[idx];
  },

  deleteQualification: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('educational_qualifications').delete().eq('qualification_id', id);
      if (error) throw error;
      return data;
    }
    db.educational_qualifications = db.educational_qualifications.filter(q => q.qualification_id !== id);
    return true;
  },

  // --------------------------------------------------------------------------
  // 4. EXAMINATIONS
  // --------------------------------------------------------------------------
  getAllExaminations: async (filters = {}) => {
    if (isSupabaseConfigured()) {
      let query = supabase.from('examinations').select('*, examination_centers(*, exam_centers(*))');
      if (filters.status) query = query.eq('examination_status', filters.status);
      const { data, error } = await query.order('application_start_date', { ascending: false });
      if (error) throw error;
      return data;
    }
    let list = db.examinations.map(exam => {
      const centerLinks = db.examination_centers.filter(ec => ec.examination_id === exam.examination_id);
      const centers = centerLinks.map(cl => ({
        ...cl,
        exam_centers: db.exam_centers.find(c => c.center_id === cl.center_id)
      }));
      return {
        ...exam,
        examination_centers: centers
      };
    });
    if (filters.status) {
      list = list.filter(e => e.examination_status === filters.status);
    }
    return list;
  },

  getExaminationById: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('examinations')
        .select('*, examination_centers(*, exam_centers(*))')
        .eq('examination_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const exam = db.examinations.find(e => e.examination_id === id);
    if (!exam) return null;
    const centerLinks = db.examination_centers.filter(ec => ec.examination_id === exam.examination_id);
    const centers = centerLinks.map(cl => ({
      ...cl,
      exam_centers: db.exam_centers.find(c => c.center_id === cl.center_id)
    }));
    return {
      ...exam,
      examination_centers: centers
    };
  },

  createExamination: async (examData) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('examinations').insert([examData]).select().single();
      if (error) throw error;
      return data;
    }
    // Check unique code
    if (db.examinations.some(e => e.examination_code.toLowerCase() === examData.examination_code.toLowerCase())) {
      const err = new Error('Examination code must be unique.');
      err.status = 409;
      throw err;
    }
    const examination_id = `e1000000-0000-0000-0000-${String(db.examinations.length + 1).padStart(12, '0')}`;
    const newExam = {
      examination_id,
      ...examData,
      total_vacancies: Number(examData.total_vacancies),
      application_fee: Number(examData.application_fee || 0),
      examination_status: examData.examination_status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.examinations.push(newExam);
    return newExam;
  },

  updateExamination: async (id, data) => {
    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabase
        .from('examinations')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('examination_id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }
    const idx = db.examinations.findIndex(e => e.examination_id === id);
    if (idx === -1) return null;
    db.examinations[idx] = { ...db.examinations[idx], ...data, updated_at: new Date().toISOString() };
    return db.examinations[idx];
  },

  deleteExamination: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('examinations').delete().eq('examination_id', id);
      if (error) throw error;
      return data;
    }
    const hasApps = db.applications.some(a => a.examination_id === id);
    if (hasApps) {
      const err = new Error('Cannot delete examination: Candidates have already applied for this notification (RESTRICT).');
      err.status = 400;
      throw err;
    }
    db.examinations = db.examinations.filter(e => e.examination_id !== id);
    db.examination_centers = db.examination_centers.filter(ec => ec.examination_id !== id);
    return true;
  },

  // --------------------------------------------------------------------------
  // 5 & 6. EXAM CENTERS & JUNCTION TABLE (EXAMINATION_CENTERS)
  // --------------------------------------------------------------------------
  getAllCenters: async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('exam_centers').select('*').order('center_name', { ascending: true });
      if (error) throw error;
      return data;
    }
    return db.exam_centers;
  },

  createCenter: async (centerData) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('exam_centers').insert([centerData]).select().single();
      if (error) throw error;
      return data;
    }
    const center_id = `f1000000-0000-0000-0000-${String(db.exam_centers.length + 1).padStart(12, '0')}`;
    const newCenter = {
      center_id,
      ...centerData,
      total_capacity: Number(centerData.total_capacity),
      created_at: new Date().toISOString()
    };
    db.exam_centers.push(newCenter);
    return newCenter;
  },

  updateCenter: async (id, data) => {
    if (isSupabaseConfigured()) {
      const { data: updated, error } = await supabase.from('exam_centers').update(data).eq('center_id', id).select().single();
      if (error) throw error;
      return updated;
    }
    const idx = db.exam_centers.findIndex(c => c.center_id === id);
    if (idx === -1) return null;
    db.exam_centers[idx] = { ...db.exam_centers[idx], ...data };
    return db.exam_centers[idx];
  },

  deleteCenter: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('exam_centers').delete().eq('center_id', id);
      if (error) throw error;
      return data;
    }
    db.exam_centers = db.exam_centers.filter(c => c.center_id !== id);
    db.examination_centers = db.examination_centers.filter(ec => ec.center_id !== id);
    return true;
  },

  assignCenterToExam: async ({ examination_id, center_id, allocated_capacity }) => {
    const center = db.exam_centers.find(c => c.center_id === center_id);
    if (!center) {
      const err = new Error('Exam center not found.');
      err.status = 404;
      throw err;
    }
    if (Number(allocated_capacity) > center.total_capacity) {
      const err = new Error(`Allocated capacity (${allocated_capacity}) exceeds center total capacity (${center.total_capacity}).`);
      err.status = 400;
      throw err;
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('examination_centers')
        .upsert({
          examination_id,
          center_id,
          allocated_capacity: Number(allocated_capacity)
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const existingIdx = db.examination_centers.findIndex(
      ec => ec.examination_id === examination_id && ec.center_id === center_id
    );
    if (existingIdx !== -1) {
      db.examination_centers[existingIdx].allocated_capacity = Number(allocated_capacity);
      return db.examination_centers[existingIdx];
    } else {
      const newLink = {
        examination_id,
        center_id,
        allocated_capacity: Number(allocated_capacity),
        created_at: new Date().toISOString()
      };
      db.examination_centers.push(newLink);
      return newLink;
    }
  },

  // --------------------------------------------------------------------------
  // 7. APPLICATIONS
  // --------------------------------------------------------------------------
  getAllApplications: async (filters = {}) => {
    if (isSupabaseConfigured()) {
      let query = supabase.from('applications').select('*, candidates(*), examinations(*), exam_centers(*), admit_cards(*), results(*)');
      if (filters.examination_id) query = query.eq('examination_id', filters.examination_id);
      if (filters.status) query = query.eq('application_status', filters.status);
      const { data, error } = await query.order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    let list = db.applications.map(a => enrichApplication(a));
    if (filters.examination_id) {
      list = list.filter(a => a.examination_id === filters.examination_id);
    }
    if (filters.status) {
      list = list.filter(a => a.application_status === filters.status);
    }
    return list;
  },

  getApplicationsByCandidateId: async (candidateId) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('applications')
        .select('*, examinations(*), exam_centers(*), admit_cards(*), results(*)')
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return db.applications
      .filter(a => a.candidate_id === candidateId)
      .map(a => enrichApplication(a));
  },

  getApplicationById: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('applications')
        .select('*, candidates(*), examinations(*), exam_centers(*), admit_cards(*), results(*)')
        .eq('application_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const app = db.applications.find(a => a.application_id === id);
    return enrichApplication(app);
  },

  createApplication: async ({ candidate_id, examination_id, center_id }) => {
    // 1. Verify examination status & dates
    const exam = db.examinations.find(e => e.examination_id === examination_id);
    if (!exam) {
      const err = new Error('Target examination not found.');
      err.status = 404;
      throw err;
    }

    if (exam.examination_status !== 'published') {
      const err = new Error(`Applications cannot be accepted: Examination is currently "${exam.examination_status}".`);
      err.status = 400;
      throw err;
    }

    const today = new Date().toISOString().split('T')[0];
    if (today < exam.application_start_date || today > exam.application_end_date) {
      const err = new Error(`Application window closed. Valid dates: ${exam.application_start_date} to ${exam.application_end_date}.`);
      err.status = 400;
      throw err;
    }

    // 2. Check duplicate submission (DBMS constraint UNIQUE(candidate_id, examination_id))
    const existing = db.applications.find(
      a => a.candidate_id === candidate_id && a.examination_id === examination_id
    );
    if (existing) {
      const err = new Error('Duplicate application: You have already applied for this examination notice.');
      err.status = 409;
      throw err;
    }

    const application_number = generateApplicationNumber();
    const application_id = `b1000000-0000-0000-0000-${String(db.applications.length + 1).padStart(12, '0')}`;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          application_number,
          candidate_id,
          examination_id,
          center_id: center_id || null,
          application_status: 'submitted',
          payment_status: 'paid'
        }])
        .select('*, examinations(*), exam_centers(*)')
        .single();
      if (error) throw error;
      return data;
    }

    const newApp = {
      application_id,
      application_number,
      candidate_id,
      examination_id,
      center_id: center_id || null,
      applied_at: new Date().toISOString(),
      application_status: 'submitted',
      payment_status: 'paid',
      remarks: 'Application submitted successfully online.',
      updated_at: new Date().toISOString()
    };
    db.applications.push(newApp);
    return enrichApplication(newApp);
  },

  updateApplicationStatus: async (id, { application_status, center_id, remarks }) => {
    if (isSupabaseConfigured()) {
      const updatePayload = { updated_at: new Date().toISOString() };
      if (application_status) updatePayload.application_status = application_status;
      if (center_id) updatePayload.center_id = center_id;
      if (remarks !== undefined) updatePayload.remarks = remarks;

      const { data, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('application_id', id)
        .select('*, candidates(*), examinations(*), exam_centers(*)')
        .single();
      if (error) throw error;
      return data;
    }

    const idx = db.applications.findIndex(a => a.application_id === id);
    if (idx === -1) return null;

    if (application_status) db.applications[idx].application_status = application_status;
    if (center_id) db.applications[idx].center_id = center_id;
    if (remarks !== undefined) db.applications[idx].remarks = remarks;
    db.applications[idx].updated_at = new Date().toISOString();

    return enrichApplication(db.applications[idx]);
  },

  // --------------------------------------------------------------------------
  // 8. ADMIT CARDS
  // --------------------------------------------------------------------------
  getAllAdmitCards: async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('admit_cards')
        .select('*, applications(*, candidates(*), examinations(*), exam_centers(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return db.admit_cards.map(card => enrichAdmitCard(card));
  },

  getAdmitCardsByCandidateId: async (candidateId) => {
    const candidateAppIds = db.applications
      .filter(a => a.candidate_id === candidateId)
      .map(a => a.application_id);

    return db.admit_cards
      .filter(c => candidateAppIds.includes(c.application_id))
      .map(card => enrichAdmitCard(card));
  },

  getAdmitCardById: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('admit_cards')
        .select('*, applications(*, candidates(*), examinations(*), exam_centers(*))')
        .eq('admit_card_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const card = db.admit_cards.find(c => c.admit_card_id === id);
    return enrichAdmitCard(card);
  },

  generateAdmitCard: async ({ application_id, reporting_time = '08:30:00', examination_instructions }) => {
    const app = db.applications.find(a => a.application_id === application_id);
    if (!app) {
      const err = new Error('Application record not found.');
      err.status = 404;
      throw err;
    }

    if (app.application_status !== 'accepted') {
      const err = new Error(`Cannot issue Admit Card: Application status is "${app.application_status}". Only "accepted" applications are eligible.`);
      err.status = 400;
      throw err;
    }

    if (!app.center_id) {
      const err = new Error('Cannot issue Admit Card: An examination center must be assigned to the application first.');
      err.status = 400;
      throw err;
    }

    // Check if card already exists (1-to-1 relationship)
    const existing = db.admit_cards.find(c => c.application_id === application_id);
    if (existing) {
      const err = new Error(`Admit Card already generated with Roll Number: ${existing.roll_number}`);
      err.status = 409;
      throw err;
    }

    const exam = db.examinations.find(e => e.examination_id === app.examination_id);
    const roll_number = generateRollNumber(exam?.examination_code || 'EXAM');
    const admit_card_number = generateAdmitCardNumber();
    const admit_card_id = `ac000000-0000-0000-0000-${String(db.admit_cards.length + 1).padStart(12, '0')}`;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('admit_cards')
        .insert([{
          application_id,
          admit_card_number,
          roll_number,
          issue_date: new Date().toISOString().split('T')[0],
          reporting_time,
          examination_instructions: examination_instructions || '1. Carry original Photo ID.\n2. Carry printed copy of this Hall Ticket.'
        }])
        .select('*, applications(*, candidates(*), examinations(*), exam_centers(*))')
        .single();
      if (error) throw error;
      return data;
    }

    const newCard = {
      admit_card_id,
      application_id,
      admit_card_number,
      roll_number,
      issue_date: new Date().toISOString().split('T')[0],
      reporting_time,
      examination_instructions: examination_instructions || '1. Carry original Photo ID.\n2. Carry printed copy of this Admit Card.\n3. Electronic devices prohibited.',
      admit_card_file_url: null,
      created_at: new Date().toISOString()
    };
    db.admit_cards.push(newCard);
    return enrichAdmitCard(newCard);
  },

  // --------------------------------------------------------------------------
  // 9. RESULTS
  // --------------------------------------------------------------------------
  getAllResults: async (filters = {}) => {
    if (isSupabaseConfigured()) {
      let query = supabase.from('results').select('*, applications(*, candidates(*), examinations(*))');
      if (filters.status) query = query.eq('result_status', filters.status);
      const { data, error } = await query.order('rank', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    }

    let list = db.results.map(r => enrichResult(r));
    if (filters.status) {
      list = list.filter(r => r.result_status === filters.status);
    }
    return list;
  },

  getResultsByCandidateId: async (candidateId) => {
    const candidateAppIds = db.applications
      .filter(a => a.candidate_id === candidateId)
      .map(a => a.application_id);

    return db.results
      .filter(r => candidateAppIds.includes(r.application_id) && r.published_at !== null)
      .map(r => enrichResult(r));
  },

  getResultById: async (id) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('results')
        .select('*, applications(*, candidates(*), examinations(*))')
        .eq('result_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const r = db.results.find(res => res.result_id === id);
    return enrichResult(r);
  },

  saveResult: async ({ application_id, marks_obtained, maximum_marks = 100, rank, result_status = 'pass', remarks }) => {
    const marks = Number(marks_obtained);
    const maxMarks = Number(maximum_marks);

    if (marks > maxMarks) {
      const err = new Error(`Marks obtained (${marks}) cannot exceed maximum marks (${maxMarks}).`);
      err.status = 400;
      throw err;
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('results')
        .upsert({
          application_id,
          marks_obtained: marks,
          maximum_marks: maxMarks,
          rank: rank ? Number(rank) : null,
          result_status,
          remarks
        }, { onConflict: 'application_id' })
        .select('*, applications(*, candidates(*), examinations(*))')
        .single();
      if (error) throw error;
      return data;
    }

    const existingIdx = db.results.findIndex(r => r.application_id === application_id);
    if (existingIdx !== -1) {
      db.results[existingIdx] = {
        ...db.results[existingIdx],
        marks_obtained: marks,
        maximum_marks: maxMarks,
        rank: rank ? Number(rank) : db.results[existingIdx].rank,
        result_status,
        remarks: remarks || db.results[existingIdx].remarks
      };
      return enrichResult(db.results[existingIdx]);
    } else {
      const result_id = `r1000000-0000-0000-0000-${String(db.results.length + 1).padStart(12, '0')}`;
      const newResult = {
        result_id,
        application_id,
        marks_obtained: marks,
        maximum_marks: maxMarks,
        rank: rank ? Number(rank) : null,
        result_status,
        published_at: null,
        remarks: remarks || 'Evaluated scorecard.',
        created_at: new Date().toISOString()
      };
      db.results.push(newResult);
      return enrichResult(newResult);
    }
  },

  publishResult: async (resultId) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('results')
        .update({ published_at: new Date().toISOString() })
        .eq('result_id', resultId)
        .select('*, applications(*, candidates(*), examinations(*))')
        .single();
      if (error) throw error;
      return data;
    }
    const idx = db.results.findIndex(r => r.result_id === resultId);
    if (idx === -1) return null;
    db.results[idx].published_at = new Date().toISOString();
    return enrichResult(db.results[idx]);
  },

  // --------------------------------------------------------------------------
  // 10. DASHBOARD METRICS (AGGREGATES)
  // --------------------------------------------------------------------------
  getAdminMetrics: async () => {
    if (isSupabaseConfigured()) {
      const [
        { count: candCount },
        { count: examCount },
        { count: appCount },
        { count: pendingCount },
        { count: acceptedCount },
        { count: rejectedCount },
        { count: centerCount },
        { count: resultCount }
      ] = await Promise.all([
        supabase.from('candidates').select('*', { count: 'exact', head: true }),
        supabase.from('examinations').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('application_status', 'submitted'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('application_status', 'accepted'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('application_status', 'rejected'),
        supabase.from('exam_centers').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }).not('published_at', 'is', null)
      ]);

      const { data: recentApps } = await supabase
        .from('applications')
        .select('*, candidates(full_name, candidate_number), examinations(examination_name, examination_code)')
        .order('applied_at', { ascending: false })
        .limit(5);

      const { data: upcomingExams } = await supabase
        .from('examinations')
        .select('*')
        .eq('examination_status', 'published')
        .order('examination_date', { ascending: true })
        .limit(4);

      return {
        total_candidates: candCount || 0,
        total_examinations: examCount || 0,
        total_applications: appCount || 0,
        pending_applications: pendingCount || 0,
        accepted_applications: acceptedCount || 0,
        rejected_applications: rejectedCount || 0,
        total_centers: centerCount || 0,
        results_published: resultCount || 0,
        recent_applications: recentApps || [],
        upcoming_examinations: upcomingExams || []
      };
    }

    return {
      total_candidates: db.candidates.length,
      total_examinations: db.examinations.length,
      total_applications: db.applications.length,
      pending_applications: db.applications.filter(a => a.application_status === 'submitted' || a.application_status === 'under_review').length,
      accepted_applications: db.applications.filter(a => a.application_status === 'accepted').length,
      rejected_applications: db.applications.filter(a => a.application_status === 'rejected').length,
      total_centers: db.exam_centers.length,
      results_published: db.results.filter(r => r.published_at !== null).length,
      recent_applications: db.applications.slice(0, 5).map(a => enrichApplication(a)),
      upcoming_examinations: db.examinations.filter(e => e.examination_status === 'published').slice(0, 4)
    };
  },

  getCandidateMetrics: async (candidateId) => {
    const candidateApps = db.applications.filter(a => a.candidate_id === candidateId);
    const candidateAppIds = candidateApps.map(a => a.application_id);

    return {
      total_applications: candidateApps.length,
      pending_applications: candidateApps.filter(a => a.application_status === 'submitted' || a.application_status === 'under_review').length,
      accepted_applications: candidateApps.filter(a => a.application_status === 'accepted').length,
      available_examinations: db.examinations.filter(e => e.examination_status === 'published').length,
      admit_cards_count: db.admit_cards.filter(c => candidateAppIds.includes(c.application_id)).length,
      published_results_count: db.results.filter(r => candidateAppIds.includes(r.application_id) && r.published_at !== null).length,
      recent_applications: candidateApps.slice(0, 4).map(a => enrichApplication(a))
    };
  }
};

module.exports = supabaseService;

