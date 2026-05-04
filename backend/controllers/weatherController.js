const axios = require('axios');
const { Parser } = require('json2csv');
const { dbRun, dbGet, dbAll } = require('../config/dbHelpers');

const getOpenWeatherApiKey = () => process.env.OPENWEATHER_API_KEY;
const getYouTubeApiKey = () => process.env.YOUTUBE_API_KEY;

const aqiLabels = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor'
};

const parseForecast = (list = []) => {
  const grouped = {};

  list.forEach(item => {
    const date = item.dt_txt.slice(0, 10);
    const hour = new Date(item.dt_txt).getHours();
    const score = Math.abs(hour - 12);

    if (!grouped[date]) {
      grouped[date] = {
        date,
        temp: item.main.temp,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        icon: item.weather[0]?.icon || '',
        description: item.weather[0]?.description || '',
        bestScore: score
      };
      return;
    }

    grouped[date].temp_min = Math.min(grouped[date].temp_min, item.main.temp_min);
    grouped[date].temp_max = Math.max(grouped[date].temp_max, item.main.temp_max);

    if (score < grouped[date].bestScore) {
      grouped[date].temp = item.main.temp;
      grouped[date].icon = item.weather[0]?.icon || grouped[date].icon;
      grouped[date].description = item.weather[0]?.description || grouped[date].description;
      grouped[date].bestScore = score;
    }
  });

  return Object.values(grouped).slice(0, 5).map(({ bestScore, ...rest }) => rest);
};

const fetchCurrentWeather = async (location) => {
  const OPENWEATHER_API_KEY = getOpenWeatherApiKey();
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OPENWEATHER_API_KEY missing in environment');
  }

  const isCoords = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(location);
  const query = isCoords
    ? `lat=${location.split(',')[0].trim()}&lon=${location.split(',')[1].trim()}`
    : `q=${encodeURIComponent(location)}`;

  const url = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const response = await axios.get(url);
  const data = response.data;

  return {
    location: data.name,
    country: data.sys?.country || null,
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    pressure: data.main.pressure,
    condition: data.weather[0]?.description || '',
    icon: data.weather[0]?.icon || '',
    lat: data.coord?.lat,
    lon: data.coord?.lon
  };
};

const fetchForecast = async (lat, lon) => {
  const OPENWEATHER_API_KEY = getOpenWeatherApiKey();
  if (!OPENWEATHER_API_KEY || lat == null || lon == null) {
    return [];
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const response = await axios.get(url);
  return parseForecast(response.data.list || []);
};

exports.createWeatherRecord = async (req, res) => {
  try {
    const { location, date_range_start, date_range_end } = req.body;

    if (!location) {
      return res.status(400).json({ success: false, message: 'Location is required.' });
    }

    const weather = await fetchCurrentWeather(location);
    const forecast = await fetchForecast(weather.lat, weather.lon);

    const result = await dbRun(
      `INSERT INTO weather_records
        (location, country, temperature, feels_like, humidity, wind_speed,
         weather_description, weather_icon, date_range_start, date_range_end, raw_forecast)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        weather.location,
        weather.country,
        weather.temperature,
        weather.feels_like,
        weather.humidity,
        weather.wind_speed,
        weather.condition,
        weather.icon,
        date_range_start || null,
        date_range_end || null,
        JSON.stringify(forecast)
      ]
    );

    return res.json({
      success: true,
      data: {
        id: result.id,
        ...weather,
        date_range_start: date_range_start || null,
        date_range_end: date_range_end || null,
        forecast
      }
    });
  } catch (error) {
    console.error('Create weather record error:', error.response?.data || error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create weather record.',
      error: error.response?.data || error.message || 'Unknown error'
    });
  }
};

exports.getAllWeatherRecords = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? 'SELECT * FROM weather_records WHERE location LIKE ? ORDER BY created_at DESC'
      : 'SELECT * FROM weather_records ORDER BY created_at DESC';
    const params = search ? [`%${search}%`] : [];

    const rows = await dbAll(query, params);
    const records = rows.map(row => ({
      ...row,
      raw_forecast: row.raw_forecast ? JSON.parse(row.raw_forecast) : []
    }));

    return res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get weather records error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to load weather records.' });
  }
};

exports.getWeatherRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await dbGet('SELECT * FROM weather_records WHERE id = ?', [id]);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    record.raw_forecast = record.raw_forecast ? JSON.parse(record.raw_forecast) : [];
    return res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get record error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to load record.' });
  }
};

exports.updateWeatherRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, date_range_start, date_range_end } = req.body;

    const existing = await dbGet('SELECT * FROM weather_records WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    let updated = { ...existing };
    let forecast = existing.raw_forecast ? JSON.parse(existing.raw_forecast) : [];

    if (location && location !== existing.location) {
      const weather = await fetchCurrentWeather(location);
      forecast = await fetchForecast(weather.lat, weather.lon);
      updated = {
        ...updated,
        location: weather.location,
        country: weather.country,
        temperature: weather.temperature,
        feels_like: weather.feels_like,
        humidity: weather.humidity,
        wind_speed: weather.wind_speed,
        weather_description: weather.condition,
        weather_icon: weather.icon,
        raw_forecast: JSON.stringify(forecast)
      };
    }

    updated.date_range_start = date_range_start || existing.date_range_start;
    updated.date_range_end = date_range_end || existing.date_range_end;

    await dbRun(
      `UPDATE weather_records SET
        location = ?,
        country = ?,
        temperature = ?,
        feels_like = ?,
        humidity = ?,
        wind_speed = ?,
        weather_description = ?,
        weather_icon = ?,
        date_range_start = ?,
        date_range_end = ?,
        raw_forecast = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        updated.location,
        updated.country,
        updated.temperature,
        updated.feels_like,
        updated.humidity,
        updated.wind_speed,
        updated.weather_description,
        updated.weather_icon,
        updated.date_range_start,
        updated.date_range_end,
        JSON.stringify(forecast),
        id
      ]
    );

    updated.raw_forecast = forecast;
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update record error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to update record.' });
  }
};

