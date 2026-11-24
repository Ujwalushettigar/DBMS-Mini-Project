/**
 * ==============================================================================
 * GREMS - Government Recruitment Examination Management System
 * Backend Integration & Data Integrity Verification Test Suite
 * File: backend/tests/integration.test.js
 * ==============================================================================
 */

const assert = require('assert');
const { isSupabaseConfigured, supabase } = require('../config/supabase');
const supabaseService = require('../services/supabaseService');
const { authenticateToken, requireAdmin, requireCandidate } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'grems_academic_secure_jwt_secret_key_2026';

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function main() {
  console.log('========================================================================');
  console.log(' [GREMS] Backend Integration & Database Verification Test Suite');
  console.log('========================================================================');
  console.log(` Mode: ${isSupabaseConfigured() ? 'CLOUD (Supabase PostgreSQL)' : 'LOCAL IN-MEMORY FALLBACK'}`);
  console.log('------------------------------------------------------------------------\n');

  // 1. Supabase Configuration Test
  await runTest('1.1 Config: isSupabaseConfigured returns boolean without error', () => {
    const configured = isSupabaseConfigured();
    assert.strictEqual(typeof configured, 'boolean');
  });

  // 2. Authentication Middleware Tests
  await runTest('2.1 Auth Middleware: Rejects request with missing token (401)', async () => {
    let statusCode = null;
    let resBody = null;
    const req = { headers: {} };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resBody = data; return res; }
    };
    let nextCalled = false;
    await authenticateToken(req, res, () => { nextCalled = true; });
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(resBody.success, false);
  });

  await runTest('2.2 Auth Middleware: Rejects invalid or forged token (401)', async () => {
    let statusCode = null;
    let resBody = null;
    const req = { headers: { authorization: 'Bearer invalid_forged_token_xyz' } };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resBody = data; return res; }
    };
    let nextCalled = false;
    await authenticateToken(req, res, () => { nextCalled = true; });
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  await runTest('2.3 Auth Middleware: Valid local token populates req.user', async () => {
    if (!isSupabaseConfigured()) {
      const payload = { id: 'test-user-id', email: 'test@example.com', role: 'candidate' };
      const token = jwt.sign(payload, JWT_SECRET);
      const req = { headers: { authorization: `Bearer ${token}` } };
      let nextCalled = false;
      const res = {};
      await authenticateToken(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user.email, 'test@example.com');
      assert.strictEqual(req.user.role, 'candidate');
    }
  });

  // 3. Role Authorization Middleware Tests
  await runTest('3.1 RBAC: requireAdmin blocks candidate role with 403', () => {
    let statusCode = null;
    let resBody = null;
    const req = { user: { id: '1', role: 'candidate' } };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resBody = data; return res; }
    };
    let nextCalled = false;
    requireAdmin(req, res, () => { nextCalled = true; });
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(nextCalled, false);
  });

  await runTest('3.2 RBAC: requireAdmin permits admin role', () => {
    const req = { user: { id: '1', role: 'admin' } };
    let nextCalled = false;
    requireAdmin(req, {}, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  await runTest('3.3 RBAC: requireCandidate blocks admin role from candidate-exclusive routes', () => {
    let statusCode = null;
    const req = { user: { id: '1', role: 'admin' } };
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: () => res
    };
    let nextCalled = false;
    requireCandidate(req, res, () => { nextCalled = true; });
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(nextCalled, false);
  });

  // 4. Candidate Registration & Profile Security Tests
  let testUserId = null;
  let testCandidateId = null;
  const testEmail = `test.aspirant.${Date.now()}@grems.test`;

  await runTest('4.1 Candidate Registration: Always enforces role = "candidate"', async () => {
    const regResult = await supabaseService.createCandidateWithProfile(
      { email: testEmail, password: 'StrongPassword@123', role: 'admin' }, // Attempting role escalation
      {
        full_name: 'Test Aspirant',
        date_of_birth: '1999-05-15',
        gender: 'Female',
        phone_number: '9876543210',
        address: '123 Academic Way',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        category: 'General'
      }
    );

    assert.ok(regResult.user);
    assert.ok(regResult.candidate);
    assert.strictEqual(regResult.user.role, 'candidate', 'Role MUST be forced to candidate');
    testUserId = regResult.user.id;
    testCandidateId = regResult.candidate.candidate_id;
  });

  await runTest('4.2 Profile Lookup: findProfileByEmail retrieves the registered profile', async () => {
    const profile = await supabaseService.findProfileByEmail(testEmail);
    assert.ok(profile);
    assert.strictEqual(profile.email.toLowerCase(), testEmail.toLowerCase());
    assert.strictEqual(profile.role, 'candidate');
  });

  await runTest('4.3 Candidate Lookup: getCandidateByUserId finds matching candidate record', async () => {
    const cand = await supabaseService.getCandidateByUserId(testUserId);
    assert.ok(cand);
    assert.strictEqual(cand.full_name, 'Test Aspirant');
    assert.strictEqual(cand.candidate_id, testCandidateId);
  });

  // 5. Examinations Retrieval & CRUD Tests
  let sampleExamId = null;
  await runTest('5.1 Examinations: List published examinations', async () => {
    const exams = await supabaseService.getAllExaminations({ status: 'published' });
    assert.ok(Array.isArray(exams));
    assert.ok(exams.length > 0, 'Should have at least one published examination');
    sampleExamId = exams[0].examination_id;
    assert.strictEqual(exams[0].examination_status, 'published');
  });

  // 6. Examination Center Allocation Tests
  let sampleCenterId = null;
  await runTest('6.1 Exam Centers: Retrieve center records and verify capacity', async () => {
    const centers = await supabaseService.getAllCenters();
    assert.ok(Array.isArray(centers));
    assert.ok(centers.length > 0, 'Should have examination centers');
    sampleCenterId = centers[0].center_id;
    assert.ok(centers[0].total_capacity > 0);
  });

  // 7. Application Submission & Validation Tests
  let testAppId = null;
  await runTest('7.1 Application Creation: Submit valid application', async () => {
    const app = await supabaseService.createApplication({
      candidate_id: testCandidateId,
      examination_id: sampleExamId,
      center_id: sampleCenterId
    });
    assert.ok(app);
    assert.ok(app.application_id);
    assert.strictEqual(app.application_status, 'submitted');
    assert.strictEqual(app.candidate_id, testCandidateId);
    testAppId = app.application_id;
  });

  await runTest('7.2 Application Validation: Duplicate application is rejected with 409', async () => {
    let errorThrown = null;
    try {
      await supabaseService.createApplication({
        candidate_id: testCandidateId,
        examination_id: sampleExamId,
        center_id: sampleCenterId
      });
    } catch (err) {
      errorThrown = err;
    }
    assert.ok(errorThrown, 'Duplicate application must throw an error');
    assert.strictEqual(errorThrown.status, 409);
  });

  // 8. Application Status Management & Candidate Security
  await runTest('8.1 Application Security: Candidate cannot self-approve status (403)', async () => {
    let errorThrown = null;
    try {
      await supabaseService.updateApplicationStatus(
        testAppId,
        { application_status: 'accepted' },
        'candidate'
      );
    } catch (err) {
      errorThrown = err;
    }
    assert.ok(errorThrown, 'Candidate self-approval must be blocked');
    assert.strictEqual(errorThrown.status, 403);
  });

  await runTest('8.2 Application Status: Admin accepts application', async () => {
    const updated = await supabaseService.updateApplicationStatus(
      testAppId,
      { application_status: 'accepted', remarks: 'Eligibility and documents verified.' },
      'admin'
    );
    assert.ok(updated);
    assert.strictEqual(updated.application_status, 'accepted');
  });

  // 9. Admit Card Generation & Constraints Tests
  let testAdmitCardId = null;
  await runTest('9.1 Admit Card: Successfully issued for accepted application', async () => {
    const card = await supabaseService.generateAdmitCard({
      application_id: testAppId,
      reporting_time: '08:30:00',
      examination_instructions: '1. Bring original Photo ID.\n2. Arrive 30 minutes before exam.'
    });
    assert.ok(card);
    assert.ok(card.roll_number);
    assert.strictEqual(card.application_id, testAppId);
    testAdmitCardId = card.admit_card_id;
  });

  await runTest('9.2 Admit Card Constraint: Duplicate admit card is rejected with 409', async () => {
    let errorThrown = null;
    try {
      await supabaseService.generateAdmitCard({
        application_id: testAppId,
        reporting_time: '08:30:00'
      });
    } catch (err) {
      errorThrown = err;
    }
    assert.ok(errorThrown, 'Duplicate admit card generation must throw 409');
    assert.strictEqual(errorThrown.status, 409);
  });

  await runTest('9.3 Admit Card Lookup: Candidate can view their admit cards', async () => {
    const cards = await supabaseService.getAdmitCardsByCandidateId(testCandidateId);
    assert.ok(Array.isArray(cards));
    const found = cards.find(c => c.application_id === testAppId);
    assert.ok(found, 'Candidate must be able to retrieve their generated admit card');
  });

  // 10. Examination Results & Publication Tests
  let testResultId = null;
  await runTest('10.1 Results: Save evaluation marks (marks <= maximum_marks)', async () => {
    const saved = await supabaseService.saveResult({
      application_id: testAppId,
      marks_obtained: 88.5,
      maximum_marks: 100,
      rank: 1,
      result_status: 'pass',
      remarks: 'Top score in technical section.'
    });
    assert.ok(saved);
    assert.strictEqual(Number(saved.marks_obtained), 88.5);
    testResultId = saved.result_id;
  });

  await runTest('10.2 Results Validation: Marks exceeding maximum marks rejected with 400', async () => {
    let errorThrown = null;
    try {
      await supabaseService.saveResult({
        application_id: testAppId,
        marks_obtained: 150,
        maximum_marks: 100
      });
    } catch (err) {
      errorThrown = err;
    }
    assert.ok(errorThrown, 'Marks > maxMarks must throw error');
    assert.strictEqual(errorThrown.status, 400);
  });

  await runTest('10.3 Results Publication: Publish score and verify visibility', async () => {
    const pub = await supabaseService.publishResult(testResultId);
    assert.ok(pub);
    assert.strictEqual(pub.is_published, true);

    const candResults = await supabaseService.getResultsByCandidateId(testCandidateId);
    assert.ok(Array.isArray(candResults));
    const found = candResults.find(r => r.application_id === testAppId);
    assert.ok(found, 'Published result must be visible to the candidate');
  });

  // 11. Dashboard Metrics Tests
  await runTest('11.1 Dashboard: getAdminMetrics loads KPI counts', async () => {
    const metrics = await supabaseService.getAdminMetrics();
    assert.ok(metrics);
    assert.ok(typeof metrics.total_candidates === 'number');
    assert.ok(typeof metrics.total_examinations === 'number');
    assert.ok(typeof metrics.total_applications === 'number');
  });

  await runTest('11.2 Dashboard: getCandidateMetrics loads candidate stats', async () => {
    const metrics = await supabaseService.getCandidateMetrics(testCandidateId);
    assert.ok(metrics);
    assert.ok(metrics.total_applications >= 1);
    assert.ok(metrics.admit_cards_count >= 1);
    assert.ok(metrics.published_results_count >= 1);
  });

  console.log('\n------------------------------------------------------------------------');
  console.log(` Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});
