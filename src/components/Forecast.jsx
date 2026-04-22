// ============================================================
// components/Forecast.jsx
// ============================================================
// Displays the 5-day weather forecast as a grid of cards.
// Each card shows: day name, weather icon, temperature, description.
// ============================================================

import React from 'react';

// Format a date string like "2024-06-15" into "Sat" or "Mon"
const formatDay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone edge cases
  return date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Forecast = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="forecast-section">
      <p className="section-title">📅 5-Day Forecast</p>

      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div className="forecast-item fade-in" key={day.date || index}>

            {/* Day name */}
            <div className="forecast-day">
              {formatDay(day.date)}
              <br />
              <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                {formatDate(day.date)}
              </span>
            </div>

            {/* Weather icon */}
            {day.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
                className="forecast-icon"
              />
            )}

            {/* Temperature */}
            <div className="forecast-temp">{day.temp}°</div>

            {/* High/Low range */}
            {(day.temp_max !== undefined) && (
              <div className="forecast-temp-range">
                ↑{day.temp_max}° ↓{day.temp_min}°
              </div>
            )}

            {/* Condition description */}
            <div className="forecast-desc">{day.description}</div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;
