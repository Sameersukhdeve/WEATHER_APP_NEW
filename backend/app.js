const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');

const envFiles = [
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env')
];

envFiles.forEach((envFile) => {
  dotenv.config({ path: envFile });
});

const weatherRoutes = require('./routes/weather');

const app = express();

// ================= CORS =================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use('/api/weather', weatherRoutes);

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌤️ Weather App Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// ================= ✅ FIXED 404 HANDLER =================
// Only for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
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