const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY ||
                   process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseKey.length > 20
);

let supabase = null;

if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('[GREMS] Supabase CLOUD mode enabled.');
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Supabase credentials are required in production.'
    );
  }

  console.warn('[GREMS] LOCAL IN-MEMORY mode enabled.');
}

module.exports = {
  supabase,
  isSupabaseConfigured: () => isConfigured
};
