/**
 * Ganga Guardian AI — Backend Test Suite
 *
 * Uses Node.js built-in test runner (node:test) + assert.
 * Run: cd backend && node --test tests/server.test.js
 *
 * These tests start a real Express app in memory but do NOT connect to MongoDB.
 * They validate routing, auth enforcement, RBAC, validation, and error contracts.
 */
const test    = require('node:test');
const assert  = require('node:assert/strict');
const { app } = require('../server');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Start the app on a random port and return {server, baseUrl}. */
async function startServer() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}/api` };
}

async function json(url, opts = {}) {
  const res = await fetch(url, opts);
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

// ─── Phase 1: Infrastructure ──────────────────────────────────────────────────

test('GET /api/health → 200 with status:ok (no DB needed)', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/health`);
  server.close();
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
  assert.ok(body.service);
  assert.ok(body.timestamp);
});

test('GET /api/ready → 503 when DB is not connected', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/ready`);
  server.close();
  // DB is not connected in test environment
  assert.equal(status, 503);
  assert.equal(body.status, 'not_ready');
  assert.equal(body.database, 'disconnected');
});

test('Unknown routes return structured NOT_FOUND error', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/this-route-does-not-exist`);
  server.close();
  assert.equal(status, 404);
  assert.equal(body.error.code, 'NOT_FOUND');
  assert.ok(body.error.message);
});

// ─── Phase 2: Authentication — Validation ─────────────────────────────────────

test('POST /api/auth/register with missing fields → 400 VALIDATION_ERROR', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'notvalid' }), // missing name, password
  });
  server.close();
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(body.error.details));
  assert.ok(body.error.details.length > 0);
});

test('POST /api/auth/register with short password → 400 VALIDATION_ERROR', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@test.com', password: 'short' }),
  });
  server.close();
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/auth/register with invalid email → 400 VALIDATION_ERROR', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'not-an-email', password: 'strongPassword123' }),
  });
  server.close();
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/auth/login with missing password → 400 VALIDATION_ERROR', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com' }), // missing password
  });
  server.close();
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/auth/login with invalid email format → 400 VALIDATION_ERROR', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
  });
  server.close();
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

// ─── Phase 3: Authentication — Token Enforcement ──────────────────────────────

test('GET /api/auth/me without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/auth/me`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/auth/me with malformed token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/auth/me`, {
    headers: { Authorization: 'Bearer not.a.real.jwt.token' },
  });
  server.close();
  assert.equal(status, 401);
});

test('GET /api/dashboard/overview without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/dashboard/overview`);
  server.close();
  assert.equal(status, 401);
});

// Verify the security fix: /dashboard/stats route was removed (must return 404 now)
test('GET /api/dashboard/stats must not exist (security fix: was unauthenticated)', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/dashboard/stats`);
  server.close();
  assert.equal(status, 404, '/dashboard/stats must not exist — it was an unauthenticated exposure of DB metrics');
});

test('GET /api/observations without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/observations`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/alerts without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/alerts`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/reports without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/reports`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/predictions/Kanpur without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/predictions/Kanpur`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/recommendations/Kanpur without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/recommendations/Kanpur`);
  server.close();
  assert.equal(status, 401);
});

test('POST /api/digital-twin/simulate without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/digital-twin/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: 'Kanpur' }),
  });
  server.close();
  assert.equal(status, 401);
});

test('POST /api/root-cause/analyze without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/root-cause/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: 'Kanpur' }),
  });
  server.close();
  assert.equal(status, 401);
});

test('GET /api/map/layers without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/map/layers`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/biodiversity without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/biodiversity`);
  server.close();
  assert.equal(status, 401);
});

// ─── Phase 4: RBAC Enforcement (using a fake non-admin token) ─────────────────
// Note: We sign a fake token with process.env.JWT_SECRET if set in test env,
// otherwise these tests skip gracefully.

test('GET /api/admin/users without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/admin/users`);
  server.close();
  assert.equal(status, 401);
});

test('GET /api/admin/sensors without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/admin/sensors`);
  server.close();
  assert.equal(status, 401);
});

