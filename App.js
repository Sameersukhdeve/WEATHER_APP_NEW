require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initializeDatabase } = require('./config/db');
const weatherRoutes = require('./routes/weather');

const app = express();

// ================= CORS =================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= API ROUTES =================
app.use('/api/weather', weatherRoutes);

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌤️ Weather App Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// ================= SERVE REACT BUILD =================
// ✅ Serves CSS, JS, images from React's build folder
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// ✅ Any route that is NOT /api/* sends React's index.html
// This fixes page refresh breaking on routes like /history
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.url}`
    });
  }
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.'
  });
});

// ================= INIT DB =================
initializeDatabase().catch(error => {
  console.error('Unable to initialize database:', error.message);
});

module.exports = app;