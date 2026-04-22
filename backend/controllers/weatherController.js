// ============================================================
// controllers/weatherController.js
// ============================================================
// This file contains ALL the business logic:
//   - Fetching weather data from OpenWeatherMap API
//   - Saving/reading/updating/deleting records in SQLite
//   - Exporting data as JSON, CSV, or Markdown
//   - Fetching YouTube videos for the searched location
// ============================================================

const axios = require('axios');
const { dbRun, dbGet, dbAll } = require('../config/dbHelpers');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

const parseRawForecast = (rawForecast) => {
  if (!rawForecast) {
    return [];
  }

  if (typeof rawForecast === 'string') {
    try {
      return JSON.parse(rawForecast);
    } catch (error) {
      console.warn('Warning: failed to parse raw_forecast JSON string:', error.message);
      return [];
    }
  }

  if (typeof rawForecast === 'object') {
    return rawForecast;
  }

  return [];
};

// ============================================================
// HELPER: fetchWeatherFromAPI(location)
// Calls OpenWeatherMap to get current weather + 5-day forecast.
// Returns a clean object with all the data we need.
// ============================================================
const fetchWeatherFromAPI = async (location) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
    throw new Error('OpenWeatherMap API key is not configured. Please add it to your .env file.');
  }

  // Fetch current weather
  const currentRes = await axios.get(`${OWM_BASE}/weather`, {
    params: { q: location, appid: apiKey, units: 'metric' },
    timeout: 10000
  });

  // Fetch 5-day forecast
  const forecastRes = await axios.get(`${OWM_BASE}/forecast`, {
    params: { q: location, appid: apiKey, units: 'metric' },
    timeout: 10000
  });

  const current = currentRes.data;

  // Process forecast: pick one entry per day
  const forecastMap = {};
  forecastRes.data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    const time = item.dt_txt.split(' ')[1];
    if (time === '12:00:00' || !forecastMap[date]) {
      forecastMap[date] = {
        date,
        temp:        Math.round(item.main.temp),
        temp_min:    Math.round(item.main.temp_min),
        temp_max:    Math.round(item.main.temp_max),
        humidity:    item.main.humidity,
        wind_speed:  item.wind.speed,
        description: item.weather[0].description,
        icon:        item.weather[0].icon
      };
    }
  });

  const forecast = Object.values(forecastMap).slice(0, 5);

  return {
    location:            current.name,
    country:             current.sys.country,
    temperature:         current.main.temp,
    feels_like:          current.main.feels_like,
    humidity:            current.main.humidity,
    wind_speed:          current.wind.speed,
    weather_description: current.weather[0].description,
    weather_icon:        current.weather[0].icon,
    lat:                 current.coord.lat,
    lon:                 current.coord.lon,
    forecast
  };
};

