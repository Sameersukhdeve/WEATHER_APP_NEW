// ============================================================
// backend/app.js
// ============================================================
// This file creates the Express application and configures routes.
// It can be used both by the standalone backend server and by Vercel
// serverless functions.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const weatherRoutes = require('./routes/weather');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/weather', weatherRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Weather App API',
    endpoints: {
      health: '/api/health',
      weather: '/api/weather'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌤️ Weather App Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.'
  });
});

// Initialize the database once when the module is loaded.
// This is safe in serverless contexts because the result is cached
// for the function instance.
initializeDatabase().catch(error => {
  console.error('Unable to initialize database:', error.message);
});

module.exports = app;
