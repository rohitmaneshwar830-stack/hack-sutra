const crypto = require('crypto');

let users = [];
let reports = [];
let nextUserId = 1;
let nextReportId = 1;

const resetFallbackStore = () => {
  users = [];
  reports = [];
  nextUserId = 1;
  nextReportId = 1;
};

const createUser = ({ name, email, passwordHash, role = 'citizen' }) => {
  const user = {
    id: `user-${nextUserId++}`,
    _id: `user-${nextUserId - 1}`,
    name,
    email: email.toLowerCase().trim(),
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
  return users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
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

module.exports = {
  resetFallbackStore,
  createUser,
  findUserByEmail,
  createReport,
  listReports,
};