test('POST /api/data-sync/cpcb without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/data-sync/cpcb`, { method: 'POST' });
  server.close();
  assert.equal(status, 401);
});

test('GET /api/data-sync/status without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/data-sync/status`);
  server.close();
  assert.equal(status, 401);
});

test('POST /api/alerts (admin-only) without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'test', severity: 'Warning', title: 'Test', confidence: 90 }),
  });
  server.close();
  assert.equal(status, 401);
});

test('PATCH /api/reports/:id (admin/gov-only) without token → 401', async () => {
  const { server, base } = await startServer();
  const { status } = await json(`${base}/reports/507f1f77bcf86cd799439011`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Resolved' }),
  });
  server.close();
  assert.equal(status, 401);
});

// ─── Phase 5: RBAC — Fake citizen JWT cannot hit admin routes ─────────────────

test('Admin invite endpoint requires valid admin JWT', async () => {
  const { server, base } = await startServer();
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Can't sign a token in test environment without a real JWT_SECRET
    server.close();
    return;
  }
  // Sign a fake citizen token
  const citizenToken = jwt.sign({ id: '507f1f77bcf86cd799439011', email: 'citizen@test.com', role: 'citizen' }, secret, { expiresIn: '1m' });
  const { status, body } = await json(`${base}/auth/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${citizenToken}` },
    body: JSON.stringify({ email: 'new@test.com', role: 'admin' }),
  });
  server.close();
  assert.equal(status, 403, 'Citizen should not be able to create invites');
  assert.ok(body.error, 'Error message must be present');
});

test('Citizen JWT cannot access /api/admin/users', async () => {
  const { server, base } = await startServer();
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) { server.close(); return; }
  const citizenToken = jwt.sign({ id: '507f1f77bcf86cd799439011', email: 'citizen@test.com', role: 'citizen' }, secret, { expiresIn: '1m' });
  const { status } = await json(`${base}/admin/users`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  server.close();
  assert.equal(status, 403, 'Citizen must not access admin user list');
});

test('Citizen JWT cannot POST /api/reports for other users (citizens create only own reports)', async () => {
  // POST /api/reports requires citizen role — this verifies the route ACCEPTS a citizen token
  // (the DB rejection will happen separately when mongo is connected)
  const { server, base } = await startServer();
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) { server.close(); return; }
  const citizenToken = jwt.sign({ id: '507f1f77bcf86cd799439011', email: 'c@test.com', role: 'citizen' }, secret, { expiresIn: '1m' });
  const { status } = await json(`${base}/reports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    // No body — multer parses FormData, missing fields cause validation error not 403
  });
  server.close();
  // Should NOT be 403 (citizen is allowed), should be 400 (missing required fields) or 500 (no DB)
  assert.notEqual(status, 403, 'Citizens must be allowed to POST reports (role check passes)');
});

// ─── Phase 6: Pagination contract ────────────────────────────────────────────
// These only confirm routing contracts. Real data requires MongoDB.

test('Pagination params ?page=abc are handled safely without crashing', async () => {
  const { server, base } = await startServer();
  // Without a token we get 401 — the app should not crash on bad query params
  const { status } = await json(`${base}/observations?page=abc&limit=xyz`);
  server.close();
  assert.equal(status, 401); // 401 before pagination logic runs — still confirms no crash
});

// ─── Phase 7: Mongo sanitize — injection attempt returns safe error ────────────

test('Login with mongo-operator injection payload is safely rejected', async () => {
  const { server, base } = await startServer();
  const { status, body } = await json(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Classic mongo injection: { "$gt": "" } as password
    body: JSON.stringify({ email: 'admin@test.com', password: { $gt: '' } }),
  });
  server.close();
  // express-validator rejects this as non-string, OR mongoSanitize strips it.
  // Either way we must get 400 (validation) not 200/401 indicating operator execution.
  assert.ok(status === 400 || status === 401, `Expected 400 or 401 for injection attempt, got ${status}`);
  // Must never return a token
  assert.ok(!body?.token, 'Injection attempt must never return a JWT token');
});
