// ============================================================
// server.js
// ============================================================
// This is the ENTRY POINT of our backend.
// When you run "node server.js" or "npm run dev", this file runs.
//
// What it does:
//   1. Loads environment variables from .env
//   2. Creates the Express app
//   3. Sets up middleware (CORS, JSON parsing)
//   4. Connects to MySQL and creates tables
//   5. Registers all routes
//   6. Starts listening on a port
// ============================================================

require('dotenv').config(); // Load .env variables first!

const app = require('./app');
const { initializeDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log('');
    console.log('=========================================');
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📡 Weather API:  http://localhost:${PORT}/api/weather`);
    console.log('=========================================');
    console.log('');
  });
};

startServer();
