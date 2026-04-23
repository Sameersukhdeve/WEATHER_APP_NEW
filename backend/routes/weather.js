const express = require('express');
const router = express.Router();
const controller = require('../controllers/weatherController');

// ================= IMPORTANT FIX =================
// GET WEATHER MUST BE HERE (THIS IS WHAT YOU ARE MISSING)

router.get('/', controller.getAllWeatherRecords);

// keep other routes if needed
router.post('/', controller.createWeatherRecord);

router.get('/airquality/:lat/:lon', controller.getAirQuality);
router.get('/youtube/:location', controller.getYouTubeVideos);

router.get('/export/:format', controller.exportData);

router.get('/:id', controller.getWeatherRecord);
router.put('/:id', controller.updateWeatherRecord);
router.delete('/:id', controller.deleteWeatherRecord);

module.exports = router;