exports.deleteWeatherRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM weather_records WHERE id = ?', [id]);

    if (!result.changes) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    return res.json({ success: true, message: 'Record deleted.' });
  } catch (error) {
    console.error('Delete record error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
};

exports.exportData = async (req, res) => {
  try {
    const format = (req.params.format || 'json').toLowerCase();
    const rows = await dbAll('SELECT * FROM weather_records ORDER BY created_at DESC');
    const records = rows.map(row => ({
      ...row,
      raw_forecast: row.raw_forecast ? JSON.parse(row.raw_forecast) : []
    }));

    if (format === 'csv') {
      const fields = [
        'id', 'location', 'country', 'temperature', 'feels_like', 'humidity',
        'wind_speed', 'weather_description', 'weather_icon', 'date_range_start',
        'date_range_end', 'raw_forecast', 'created_at', 'updated_at'
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(records.map(r => ({ ...r, raw_forecast: JSON.stringify(r.raw_forecast) })));
      res.header('Content-Type', 'text/csv');
      res.attachment('weather-records.csv');
      return res.send(csv);
    }

    res.header('Content-Type', 'application/json');
    res.attachment('weather-records.json');
    return res.send(JSON.stringify(records, null, 2));
  } catch (error) {
    console.error('Export error:', error.message || error);
    return res.status(500).json({ success: false, message: 'Unable to export data.' });
  }
};

exports.getAirQuality = async (req, res) => {
  try {
    const { lat, lon } = req.params;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    }

    const OPENWEATHER_API_KEY = getOpenWeatherApiKey();
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ success: false, message: 'OPENWEATHER_API_KEY missing in environment' });
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    const aqi = data.list?.[0]?.main?.aqi || null;

    return res.json({
      success: true,
      aqi,
      label: aqi ? aqiLabels[aqi] || 'Unknown' : 'Unavailable'
    });
  } catch (error) {
    console.error('Air quality error:', error.response?.data || error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to fetch air quality.' });
  }
};

exports.getYouTubeVideos = async (req, res) => {
  try {
    const { location } = req.params;
    if (!location) {
      return res.status(400).json({ success: false, message: 'Location is required.' });
    }

    const YOUTUBE_API_KEY = getYouTubeApiKey();
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('your_youtube_api_key_here')) {
      return res.json({ success: false, message: 'YouTube API key not configured.', videos: [] });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(location + ' weather')}&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url);
    const items = response.data.items || [];

    const videos = items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channelName: item.snippet.channelTitle
    })).filter(video => video.id);

    return res.json({ success: true, videos });
  } catch (error) {
    console.error('YouTube error:', error.response?.data || error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to fetch YouTube videos.', videos: [] });
  }
};
