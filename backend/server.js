require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
// Strip MongoDB operator keys ($, .) from all request inputs to prevent injection attacks.
app.use(mongoSanitize({ replaceWith: '_' }));
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT || 200),
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ganga-guardian-api', timestamp: new Date().toISOString() }));
app.get('/api/ready', (req, res) => {
  const mongoose = require('mongoose');
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', database: ready ? 'connected' : 'disconnected' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/observations', require('./routes/observations'));
app.use('/api/map', require('./routes/map'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/root-cause', require('./routes/rootCause'));
app.use('/api/digital-twin', require('./routes/digitalTwin'));
app.use('/api/biodiversity', require('./routes/biodiversity'));
app.use('/api/species-alerts', require('./routes/species'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/industry', require('./routes/industry'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/data-sync', require('./routes/dataSync'));

app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.originalUrl}` } }));
app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  await connectDB();
  const port = Number(process.env.PORT || 5000);
  return app.listen(port, () => console.log(`Ganga Guardian API listening on ${port}`));
};

if (require.main === module) {
  start().catch((error) => {
    console.error(`Unable to start API: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { app, start };
