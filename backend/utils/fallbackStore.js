const crypto = require('crypto');

let users = [];
let reports = [];
let nextUserId = 1;
let nextReportId = 1;

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const seedDemoUsers = () => {
  if (users.some((user) => user.email === 'admin@ganga.ai')) return;
  createUser({ name: 'Admin Demo', email: 'admin@ganga.ai', passwordHash: '123456', role: 'admin' });
  createUser({ name: 'Citizen Demo', email: 'citizen@ganga.ai', passwordHash: '123456', role: 'citizen' });
};

const resetFallbackStore = () => {
  users = [];
  reports = [];
  nextUserId = 1;
  nextReportId = 1;
  seedDemoUsers();
};

const createUser = ({ name, email, passwordHash, role = 'citizen' }) => {
  const user = {
    id: `user-${nextUserId++}`,
    _id: `user-${nextUserId - 1}`,
    name,
    email: normalizeEmail(email),
    passwordHash,
    role,
    department: '',
    phone: '',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
};

const findUserByEmail = (email) => {
  return users.find((user) => user.email === normalizeEmail(email));
};

const createReport = ({ citizenId, citizenName, location, type, description, gpsCoords = '', status = 'Under Review' }) => {
  const report = {
    _id: `report-${nextReportId++}`,
    citizenId,
    citizenName,
    location,
    type,
    description,
    gpsCoords,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reports.push(report);
  return report;
};

const listReports = (citizenId) => {
  if (citizenId) {
    return reports.filter((report) => report.citizenId === citizenId);
  }
  return reports;
};

const updateReportStatus = (id, status) => {
  const report = reports.find((item) => item._id === id || item.id === id);
  if (report) {
    report.status = status;
    report.updatedAt = new Date().toISOString();
  }
  return report;
};

seedDemoUsers();

module.exports = {
  resetFallbackStore,
  createUser,
  findUserByEmail,
  createReport,
  listReports,
  updateReportStatus,
  seedDemoUsers,
};
