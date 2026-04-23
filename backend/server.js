require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('=========================================');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📡 Weather API:  http://localhost:${PORT}/api/weather`);
  console.log('=========================================');
  console.log('');
});