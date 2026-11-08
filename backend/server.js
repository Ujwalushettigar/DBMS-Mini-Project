const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const qualificationRoutes = require('./routes/qualificationRoutes');
const examinationRoutes = require('./routes/examinationRoutes');
const centerRoutes = require('./routes/centerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const admitCardRoutes = require('./routes/admitCardRoutes');
const resultRoutes = require('./routes/resultRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admit-cards', admitCardRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Government Recruitment Examination Management System (GREMS)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Government Recruitment Examination Management System REST API is running.');
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`🏛️  GREMS Backend Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🌐 Allowed Frontend Origin: ${FRONTEND_URL}`);
    console.log('================================================================');
  });
}

module.exports = app;
