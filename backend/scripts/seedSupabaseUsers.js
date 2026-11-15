/**
 * ============================================================================
 * GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
 * Script: backend/scripts/seedSupabaseUsers.js
 * Description: Automated creation of required Supabase Auth demonstration users
 *              via the Supabase Admin API (service_role key).
 * 
 * Usage:
 *   cd backend
 *   npm run seed:users
 * ============================================================================
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REQUIRED_USERS = [
  {
    email: 'admin@gov.in',
    password: 'Admin@123',
    role: 'admin',
    fullName: 'Chief Examination Controller'
  },
  {
    email: 'rahul.sharma@example.com',
    password: 'Candidate@123',
    role: 'candidate',
    fullName: 'Rahul Sharma'
  },
  {
    email: 'priya.patel@example.com',
    password: 'Candidate@123',
    role: 'candidate',
    fullName: 'Priya Patel'
  },
  {
    email: 'amit.kumar@example.com',
    password: 'Candidate@123',
    role: 'candidate',
    fullName: 'Amit Kumar'
  }
];

async function seedSupabaseUsers() {
  console.log('========================================================================');
  console.log(' [GREMS] Supabase Auth Demonstration Account Seeder');
  console.log('========================================================================');

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('your-project-id') || serviceRoleKey.includes('your-service-role-key')) {
    console.error('\n[ERROR] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing or unconfigured in backend/.env!');
    console.error('Please obtain your project URL and service_role key from:');
    console.error('  Supabase Dashboard -> Project Settings -> API -> Project API Keys');
    console.error('and configure them in backend/.env before running this script.\n');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  console.log('Seeding demonstration users...\n');

  for (const user of REQUIRED_USERS) {
    try {
      console.log(`- Creating/Verifying user: ${user.email} (${user.role})...`);

      // Attempt creation via Admin API
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role
        }
      });

      let userId = createData?.user?.id;

      if (createError) {
        if (createError.message.includes('already exists') || createError.status === 422) {
          console.log(`  * User already exists in auth.users. Fetching existing record...`);
          const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) throw listError;
          const existingUser = listData.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
          if (existingUser) {
            userId = existingUser.id;
            console.log(`  * Existing user ID: ${userId}`);
          }
        } else {
          throw createError;
        }
      } else {
        console.log(`  + Created user successfully! ID: ${userId}`);
      }

      // Promote administrator role in public.profiles
      if (user.role === 'admin' && userId) {
        console.log(`  * Setting profile role = 'admin' for ${user.email}...`);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('email', user.email.toLowerCase());

        if (profileError) {
          console.warn(`    ! Notice: Could not update public.profiles: ${profileError.message}`);
          console.warn(`      (Ensure database/schema/create_tables.sql has been executed first)`);
        } else {
          console.log(`    ✓ Administrator privileges verified in public.profiles.`);
        }
      }
    } catch (err) {
      console.error(`  [X] Failed processing ${user.email}:`, err.message);
    }
  }

  console.log('\n========================================================================');
  console.log(' Demonstration Accounts Summary:');
  console.log('========================================================================');
  console.log(' 1. Administrator: admin@gov.in           / Admin@123');
  console.log(' 2. Candidate 1:   rahul.sharma@example.com / Candidate@123');
  console.log(' 3. Candidate 2:   priya.patel@example.com  / Candidate@123');
  console.log(' 4. Candidate 3:   amit.kumar@example.com   / Candidate@123');
  console.log('========================================================================');
  console.log(' Next step: Run database/sample_data/insert_data.sql in Supabase SQL Editor.');
  console.log('========================================================================\n');
}

seedSupabaseUsers().catch((err) => {
  console.error('[FATAL] Script encountered an unexpected error:', err);
  process.exit(1);
});
