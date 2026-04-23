const axios = require('axios');

// ============================================================
// GET WEATHER (MAIN ENDPOINT)
// GET /api/weather?location=mumbai
// ============================================================

exports.getAllWeatherRecords = async (req, res) => {
  try {
    const location = req.query.location;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required"
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "OPENWEATHER_API_KEY missing in environment"
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);

    const data = response.data;

    return res.json({
      success: true,
      data: {
        location: data.name,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        condition: data.weather[0].description,
        icon: data.weather[0].icon,
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    });

  } catch (error) {
    console.error("Weather API Error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      error: error.response?.data || error.message
    });
  }
};

// ============================================================
// CREATE (OPTIONAL DB PLACEHOLDER)
// ============================================================

exports.createWeatherRecord = async (req, res) => {
  return res.json({
    success: true,
    message: "Use GET /api/weather?location=city instead"
  });
};

// ============================================================
// PLACEHOLDERS (IF YOU DON'T USE DB YET)
// ============================================================

exports.getWeatherRecord = async (req, res) => {
  return res.json({ success: true, message: "Not implemented" });
};

exports.updateWeatherRecord = async (req, res) => {
  return res.json({ success: true, message: "Not implemented" });
};

exports.deleteWeatherRecord = async (req, res) => {
  return res.json({ success: true, message: "Not implemented" });
};

// ============================================================
// EXPORT / EXTRA ROUTES
// ============================================================

exports.exportData = async (req, res) => {
  return res.json({ success: true, message: "Export working" });
};

exports.getAirQuality = async (req, res) => {
  return res.json({ success: true, message: "Air quality endpoint placeholder" });
};

exports.getYouTubeVideos = async (req, res) => {
  return res.json({ success: true, message: "YouTube endpoint placeholder" });
};