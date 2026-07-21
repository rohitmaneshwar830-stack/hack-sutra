const test = require('node:test');
const assert = require('node:assert/strict');
const { resetFallbackStore, createUser, findUserByEmail, createReport, listReports } = require('../utils/fallbackStore');

test('fallback store supports user registration and report creation', () => {
  resetFallbackStore();

  const user = createUser({
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'secret123',
    role: 'citizen',
  });

  assert.equal(user.email, 'test@example.com');
  assert.equal(user.role, 'citizen');

  const found = findUserByEmail('test@example.com');
  assert.ok(found);
  assert.equal(found.name, 'Test User');

  const report = createReport({
    citizenId: user.id,
    citizenName: user.name,
    location: 'Haridwar',
    type: 'Sewage Discharge',
    description: 'Test report',
    gpsCoords: '28.95,78.16',
    status: 'Under Review',
  });

  assert.equal(report.location, 'Haridwar');
  assert.equal(report.status, 'Under Review');

  const reports = listReports(user.id);
  assert.equal(reports.length, 1);
});
