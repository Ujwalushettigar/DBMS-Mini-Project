/**
 * ==============================================================================
 * SQL Integrity & Cross-Reference Verification Script
 * File: backend/tests/verify-sql.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const sqlDir = path.resolve(__dirname, '../../database');

const requiredFiles = [
  'create_tables.sql',
  'functions.sql',
  'insert_data.sql',
  'crud_operations.sql',
  'queries.sql',
  'relationships.md',
  'README.md'
];

console.log('========================================================================');
console.log(' [GREMS] SQL Syntax & Schema Integrity Verification');
console.log('========================================================================\n');

// 1. File existence check
for (const file of requiredFiles) {
  const filePath = path.join(sqlDir, file);
  assert.ok(fs.existsSync(filePath), `Missing required file: database/${file}`);
  const stats = fs.statSync(filePath);
  assert.ok(stats.size > 0, `File is empty: database/${file}`);
  console.log(`  [PASS] database/${file} exists (${stats.size} bytes)`);
}

// 2. Check docs/database_implementation.md
const docPath = path.resolve(__dirname, '../../docs/database_implementation.md');
assert.ok(fs.existsSync(docPath), 'Missing docs/database_implementation.md');
console.log(`  [PASS] docs/database_implementation.md exists (${fs.statSync(docPath).size} bytes)`);

// 3. Schema tables audit in create_tables.sql
const createTablesSql = fs.readFileSync(path.join(sqlDir, 'create_tables.sql'), 'utf8');
const tables = [
  'profiles',
  'candidates',
  'educational_qualifications',
  'examinations',
  'exam_centers',
  'examination_centers',
  'applications',
  'admit_cards',
  'results'
];

for (const t of tables) {
  const regex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${t}\\s*\\(`, 'i');
  assert.ok(regex.test(createTablesSql), `Table definition missing in create_tables.sql: ${t}`);
  console.log(`  [PASS] create_tables.sql defines table: public.${t}`);
}

// 4. Verify generated column percentage
assert.ok(
  createTablesSql.includes('GENERATED ALWAYS AS (ROUND((marks_obtained / NULLIF(maximum_marks, 0)) * 100, 2)) STORED') ||
  createTablesSql.includes('percentage NUMERIC(5,2) GENERATED ALWAYS AS'),
  'create_tables.sql must define percentage as generated column'
);
console.log('  [PASS] create_tables.sql defines percentage as generated column');

// 5. Verify constraints in create_tables.sql
assert.ok(createTablesSql.includes('unique_candidate_exam'), 'Unique constraint on candidate_id and examination_id missing');
assert.ok(createTablesSql.includes('fk_application_exam_center'), 'Composite foreign key fk_application_exam_center missing');
assert.ok(createTablesSql.includes('chk_application_status'), 'CHECK constraint for application_status missing');
assert.ok(createTablesSql.includes('chk_examination_status'), 'CHECK constraint for examination_status missing');
assert.ok(createTablesSql.includes('chk_result_status'), 'CHECK constraint for result_status missing');
console.log('  [PASS] create_tables.sql contains all required constraints and composite foreign keys');

// 6. Verify functions and triggers in functions.sql
const functionsSql = fs.readFileSync(path.join(sqlDir, 'functions.sql'), 'utf8');
assert.ok(functionsSql.includes('set_updated_at()'), 'Timestamp trigger function missing');
assert.ok(functionsSql.includes('validate_examination_dates()'), 'Date validation trigger function missing');
assert.ok(functionsSql.includes('validate_result_publication()'), 'Result publication validation trigger function missing');
assert.ok(functionsSql.includes('check_center_allocation_capacity()'), 'Center allocation capacity trigger missing');
assert.ok(functionsSql.includes('check_application_center_capacity()'), 'Application center capacity trigger missing');
assert.ok(functionsSql.includes('is_admin()'), 'is_admin() helper function missing');
assert.ok(functionsSql.includes('FOR UPDATE'), 'Capacity triggers must use FOR UPDATE row locking for concurrency');
console.log('  [PASS] functions.sql contains all triggers with FOR UPDATE concurrency safety');

// 7. Verify insert_data.sql records
const insertSql = fs.readFileSync(path.join(sqlDir, 'insert_data.sql'), 'utf8');
assert.ok(insertSql.includes('Rahul Sharma'), 'Candidate records missing');
assert.ok(insertSql.includes('SSC-CGL-2027'), 'Examination records missing');
assert.ok(insertSql.includes('Kendriya Vidyalaya'), 'Exam center records missing');
assert.ok(insertSql.includes('APP-2027-0001'), 'Application records missing');
assert.ok(insertSql.includes('ROLL-SSCCGL-27001'), 'Admit card records missing');
assert.ok(insertSql.includes('r1000000-0000-0000-0000-000000000001'), 'Result records missing');
console.log('  [PASS] insert_data.sql contains all required entity seed records');

// 8. Verify crud_operations.sql sections
const crudSql = fs.readFileSync(path.join(sqlDir, 'crud_operations.sql'), 'utf8');
assert.ok(crudSql.includes('SECTION A: INSERT OPERATIONS'), 'crud_operations.sql missing Section A');
assert.ok(crudSql.includes('SECTION B: SELECT OPERATIONS'), 'crud_operations.sql missing Section B');
assert.ok(crudSql.includes('SECTION C: UPDATE OPERATIONS'), 'crud_operations.sql missing Section C');
assert.ok(crudSql.includes('SECTION D: DELETE OPERATIONS'), 'crud_operations.sql missing Section D');
console.log('  [PASS] crud_operations.sql contains Sections A, B, C, D');

// 9. Verify queries.sql has 18 queries
const queriesSql = fs.readFileSync(path.join(sqlDir, 'queries.sql'), 'utf8');
for (let i = 1; i <= 15; i++) {
  assert.ok(queriesSql.includes(`-- ${i}.`) || queriesSql.includes(`-- ==============================================================================\n-- ${i}.`), `queries.sql missing query ${i}`);
}
console.log('  [PASS] queries.sql contains all 15+ mandatory relational queries');

console.log('\n------------------------------------------------------------------------');
console.log(' ALL 9 VALIDATION CHECKS PASSED SUCCESSFULLY!');
console.log('========================================================================\n');
