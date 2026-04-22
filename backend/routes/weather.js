const express = require('express');
const router = express.Router();
const controller = require('../controllers/weatherController');
const { validateCreate, validateUpdate, validateId } = require('../middleware/validate');

router.post('/', validateCreate, controller.createWeatherRecord);
router.get('/', controller.getAllWeatherRecords);
router.get('/export/:format', controller.exportData);
router.get('/airquality/:lat/:lon', controller.getAirQuality);
router.get('/youtube/:location', controller.getYouTubeVideos);
router.get('/:id', validateId, controller.getWeatherRecord);
router.put('/:id', validateUpdate, controller.updateWeatherRecord);
router.delete('/:id', validateId, controller.deleteWeatherRecord);

module.exports = router;