// ============================================================
// POST /api/weather
// ============================================================
exports.createWeatherRecord = async (req, res) => {
  try {
    const { location, date_range_start, date_range_end } = req.body;

    const weatherData = await fetchWeatherFromAPI(location);

    const result = await dbRun(
      `INSERT INTO weather_records
        (location, country, temperature, feels_like, humidity,
         wind_speed, weather_description, weather_icon,
         date_range_start, date_range_end, raw_forecast)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        weatherData.location,
        weatherData.country,
        weatherData.temperature,
        weatherData.feels_like,
        weatherData.humidity,
        weatherData.wind_speed,
        weatherData.weather_description,
        weatherData.weather_icon,
        date_range_start || null,
        date_range_end   || null,
        JSON.stringify(weatherData.forecast)
      ]
    );

    const row = await dbGet('SELECT * FROM weather_records WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Weather data fetched and saved successfully!',
      data: {
        ...row,
        raw_forecast: parseRawForecast(row.raw_forecast),
        lat:      weatherData.lat,
        lon:      weatherData.lon,
        forecast: weatherData.forecast
      }
    });

  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({
          success: false,
          message: `Location "${req.body.location}" was not found. Please check the spelling and try again.`
        });
      }
      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenWeatherMap API key. Please check your .env file.'
        });
      }
    }

    console.error('Create error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again.'
    });
  }
};

// ============================================================
// GET /api/weather
// ============================================================
exports.getAllWeatherRecords = async (req, res) => {
  try {
    const { search } = req.query;

    let rows;

    if (search && search.trim()) {
      rows = await dbAll(
        'SELECT * FROM weather_records WHERE location LIKE ? ORDER BY created_at DESC',
        [`%${search.trim()}%`]
      );
    } else {
      rows = await dbAll('SELECT * FROM weather_records ORDER BY created_at DESC');
    }

    const records = rows.map(row => ({
      ...row,
      raw_forecast: parseRawForecast(row.raw_forecast)
    }));

    res.json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error('GetAll error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve records.' });
  }
};

// ============================================================
// GET /api/weather/:id
// ============================================================
exports.getWeatherRecord = async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM weather_records WHERE id = ?', [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    const record = {
      ...row,
      raw_forecast: parseRawForecast(row.raw_forecast)
    };

    res.json({ success: true, data: record });

  } catch (error) {
    console.error('GetOne error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve record.' });
  }
};

// ============================================================
// PUT /api/weather/:id
// ============================================================
exports.updateWeatherRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, date_range_start, date_range_end } = req.body;

    const existing = await dbGet('SELECT * FROM weather_records WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    let updateData = { date_range_start, date_range_end };

    if (location && location !== existing.location) {
      const weatherData = await fetchWeatherFromAPI(location);
      Object.assign(updateData, {
        location:            weatherData.location,
        country:             weatherData.country,
        temperature:         weatherData.temperature,
        feels_like:          weatherData.feels_like,
        humidity:            weatherData.humidity,
        wind_speed:          weatherData.wind_speed,
        weather_description: weatherData.weather_description,
        weather_icon:        weatherData.weather_icon,
        raw_forecast:        JSON.stringify(weatherData.forecast)
      });
    }

    const fields = Object.keys(updateData)
      .filter(k => updateData[k] !== undefined)
      .map(k => `${k} = ?`);

    const values = Object.keys(updateData)
      .filter(k => updateData[k] !== undefined)
      .map(k => updateData[k] || null);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    await dbRun(
      `UPDATE weather_records SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    const updated = await dbGet('SELECT * FROM weather_records WHERE id = ?', [id]);
    const record = {
      ...updated,
      raw_forecast: parseRawForecast(updated.raw_forecast)
    };

    res.json({ success: true, message: 'Record updated successfully!', data: record });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: `Location "${req.body.location}" was not found.`
      });
    }
    console.error('Update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update record.' });
  }
};

