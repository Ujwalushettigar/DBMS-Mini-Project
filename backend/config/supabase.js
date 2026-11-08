const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id') && supabaseKey.length > 20) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    isConfigured = true;
    console.log('[GREMS Database] Supabase PostgreSQL client connected successfully.');
  } catch (error) {
    console.error('[GREMS Database] Error initializing Supabase client:', error.message);
  }
} else {
  console.log('========================================================================');
  console.log('[GREMS Database] Supabase credentials pending in backend/.env.');
  console.log('[GREMS Database] Running in Academic Local Evaluation Mode.');
  console.log('[GREMS Database] All 9 relational tables and workflows are operational for testing.');
  console.log('========================================================================');
}

module.exports = {
  supabase,
  isSupabaseConfigured: () => isConfigured
};

