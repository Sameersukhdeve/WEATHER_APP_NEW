// ============================================================
// components/WeatherCard.jsx
// ============================================================
// Shows the current weather data:
//   - Location name and country
//   - Large temperature display
//   - Weather icon from OpenWeatherMap
//   - Description, feels-like, humidity, wind speed
// ============================================================

import React from 'react';

// OpenWeatherMap provides icon codes like "01d", "02n", etc.
// We use this helper to build the full icon URL.
const getIconUrl = (iconCode) =>
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

// Get a background gradient class based on weather condition
const getWeatherEmoji = (description) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('thunderstorm')) return '⛈️';
  if (desc.includes('drizzle'))      return '🌦️';
  if (desc.includes('rain'))         return '🌧️';
  if (desc.includes('snow'))         return '❄️';
  if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) return '🌫️';
  if (desc.includes('clear'))        return '☀️';
  if (desc.includes('few clouds'))   return '🌤️';
  if (desc.includes('scattered'))    return '⛅';
  if (desc.includes('cloud'))        return '☁️';
  return '🌡️';
};

const WeatherCard = ({ data }) => {
  if (!data) return null;

  const {
    location,
    country,
    temperature,
    feels_like,
    humidity,
    wind_speed,
    weather_description,
    weather_icon,
    aqi,
    aqi_label
  } = data;

  return (
    <div className="weather-display card fade-in">

      <div className="weather-main">
        {/* Left side: text information */}
        <div className="weather-left">
          <div className="weather-location">{location}</div>
          {country && (
            <div className="weather-country">
              <span className="badge badge-blue">{country}</span>
            </div>
          )}

          {/* Giant temperature number */}
          <div className="weather-temp">
            {Math.round(temperature)}°
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>C</span>
          </div>

          {/* Weather condition */}
          <div className="weather-desc">
            {getWeatherEmoji(weather_description)} {weather_description}
          </div>
        </div>

        {/* Right side: weather icon */}
        <div className="weather-right">
          {weather_icon && (
            <img
              src={getIconUrl(weather_icon)}
              alt={weather_description || 'weather icon'}
              className="weather-icon-img"
            />
          )}
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="weather-stats">
        <div className="stat-box">
          <div className="stat-label">Feels Like</div>
          <div className="stat-value">{Math.round(feels_like || temperature)}°</div>
          <div className="stat-unit">Celsius</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Humidity</div>
          <div className="stat-value">{humidity}</div>
          <div className="stat-unit">Percent</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Wind Speed</div>
          <div className="stat-value">{wind_speed}</div>
          <div className="stat-unit">m/s</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Air Quality</div>
          <div className="stat-value">{aqi !== undefined && aqi !== null ? aqi : '—'}</div>
          <div className="stat-unit">{aqi_label || 'Unavailable'}</div>
        </div>
      </div>

    </div>
  );
};

export default WeatherCard;