// ============================================================
// DELETE /api/weather/:id
// ============================================================
exports.deleteWeatherRecord = async (req, res) => {
  try {
    const existing = await dbGet('SELECT id FROM weather_records WHERE id = ?', [req.params.id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    await dbRun('DELETE FROM weather_records WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Record deleted successfully.' });

  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
};

// ============================================================
// GET /api/weather/export/:format
// ============================================================
exports.exportData = async (req, res) => {
  try {
    const { format } = req.params;
    const rows = await dbAll('SELECT * FROM weather_records ORDER BY created_at DESC');

    const records = rows.map(row => ({
      id:                  row.id,
      location:            row.location,
      country:             row.country,
      temperature_c:       row.temperature,
      feels_like_c:        row.feels_like,
      humidity_percent:    row.humidity,
      wind_speed_ms:       row.wind_speed,
      weather_description: row.weather_description,
      date_range_start:    row.date_range_start,
      date_range_end:      row.date_range_end,
      created_at:          row.created_at
    }));

    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.json(records);
    }

    if (format === 'csv') {
      if (records.length === 0) {
        return res.status(200).send('No records to export.');
      }
      const headers = Object.keys(records[0]);
      const csvRows = [
        headers.join(','),
        ...records.map(r =>
          headers.map(h => `"${r[h] !== null && r[h] !== undefined ? r[h] : ''}"`).join(',')
        )
      ];
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvRows.join('\n'));
    }

    if (format === 'markdown') {
      let md = '# Weather Records Export\n\n';
      md += `Generated: ${new Date().toISOString()}\n\n`;
      md += '| ID | Location | Country | Temp (°C) | Humidity | Wind | Description | Date |\n';
      md += '|----|----------|---------|-----------|----------|------|-------------|------|\n';
      records.forEach(r => {
        md += `| ${r.id} | ${r.location} | ${r.country || '-'} | ${r.temperature_c}° | ${r.humidity_percent}% | ${r.wind_speed_ms} m/s | ${r.weather_description} | ${new Date(r.created_at).toLocaleDateString()} |\n`;
      });
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.md"');
      res.setHeader('Content-Type', 'text/markdown');
      return res.send(md);
    }

    if (format === 'xml') {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
      records.forEach(r => {
        xml += `  <record>\n` +
               `    <id>${r.id}</id>\n` +
               `    <location>${r.location}</location>\n` +
               `    <country>${r.country || ''}</country>\n` +
               `    <temperature>${r.temperature_c}</temperature>\n` +
               `    <humidity>${r.humidity_percent}</humidity>\n` +
               `    <wind_speed>${r.wind_speed_ms}</wind_speed>\n` +
               `    <description>${r.weather_description}</description>\n` +
               `    <created_at>${r.created_at}</created_at>\n` +
               `  </record>\n`;
      });
      xml += '</records>';
      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.xml"');
      res.setHeader('Content-Type', 'application/xml');
      return res.send(xml);
    }

    if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40 });

      res.setHeader('Content-Disposition', 'attachment; filename="weather_records.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      doc.fontSize(20).font('Helvetica-Bold').text('SkyWatch — Weather Records', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1.5);

      records.forEach((r, i) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${i + 1}. ${r.location} ${r.country ? `(${r.country})` : ''}`);
        doc.fontSize(10).font('Helvetica')
          .text(`  Temperature: ${r.temperature_c}°C   Humidity: ${r.humidity_percent}%   Wind: ${r.wind_speed_ms} m/s`)
          .text(`  Condition: ${r.weather_description}`)
          .text(`  Saved: ${new Date(r.created_at).toLocaleDateString()}`);
        doc.moveDown(0.8);
      });

      doc.end();
      return;
    }

    res.status(400).json({ success: false, message: 'Format must be json, csv, markdown, xml, or pdf.' });

  } catch (error) {
    console.error('Export error:', error.message);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
};

// ============================================================
// GET /api/weather/airquality/:lat/:lon
// ============================================================
exports.getAirQuality = async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
      return res.status(400).json({ success: false, message: 'OpenWeatherMap API key is not configured.' });
    }

    const { data } = await axios.get(`${OWM_BASE}/air_pollution`, {
      params: { lat, lon, appid: apiKey }
    });

    const aqi = data?.list?.[0]?.main?.aqi || null;
    const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

    res.json({ success: true, aqi, label: labels[aqi] || 'Unavailable' });
  } catch (error) {
    console.error('AirQuality error:', error.message);
    res.json({ success: true, aqi: null, label: 'Unavailable' });
  }
};

// ============================================================
// GET /api/weather/youtube/:location
// ============================================================
exports.getYouTubeVideos = async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      return res.json({ success: true, videos: [] });
    }

    const location = req.params.location;
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key:        apiKey,
        q:          `${location} travel tourism`,
        part:       'snippet',
        type:       'video',
        maxResults: 3,
        safeSearch: 'strict'
      },
      timeout: 8000
    });

    const videos = response.data.items.map(item => ({
      id:          item.id.videoId,
      title:       item.snippet.title,
      thumbnail:   item.snippet.thumbnails.medium.url,
      channelName: item.snippet.channelTitle
    }));

    res.json({ success: true, videos });

  } catch (error) {
    console.error('YouTube error:', error.message);
    res.json({ success: true, videos: [] });
  }
};
