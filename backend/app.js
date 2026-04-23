require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const weatherRoutes = require('./routes/weather');

const app = express();

// ================= CORS FIX =================
// ✅ allows frontend (any domain) to access backend
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ handle preflight requests (IMPORTANT for browser)
app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use('/api/weather', weatherRoutes);

// ================= ROOT =================
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

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌤️ Weather App Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
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