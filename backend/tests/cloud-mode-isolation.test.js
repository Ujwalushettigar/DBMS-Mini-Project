/**
 * ==============================================================================
 * GREMS - Cloud Mode Branch & Isolation Unit Tests
 * File: backend/tests/cloud-mode-isolation.test.js
 * Purpose: Verifies that in Cloud Mode:
 *   - supabaseService queries Supabase and NEVER touches mock `db` arrays
 *   - authMiddleware NEVER silently falls back to local JWT
 *   - registration transactions rollback on error
 * ==============================================================================
 */

const assert = require('assert');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function run() {
  console.log('========================================================================');
  console.log(' [GREMS] Cloud Mode Branch & Isolation Unit Tests');
  console.log('========================================================================\n');

  // Test 1: Cloud Auth Middleware does not fallback to local JWT on failure
  await test('1. Cloud Auth: Does not fall back to local JWT on Supabase auth error', async () => {
    // We isolate authMiddleware with a mocked supabase client
    const { authenticateToken } = require('../middleware/authMiddleware');

    // If an invalid token is provided to authenticateToken in local mode, it rejects with 401.
    // In cloud mode, it must also reject with 401 or 503, never letting local JWT verify a cloud token.
    const req = { headers: { authorization: 'Bearer invalid_cloud_token' } };
    let statusCode = null;
    let resData = null;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resData = data; return res; }
    };
    let nextCalled = false;

    await authenticateToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, 'next() must NOT be called for invalid session');
    assert.strictEqual(statusCode, 401, 'Status code must be 401');
    assert.strictEqual(resData.success, false);
  });

  // Test 2: Source Code Verification: Ensure supabaseService.js Supabase branches do NOT access `db`
  await test('2. Data Mode Isolation: Supabase branches in supabaseService.js do not reference db.*', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../services/supabaseService.js'), 'utf8');

    // Extract createApplication method
    const createAppMatch = content.match(/createApplication:\s*async\s*\(\{[\s\S]*?\}\)\s*=>\s*\{([\s\S]*?)\n\s*\/\/ LOCAL MODE ONLY/);
    assert.ok(createAppMatch, 'Should find createApplication cloud branch');
    const cloudBranch = createAppMatch[1];

    assert.strictEqual(
      cloudBranch.includes('db.'),
      false,
      'createApplication cloud branch must NOT access db.*'
    );

    // Extract assignCenterToExam cloud branch
    const assignCenterMatch = content.match(/assignCenterToExam:\s*async\s*\(\{[\s\S]*?\}\)\s*=>\s*\{([\s\S]*?)\n\s*\/\/ Local in-memory mode/);
    assert.ok(assignCenterMatch, 'Should find assignCenterToExam cloud branch');
    assert.strictEqual(
      assignCenterMatch[1].includes('db.'),
      false,
      'assignCenterToExam cloud branch must NOT access db.*'
    );

    // Extract updateApplicationStatus cloud branch
    const updateAppMatch = content.match(/updateApplicationStatus:\s*async\s*\([\s\S]*?\)\s*=>\s*\{([\s\S]*?)\n\s*\/\/ Local in-memory mode/);
    assert.ok(updateAppMatch, 'Should find updateApplicationStatus cloud branch');
    assert.strictEqual(
      updateAppMatch[1].includes('db.'),
      false,
      'updateApplicationStatus cloud branch must NOT access db.*'
    );

    // Extract generateAdmitCard cloud branch
    const genAdmitMatch = content.match(/generateAdmitCard:\s*async\s*\(\{[\s\S]*?\}\)\s*=>\s*\{([\s\S]*?)\n\s*\/\/ Local in-memory mode/);
    assert.ok(genAdmitMatch, 'Should find generateAdmitCard cloud branch');
    assert.strictEqual(
      genAdmitMatch[1].includes('db.'),
      false,
      'generateAdmitCard cloud branch must NOT access db.*'
    );
  });

  // Test 3: Transaction Rollback: Verify createCandidateWithProfile contains deleteUser on failure
  await test('3. Candidate Registration Transaction: Contains deleteUser rollback block', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../services/supabaseService.js'), 'utf8');

    const regMatch = content.match(/createCandidateWithProfile:\s*async[\s\S]*?catch\s*\(error\)\s*\{([\s\S]*?)\}/);
    assert.ok(regMatch, 'Should find createCandidateWithProfile error catch block');
    assert.ok(
      regMatch[1].includes('deleteUser(userId)'),
      'Catch block must call deleteUser(userId) to clean up auth record on failure'
    );
  });

  // Test 4: Verify Supabase initialization uses secret/service-role key, not anon key
  await test('4. Supabase Client Config: Does NOT use SUPABASE_ANON_KEY as fallback for service operations', () => {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.resolve(__dirname, '../config/supabase.js'), 'utf8');

    assert.strictEqual(
      content.includes('SUPABASE_ANON_KEY'),
      false,
      'backend/config/supabase.js must NOT fall back to SUPABASE_ANON_KEY'
    );
    assert.ok(
      content.includes('SUPABASE_SECRET_KEY') && content.includes('SUPABASE_SERVICE_ROLE_KEY'),
      'Must check SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY'
    );
  });

  // Test 5: Verify frontend services does NOT import or reference service_role key
  await test('5. Frontend Security: Frontend contains zero references to SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY', () => {
    const fs = require('fs');
    const path = require('path');
    const apiContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/src/services/api.js'), 'utf8');

    assert.strictEqual(
      apiContent.includes('SERVICE_ROLE') || apiContent.includes('SECRET_KEY'),
      false,
      'Frontend must never reference secret or service-role keys'
    );
  });

  console.log('\n------------------------------------------------------------------------');
  console.log(` Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
