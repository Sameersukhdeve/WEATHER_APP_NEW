const path = require('path');
const dotenv = require('dotenv');
const express = require('express');

const envFiles = [
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env')
];

envFiles.forEach((envFile) => {
  dotenv.config({ path: envFile });
});

const app = require('./app');

// 🔥 Use multiple port options (avoids port busy issue)
const PORT = process.env.PORT || 5000;

// ✅ Correct path to React build
const buildPath = path.resolve(__dirname, '../build');

// ================= SERVE REACT =================
app.use(express.static(buildPath));

// ================= REACT ROUTE =================
app.get('*', (req, res, next) => {
  // Only handle non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    next();
  }
});

// ================= START SERVER =================
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.log(`⚠️ Port ${port} busy, trying ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);